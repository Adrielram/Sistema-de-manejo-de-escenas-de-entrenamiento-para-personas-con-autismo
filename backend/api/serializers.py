from rest_framework import serializers
from .models import User, Objetivo, Escena, CentroProfesional, Residencia, EscenaObjetivo, Objetivoscumplir, Centrodesalud, Grupo, Comentario, Videosvistos
from datetime import datetime

class PacienteSerializer(serializers.ModelSerializer):
    padreACargo = serializers.CharField(source='user_id_padre.nombre', read_only=True)
    class Meta:
        model = User
        fields = ['username', 'nombre', 'dni', 'padreACargo']

    def get_padreACargo(self, obj):
        return obj.user_id_padre.nombre if obj.user_id_padre else ''
    
class ObjetivoSerializer(serializers.ModelSerializer):
    video_explicativo_id = serializers.PrimaryKeyRelatedField(
        queryset=Escena.objects.all(), source='escena'
    )  # Relación con la escena del video explicativo
    centro_salud_id = serializers.PrimaryKeyRelatedField(
        queryset=CentroProfesional.objects.all()
    )  # Relación con centro de salud
    profesional_id = serializers.PrimaryKeyRelatedField(
        queryset=CentroProfesional.objects.all()
    )  # Relación con profesional

    class Meta:
        model = Objetivo
        fields = ['id', 'nombre', 'descripcion', 'video_explicativo_id', 'centro_salud_id', 'profesional_id']

    def create(self, validated_data):
        # Extraer el video explicativo y las escenas
        video_explicativo = validated_data.pop('escena')
        escenas_ids = validated_data.pop('escenas', [])
        objetivos_ids = validated_data.pop('objetivos', [])
        # Crear el objetivo
        objetivo = Objetivo.objects.create(escena=video_explicativo, **validated_data)
        # Crear las relaciones EscenaObjetivo
        for escena_id in escenas_ids:
            escena = Escena.objects.get(id=escena_id)
            EscenaObjetivo.objects.create(objetivo=objetivo, escena=escena)
        for objetivo_id in objetivos_ids:
            objetivo_previo = Objetivo.objects.get(id=objetivo_id)
            Objetivoscumplir.objects.create(objetivo=objetivo, objetivo_previo=objetivo_previo)
        return objetivo

class ObjetivoSerializerList(serializers.ModelSerializer):
    class Meta:
        model = Objetivo
        fields = ['id', 'nombre', 'descripcion']



class ResidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Residencia
        fields = ['id_dir','provincia', 'ciudad', 'calle', 'numero']

class ResidenciaAllSerializer(serializers.ModelSerializer):
    class Meta:
        model = Residencia
        fields = '__all__'  # Incluye todos los campos del modelo Residencia

class UserSerializer(serializers.ModelSerializer):
    fecha_nac = serializers.SerializerMethodField()  # Personalizar la representación
    residencia = ResidenciaAllSerializer(source='direccion_id_dir', read_only=True)
    padreACargo = serializers.CharField(source='user_id_padre.nombre', read_only=True)

    def get_fecha_nac(self, obj):
        # Convertir fecha_nac a date si es un datetime
        if isinstance(obj.fecha_nac, datetime):
            return obj.fecha_nac.date()
        return obj.fecha_nac  # Si ya es un date o None, retornarlo directamente

    class Meta:
        model = User
        fields = ['dni', 'nombre', 'fecha_nac', 'genero', 'role', 'residencia', 'padreACargo']


class EscenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escena
        fields = ['id', 'idioma', 'acento', 'condiciones', 'complejidad', 'link', 'nombre']

class CentroSaludSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Centrodesalud
        fields = ['id', 'nombre', 'direccion_id_dir']

from rest_framework import serializers
from .models import Formulario, Pregunta, Opcion, Respuesta


class OpcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Opcion
        fields = ['texto']

class PreguntaSerializer(serializers.ModelSerializer):
    opciones = OpcionSerializer(many=True, required=False)

    class Meta:
        model = Pregunta
        fields = ['id', 'texto', 'tipo', 'opciones', 'correcta']

    def create(self, validated_data):
        opciones_data = validated_data.pop('opciones', [])
        pregunta = Pregunta.objects.create(**validated_data)
        for opcion_data in opciones_data:
            Opcion.objects.create(pregunta=pregunta, **opcion_data)
        return pregunta


class FormularioSerializer(serializers.ModelSerializer):
    preguntas = PreguntaSerializer(many=True)

    class Meta:
        model = Formulario
        fields = ['titulo', 'descripcion', 'es_verificacion_automatica', 'creado_por', 'preguntas']

    def create(self, validated_data):
        preguntas_data = validated_data.pop('preguntas')
        formulario = Formulario.objects.create(**validated_data)
        for pregunta_data in preguntas_data:
            opciones_data = pregunta_data.pop('opciones', [])
            pregunta = Pregunta.objects.create(formulario=formulario, **pregunta_data)
            for opcion_data in opciones_data:
                Opcion.objects.create(pregunta=pregunta, **opcion_data)
        return formulario


from rest_framework import serializers

class BulkRespuestaSerializer(serializers.ListSerializer):
    def create(self, validated_data):
        # Crea múltiples instancias de Respuesta a la vez
        respuestas = [Respuesta(**item) for item in validated_data]
        # Guarda las respuestas en la base de datos
        respuestas_guardadas = Respuesta.objects.bulk_create(respuestas)
        return respuestas_guardadas  


class ProfesionalCentroSerializer(serializers.ModelSerializer):  
    class Meta:
        model = CentroProfesional
        fields = ['centrodesalud', 'profesional']

class PatientGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'centrodesalud_id']

from .models import ComentarioProfesional
class ComentarioProfesionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComentarioProfesional
        fields = '__all__'

class RespuestaSerializer(serializers.ModelSerializer):
    comentarios = ComentarioProfesionalSerializer(many=True, read_only=True)
    nombre_pregunta = serializers.SerializerMethodField()
    class Meta:
        model = Respuesta
        fields = ['id', 'pregunta', 'paciente', 'respuesta', 'correcta', 'nota', 'comentarios', 'nombre_pregunta', 'intento_id', 'fecha_intento']
        list_serializer_class = BulkRespuestaSerializer

    def get_nombre_pregunta(self, obj):        
        return obj.pregunta.texto if obj.pregunta else None

class ComentarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comentario
        fields = [
            'id',
            'user',
            'escena',
            'comentario_contestado',
            'texto',
            'visibilidad',
        ]

class VideosVistosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Videosvistos
        fields = ['persona_objetivo_escena', 'visto']

    def create(self, validated_data):
        return super().create(validated_data)