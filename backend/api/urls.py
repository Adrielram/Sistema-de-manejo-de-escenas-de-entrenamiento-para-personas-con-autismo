from django.urls import path
from . import views
from .views import *
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ObjetivoViewSet


router = DefaultRouter()
router.register(r'create_objetivo', ObjetivoViewSet, basename='objetivo')


urlpatterns = [
    # Definir las rutas para las vistas que tengas en tu aplicación
    path('example/', views.example_view, name='example'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('verify-session/', verify_session, name='verify-session'),
    path('objetivos/', objetivos_list, name='listar_objetivos'),
    path('pacientes/', PacienteListView.as_view(), name='paciente-list'),
    path('signIn/', views.signIn, name='signIn'),
    path('buscar_padres/', views.buscar_padres, name='buscar_padres'),
    path('objetivos-paciente/<int:user_id>/', views.objetivos_por_usuario, name='objetivos-paciente'),
    #path('listar_comentarios/', listar_comentarios, name='listar_comentarios'),   paso id_user y id_objetivo por json 
#       {
#           "user_id": 1,
#           "objetivo_id": 1
#       }
]

urlpatterns += [path('', include(router.urls))]