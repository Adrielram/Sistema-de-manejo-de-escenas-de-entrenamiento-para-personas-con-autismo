from django.db import models
from django.contrib.auth.models import AbstractUser


class Centrodesalud(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=255)
    direccion_id_dir = models.ForeignKey('Residencia', on_delete=models.CASCADE, db_column='direccion_id_dir')

    class Meta:
        managed = False
        db_table = 'centroDeSalud'


class Comentario(models.Model):
    id = models.BigAutoField(primary_key=True)
    personaobjetivo_user = models.ForeignKey('Personaobjetivo', on_delete=models.SET_NULL, db_column='personaObjetivo_user_id', blank=True, null=True)
    personaobjetivo_objetivo = models.ForeignKey('Personaobjetivo', on_delete=models.SET_NULL, db_column='personaObjetivo_objetivo_id', to_field='objetivo_id', related_name='comentario_personaobjetivo_objetivo_set', blank=True, null=True)
    video = models.ForeignKey('Video', on_delete=models.CASCADE, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'comentario'


class Escena(models.Model):
    id = models.IntegerField(primary_key=True)
    objetivo = models.ForeignKey('Objetivo', on_delete=models.CASCADE)
    idioma = models.CharField(max_length=255)
    complejidad = models.IntegerField()
    resultado_tera = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'escena'


class Escenavideo(models.Model):
    video = models.OneToOneField('Video', on_delete=models.CASCADE, primary_key=True)
    escena = models.ForeignKey(Escena, on_delete=models.CASCADE)
    orden = models.IntegerField(blank=True, null=True)
    es_alternativo = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'escenaVideo'
        unique_together = (('video', 'escena'),)


class Evaluacion(models.Model):
    id = models.IntegerField(primary_key=True)
    personaobjetivo_user = models.ForeignKey('Personaobjetivo', on_delete=models.CASCADE, db_column='personaObjetivo_user_id')
    personaobjetivo_objetivo = models.ForeignKey('Personaobjetivo', on_delete=models.CASCADE, db_column='personaObjetivo_objetivo_id', to_field='objetivo_id', related_name='evaluacion_personaobjetivo_objetivo_set')
    link = models.CharField(max_length=2000)

    class Meta:
        managed = False
        db_table = 'evaluacion'
        unique_together = (('id', 'personaobjetivo_user', 'personaobjetivo_objetivo'),)


class Grupo(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=255, blank=True, null=True)
    centrodesalud = models.ForeignKey(Centrodesalud, on_delete=models.CASCADE, db_column='centroDeSalud_id')

    class Meta:
        managed = False
        db_table = 'grupo'


class Objetivo(models.Model):
    id = models.IntegerField(primary_key=True)
    titulo = models.CharField(max_length=255)
    descripcion = models.CharField(max_length=255)
    video = models.ForeignKey('Video', on_delete=models.CASCADE)
    resultado_tera = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'objetivo'


class Objetivoscumplir(models.Model):
    objetivo = models.OneToOneField(Objetivo, on_delete=models.CASCADE, primary_key=True)
    objetivo_previo = models.ForeignKey(Objetivo, on_delete=models.CASCADE, db_column='objetivo_previo', related_name='objetivoscumplir_objetivo_previo_set')

    class Meta:
        managed = False
        db_table = 'objetivosCumplir'
        unique_together = (('objetivo', 'objetivo_previo'),)


class Personagrupo(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, primary_key=True)
    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'personaGrupo'
        unique_together = (('user', 'grupo'),)


class Personaobjetivo(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, primary_key=True)
    objetivo = models.ForeignKey(Objetivo, on_delete=models.CASCADE)
    resultado = models.TextField(blank=True, null=True)
    progreso = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'personaObjetivo'
        unique_together = (('user', 'objetivo'),)


class Residencia(models.Model):
    id_dir = models.IntegerField(primary_key=True)
    provincia = models.CharField(max_length=255)
    ciudad = models.CharField(max_length=255)
    calle = models.CharField(max_length=255)
    numero = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'residencia'


class Terapeutagrupo(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE, primary_key=True)
    grupo = models.ForeignKey(Grupo, on_delete=models.CASCADE)

    class Meta:
        managed = False
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
    direccion_id_dir = models.ForeignKey(Residencia, on_delete=models.CASCADE, db_column='direccion_id_dir')
    user_id_padre = models.ForeignKey('self', on_delete=models.SET_NULL, db_column='user_id_padre', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'user'


class Video(models.Model):
    id = models.IntegerField(primary_key=True)
    link = models.CharField(max_length=2000)
    complejidad = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'video'


class Videosvistos(models.Model):
    user_dni = models.OneToOneField(User, on_delete=models.CASCADE, db_column='user_dni', primary_key=True)
    video = models.ForeignKey(Video, on_delete=models.CASCADE)

    class Meta:
        managed = False
        db_table = 'videosVistos'
        unique_together = (('user_dni', 'video'),)
