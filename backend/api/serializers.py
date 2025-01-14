from rest_framework import serializers
from .models import User, Objetivo, PersonaObjetivoEvaluacion

class PacienteSerializer(serializers.ModelSerializer):
    padreACargo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'nombre', 'dni', 'padreACargo']

    def get_padreACargo(self, obj):
        return obj.user_id_padre.nombre if obj.user_id_padre else ''

class ObjetivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objetivo
        fields = ['id', 'nombre', 'descripcion', 'escena']


class PersonaObjetivoEvaluacionSerializer(serializers.ModelSerializer):
    objetivo = ObjetivoSerializer()

    class Meta:
        model = PersonaObjetivoEvaluacion
        fields = ['progreso', 'objetivo', 'resultado']