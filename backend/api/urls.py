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
]

urlpatterns += [path('', include(router.urls))]