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
    path('objetivo/<int:objetivo_id>/', get_goal_data, name='get_goal_data'),
    path('get-user/', retrieve_user.as_view(), name='retrieve_user'),
    path('update-user/', update_user, name='update_user'),
    path('signIn/', views.signIn, name='signIn'),
    path('buscar_padres/', views.buscar_padres, name='buscar_padres'),
    path('crear-escena/', views.crear_escena, name='crear_escena'),
    path('escenas/', EscenaListView.as_view(), name='escena-list'),
    path('buscar_padres/', views.buscar_padres, name='buscar_padres'),
    path('HijosListView/', views.hijos_list_view, name='HijosListView'),
    path('get-dni/', views.get_dni, name='get-dni'),
    path('get-name/', views.obtener_nombre_por_dni, name='get-name'),
    path('objetivos-ev-paciente/', views.objetivos_evaluacion_usuario, name='objetivos-ev-paciente'),
    path('obtener_centros_de_salud/', CentrosSaludListView.as_view(), name='obtener_centros_salud'),
    path('registrar_comentario/', registrar_comentario.as_view(), name='registrar_comentario'),
    path('get-escenas-obj/', EscenasSegunUsuarioObjetivo.as_view(), name='get-escenas-obj'),
    path('get-evaluaciones/', ObtenerEvaluaciones.as_view(), name='get-evaluaciones'),
    path('get-persona-obj-esc/', ObtenerPersonaObjetivoID.as_view(), name='get-persona-obj-esc'),
    path('comentarios/', ComentarioDetalleAPIView.as_view(), name='comentario-detalle'),
    path('comentarios/lista/', ComentariosListaAPIView.as_view(), name='comentarios-lista'),
    path('video-visto/', MarcarVideoVistoView.as_view(), name='video-visto'),
    path('formularios/', FormularioListCreateView.as_view(), name='formulario-list-create'),
    path('formularios/<int:pk>/', FormularioDetailView.as_view(), name='formulario-detail'),
    path('preguntas/', PreguntaListCreateView.as_view(), name='pregunta-list-create'),
    path('respuestas/', RespuestaListCreateView.as_view(), name='respuesta-list-create'),
    path('get_not_associated_centers/<str:username>/', NotAssociatedCentersListView.as_view(), name='get_not_associated_centers'),
    path('get_associated_centers/<str:username>/', AssociatedCentersListView.as_view(), name='get_associated_centers'),
    path('associate_center/', AssociateCenterView.as_view(), name='associate_center'),
    path('create_patient_group/', CreateGroup.as_view(), name='create_patient_group'),
    path('disassociate_center/', DisassociateCenterView.as_view(), name='desassociate_center'),
    path('check-cookie/', check_cookie, name='check_cookie'),
    path('getCenterProfesional/', GetCentroProfesionalView.as_view(), name='getCenterProfesional'),
    path('get_goals_centroprofesional/', GetCentroProfesionalObjetivosView.as_view(), name='get_goals_centroprofesional'),
    path('goal/<int:pk>/delete/', DeleteGoalView.as_view(), name='delete_goal'),
    path('formularios/<int:formulario_id>/<int:paciente_dni>/', RespuestasFormularioView.as_view(), name='respuestas_formulario'),
    path('verificar_form_completado/<int:formulario_id>/<str:username>/', verificar_formulario_completado, name='verificar_form_completado'),
    path('comentario_profesional/', CrearComentarioProfesionalView.as_view(), name='crear_comentario'),
    path('respuestas/<int:respuesta_id>/actualizar-nota/', ActualizarNotaRespuestaView.as_view(), name='actualizar-nota'),
    path('registrar-respuesta/', registrar_respuesta, name='registrar-respuesta'),
    path('obtener_estado_revision/', obtener_estado_revision, name='obtener_estado_revision'),
    path('listar_formularios_completados/<str:username>/', views.listar_formularios_completados, name='listar_formularios_completados'),
]


urlpatterns += [path('', include(router.urls))]