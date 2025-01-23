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
    path('obtener_objetivos_usuario/', ObjetivosUsuarioListView.as_view(), name='listar_objetivos_usuario'),
    path('obtener_escenas_por_objetivo/', EscenasPorObjetivoListView.as_view(), name='listar_escenas_por_objetivo'),
    path('buscar_objetivos/', ObjetivoBusquedaView.as_view(), name='objetivo-search'),
    path('pacientes/', PacienteListView.as_view(), name='paciente-list'),
    path('get-user/', retrieve_user.as_view(), name='retrieve_user'),
    path('update-user/', update_user, name='update_user'),
    path('signIn/', views.signIn, name='signIn'),
    path('crear-escena/', views.crear_escena, name='crear_escena'),
    path('escenas/', EscenaListView.as_view(), name='escena-list'),
    path('objetivos-list/', ObjetivosListView.as_view(), name='objetivo-list'),
    path('buscar_padres/', views.buscar_padres, name='buscar_padres'),
    path('HijosListView/', views.hijos_list_view, name='HijosListView'),
    path('get-dni/', views.get_dni, name='get-dni'),
    path('get-name/', views.obtener_nombre_por_dni, name='get-name'),
    path('objetivos-ev-paciente/', views.objetivos_evaluacion_usuario, name='objetivos-ev-paciente'),
    path('obtener_centros_de_salud/', CentrosSaludListView.as_view(), name='obtener_centros_salud'),
    path('registrar_comentario/', registrar_comentario.as_view(), name='registrar_comentario'),
    path('get-escenas-obj/', EscenasSegunUsuarioObjetivo.as_view(), name='get-escenas-obj'),
    path('get-evaluaciones/', ObtenerLinksEvaluaciones.as_view(), name='get-evaluaciones'),
    path('get-persona-obj-esc/', ObtenerPersonaObjetivoID.as_view(), name='get-persona-obj-esc'),
    path('video-visto/', MarcarVideoVistoAPIView.as_view(), name='video-visto'),
    path('comentarios/', ComentarioDetalleAPIView.as_view(), name='comentario-detalle'),
    path('comentarios/lista/', ComentariosListaAPIView.as_view(), name='comentarios-lista'),
    path('check-cookie/', check_cookie, name='check_cookie'),
    ]

urlpatterns += [path('', include(router.urls))]