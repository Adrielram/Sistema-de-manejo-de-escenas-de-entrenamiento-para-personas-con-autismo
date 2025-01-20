from rest_framework import serializers
from .models import User, Objetivo, Escena, CentroProfesional, Centrodesalud

class PacienteSerializer(serializers.ModelSerializer):
    padreACargo = serializers.SerializerMethodField()

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
        # Extraer el video explicativo
        video_explicativo = validated_data.pop('escena')

        # Crear el objetivo con los datos validados
        objetivo = Objetivo.objects.create(escena=video_explicativo, **validated_data)

        return objetivo

class ObjetivoSerializerList(serializers.ModelSerializer):
    class Meta:
        model = Objetivo
        fields = ['id', 'nombre', 'descripcion']

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
        fields = ['texto', 'tipo', 'opciones', 'correcta']

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


class RespuestaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Respuesta
        fields = '__all__'
