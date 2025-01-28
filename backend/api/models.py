from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

class Centrodesalud(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=100)
    direccion_id_dir = models.ForeignKey('Residencia', on_delete=models.CASCADE, db_column='direccion_id_dir')

    class Meta:
        db_table = 'centroDeSalud'

class Residencia(models.Model):
    id_dir = models.AutoField(primary_key=True)
    provincia = models.CharField(max_length=40)
    ciudad = models.CharField(max_length=40)
    calle = models.CharField(max_length=40)
    numero = models.IntegerField()
    piso = models.IntegerField(blank=True, null=True)
    num_depto = models.IntegerField(blank=True, null=True)
    class Meta:  
        db_table = 'residencia'

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('terapeuta', 'Terapeuta'),
        ('paciente', 'Paciente'),
        ('padre', 'Padre')
    ]
    dni = models.IntegerField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=255)
    fecha_nac = models.DateTimeField()
    genero = models.CharField(max_length=255)
    role = models.CharField(max_length=255, choices=ROLE_CHOICES, default='paciente')
    direccion_id_dir = models.ForeignKey('Residencia', on_delete=models.CASCADE, db_column='direccion_id_dir')
    user_id_padre = models.ForeignKey('self', on_delete=models.SET_NULL, db_column='user_id_padre', blank=True, null=True)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups'
    )  
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions'
    )  
    patologia = models.CharField(max_length=255, blank=True, null=True)

    class Meta: 
        db_table = 'user'

class Escena(models.Model):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=255)
    idioma = models.CharField(max_length=40)
    acento = models.CharField(max_length=40, default="neutro")
    complejidad = models.IntegerField()
    condicion = models.OneToOneField('Condicion',related_name='escenas', on_delete=models.CASCADE,blank=True,null=True)
    link = models.CharField(max_length=2000)
    nombre = models.CharField(max_length=100, default="Sin Nombre")
    class Meta:
        db_table = 'escena'


class Grupo(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(
        max_length=100, 
        unique=True, 
        null=False
    )
    centrodesalud_id = models.ForeignKey(
        Centrodesalud, 
        on_delete=models.CASCADE, 
        db_column='centroDeSalud_id'
    )

    class Meta:
        db_table = 'grupo'

class CentroProfesional(models.Model):
    centrodesalud = models.ForeignKey(
        Centrodesalud, 
        on_delete=models.CASCADE
    )
    profesional = models.ForeignKey(
        User, 
        on_delete=models.CASCADE
    )

    class Meta:
        db_table = 'centroProfesional'
        constraints = [
            models.UniqueConstraint(
                fields=['centrodesalud', 'profesional'],
                name='unique_centrodesalud_profesional'
            )
        ]

class Objetivo(models.Model):
    # Elimina la línea del id manual o cámbiala por:
    id = models.AutoField(primary_key=True)  # Aunque esto es implícito en Django y no es necesario declararlo
    nombre = models.CharField(
        max_length=100, 
        default="Sin Nombre",
        unique=True,
        null=False,
        blank=False
    )
    descripcion = models.CharField(max_length=255)
    escena = models.ForeignKey(
        Escena, 
        on_delete=models.PROTECT, 
        related_name='objetivo_explicativo'
    )
    centro_profesional = models.ForeignKey(
        CentroProfesional, 
        on_delete=models.CASCADE, 
        db_column='centroProfesional_id',
        related_name='objetivo_centro_salud_id'
    )
    class Meta:   
        db_table = 'objetivo'
     

class CentroProfesionalEscena(models.Model):    
    escena_id = models.ForeignKey(
        Escena, 
        on_delete=models.CASCADE
    )
    centro_profesional = models.ForeignKey(
        CentroProfesional, 
        on_delete=models.CASCADE,  
        related_name='centro_profesional_id'
    )

    class Meta:
        db_table = 'centroProfesionalEscena'
        constraints = [
            models.UniqueConstraint(
                fields=['centro_profesional', 'escena_id'], 
                name='unique_centro_salud_profesional_escena'
            )
        ]

class EscenaObjetivo(models.Model):
    escena = models.ForeignKey('Escena', on_delete=models.CASCADE)
    objetivo = models.ForeignKey('Objetivo', on_delete=models.CASCADE)
    orden = models.IntegerField(blank=True, null=True)
    class Meta:
        db_table = 'escenaObjetivo'
        constraints = [
            models.UniqueConstraint(
                fields=['escena', 'objetivo'], 
                name='unique_escena_objetivo'
            )
        ]
class Personagrupo(models.Model):
    user_id = models.ForeignKey(
        'User', 
        on_delete=models.CASCADE, 
        related_name='personagrupos'
    )
    grupo_id = models.ForeignKey(
        Grupo, 
        on_delete=models.CASCADE, 
        related_name='miembros'
    )

    class Meta:
        db_table = 'personaGrupo'
        constraints = [
            models.UniqueConstraint(
                fields=['user_id', 'grupo_id'], 
                name='unique_user_grupo'
            )
        ]

class PersonaObjetivoEscena(models.Model):
    id = models.AutoField(primary_key=True)    
    user_id = models.ForeignKey('User', on_delete=models.CASCADE)
    escena_objetivo = models.ForeignKey(
        'EscenaObjetivo',
        on_delete=models.SET_NULL,
        related_name='objetivo_relations',
        db_column='objetivo_id',
        blank=True,
        null=True
    )

    class Meta:
        db_table = 'personaEscenaObjetivo'
        constraints = [
            models.UniqueConstraint(
                fields=['user_id', 'escena_objetivo'],
                name='unique_user_escena_objetivo'
            )
        ]

class Objetivoscumplir(models.Model):
    objetivo = models.ForeignKey(
        Objetivo, 
        on_delete=models.CASCADE
    )
    objetivo_previo = models.ForeignKey(
        Objetivo,
        on_delete=models.CASCADE,
        db_column='objetivo_previo',
        related_name='objetivoscumplir_objetivo_previo_set'
    )

    class Meta:
        db_table = 'objetivosCumplir'
        constraints = [
            models.UniqueConstraint(
                fields=['objetivo', 'objetivo_previo'], 
                name='unique_objetivo_objetivo_previo'
            )
        ]

class Condicion(models.Model):
    id = models.AutoField(primary_key=True)
    edad = models.IntegerField(blank=True, null=True)
    objetivo = models.ForeignKey('Objetivo', on_delete=models.CASCADE, null=True)
    escena = models.OneToOneField('Escena',related_name='condiciones', on_delete=models.CASCADE, null=True)
    fecha = models.DateTimeField(blank=True, null=True)
    class Meta:
        db_table = 'condicion'

class PersonaObjetivoEvaluacion(models.Model):
    user_id = models.ForeignKey('User', on_delete=models.CASCADE)
    objetivo_id = models.ForeignKey('Objetivo', on_delete=models.CASCADE)  
    resultado = models.TextField(blank=True, null=True)
    progreso = models.IntegerField()
    evaluacion = models.ForeignKey(
        'Formulario', 
        on_delete=models.CASCADE, 
        blank=True, 
        null=True
    )

    class Meta:    
        db_table = 'personaObjetivoEvaluacion'
        constraints = [
            models.UniqueConstraint(
                fields=['user_id', 'objetivo_id', 'evaluacion'], 
                name='unique_user_objetivo_evaluacion'
            )
        ]

class Videosvistos(models.Model):
    id = models.AutoField(primary_key=True)
    paciente_id =  models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        related_name='videosvistos_paciente_id',
    )
    escena_id =  models.ForeignKey(
        'Escena',
        on_delete=models.CASCADE,
        related_name='videosvistos_escena_id',
    )
    fecha = models.DateTimeField(auto_now_add=True)
    like = models.BooleanField(blank=True, null=True)
    class Meta:     
        db_table = 'videosVistos'
        constraints = [
            models.UniqueConstraint(
                fields=['paciente_id','escena_id', 'id'],
                name='unique_escena_user_videos_vistos'
            )
        ]

class Comentario(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='comentarios_user'
    )
    escena = models.ForeignKey(
        Escena, 
        on_delete=models.CASCADE, 
        related_name='comentarios_escena'
    )
    comentario_contestado = models.ForeignKey(
        'Comentario',
        on_delete=models.CASCADE,
        related_name='comentarios_comentario_contestado',
        blank=True,
        null=True
    )
    texto = models.TextField(blank=True, null=True)
    visibilidad = models.BooleanField(default=True)

    class Meta:
        db_table = 'comentario'
        constraints = [
            models.UniqueConstraint(
                fields=['id', 'user', 'escena'],
                name='unique_escena_user_comentario'
            )
        ]

class Notificacion(models.Model):
    class Meta:
        db_table = 'notificacion'
    # Usuario destinatario (admin o terapeuta)
    destinatario = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notificaciones_recibidas'
    )
    # Usuario que envía la notificación
    remitente = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notificaciones_enviadas'
    )
    # Mensaje de la notificación
    mensaje = models.TextField()
    # Estado de la notificación
    estado = models.CharField(
        max_length=50, 
        choices=[
            ('pendiente', 'Pendiente'),
            ('leida', 'Leída'),
            ('eliminada', 'Eliminada'),
        ],
        default='pendiente'
    )
    # Marca de tiempo
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"De {self.remitente} a {self.destinatario} - {self.estado}"
    

    class Meta:
        db_table = 'notificacion'



class Patologia(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(max_length=255)

    class Meta:
        db_table = 'patologia'

    def __str__(self):
        return self.nombre
    
def validate_percentage(value):
    if value < 0 or value > 100:
        raise ValidationError('El valor de certeza debe estar entre 0 y 100.')
    
class PersonaPatologia(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    patologia_id = models.ForeignKey(Patologia, on_delete=models.CASCADE)
    certeza = models.FloatField(validators=[validate_percentage], null=True)
    class Meta:
        db_table = 'personaPatologia'
        constraints = [
            models.UniqueConstraint(
                fields=['user_id', 'patologia_id'],
                name='unique_user_patologia'
            )
        ]

class Formulario(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255) # * creo que voy a necesitar cambiarlo a 'nombre'
    descripcion = models.TextField(blank=True, null=True)
    es_verificacion_automatica = models.BooleanField(default=False)
    creado_por = models.ForeignKey(User, on_delete=models.CASCADE, related_name="formularios")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def _str_(self):
        return self.nombre

    class Meta:
        db_table = 'formulario'    

class Pregunta(models.Model):
    TIPOS_PREGUNTA = [
        ('multiple-choice', 'Multiple Choice'),
        ('respuesta-corta', 'Respuesta Corta'),
        ('respuesta-larga', 'Respuesta Larga'),
    ]

    formulario = models.ForeignKey(Formulario, related_name="preguntas", on_delete=models.CASCADE)
    texto = models.CharField(max_length=255)
    tipo = models.CharField(max_length=20, choices=TIPOS_PREGUNTA)
    correcta = models.CharField(max_length=255, blank=True, null=True)  # Solo para verificación automática

    def __str__(self):
        return self.texto
    
    class Meta:
        db_table = 'pregunta'   


class Opcion(models.Model):
    pregunta = models.ForeignKey(Pregunta, related_name="opciones", on_delete=models.CASCADE)
    texto = models.CharField(max_length=255)

    def __str__(self):
        return self.texto
    class Meta:
        db_table = 'opcion'   

import uuid
class Respuesta(models.Model):
    pregunta = models.ForeignKey(Pregunta, related_name="respuestas", on_delete=models.CASCADE)
    paciente = models.ForeignKey(User, on_delete=models.CASCADE, related_name="respuestas")
    respuesta = models.TextField()
    correcta = models.BooleanField(null=True)  # Solo para verificación automática
    nota = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)  # Nota de 0 a 10
    intento_id = models.UUIDField(default=uuid.uuid4, editable=False)
    fecha_intento = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Respuesta de {self.paciente.username} a {self.pregunta.texto}"
    class Meta:
        db_table = 'respuesta'   
    
class ComentarioProfesional(models.Model):
    respuesta = models.ForeignKey(Respuesta, related_name="comentarios", on_delete=models.CASCADE)
    terapeuta = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comentarios")
    texto = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentario de {self.terapeuta.username} en {self.respuesta}"
    class Meta:
        db_table = 'comentarioProfesional'   
    
class FormularioPacienteRevision(models.Model):
    formulario = models.ForeignKey('Formulario', on_delete=models.CASCADE)
    paciente_dni = models.CharField(max_length=20)
    revision = models.BooleanField(default=False)  # Si el terapeuta habilitó la revisión
    verificado_automatico = models.BooleanField(default=False)  # Si se corrigió automáticamente
    fecha_respuesta = models.DateTimeField(auto_now_add=True)
    volver_a_realizar = models.BooleanField(default=False)

    class Meta:
        db_table = 'formularioPacienteRevision'   
