from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from django.http import HttpResponseRedirect
from .models import *
from .serializers import *
from .forms import *
from rest_framework.views import APIView
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, status

import json

def example_view(request):
    return JsonResponse({'message': 'Hello, world!'})

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

class PacienteListView(APIView):
    def get(self, request):
        query = request.query_params.get('query', '').lower()  # Parámetro de búsqueda
        pacientes = User.objects.filter(role='paciente')

        if query:
            pacientes = pacientes.filter(
                models.Q(nombre__icontains=query) |
                models.Q(dni__icontains=query) |
                models.Q(genero__icontains=query) |
                models.Q(username__icontains=query)  # Filtrar por nombre de usuario
            ).distinct()  # Evitar duplicados

        serializer = PacienteSerializer(pacientes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

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
        

@api_view(['GET'])
def retrieve_user(request):
    username = request.query_params.get('username')
    try:
        user = User.objects.get(username=username)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    

def update_residencia(data):
    try:
        residencia = Residencia.objects.get(id_dir=data.get('id_dir'))
        residencia.provincia = data.get('provincia', residencia.provincia)
        residencia.ciudad = data.get('ciudad', residencia.ciudad)
        residencia.calle = data.get('calle', residencia.calle)
        residencia.numero = data.get('numero', residencia.numero)
        residencia.save()  # Guarda los cambios en la residencia
        return residencia
    except Residencia.DoesNotExist:
        return None

@api_view(['PUT'])
def update_user(request, username): 
    try:
        user = User.objects.get(username=username)  
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Actualiza los campos del usuario con los datos enviados
    user.dni = request.data.get('dni', user.dni)
    user.nombre = request.data.get('nombre', user.nombre)
    user.fecha_nac = request.data.get('fecha_nac', user.fecha_nac)
    user.genero = request.data.get('genero', user.genero)
    user.role = request.data.get('role', user.role)

    # Actualiza los campos de la residencia del usuario
    residencia = update_residencia(request.data)
    if residencia is None:
        return Response({'error': 'Residencia not found'}, status=status.HTTP_404_NOT_FOUND)

    user.save()  # Guarda los cambios en el usuario

    return Response({'message': 'User updated successfully'}, status=status.HTTP_200_OK)