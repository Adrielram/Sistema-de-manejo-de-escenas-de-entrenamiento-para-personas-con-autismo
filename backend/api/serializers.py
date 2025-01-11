from rest_framework import serializers
from .models import User, Objetivo, Escena

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
        fields = ['id', 'titulo', 'descripcion', 'escena']

class EscenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escena
        fields = ['id', 'idioma', 'acento', 'complejidad', 'link', 'nombre']