from django.db import models
from django.contrib.auth.models import AbstractUser

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

    class Meta: 
        db_table = 'user'

class Escena(models.Model):
    id = models.AutoField(primary_key=True)
    idioma = models.CharField(max_length=40)
    acento = models.CharField(max_length=40, default="neutro")
    complejidad = models.IntegerField()
    condiciones = models.CharField(max_length=255)  # Permite valores nulos
    link = models.CharField(max_length=2000)
    nombre = models.CharField(max_length=100, default="Sin Nombre")

    class Meta:
        db_table = 'escena'


class Grupo(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100, blank=True, null=True)
    centrodesalud_id = models.ForeignKey(Centrodesalud, on_delete=models.CASCADE, db_column='centroDeSalud_id')

    class Meta:
        db_table = 'grupo'


class CentroProfesional(models.Model):
    centrodesalud = models.ForeignKey(Centrodesalud,on_delete=models.CASCADE)
    profesional = models.ForeignKey(User, on_delete=models.CASCADE)
    class Meta:
        db_table = 'centroProfesional'
        models.UniqueConstraint(
            fields=['centrodesalud', 'profesional'], 
            name='CentroProfesional'
        )

class Objetivo(models.Model):
    nombre = models.CharField(max_length=100, default="Sin Nombre")
    descripcion = models.CharField(max_length=255)
    escena = models.ForeignKey(Escena, on_delete=models.PROTECT, related_name='objetivo_explicativo')
    # Referencias agregadas para el composite key
    centroProfesional = models.ForeignKey(CentroProfesional, unique=True, db_column='centroProfesional_id', on_delete=models.CASCADE)

    class Meta:   
        db_table = 'objetivo'

class Evaluacion(models.Model): 
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=255, blank=True, null=True)
    link = models.CharField(max_length=2000)
    centro_salud_id = models.ForeignKey(CentroProfesional, on_delete=models.CASCADE, db_column='centroProfesional_id', related_name='evaluacion_centro_salud_id')
    profesional_id = models.ForeignKey(CentroProfesional, on_delete=models.CASCADE, db_column='centroProfesional_id_profesional', related_name='evaluacion_profesional_id')
    class Meta:
        db_table = 'evaluacion'      

class CentroProfesionalEscena(models.Model):    
    escena_id = models.ForeignKey(Escena, on_delete=models.CASCADE)
    centro_salud_id = models.ForeignKey(CentroProfesional, on_delete=models.CASCADE, db_column='centroProfesional_id', related_name='cpe_centro_salud_id')
    profesional_id = models.ForeignKey(CentroProfesional, on_delete=models.CASCADE, db_column='centroProfesional_id_profesional', related_name='cpe_profesional_id')
    class Meta:
        db_table = 'centroProfesionalEscena'
        unique_together = (('centro_salud_id', 'profesional_id', 'escena_id'),)

class EscenaObjetivo(models.Model):
    escena = models.ForeignKey('Escena', on_delete=models.CASCADE)
    objetivo = models.ForeignKey('Objetivo', on_delete=models.CASCADE)

    class Meta:
        db_table = 'escenaObjetivo'
        unique_together = (('escena', 'objetivo'),)

class PersonaObjetivoEscena(models.Model):
    id = models.AutoField(primary_key=True)    
    user_id = models.ForeignKey('User', on_delete=models.CASCADE)

    objetivo_id = models.ForeignKey(
        'EscenaObjetivo',
        on_delete=models.SET_NULL,
        related_name='objetivo_relations',
        db_column='objetivo_id',
        blank=True,
        null=True
    )

    escena_id = models.ForeignKey(
        'EscenaObjetivo',
        on_delete=models.SET_NULL,
        related_name='escena_relations',
        db_column='escena_id',
        blank=True,
        null=True
    )

    orden = models.IntegerField(blank=True, null=True)
    es_alternativo = models.BooleanField()

    class Meta:
        db_table = 'personaObjetivoEscena'
        unique_together = (
            ('user_id', 'objetivo_id', 'escena_id'),
        )
        
class Objetivoscumplir(models.Model):
    objetivo = models.ForeignKey(Objetivo, on_delete=models.CASCADE)
    objetivo_previo = models.ForeignKey(
        Objetivo,
        on_delete=models.CASCADE,
        db_column='objetivo_previo',
        related_name='objetivoscumplir_objetivo_previo_set'
    )

    class Meta:
        db_table = 'objetivosCumplir'
        unique_together = (('objetivo', 'objetivo_previo'),)  



class Personagrupo(models.Model):
    user_id = models.ForeignKey('User', on_delete=models.CASCADE, related_name='personagrupos')
    grupo_id = models.ForeignKey(Grupo, on_delete=models.CASCADE, related_name='miembros')

    class Meta:
        db_table = 'personaGrupo'
        unique_together = (('user_id', 'grupo_id'),)



class PersonaObjetivoEvaluacion(models.Model):
    user_id = models.ForeignKey('User', on_delete=models.CASCADE)
    objetivo_id = models.ForeignKey('Objetivo', on_delete=models.CASCADE)  
    resultado = models.TextField(blank=True, null=True)
    progreso = models.IntegerField()
    evaluacion_id = models.ForeignKey('Evaluacion', on_delete=models.CASCADE, blank=True, null=True)
    centro_salud_id = models.ForeignKey(CentroProfesional, on_delete=models.CASCADE, db_column='centroProfesional_id', related_name='poe_centro_salud_id')
    profesional_id = models.ForeignKey(CentroProfesional, on_delete=models.CASCADE, db_column='centroProfesional_id_profesional', related_name='poe_profesional_id')
    class Meta:    
        db_table = 'personaObjetivoEvaluacion'
        unique_together = (('user_id', 'objetivo_id', 'evaluacion_id', 'centro_salud_id', 'profesional_id'),)


class Videosvistos(models.Model):
    escena_id = models.ForeignKey(
        'PersonaObjetivoEscena',
        on_delete=models.CASCADE,
        related_name='videosvistos_escena',
        db_column='escena_id',
        blank=True,
        null=True
    )
    user_id = models.ForeignKey(
        'PersonaObjetivoEscena',
        on_delete=models.CASCADE,
        related_name='videosvistos_user',
        db_column='PersonaObjetivoEscena_user_id',
        blank=True,
        null=True
    )
    objetivo_id = models.ForeignKey(
        'PersonaObjetivoEscena',
        on_delete=models.CASCADE,
        related_name='videosvistos_objetivo',
        db_column='PersonaObjetivoEscena_objetivo_id',
        blank=True,
        null=True
    )
    visto = models.BooleanField(default=False)

    class Meta:     
        db_table = 'videosVistos'
        unique_together = (('escena_id', 'user_id', 'objetivo_id'),)


class Comentario(models.Model):
    escena_id = models.ForeignKey(
        'PersonaObjetivoEscena',
        on_delete=models.CASCADE,
        related_name='comentarios_escena',
        db_column='escena_id',
        blank=True,
        null=True
    )
    user_id = models.ForeignKey(
        'PersonaObjetivoEscena',
        on_delete=models.CASCADE,
        related_name='comentarios_user',
        db_column='PersonaObjetivoEscena_user_id',
        blank=True,
        null=True
    )
    objetivo_id = models.ForeignKey(
        'PersonaObjetivoEscena',
        on_delete=models.CASCADE,
        related_name='comentarios_objetivo',
        db_column='PersonaObjetivoEscena_objetivo_id',
        blank=True,
        null=True
    )
    texto = models.TextField(blank=True, null=True)
    visibilidad = models.BooleanField(default=True)

    class Meta:
        db_table = 'comentario'
        unique_together = (('escena_id', 'user_id', 'objetivo_id'),)


class Notificacion(models.Model):
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