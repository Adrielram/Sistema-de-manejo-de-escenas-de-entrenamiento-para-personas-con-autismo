from rest_framework import serializers
from .models import *
from datetime import datetime


class UserSerializer(serializers.ModelSerializer):
    nombre_padre = serializers.CharField(source='user_id_padre.nombre', read_only=True)

    class Meta:
        model = User
        fields = ['dni', 'nombre', 'fecha_nac', 'genero', 'role', 'user_id_padre', 'nombre_padre']

# Primero define los serializadores
class CentrodesaludSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centrodesalud
        fields = ['id', 'nombre']


#    def to_representation(self, instance):
#        # Solo devolver usuarios con rol 'terapeuta'
#        if instance.role != 'terapeuta':
#            return None
#        return super().to_representation(instance)


class PacienteSerializer(serializers.ModelSerializer):
    padreACargo = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'nombre', 'dni', 'padreACargo']

    def get_padreACargo(self, obj):
        return obj.user_id_padre.nombre if obj.user_id_padre else ''

class ObjetivoSerializer(serializers.ModelSerializer):
   video_explicativo = serializers.SerializerMethodField()
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
        fields = ['id', 'nombre', 'descripcion', 'video_explicativo_id','video_explicativo', 'centro_profesional', 'escenas', 'objetivos']

   def get_video_explicativo(self, obj):
        # Accedemos a la relación escena para obtener el link
        return obj.escena.link if obj.escena else None

   def create(self, validated_data):
        escenas_data = validated_data.pop('escenas', [])
        objetivos_data = validated_data.pop('objetivos', [])
        
        objetivo = Objetivo.objects.create(**validated_data)
        print(escenas_data)
        for escena_id in escenas_data:
            EscenaObjetivo.objects.create(
                objetivo=objetivo, 
                escena=escena_id,
            )
        
        for objetivo_previo in objetivos_data:
            Objetivoscumplir.objects.create(objetivo=objetivo, objetivo_previo=objetivo_previo)
        
        return objetivo

   
   def update(self, instance, validated_data):
        escenas_data = validated_data.pop('escenas', [])
        objetivos_data = validated_data.pop('objetivos', [])

        # Actualizar los campos normales del objetivo
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Actualizar escenas
        EscenaObjetivo.objects.filter(objetivo=instance).delete()
        for escena_id in escenas_data:
            EscenaObjetivo.objects.create(
                objetivo=instance,
                escena=escena_id
            )

        # Actualizar objetivos previos
        Objetivoscumplir.objects.filter(objetivo=instance).delete()
        for objetivo_previo_id in objetivos_data:
            Objetivoscumplir.objects.create(
                objetivo=instance, 
                objetivo_previo=objetivo_previo_id
            )

        return instance


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
    condicionFields = serializers.DictField(write_only=True, required=False)

    class Meta:
            model = Escena
            fields = [
                'id',
                'idioma',
                'acento',
                'condicion',       # Campo de lectura
                'condicionFields', # Campo de escritura para la condición
                'complejidad',
                'link',
                'nombre',
                'descripcion'
            ]

    def create(self, validated_data):
        condicion_data = validated_data.pop('condicion', None)  # Extraer datos de la condición si existen

        escena = Escena.objects.create(**validated_data)  # Crear la escena

        if condicion_data:
            condicion = Condicion.objects.create(**condicion_data)  # Crear la condición
            escena.condicion = condicion  # Asociar la condición con la escena
            
        escena.save()  # Guardar cambios en la escena
        
        return escena


    def update(self, instance, validated_data):
        # Extraer la información de condición (si se envió)
        condicion_data = validated_data.pop('condicionFields', None)

        # Actualizar los campos propios de la escena
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.idioma = validated_data.get('idioma', instance.idioma)
        instance.acento = validated_data.get('acento', instance.acento)
        instance.complejidad = validated_data.get('complejidad', instance.complejidad)
        instance.link = validated_data.get('link', instance.link)
        instance.save()

        # Si se enviaron datos de condición, procesarlos
        if condicion_data is not None:
            # Extraer los valores a comparar
            edad = condicion_data.get('edad')
            fecha = condicion_data.get('fecha')
            # Se asume que 'objetivo_id' es el valor enviado para identificar el objetivo.
            objetivo = condicion_data.get('objetivo_id')

            
            nueva_condicion = Condicion.objects.create(**condicion_data)
            instance.condicion = nueva_condicion

            # Se asigna la condición (nueva o reutilizada) a la escena.
            # La condición anterior (si hubiera) queda en la base de datos sin borrarse.
            instance.save()

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
    nombre_escena = serializers.SerializerMethodField(read_only=True)


    class Meta:
        model = Pregunta
        fields = ['id', 'texto', 'tipo', 'opciones', 'correcta', 'escena', 'nombre_escena']

    def create(self, validated_data):
        opciones_data = validated_data.pop('opciones', [])
        pregunta = Pregunta.objects.create(**validated_data)
        for opcion_data in opciones_data:
            Opcion.objects.create(pregunta=pregunta, **opcion_data)
        return pregunta
    def get_nombre_escena(self, obj):        
        return obj.escena.nombre if obj.escena else None

class FormularioSerializer(serializers.ModelSerializer):
    preguntas = PreguntaSerializer(many=True)
    
    class Meta:
        model = Formulario
        fields = ['id', 'nombre', 'descripcion', 'es_verificacion_automatica', 'creado_por', 'preguntas', 'objetivo_id']


    def create(self, validated_data):
        preguntas_data = validated_data.pop('preguntas')
        formulario = Formulario.objects.create(**validated_data)
        for pregunta_data in preguntas_data:
            opciones_data = pregunta_data.pop('opciones', [])
            pregunta = Pregunta.objects.create(formulario=formulario, **pregunta_data)
            for opcion_data in opciones_data:
                Opcion.objects.create(pregunta=pregunta, **opcion_data)
        # Crear PersonaObjetivoEvaluacion para cada PersonaObjetivoEscena relacionada
        for persona_objetivo_escena in PersonaObjetivoEscena.objects.filter(escena_objetivo__objetivo=formulario.objetivo_id):
            if not PersonaObjetivoEvaluacion.objects.filter(
            user_id=persona_objetivo_escena.user_id,
            objetivo_id=formulario.objetivo_id,
            evaluacion=formulario
            ).exists():
                PersonaObjetivoEvaluacion.objects.create(
                    user_id=persona_objetivo_escena.user_id,
                    objetivo_id=formulario.objetivo_id,
                    resultado='',
                    progreso=0,
                    evaluacion=formulario
                )
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
        fields = ['id', 'paciente_id', 'escena_id', 'fecha', 'like']
        extra_kwargs = {
            'id': {'read_only': True},
            'fecha': {'read_only': True},
        }

    def create(self, validated_data):
        return super().create(validated_data)


class GrupoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'centrodesalud_id']


#class FormularioSerializer(serializers.ModelSerializer):
#    class Meta:
#        model = Formulario
#        fields = ['id', 'nombre', 'descripcion', 'es_verificacion_automatica', 'creado_por', 'fecha_creacion']


class PatologiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patologia
        fields = ['id', 'nombre', 'descripcion']

class ObjetivoSerializerList(serializers.ModelSerializer):
    class Meta:
        model = Objetivo
        fields = ['id', 'nombre', 'descripcion']

class PersonaObjetivoEvaluacionSerializer(serializers.ModelSerializer):
    objetivo_id = ObjetivoSerializerList()  # Usamos el serializer más simple para evitar anidaciones complejas
    class Meta:
        model = PersonaObjetivoEvaluacion
        fields = ['id', 'user_id', 'objetivo_id', 'resultado', 'progreso', 'evaluacion']
        #depth = 1  # Esto permitirá incluir datos relacionados como el `username` y nombres de los objetivos en lugar de solo sus IDs

class EvaluacionIdSerializer(serializers.ModelSerializer):
    evaluacion = serializers.IntegerField()
    class Meta:
        model = PersonaObjetivoEvaluacion
        fields = ['evaluacion']

class EscenaObjetivoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EscenaObjetivo
        fields = ['escena', 'objetivo' ]

class PersonaObjetivoEscenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonaObjetivoEscena
        fields = ['id', 'user_id', 'escena_objetivo', 'orden', 'es_alternativo' ]



class TerapeutaSerializer(UserSerializer):
    class Meta:
        model = User
        fields = ['dni', 'nombre']

    def to_representation(self, instance):
        # Solo devolver usuarios con rol 'terapeuta'
        if instance.role != 'terapeuta':
            return None
        return super().to_representation(instance)

class PacienteSerializer2(UserSerializer):
    class Meta:
        model = User
        fields = ['dni', 'nombre']

    def to_representation(self, instance):
        # Solo devolver usuarios con rol 'paciente'
        if instance.role != 'paciente':
            return None
        return super().to_representation(instance)


class GroupSerializer(serializers.ModelSerializer):
    nombre_centro = serializers.CharField(source='centrodesalud.nombre', read_only=True)
    class Meta:
        model = Grupo
        fields = ['id', 'nombre', 'nombre_centro']


