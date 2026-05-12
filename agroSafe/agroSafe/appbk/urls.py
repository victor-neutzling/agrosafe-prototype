from django.contrib import admin
from django.urls import path, include
from .views import cadastrar_granja, login_granja, logout_granja, editar_granja, deletar_granja, home, cadastro_page
from . import views_porteiro
from . import views_visitante

urlpatterns = [
    path('admin/', admin.site.urls),

    # Main pages
    path('', home, name='home'),
    path('login/', home, name='login_page'),
    path('cadastro/', cadastro_page, name='cadastro'),

    # Granja JSON API endpoints (consumed by the React frontend)
    path('api/cadastrar/', cadastrar_granja, name='cadastrar_granja'),
    path('api/login/', login_granja, name='login_granja'),
    path('api/logout/', logout_granja, name='logout_granja'),
    path('granja/<int:id>/editar/', editar_granja, name='editar_granja'),
    path('granja/<int:id>/deletar/', deletar_granja, name='deletar_granja'),

    # Visitante JSON API (access verification flow)
    path('api/visitantes/lookup/', views_visitante.lookup, name='visitante_lookup'),
    path('api/visitantes/', views_visitante.criar, name='visitante_criar'),
    path('api/visitantes/<int:id>/verificar/', views_visitante.verificar, name='visitante_verificar'),
    path('api/visitantes/<int:id>/revisao-manual/', views_visitante.revisao_manual, name='visitante_revisao_manual'),

    # Porteiro template endpoints (legacy server-rendered flow)
    path('porteiro/', views_porteiro.inicio, name='porteiro_inicio'),
    path('porteiro/foto/', views_porteiro.foto, name='porteiro_foto'),
    path('porteiro/revisao/', views_porteiro.revisao, name='porteiro_revisao'),
]
