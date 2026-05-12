from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Granja, RegistroAcessoPortaria
from django.contrib.auth.hashers import make_password, check_password
import json
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import render

def home(request):
    if request.method == 'POST':
        username = request.POST.get('cnpj')
        password = request.POST.get('password')
        
        if not username or not password:
            return render(request, 'main/login.html', {'erro': 'Usuário e senha são obrigatórios.'})
        
        granja = Granja.objects.filter(CNPJ=username).first()
        if not granja or not check_password(password, granja.senha):
            return render(request, 'main/login.html', {'erro': 'Usuário ou senha inválidos.'})
        
        request.session['granja_id'] = granja.id
        request.session['granja_nome'] = granja.nome
        return render(request, 'main/login.html', {'sucesso': f'Bem-vindo, {granja.nome}!'})
    
    return render(request, 'main/login.html')

def cadastro_page(request):
    if request.method == 'POST':
        nome = request.POST.get('nome')
        CNPJ = request.POST.get('cnpj')
        regiao = request.POST.get('regiao')
        telefone = request.POST.get('telefone')
        email_corporativo = request.POST.get('email_corporativo')
        senha = request.POST.get('senha')
        
        if not nome or not CNPJ or not senha:
            return render(request, 'main/cadastro.html', {'erro': 'Nome, CNPJ e senha são obrigatórios.'})
        
        if Granja.objects.filter(CNPJ=CNPJ).exists():
            return render(request, 'main/cadastro.html', {'erro': 'CNPJ já cadastrado.'})
        
        senha_hash = make_password(senha)
        Granja.objects.create(
            nome=nome,
            CNPJ=CNPJ,
            regiao=regiao,
            telefone=telefone,
            email_corporativo=email_corporativo,
            senha=senha_hash
        )
        return render(request, 'main/cadastro.html', {'sucesso': 'Granja cadastrada com sucesso!'})
    return render(request, 'main/cadastro.html')

# Cadastro da granja.
@csrf_exempt
def cadastrar_granja(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			nome = data.get('nome')
			CNPJ = data.get('CNPJ')
			regiao = data.get('regiao')
			telefone = data.get('telefone')
			email_corporativo = data.get('email_corporativo')
			senha = data.get('senha')
			if not nome or not CNPJ or not senha:
				return JsonResponse({'erro': 'Nome, CNPJ e senha são obrigatórios.'}, status=400)
			if Granja.objects.filter(CNPJ=CNPJ).exists():
				return JsonResponse({'erro': 'CNPJ já cadastrado.'}, status=400)
			senha_hash = make_password(senha)

			granja = Granja.objects.create(
				nome=nome,
				CNPJ=CNPJ,
				regiao=regiao,
				telefone=telefone,
				email_corporativo=email_corporativo,
				senha=senha_hash
			)
			return JsonResponse({'mensagem': 'Granja cadastrada com sucesso!', 'id': granja.id, 'nome': granja.nome, 'CNPJ': granja.CNPJ}, status=201)
		except Exception as e:
			return JsonResponse({'erro': str(e)}, status=400)
	return JsonResponse({'erro': 'Método não permitido.'}, status=405)


@csrf_exempt
def login_granja(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			CNPJ = data.get('CNPJ')
			senha = data.get('senha')

			if not CNPJ or not senha:
				return JsonResponse({'erro': 'CNPJ e senha são obrigatórios.'}, status=400)

			granja = Granja.objects.filter(CNPJ=CNPJ).first()
			if not granja:
				return JsonResponse({'erro': 'CNPJ ou senha inválidos.'}, status=401)

			if not check_password(senha, granja.senha):
				return JsonResponse({'erro': 'CNPJ ou senha inválidos.'}, status=401)

			request.session['granja_id'] = granja.id
			request.session['granja_nome'] = granja.nome

			return JsonResponse(
				{
					'mensagem': 'Login realizado com sucesso!',
					'id': granja.id,
					'nome': granja.nome,
				},
				status=200
			)
		except Exception as e:
			return JsonResponse({'erro': str(e)}, status=400)
	return JsonResponse({'erro': 'Método não permitido.'}, status=405)


@csrf_exempt
def logout_granja(request):
	if request.method in ['POST', 'GET']:
		request.session.flush()
		return JsonResponse({'mensagem': 'Logout realizado com sucesso.'}, status=200)
	return JsonResponse({'erro': 'Método não permitido.'}, status=405)


@csrf_exempt
def editar_granja(request, id):
	if request.method in ['PUT', 'PATCH', 'POST']:
		try:
			data = json.loads(request.body)
			granja = Granja.objects.filter(id=id).first()
			if not granja:
				return JsonResponse({'erro': 'Granja não encontrada.'}, status=404)
			nome = data.get('nome')
			CNPJ = data.get('CNPJ')
			senha = data.get('senha')
			if nome:
				granja.nome = nome
			if CNPJ:
				if Granja.objects.filter(CNPJ=CNPJ).exclude(id=id).exists():
					return JsonResponse({'erro': 'CNPJ já cadastrado.'}, status=400)
				granja.CNPJ = CNPJ
			if senha:
				granja.senha = make_password(senha)
			granja.save()
			return JsonResponse({'mensagem': 'Granja atualizada com sucesso!', 'id': granja.id, 'nome': granja.nome, 'CNPJ': granja.CNPJ}, status=200)
		except Exception as e:
			return JsonResponse({'erro': str(e)}, status=400)
	return JsonResponse({'erro': 'Método não permitido.'}, status=405)

@csrf_exempt
def deletar_granja(request, id):
	if request.method == 'DELETE':
		granja = Granja.objects.filter(id=id).first()
		if not granja:
			return JsonResponse({'erro': 'Granja não encontrada.'}, status=404)
		granja.delete()
		return JsonResponse({'mensagem': 'Granja deletada com sucesso.'}, status=200)
	return JsonResponse({'erro': 'Método não permitido.'}, status=405)

