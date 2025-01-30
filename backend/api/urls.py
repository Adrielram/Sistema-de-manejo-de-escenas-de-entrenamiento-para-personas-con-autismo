from django.urls import path
from . import views
from .views import *
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'create_objetivo', ObjetivoViewSet, basename='create_objetivo')
router.register(r'objetivos', ObjetivoViewSet, basename='objetivo')


urlpatterns = [
    # Definir las rutas para las vistas que tengas en tu aplicación
    path('example/', views.example_view, name='example'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('verify-session/', verify_session, name='verify-session'),
    path('objetivos/', objetivos_list, name='listar_objetivos'),
    path('pacientes/', PacienteListView.as_view(), name='paciente-list'),
    path('objetivo/<int:objetivo_id>/', get_goal_data, name='get_goal_data'),
    path('signIn/', views.signIn, name='signIn'),
    path('buscar_padres/', views.buscar_padres, name='buscar_padres'),
    path('crear-escena/', views.crear_escena, name='crear_escena'),
    path('escenas/', EscenaListView.as_view(), name='escena-list'),
    path('objetivos-list/', ObjetivosListView.as_view(), name='objetivo-list'),
    #path('obtener-escenas/', obtener_escenas, name='obtener_escenas')
    path('obtener_centros_de_salud/', CentrosSaludListView.as_view(), name='obtener_centros_salud'),
    path('get_not_associated_centers/<str:username>/', NotAssociatedCentersListView.as_view(), name='get_not_associated_centers'),
    path('get_associated_centers/<str:username>/', AssociatedCentersListView.as_view(), name='get_associated_centers'),
    path('associate_center/', AssociateCenterView.as_view(), name='associate_center'),
    path('create_patient_group/', CreateGroup.as_view(), name='create_patient_group'),
    path('disassociate_center/', DisassociateCenterView.as_view(), name='desassociate_center'),
    path('check-cookie/', check_cookie, name='check_cookie'),
    path('getCenterProfesional/', GetCentroProfesionalView.as_view(), name='getCenterProfesional'),
    path('get_goals_centroprofesional/', GetCentroProfesionalObjetivosView.as_view(), name='get_goals_centroprofesional'),
    path('goal/<int:pk>/delete/', DeleteGoalView.as_view(), name='delete_goal'),
    path('goal/ResolveNamesToIds/', ResolveNamesToIds.as_view(), name='ResolveNamesToIds'),
    path('escenaById/<int:pk>/', EscenaById.as_view(), name='escenaById'),
    path('grupoById/<int:pk>/', GrupoById.as_view(), name='grupoById'),
    path('scenes/<int:pk>', EscenaUpdateView.as_view(), name='escena-update'),
    path('groups/<int:pk>', GrupoUpdateView.as_view(), name='grupo-update'),
    path('spacy-patologias/', SpacyPatologiasView.as_view(), name='spacy-patologias'),
    path('registrar_comentario/', registrar_comentario.as_view(), name='registrar_comentario'),
    path('get-escenas-obj/', EscenasSegunUsuarioObjetivo.as_view(), name='get-escenas-obj'),
    path('get-evaluaciones/', ObtenerLinksEvaluaciones.as_view(), name='get-evaluaciones'),
    path('get_patient_forms/', GetPatientForms.as_view(), name='get_patient_forms'),
    path('get-persona-obj-esc/', ObtenerPersonaObjetivoID.as_view(), name='get-persona-obj-esc'),
    path('video-visto/', MarcarVideoVistoAPIView.as_view(), name='video-visto'),
    path('scenes/', ListsScenesView.as_view(), name='list_scenes'),
    path('get_scenes/', GetScenesView.as_view(), name='get_scenes'),
    path('scene/<int:pk>/delete/', DeleteSceneView.as_view(), name='delete_scene'),
    path('group/<int:pk>/delete/', DeleteGroupView.as_view(), name='delete_group'),
    path('users/<str:username>/groups/', GroupsPerUserView.as_view(), name='groups_per_user'),
    path('get_groups_per_user/', GetGroupsPerUserView.as_view(), name='get_groups_per_user'),
    path('group/<int:group_id>/patients/', PatientsPerGroupView.as_view(), name='patients_per_group'),
    path('get_patients_per_group/', GetPatientsPerGroupView.as_view(), name='get_patients_per_group'),
    path('get_therapists_per_group/', GetTherapistsPerGroupView.as_view(), name='get_therapists_per_group'),

    path('forms_per_user/', GetFormsPerUserView.as_view(), name='forms_per_user'),
    path('assesment/<int:pk>/delete/', DeleteAssesmentView.as_view(), name='delete_assesment'),
    path('comentarios/lista/', ComentariosListaAPIView.as_view(), name='comentarios-lista'),
    path('comentarios/', ComentarioDetalleAPIView.as_view(), name='comentario-detalle'),
    path('get_reached_goals/', GetReachedGoalsView.as_view(), name='get_reached_goals'),
    path('get_unreached_goals/', GetUnreachedGoalsView.as_view(), name='get_unreached_goals'),
    path('health_centers/<int:center_id>/delete/', delete_health_center, name='delete_health_center'),
    path('health_centers/', views.listar_centros_de_salud, name='listar_centros_de_salud'),
    path('get_info/', views.get_provinces_and_cities, name='get_provinces_and_cities'),
    path('create_health_center/', views.create_health_center, name='create_health_center'),
    path('get_health_centers/', views.get_health_centers, name='get_health_centers'),
    path('get_therapists/', views.get_therapists, name='get_therapists'),
    path('get_patients/', views.get_patients, name='get_patients'),
    path('create_group/', views.create_group, name='create_group'),
    path('get_groups/', views.get_groups, name='get_groups'),
    path('update_group/<int:group_id>/', views.update_group, name='update_group'),
    path('personagrupo/<int:grupo_id>/<int:user_id>/', views.delete_person_group, name='delete_person_group'),
    path('get_patients_not_in_group/', GetPatientsNotInGroupView.as_view(), name='get_patients_not_in_group'),
    path('get_therapists_not_in_group/', GetTherapistsNotInGroupView.as_view(), name='get_therapists_not_in_group'),

    path('get_patients/', GetPatientsView.as_view(), name='get_patients'),

    path('get_groups_per_user_not_in/', GetGroupsPerUserNotInView.as_view(), name='get_groups_per_user_not_in'),
    path('getTherapistsExcluding/<str:username>/', GetTherapistsExcludingView.as_view(), name='getTherapistsExcluding'),
    ]

urlpatterns += [path('', include(router.urls))]