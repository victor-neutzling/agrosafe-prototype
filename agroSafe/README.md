# AgroSafe Backend

Backend do projeto AgroSafe desenvolvido com Django.

## Visao geral

Este repositorio contem:
- API para cadastro de pessoas (`/appbk/cadastrar/`)
- Pagina inicial com formulario de cadastro (`/`)
- Banco de dados SQLite para ambiente local

## Estrutura do projeto

```text
agroSafe/
|-- manage.py
|-- appbk/             # main app with settings, views, models
|   |-- settings.py
|   |-- urls.py
|   |-- views.py
|   |-- models.py
|   |-- ...
|-- template/          # legacy templates (to be removed)
|-- agroSafe/static/   # static files
|-- agroSafe/templates/# templates
|-- requirements.txt
`-- README.md
```

## Requisitos

- Python 3.11+ (recomendado)
- pip atualizado

## Como executar

### 1) Clonar o repositorio

```bash
git clone <url-do-repositorio>
cd agroSafe
```

### 2) Criar e ativar ambiente virtual

No Windows (PowerShell):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

No macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3) Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4) Aplicar migracoes

Entre na pasta que contem o `manage.py`:

```bash
cd agroSafe
python manage.py migrate
```

### 5) Executar o servidor local

```bash
python manage.py runserver
```

Servidor disponivel em:
- Home: <http://127.0.0.1:8000/>
- Admin Django: <http://127.0.0.1:8000/admin/>

## Endpoints principais

- `POST /appbk/cadastrar/` - cadastra pessoa

Exemplo com `curl`:

```bash
curl -X POST http://127.0.0.1:8000/appbk/cadastrar/ \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Maria\",\"cpf\":\"12345678900\",\"senha\":\"123456\"}"
```

## Comandos uteis

Executar testes:

```bash
python manage.py test
```

Criar superusuario:

```bash
python manage.py createsuperuser
```

## Documentacao

- [OpenCV](https://docs.opencv.org/) - Visao computacional e processamento de imagens
