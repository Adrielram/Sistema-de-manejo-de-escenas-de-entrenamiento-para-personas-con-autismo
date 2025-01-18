from django.urls import path
from . import views
from .views import *
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'create_objetivo', ObjetivoViewSet, basename='objetivo')


urlpatterns = [
    # Definir las rutas para las vistas que tengas en tu aplicación
    path('example/', views.example_view, name='example'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('verify-session/', verify_session, name='verify-session'),
    path('objetivos/', objetivos_list, name='listar_objetivos'),
    path('pacientes/', PacienteListView.as_view(), name='pacientes-list'),
    path('terapeutas/', TerapeutaListView.as_view(), name='terapeutas-list'),
    path('grupos/', GroupListView.as_view(), name='grupos-list'),
    path('pacientes/<int:pk>/', PacienteDetailView.as_view(), name='paciente-detail'),
    path('terapeutas/<int:pk>/', TerapeutaDetailView.as_view(), name='terapeuta-detail'),
    path('grupos/<int:pk>/', GroupDetailView.as_view(), name='group-detail'),
    path('signIn/', views.signIn, name='signIn'),
    path('crear-escena/', views.crear_escena, name='crear_escena'),
    path('escenas/', EscenaListView.as_view(), name='escena-list'),
    path('objetivos-list/', ObjetivosListView.as_view(), name='objetivo-list'),
    path('buscar_padres/', views.buscar_padres, name='buscar_padres'),
    path('obtener_centros_de_salud/', CentrosSaludListView.as_view(), name='obtener_centros_salud'),
    path('notificaciones/', views.obtener_notificaciones_pendientes, name='notificaciones-pendientes'),
    path('notificaciones/<int:pk>/', views.obtener_detalle_notificacion, name='notification-detail'),
    path('notificaciones/<int:pk>/<str:accion>/', procesar_notificacion, name='procesar_notificacion'),
    path('check-cookie/', check_cookie, name='check_cookie'),
    path('paciente/<int:dni>/comentarios/', ComentariosPacienteAPIView.as_view(), name='comentarios_paciente'),
]


urlpatterns += [path('', include(router.urls))]