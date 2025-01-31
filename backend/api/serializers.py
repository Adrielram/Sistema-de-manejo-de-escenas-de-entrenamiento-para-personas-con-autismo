from rest_framework import serializers
from .models import *
from datetime import datetime

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
   )
   centro_profesional = serializers.PrimaryKeyRelatedField(
       queryset=CentroProfesional.objects.all()
   )
   escenas = serializers.PrimaryKeyRelatedField(
       many=True,
       queryset=Escena.objects.all(),
       required=False
   )
   objetivos = serializers.PrimaryKeyRelatedField(
       many=True, 
       queryset=Objetivo.objects.all(),
       required=False
   )

   class Meta:
       model = Objetivo
       fields = ['id', 'nombre', 'descripcion', 'video_explicativo_id', 'centro_profesional', 'escenas', 'objetivos']

   def create(self, validated_data):
       escenas_data = validated_data.pop('escenas', [])
       objetivos_data = validated_data.pop('objetivos', [])
       
       objetivo = Objetivo.objects.create(**validated_data)
       
       for escena in escenas_data:
           EscenaObjetivo.objects.create(objetivo=objetivo, escena=escena)
           
       for objetivo_previo in objetivos_data:
           Objetivoscumplir.objects.create(objetivo=objetivo, objetivo_previo=objetivo_previo)
           
       return objetivo
   
   def update(self, instance, validated_data):
        # Actualizar los campos básicos
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.escena = validated_data.get('escena', instance.escena)
        instance.centro_profesional = validated_data.get('centro_profesional', instance.centro_profesional)

        # Manejar escenas
        if 'escenas' in validated_data:
            # Eliminar las relaciones existentes
            EscenaObjetivo.objects.filter(objetivo=instance).delete()
            # Crear las nuevas relaciones
            for escena in validated_data['escenas']:
                EscenaObjetivo.objects.create(objetivo=instance, escena=escena)

        # Manejar objetivos previos
        if 'objetivos' in validated_data:
            # Eliminar las relaciones existentes
            Objetivoscumplir.objects.filter(objetivo=instance).delete()
            # Crear las nuevas relaciones
            for objetivo_previo in validated_data['objetivos']:
                Objetivoscumplir.objects.create(objetivo=instance, objetivo_previo=objetivo_previo)

        instance.save()
        return instance

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

class CondicionSerializer(serializers.ModelSerializer):
    objetivo = serializers.CharField(source='objetivo.nombre', read_only=True) 
    objetivo_id = serializers.PrimaryKeyRelatedField(queryset=Objetivo.objects.all(), source='objetivo')

    class Meta:
        model = Condicion
        fields = ['id', 'edad', 'objetivo', 'objetivo_id', 'fecha']

class EscenaSerializer(serializers.ModelSerializer):
    condicion = CondicionSerializer(required=False, allow_null=True)

    class Meta:
        model = Escena
        fields = ['id', 'idioma', 'acento', 'condicion', 'complejidad', 'link', 'nombre', 'descripcion']

    def create(self, validated_data):
        # Extract condicion data if present
        condicion_data = validated_data.pop('condicion', None)
        
        # Create Escena instance
        escena = Escena.objects.create(**validated_data)
        
        # Create associated Condicion if data is provided
        if condicion_data:
            Condicion.objects.create(escena=escena, **condicion_data)
        
        return escena

    def update(self, instance, validated_data):
        # Extract condicion data if present
        condicion_data = validated_data.pop('condicion', None)
        
        # Update Escena fields
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.idioma = validated_data.get('idioma', instance.idioma)
        instance.acento = validated_data.get('acento', instance.acento)
        instance.complejidad = validated_data.get('complejidad', instance.complejidad)
        instance.link = validated_data.get('link', instance.link)
        
        # Save the updated instance
        instance.save()
        
        # Handle Condicion update
        if condicion_data:
            # If a condicion already exists, update it
            if hasattr(instance, 'condicion'):
                condicion = instance.condicion
                for attr, value in condicion_data.items():
                    setattr(condicion, attr, value)
                condicion.save()
            # If no condicion exists, create a new one
            else:
                Condicion.objects.create(escena=instance, **condicion_data)
        # If condicion_data is None and a condicion exists, delete it
        elif hasattr(instance, 'condicion'):
            instance.condicion.delete()
        
        return instance



class CentroSaludSerializer(serializers.ModelSerializer):  
    class Meta:
        model = Centrodesalud
        fields = ['id', 'nombre', 'direccion_id_dir']


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
        fields = ['id','nombre', 'descripcion', 'es_verificacion_automatica', 'creado_por', 'preguntas']

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

class ProfesionalCentroSerializer(serializers.ModelSerializer):  
    class Meta:
        model = CentroProfesional
        fields = ['centrodesalud', 'profesional']

class PatientGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'centrodesalud_id']

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
    
class VideosvistosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Videosvistos
        fields = ['id', 'paciente_id', 'escena_id', 'fecha', 'like']
        extra_kwargs = {
            'id': {'read_only': True},
            'fecha': {'read_only': True},
        }

    def create(self, validated_data):
        # Personalizar la creación de la instancia del modelo
        return Videosvistos.objects.create(**validated_data)


class GrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'centrodesalud_id']

class PatologiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patologia
        fields = ['id', 'nombre', 'descripcion']

