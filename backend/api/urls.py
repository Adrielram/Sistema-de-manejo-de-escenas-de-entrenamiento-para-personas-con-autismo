from django.urls import path
from . import views

urlpatterns = [
    # Definir las rutas para las vistas que tengas en tu aplicación
    path('example/', views.example_view, name='example'),
]