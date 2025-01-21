from django.urls import path
from . import views
from .views import *
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ObjetivoViewSet, EscenaListView, ObjetivosListView


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
    path('health_centers/<int:center_id>/delete/', delete_health_center, name='delete_health_center'),
    path('health_centers/', views.listar_centros_de_salud, name='listar_centros_de_salud'),
    path('get_info/', views.get_provinces_and_cities, name='get_provinces_and_cities'),
    path('create_health_center/', views.create_health_center, name='create_health_center'),
    path('signIn/', views.signIn, name='signIn'),
    path('crear-escena/', views.crear_escena, name='crear_escena'),
    path('escenas/', EscenaListView.as_view(), name='escena-list'),
    path('objetivos-list/', ObjetivosListView.as_view(), name='objetivo-list'),
    path('buscar_padres/', views.buscar_padres, name='buscar_padres'),
    path('get_health_centers/', views.get_health_centers, name='get_health_centers'),
    path('get_therapists/', views.get_therapists, name='get_therapists'),
    path('get_patients/', views.get_patients, name='get_patients'),
    path('create_group/', views.create_group, name='create_group'),
    path('get_groups/', views.get_groups, name='get_groups'),
    path('update_group/<int:group_id>/', views.update_group, name='update_group'),
    path('personagrupo/<int:grupo_id>/<int:user_id>/', views.delete_person_group, name='delete_person_group'),
]


urlpatterns += [path('', include(router.urls))]