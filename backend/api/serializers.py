from rest_framework import serializers
from .models import User, Objetivo, Escena, EscenaObjetivo, Objetivoscumplir

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
    escenas = serializers.ListField(
        child=serializers.IntegerField(), write_only=True
    )  # Lista de IDs de escenas relacionadas

    objetivos = serializers.ListField(
        child=serializers.IntegerField(), write_only=True
    )  # Lista de IDs de objetivos relacionados

    class Meta:
        model = Objetivo
        fields = ['id', 'nombre', 'descripcion', 'video_explicativo_id', 'escenas', 'objetivos']

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

class EscenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escena
        fields = ['id', 'idioma', 'acento', 'edad', 'complejidad', 'link', 'nombre']