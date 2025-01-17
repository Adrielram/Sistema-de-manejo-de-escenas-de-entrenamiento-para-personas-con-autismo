from rest_framework import serializers
from .models import User, Objetivo, Escena, CentroProfesional, Residencia, Centrodesalud

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



class ResidenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Residencia
        fields = ['id_dir','provincia', 'ciudad', 'calle', 'numero']

class UserSerializer(serializers.ModelSerializer):
    direccion = ResidenciaSerializer(source='direccion_id_dir')

    class Meta:
        model = User
        fields = ['dni', 'nombre', 'fecha_nac', 'genero', 'role', 'direccion']

class EscenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Escena
        fields = ['id', 'idioma', 'acento', 'condiciones', 'complejidad', 'link', 'nombre']

class CentroSaludSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Centrodesalud
        fields = ['id', 'nombre', 'direccion_id_dir']