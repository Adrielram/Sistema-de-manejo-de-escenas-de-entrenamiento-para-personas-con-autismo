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
from rest_framework import viewsets, status
from datetime import datetime
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from rest_framework.exceptions import NotFound

#User = get_user_model()  # Modelo de usuario creado por nosotros

import json

from rest_framework import generics
from rest_framework.pagination import PageNumberPagination

class DynamicPagination(PageNumberPagination):
    page_size_query_param = "limit"
    max_page_size = 20
    page_size = 4

def check_cookie(request):
    # Verificar si la cookie 'jwt' está presente
    if 'jwt' in request.COOKIES:
        return JsonResponse({"exists": True})
    return JsonResponse({"exists": False})

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

@api_view(['GET'])
def get_goal_data(request, objetivo_id):
    try:
        # Obtener el objetivo principal
        objetivo = Objetivo.objects.get(pk=objetivo_id)
        
        # Obtener la escena explicativa asociada
        escena_explicativa = {
            "id": objetivo.escena.id,
            "nombre": objetivo.escena.nombre,
            "idioma": objetivo.escena.idioma,
            "acento": objetivo.escena.acento,
            "complejidad": objetivo.escena.complejidad,
            "link": objetivo.escena.link,
        }

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
            for relacion in EscenaObjetivo.objects.filter(objetivo=objetivo)
        ]

        # Preparar la respuesta
        response = {
            "id": objetivo.id,
            "nombre": objetivo.nombre,
            "descripcion": objetivo.descripcion,
            "escena_explicativa": escena_explicativa,
            "escenas_relacionadas": escenas_relacionadas,
        }

        return JsonResponse(response, status=200)
    except Objetivo.DoesNotExist:
        return JsonResponse({"error": "Objetivo no encontrado"}, status=404)
        
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
    centro_profesional = filters.NumberFilter(field_name='centro_profesional', lookup_expr='exact')

    def __init__(self, *args, **kwargs):
        model = kwargs.pop('model', None)
        if model:
            self._meta.model = model
        super().__init__(*args, **kwargs)

    class Meta:
        model = None  # Se establece dinámicamente
        fields = ['nombre', 'centro_profesional']

class ObjetivosListView(generics.ListAPIView):    
    queryset = Objetivo.objects.all()
    serializer_class = ObjetivoSerializerList
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

class EscenaListView(generics.ListAPIView):
    queryset = Escena.objects.all()
    serializer_class = EscenaSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter


class CentrosSaludListView(generics.ListAPIView):
    queryset = Centrodesalud.objects.all()
    serializer_class = CentroSaludSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

def get_related_centers(self):
        username = self.kwargs.get('username')
        profesional = User.objects.get(username=username)
        return CentroProfesional.objects.filter(profesional=profesional).values_list('centrodesalud', flat=True)

class NotAssociatedCentersListView(generics.ListAPIView):
    serializer_class = CentroSaludSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

    def get_queryset(self):
        related_centers = get_related_centers(self)
        # Filtra los centros de salud donde el profesional no esté relacionado
        return Centrodesalud.objects.exclude(id__in=related_centers)
    
class AssociatedCentersListView(generics.ListAPIView):
    serializer_class = CentroSaludSerializer
    pagination_class = DynamicPagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NameFilter

    def get_queryset(self):
        related_centers = get_related_centers(self)
        # Filtra los centros de salud donde el profesional no esté relacionado
        return Centrodesalud.objects.filter(id__in=related_centers)

class AssociateCenterView(generics.CreateAPIView):
    serializer_class = ProfesionalCentroSerializer

    def create(self, request, *args, **kwargs):
        username = request.data.get('center')
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
    serializer_class = PatientGroupSerializer

    def create(self, request, *args, **kwargs):
        try:
            # Obtener la instancia del centro de salud
            center_name = request.data.get('nombre_centro')
            center = Centrodesalud.objects.get(nombre=center_name)

            # Crear el grupo
            nombre_grupo = request.data.get('nombre_grupo')
            print("Nombre grupo ",nombre_grupo)
            grupo = Grupo.objects.create(
                nombre=nombre_grupo,
                centrodesalud_id=center  # Usar la instancia directamente
            )

            # Serializar el grupo para la respuesta
            grupo_serialized = PatientGroupSerializer(grupo).data

            return Response({
                'message': 'Grupo creado exitosamente',
                'group': grupo_serialized
            }, status=status.HTTP_201_CREATED)

        except Centrodesalud.DoesNotExist:
            return Response({
                'error': f'Centro de salud con nombre "{center_name}" no encontrado.'
            }, status=status.HTTP_404_NOT_FOUND)

        except IntegrityError:
            return Response({
                'error': f'El grupo con nombre "{request.data.get("nombre_grupo")}" ya existe.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
class DisassociateCenterView(generics.CreateAPIView):
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

class GetCentroProfesionalView(generics.RetrieveAPIView):
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
            
            return Objetivo.objects.filter(centro_profesional=centro_profesional)

        except Centrodesalud.DoesNotExist:
            raise NotFound('Centro de salud no encontrado')
        except User.DoesNotExist:
            raise NotFound('Usuario no encontrado')
        except CentroProfesional.DoesNotExist:
            raise NotFound('Relación centro-profesional no encontrada')
        
class DeleteGoalView(generics.DestroyAPIView):
    queryset = Objetivo.objects.all() 
    serializer_class = ObjetivoSerializer

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
        # Modificar el campo 'user' para usar el DNI
        try:
            data['user'] = obtener_dni(request.data['user'])
        except Exception as e:
            return Response({'error': f'Error obteniendo el DNI: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        
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
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)