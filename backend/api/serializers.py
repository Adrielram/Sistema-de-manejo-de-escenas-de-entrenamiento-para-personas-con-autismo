from rest_framework import serializers
from .models import User, Objetivo, Grupo

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


from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    nombre_padre = serializers.CharField(source='user_id_padre.nombre', read_only=True)

    class Meta:
        model = User
        fields = ['dni', 'nombre', 'fecha_nac', 'genero', 'role', 'user_id_padre', 'nombre_padre']

class GroupSerializer(serializers.ModelSerializer):
    nombre_centro = serializers.CharField(source='centrodesalud.nombre', read_only=True)
    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'nombre_centro']

