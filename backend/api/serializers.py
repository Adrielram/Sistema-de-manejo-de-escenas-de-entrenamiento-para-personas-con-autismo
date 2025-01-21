from rest_framework import serializers
from .models import User, Objetivo, Escena, CentroProfesional, Centrodesalud, Grupo
from .models import User, Objetivo, Escena, CentroProfesional, Centrodesalud, Comentario, Videosvistos, Grupo

# Primero define los serializadores
class CentrodesaludSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centrodesalud
        fields = ['id', 'nombre']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['dni', 'nombre']

class TerapeutaSerializer(UserSerializer):
    class Meta:
        model = User
        fields = ['dni', 'nombre']

    def to_representation(self, instance):
        # Solo devolver usuarios con rol 'terapeuta'
        if instance.role != 'terapeuta':
            return None
        return super().to_representation(instance)

class PacienteSerializer(UserSerializer):
    class Meta:
        model = User
        fields = ['dni', 'nombre']

    def to_representation(self, instance):
        # Solo devolver usuarios con rol 'paciente'
        if instance.role != 'paciente':
            return None
        return super().to_representation(instance)

# Ahora define el GrupoSerializer
class GrupoSerializer(serializers.ModelSerializer):
    terapeutas = TerapeutaSerializer(many=True)
    pacientes = PacienteSerializer(many=True)
    centrodesalud = CentrodesaludSerializer()

    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'centrodesalud', 'terapeutas', 'pacientes']

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
