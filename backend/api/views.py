from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import AccessToken
from django.http import HttpResponseRedirect
from .models import *
from .models import RegistroEvaluacion  # borrar 
from .serializers import *
from .forms import *
from rest_framework.views import APIView
from rest_framework import viewsets, status
from . import views
from datetime import datetime
from django.db import IntegrityError
from django.db.models import Q, Prefetch, Max, Avg
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from .models import Notificacion
from api.authentication import CookieJWTAuthentication
from django.db import transaction
from django.utils import timezone
from django.core.validators import validate_email
from django.core.mail import send_mail
from django.conf import settings
import google.generativeai as genai
import sys
import json
import requests
from rest_framework.exceptions import NotFound
from django.contrib.auth.tokens import default_token_generator
#User = get_user_model()  # Modelo de usuario creado por nosotros

from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from django_filters import rest_framework as filters
import json
from rest_framework.generics import UpdateAPIView
from django.views.decorators.csrf import csrf_exempt
from .authentication import CookieJWTAuthentication
#User = get_user_model()  # Modelo de usuario creado por nosotros


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json
from .models import Condicion, Objetivo  # Ensure you import Objetivo

from django.contrib.contenttypes.models import ContentType
from django.db.models import Subquery, OuterRef

@csrf_exempt
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_condition(request):
    if request.method == "POST":
        try:
            print("Raw request body:", request.body)
            # Parse JSON data from request body
            data = json.loads(request.body)
            print("Parsed data:", data)
            # Extract condition fields, allowing them to be None
            edad = data.get('edad', None)
            objetivo_id = data.get('objetivo', None)
            fecha = data.get('fecha', None)

            print(f"Extracted fields - edad: {edad}, objetivo_id: {objetivo_id}, fecha: {fecha}")
            # Convert fecha to datetime if provided
            if fecha:
                fecha = timezone.datetime.strptime(fecha, "%Y-%m-%d")

            # Fetch Objetivo instance if objetivo_id is provided
            objetivo = None
            if objetivo_id is not None:
                objetivo = Objetivo.objects.get(id=objetivo_id)

            # Create Condicion instance
            nueva_condicion = Condicion.objects.create(
                edad=edad,
                objetivo=objetivo,
                fecha=fecha
            )

            return JsonResponse({
                'id': nueva_condicion.id, 
                'success': True
            }, status=201)

        except Objetivo.DoesNotExist:
            return JsonResponse({"error": "Objetivo no encontrado"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)


class GetPacienteView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request):
        search_term = request.GET.get("dni_o_nombre", "").strip()

        if not search_term:
            return Response({"error": "Debe proporcionar un DNI o nombre para la búsqueda"}, status=400)

        # Filtrar por DNI o nombre
        pacientes = User.objects.filter(
            Q(dni__icontains=search_term) | Q(nombre__icontains=search_term),
            role="paciente"
        )

        if not pacientes.exists():
            return Response({"error": "No se encontraron pacientes"}, status=404)

        # Serializar la lista de pacientes
        serializer = PacienteSerializer(pacientes, many=True)
        return Response(serializer.data, status=200)

class UpdateGroupAssociationsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def put(self, request, group_id):
        print("Method:", request.method)
        print("Data:", request.data)
        
        try:
            data = request.data
            selected_therapists = data.get('therapists', [])
            selected_patients = data.get('patients', [])

            existing_associations = set(
                Personagrupo.objects.filter(grupo_id_id=group_id)
                .values_list('user_id_id', flat=True)
            )
            new_associations = set(selected_therapists + selected_patients)

            # Eliminar solo las asociaciones que ya no están en la lista
            to_delete = existing_associations - new_associations
            Personagrupo.objects.filter(
                grupo_id_id=group_id, 
                user_id_id__in=to_delete
            ).delete()

            # Crear solo las nuevas asociaciones
            for user_id in new_associations:
                Personagrupo.objects.get_or_create(
                    grupo_id_id=group_id, 
                    user_id_id=user_id
                )

            return Response({'message': 'Asociaciones actualizadas'})
            
        except Exception as e:
            print("Error:", str(e))
            return Response({'error': str(e)}, status=400)

    

@api_view(['DELETE'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_person_group(request, grupo_id, user_id):
    try:
        # Buscar la relación en la tabla Personagrupo
        relacion = Personagrupo.objects.get(grupo_id=grupo_id, user_id_id=user_id)
        relacion.delete()
        return Response({"message": "Relación eliminada correctamente."}, status=status.HTTP_200_OK)
    except Personagrupo.DoesNotExist:
        return Response({"error": "Relación no encontrada."}, status=status.HTTP_404_NOT_FOUND)



# Vista para obtener los centros de salud
@csrf_exempt
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def get_health_centers(request):
    centros = Centrodesalud.objects.all().values("id", "nombre", "direccion_id_dir")  
    return JsonResponse(list(centros), safe=False)






# Vista para crear un grupo
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def create_group(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            group_name = data.get("name")
            health_center_id = data.get("health_center_id")
            therapist_ids = data.get("therapist_ids", [])
            patient_ids = data.get("patient_ids", [])

            print("Datos recibidos:")
            print("group_name:", group_name)
            print("health_center_id:", health_center_id)
            print("therapist_ids:", therapist_ids)
            print("patient_ids:", patient_ids)

            # Crear el grupo
            centro = Centrodesalud.objects.get(id=health_center_id)
            grupo = Grupo.objects.create(nombre=group_name, centrodesalud_id=centro)

            # Asociar terapeutas y pacientes al grupo usando dni en lugar de id
            for therapist_id in therapist_ids:
                therapist = User.objects.get(dni=therapist_id)  # Cambiado de id a dni
                Personagrupo.objects.create(user_id=therapist, grupo_id=grupo)

            for patient_id in patient_ids:
                patient = User.objects.get(dni=patient_id)  # Cambiado de id a dni
                Personagrupo.objects.create(user_id=patient, grupo_id=grupo)

            return JsonResponse({"message": "Grupo creado exitosamente!"}, status=201)

        except Centrodesalud.DoesNotExist:
            return JsonResponse({"error": "Centro de salud no encontrado"}, status=404)
        except User.DoesNotExist:
            return JsonResponse({"error": "Usuario no encontrado"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)




@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class DynamicPagination(PageNumberPagination):
    page_size_query_param = "limit"
    max_page_size = 20
    page_size = 8

@csrf_exempt  # Asegúrate de no tener problemas con CSRF
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def create_health_center(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            nombre = data.get("nombre", "").strip()
            provincia = data.get("provincia", "").strip()
            ciudad = data.get("ciudad", "").strip()
            calle = data.get("calle", "").strip()
            numero = data.get("numero", "").strip()

            # Validaciones más estrictas
            errors = []
            if not nombre:
                errors.append("El nombre del centro es obligatorio")
            if not provincia:
                errors.append("La provincia es obligatoria")
            if not ciudad:
                errors.append("La ciudad es obligatoria")
            if not calle:
                errors.append("La calle es obligatoria")
            if not numero:
                errors.append("El número es obligatorio")
            
            if errors:
                return JsonResponse({"errors": errors}, status=400)

            # Usar transacción para garantizar atomicidad
            with transaction.atomic():
                # Verificar si ya existe una residencia idéntica
                residencia, created = Residencia.objects.get_or_create(
                    provincia=provincia,
                    ciudad=ciudad,
                    calle=calle,
                    numero=numero
                )

                # Verificar si ya existe un centro de salud con los mismos datos
                centro_existente = Centrodesalud.objects.filter(
                    nombre=nombre,
                    direccion_id_dir=residencia
                ).exists()

                if centro_existente:
                    return JsonResponse({
                        'message': 'Un centro de salud con estos datos ya existe'
                    }, status=400)

                # Crear nuevo centro de salud
                centro_de_salud = Centrodesalud.objects.create(
                    nombre=nombre,
                    direccion_id_dir=residencia
                )

            return JsonResponse({
                'message': 'Centro de salud creado con éxito', 
                'id': centro_de_salud.id
            }, status=201)

        except Exception as e:
            return JsonResponse({
                'message': 'Error interno del servidor',
                'error_details': str(e)
            }, status=500)

    return JsonResponse({'message': 'Método no permitido'}, status=405)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def delete_health_center(request, center_id):
    try:
        center = Centrodesalud.objects.get(id=center_id)
        center.delete()
        return Response({"message": "Centro de salud eliminado correctamente."}, status=status.HTTP_200_OK)
    except Centrodesalud.DoesNotExist:
        return Response({"error": "Centro de salud no encontrado."}, status=status.HTTP_404_NOT_FOUND)

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def listar_centros_de_salud(request):
    """
    Retorna una lista de todos los centros de salud disponibles.
    """
    centros = Centrodesalud.objects.all().values('id', 'nombre', 'direccion_id_dir__provincia', 'direccion_id_dir__ciudad', 'direccion_id_dir__calle', 'direccion_id_dir__numero')
    centros_list = list(centros)
    return JsonResponse(centros_list, safe=False)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
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

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def example_view(request):
    return JsonResponse({'message': 'Hello, world!'})

from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import UserSerializer
from .models import User

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
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
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def logout(request):
    response = Response({"message": "Logout successful"})
    # Borrar la cookie JWT
    response.delete_cookie('jwt')
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
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

class UnassignPathologyView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def delete(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        patologia_id = request.data.get('patologia_id')
        
        if not user_id or not patologia_id:
            return Response({"error": "Se requieren user_id y patologia_id"}, status=status.HTTP_400_BAD_REQUEST)
        
        patologia = get_object_or_404(PersonaPatologia, user_id=user_id, patologia_id=patologia_id)
        patologia.delete()
        
        return Response({"message": "Patología desasignada correctamente"}, status=status.HTTP_200_OK)


class AssignPathologyView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')
        patologia_id = request.data.get('patologia_id')

        if not user_id or not patologia_id:
            return Response({'error': 'Faltan datos requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(dni=user_id)
            patologia = Patologia.objects.get(id=patologia_id)
            
            persona_patologia, created = PersonaPatologia.objects.update_or_create(
                user_id=user,
                patologia_id=patologia,
            )
            
            return Response({'message': 'Patología asignada correctamente'}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Patologia.DoesNotExist:
            return Response({'error': 'Patología no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

class CargarPersonaObjetivoEvaluacion(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request):
        """
        Carga datos en la tabla PersonaObjetivoEvaluacion a partir de un JSON enviado en la solicitud.
        """
        data = request.data
        try:
            # Extraer los datos del JSON
            user_id = data.get('user_id')
            objetivo_id = data.get('objetivo_id')
            resultado = data.get('resultado', None)
            progreso = data.get('progreso')
            evaluacion_id = data.get('evaluacion_id', None)
            # Validar que los campos requeridos estén presentes
            if not user_id or not objetivo_id or progreso is None:
                return Response(
                    {'error': 'Faltan datos requeridos: user_id, objetivo_id o progreso.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Obtener las instancias relacionadas
            try:
                user = User.objects.get(dni=user_id)
                objetivo = Objetivo.objects.get(id=objetivo_id)
                evaluacion = Formulario.objects.get(id=evaluacion_id) if evaluacion_id else None
            except User.DoesNotExist:
                return Response({'error': 'El usuario especificado no existe.'}, status=status.HTTP_404_NOT_FOUND)
            except Objetivo.DoesNotExist:
                return Response({'error': 'El objetivo especificado no existe.'}, status=status.HTTP_404_NOT_FOUND)
            except Formulario.DoesNotExist:
                return Response({'error': 'El formulario especificado no existe.'}, status=status.HTTP_404_NOT_FOUND)
            # Crear el registro en la tabla PersonaObjetivoEvaluacion
            persona_objetivo_evaluacion = PersonaObjetivoEvaluacion.objects.create(
                user_id=user,
                objetivo_id=objetivo,
                resultado=resultado,
                progreso=progreso,
                evaluacion=evaluacion
            )
            return Response(
                {'message': 'Registro creado exitosamente.', 'id': persona_objetivo_evaluacion.id},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': 'Ocurrió un error al crear el registro.', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def objetivos_list(request):
    objetivos = Objetivo.objects.all().values()  # Obtiene todos los objetivos 
    return JsonResponse(list(objetivos), safe=False)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def patologias_list(request):
    patologias = Patologia.objects.all().values()  # Obtiene todos los objetivos 
    return JsonResponse(list(patologias), safe=False)

class ObjetivoListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = ObjetivoSerializer
    pagination_class = DynamicPagination
    def get_queryset(self):
        username = self.request.query_params.get('username')
        if not username:
            return Objetivo.objects.none()
        
        try:
            dni = obtener_dni(username)
        except User.DoesNotExist:

            return Objetivo.objects.none()
        
        objetivos_ids = PersonaObjetivoEscena.objects.filter(
            user_id=dni
        ).values_list(
            'escena_objetivo__objetivo', 
            flat=True
        ).distinct()

        # Optimizamos con select_related para traer la relación escena
        return Objetivo.objects.filter(
            id__in=objetivos_ids, habilitada=True
        ).select_related('escena').prefetch_related(
            Prefetch(
                'escenaobjetivo_set',
                queryset=EscenaObjetivo.objects.prefetch_related(
                    Prefetch(
                        'objetivo_relations',
                        queryset=PersonaObjetivoEscena.objects.filter(user_id=dni),
                        to_attr='user_poe'
                    )
                )
            )
        )

    def list(self, request, *args, **kwargs):
        username = request.query_params.get('username')

        if not username:
            return Response(
                {"error": "El parámetro 'username' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            dni = obtener_dni(username)
        except User.DoesNotExist:
            return Response(
                {"error": f"Usuario '{username}' no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        

        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
'''
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def obj_list_user(request, user_id):
    objetivos = PersonaObjetivoEscena.objects.filter(user_id=user_id).values()  # Obtiene los objetivos del usuario
    return JsonResponse(list(objetivos), safe=False)
    ## CHEQUEAR ESTE BIEN
'''

##ESTE SE REEMPLAZO POR EL DE ABAJO
# class ObjetivosUsuarioListView(generics.ListAPIView):
#     """
#     Vista para listar los objetivos de un usuario específico
#     con paginación dinámica.
#     """
#     serializer_class = ObjetivoSerializerList
#     pagination_class = DynamicPagination
#     # permission_classes = [IsAuthenticated]
#     filter_backends = [DjangoFilterBackend]

#     def get_queryset(self):
#         # Obtén el username del request
#         username = self.request.GET.get('username', None)
#         if not username:
#             return Objetivo.objects.none()  # Devuelve un queryset vacío si no hay username

#         # Filtra el usuario por username
#         try:
#             usuario = User.objects.get(username=username)
#         except User.DoesNotExist:
#             return Objetivo.objects.none()

#         # Paso 1: Filtrar PersonaObjetivoEscena para este usuario
#         persona_escena_objetivos = PersonaObjetivoEscena.objects.filter(user_id=usuario)

#         # Paso 2: Obtener los EscenaObjetivo asociados
#         escena_objetivos = EscenaObjetivo.objects.filter(
#             id__in=persona_escena_objetivos.values_list('escena_objetivo_id', flat=True)
#         )

#         # Paso 3: Filtrar Objetivos asociados a esas escenas
#         return Objetivo.objects.filter(
#             id__in=escena_objetivos.values_list('objetivo_id', flat=True)
#         )

#     def list(self, request, *args, **kwargs):
#         """
#         Personaliza la respuesta para formatear los resultados
#         con el formato deseado (id, titulo, descripcion).
#         """
#         queryset = self.get_queryset()
#         page = self.paginate_queryset(queryset)
#         if page is not None:
#             serializer = self.get_serializer(page, many=True)
#             # Personalizar los datos para devolver 'titulo' en lugar de 'nombre'
#             data = [{'id': item['id'], 'titulo': item['nombre'], 'descripcion': item['descripcion']} for item in serializer.data]
#             return self.get_paginated_response(data)

#         serializer = self.get_serializer(queryset, many=True)
#         data = [{'id': item['id'], 'titulo': item['nombre'], 'descripcion': item['descripcion']} for item in serializer.data]
#         return Response(data)
'''
class EscenasPorObjetivoView(generics.ListAPIView):
    serializer_class = EscenaSerializer
    pagination_class = DynamicPagination
    
    def get_queryset(self):
        objetivo_id = self.request.GET.get('objetivo_id')
        username = self.request.GET.get('username')
        
        if not objetivo_id or not username:
            return Escena.objects.none()
        
        try:
            dni = obtener_dni(username)
        except User.DoesNotExist:
            return Escena.objects.none()
        
        # Obtener escenas del objetivo
        escenas_objetivo = Escena.objects.filter(
            escenaobjetivo__objetivo=objetivo_id
        ).prefetch_related(
            Prefetch(
                'escenaobjetivo_set',
                queryset=EscenaObjetivo.objects.select_related('objetivo').prefetch_related(
                    Prefetch(
                        'objetivo_relations',
                        queryset=PersonaObjetivoEscena.objects.filter(user_id=dni),
                        to_attr='user_poe'
                    )
                )
            )
        )
        return escenas_objetivo

    def list(self, request, *args, **kwargs):
        objetivo_id = request.GET.get('objetivo_id')
        username = request.GET.get('username')
        
        # Validaciones
        if not objetivo_id:
            return Response(
                {"error": "El parámetro 'objetivo_id' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not username:
            return Response(
                {"error": "El parámetro 'username' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            dni = obtener_dni(username)
        except User.DoesNotExist:
            return Response(
                {"error": f"Usuario '{username}' no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Obtener escenas vistas por el usuario
        user_vistos_ids = set(
            Videosvistos.objects.filter(paciente_id__dni=dni)
            .values_list('escena_id', flat=True)
        )
        
        # Procesamiento del queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            serialized_data = serializer.data
            
            required_escena_ids = set()
            escena_info = {}

            for escena, data_item in zip(page, serialized_data):
                bloqueada = False
                required_id = None
                
                for eo in escena.escenaobjetivo_set.all():
                    user_poe = [poe for poe in eo.user_poe if poe.user_id.dni == dni]
                    current_order = user_poe[0].orden if user_poe else None
                    
                    if not current_order or current_order == 1:
                        continue
                    
                    # Obtener prerequisitos dentro del mismo objetivo
                    prereqs = [
                        poe.escena_objetivo.escena_id
                        for poe in PersonaObjetivoEscena.objects.filter(
                            user_id=dni,
                            escena_objetivo__objetivo=objetivo_id,
                            orden__lt=current_order
                        )
                    ]
                    
                    # Verificar escenas previas
                    for prereq_id in prereqs:
                        if prereq_id not in user_vistos_ids:
                            bloqueada = True
                            required_id = prereq_id
                            required_escena_ids.add(prereq_id)
                            break
                    if bloqueada:
                        break
                
                data_item['bloqueada'] = bloqueada
                escena_info[escena.id] = {'required_id': required_id}

            # Obtener nombres de escenas requeridas
            escenas_requeridas = Escena.objects.filter(
                id__in=required_escena_ids
            ).values('id', 'nombre')
            
            nombre_map = {e['id']: e['nombre'] for e in escenas_requeridas}

            # Agregar mensajes de bloqueo
            for data_item in serialized_data:
                escena_id = data_item['id']
                required_id = escena_info[escena_id]['required_id']
                
                if data_item['bloqueada'] and required_id:
                    data_item['mensaje_bloqueo'] = f"Completa: '{nombre_map.get(required_id, 'Escena previa')}' para desbloquear"
                else:
                    data_item['mensaje_bloqueo'] = None

            return self.get_paginated_response(serialized_data)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
'''
class EscenasPorObjetivoView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = EscenaSerializer
    pagination_class = None  # Eliminar la paginación
    def get_queryset(self):
        objetivo_id = self.request.GET.get('objetivo_id')
        username = self.request.GET.get('username')
        
        if not objetivo_id or not username:
            return Escena.objects.none()
        
        try:
            dni = obtener_dni(username)
        except User.DoesNotExist:
            return Escena.objects.none()
        
        return Escena.objects.filter(
            escenaobjetivo__objetivo=objetivo_id, habilitada=True
        ).distinct().prefetch_related(
            Prefetch(
                'escenaobjetivo_set',
                queryset=EscenaObjetivo.objects.prefetch_related(
                    Prefetch(
                        'objetivo_relations',
                        queryset=PersonaObjetivoEscena.objects.filter(user_id=dni),
                        to_attr='user_poe'
                    )
                )
            )
        )

    def list(self, request, *args, **kwargs):
        objetivo_id = request.GET.get('objetivo_id')
        username = request.GET.get('username')
        
        # Validaciones (mantenemos las mismas)
        if not objetivo_id:
            return Response(
                {"error": "El parámetro 'objetivo_id' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not username:
            return Response(
                {"error": "El parámetro 'username' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            dni = obtener_dni(username)
        except User.DoesNotExist:
            return Response(
                {"error": f"Usuario '{username}' no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        

        user_vistos_ids = set(
            Videosvistos.objects.filter(paciente_id__dni=dni)
            .values_list('escena_id', flat=True)
        )
        

        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        serialized_data = serializer.data
        
        required_escena_ids = set()
        escena_info = {}

        # Procesar todas las escenas directamente
        for escena, data_item in zip(queryset, serialized_data):
            bloqueada = False
            required_id = None
            
            for eo in escena.escenaobjetivo_set.all():
                user_poe = [poe for poe in eo.user_poe if poe.user_id.dni == dni]
                current_order = user_poe[0].orden if user_poe else None
                
                if current_order is None:
                    continue
                    
                if current_order == 1:
                    continue
                
                prereqs = [
                    poe.escena_objetivo.escena_id
                    for poe in PersonaObjetivoEscena.objects.filter(
                        user_id=dni,
                        escena_objetivo__objetivo=objetivo_id,
                        orden__lt=current_order
                    )
                ]
                
                for prereq_id in prereqs:
                    if prereq_id not in user_vistos_ids:
                        bloqueada = True
                        required_id = prereq_id
                        required_escena_ids.add(prereq_id)
                        break
                if bloqueada:
                    break
            
            data_item['bloqueada'] = bloqueada
            escena_info[escena.id] = {'required_id': required_id}

        escenas_requeridas = Escena.objects.filter(
            id__in=required_escena_ids
        ).values('id', 'nombre')
        
        nombre_map = {e['id']: e['nombre'] for e in escenas_requeridas}

        for data_item in serialized_data:
            escena_id = data_item['id']
            required_id = escena_info.get(escena_id, {}).get('required_id')
            
            if data_item['bloqueada'] and required_id:
                data_item['mensaje_bloqueo'] = f"Completa: '{nombre_map.get(required_id, 'Escena previa')}' para desbloquear"
            else:
                data_item['mensaje_bloqueo'] = None

        return Response(serialized_data)  # Devolver respuesta simple sin paginación


class VerificarEscenaAsignadaView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    """
    Verifica si un usuario tiene asignada una escena por algún objetivo.
    """

    def get(self, request):
        
        user_id = request.GET.get('user_id')
        user_id = obtener_dni(user_id)
        escena_id = request.GET.get('escena_id')

        # Validar que los parámetros sean proporcionados
        if not user_id or not escena_id:
            return Response(
                {"asignada": False, "objetivo_id": None, "error": "Se requieren 'user_id' y 'escena_id'."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Buscar si la escena está asignada a un usuario por algún objetivo
        persona_escena = PersonaObjetivoEscena.objects.filter(
            user_id=user_id,
            escena_objetivo__escena_id=escena_id
        ).select_related('escena_objetivo').first()

        return Response({
            "asignada": bool(persona_escena),
            "objetivo_id": persona_escena.escena_objetivo.objetivo.id if persona_escena else None
        }, status=status.HTTP_200_OK)


import logging

logger = logging.getLogger(__name__)

#devuelve escenas del sistema
class EscenaView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = Escena.objects.filter(habilitada=True).prefetch_related(
        Prefetch(
            'escenaobjetivo_set',
            queryset=EscenaObjetivo.objects.select_related('objetivo').prefetch_related(
                Prefetch(
                    'objetivo_relations',  # Usamos el related_name correcto
                    queryset=PersonaObjetivoEscena.objects.select_related('user_id'),  # ¡Importante!
                    to_attr='user_poe'  # Almacenamos las relaciones en este atributo
                )
            )
        )
    )
    serializer_class = EscenaSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Obtener el username del query parameter
        username = request.query_params.get('username', None)
        if not username:
            return Response(
                {"error": "El parámetro 'username' es requerido."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener el DNI del usuario usando el método obtener_dni
        try:
            dni = obtener_dni(username)
        except User.DoesNotExist:
            return Response(
                {"error": f"Usuario '{username}' no encontrado."},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener escenas vistas por el usuario usando el DNI
        user_vistos_ids = set(
            Videosvistos.objects.filter(paciente_id__dni=dni)
            .values_list('escena_id', flat=True)
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            serialized_data = serializer.data
            
            # Recolectar IDs de escenas requeridas
            required_escena_ids = set()
            escena_info = {}

            for escena, data_item in zip(page, serialized_data):
                bloqueada = False
                required_id = None
                
                # Dentro del loop de escena.escenaobjetivo_set.all():
                for eo in escena.escenaobjetivo_set.all():
                    # Filtrar relaciones del usuario para este ESCENA_OBJETIVO específico
                    user_poe = [poe for poe in eo.user_poe if poe.user_id.dni == dni]
                    
                    # Obtener el orden del usuario para este ESCENA_OBJETIVO
                    current_order = user_poe[0].orden if user_poe else None
                    
                    if not current_order or current_order == 1:
                        continue
                    
                    # Obtener requisitos previos: ESCENAS del mismo OBJETIVO con orden < current_order
                    prereqs = [
                        poe.escena_objetivo.escena_id
                        for poe in PersonaObjetivoEscena.objects.filter(
                            user_id__dni=dni,
                            escena_objetivo__objetivo=eo.objetivo,  # Mismo objetivo que la escena actual
                            orden__lt=current_order
                        )
                    ]
                    
                    # Verificar requisitos
                    for prereq_id in prereqs:
                        if prereq_id not in user_vistos_ids:
                            bloqueada = True
                            required_id = prereq_id
                            required_escena_ids.add(prereq_id)
                            break
                    if bloqueada:
                        break
                
                data_item['bloqueada'] = bloqueada
                escena_info[escena.id] = {'required_id': required_id}

            # Obtener nombres de las escenas requeridas
            escenas_requeridas = Escena.objects.filter(
                id__in=required_escena_ids
            ).values('id', 'nombre')
            
            nombre_map = {e['id']: e['nombre'] for e in escenas_requeridas}

            # Agregar mensajes al response
            for data_item in serialized_data:
                escena_id = data_item['id']
                required_id = escena_info[escena_id]['required_id']
                
                if data_item['bloqueada'] and required_id:
                    data_item['mensaje_bloqueo'] = f"Ver video: '{nombre_map.get(required_id, 'Escena previa')}' para desbloquear."
                else:
                    data_item['mensaje_bloqueo'] = None

            return self.get_paginated_response(serialized_data)


class VerificarCondicionesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        username = request.query_params.get('username')
        escena_id = request.query_params.get('escena_id')

        if not username or not escena_id:
            return Response({'error': 'Username y escena_id son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            dni = obtener_dni(username)
            try:
                user = User.objects.get(dni=dni)
            except User.DoesNotExist:
                return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
            try:
                escena = Escena.objects.get(id=escena_id)
            except Escena.DoesNotExist:
                return Response({'error': 'Escena no encontrada'}, status=status.HTTP_404_NOT_FOUND)
            
            condicion = escena.condicion if hasattr(escena, 'condicion') else None

            if not condicion:
                return Response({
                    'cumple_condiciones': {
                        'edad': True,
                        'fecha': True,
                        'objetivo': True
                    }
                }, status=status.HTTP_200_OK)

            # Verificación de edad
            cumple_edad = True
            if condicion.edad and user.fecha_nac:
                today = timezone.now()
                age = today.year - user.fecha_nac.year - ((today.month, today.day) < (user.fecha_nac.month, user.fecha_nac.day))
                cumple_edad = age >= condicion.edad

            # Verificación de fecha
            cumple_fecha = condicion.fecha is None or timezone.now().date() >= condicion.fecha.date()

            # Verificación de objetivo
            cumple_objetivo = condicion.objetivo_id is None or PersonaObjetivoEvaluacion.objects.filter(
                user_id=user, 
                objetivo_id=condicion.objetivo_id, 
                progreso=100
            ).exists()
            

            # Generar mensaje de bloqueo
            mensajes = []
            if not cumple_edad:
                mensajes.append("No cumple el requisito de edad")
            if not cumple_fecha:
                mensajes.append("No cumple el requisito de fecha")
            if not cumple_objetivo:
                mensajes.append("No cumple el requisito de objetivo")
            
            mensaje_bloqueo = ". ".join(mensajes) if mensajes else None

            return Response({
                'cumple_condiciones': {
                    'edad': cumple_edad,
                    'fecha': cumple_fecha,
                    'objetivo': cumple_objetivo
                },
                'mensaje_bloqueo': mensaje_bloqueo
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            serialized_data = []
            required_escena_ids = set()
            escena_info = {}


class EscenaFilter(filters.FilterSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    query = filters.CharFilter(field_name='nombre', lookup_expr='icontains')
    
    class Meta:
        model = Escena
        fields = ['query']


class EscenaBusquedaView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = EscenaSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = EscenaFilter  
    pagination_class = None

    def get_queryset(self):
        queryset = Escena.objects.filter(habilitada=True).prefetch_related(
            Prefetch(
                'escenaobjetivo_set',
                queryset=EscenaObjetivo.objects.select_related('objetivo').prefetch_related(
                    Prefetch(
                        'objetivo_relations',
                        queryset=PersonaObjetivoEscena.objects.select_related('user_id'),
                        to_attr='user_poe'
                    )
                )
            )
        )
        query = self.request.query_params.get('query', None)
        if query:
            queryset = queryset.filter(
                nombre__icontains=query  # Filtra por nombre
            ) | queryset.filter(
                descripcion__icontains=query  # Filtra por descripción
            )

        return queryset

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            username = request.query_params.get('username', None)

            if not username:
                return Response({"error": "El parámetro 'username' es requerido."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                dni = obtener_dni(username)
            except User.DoesNotExist:
                return Response({"error": f"Usuario '{username}' no encontrado."}, status=status.HTTP_404_NOT_FOUND)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            user_vistos_ids = set(
                Videosvistos.objects.filter(paciente_id__dni=dni)
                .values_list('escena_id', flat=True)
            )

            serialized_data = []
            required_escena_ids = set()
            escena_info = {}

            for escena in queryset:
                bloqueada = False
                required_id = None

                try:
                    # Dentro del loop de escena.escenaobjetivo_set.all():
                    for eo in escena.escenaobjetivo_set.all():
                        # Filtrar relaciones del usuario para este ESCENA_OBJETIVO específico
                        user_poe = [poe for poe in eo.user_poe if poe.user_id.dni == dni]
                        
                        # Obtener el orden del usuario para este ESCENA_OBJETIVO
                        current_order = user_poe[0].orden if user_poe else None
                        
                        if not current_order or current_order == 1:
                            continue
                        
                        # Obtener requisitos previos: ESCENAS del mismo OBJETIVO con orden < current_order
                        prereqs = [
                            poe.escena_objetivo.escena_id
                            for poe in PersonaObjetivoEscena.objects.filter(
                                user_id__dni=dni,
                                escena_objetivo__objetivo=eo.objetivo,  # Mismo objetivo que la escena actual
                                orden__lt=current_order
                            )
                        ]
                        
                        # Verificar requisitos
                        for prereq_id in prereqs:
                            if prereq_id not in user_vistos_ids:
                                bloqueada = True
                                required_id = prereq_id
                                required_escena_ids.add(prereq_id)
                                break
                        if bloqueada:
                            break
                

                except Exception as e:
                    return Response({
                        "error": "Error en la evaluación de prerequisitos.",
                        "detalle": str(e),
                        "escena_id": escena.id
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                escena_info[escena.id] = {'required_id': required_id}
                data_item = self.get_serializer(escena).data
                data_item['bloqueada'] = bloqueada
                serialized_data.append(data_item)

            escenas_requeridas = Escena.objects.filter(id__in=required_escena_ids).values('id', 'nombre')
            nombre_map = {e['id']: e['nombre'] for e in escenas_requeridas}

            for data_item in serialized_data:
                escena_id = data_item['id']
                required_id = escena_info[escena_id]['required_id']
                data_item['mensaje_bloqueo'] = f"Ver video: '{nombre_map.get(required_id, 'Escena previa')}' para desbloquear." if data_item['bloqueada'] else None

            return Response(serialized_data)

        except Exception as e:
            return Response({
                "error": "Error interno del servidor.",
                "detalle": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class EscenasPorObjetivoListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = EscenaSerializer
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        # Obtén el ID del objetivo y el usuario de la request
        objetivo_id = self.request.GET.get('objetivo_id', None)
        username = self.request.query_params.get('username', None)

        if not objetivo_id:
            return Escena.objects.none()  # Devuelve un queryset vacío si no hay objetivo_id

        # Filtra las relaciones por el ID del objetivo
        relaciones = EscenaObjetivo.objects.filter(objetivo=objetivo_id, escena__habilitada=True)

        # Obtén las escenas asociadas al objetivo (TODAS)
        escenas_objetivo = Escena.objects.filter(
            id__in=relaciones.values_list('escena', flat=True)
        )

        return escenas_objetivo
    
class GetEscenaView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = EscenaSerializer

    def get(self, request):
        # Obtén el ID de la escena del request
        escena_id = request.GET.get('escena_id', None)

        if not escena_id:
            return JsonResponse({"error": "El parámetro 'escena_id' es requerido."}, status=400)

        try:
            # Busca la escena por su ID
            escena = Escena.objects.get(id=escena_id)
        except Escena.DoesNotExist:
            return JsonResponse({"error": "Escena no encontrada."}, status=404)

        # Serializa la escena y retorna la respuesta
        serializer = self.serializer_class(escena)
        return JsonResponse(serializer.data, safe=False)


class PacienteListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        query = request.query_params.get('query', '').lower()  # Parámetro de búsqueda
        pacientes = User.objects.filter(role='paciente')

        if query:
            pacientes = pacientes.filter(
                models.Q(nombre__icontains=query) |
                models.Q(dni__icontains=query) |
                models.Q(genero__icontains=query)
            ).distinct()  # Evitar duplicados
        serializer = PacienteSerializer(pacientes, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


from django.http import JsonResponse
from django.views import View
from django.core.exceptions import ObjectDoesNotExist
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

class ObjetivosListCentro(View):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, *args, **kwargs):
        username = request.GET.get('username')
        center_name = request.GET.get('centername')

        if not username or not center_name:
            return JsonResponse({"error": "Se requieren los parámetros 'username' y 'centername'."}, status=400)

        try:
            user = User.objects.get(username=username)
            center = Centrodesalud.objects.get(nombre=center_name)
            center_professional = CentroProfesional.objects.get(centrodesalud=center, profesional=user)
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Usuario, centro o relación no encontrados."}, status=404)

        objetivos = Objetivo.objects.filter(centro_profesional=center_professional, habilitada=True).values()
        return JsonResponse(list(objetivos), safe=False)



    


@permission_classes([IsAuthenticated])
class ResolveNamesToIds(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request):
        center_name = request.data.get('center_name')
        username = request.data.get('username')
        
        center = get_object_or_404(Centrodesalud, nombre=center_name)
        user = get_object_or_404(User, username=username)
        center_professional = CentroProfesional.objects.get(centrodesalud=center, profesional=user)
        return Response({
            'center_professional': center_professional.id
        }) 
    


@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class ObjetivoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def create(self, request):
        try:
            user = get_object_or_404(User, username=request.user)
            # Serializar los datos
            serializer = ObjetivoSerializer(data=request.data)
            if serializer.is_valid():
                objetivo = serializer.save()
                 # Crear notificación para el admin
                admin = User.objects.filter(role='admin').first()
                if admin:
                    content_type = ContentType.objects.get_for_model(objetivo)
                    print("Content_Type:    ",content_type)
                    notificacion = Notificacion.objects.create(
                        destinatario=admin,
                        remitente=user,
                        mensaje=f"El usuario {user.username} creó el objetivo '{objetivo.nombre}' Revisar.",
                        estado='pendiente',
                        content_type=content_type,
                        object_id=objetivo.id,
                    )
                    enviar_notificacion_admin(notificacion)                
                return Response({
                    'message': 'Objetivo creado con éxito',
                    'objetivo': serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def update(self, request, pk=None):
        try:
            # Obtener el objetivo que se desea actualizar
            objetivo = Objetivo.objects.get(pk=pk)
        except Objetivo.DoesNotExist:
            return Response({'error': 'Objetivo no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Serializar los datos
        serializer = ObjetivoSerializer(objetivo, data=request.data, partial=False)  # `partial=False` porque es un PUT
        if serializer.is_valid():
            objetivo = serializer.save()
            return Response({
                'message': 'Objetivo actualizado con éxito',
                'objetivo': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EscenaUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = Escena.objects.filter(habilitada=True)  # Solo escenas habilitadas
    serializer_class = EscenaSerializer
    
class GetPatientsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = User.objects.filter(role='paciente')
    serializer_class = PacienteSerializer


class GrupoUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = Grupo.objects.all()
    serializer_class = GrupoSerializer

    def update(self, request, *args, **kwargs):
        # Get the Grupo instance to update
        instance = self.get_object()
        grupo_id = instance.id


        # Delete only the patients from the group, not the therapists
        Personagrupo.objects.filter(grupo_id=grupo_id).delete()

        # Handle the new patients
        pacientes = request.data.get('pacientes', [])
        for paciente_id in pacientes:
            try:
                user = User.objects.get(dni=paciente_id)
                # Only add if they're actually a patient
                if user.role == 'paciente':
                    Personagrupo.objects.create(
                        user_id=user,
                        grupo_id=instance
                    )
            except User.DoesNotExist:
                return Response(
                    {"error": f"User with DNI {paciente_id} does not exist."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Add any new therapists from the request
        new_terapeutas = request.data.get('terapeutas', [])
        for terapeuta_id in new_terapeutas:
            try:
                user = User.objects.get(dni=terapeuta_id)
                # Only add if they're actually a therapist
                if user.role == 'terapeuta':
                    Personagrupo.objects.create(
                        user_id=user,
                        grupo_id=instance
                    )
            except User.DoesNotExist:
                return Response(
                    {"error": f"Therapist with DNI {terapeuta_id} does not exist."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Prepare response data
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        response_data = dict(serializer.data)

        response_data["terapeutas"] = [
            {
                "id": terapeuta.dni,
                "nombre": terapeuta.nombre,
                "dni": terapeuta.dni
            }
            for terapeuta in User.objects.filter(
                personagrupos__grupo_id=instance,
                role='terapeuta'
            )
        ]
        response_data["pacientes"] = [
            {
                "id": paciente.dni,
                "nombre": paciente.nombre,
                "dni": paciente.dni
            }
            for paciente in User.objects.filter(
                personagrupos__grupo_id=instance,
                role='paciente'
            )
        ]

        return Response(response_data, status=status.HTTP_200_OK)

from django.contrib.contenttypes.models import ContentType
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def get_goal_data(request, objetivo_id):
    try:
        # Obtener el objetivo principal usando get_object_or_404 para manejar la excepción
        objetivo = get_object_or_404(Objetivo, pk=objetivo_id)
        
        # Serializar el objetivo para obtener todos los campos del serializer
        serializer = ObjetivoSerializer(objetivo)
        serialized_objetivo = serializer.data

        # Obtener las escenas relacionadas a través de EscenaObjetivo
        escenas_relacionadas = [
            {
                "id": relacion.escena.id,
                "nombre": relacion.escena.nombre,
                "idioma": relacion.escena.idioma,
                "acento": relacion.escena.acento,
                "complejidad": relacion.escena.complejidad,
                "link": relacion.escena.link,
            }
            for relacion in EscenaObjetivo.objects.filter(objetivo=objetivo, escena__habilitada=True)
        ]

        # Añadir las escenas relacionadas al diccionario serializado
        serialized_objetivo['escenas_relacionadas'] = escenas_relacionadas

        # Si necesitas una escena explicativa específica, añádela aquí, aunque ya está en video_explicativo_id
        # Puedes omitirla si ya está representada por video_explicativo_id en el serializer

        return Response(serialized_objetivo, status=200)
    except Objetivo.DoesNotExist:
        return Response({"error": "Objetivo no encontrado"}, status=404)

        


class retrieve_user(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request):
        username = request.query_params.get('username', '').strip()

        # Validar que el parámetro 'username' está presente
        if not username:
            return Response(
                {"error": "El parámetro 'username' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener el usuario con el username proporcionado
        user = get_object_or_404(User, username=username)

        # Serializar los datos del usuario
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class update_user(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def put(self, request):
        try:
            # Validar que todos los campos obligatorios estén presentes
            required_fields = ['dni', 'nombre', 'fecha_nac', 'genero', 'role', 'residencia']

            missing_fields = [field for field in required_fields if field not in request.data]
            if missing_fields:
                return Response(
                    {"error": f"Faltan los siguientes campos: {', '.join(missing_fields)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Obtener datos de la dirección
            direccion = request.data.get('residencia', {})
            id_dir = direccion.get('id_dir')
            provincia = direccion.get('provincia')
            ciudad = direccion.get('ciudad')
            calle = direccion.get('calle')
            numero = direccion.get('numero')

            # Obtener datos del request
            dni = request.data.get('dni')
            nombre = request.data.get('nombre')
            fecha_nac = request.data.get('fecha_nac')
            genero = request.data.get('genero')
            role = request.data.get('role')
            padre_id = request.data.get('padreACargo', None)  # Obtener el DNI del padre

            # Buscar el usuario por DNI
            try:
                user = User.objects.get(dni=dni)
            except User.DoesNotExist:
                return Response(
                    {"error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Validar género
            if genero not in ['M', 'F']:
                return Response(
                    {"error": "El género debe ser 'M' o 'F'"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validar rol
            if role not in [choice[0] for choice in User.ROLE_CHOICES]:
                return Response(
                    {"error": f"El rol debe ser uno de los siguientes: {[choice[0] for choice in User.ROLE_CHOICES]}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Buscar al padre (si se proporcionó un DNI válido)
            if padre_id:
                try:
                    padre = User.objects.get(dni=padre_id)  # Buscar al padre por DNI
                    user.user_id_padre = padre  # Asignar el padre al usuario
                except User.DoesNotExist:
                    return Response(
                        {"error": f"No se encontró un usuario con el DNI '{padre_id}'"},
                        status=status.HTTP_404_NOT_FOUND
                    )

            # Actualizar la residencia (dirección) dentro de una transacción
            with transaction.atomic():
                # Actualizar la residencia
                try:
                    residencia = Residencia.objects.get(id_dir=id_dir)
                    residencia.provincia = provincia
                    residencia.ciudad = ciudad
                    residencia.calle = calle
                    residencia.numero = numero
                    residencia.save()
                except Residencia.DoesNotExist:
                    return Response(
                        {"error": "Residencia asociada no encontrada"},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Actualizar el usuario
                user.fecha_nac = fecha_nac
                user.genero = genero
                user.role = role
                user.save()  # Guardar todos los cambios del usuario

            return Response(
                {"message": "Usuario actualizado exitosamente"},
                status=status.HTTP_200_OK
            )

        except IntegrityError as e:
            return Response(
                {"error": f"Error de integridad: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValidationError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Error inesperado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def signIn(request):
    try:
        # Validar CAPTCHA
        captcha_response = request.data.get('captcha')
        if not captcha_response:
            return Response({"error": "El CAPTCHA es obligatorio"}, status=400)

        recaptcha_verify_url = "https://www.google.com/recaptcha/api/siteverify"
        recaptcha_secret_key = settings.RE_CAPTCHA_KEY  # Configurar en settings.py

        response = requests.post(recaptcha_verify_url, data={
            'secret': recaptcha_secret_key,
            'response': captcha_response
        })
        result = response.json()

        if not result.get('success'):
            return Response({"error": "La verificación del CAPTCHA falló"}, status=400)

        # Validar que todos los campos están presentes
        required_fields = [
            'dni', 'nombre', 'fecha_nac', 'genero', 'role',
            'provincia', 'ciudad', 'calle', 'numero','email'
        ]
        missing_fields = [field for field in required_fields if field not in request.data]

        if missing_fields:
            return Response(
                {"error": f"Faltan los siguientes campos: {', '.join(missing_fields)}"},
                status=400
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
        id_padre = request.data.get('id_padre', None)
        centros_de_salud = request.data.get('centros_de_salud', None)
        sintomas = request.data.get('sintomas', [])
        texto = request.data.get('texto', '')
        email = request.data.get('email')

        print(f"Datos recibidos: DNI={dni}, Nombre={nombre}, Fecha={fecha_nac}, Genero={genero}, Role={role}")

        # Verificar si el DNI ya existe
        if User.objects.filter(dni=dni).exists():
            return Response({"error": "Ya existe un usuario con ese DNI"}, status=400)

        # Verificar si el nombre ya existe
        if User.objects.filter(nombre=nombre).exists():
            return Response({"error": "Ya existe un usuario con ese nombre"}, status=400)

        # Verificar si email ya esta registrado
        if User.objects.filter(email=email).exists():
            return Response({"error": "Ya existe un usuario con ese email"}, status=400)

        # Validar formato de fecha de nacimiento
        try:
            fecha_nac = datetime.strptime(fecha_nac, "%Y-%m-%d")
        except ValueError:
            return Response({"error": "El formato de la fecha de nacimiento debe ser YYYY-MM-DD"}, status=400)

        # Validar género
        if genero not in ['Masculino', 'Femenino']:
            return Response({"error": "El género debe ser 'Masculino' o 'Femenino'"}, status=400)

        # Validar rol
        if role not in [choice[0] for choice in User.ROLE_CHOICES]:
            return Response(
                {"error": f"El rol debe ser uno de los siguientes: {[choice[0] for choice in User.ROLE_CHOICES]}"},
                status=400
            )

        # Crear la residencia dentro de una transacción
        with transaction.atomic():
            residencia = Residencia(
                provincia=provincia,
                ciudad=ciudad,
                calle=calle,
                numero=numero
            )
            residencia.save()
            print(f"Residencia creada con ID: {residencia}")

            # Crear el usuario y asignar la residencia
            user = User(
                dni=dni,
                nombre=nombre,
                username=nombre,
                fecha_nac=fecha_nac,
                genero=genero,
                role=role,
                direccion_id_dir=residencia,
                email=email,
                patologia=texto
            )

            if role == 'admin':
                return Response(
                    {"error": "No está permitido registrar usuarios con rol de administrador a través de esta API."},
                    status=403
                )

            # Asociar padre si el rol es paciente y se proporciona un ID de padre
            if role == 'paciente' and id_padre:
                try:
                    padre = User.objects.get(dni=id_padre, role='padre')
                    user.user_id_padre = padre
                except User.DoesNotExist:
                    return Response({"error": "El padre especificado no existe o no tiene el rol de 'padre'"}, status=400)

            password = request.data.get('password')
            if not password:
                return Response({"error": "La contraseña es requerida"}, status=400)

            user.set_password(password)
            print("Validando contraseña")
            print(user.check_password(user.password))

            if role == 'terapeuta':
                user.is_active = False
            else:
                user.is_active = True

            user.save()
            print(f"Usuario creado: {user}")

            # Asociar centros de salud (solo para terapeutas)
            if role == 'terapeuta' and centros_de_salud is not None:
                try:
                    centros_validos = Centrodesalud.objects.filter(id__in=centros_de_salud)
                    if centros_validos.count() != len(centros_de_salud):
                        return Response({"error": "Uno o más centros de salud especificados no existen"}, status=400)

                    for centro in centros_validos:
                        CentroProfesional.objects.create(profesional=user, centrodesalud=centro)
                except Exception as e:
                    return Response({"error": f"Error al asociar centros de salud: {str(e)}"}, status=400)

            # Asociar síntomas (solo para pacientes)
            if role == 'paciente' and sintomas:
                for sintoma in sintomas:
                    nombre_patologia = sintoma.get('nombre')
                    certeza = sintoma.get('similitud')

                    if not nombre_patologia or certeza is None:
                        return Response({"error": f"Faltan datos en el síntoma: {sintoma}"}, status=400)

                    try:
                        patologia = Patologia.objects.get(nombre=nombre_patologia)
                        PersonaPatologia.objects.create(user_id=user, patologia_id=patologia, certeza=certeza)
                    except Patologia.DoesNotExist:
                        return Response({"error": f"No se encontró la patología con nombre '{nombre_patologia}'"}, status=400)

        return Response({"message": "Usuario registrado exitosamente"}, status=201)

    except IntegrityError as e:
        print(f"IntegrityError: {e}")
        return Response({"error": f"Error de integridad: {str(e)}"}, status=400)
    except ValidationError as e:
        print(f"ValidationError: {e}")
        return Response({"error": str(e)}, status=400)
    except Exception as e:
        print(f"Error inesperado: {e}")
        return Response({"error": f"Error inesperado: {str(e)}"}, status=500)

# @api_view(['POST'])
# def listar_comentarios(request):
#     user_id = request.data.get('user_id')
#     objetivo_id = request.data.get('objetivo_id')

#     # Comprobar si se proporcionaron ambos IDs
#     if user_id is None or objetivo_id is None:
#         return Response({'error': 'user_id y objetivo_id son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

#     # Obtener los comentarios principales hechos por el usuario en el objetivo
#     comentarios_usuario = Comentario.objects.filter(
#         user_id=user_id,
#         objetivo_id=objetivo_id,
#         reply_to__isnull=True  # Solo comentarios principales del usuario
#     )

#     # Lista para almacenar todos los comentarios y sus respuestas
#     data = []

#     # Iterar sobre los comentarios principales
#     for comentario in comentarios_usuario:
#         # Obtener las respuestas para el comentario actual
#         respuestas = Comentario.objects.filter(reply_to=comentario)

#         # Crear un diccionario para el comentario con sus respuestas
#         comentario_data = {
#             'id': comentario.id,
#             'texto': comentario.texto,
#             'usuario': comentario.user_id.id,
#             'respuestas': []
#         }

#         # Formatear las respuestas
#         for respuesta in respuestas:
#             comentario_data['respuestas'].append({
#                 'id': respuesta.id,
#                 'texto': respuesta.texto,
#                 'usuario': respuesta.user_id.id
#             })

#         # Agregar el comentario formateado a la lista
#         data.append(comentario_data)

#     # Retornar la respuesta como un objeto Response de DRF
#     return Response({'comentarios': data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def hijos_list_view(request):
    padre_id = request.query_params.get('padre_id')

    if not padre_id:
        return Response(
            {"error": "El ID del padre es requerido."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Obtener los usuarios hijos filtrados por `user_id_padre`
        hijos = User.objects.filter(user_id_padre=padre_id)

        # Serializar los datos de los hijos usando PacienteSerializer
        serializer = PacienteSerializer(hijos, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import PersonaObjetivoEvaluacion, Objetivo

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def objetivos_evaluacion_usuario(request):
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response({"error": "Falta el parámetro 'user_id'."}, status=400)

    # Agrupar por objetivo_id y calcular el progreso promedio
    objetivos_agrupados = (
        PersonaObjetivoEvaluacion.objects
        .filter(user_id=user_id, evaluacion__habilitada=True)
        .values('objetivo_id')  # Solo obtenemos los IDs para la agrupación
        .annotate(
            progreso_promedio=Avg('progreso')
        )
    )

    if not objetivos_agrupados:
        return Response({"error": "No se encontraron objetivos para este usuario."}, status=404)

    # Serializar los datos agrupados manualmente
    data = []
    objetivos_map = {obj.id: obj for obj in Objetivo.objects.filter(id__in=[o['objetivo_id'] for o in objetivos_agrupados], habilitada=True)}
    for obj in objetivos_agrupados:
        # Luego, en el bucle:
        objetivo = objetivos_map[obj['objetivo_id']]
        data.append({
            "id": obj['objetivo_id'],  # ID del objetivo
            "progreso": obj['progreso_promedio'],  # Progreso promedio
            "objetivo_id": {  # Datos relacionados del objetivo
                "id": objetivo.id,
                "nombre": objetivo.nombre,
                "descripcion": objetivo.descripcion
            },
            "resultado": None  # Puedes ajustar esto según tus necesidades
        })

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def obtener_nombre_por_dni(request):
    dni = request.query_params.get('dni')  

    try:
        user = User.objects.get(dni=dni)  
        return Response({"nombre": user.nombre}, status=status.HTTP_200_OK)  
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def get_dni(request):
    username = request.query_params.get('username')
    if not username:
        return Response({'error': 'Se requiere el parámetro username'}, status=400)
    
    try:
        user = User.objects.get(username=username)
        return Response({'dni': user.dni})
    except User.DoesNotExist:
        return Response({'error': f'No se encontró un usuario con username: {username}'}, status=404)
    
     
from api.notificaciones.utils import enviar_notificacion_admin
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def crear_escena(request):
    try:
        data = request.data.copy()   
        user = get_object_or_404(User, username=request.user)
        serializer = EscenaSerializer(data=data)
        if serializer.is_valid():
            
            escena = serializer.save()          
             # Crear notificación para el admin
            admin = User.objects.filter(role='admin').first()
            if admin:
                content_type = ContentType.objects.get_for_model(escena)
                print("Content_Type:    ",content_type)
                notificacion = Notificacion.objects.create(
                    destinatario=admin,
                    remitente=user,
                    mensaje=f"El usuario {user.username} creó la escena '{escena.nombre}'.",
                    estado='pendiente',
                    content_type=content_type,
                    object_id=escena.id,
                )
                enviar_notificacion_admin(notificacion)
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
    
from django.db.models import Avg

class UnassignObjective(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def post(self, request, patientId, objectiveId):
        try:
            # Validar si el usuario existe
            try:
                user = User.objects.get(dni=patientId)
            except User.DoesNotExist:
                return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

            # Obtener los IDs de EscenaObjetivo asociados al objetivoId
            escena_objetivo_ids = EscenaObjetivo.objects.filter(objetivo_id=objectiveId).values_list('id', flat=True)

            # Eliminar registros en PersonaObjetivoEscena
            deleted_count, _ = PersonaObjetivoEscena.objects.filter(user_id=user, escena_objetivo_id__in=escena_objetivo_ids).delete()

            # Eliminar registros en PersonaObjetivoEvaluacion
            deleted_evaluaciones, _ = PersonaObjetivoEvaluacion.objects.filter(
                user_id=user, 
                objetivo_id=objectiveId
            ).delete()

            return Response({"message": f"Se eliminaron {deleted_count} registros."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            



@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def objetivos_escena_usuario(request):
    user_id = request.query_params.get('user_id')
    
    if not user_id:
        return Response({"error": "El parámetro 'user_id' es requerido."}, status=400)

    # Agrupar por objetivo_id y calcular el progreso promedio
    objetivos_agrupados = (
        PersonaObjetivoEscena.objects
        .filter(user_id=user_id)
        .values('escena_objetivo__objetivo_id')  # Acceder a objetivo_id a través de escena_objetivo
        .distinct()  # Eliminar duplicados

    )

    if not objetivos_agrupados:
        return Response({"error": "No se encontraron objetivos para este usuario."}, status=404)

    # Obtener los datos de los objetivos
    objetivos_ids = [obj['escena_objetivo__objetivo_id'] for obj in objetivos_agrupados]
    objetivos_map = {obj.id: obj for obj in Objetivo.objects.filter(id__in=objetivos_ids, habilitada=True)}
    
    data = []
    for obj in objetivos_agrupados:
        objetivo_id = obj['escena_objetivo__objetivo_id']
        objetivo = objetivos_map.get(objetivo_id)
        
        if objetivo:
            data.append({
                "id": objetivo_id,
                "objetivo_id": {
                    "id": objetivo.id,
                    "nombre": objetivo.nombre,
                    "descripcion": objetivo.descripcion
                },
                "resultado": None
            })

    return Response(data)

class Get_escenas_by_objetivo(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, objetivo_id, patient_id):
        # Obtener el objetivo
        objetivo = get_object_or_404(Objetivo, id=objetivo_id)

        # Obtener todas las relaciones EscenaObjetivo para este objetivo
        escenas_objetivo = EscenaObjetivo.objects.filter(objetivo=objetivo, escena__habilitada = True).select_related('escena')

        # Extraer todas las escenas del objetivo
        escenas = [eo.escena for eo in escenas_objetivo]

        # Obtener asignaciones del usuario para este objetivo
        asignaciones = PersonaObjetivoEscena.objects.filter(
            user_id=patient_id,
            escena_objetivo__objetivo=objetivo  # Filtrar por el objetivo actual
        ).select_related('escena_objetivo')

        # Crear un diccionario {escena_id: (asignada, orden)}
        asignaciones_dict = {a.escena_objetivo.escena.id: (True, a.orden) for a in asignaciones}

        # Estructurar la respuesta
        escenas_data = []
        for escena in escenas:
            asignada, orden = asignaciones_dict.get(escena.id, (False, None))
            escenas_data.append({
                "id": escena.id,
                "nombre": escena.nombre,
                "descripcion": escena.descripcion,  # Asegúrate de que este campo exista en Escena
                "asignada": asignada,
                "orden": orden  # Si es None, se interpreta como "sin orden"
            })

        # Devolver la respuesta con toda la info necesaria
        return Response({
            "objetivo_id": objetivo.id,
            "objetivo_nombre": objetivo.nombre,
            "escenas": escenas_data
        }, status=status.HTTP_200_OK)


class Get_escenas_by_objetivo_by_user(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, objetivo_id, patient_id):
        # Obtener el objetivo
        objetivo = get_object_or_404(Objetivo, id=objetivo_id)
        
        # Obtener todas las relaciones EscenaObjetivo para este objetivo
        escenas_objetivo = EscenaObjetivo.objects.filter(objetivo=objetivo, escena__habilitada = True).select_related('escena')
        
        # Obtener las escenas ya asignadas al paciente
        escenas_asignadas = PersonaObjetivoEscena.objects.filter(
            user_id=patient_id,
            escena_objetivo__objetivo=objetivo
        ).values_list('escena_objetivo__escena_id', flat=True)
        
        # Filtrar las escenas que no están asignadas al paciente
        escenas_filtradas = [
            eo.escena for eo in escenas_objetivo
            if eo.escena.id not in escenas_asignadas
        ]
        
        # Serializar las escenas filtradas
        serializer = EscenaSerializer(escenas_filtradas, many=True)
        
        # Devolver la respuesta
        return Response({
            "objetivo_id": objetivo.id,
            "objetivo_nombre": objetivo.nombre,
            "escenas": serializer.data
        }, status=status.HTTP_200_OK)
    

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class NameFilter(filters.FilterSet):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    nombre = filters.CharFilter(field_name='nombre', lookup_expr='icontains')
    centro_profesional = filters.NumberFilter(field_name='centro_profesional', lookup_expr='exact')

    def __init__(self, *args, **kwargs):
        model = kwargs.pop('model', None)
        if model:
            self._meta.model = model
        super().__init__(*args, **kwargs)

    class Meta:
        model = None  # Se establece dinámicamente
        fields = ['nombre', 'centro_profesional']

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class ObjetivosListView(generics.ListAPIView):    
    
    queryset = Objetivo.objects.filter(habilitada=True)
    serializer_class = ObjetivoSerializerList
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class EscenaListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = Escena.objects.filter(habilitada=True)
    serializer_class = EscenaSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

    def get_queryset(self):
        return Escena.objects.filter(habilitada=True)  # Solo escenas habilitadas 
    
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class CentrosSaludListView(generics.ListAPIView):
    queryset = Centrodesalud.objects.all()
    serializer_class = CentroSaludSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter  

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def get_related_centers(self):
        username = self.kwargs.get('username')
        profesional = User.objects.get(username=username)
        return CentroProfesional.objects.filter(profesional=profesional).values_list('centrodesalud', flat=True)


class EscenaById(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request, pk):
        # Obtener el objeto Escena por su ID (pk)
        escena = get_object_or_404(Escena, pk=pk)
        
        # Serializar la escena, lo cual incluye la condición si existe
        escena_serializer = EscenaSerializer(escena)
        
        # Obtener los datos serializados
        escena_data = escena_serializer.data
        return Response(escena_data)
class GrupoById(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request, pk):
        # Obtener el objeto Grupo por su ID (pk)
        grupo = get_object_or_404(Grupo, pk=pk)
        serializer = GrupoSerializer(grupo)
        return Response(serializer.data)
    
#@permission_classes([IsAuthenticated])

class NotAssociatedCentersListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = CentroSaludSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

    def get_queryset(self):
        related_centers = get_related_centers(self)
        # Filtra los centros de salud donde el profesional no esté relacionado
        return Centrodesalud.objects.exclude(id__in=related_centers)

#@permission_classes([IsAuthenticated])
class AssociatedCentersListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = CentroSaludSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter
    #permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        related_centers = get_related_centers(self)
        # Filtra los centros de salud donde el profesional no esté relacionado
        return Centrodesalud.objects.filter(id__in=related_centers)

class AssociateCenterView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = ProfesionalCentroSerializer

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        center_ids = request.data.get('centers', [])

        user = User.objects.get(username=username)

        try:
            for center_id in center_ids:
                center = Centrodesalud.objects.get(id=center_id)
                CentroProfesional.objects.create(
                    centrodesalud=center,
                    profesional=user
                )

            return Response({
                'message': 'Centros asociados exitosamente',
                'centers': center_ids
            }, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado.'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class CreateGroup(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = PatientGroupSerializer

    def create(self, request, *args, **kwargs):
        try:
            # Obtener el centro de salud por su nombre
            center_name = request.data.get('nombre_centro')
            center = Centrodesalud.objects.get(nombre=center_name)

            # Crear el grupo
            nombre_grupo = request.data.get('nombre_grupo')
            grupo = Grupo.objects.create(
                nombre=nombre_grupo,
                centrodesalud_id=center
            )

            # Agregar pacientes al grupo
            pacientes = request.data.get('pacientes', [])
            for paciente_dni in pacientes:
                try:
                    user = User.objects.get(dni=paciente_dni)
                    if user.role == 'paciente':  # Solo agregar si el usuario es un paciente
                        Personagrupo.objects.create(
                            user_id=user,
                            grupo_id=grupo
                        )
                except User.DoesNotExist:
                    return Response(
                        {"error": f"Paciente con DNI {paciente_dni} no existe."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                        # Agregar pacientes al grupo

            terapeutas = request.data.get('terapeutas', [])
            for terapeuta_dni in terapeutas:
                try:
                    user = User.objects.get(dni=terapeuta_dni)
                    Personagrupo.objects.create(
                        user_id=user,
                        grupo_id=grupo
                    )
                except User.DoesNotExist:
                    return Response(
                        {"error": f"Terapeuta con DNI {terapeuta_dni} no existe."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Agregar terapeuta al grupo
            terapeuta = request.data.get('terapeuta')
            try:
                user = User.objects.get(username=terapeuta)
                if user.role == 'terapeuta':  # Solo agregar si el usuario es un terapeuta
                    Personagrupo.objects.create(
                        user_id=user,
                        grupo_id=grupo
                    )
            except User.DoesNotExist:
                return Response(
                    {"error": f"Terapeuta con DNI {terapeuta} no existe."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Serializar la respuesta
            grupo_serialized = PatientGroupSerializer(grupo).data

            # Agregar información de terapeutas y pacientes al resultado
            grupo_serialized["terapeutas"] = [
                {
                    "id": terapeuta.dni,
                    "nombre": terapeuta.nombre,
                    "dni": terapeuta.dni
                }
                for terapeuta in User.objects.filter(
                    personagrupos__grupo_id=grupo,
                    role='terapeuta'
                )
            ]
            grupo_serialized["pacientes"] = [
                {
                    "id": paciente.dni,
                    "nombre": paciente.nombre,
                    "dni": paciente.dni
                }
                for paciente in User.objects.filter(
                    personagrupos__grupo_id=grupo,
                    role='paciente'
                )
            ]

            return Response({
                'message': 'Grupo creado exitosamente',
                'group': grupo_serialized
            }, status=status.HTTP_201_CREATED)

        except Centrodesalud.DoesNotExist:
            return Response(
                {"error": f'Centro de salud con nombre "{center_name}" no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        except IntegrityError:
            return Response(
                {"error": f'El grupo con nombre "{request.data.get("nombre_grupo")}" ya existe.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        
class DisassociateCenterView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = ProfesionalCentroSerializer

    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        center_ids = request.data.get('centers', [])

        user = User.objects.get(username=username)

        try:
            for center_id in center_ids:
                center = Centrodesalud.objects.get(id=center_id)
                CentroProfesional.objects.filter(
                    centrodesalud=center,
                    profesional=user
                ).delete()

            return Response({
                'message': 'Centros desasociados exitosamente',
                'centers': center_ids
            }, status=status.HTTP_201_CREATED)

        except User.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado.'
            }, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class GetPathologiesFromUserView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = PatologiaSerializer

    def get(self, request, *args, **kwargs):
        user_id = self.kwargs.get('user_id')
        
        if not user_id:
            return Response({
                'error': 'Se requiere el parámetro username'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            patologias_fk = PersonaPatologia.objects.filter(user_id=user_id)
            patologias = Patologia.objects.filter(id__in=patologias_fk.values_list('patologia_id', flat=True))
            serializer = self.get_serializer(patologias, many=True)
            return Response(serializer.data)

        except User.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        

class GetCentroProfesionalView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    
    serializer_class = ProfesionalCentroSerializer

    def get(self, request, *args, **kwargs):
        username = request.query_params.get('username')
        centername = request.query_params.get('centername')
        # username = self.kwargs.get('username')
        # centername = self.kwargs.get('centername')
        print("username: ",username)
        print("centername: ",centername)

        if not username or not centername:
            return Response({
                'error': 'Se requieren los parámetros username y centername'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            center = Centrodesalud.objects.get(nombre=centername)
            user = User.objects.get(nombre=username)
            centerprofesional = CentroProfesional.objects.get(centrodesalud=center, profesional=user)

            serializer = self.get_serializer(centerprofesional)
            return Response(serializer.data)

        except Centrodesalud.DoesNotExist:
            return Response({
                'error': 'Centro de salud no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({
                'error': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except CentroProfesional.DoesNotExist:
            return Response({
                'error': 'Relación centro-profesional no encontrada'
            }, status=status.HTTP_404_NOT_FOUND)

class GetCentroProfesionalObjetivosView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = ObjetivoSerializerList
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

    def get_queryset(self):
        username = self.request.query_params.get('username')
        centername = self.request.query_params.get('centername')
        
        if not username or not centername:
            return Response({
                'error': 'Se requieren los parámetros username y centername'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            center = Centrodesalud.objects.get(nombre=centername)
            user = User.objects.get(username=username)
            centro_profesional = CentroProfesional.objects.get(
                centrodesalud=center, 
                profesional=user
            )
            
            return Objetivo.objects.filter(centro_profesional=centro_profesional, habilitada=True)

        except Centrodesalud.DoesNotExist:
            raise NotFound('Centro de salud no encontrado')
        except User.DoesNotExist:
            raise NotFound('Usuario no encontrado')
        except CentroProfesional.DoesNotExist:
            raise NotFound('Relación centro-profesional no encontrada')

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class DeleteGoalView(generics.DestroyAPIView):
    queryset = Objetivo.objects.all()
    serializer_class = ObjetivoSerializer

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class ListsScenesView(generics.ListAPIView):
    serializer_class = EscenaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter
    def get_queryset(self):
        return Escena.objects.filter(habilitada=True) 
    
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class ListsGoalView(generics.ListAPIView):
    serializer_class = ObjetivoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter
    def get_queryset(self):
        return Objetivo.objects.filter(habilitada=True) 
    


class GetScenesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = Escena.objects.all()
    serializer_class = EscenaSerializer
    pagination_class = DynamicPagination   

    def get_queryset(self):
        return Escena.objects.filter(habilitada=True) 

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class DeleteSceneView(generics.DestroyAPIView):
    queryset = Escena.objects.filter(habilitada=True)
    serializer_class = ObjetivoSerializer

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
class DeleteGroupView(generics.DestroyAPIView):
    queryset = Grupo.objects.all()
    serializer_class = GrupoSerializer

class GroupsPerUserView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = GrupoSerializer

    def get_queryset(self):
        username = self.kwargs.get('username')
        
        user = User.objects.get(username=username)
        
        persona_grupo_qs = Personagrupo.objects.filter(user_id=user)
        
        grupos_ids = persona_grupo_qs.values_list('grupo_id', flat=True)

        return Grupo.objects.filter(id__in=grupos_ids)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            raise NotFound("El usuario no tiene grupos asociados.")
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class GetGroupsPerUserView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = GrupoSerializer
    pagination_class = DynamicPagination

    def get_queryset(self):
        username = self.request.query_params.get('username')
        centername = self.request.query_params.get('centername')

        if not username:
            raise NotFound("El parámetro 'username' es requerido.")
        
        user = User.objects.get(username=username)
        
        persona_grupo_qs = Personagrupo.objects.filter(user_id=user)
        centrodesalud = get_object_or_404(Centrodesalud, nombre=centername)
        grupos_ids = persona_grupo_qs.values_list('grupo_id', flat=True)

        return Grupo.objects.filter(id__in=grupos_ids, centrodesalud_id=centrodesalud)
    

class GetGroupsPerUserNotInView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = GrupoSerializer
    pagination_class = DynamicPagination

    def get_queryset(self):
        username = self.request.query_params.get('username')

        if not username:
            raise NotFound("El parámetro 'username' es requerido.")
        
        # Obtener el usuario
        user = User.objects.get(username=username)
        
        # Grupos en los que el usuario está asociado
        grupos_con_usuario = Personagrupo.objects.filter(user_id=user).values_list('grupo_id', flat=True)
        
        # Grupos sin ninguna persona asociada
        grupos_sin_personas = Grupo.objects.exclude(id__in=Personagrupo.objects.values_list('grupo_id', flat=True))
        
        # Grupos en los que el usuario no está asociado
        grupos_sin_usuario = Grupo.objects.exclude(id__in=grupos_con_usuario)
        
        # Combinar ambos conjuntos: grupos sin usuario y grupos sin personas
        queryset = Grupo.objects.filter(
            Q(id__in=grupos_sin_usuario) | Q(id__in=grupos_sin_personas)
        ).distinct()

        return queryset

class PatientsPerGroupView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = PacienteSerializer

    def get_queryset(self):
        group_id = self.kwargs.get('group_id')
        
        try:
            group = Grupo.objects.get(id=group_id)

        except Grupo.DoesNotExist:
            raise NotFound("El grupo especificado no existe.")

        persona_grupo_qs = Personagrupo.objects.filter(grupo_id=group)            

        users_dni = persona_grupo_qs.values_list('user_id__dni', flat=True)

        return User.objects.filter(dni__in=users_dni, role='paciente')
        
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            raise NotFound("El grupo no tiene pacientes asociados.")
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GetPatientsPerGroupView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = PacienteSerializer
    pagination_class = DynamicPagination

    def get_queryset(self):
        group_id = self.request.query_params.get('group_id')
        
        try:
            group = Grupo.objects.get(id=group_id)

        except Grupo.DoesNotExist:
            raise NotFound("El grupo especificado no existe.")

        persona_grupo_qs = Personagrupo.objects.filter(grupo_id=group)            

        users_dni = persona_grupo_qs.values_list('user_id__dni', flat=True)

        return User.objects.filter(dni__in=users_dni, role='paciente')
    

class GetTherapistsPerGroupView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]


    serializer_class = PacienteSerializer
    pagination_class = DynamicPagination

    def get_queryset(self):
        group_id = self.request.query_params.get('group_id')
        username = self.request.query_params.get('username')
        try:
            group = Grupo.objects.get(id=group_id)

        except Grupo.DoesNotExist:
            raise NotFound("El grupo especificado no existe.")

        persona_grupo_qs = Personagrupo.objects.filter(grupo_id=group)            

        users_dni = persona_grupo_qs.values_list('user_id__dni', flat=True)

        return User.objects.filter(dni__in=users_dni, role='terapeuta').exclude(username=username)
    


class GetPatientsNotInGroupView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = PacienteSerializer

    def get_queryset(self):
        # Retrieve group_id from query parameters
        group_id = self.request.query_params.get('group_id')

        if not group_id:
            raise ValidationError("El parámetro 'group_id' es obligatorio.")

        try:
            group = Grupo.objects.get(id=group_id)
        except Grupo.DoesNotExist:
            raise NotFound("El grupo especificado no existe.")

        # Obtener los IDs de los usuarios que están en el grupo especificado
        users_in_group = Personagrupo.objects.filter(grupo_id=group).values_list('user_id', flat=True)

        # Filtrar usuarios con rol de 'paciente' que no están en el grupo específico o en ningún grupo
        return User.objects.filter(
            Q(role='paciente'),
            Q(personagrupos__isnull=True) | ~Q(dni__in=users_in_group)
        ).distinct()

class GetTherapistsNotInGroupView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = PacienteSerializer

    def get_queryset(self):
        # Retrieve group_id from query parameters
        group_id = self.request.query_params.get('group_id')

        if not group_id:
            raise ValidationError("El parámetro 'group_id' es obligatorio.")

        try:
            group = Grupo.objects.get(id=group_id)
        except Grupo.DoesNotExist:
            raise NotFound("El grupo especificado no existe.")

        # Obtener los IDs de los usuarios que están en el grupo especificado
        users_in_group = Personagrupo.objects.filter(grupo_id=group).values_list('user_id', flat=True)

        # Filtrar usuarios con rol de 'paciente' que no están en el grupo específico o en ningún grupo
        return User.objects.filter(
            Q(role='terapeuta'),
            Q(personagrupos__isnull=True) | ~Q(dni__in=users_in_group)
        ).distinct()



class GetTherapistsExcludingView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get_queryset(self):
        username = self.kwargs.get('username')
        User = get_user_model()
        
        return User.objects.filter(
            role='terapeuta'
        ).exclude(
            username=username
        )
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = [{
            'dni': user.dni,
            'nombre': user.nombre,
            'fecha_nac': user.fecha_nac,
            'genero': user.genero,
            'patologia': user.patologia
        } for user in queryset]
        
        return Response(data, status=status.HTTP_200_OK)
    

class GetFormsPerUserView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = FormularioSerializer
    pagination_class = DynamicPagination

    def get_queryset(self):
        username = self.request.query_params.get('username')
        centername= self.request.query_params.get('centername') 
        if not username or not centername:
            return Response({
                'error': 'Se requieren los parámetros username y centername'
            }, status=status.HTTP_400_BAD_REQUEST)           
        try: 
            center = Centrodesalud.objects.get(nombre=centername)
            user = User.objects.get(username=username)
            centro_profesional = CentroProfesional.objects.get(
                centrodesalud=center, 
                profesional=user
            )  
        except User.DoesNotExist:
            raise NotFound(f"Usuario con username '{username}' no encontrado.")

        return Formulario.objects.filter(objetivo_id__centro_profesional=centro_profesional, habilitada=True)    

class GetFormsPatientView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = EvaluacionIdSerializer
    pagination_class = DynamicPagination

    def get_queryset(self):
        dni = self.request.query_params.get('dni')
        if not dni:
            raise NotFound("El parámetro 'dni' es requerido.")

        try:
            user = User.objects.get(dni=dni)
        except User.DoesNotExist:
            raise NotFound(f"Usuario con username '{dni}' no encontrado.")
        
        return PersonaObjetivoEvaluacion.objects.filter(user_id=user, evaluacion__habilitada=True).values('evaluacion').distinct()

@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
class DeleteAssesmentView(generics.DestroyAPIView):
    queryset = Formulario.objects.all()
    serializer_class = FormularioSerializer


class GetReachedGoalsView(generics.ListAPIView):
    serializer_class = ObjetivoSerializer
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user_dni = self.request.query_params.get('user_dni')

        if not user_dni:
            raise NotFound("El parámetro 'user_dni' es requerido.")
        
        try:
            user = User.objects.get(dni=user_dni)
        except User.DoesNotExist:
            raise NotFound(f"Usuario con username '{user_dni}' no encontrado.")
        
        goals_ids = PersonaObjetivoEvaluacion.objects.filter(user_id=user).values_list('objetivo_id', flat=True)
        
        if not goals_ids:
            raise NotFound("No se encontraron objetivos asociados a este usuario.")
        
        # Filtrar los objetivos en la tabla Objetivo
        return Objetivo.objects.filter(id__in=goals_ids)

class GetUnreachedGoalsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = ObjetivoSerializer

    def get_queryset(self):
        user_dni = self.request.query_params.get('user_dni')

        if not user_dni:
            raise NotFound("El parámetro 'user_dni' es requerido.")
        
        try:
            user = User.objects.get(dni=user_dni)
        except User.DoesNotExist:
            raise NotFound(f"Usuario con username '{user_dni}' no encontrado.")
        
        reached_goals_ids = PersonaObjetivoEvaluacion.objects.filter(user_id=user).values_list('objetivo_id', flat=True)
        
        escena_objetivo_list = PersonaObjetivoEscena.objects.filter(user_id=user).values_list('escena_objetivo', flat=True)

        assigned_goals_ids = EscenaObjetivo.objects.filter(id__in=escena_objetivo_list).values_list('objetivo', flat=True)

        unreached_goals = Objetivo.objects.filter(id__in=assigned_goals_ids).exclude(id__in=reached_goals_ids)

        return unreached_goals

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
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

@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def obtener_dni(username):
    if not username:
        raise ValueError("Se requiere el parámetro username")
    try:
        user = User.objects.get(username=username)
        return user.dni
    except User.DoesNotExist:
        raise User.DoesNotExist(f"No se encontró un usuario con username: {username}")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def get_dni(request):
    """View para obtener el DNI a partir del username."""
    username = request.query_params.get('username')
    try:
        dni = obtener_dni(username)
        return Response({'dni': dni})
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    except User.DoesNotExist as e:
        return Response({'error': str(e)}, status=404)

class registrar_comentario(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request):
        data = request.data.copy() 
        # Modificar el campo 'user' para usar el DNI
        username= data['user']
        texto= data['texto']
        try:
            data['user'] = obtener_dni(request.data['user'])
        except Exception as e:
            return Response({'error': f'Error obteniendo el DNI: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Pasar los datos modificados al serializer
        serializer = ComentarioSerializer(data=data)
        if serializer.is_valid():
            serializer.save()  # Guardar el comentario
            GEMINI_chequear_comentario(username, texto)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        # Si el serializer no es válido, retornar los errores
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ComentariosListaAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request, *args, **kwargs):
        try:
            # Obtener el id_escena desde los parámetros de consulta
            id_escena = request.query_params.get('id_escena', None)

            if not id_escena:
                return Response(
                    {"error": "El parámetro 'id_escena' es requerido."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Obtener todos los comentarios de la escena
            comentarios = Comentario.objects.filter(escena_id=id_escena).values('id', 'comentario_contestado')

            # Crear un diccionario temporal para mapear cada comentario con su comentario_contestado
            comentarios_map = {}
            for comentario in comentarios:
                comentarios_map[comentario['id']] = comentario['comentario_contestado']

            # Crear el hashset final usando la función de recursión
            hashset = {}
            for comentario_id in comentarios_map.keys():
                hilo_principal = self._obtener_hilo_principal(comentarios_map, comentario_id)
                if hilo_principal not in hashset:
                    hashset[hilo_principal] = []
                if comentarios_map[comentario_id]:  # Si tiene un comentario contestado, agrégalo como respuesta
                    hashset[hilo_principal].append(comentario_id)

            # Eliminar duplicados en las listas del hashset
            for key in hashset:
                hashset[key] = list(set(hashset[key]))

            return Response({"hashset": hashset}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error inesperado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _obtener_hilo_principal(self, comentarios_map, comentario_id):
        """
        Función recursiva para encontrar el hilo principal de un comentario.
        """
        comentario_contestado = comentarios_map.get(comentario_id)
        if comentario_contestado is None:  # Es un comentario principal
            return comentario_id
        return self._obtener_hilo_principal(comentarios_map, comentario_contestado)    

class ComentarioDetalleAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request):
        # Obtener el parámetro id_comentario
        id_comentario = request.query_params.get('idComentario')

        # Validar que el parámetro esté presente
        if not id_comentario:
            return Response(
                {"error": "El parámetro 'idComentario' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Buscar el comentario por ID con sus relaciones
            comentario = Comentario.objects.select_related(
                'user',
                'comentario_contestado',
                'comentario_contestado__user'
            ).get(id=id_comentario)

            # Construir la respuesta
            response_data = {
                "id": comentario.id,
                "texto": comentario.texto,
                "visibilidad": comentario.visibilidad,
                "usuario": comentario.user.nombre,  # Nombre del usuario que comentó
                "idComentarioPadre": None,  # Valor por defecto
            }

            # Si es una respuesta a otro comentario, incluir información adicional
            if comentario.comentario_contestado:
                response_data.update({
                    "idComentarioPadre": comentario.comentario_contestado.id,
                    "usuarioRespondido": comentario.comentario_contestado.user.nombre
                })

            return Response(response_data, status=status.HTTP_200_OK)

        except Comentario.DoesNotExist:
            return Response(
                {"error": "No se encontró un comentario con el ID proporcionado."},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"error": f"Error inesperado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

#@permission_classes([IsAuthenticated])
class EscenasSegunUsuarioObjetivo(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request):
        objetivo_id = request.query_params.get('objetivo_id')

        if not objetivo_id:
            return Response({'error': 'Se requiere el parámetro objetivo_id'}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener las escenas relacionadas al objetivo
        escena_objetivos = EscenaObjetivo.objects.filter(objetivo_id=objetivo_id, escena__habilitada=True)
        if not escena_objetivos.exists():
            return Response({'error': 'No se encontraron escenas para el objetivo proporcionado'}, status=status.HTTP_404_NOT_FOUND)

        # Obtener los IDs de las escenas relacionadas
        escena_ids = escena_objetivos.values_list('escena_id', flat=True)

        # Consultar las escenas para obtener los links
        escenas = Escena.objects.filter(id__in=escena_ids).values('id', 'link')

        return Response(list(escenas), status=status.HTTP_200_OK)

#@permission_classes([IsAuthenticated])
class ObtenerLinksEvaluaciones(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    # devuelve link de evaluaciones asociadas a un objetivo y un usuario
    def get(self, request):
        username = request.query_params.get('username')
        objetivo_id = request.query_params.get('objetivo_id')
        try:
            try:
                user_id = obtener_dni(username) 
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)
            # Filtrar las evaluaciones asociadas
            evaluaciones = PersonaObjetivoEvaluacion.objects.filter(
                user_id=user_id,
                objetivo_id=objetivo_id,
                evaluacion__habilitada=True
            ).exclude(
                evaluacion__isnull=True  # Asegurarse de que haya evaluación
            ).values_list('evaluacion__link', flat=True)

            # Devolver los resultados en formato JSON
            return Response({'links': list(evaluaciones)}, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Manejo de errores
            return Response(
                {'error': 'Ocurrió un error al obtener los links.', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
class GetPatientForms(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    serializer_class = FormularioSerializer
    pagination_class = DynamicPagination

    def get_queryset(self):
        user_dni = self.request.query_params.get('user_dni')
        try:
            assesments_ids = PersonaObjetivoEvaluacion.objects.filter(
                user_id=user_dni,
            ).exclude(
                evaluacion__isnull=True  # Asegurarse de que haya evaluación
            ).values_list('evaluacion', flat=True)

            return Formulario.objects.filter(id__in=assesments_ids, habilitada=True)
        
        except Exception as e:
            raise Exception(f"Ocurrió un error al obtener los formularios: {str(e)}")


@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def ObtenerEscenaObjetivo(escena_id, objetivo_id):
    try: 
        escena_objetivo = EscenaObjetivo.objects.get(
            objetivo_id=objetivo_id, 
            escena_id=escena_id
        )
    except EscenaObjetivo.DoesNotExist:
        return None  # Devuelve None si no se encuentra el objeto
    except ValueError as e:
        return None  # Maneja errores de valor en caso de parámetros inválidos

    # Retornar el objeto encontrado
    return escena_objetivo


#@permission_classes([IsAuthenticated])
class ObtenerPersonaObjetivoID(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request):
        username = request.query_params.get('username')
        escena_id = request.query_params.get('escena_id')
        objetivo_id = request.query_params.get('objetivo_id')

        try:
            user_id = obtener_dni(username) 
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist as e:
            return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

        # Obtener la escena objetivo
        escena_objetivo = ObtenerEscenaObjetivo(escena_id, objetivo_id)
        if not escena_objetivo:
            return Response(
                {'error': 'ObjetivoEscena no encontrado.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            persona_objetivo = PersonaObjetivoEscena.objects.get(
                user_id=user_id, 
                escena_objetivo=escena_objetivo
            )
        except PersonaObjetivoEscena.DoesNotExist:
            return Response(
                {'error': 'PersonaObjetivoEscena no encontrado.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        # Retornar el id en la respuesta
        return Response({'id': persona_objetivo.id}, status=status.HTTP_200_OK)
    
class MarcarVideoVistoAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request):
        try:
            persona_objetivo_escena_id = request.data.get('persona_objetivo_escena_id')
            
            # Intentamos obtener el registro existente
            video_visto, created = Videosvistos.objects.get_or_create(
                persona_objetivo_escena_id=persona_objetivo_escena_id,
                defaults={'visto': True}
            )
            
            # Si el registro ya existía, actualizamos visto a True
            if not created:
                video_visto.visto = True
                video_visto.save()
            
            serializer = VideosVistosSerializer(video_visto)
            
            return Response({
                'message': 'Video marcado como visto exitosamente',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class SaveOrderView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request):
        try:
            patient_id = request.data.get("patientId")
            objetivo_id = request.data.get("objetivoId")
            ordered_escenas = request.data.get("ordered_escenas", [])
            non_ordered_escenas = request.data.get("non_ordered_escenas", [])

            if not patient_id or not objetivo_id:
                return Response({"error": "patientId y objetivoId son obligatorios."}, status=status.HTTP_400_BAD_REQUEST)

            # Validar existencia del usuario y el objetivo
            try:
                user = User.objects.get(dni=patient_id)
            except User.DoesNotExist:
                return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

            # Usar una transacción para garantizar consistencia
            with transaction.atomic():
                # Obtener los IDs de EscenaObjetivo que corresponden al objetivo dado
                escena_objetivo_ids = EscenaObjetivo.objects.filter(objetivo_id=objetivo_id).values_list("id", flat=True)
                print("escena_objetivo_ids", escena_objetivo_ids)
                # Eliminar todas las entradas anteriores con ese usuario y esas escenas
                PersonaObjetivoEscena.objects.filter(user_id=user, escena_objetivo__in=escena_objetivo_ids).delete()

                # Insertar nuevas escenas ordenadas
                for escena in ordered_escenas:
                    try:
                        escena_obj = EscenaObjetivo.objects.get(escena_id=escena["id"], objetivo_id=objetivo_id)
                        PersonaObjetivoEscena.objects.create(
                            user_id=user,
                            escena_objetivo=escena_obj,
                            orden=escena["order"]+1
                        )
                    except EscenaObjetivo.DoesNotExist:
                        return Response({"error": f"EscenaObjetivo con id {escena['id']} no encontrada."}, status=status.HTTP_404_NOT_FOUND)

                # Insertar nuevas escenas no ordenadas (orden en NULL)
                for escena_id in non_ordered_escenas:
                    try:
                        escena_obj = EscenaObjetivo.objects.get(escena_id=escena_id, objetivo_id=objetivo_id)
                        PersonaObjetivoEscena.objects.create(
                            user_id=user,
                            escena_objetivo=escena_obj,
                            orden=None
                        )
                    except EscenaObjetivo.DoesNotExist:
                        return Response({"error": f"EscenaObjetivo con id {escena_id} no encontrada."}, status=status.HTTP_404_NOT_FOUND)


                        
             # 🔥 NUEVA LÓGICA: Crear evaluaciones si hay formularios para este objetivo
                formularios = Formulario.objects.filter(objetivo_id=objetivo_id)
                for formulario in formularios:
                    # Verificar si ya existe la evaluación para evitar duplicados
                    if not PersonaObjetivoEvaluacion.objects.filter(user_id=user, objetivo_id=objetivo_id, evaluacion=formulario).exists():
                        PersonaObjetivoEvaluacion.objects.create(
                            user_id=user,
                            objetivo_id=Objetivo.objects.get(id=objetivo_id),
                            evaluacion=formulario,
                            progreso=0  # Inicializamos el progreso en 0
                        )

            return Response({"message": "Orden guardado exitosamente y evaluaciones actualizadas."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            print("🔥 ERROR en SaveOrderView:", str(e))  # Imprime el error simple
            print(traceback.format_exc())  # Muestra el traceback completo en la consola
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import spacy
import numpy as np
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Patologia

class SpacyPatologiasView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.nlp = spacy.load('es_core_news_lg')
        self.vectores_patologias = self.crear_vectores_patologias()

    def crear_vectores_patologias(self):
        vectores = {}
        patologias = Patologia.objects.all()
        print([p.nombre for p in patologias])          
        for patologia in patologias:
            print("entre al for")
            doc = self.nlp(patologia.descripcion)
            word_vectors = [token.vector for token in doc if token.has_vector]
            print(f"Description for {patologia.nombre}: {patologia.descripcion}")
            print(f"Number of tokens with vectors for {patologia.nombre}: {len(word_vectors)}")
            vector_patologia = np.mean(word_vectors, axis=0) if word_vectors else None
            vectores[patologia.nombre] = vector_patologia
            print(f"Vector for {patologia.nombre}: {vector_patologia is not None}")
            
        return vectores


    def encontrar_patologias_similares(self, texto_input, umbral=0.5):
        doc_input = self.nlp(texto_input)
        input_vector = np.mean([token.vector for token in doc_input if token.has_vector], axis=0)
        
        patologias_similares = []
        
        for nombre, vector_patologia in self.vectores_patologias.items():
            if vector_patologia is not None:
                similitud = np.dot(input_vector, vector_patologia) / (
                    np.linalg.norm(input_vector) * np.linalg.norm(vector_patologia)
                )
                
                if similitud > umbral:
                    patologias_similares.append({
                        'nombre': nombre,
                        'similitud': float(similitud)
                    })
        
        return sorted(patologias_similares, key=lambda x: x['similitud'], reverse=True)

    def post(self, request):
        texto_input = request.data.get('texto', '')
        
        patologias_detectadas = self.encontrar_patologias_similares(texto_input)
        
        return Response({
            'patologias': patologias_detectadas
        })
        

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def get_groups(request):
    if request.method == "GET":
        grupos = Grupo.objects.all()  # Obtener todos los grupos
        data = [
            {
                "id": grupo.id,
                "name": grupo.nombre,
                "health_center": {
                    "id": grupo.centrodesalud_id.id,
                    "name": grupo.centrodesalud_id.nombre,
                },
                "therapists": [
                    {
                        "id": persona.user_id.dni,  # Acceder al campo dni de User
                        "name": persona.user_id.nombre,  # Acceder al campo nombre de User
                    }
                    for persona in Personagrupo.objects.filter(
                        grupo_id=grupo, user_id__role="terapeuta"
                    )
                ],
                "patients": [
                    {
                        "id": persona.user_id.dni,  # Acceder al campo dni de User
                        "name": persona.user_id.nombre,  # Acceder al campo nombre de User
                    }
                    for persona in Personagrupo.objects.filter(
                        grupo_id=grupo, user_id__role="paciente"
                    )
                ],
            }
            for grupo in grupos
        ]
        return JsonResponse(data, safe=False)
    
@csrf_exempt
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def update_group(request, group_id):
    if request.method == "POST":
        try:
            # Obtener el grupo por ID
            grupo = Grupo.objects.get(id=group_id)
        except Grupo.DoesNotExist:
            return JsonResponse({"error": "Grupo no encontrado"}, status=404)

        try:
            # Parsear el cuerpo de la solicitud
            body = json.loads(request.body)
            therapist_ids = body.get("therapist_ids", [])
            patient_ids = body.get("patient_ids", [])

            # Validar si los usuarios existen
            all_user_ids = therapist_ids + patient_ids
            users = User.objects.filter(id__in=all_user_ids)

            if len(users) != len(all_user_ids):
                return JsonResponse({"error": "Uno o más usuarios no existen"}, status=400)

            # Eliminar todas las relaciones previas de este grupo
            Personagrupo.objects.filter(grupo_id=grupo).delete()

            # Agregar los terapeutas
            for therapist_id in therapist_ids:
                Personagrupo.objects.create(
                    grupo_id=grupo,
                    user_id_id=therapist_id,
                    role="terapeuta"
                )

            # Agregar los pacientes
            for patient_id in patient_ids:
                Personagrupo.objects.create(
                    grupo_id=grupo,
                    user_id_id=patient_id,
                    role="paciente"
                )

            return JsonResponse({"message": "Grupo actualizado correctamente"})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la solicitud inválido"}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Error inesperado: {str(e)}"}, status=500)
    
    return JsonResponse({"error": "Método no permitido"}, status=405)


# Vista para obtener los terapeutas
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])

def get_patients(request):
    pacientes = User.objects.filter(role='paciente')  # Filtrar por el rol de 'paciente'
    print(pacientes)
    serializer = PacienteSerializer2(pacientes, many=True)
    return JsonResponse(serializer.data, safe=False)

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def get_therapists(request):
    terapeutas = User.objects.filter(role='terapeuta')  # Filtrar por el rol de 'terapeuta'
    print(terapeutas)
    serializer = TerapeutaSerializer(terapeutas, many=True)
    return JsonResponse(serializer.data, safe=False)


# Vista para crear un grupo
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def create_group(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            group_name = data.get("name")
            health_center_id = data.get("health_center_id")
            therapist_ids = data.get("therapist_ids", [])
            patient_ids = data.get("patient_ids", [])

            print("Datos recibidos:")
            print("group_name:", group_name)
            print("health_center_id:", health_center_id)
            print("therapist_ids:", therapist_ids)
            print("patient_ids:", patient_ids)

            # Crear el grupo
            centro = Centrodesalud.objects.get(id=health_center_id)
            grupo = Grupo.objects.create(nombre=group_name, centrodesalud_id=centro)

            # Asociar terapeutas y pacientes al grupo usando dni en lugar de id
            for therapist_id in therapist_ids:
                therapist = User.objects.get(dni=therapist_id)  # Cambiado de id a dni
                Personagrupo.objects.create(user_id=therapist, grupo_id=grupo)

            for patient_id in patient_ids:
                patient = User.objects.get(dni=patient_id)  # Cambiado de id a dni
                Personagrupo.objects.create(user_id=patient, grupo_id=grupo)

            return JsonResponse({"message": "Grupo creado exitosamente!"}, status=201)

        except Centrodesalud.DoesNotExist:
            return JsonResponse({"error": "Centro de salud no encontrado"}, status=404)
        except User.DoesNotExist:
            return JsonResponse({"error": "Usuario no encontrado"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)
    










from rest_framework import generics, status
from rest_framework.response import Response
from .models import Formulario, Pregunta, Respuesta
from .serializers import FormularioSerializer, PreguntaSerializer, RespuestaSerializer


class FormularioListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    queryset = Formulario.objects.all()
    serializer_class = FormularioSerializer


class FormularioDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    queryset = Formulario.objects.all()
    serializer_class = FormularioSerializer


class PreguntaListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    queryset = Pregunta.objects.all()
    serializer_class = PreguntaSerializer


class RespuestaListCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    
    serializer_class = RespuestaSerializer

    def create(self, request, *args, **kwargs):
        # Verificar si se envió un conjunto de respuestas
        many = isinstance(request.data, list)
        serializer = self.get_serializer(data=request.data, many=many)

        serializer.is_valid(raise_exception=True)

        # Guardar las respuestas
        self.perform_create(serializer)

        # Recuperar las instancias guardadas
        if many:
            data = RespuestaSerializer(Respuesta.objects.filter(pk__in=[r.pk for r in serializer.instance]), many=True).data
        else:
            data = RespuestaSerializer(serializer.instance).data

        # Devolver respuesta
        return Response(data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        intento_id = uuid.uuid4()
        fecha_actual = datetime.now()
        # Sobrescribir para manejar lógica adicional
        respuestas = serializer.validated_data
        for respuesta_data in respuestas:
            respuesta_data['intento_id'] = intento_id
            respuesta_data['fecha_intento'] = fecha_actual
            pregunta = respuesta_data['pregunta']
            respuesta = respuesta_data['respuesta']

            # Verificación automática si aplica
            if pregunta.tipo == 'multiple-choice' and pregunta.correcta:
                respuesta_data['correcta'] = (respuesta == pregunta.correcta)
            
            if respuesta_data['correcta']:
                respuesta_data['nota'] = 10
            else:
                respuesta_data['nota'] = 2

        serializer.save()


class RespuestasFormularioView(APIView):   
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request, formulario_id, paciente_dni):
        # Obtener las respuestas del formulario para el paciente
        respuestas = Respuesta.objects.filter(
            pregunta__formulario_id=formulario_id,
            paciente__dni=paciente_dni
        ).select_related('pregunta', 'paciente', 'pregunta__formulario')

        if not respuestas.exists():
            return Response({"detail": "No se encontraron respuestas para este formulario y paciente."}, status=404)

        # Obtener los datos del formulario
        formulario = respuestas.first().pregunta.formulario
        formulario_data = {
            "id": formulario.id,
            "nombre": formulario.nombre,
            "descripcion": formulario.descripcion,
            "es_verificacion_automatica": formulario.es_verificacion_automatica,
        }

        # Serializar las respuestas
        serializer = RespuestaSerializer(respuestas, many=True)

        # Combinar los datos del formulario con las respuestas
        response_data = {
            "formulario": formulario_data,
            "respuestas": serializer.data
        }

        return Response(response_data)

    
class CrearComentarioProfesionalView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = ComentarioProfesional.objects.all()
    serializer_class = ComentarioProfesionalSerializer

class ActualizarNotaRespuestaView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def patch(self, request, respuesta_id):
        try:
            respuesta = Respuesta.objects.get(id=respuesta_id)
        except Respuesta.DoesNotExist:
            return Response({"error": "Respuesta no encontrada."}, status=status.HTTP_404_NOT_FOUND)
        
        nota = request.data.get("nota")
        if nota is None:
            return Response({"error": "El campo 'nota' es requerido."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            respuesta.nota = float(nota)
            respuesta.save()
            return Response({"mensaje": "Nota actualizada correctamente."}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({"error": "El valor de 'nota' debe ser un número válido."}, status=status.HTTP_400_BAD_REQUEST)
        
      

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import FormularioPacienteRevision


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def registrar_respuesta(request):
    formulario_id = request.data.get('formulario_id')
    paciente_dni = request.data.get('paciente_dni')
    verificado_automatico = request.data.get('verificado_automatico', False)
    revision = not verificado_automatico

    # Crear una nueva entrada sin modificar las existentes
    nueva_respuesta = FormularioPacienteRevision.objects.create(
        formulario_id=formulario_id,
        paciente_dni=paciente_dni,
        revision=revision,
        verificado_automatico=verificado_automatico,
    )
    return Response({
        "status": "ok",
        "formulario_id": formulario_id,
        "paciente_dni": paciente_dni,
        "fecha_respuesta": nueva_respuesta.fecha_respuesta,
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def habilitar_revision(request, revision_id, paciente_dni):
    revision_entry = FormularioPacienteRevision.objects.filter(
        formulario_id=revision_id, paciente_dni=paciente_dni
    ).order_by('-fecha_respuesta').first()

    if not revision_entry:
        return Response({"error": "Revisión no encontrada"}, status=404)

    revision_entry.revision = False  
    revision_entry.save()
    return Response({"status": "ok", "revision": revision_entry.revision})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def habilitar_volver_a_realizar(request, revision_id, paciente_dni):
    revision_entry = FormularioPacienteRevision.objects.filter(
        formulario_id=revision_id, paciente_dni=paciente_dni
    ).order_by('-fecha_respuesta').first()

    if not revision_entry:
        return Response({"error": "Revisión no encontrada"}, status=404)

    revision_entry.volver_a_realizar = True
    revision_entry.save()
    return Response({"status": "ok", "volver_a_realizar": revision_entry.volver_a_realizar})


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def marcar_correcta(request, respuesta_id):
    """Marca una respuesta como correcta (1)."""
    respuesta = get_object_or_404(Respuesta, id=respuesta_id)
    respuesta.correcta = True
    respuesta.save()
    return Response({"status": "ok", "mensaje": "Respuesta marcada como correcta", "correcta": respuesta.correcta})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def marcar_incorrecta(request, respuesta_id):
    """Marca una respuesta como incorrecta (0)."""
    respuesta = get_object_or_404(Respuesta, id=respuesta_id)
    respuesta.correcta = False
    respuesta.save()
    return Response({"status": "ok", "mensaje": "Respuesta marcada como incorrecta", "correcta": respuesta.correcta})



@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def obtener_estado_revision(request):
    formulario_id = request.query_params.get('formulario_id')
    username = request.query_params.get('username')
    
    if not formulario_id or not username:
        return Response({"error": "Los parámetros formulario_id y paciente_dni son requeridos."}, status=400)

    try:
        paciente_dni = obtener_dni(username)

        # Verificar si existen respuestas para el paciente en ese formulario
        tiene_respuestas = Respuesta.objects.filter(
            pregunta__formulario_id=formulario_id,
            paciente__dni=paciente_dni
        ).exists()

        # Obtener la última revisión
        try:
            revision_entry = FormularioPacienteRevision.objects.filter(
                formulario_id=formulario_id, paciente_dni=paciente_dni
            ).latest('fecha_respuesta')

            return Response({
                "revision": revision_entry.revision,
                "volver_a_realizar": revision_entry.volver_a_realizar,
                "tiene_respuestas": tiene_respuestas
            })
        except FormularioPacienteRevision.DoesNotExist:
            return Response({
                "revision": False,
                "volver_a_realizar": False,
                "tiene_respuestas": tiene_respuestas
            })

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def verificar_formulario_completado(request, formulario_id, username):
    paciente_dni = obtener_dni(username) 
    try:
        entry = FormularioPacienteRevision.objects.filter(
            formulario_id=formulario_id,
            paciente_dni=paciente_dni,
            volver_a_realizar=False
        ).latest('fecha_respuesta')  # Seleccionar la entrada más reciente
        
        return Response({
            "status": "completado",
            "formulario_id": formulario_id,
            "paciente_dni": paciente_dni,
            "fecha_respuesta": entry.fecha_respuesta,
        })
    except FormularioPacienteRevision.DoesNotExist:
        return Response({
            "status": "no_completado",
            "formulario_id": formulario_id,
            "paciente_dni": paciente_dni,
        })    
    
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import FormularioPacienteRevision

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import FormularioPacienteRevision

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def listar_formularios_completados(request, username):
    """
    Lista el formulario más reciente para cada formulario_id asociado al paciente.
    """
    paciente_dni = obtener_dni(username)
    try:
        # Obtener el formulario más reciente para cada formulario_id
        formularios = (
            FormularioPacienteRevision.objects.filter(
                paciente_dni=paciente_dni,
                volver_a_realizar=False  # Solo formularios completados
            )
            .values('formulario_id')  # Agrupar por formulario_id
            .annotate(ultima_fecha=Max('fecha_respuesta'))  # Obtener la fecha más reciente
        )

        # Filtrar los registros originales para obtener las tuplas completas
        formularios_mas_recientes = FormularioPacienteRevision.objects.filter(
            paciente_dni=paciente_dni,
            volver_a_realizar=False,
            fecha_respuesta__in=[f['ultima_fecha'] for f in formularios]  # Fechas más recientes
        ).values('formulario_id', 'fecha_respuesta', 'revision', 'verificado_automatico')

        return Response(list(formularios_mas_recientes), status=200)

    except Exception as e:
        return Response({'error': str(e)}, status=500)


    
class ObtenerEvaluaciones(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def get(self, request):
        username = request.query_params.get('username')
        objetivo_id = request.query_params.get('objetivo_id')
        try:
            # Obtener el ID del usuario
            try:
                user_id = obtener_dni(username) 
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)

            # Filtrar los formularios asociados al usuario y objetivo
            formularios = PersonaObjetivoEvaluacion.objects.filter(
                user_id=user_id,
                objetivo_id=objetivo_id
            ).exclude(
                evaluacion__isnull=True  # Asegurarse de que haya evaluación asociada
            # COMENTADO LO DE BRANCH DEVELOP:
            # ).values(
            #     'evaluacion__id', 
            #     'evaluacion__nombre', 
            #     'evaluacion__descripcion', 
            #     'evaluacion__es_verificacion_automatica', 
            #     'evaluacion__fecha_creacion'
            # )

            # # Transformar los datos en una lista de diccionarios
            # formularios_list = [
            #     {
            #         'id': formulario['evaluacion__id'],
            #         'nombre': formulario['evaluacion__nombre'],
            #         'descripcion': formulario['evaluacion__descripcion'],
            #         'es_verificacion_automatica': formulario['evaluacion__es_verificacion_automatica'],
            #         'fecha_creacion': formulario['evaluacion__fecha_creacion']
            #     }
            #     for formulario in formularios
            # ]
            # ESTO VIENE DE Paciente Interfaz ----
            ).select_related('evaluacion').prefetch_related(
                'evaluacion__preguntas__opciones'
            )

            # Serializar los formularios utilizando el FormularioSerializer
            formularios_serializados = FormularioSerializer(
                [f.evaluacion for f in formularios], 
                many=True
            )
            # ---- hasta acá PacienteInterface

            # Devolver los resultados en formato JSON
            return Response({'formularios': formularios_serializados.data}, status=status.HTTP_200_OK)
        
        except Exception as e:
            # Manejo de errores genéricos
            return Response(
                {'error': 'Ocurrió un error al obtener los formularios.', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MarcarVideoVistoView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def post(self, request):
        try:
            try:
                user_id = obtener_dni(request.data['paciente_id'])
                request.data['paciente_id'] = user_id
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist as e:
                return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


            # Serializar los datos enviados
            serializer = VideosVistosSerializer(data=request.data)
            
            # Validar los datos
            if serializer.is_valid():
                # Crear una nueva instancia del modelo usando el método `create`
                video_visto = serializer.save()
                
                return Response(
                    {
                        "message": "Video registrado como visto.",
                        "video_visto_id": video_visto.id,
                    },
                    status=status.HTTP_201_CREATED,
                )
            else:
                print(serializer.errors)  # <-- Agrega esto para ver el error exacto
                return Response(
                    {"errors": serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        
        except Exception as e:
            return Response(
                {"error": f"Error al registrar el video como visto: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        

@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def check_cookie(request):
    # Verificar si la cookie 'jwt' está presente
    if 'jwt' in request.COOKIES:
        return JsonResponse({"exists": True})
    return JsonResponse({"exists": False})


class ComentariosListaAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    '''
        Interfaz que devuelve un hashset de comentarios agrupados por hilo principal.
    '''
    def get(self, request, *args, **kwargs):
        try:
            # Obtener el id_escena desde los parámetros de consulta
            id_escena = request.query_params.get('id_escena', None)

            if not id_escena:
                return Response(
                    {"error": "El parámetro 'id_escena' es requerido."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Obtener todos los comentarios de la escena
            comentarios = Comentario.objects.filter(escena_id=id_escena).values('id', 'comentario_contestado')

            # Crear un diccionario temporal para mapear cada comentario con su comentario_contestado
            comentarios_map = {}
            for comentario in comentarios:
                comentarios_map[comentario['id']] = comentario['comentario_contestado']

            # Crear el hashset final usando la función de recursión
            hashset = {}
            for comentario_id in comentarios_map.keys():
                hilo_principal = self._obtener_hilo_principal(comentarios_map, comentario_id)
                if hilo_principal not in hashset:
                    hashset[hilo_principal] = []
                if comentarios_map[comentario_id]:  # Si tiene un comentario contestado, agrégalo como respuesta
                    hashset[hilo_principal].append(comentario_id)

            # Eliminar duplicados en las listas del hashset
            for key in hashset:
                hashset[key] = list(set(hashset[key]))

            return Response({"hashset": hashset}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error inesperado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _obtener_hilo_principal(self, comentarios_map, comentario_id):
        """
        Función recursiva para encontrar el hilo principal de un comentario.
        """
        comentario_contestado = comentarios_map.get(comentario_id)
        if comentario_contestado is None:  # Es un comentario principal
            return comentario_id
        return self._obtener_hilo_principal(comentarios_map, comentario_contestado)
        
class ComentarioDetalleAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    """
    Endpoint para obtener un comentario específico por ID, incluyendo información
    del usuario que comentó y, si es una respuesta, del usuario al que se responde.
    """
    def get(self, request):
        # Obtener el parámetro id_comentario
        id_comentario = request.query_params.get('idComentario')

        # Validar que el parámetro esté presente
        if not id_comentario:
            return Response(
                {"error": "El parámetro 'idComentario' es obligatorio."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Buscar el comentario por ID con sus relaciones
            comentario = Comentario.objects.select_related(
                'user',
                'comentario_contestado',
                'comentario_contestado__user'
            ).get(id=id_comentario)

            # Construir la respuesta
            response_data = {
                "id": comentario.id,
                "texto": comentario.texto,
                "visibilidad": comentario.visibilidad,
                "usuario": comentario.user.nombre,  # Nombre del usuario que comentó
                "idComentarioPadre": None,  # Valor por defecto
            }

            # Si es una respuesta a otro comentario, incluir información adicional
            if comentario.comentario_contestado:
                response_data.update({
                    "idComentarioPadre": comentario.comentario_contestado.id,
                    "usuarioRespondido": comentario.comentario_contestado.user.nombre
                })


            return Response(response_data, status=status.HTTP_200_OK)

        except Comentario.DoesNotExist:
            return Response(
                {"error": "No se encontró un comentario con el ID proporcionado."},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"error": f"Error inesperado: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from django.shortcuts import get_object_or_404
from decimal import Decimal
from collections import defaultdict

from datetime import date

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def calcular_edad(fecha_nac):
    hoy = date.today()
    return hoy.year - fecha_nac.year - ((hoy.month, hoy.day) < (fecha_nac.month, fecha_nac.day))

@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def guardar_registro_evaluacion(username, formulario_id):
    paciente = get_object_or_404(User, username=username)
    formulario = get_object_or_404(Formulario, id=formulario_id)
    objetivo = formulario.objetivo
    #patologias = paciente.patologias.all()
    edad_paciente = calcular_edad(paciente.fecha_nac)
    # Obtener todas las preguntas del formulario con su escena asociada
    preguntas_por_escena = defaultdict(list)
    preguntas = Pregunta.objects.filter(formulario=formulario).select_related("escena")

    for pregunta in preguntas:
        preguntas_por_escena[pregunta.escena].append(pregunta)

    registros = []
    for escena, preguntas in preguntas_por_escena.items():
        # Obtener la última respuesta de cada pregunta
        ultimas_respuestas = []
        for pregunta in preguntas:
            ultima_respuesta = Respuesta.objects.filter(
                paciente=paciente, pregunta=pregunta
            ).order_by('-fecha_intento').first()
            
            if ultima_respuesta:
                ultimas_respuestas.append(ultima_respuesta)


        total_preguntas = len(ultimas_respuestas)
        correctas = sum(1 for respuesta in ultimas_respuestas if respuesta.correcta)
        resultado_escena = (correctas / total_preguntas) * 100 if total_preguntas > 0 else 0
        
        registro = RegistroEvaluacion.objects.create(
            objetivo=objetivo,
            paciente=paciente,
            edad= edad_paciente, 
            escena=escena,
            complejidad=escena.complejidad,
            resultado=Decimal(resultado_escena),
        )
        #registro.patologias.set(patologias)
        registros.append(registro)

    return registros




from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])  
def calcular_nota_api(request):
    username = request.data.get("username")
    formulario_id = request.data.get("formulario_id")  # Se usa el formulario enviado

    registros = guardar_registro_evaluacion(username, formulario_id)

    return Response({"mensaje": "Evaluación guardada", "total_registros": len(registros)})



class PacienteListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = User.objects.filter(role='paciente')
    serializer_class = UserSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

class TerapeutaListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    
    queryset = User.objects.filter(role='terapeuta')
    serializer_class = UserSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

class GroupListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = Grupo.objects.all()
    serializer_class = GroupSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

class PacienteDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = User.objects.filter(role='paciente')
    serializer_class = UserSerializer

class TerapeutaDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = User.objects.filter(role='terapeuta')
    serializer_class = UserSerializer

class GroupDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    queryset = Grupo.objects.all()
    serializer_class = GroupSerializer


@api_view(['GET'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])

def obtener_notificaciones_pendientes(request):
    print("Request user: ",request.user)
    # Filtrar notificaciones pendientes para el usuario actual
    notificaciones = Notificacion.objects.filter(
        destinatario=request.user, estado='pendiente'
    ).values('id', 'mensaje', 'timestamp')  # Puedes incluir más campos según lo que necesites

    return JsonResponse({'notificaciones': list(notificaciones)})

from django.http import JsonResponse
from django.contrib.contenttypes.models import ContentType
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def obtener_detalle_notificacion(request, pk):
    try:
        # Buscar la notificación por id y asegurarse de que pertenece al usuario autenticado
        notificacion = Notificacion.objects.get(id=pk, destinatario=request.user)

        # Inicializar el detalle de la notificación
        detalle = {
            'id': notificacion.id,
            'mensaje': notificacion.mensaje,
            'timestamp': notificacion.timestamp,
            'estado': notificacion.estado,
            'remitente': notificacion.remitente.username if notificacion.remitente else None,
            'destinatario': notificacion.destinatario.username if notificacion.destinatario else None,
        }

        # Verificar si la notificación está asociada a una escena
        if notificacion.content_type and notificacion.object_id:
            content_type = ContentType.objects.get_for_id(notificacion.content_type.id)
            if content_type.model == 'escena':  # Ajusta el nombre del modelo según corresponda
                escena = content_type.get_object_for_this_type(id=notificacion.object_id)
                detalle['escena'] = {             
                    'nombre': escena.nombre,  # Ajusta los campos según el modelo Escena
                    'link': escena.link,  # Ajusta si tienes un campo `link`
                }        
        
        if notificacion.content_type and notificacion.object_id:
            content_type = ContentType.objects.get_for_id(notificacion.content_type.id)
            if content_type.model == 'objetivo':  # Ajusta el nombre del modelo según corresponda
                objetivo = content_type.get_object_for_this_type(id=notificacion.object_id)
                detalle['objetivo'] = {             
                    'nombre': objetivo.nombre,  # Ajusta los campos según el modelo Escena
                    'video_explicativo': objetivo.escena.link,  # Ajusta si tienes un campo `link`
                    'descripcion': objetivo.descripcion,
                }
                # Agregar los links de las escenas vinculadas al objetivo
                escenas_vinculadas = EscenaObjetivo.objects.filter(objetivo=objetivo).select_related('escena')
                detalle['escenas_vinculadas'] = [
                    {
                        'id': escena_obj.escena.id,
                        'link': escena_obj.escena.link,  # Asegúrate de que el modelo Escena tenga un campo `link`
                    }
                    for escena_obj in escenas_vinculadas
                ]

                # Agregar los nombres de los objetivos previos vinculados al objetivo
                objetivos_previos = Objetivoscumplir.objects.filter(objetivo=objetivo).select_related('objetivo_previo')
                print("ObjetivosPrevios: ",objetivos_previos)
                detalle['objetivos_previos'] = [
                    {
                        'id': obj_previo.objetivo_previo.id,
                        'nombre': obj_previo.objetivo_previo.nombre,
                    }
                    for obj_previo in objetivos_previos
                ]

        # Caso 3: Formulario
        if content_type.model == 'formulario':  
            formulario = content_type.get_object_for_this_type(id=notificacion.object_id)
            detalle['formulario'] = {
                'nombre': formulario.nombre,
                'descripcion': formulario.descripcion,
                'fecha_creacion': formulario.fecha_creacion,
            }
            # Obtener preguntas y opciones
            preguntas = formulario.preguntas.prefetch_related('opciones')
            detalle['preguntas'] = [
                {
                    'id': pregunta.id,
                    'texto': pregunta.texto,
                    'tipo': pregunta.tipo,
                    'opciones': [{'id': opcion.id, 'texto': opcion.texto} for opcion in pregunta.opciones.all()]
                }
                for pregunta in preguntas
            ]

        # Devolver los detalles de la notificación
        return JsonResponse(detalle)

    except Notificacion.DoesNotExist:
        # Manejar el caso de una notificación no encontrada o no autorizada
        return JsonResponse({'error': 'Notificación no encontrada o no autorizada'}, status=404)

    except ContentType.DoesNotExist:
        # Manejar el caso donde el ContentType no existe
        return JsonResponse({'error': 'Tipo de contenido no válido'}, status=400)

    

from api.models import User
from .models import Notificacion
from api.notificaciones.utils import actualizar_notificacion 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def procesar_notificacion(request, pk, accion):
    """
    Procesa una notificación para aceptarla o rechazarla.
    :param pk: ID de la notificación.
    :param accion: "aceptar" o "rechazar".
    """
    notificacion = get_object_or_404(Notificacion, pk=pk)


    # Verifica el tipo de objeto asociado
    content_type = notificacion.content_type
    
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
            objetivo = get_object_or_404(Objetivo, id=notificacion.object_id)
            if accion == 'aceptar':
                objetivo.habilitada = True  # Habilitar la escena
                objetivo.save()
                notificacion.estado = 'leida'        
            elif accion == 'rechazar':
                objetivo.delete()
                notificacion.estado = 'eliminada'       

        elif content_type.model == 'formulario':  # Si es una solicitud de agregar un objetivo
            formulario = get_object_or_404(Formulario, id=notificacion.object_id)
            if accion == 'aceptar':
                formulario.habilitada = True  # Habilitar la escena
                formulario.save()
                notificacion.estado = 'leida'        
            elif accion == 'rechazar':
                formulario.delete()
                notificacion.estado = 'eliminada'       

        elif content_type.model == 'escena':
            escena = get_object_or_404(Escena, id=notificacion.object_id)
            if accion == 'aceptar':
                escena.habilitada = True  # Habilitar la escena
                escena.save()
                notificacion.estado = 'leida'        
            elif accion == 'rechazar':
                escena.delete()
                notificacion.estado = 'eliminada'       

        else:
            return JsonResponse({'error': 'Tipo de objeto no soportado'}, status=400)

        notificacion.save()  # Guarda el estado de la notificación
        actualizar_notificacion(notificacion.id, notificacion.estado)
        return JsonResponse({'success': True, 'message': f'Notificación {accion}ada correctamente'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
from django.http import JsonResponse


from rest_framework.permissions import IsAuthenticated
from .models import Comentario

class ComentariosPacienteAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]

    def get(self, request, dni):
        try:
            # Verificar si el usuario tiene rol "paciente"
            user = User.objects.get(dni=dni, role='paciente')
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

class BorrarComentarioAPIView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def delete(self, request, id, *args, **kwargs):
        try:
            comentario = Comentario.objects.get(pk=id)
            comentario.delete()
            return Response({'message': 'Comentario eliminado exitosamente'}, status=status.HTTP_200_OK)
        except Comentario.DoesNotExist:
            return Response({'error': 'Comentario no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        


class CambiarVisibilidadComentarioView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [CookieJWTAuthentication]
    def patch(self, request, id):
        try:
            # Obtiene el comentario
            comentario = Comentario.objects.get(id=id)
            
            # Extrae los datos del cuerpo de la solicitud
            import json
            body = json.loads(request.body)
            nueva_visibilidad = body.get('visibilidad')
            
            if nueva_visibilidad is None:
                return JsonResponse({'error': 'Falta el campo "visibilidad"'}, status=400)
            
            # Cambia la visibilidad y guarda el comentario
            comentario.visibilidad = nueva_visibilidad
            comentario.save()
            
            return JsonResponse({'message': 'Visibilidad actualizada correctamente', 'id': comentario.id, 'visibilidad': comentario.visibilidad})
        except Comentario.DoesNotExist:
            return JsonResponse({'error': 'Comentario no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        

@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def sendmail(recipient_emails: list, subject: str, message: str):
    """
    Envía un correo electrónico a múltiples destinatarios utilizando la configuración de Django.
    
    :param recipient_emails: Lista de correos de los destinatarios
    :param subject: Asunto del correo
    :param message: Cuerpo del correo
    """
    try:
        send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER, 
            recipient_emails,
            fail_silently=False,
        )
        return {"success": True, "message": "Correo enviado exitosamente."}
    except Exception as e:
        return {"error": str(e)}

@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])
def GEMINI_chequear_comentario(username:str,comentario_usuario:str):
    # poner el encoding utf-8
    sys.stdout.reconfigure(encoding='utf-8')
    # Configurar la API de GEMINI
    genai.configure(api_key=settings.GEMINI_API_KEY)

    prompt = f"""
    Dado el siguiente comentario realizado por un paciente con trastornos del espectro autista (edad entre 4 y 20 años):

    "{comentario_usuario}"

    Evalúa el contenido del mensaje y determina si es urgente o no. Un mensaje se considera **URGENTE** si cumple con alguna de las siguientes condiciones:
    - Contiene amenazas de daño a sí mismo o a otras personas.
    - Sugiere cualquier tipo de abuso, violencia o situación fuera de la ley.
    - Contiene referencias a contenido sexual explícito, pornografía o conductas inapropiadas para menores de edad.
    - Incluye lenguaje extremadamente agresivo, insultos o acoso.
    - Expresa angustia extrema, pensamientos suicidas o signos de depresión severa.
    - Muestra confusión o indicios de que el usuario está en peligro inmediato.
    - Contiene URLs de otros sitios web no permitidos.
    - Usa malas palabras, insultos o términos vulgares, incluyendo palabras comunes en Argentina como:
    - "garchar", "pija", "concha", "coger" (tener en cuenta el contexto), "verga", "culo", "chupar".
    - Variaciones o palabras escritas al revés como "japi" (posible referencia a "pija").
    - Insultos como "boludo", "pelotudo", "tarado", "idiota", "conchudo", "hijo de puta", "forro", "mogólico" (considerado altamente ofensivo en Argentina).
    - Cualquier otra palabra ofensiva utilizada de manera inapropiada.

    Si el mensaje no cumple con ninguna de estas condiciones, se considera **NO URGENTE**.

    Devuelve la respuesta en formato JSON con la siguiente estructura:

    {
        "urgente": true/false,
        "razon": "Explicación breve de por qué se considera urgente o no."
    }
    """

    # Generar respuesta con el modelo
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)

    # Procesar la respuesta
    raw_text = response.candidates[0].content.parts[0].text

    # Eliminando las etiquetas de código ```json
    cleaned_text = raw_text.strip("```json\n").strip("\n```")
    # Convertir el JSON a un diccionario
    data = json.loads(cleaned_text)
    therapist_emails = []
    mensaje = ""
    razon = data.get('razon')
    if data.get('urgente') is True:
        try:
            patient = User.objects.get(username=username)
            therapist_emails = User.objects.filter(
                personagrupos__grupo_id__in=Personagrupo.objects.filter(
                    user_id=patient
                ).values_list('grupo_id', flat=True),
                role='terapeuta'
            ).values_list('email', flat=True)
            mensaje = f"""
Estimado/a terapeuta,

Se ha detectado un comentario urgente de un paciente en el sistema.  

**Paciente:** {username}  
**Comentario:** "{comentario_usuario}"  
**Razón de alerta:** {razon}  

Se recomienda revisar este caso a la brevedad y tomar las medidas necesarias.

Atentamente,  
El Sistema de Monitoreo Automático  
"""

            sendmail(therapist_emails, f"Alerta de Comentario Urgente - {username}", mensaje)
        except Personagrupo.DoesNotExist:
            # Manejo del caso en que no se encuentra el grupo de la persona
            print("No se encontró el grupo de la persona")
        except User.DoesNotExist:
            # Manejo del caso en que no se encuentra el usuario
            print("No se encontró el usuario")
        except Exception as e:
            # Manejo de cualquier otra excepción
            print(f"Error al enviar el correo: {e}")

    return JsonResponse({"data": data, "therapist_emails": list(therapist_emails), "mensaje": mensaje, "razon": razon})


@api_view(['POST'])
@authentication_classes([CookieJWTAuthentication])
@permission_classes([IsAuthenticated])

def forgot_password(request):
    """
    Vista para manejar la solicitud de restablecimiento de contraseña.
    Envía un correo con un enlace para restablecer la contraseña si el email existe.
    """
    try:
        email = request.data.get("email", "").strip().lower()
        
        # Validar que se proporcionó un email
        if not email:
            return Response(
                {"error": "El correo electrónico es requerido"}
            )
        
        # Validar formato del email
        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {"error": "El formato del correo electrónico no es válido"}
            )

        
        # Buscar usuario por email
        user = User.objects.filter(email=email).first()
        
        # Si no existe el usuario, retornar mensaje genérico por seguridad
        if not user:
            return Response(
                {"error": "No existe un usuario con ese mail asociado"}
            )

        # Generar token único para este usuario
        token = default_token_generator.make_token(user)
        
        # Construir URL de restablecimiento
        reset_url = f"http://localhost:3000/auth/reset-password/?token={token}&uid={user.pk}"

        # Preparar contenido del email
        email_subject = 'Restablecer tu contraseña'
        email_body = f"""
        Hola,

        Has solicitado restablecer tu contraseña. 
        Usa el siguiente enlace para crear una nueva contraseña:

        {reset_url}

        Si no solicitaste este cambio, puedes ignorar este mensaje.
        El enlace expirará en 1 hora por seguridad.

        Saludos,
        Centro Casabella
        """

        # Intentar enviar el email
        try:
            sendmail(
                [email],
                email_subject,
                email_body
            )
            return Response(
                {"message": "Recibirás un email con instrucciones brevemente..."},
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            # Registrar el error para debugging
            logger.error(f"Error enviando email de recuperación: {str(e)}")
            return Response(
                {"error": "Hubo un problema al enviar el correo. Por favor, intenta nuevamente."}
            )

    except Exception as e:
        # Registrar error general para debugging
        logger.error(f"Error en forgot_password: {str(e)}")
        return Response(
            {"error": "Ocurrió un error inesperado. Por favor, intenta nuevamente."}
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([CookieJWTAuthentication])
def reset_password(request):
    token = request.data.get('token')
    uid = request.data.get('uid')
    new_password = request.data.get('new_password')

    try:
        user = User.objects.get(pk=uid)
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    if default_token_generator.check_token(user, token):
        user.set_password(new_password)
        user.save()
        return Response({"message": "Contraseña restablecida con éxito."})
    else:
        return Response({"error": "Token inválido o expirado."}, status=400)