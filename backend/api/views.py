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
from django.core.paginator import Paginator
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters

#User = get_user_model()  # Modelo de usuario creado por nosotros

import json

from rest_framework import generics
from rest_framework.pagination import PageNumberPagination

class DynamicPagination(PageNumberPagination):
    page_size_query_param = "limit"
    max_page_size = 20
    page_size = 4


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Agregar campos personalizados al payload del token
        token['username'] = user.username  # Incluye el nombre del usuario
        token['role'] = user.role #El rol del usuario
        return token
        
    def validate(self, attrs):
        data = super().validate(attrs)
        # Agrega el username al response data
        data['username'] = self.user.username
        data['role'] = self.user.role
        return data

def example_view(request):
    return JsonResponse({'message': 'Hello, world!'})

from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import UserSerializer
from .models import User

@api_view(['POST'])
def login(request):
    serializer = CustomTokenObtainPairSerializer(data=request.data)
    if serializer.is_valid():
        response = Response({
            "message": "Login successful",
            "username": serializer.validated_data['username'],  # Obtiene el username desde validated_data
            "role": serializer.validated_data['role'],  # Obtiene el role desde validated_data
        })
        
        # Almacenar el token de acceso en una cookie HTTP-only
        response.set_cookie(
            'jwt',  # Nombre de la cookie
            serializer.validated_data['access'],  # Token JWT
            httponly=True,  # Previene acceso desde JavaScript
            samesite='Lax',  # Mejora seguridad contra ataques CSRF
            max_age=60 * 60 #La cookie durará 1 hora.
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
        role=access_token['role']
        return Response({
            "message": "Autorizado",
            "username": username,  # Incluir el nombre de usuario en la respuesta
            "role":role
        }, status=200)
    except Exception as e:
        return Response({"message": "Token inválido o expirado"}, status=401)
    

def objetivos_list(request):
    objetivos = Objetivo.objects.all().values()  # Obtiene todos los objetivos 
    return JsonResponse(list(objetivos), safe=False)

class ObjetivoViewSet(viewsets.ViewSet):
    def create(self, request):
        try:
            # Serializar los datos
            serializer = ObjetivoSerializer(data=request.data)
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
        centros_de_salud = request.data.get('centros_de_salud', None)  # Puede ser opcional

        print("Centros de salud "+str(centros_de_salud))
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

            if role == 'admin':
                return Response(
                    {"error": "No está permitido registrar usuarios con rol de administrador a través de esta API."},
                    status=status.HTTP_403_FORBIDDEN
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
            
            password = request.data.get('password')
            if not password:
                return Response(
                    {"error": "La contraseña es requerida"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(password)
            print("Valida ")
            print(user.check_password(user.password))
            if role == 'terapeuta':
                user.is_active = False
            else:
                user.is_active = True
            user.save()       
            print(f"Usuario creado: {user}")
            if role == 'terapeuta' and centros_de_salud is not None:
                try:       
                    centros_validos = Centrodesalud.objects.filter(id__in=centros_de_salud)
                    if centros_validos.count() != len(centros_de_salud):
                        return Response(
                            {"error": "Uno o más centros de salud especificados no existen"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    for centro in centros_validos:
                        CentroProfesional.objects.create(profesional=user, centrodesalud=centro)
                except Exception as e:  # Captura cualquier otro error inesperado
                    return Response(
                        {"error": f"Error al asociar centros de salud: {str(e)}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )                         
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
def crear_escena(request):
    try:
        serializer = EscenaSerializer(data=request.data)
        
        # Validar datos
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Escena creada exitosamente", "data": serializer.data},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {"error": f"Error inesperado: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

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

class EscenaListView(generics.ListAPIView):
    queryset = Escena.objects.all()
    serializer_class = EscenaSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

class ObjetivosListView(generics.RetrieveDestroyAPIView):    
    queryset = Objetivo.objects.all()
    serializer_class = ObjetivoSerializerList
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

class CentrosSaludListView(generics.ListAPIView):
    queryset = Centrodesalud.objects.all()
    serializer_class = CentroSaludSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter  




@api_view(['GET'])
def buscar_padres(request):
    query = request.GET.get('query', '').strip()
    page = request.GET.get('page', 1)

    # Filtrar padres por query
    padres = User.objects.filter(role='padre', nombre__icontains=query)

    # Paginación
    paginator = Paginator(padres, 5)  # 5 resultados por página
    try:
        page_obj = paginator.page(page)
    except PageNotAnInteger:
        return JsonResponse({'error': 'El número de página debe ser un entero válido.'}, status=400)
    except EmptyPage:
        return JsonResponse({'error': 'El número de página excede el total de páginas disponibles.'}, status=404)

    # Construir respuesta
    data = [{'dni': padre.dni, 'nombre': padre.nombre} for padre in page_obj]
    return JsonResponse({
        'resultados': data,
        'total_resultados': paginator.count,
        'total_paginas': paginator.num_pages,
        'pagina_actual': page_obj.number
    })

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

from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from .models import Notificacion
from rest_framework.permissions import IsAuthenticated
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_notificaciones_pendientes(request):
    # Filtrar notificaciones pendientes para el usuario actual
    notificaciones = Notificacion.objects.filter(
        destinatario=request.user, estado='pendiente'
    ).values('id', 'mensaje', 'timestamp')  # Puedes incluir más campos según lo que necesites

    return JsonResponse({'notificaciones': list(notificaciones)})

from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Notificacion

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_detalle_notificacion(request, pk):
    try:
        # Buscar la notificación por id y asegurarse de que pertenece al usuario autenticado
        notificacion = Notificacion.objects.get(id=pk, destinatario=request.user)
        # Devolver los detalles de la notificación
        return JsonResponse({
            'id': notificacion.id,
            'mensaje': notificacion.mensaje,
            'timestamp': notificacion.timestamp,
            'estado': notificacion.estado,
            'remitente': notificacion.remitente.username if notificacion.remitente else None,
            'destinatario': notificacion.destinatario.username if notificacion.destinatario else None,
        })
    except Notificacion.DoesNotExist:
        # Manejar el caso de una notificación no encontrada o no autorizada
        return JsonResponse({'error': 'Notificación no encontrada o no autorizada'}, status=404)
    
from django.contrib.contenttypes.models import ContentType
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from api.models import User
from .models import Notificacion
from api.notificaciones.utils import actualizar_notificacion 
@api_view(['POST'])
@permission_classes([IsAuthenticated])

def procesar_notificacion(request, pk, accion):
    """
    Procesa una notificación para aceptarla o rechazarla.
    :param pk: ID de la notificación.
    :param accion: "aceptar" o "rechazar".
    """
    notificacion = get_object_or_404(Notificacion, pk=pk)

    # Verifica el tipo de objeto asociado
    content_type = notificacion.content_type
    objeto_asociado = notificacion.objeto_asociado  # Accede al objeto asociado

    try:
        if content_type.model == 'user':  # Si es una solicitud de activación de usuario
            usuario = get_object_or_404(User, username=notificacion.remitente.username)
            if accion == 'aceptar':
                usuario.is_active = True
                usuario.save()
                notificacion.estado = 'leida'
            elif accion == 'rechazar':  
                usuario.delete()
                actualizar_notificacion(notificacion.id, 'rechazada')                               
                # No guardar la notificación eliminada
                return JsonResponse({'success': True, 'message': f'Usuario {usuario} eliminado y notificación procesada'})
        
        elif content_type.model == 'objetivo':  # Si es una solicitud de agregar un objetivo
            if accion == 'aceptar':
                objeto_asociado.aprobado = True
                objeto_asociado.save()
                notificacion.estado = 'leida'
            elif accion == 'rechazar':
                objeto_asociado.delete()
                notificacion.estado = 'eliminada'

        elif content_type.model == 'comentario':  # Si es una solicitud de moderar un comentario
            if accion == 'aceptar':
                notificacion.estado = 'leida'
            elif accion == 'rechazar':
                objeto_asociado.delete()
                notificacion.estado = 'eliminada'

        else:
            return JsonResponse({'error': 'Tipo de objeto no soportado'}, status=400)

        notificacion.save()  # Guarda el estado de la notificación
        actualizar_notificacion(notificacion.id, notificacion.estado)
        return JsonResponse({'success': True, 'message': f'Notificación {accion}ada correctamente'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
from django.http import JsonResponse

def check_cookie(request):
    # Verificar si la cookie 'jwt' está presente
    if 'jwt' in request.COOKIES:
        return JsonResponse({"exists": True})
    return JsonResponse({"exists": False})






from rest_framework.permissions import IsAuthenticated
from .models import Comentario
class ComentariosPacienteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            # Verificar si el usuario tiene rol "paciente"
            user = User.objects.get(username=username, role='paciente')
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado o no es paciente'}, status=404)

        # Obtener todos los comentarios del usuario
        comentarios = Comentario.objects.filter(user=user).select_related('escena')

        # Agrupar comentarios por escena
        agrupados = {}
        for comentario in comentarios:
            escena_nombre = comentario.escena.nombre
            if escena_nombre not in agrupados:
                agrupados[escena_nombre] = []
            agrupados[escena_nombre].append({
                'id': comentario.id,
                'texto': comentario.texto,
                'visibilidad': comentario.visibilidad
            })

        # Crear estructura de respuesta
        respuesta = [{'escena': escena, 'comentarios': datos} for escena, datos in agrupados.items()]

        return Response(respuesta, status=200)

