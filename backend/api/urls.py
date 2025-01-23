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
    path('scenes/', ListsScenesView.as_view(), name='list_scenes'),
    path('get_scenes/', GetScenesView.as_view(), name='get_scenes'),
    path('scene/<int:pk>/delete/', DeleteSceneView.as_view(), name='delete_scene'),
    path('group/<int:pk>/delete/', DeleteGroupView.as_view(), name='delete_group'),
    path('users/<str:username>/groups/', GroupsPerUserView.as_view(), name='groups_per_user'),
    path('get_groups_per_user/', GetGroupsPerUserView.as_view(), name='get_groups_per_user'),
    path('group/<int:group_id>/patients/', PatientsPerGroupView.as_view(), name='patients_per_group'),
    path('forms_per_user/', GetFormsPerUserView.as_view(), name='forms_per_user'),
    path('assesment/<int:pk>/delete/', DeleteAssesmentView.as_view(), name='delete_assesment'),
]

urlpatterns += [path('', include(router.urls))]