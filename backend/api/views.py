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
from datetime import datetime
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

#User = get_user_model()  # Modelo de usuario creado por nosotros

import json

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Agregar campos personalizados al payload del token
        token['username'] = user.username  # Incluye el nombre del usuario
        return token
        
    def validate(self, attrs):
        data = super().validate(attrs)
        # Agrega el username al response data
        data['username'] = self.user.username
        return data

def example_view(request):
    return JsonResponse({'message': 'Hello, world!'})

@api_view(['POST'])
def login(request):
    serializer = CustomTokenObtainPairSerializer(data=request.data)
    if serializer.is_valid():
        response = Response({
            "message": "Login successful",
            "username": serializer.validated_data['username'],  # Obtiene el username desde validated_data
        })
        
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
        
from django.db import transaction

@api_view(['POST'])
def signIn(request):
    try:
        # Validar que todos los campos están presentes
        required_fields = [
            'dni', 'nombre', 'fecha_nac', 'genero', 'role',
            'provincia', 'ciudad', 'calle', 'numero'
        ]
        missing_fields = [field for field in required_fields if field not in request.data]

        if missing_fields:
            return Response(
                {"error": f"Faltan los siguientes campos: {', '.join(missing_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener datos del request
        dni = request.data.get('dni')
        nombre = request.data.get('nombre')
        fecha_nac = request.data.get('fecha_nac')
        genero = request.data.get('genero')
        role = request.data.get('role')
        provincia = request.data.get('provincia')
        ciudad = request.data.get('ciudad')
        calle = request.data.get('calle')
        numero = request.data.get('numero')
        id_padre = request.data.get('id_padre', None)  # Puede ser opcional

        print(f"Datos recibidos: DNI={dni}, Nombre={nombre}, Fecha={fecha_nac}, Genero={genero}, Role={role}")

        # Verificar si el DNI ya existe
        if User.objects.filter(dni=dni).exists():
            return Response(
                {"error": "Ya existe un usuario con ese DNI"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar si el nombre ya existe
        if User.objects.filter(nombre=nombre).exists():
            return Response(
                {"error": "Ya existe un usuario con ese nombre"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar formato de fecha de nacimiento
        try:
            fecha_nac = datetime.strptime(fecha_nac, "%Y-%m-%d")
        except ValueError:
            return Response(
                {"error": "El formato de la fecha de nacimiento debe ser YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar género
        if genero not in ['Masculino', 'Femenino']:
            return Response(
                {"error": "El género debe ser 'Masculino' o 'Femenino'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar rol
        if role not in [choice[0] for choice in User.ROLE_CHOICES]:
            return Response(
                {"error": f"El rol debe ser uno de los siguientes: {[choice[0] for choice in User.ROLE_CHOICES]}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear la residencia (dirección) dentro de una transacción
        with transaction.atomic():
            
            # Crear y guardar la residencia en la base de datos
            residencia = Residencia(
                provincia=provincia,
                ciudad=ciudad,
                calle=calle,
                numero=numero
            )
            residencia.save()  # Guardar la residencia para asegurarse de que tiene un ID asignado
            print(f"Residencia creada con ID: {residencia}")

            # Crear el usuario y asignar la residencia
            user = User(
                dni=dni,
                nombre=nombre,
                username=nombre,
                fecha_nac=fecha_nac,
                genero=genero,
                role=role,
                direccion_id_dir=residencia,  # Se pasa el objeto residencia
                email='adri@example.com'
            )

            # Asociar padre si el rol es paciente y se proporciona un ID de padre
            if role == 'paciente' and id_padre:
                try:
                    padre = User.objects.get(dni=id_padre, role='padre')
                    user.user_id_padre = padre
                except User.DoesNotExist:
                    return Response(
                        {"error": "El padre especificado no existe o no tiene el rol de 'padre'"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            print("Contrasena"+request.data.get('password'))
            user.set_password(request.data.get('password'))
            print("Valida ")
            print(user.check_password(user.password))
            user.is_active = True
            user.save()
            print(f"Usuario creado: {user}")

        return Response(
            {"message": "Usuario registrado exitosamente"},
            status=status.HTTP_201_CREATED
        )

    except IntegrityError as e:
        print(f"IntegrityError: {e}")  # Imprime el mensaje completo del error
        return Response(
            {"error": f"Error de integridad: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except ValidationError as e:
        print(f"ValidationError: {e}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(f"Error inesperado: {e}")
        return Response(
            {"error": f"Error inesperado: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def registrar_comentario(request):
    try:
        # Validar que todos los campos necesarios están presentes
        required_fields = ['escena_id',"personaobjetivo_user_id","personaobjetivo_objetivo_id", 'texto']
        missing_fields = [field for field in required_fields if field not in request.data]
        if missing_fields:
            return Response(
                {"error": f"Faltan los siguientes campos: {', '.join(missing_fields)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener datos del request
        escena_id = request.data.get('escena_id')
        personaobjetivo_user_id = request.data.get('personaobjetivo_user_id', None)
        personaobjetivo_objetivo_id = request.data.get('personaobjetivo_objetivo_id', None)
        texto = request.data.get('texto')

        # Validar que la escena existe
        try:
            escena = Escenavideo.objects.get(id=escena_id)
        except Escenavideo.DoesNotExist:
            return Response(
                {"error": "La escena especificada no existe"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validar relaciones opcionales
        personaobjetivo_user = None
        if personaobjetivo_user_id:
            try:
                personaobjetivo_user = Escenavideo.objects.get(id=personaobjetivo_user_id)
            except Escenavideo.DoesNotExist:
                return Response(
                    {"error": "La persona objetivo (user) especificada no existe"},
                    status=status.HTTP_404_NOT_FOUND
                )

        personaobjetivo_objetivo = None
        if personaobjetivo_objetivo_id:
            try:
                personaobjetivo_objetivo = Escenavideo.objects.get(id=personaobjetivo_objetivo_id)
            except Escenavideo.DoesNotExist:
                return Response(
                    {"error": "La persona objetivo (objetivo) especificada no existe"},
                    status=status.HTTP_404_NOT_FOUND
                )

        # Crear el comentario en una transacción
        with transaction.atomic():
            comentario = Comentario.objects.create(
                escena=escena,
                personaobjetivo_user=personaobjetivo_user,
                personaobjetivo_objetivo=personaobjetivo_objetivo,
                texto=texto
            )

        return Response(
            {"message": "Comentario registrado exitosamente", "comentario_id": comentario.id},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {"error": f"Error inesperado: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )