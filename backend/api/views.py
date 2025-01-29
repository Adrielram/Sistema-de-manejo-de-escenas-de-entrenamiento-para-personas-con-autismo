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
from datetime import datetime
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from django.db import transaction
from django.db.models import Prefetch

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
    
@api_view(['GET'])
def objetivos_list(request):
    objetivos = Objetivo.objects.all().values()  # Obtiene todos los objetivos 
    return JsonResponse(list(objetivos), safe=False)

'''
@api_view(['GET'])
def obj_list_user(request, user_id):
    objetivos = PersonaObjetivoEscena.objects.filter(user_id=user_id).values()  # Obtiene los objetivos del usuario
    return JsonResponse(list(objetivos), safe=False)
    ## CHEQUEAR ESTE BIEN
'''
'''
@api_view(['GET'])
def obtener_objetivos_usuario(request):
    # Obtén el 'username' del request
    username = request.GET.get('username', None)

    if not username:
        return JsonResponse({'error': 'El campo username es requerido.'}, status=400)

    # Filtra el usuario por 'username' y obtiene su DNI
    try:
        usuario = User.objects.get(username=username)  # Usa .get() para obtener un único registro
    except User.DoesNotExist:
        return JsonResponse({'error': 'Usuario no encontrado.'}, status=404)

    dni = usuario.dni

    # Filtra las relaciones en PersonaObjetivoEscena asociadas al usuario por su ID
    relaciones = PersonaObjetivoEscena.objects.filter(user_id=dni)

    # Obtén los nombres y IDs de los objetivos relacionados
    objetivos = Objetivo.objects.filter(
        id__in=relaciones.values_list('escena_objetivo', flat=True)
    ).values('id', 'nombre')

    # Formatea los resultados para incluir 'titulo' en lugar de 'nombre'
    resultados = [
        {'id': objetivo['id'], 'titulo': objetivo['nombre']}
        for objetivo in objetivos
    ]

    # Retorna los resultados en formato JSON
    return JsonResponse(resultados, safe=False)
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

class VerificarEscenaAsignadaView(APIView):
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

'''class EscenaView(generics.ListAPIView):
    queryset = Escena.objects.all().prefetch_related(
        Prefetch(
            'escenaobjetivo_set',
            queryset=EscenaObjetivo.objects.select_related('objetivo').prefetch_related(
                Prefetch(
                    'objetivo__escenaobjetivo_set',
                    queryset=EscenaObjetivo.objects.all()
                )
            )
        )
    )
    serializer_class = EscenaSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

'''
class EscenaView(generics.ListAPIView):
    queryset = Escena.objects.all().prefetch_related(
        Prefetch(
            'escenaobjetivo_set',
            queryset=EscenaObjetivo.objects.select_related('objetivo').prefetch_related(
                Prefetch(
                    'objetivo__escenaobjetivo_set',
                    queryset=EscenaObjetivo.objects.order_by('orden')
                )
            )
        )
    )
    serializer_class = EscenaSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        user = request.user
        
        # Obtener escenas vistas por el usuario
        user_vistos_ids = set()
        if user.is_authenticated:
            user_vistos_ids = set(
                Videosvistos.objects.filter(paciente_id=user)
                .values_list('escena_id', flat=True)
            )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            serialized_data = serializer.data
            
            # Calcular estado de bloqueo para cada escena
            for escena, data_item in zip(page, serialized_data):
                bloqueada = False
                for eo in escena.escenaobjetivo_set.all():
                    current_order = eo.orden
                    if current_order is None or current_order == 1:
                        continue  # No hay requisitos previos
                    
                    # Obtener requisitos previos de este objetivo
                    prereqs = [
                        eo_obj.escena_id
                        for eo_obj in eo.objetivo.escenaobjetivo_set.all()
                        if eo_obj.orden is not None and eo_obj.orden < current_order
                    ]
                    
                    # Verificar si faltan requisitos
                    for prereq_id in prereqs:
                        if prereq_id not in user_vistos_ids:
                            bloqueada = True
                            break
                    if bloqueada:
                        break
                
                data_item['bloqueada'] = bloqueada
            
            return self.get_paginated_response(serialized_data)

        # Caso sin paginación
        serializer = self.get_serializer(queryset, many=True)
        serialized_data = serializer.data
        
        for escena, data_item in zip(queryset, serialized_data):
            bloqueada = False
            for eo in escena.escenaobjetivo_set.all():
                current_order = eo.orden
                if current_order is None or current_order == 1:
                    continue
                
                prereqs = [
                    eo_obj.escena_id
                    for eo_obj in eo.objetivo.escenaobjetivo_set.all()
                    if eo_obj.orden is not None and eo_obj.orden < current_order
                ]
                
                for prereq_id in prereqs:
                    if prereq_id not in user_vistos_ids:
                        bloqueada = True
                        break
                if bloqueada:
                    break
            
            data_item['bloqueada'] = bloqueada
        
        return Response(serialized_data)


class ObjetivoFilter(filters.FilterSet):
    query = filters.CharFilter(field_name='nombre', lookup_expr='icontains')

    class Meta:
        model = Objetivo
        fields = ['query']

class ObjetivoBusquedaView(generics.ListAPIView):
    serializer_class = ObjetivoSerializerList
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = ObjetivoFilter
    pagination_class = None

    def get_queryset(self):
        username = self.request.query_params.get('username', None)
        query = self.request.query_params.get('query', '')

        if not username:
            return Objetivo.objects.none()

        try:
            usuario = User.objects.get(username=username)
        except User.DoesNotExist:
            return Objetivo.objects.none()

        # Filtra los objetivos relacionados al usuario a través de PersonaObjetivoEscena y EscenaObjetivo
        queryset = Objetivo.objects.filter(
            id__in=EscenaObjetivo.objects.filter(
                id__in=PersonaObjetivoEscena.objects.filter(
                    user_id=usuario
                ).values_list('escena_objetivo_id', flat=True)
            ).values_list('objetivo_id', flat=True)
        )

    # Si el query está vacío después de limpiar, devuelve todo el queryset
        if not query:
            return queryset

        return queryset.filter(nombre__icontains=query)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Asegúrate de que el formato de respuesta incluya id y titulo
        data = [{'id': item['id'], 'titulo': item['nombre'], 'descripcion': item['descripcion']} for item in serializer.data]
        return Response(data)

    

'''
class EscenasPorObjetivoListView(generics.ListAPIView):
    #queryset = Escena.objects.all()
    serializer_class = EscenaSerializer
    #pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        # Obtén el ID del objetivo del request
        objetivo_id = self.request.GET.get('objetivo_id', None)
        if not objetivo_id:
            return Escena.objects.none()  # Devuelve un queryset vacío si no hay objetivo_id

        # Filtra las relaciones por el ID del objetivo
        relaciones = EscenaObjetivo.objects.filter(objetivo=objetivo_id)
        return Escena.objects.filter(
            id__in=relaciones.values_list('escena', flat=True)
        )
'''

class EscenasPorObjetivoListView(generics.ListAPIView):
    serializer_class = EscenaSerializer
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        # Obtén el ID del objetivo y el usuario de la request
        objetivo_id = self.request.GET.get('objetivo_id', None)
        username = self.request.query_params.get('username', None)

        if not objetivo_id:
            return Escena.objects.none()  # Devuelve un queryset vacío si no hay objetivo_id

        # Filtra las relaciones por el ID del objetivo
        relaciones = EscenaObjetivo.objects.filter(objetivo=objetivo_id)

        # Obtén las escenas asociadas al objetivo (TODAS)
        escenas_objetivo = Escena.objects.filter(
            id__in=relaciones.values_list('escena', flat=True)
        )

        # Filtra las escenas que el usuario no ha visto
        #escenas_vistas = Videosvistos.objects.filter(
        #    persona_objetivo_escena__persona=username,
        #    persona_objetivo_escena__objetivo_id=objetivo_id,
        #    visto=True
        #).values_list('persona_objetivo_escena__escena_id', flat=True)

        return escenas_objetivo


class PacienteListView(APIView):
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

        

class retrieve_user(APIView):
    
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
    
@api_view(['PUT'])
def update_user(request):
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

class ObjetivosListView(generics.ListAPIView):    
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

def obtener_dni(username):
    if not username:
        raise ValueError("Se requiere el parámetro username")
    try:
        user = User.objects.get(username=username)
        return user.dni
    except User.DoesNotExist:
        raise User.DoesNotExist(f"No se encontró un usuario con username: {username}")

@api_view(['GET'])
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
    def post(self, request):
        data = request.data.copy()

        # Intentar convertir `user` al DNI
        try:
            data['user'] = obtener_dni(request.data['user'])
        except Exception as e:
            return Response({'error': f'Error obteniendo el DNI: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Si `comentario_respondido` no es 0 o None, buscar el comentario correspondiente
        comentario_respondido_id = data.get('comentario_respondido', None)
        if comentario_respondido_id:
            try:
                comentario_contestado = Comentario.objects.get(id=comentario_respondido_id)
                data['comentario_contestado'] = comentario_contestado.id
            except Comentario.DoesNotExist:
                return Response({'error': 'El comentario al que se está respondiendo no existe.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            data['comentario_contestado'] = None

        # Pasar los datos modificados al serializer
        serializer = ComentarioSerializer(data=data)
        if serializer.is_valid():
            serializer.save()  # Guardar el comentario
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Si el serializer no es válido, retornar los errores
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class EscenasSegunUsuarioObjetivo(APIView):
    def get(self, request):
        objetivo_id = request.query_params.get('objetivo_id')

        if not objetivo_id:
            return Response({'error': 'Se requiere el parámetro objetivo_id'}, status=status.HTTP_400_BAD_REQUEST)

        # Obtener las escenas relacionadas al objetivo
        escena_objetivos = EscenaObjetivo.objects.filter(objetivo_id=objetivo_id)
        if not escena_objetivos.exists():
            return Response({'error': 'No se encontraron escenas para el objetivo proporcionado'}, status=status.HTTP_404_NOT_FOUND)

        # Obtener los IDs de las escenas relacionadas
        escena_ids = escena_objetivos.values_list('escena_id', flat=True)

        # Consultar las escenas para obtener los links
        escenas = Escena.objects.filter(id__in=escena_ids).values('id', 'link')

        return Response(list(escenas), status=status.HTTP_200_OK)
    
class ObtenerLinksEvaluaciones(APIView):
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
                objetivo_id=objetivo_id
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

class ObtenerPersonaObjetivoID(APIView):
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
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

def check_cookie(request):
    # Verificar si la cookie 'jwt' está presente
    if 'jwt' in request.COOKIES:
        return JsonResponse({"exists": True})
    return JsonResponse({"exists": False})

class ComentariosListaAPIView(APIView):
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
