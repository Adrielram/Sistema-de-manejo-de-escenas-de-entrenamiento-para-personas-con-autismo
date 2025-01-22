from rest_framework import serializers
from .models import User, Objetivo, Escena, CentroProfesional, EscenaObjetivo, Objetivoscumplir, Centrodesalud, Grupo

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
        fields = ['id', 'idioma', 'acento', 'condiciones', 'complejidad', 'link', 'nombre']

class CentroSaludSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Centrodesalud
        fields = ['id', 'nombre', 'direccion_id_dir']

class ProfesionalCentroSerializer(serializers.ModelSerializer):  
    class Meta:
        model = CentroProfesional
        fields = ['centrodesalud', 'profesional']

class PatientGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'centrodesalud_id']

class GrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'centrodesalud_id']
