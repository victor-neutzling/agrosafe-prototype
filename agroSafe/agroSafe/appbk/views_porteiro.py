from django.conf import settings
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods

from .face_opencv import comparar_rosto_hash_referencia, gerar_hash_rosto_upload
from .models import CadastroVisitantePortaria, NivelVisitante, RegistroAcessoPortaria

from django.utils import timezone

def _norm_nome(s: str | None) -> str:
	return (s or '').strip()


def _norm_doc(s: str | None) -> str:
	return (s or '').strip()


def _clear_porteiro_session(request):
	for k in (
		'porteiro_nome',
		'porteiro_documento',
		'porteiro_empresa',
		'porteiro_nivel',
		'porteiro_visitante_id',
		'porteiro_modo',
		'porteiro_score',
		'porteiro_match_msg',
	):
		request.session.pop(k, None)


@require_http_methods(['GET', 'POST'])
def inicio(request):
	if request.method == 'POST':
		nome = _norm_nome(request.POST.get('nome'))
		documento = _norm_doc(request.POST.get('documento'))
		empresa = _norm_doc(request.POST.get('empresa'))
		nivel = (request.POST.get('nivel') or '').strip()
		if not nome or not documento or not empresa or not nivel:
			return render(
				request,
				'main/porteiro/inicio.html',
				{'erro': 'Todos os campos são obrigatórios.'},
			)
		if nivel not in NivelVisitante.values:
			return render(
				request,
				'main/porteiro/inicio.html',
				{'erro': 'Nível inválido.'},
			)
		exists = CadastroVisitantePortaria.objects.filter(nome=nome, documento=documento).first()
		request.session['porteiro_nome'] = nome
		request.session['porteiro_documento'] = documento
		request.session['porteiro_empresa'] = empresa
		request.session['porteiro_nivel'] = nivel
		if exists:
			request.session['porteiro_visitante_id'] = exists.id
			request.session['porteiro_modo'] = 'verificacao'
		else:
			request.session.pop('porteiro_visitante_id', None)
			request.session['porteiro_modo'] = 'cadastro_novo'
		return redirect('porteiro_foto')
	return render(request, 'main/porteiro/inicio.html')


@require_http_methods(['GET', 'POST'])
def foto(request):
	modo = request.session.get('porteiro_modo')
	nome = request.session.get('porteiro_nome')
	documento = request.session.get('porteiro_documento')
	empresa = request.session.get('porteiro_empresa')
	nivel = request.session.get('porteiro_nivel')
	if not modo or not nome or not documento:
		return redirect('porteiro_inicio')
	if modo == 'cadastro_novo' and (not empresa or not nivel or nivel not in NivelVisitante.values):
		return redirect('porteiro_inicio')
	if request.method == 'POST':
		f = request.FILES.get('foto')
		if not f:
			return render(
				request,
				'main/porteiro/foto.html',
				{'erro': 'Envie uma foto (arquivo ou captura da câmera).', 'modo': modo},
			)
		if modo == 'cadastro_novo':
			if CadastroVisitantePortaria.objects.filter(nome=nome, documento=documento).exists():
				_clear_porteiro_session(request)
				return render(
					request,
					'main/porteiro/resultado.html',
					{
						'titulo': 'Erro',
						'detalhe': 'Visitante já cadastrado.',
						'permitida': False,
					},
				)
			foto_hash, status = gerar_hash_rosto_upload(f)
			if not foto_hash:
				return render(
					request,
					'main/porteiro/foto.html',
					{
						'erro': f'Não foi possível gerar hash facial da foto: {status}.',
						'modo': modo,
						'threshold': getattr(settings, 'FACE_MATCH_HASH_THRESHOLD', 0.78),
					},
				)
			c = CadastroVisitantePortaria.objects.create(
				nome=nome,
				documento=documento,
				empresa=empresa,
				nivel=nivel,
				foto_hash=foto_hash
			)
			RegistroAcessoPortaria.objects.create(
				cadastro=c,
				nome_informado=nome,
				documento_informado=documento,
				motivo_informado=request.POST.get('motivo') or '',
				observacao_informada=request.POST.get('observacao') or '',
				fluxo='novo_cadastro',
				entrada_permitida=True,
			)
			_clear_porteiro_session(request)
			return render(
				request,
				'main/porteiro/resultado.html',
				{
					'titulo': 'Entrada permitida',
					'detalhe': 'Cadastro efetuado; porteiro tirou a foto (fluxo: não existia no sistema).',
					'permitida': True,
				},
			)
		vid = request.session.get('porteiro_visitante_id')
		c = CadastroVisitantePortaria.objects.filter(id=vid).first()
		if not c:
			_clear_porteiro_session(request)
			return redirect('porteiro_inicio')
		ok, score, msg = comparar_rosto_hash_referencia(c.foto_hash, f)
		if ok:
			# Verifica se a última entrada permitida foi há pelo menos 48h
			ultimo_acesso = RegistroAcessoPortaria.objects.filter(
				cadastro=c,
				entrada_permitida=True
			).order_by('-criado_em').first()
			agora = timezone.now()
			if ultimo_acesso and (agora - ultimo_acesso.criado_em).total_seconds() < 48 * 3600:
				horas_restantes = 48 - int((agora - ultimo_acesso.criado_em).total_seconds() // 3600)
				RegistroAcessoPortaria.objects.create(
					cadastro=c,
					nome_informado=nome,
					documento_informado=documento,
					fluxo='tentativa_entrada_bloqueada_48h',
					reconhecimento_correlacao=score,
					reconhecimento_automatico_ok=True,
					entrada_permitida=False,
				)
				_clear_porteiro_session(request)
				return render(
					request,
					'main/porteiro/resultado.html',
					{
						'titulo': 'Entrada bloqueada',
						'detalhe': f'Entrada não autorizada. Faltam {horas_restantes} horas para nova entrada.',
						'permitida': False,
					},
				)
			# Se passou das 48h, libera normalmente
			RegistroAcessoPortaria.objects.create(
				cadastro=c,
				nome_informado=nome,
				documento_informado=documento,
				fluxo='reconhecimento_ok',
				reconhecimento_correlacao=score,
				reconhecimento_automatico_ok=True,
				entrada_permitida=True,
			)
			_clear_porteiro_session(request)
			return render(
				request,
				'main/porteiro/resultado.html',
				{
					'titulo': 'Entrada permitida',
					'detalhe': f'Foto bate com o cadastro (correlação {score:.3f}).',
					'permitida': True,
				},
			)
		request.session['porteiro_score'] = float(score)
		request.session['porteiro_match_msg'] = msg
		return redirect('porteiro_revisao')
	ctx = {
		'modo': modo,
		'threshold': getattr(settings, 'FACE_MATCH_HASH_THRESHOLD', 0.78),
	}
	return render(request, 'main/porteiro/foto.html', ctx)


@require_http_methods(['GET', 'POST'])
def revisao(request):
	nome = request.session.get('porteiro_nome')
	documento = request.session.get('porteiro_documento')
	vid = request.session.get('porteiro_visitante_id')
	modo = request.session.get('porteiro_modo')
	if not nome or not documento or not vid or modo != 'verificacao':
		return redirect('porteiro_inicio')
	c = CadastroVisitantePortaria.objects.filter(id=vid).first()
	if not c:
		_clear_porteiro_session(request)
		return redirect('porteiro_inicio')
	if request.method == 'POST':
		decisao = request.POST.get('decisao')
		if decisao == 'aprovar':
			RegistroAcessoPortaria.objects.create(
				cadastro=c,
				nome_informado=nome,
				documento_informado=documento,
				motivo_informado=request.POST.get('motivo') or '',
				observacao_informada=request.POST.get('observacao') or '',
				fluxo='reconhecimento_falha_review_ok',
				reconhecimento_correlacao=request.session.get('porteiro_score'),
				reconhecimento_automatico_ok=False,
				review_manual_aprovado=True,
				entrada_permitida=True,
			)
			_clear_porteiro_session(request)
			return render(
				request,
				'main/porteiro/resultado.html',
				{
					'titulo': 'Entrada permitida',
					'detalhe': 'Review manual do porteiro: aprovado.',
					'permitida': True,
				},
			)
		if decisao == 'negar':
			RegistroAcessoPortaria.objects.create(
				cadastro=c,
				nome_informado=nome,
				documento_informado=documento,
				fluxo='reconhecimento_falha_review_negado',
				reconhecimento_correlacao=request.session.get('porteiro_score'),
				reconhecimento_automatico_ok=False,
				review_manual_aprovado=False,
				entrada_permitida=False,
			)
			_clear_porteiro_session(request)
			return render(
				request,
				'main/porteiro/resultado.html',
				{
					'titulo': 'Entrada negada',
					'detalhe': 'Review manual do porteiro: não passou.',
					'permitida': False,
				},
			)
		return render(
			request,
			'main/porteiro/revisao.html',
			{
				'erro': 'Escolha aprovar ou negar.',
				'cadastro': c,
				'score': request.session.get('porteiro_score'),
				'msg': request.session.get('porteiro_match_msg'),
			},
		)
	return render(
		request,
		'main/porteiro/revisao.html',
		{
			'cadastro': c,
			'score': request.session.get('porteiro_score'),
			'msg': request.session.get('porteiro_match_msg'),
		},
	)
