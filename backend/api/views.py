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
from . import views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Centrodesalud
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import Residencia 
from .models import Grupo
from django.views.decorators.csrf import csrf_exempt
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from django.core.paginator import Paginator
from django.db.models import Q
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from rest_framework.permissions import AllowAny
#User = get_user_model()  # Modelo de usuario creado por nosotros
from django.shortcuts import render
from .models import Centrodesalud, User, Grupo, Personagrupo
from .serializers import CentrodesaludSerializer, TerapeutaSerializer, PacienteSerializer, GrupoSerializer
import json
from rest_framework import generics
from rest_framework.pagination import PageNumberPagination

from django.views.decorators.csrf import csrf_exempt
import json
from .models import Grupo, Personagrupo, User



#User = get_user_model()  # Modelo de usuario creado por nosotros

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Personagrupo

class UpdateGroupAssociationsView(APIView):
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
@permission_classes([IsAuthenticated])
def delete_person_group(request, grupo_id, user_id):
    try:
        # Buscar la relación en la tabla Personagrupo
        relacion = Personagrupo.objects.get(grupo_id=grupo_id, user_id_id=user_id)
        relacion.delete()
        return Response({"message": "Relación eliminada correctamente."}, status=status.HTTP_200_OK)
    except Personagrupo.DoesNotExist:
        return Response({"error": "Relación no encontrada."}, status=status.HTTP_404_NOT_FOUND)




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






# Vista para obtener los centros de salud
@permission_classes([AllowAny])
def get_health_centers(request):
    centros = Centrodesalud.objects.all()
    serializer = CentrodesaludSerializer(centros, many=True)
    return JsonResponse(serializer.data, safe=False)

# Vista para obtener los terapeutas
@permission_classes([AllowAny])
def get_patients(request):
    pacientes = User.objects.filter(role='paciente')  # Filtrar por el rol de 'paciente'
    print(pacientes)
    serializer = PacienteSerializer(pacientes, many=True)
    return JsonResponse(serializer.data, safe=False)


# Vista para obtener los pacientes
@permission_classes([AllowAny])
def get_therapists(request):
    terapeutas = User.objects.filter(role='terapeuta')  # Filtrar por el rol de 'terapeuta'
    print(terapeutas)
    serializer = TerapeutaSerializer(terapeutas, many=True)
    return JsonResponse(serializer.data, safe=False)


# Vista para crear un grupo
@permission_classes([AllowAny])
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




@permission_classes([AllowAny])
class DynamicPagination(PageNumberPagination):
    page_size_query_param = "limit"
    max_page_size = 20
    page_size = 4


@csrf_exempt  # Asegúrate de no tener problemas con CSRF
@permission_classes([AllowAny])
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

#El siguiente metodo trae las provincias y ciudades para la lista desplegable de la creacion de un centro
@permission_classes([AllowAny])
def get_provinces_and_cities(request):
    provinces = Residencia.objects.values('provincia').distinct()
    cities = Residencia.objects.values('ciudad').distinct()
    return JsonResponse({
        "provinces": list(provinces),
        "cities": list(cities),
    })



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_health_center(request, center_id):
    try:
        center = Centrodesalud.objects.get(id=center_id)
        center.delete()
        return Response({"message": "Centro de salud eliminado correctamente."}, status=status.HTTP_200_OK)
    except Centrodesalud.DoesNotExist:
        return Response({"error": "Centro de salud no encontrado."}, status=status.HTTP_404_NOT_FOUND)

@permission_classes([AllowAny])
def listar_centros_de_salud(request):
    """
    Retorna una lista de todos los centros de salud disponibles.
    """
    centros = Centrodesalud.objects.all().values('id', 'nombre', 'direccion_id_dir__provincia', 'direccion_id_dir__ciudad', 'direccion_id_dir__calle', 'direccion_id_dir__numero')
    centros_list = list(centros)
    return JsonResponse(centros_list, safe=False)

@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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
            max_age=60 * 60
        )
        
        return response
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    response = Response({"message": "Logout successful"})
    # Borrar la cookie JWT
    response.delete_cookie('jwt')
    return response

@api_view(['GET'])
@permission_classes([AllowAny])
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
    
@permission_classes([AllowAny])
def objetivos_list(request):
    objetivos = Objetivo.objects.all().values()  # Obtiene todos los objetivos 
    return JsonResponse(list(objetivos), safe=False)

@permission_classes([AllowAny])
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

@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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
@permission_classes([AllowAny])
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


@permission_classes([AllowAny])
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

@permission_classes([AllowAny])
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
   


@api_view(['GET'])
@permission_classes([AllowAny])
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