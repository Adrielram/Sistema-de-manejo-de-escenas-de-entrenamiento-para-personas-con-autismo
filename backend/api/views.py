from django.shortcuts import render
from django.http import JsonResponse
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from .models import *
from .serializers import *
from rest_framework.views import APIView
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status

import json

def example_view(request):
    return JsonResponse({'message': 'Hello, world!'})

from django_filters import rest_framework as filters
from .models import User, Grupo

from django_filters import rest_framework as filters

class NameFilter(filters.FilterSet):
    nombre = filters.CharFilter(field_name='nombre', lookup_expr='icontains')

    def __init__(self, *args, **kwargs):
        model = kwargs.pop('model', None)
        if model:
            self._meta.model = model
        super().__init__(*args, **kwargs)

    class Meta:
        model = None  # Se establece dinámicamente
        fields = ['nombre']

from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import UserSerializer
from .models import User

class DynamicPagination(PageNumberPagination):
    page_size_query_param = "limit"
    max_page_size = 20
    page_size = 4

class PacienteListView(generics.ListAPIView):
    queryset = User.objects.filter(role='paciente')
    serializer_class = UserSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

class TerapeutaListView(generics.ListAPIView):
    queryset = User.objects.filter(role='terapeuta')
    serializer_class = UserSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

class GroupListView(generics.ListAPIView):
    queryset = Grupo.objects.all()
    serializer_class = GroupSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

class PacienteDetailView(generics.RetrieveDestroyAPIView):
    queryset = User.objects.filter(role='paciente')
    serializer_class = UserSerializer

class TerapeutaDetailView(generics.RetrieveDestroyAPIView):
    queryset = User.objects.filter(role='terapeuta')
    serializer_class = UserSerializer

class GroupDetailView(generics.RetrieveDestroyAPIView):
    queryset = Grupo.objects.all()
    serializer_class = GroupSerializer



@api_view(['POST'])
def login(request):
    serializer = TokenObtainPairSerializer(data=request.data)
    if serializer.is_valid():
        response = Response({"message": "Login successful"})
        # Almacenar el token de acceso en una cookie HTTP-only
        response.set_cookie(
            'jwt',  # Nombre de la cookie
            serializer.validated_data['access'],  # Token JWT
            httponly=True,  # Previene acceso desde JavaScript
            samesite='Lax'  # Mejora seguridad contra ataques CSRF
        )
        
        return response
    return Response(serializer.errors, status=400)


@api_view(['POST'])
def logout(request):
    response = Response({"message": "Logout successful"})
    # Borrar la cookie JWT
    response.delete_cookie('jwt')
    return response

@api_view(['GET'])
def verify_session(request):
    # Extraer la cookie 'jwt'
    jwt_token = request.COOKIES.get('jwt')
    
    if not jwt_token:
        return Response({"message": "No autorizado"}, status=401)
    
    try:
        # Validar el token JWT y decodificarlo
        access_token = AccessToken(jwt_token)
        username = access_token['username']  # Extraer el campo 'username' del payload
        return Response({
            "message": "Autorizado",
            "username": username  # Incluir el nombre de usuario en la respuesta
        }, status=200)
    except Exception as e:
        return Response({"message": "Token inválido o expirado"}, status=401)
    

def objetivos_list(request):
    objetivos = Objetivo.objects.all().values()  # Obtiene todos los objetivos
    return JsonResponse(list(objetivos), safe=False)

class ObjetivoViewSet(viewsets.ViewSet):
    def create(self, request):
        try:
            data = {
                'titulo': request.data.get('titulo'),
                'descripcion': request.data.get('descripcion'),
                'escena': request.data.get('escenaId')  # Nota que aquí usamos 'escena' en lugar de 'escenaId'
            }

            serializer = ObjetivoSerializer(data=data)
            if serializer.is_valid():
                objetivo = serializer.save()
                return Response({
                    'message': 'Objetivo creado con éxito',
                    'objetivo': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


