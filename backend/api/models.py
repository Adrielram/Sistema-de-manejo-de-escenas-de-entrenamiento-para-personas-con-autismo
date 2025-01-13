from django.db import models
from django.contrib.auth.models import AbstractUser


class Centrodesalud(models.Model):
    id = models.AutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=255)
    direccion_id_dir = models.ForeignKey('Residencia', on_delete=models.CASCADE, db_column='direccion_id_dir')

    class Meta:
        db_table = 'centroDeSalud'


class Escena(models.Model):
    id = models.IntegerField(primary_key=True)
    idioma = models.CharField(max_length=255)
    complejidad = models.IntegerField()
    link = models.CharField(max_length=2000)
    nombre = models.CharField(max_length=255, default="Sin Nombre")

    class Meta: 
        db_table = 'escena'


class Escenavideo(models.Model):
    id = models.AutoField(primary_key=True)
    escena = models.ForeignKey(Escena, on_delete=models.CASCADE)    
  
    personaobjetivo_user = models.ForeignKey(
        'Personaobjetivo',
        on_delete=models.SET_NULL,
        related_name='escenavideo_user',
        db_column='personaObjetivo_user_id',
        blank=True,
        null=True
    )
    
    personaobjetivo_objetivo = models.ForeignKey(
        'Personaobjetivo',
        on_delete=models.SET_NULL,
        related_name='escenavideo_objetivo',
        db_column='personaObjetivo_objetivo_id',
        blank=True,
        null=True
    )
    
    orden = models.IntegerField(blank=True, null=True)
    es_alternativo = models.BooleanField()

    class Meta:
        db_table = 'escenaVideo'
        unique_together = (('escena', 'personaobjetivo_user', 'personaobjetivo_objetivo'),)


class Comentario(models.Model):
    escena = models.ForeignKey(
        Escenavideo,
        on_delete=models.CASCADE,
        db_column='escena_id'
    )
    personaobjetivo_user = models.ForeignKey(
        'Escenavideo',
        on_delete=models.CASCADE,
        related_name='comentarios_como_user',
        db_column='personaObjetivo_user_id',
        blank=True,
        null=True
    )
    personaobjetivo_objetivo = models.ForeignKey(
        'Escenavideo',
        on_delete=models.CASCADE,
        related_name='comentarios_como_objetivo',
        db_column='personaObjetivo_objetivo_id',
        blank=True,
        null=True
    )
    texto = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'comentario'
        unique_together = (('escena', 'personaobjetivo_user', 'personaobjetivo_objetivo'),)


class Evaluacion(models.Model): 
    personaobjetivo_user = models.ForeignKey(
        'Personaobjetivo',
        on_delete=models.CASCADE,
        db_column='personaObjetivo_user_id',
        related_name='evaluaciones_user'
    )
    personaobjetivo_objetivo = models.ForeignKey(
        'Personaobjetivo',
        on_delete=models.CASCADE,
        db_column='personaObjetivo_objetivo_id',
        related_name='evaluaciones_objetivo'
    )
    link = models.CharField(max_length=2000)

    class Meta:
        db_table = 'evaluacion'
        unique_together = (('personaobjetivo_user', 'personaobjetivo_objetivo'),)



class Grupo(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=255, blank=True, null=True)
    centrodesalud = models.ForeignKey(Centrodesalud, on_delete=models.CASCADE, db_column='centroDeSalud_id')

    class Meta:
        db_table = 'grupo'

class Objetivo(models.Model):
    # Elimina la línea del id manual o cámbiala por:
    id = models.AutoField(primary_key=True)  # Aunque esto es implícito en Django y no es necesario declararlo
    titulo = models.CharField(max_length=255)
    descripcion = models.CharField(max_length=255)
    escena = models.ForeignKey(Escena, on_delete=models.PROTECT)

    class Meta:   
        db_table = 'objetivo'

        
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
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='personagrupos')
    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE, related_name='miembros')

    class Meta:
        db_table = 'personaGrupo'
        unique_together = (('user', 'grupo'),)



class Personaobjetivo(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    objetivo = models.ForeignKey('Objetivo', on_delete=models.CASCADE)  
    resultado = models.TextField(blank=True, null=True)
    progreso = models.IntegerField()

    class Meta:    
        db_table = 'personaObjetivo'
        unique_together = (('user', 'objetivo'),)


class Residencia(models.Model):
    id_dir = models.IntegerField(primary_key=True)
    provincia = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=255)
    calle = models.CharField(max_length=255)
    numero = models.IntegerField()

    class Meta:  
        db_table = 'residencia'

class Terapeutagrupo(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE)
    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE)

    class Meta: 
        db_table = 'terapeutaGrupo'
        unique_together = (('user', 'grupo'),)


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




class Videosvistos(models.Model):
    escena = models.ForeignKey(
        Escenavideo,
        on_delete=models.CASCADE,
        db_column='escena_id'
    )
    personaobjetivo_user = models.ForeignKey(
        'Escenavideo',
        on_delete=models.CASCADE,
        related_name='videos_vistos_como_user',
        db_column='personaObjetivo_user_id',
        blank=True,
        null=True
    )
    personaobjetivo_objetivo = models.ForeignKey(
        'Escenavideo',
        on_delete=models.CASCADE,
        related_name='videos_vistos_como_objetivo',
        db_column='personaObjetivo_objetivo_id',
        blank=True,
        null=True
    )

    class Meta:     
        db_table = 'videosVistos'
        unique_together = (('escena', 'personaobjetivo_user', 'personaobjetivo_objetivo'),)

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