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
    

def objetivos_list(request):
    objetivos = Objetivo.objects.all().values()  # Obtiene todos los objetivos 
    return JsonResponse(list(objetivos), safe=False)

def obj_list_user(request, user_id):
    objetivos = Objetivo.objects.filter(user_id=user_id).values()  # Obtiene los objetivos del usuario
    return JsonResponse(list(objetivos), safe=False)
    ## CHEQUEAR ESTE BIEN

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
    def post(self, request, *args, **kwargs):
        try:
            persona_objetivo_escena_id = request.data.get('persona_objetivo_escena_id') 

            if not persona_objetivo_escena_id:
                return Response(
                    {'error': 'Error al obtener datos. Se requiere el ID de la Persona Objetivo Escena.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificamos si existe el objeto PersonaObjetivoEscena
            try:
                persona_objetivo_escena = PersonaObjetivoEscena.objects.get(id=persona_objetivo_escena_id)
            except PersonaObjetivoEscena.DoesNotExist:
                return Response(
                    {'error': 'Persona objetivo escena no encontrada'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Intentamos crear un nuevo registro de video visto
            video_visto, created = Videosvistos.objects.get_or_create(
                persona_objetivo_escena=persona_objetivo_escena,
                defaults={'visto': True}
            )

            if created:
                return Response(
                    {'message': 'Video marcado como visto correctamente'},
                    status=status.HTTP_201_CREATED  # Nuevo registro creado
                )
            else:
                return Response(
                    {'message': 'El video ya estaba marcado como visto'},
                    status=status.HTTP_200_OK  # Registro ya existente
                )

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
                "texto": comentario.texto if comentario.visibilidad else "Comentario oculto",
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
