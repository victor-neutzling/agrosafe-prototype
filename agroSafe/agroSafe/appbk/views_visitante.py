"""JSON API endpoints powering the React access-verification flow."""

from __future__ import annotations

import base64
import io
import json

from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .face_opencv import comparar_rosto_hash_referencia, gerar_hash_rosto_upload
from .models import CadastroVisitantePortaria, NivelVisitante, RegistroAcessoPortaria

BLOCK_WINDOW_SECONDS = 30


def _normalize_doc(value: str | None) -> str:
    if not value:
        return ''
    return ''.join(ch for ch in value if ch.isdigit())


def _decode_data_url(data_url: str | None) -> io.BytesIO | None:
    if not data_url:
        return None
    payload = data_url.split(',', 1)[-1] if ',' in data_url else data_url
    try:
        raw = base64.b64decode(payload, validate=False)
    except (ValueError, TypeError):
        return None
    if not raw:
        return None
    return io.BytesIO(raw)


def _serialize_visitor(c: CadastroVisitantePortaria) -> dict:
    return {
        'id': c.id,
        'nome': c.nome,
        'documento': c.documento,
        'empresa': c.empresa,
        'nivel': c.nivel,
        'foto_base64': c.foto_base64,
        'criado_em': c.criado_em.isoformat() if c.criado_em else None,
    }


@csrf_exempt
@require_http_methods(['GET'])
def lookup(request):
    documento = _normalize_doc(request.GET.get('documento'))
    if not documento:
        return JsonResponse({'erro': 'Documento obrigatório.'}, status=400)
    c = CadastroVisitantePortaria.objects.filter(documento=documento).first()
    if not c:
        return JsonResponse({'encontrado': False}, status=404)
    return JsonResponse({'encontrado': True, 'visitante': _serialize_visitor(c)}, status=200)


@csrf_exempt
@require_http_methods(['POST'])
def criar(request):
    try:
        data = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'erro': 'JSON inválido.'}, status=400)

    nome = (data.get('nome') or '').strip()
    documento = _normalize_doc(data.get('documento'))
    empresa = (data.get('empresa') or '').strip()
    nivel = (data.get('nivel') or '').strip()
    foto = data.get('foto')

    if not nome or not documento or not empresa or not nivel:
        return JsonResponse({'erro': 'Nome, documento, empresa e nível são obrigatórios.'}, status=400)
    if nivel not in NivelVisitante.values:
        return JsonResponse({'erro': 'Nível inválido.'}, status=400)
    if not foto:
        return JsonResponse({'erro': 'Foto obrigatória.'}, status=400)
    if CadastroVisitantePortaria.objects.filter(documento=documento).exists():
        return JsonResponse({'erro': 'Visitante já cadastrado.'}, status=409)

    buf = _decode_data_url(foto)
    if buf is None:
        return JsonResponse({'erro': 'Foto inválida.'}, status=400)

    foto_hash, status = gerar_hash_rosto_upload(buf)
    if not foto_hash:
        return JsonResponse({'erro': f'Não foi possível processar a foto: {status}.'}, status=400)

    visitante = CadastroVisitantePortaria.objects.create(
        nome=nome,
        documento=documento,
        empresa=empresa,
        nivel=nivel,
        foto_hash=foto_hash,
        foto_base64=foto,
    )
    RegistroAcessoPortaria.objects.create(
        cadastro=visitante,
        nome_informado=nome,
        documento_informado=documento,
        motivo_informado=(data.get('motivo') or '').strip(),
        observacao_informada=(data.get('observacao') or '').strip(),
        fluxo='novo_cadastro',
        entrada_permitida=True,
    )
    return JsonResponse(
        {
            'mensagem': 'Cadastro efetuado e entrada permitida.',
            'visitante': _serialize_visitor(visitante),
            'entrada_permitida': True,
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(['POST'])
def verificar(request, id: int):
    visitante = CadastroVisitantePortaria.objects.filter(id=id).first()
    if not visitante:
        return JsonResponse({'erro': 'Visitante não encontrado.'}, status=404)

    try:
        data = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'erro': 'JSON inválido.'}, status=400)

    foto = data.get('foto')
    motivo = (data.get('motivo') or '').strip()
    observacao = (data.get('observacao') or '').strip()
    if not foto:
        return JsonResponse({'erro': 'Foto obrigatória.'}, status=400)

    buf = _decode_data_url(foto)
    if buf is None:
        return JsonResponse({'erro': 'Foto inválida.'}, status=400)

    ok, score, msg = comparar_rosto_hash_referencia(visitante.foto_hash, buf)
    threshold = getattr(settings, 'FACE_MATCH_HASH_THRESHOLD', 0.78)

    if ok:
        ultimo = (
            RegistroAcessoPortaria.objects
            .filter(cadastro=visitante, entrada_permitida=True)
            .order_by('-criado_em')
            .first()
        )
        agora = timezone.now()
        elapsed = (agora - ultimo.criado_em).total_seconds() if ultimo else None
        if ultimo and elapsed is not None and elapsed < BLOCK_WINDOW_SECONDS:
            segundos_restantes = max(0, BLOCK_WINDOW_SECONDS - int(elapsed))
            RegistroAcessoPortaria.objects.create(
                cadastro=visitante,
                nome_informado=visitante.nome,
                documento_informado=visitante.documento,
                motivo_informado=motivo,
                observacao_informada=observacao,
                fluxo='tentativa_entrada_bloqueada_janela',
                reconhecimento_correlacao=score,
                reconhecimento_automatico_ok=True,
                entrada_permitida=False,
            )
            return JsonResponse(
                {
                    'status': 'bloqueado',
                    'entrada_permitida': False,
                    'score': score,
                    'threshold': threshold,
                    'segundos_restantes': segundos_restantes,
                    'mensagem': f'Entrada bloqueada. Faltam {segundos_restantes}s para nova entrada.',
                },
                status=200,
            )

        RegistroAcessoPortaria.objects.create(
            cadastro=visitante,
            nome_informado=visitante.nome,
            documento_informado=visitante.documento,
            motivo_informado=motivo,
            observacao_informada=observacao,
            fluxo='reconhecimento_ok',
            reconhecimento_correlacao=score,
            reconhecimento_automatico_ok=True,
            entrada_permitida=True,
        )
        return JsonResponse(
            {
                'status': 'match',
                'entrada_permitida': True,
                'score': score,
                'threshold': threshold,
                'mensagem': f'Reconhecimento facial OK (correlação {score:.3f}).',
            },
            status=200,
        )

    return JsonResponse(
        {
            'status': 'sem_match',
            'entrada_permitida': False,
            'score': score,
            'threshold': threshold,
            'mensagem': msg,
            'visitante': _serialize_visitor(visitante),
            'foto_capturada': foto,
        },
        status=200,
    )


@csrf_exempt
@require_http_methods(['POST'])
def revisao_manual(request, id: int):
    visitante = CadastroVisitantePortaria.objects.filter(id=id).first()
    if not visitante:
        return JsonResponse({'erro': 'Visitante não encontrado.'}, status=404)

    try:
        data = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'erro': 'JSON inválido.'}, status=400)

    decisao = (data.get('decisao') or '').strip()
    if decisao not in ('aprovar', 'negar'):
        return JsonResponse({'erro': 'Decisão inválida.'}, status=400)

    aprovado = decisao == 'aprovar'
    RegistroAcessoPortaria.objects.create(
        cadastro=visitante,
        nome_informado=visitante.nome,
        documento_informado=visitante.documento,
        motivo_informado=(data.get('motivo') or '').strip(),
        observacao_informada=(data.get('observacao') or '').strip(),
        fluxo='reconhecimento_falha_review_ok' if aprovado else 'reconhecimento_falha_review_negado',
        reconhecimento_correlacao=data.get('score'),
        reconhecimento_automatico_ok=False,
        review_manual_aprovado=aprovado,
        entrada_permitida=aprovado,
    )
    return JsonResponse(
        {
            'status': 'aprovado' if aprovado else 'negado',
            'entrada_permitida': aprovado,
            'mensagem': (
                'Entrada aprovada manualmente.'
                if aprovado
                else 'Entrada negada manualmente.'
            ),
        },
        status=200,
    )
