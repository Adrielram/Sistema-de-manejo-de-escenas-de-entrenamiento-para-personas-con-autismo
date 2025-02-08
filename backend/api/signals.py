from django.db.models.signals import post_save
from django.contrib.contenttypes.models import ContentType
from django.dispatch import receiver
from api.models import Notificacion, User
from .notificaciones.utils import enviar_notificacion
print("Señales registradas en api.signals")

@receiver(post_save, sender=User)
def notificacion_usuario_creado(sender, instance, created, **kwargs):
    if created:  # Solo al crear un usuario
        try:
            # Buscar al usuario administrador
            admin = User.objects.filter(role='admin').first()
            if not admin:
                raise ValueError("No se encontró un usuario con el rol 'admin'.")
            print("Existe un ADMINISTRADOR")
            # Obtén el ContentType del modelo asociado
            content_type = ContentType.objects.get_for_model(instance)

            # Crear la notificación
            notificacion = Notificacion.objects.create(
                destinatario=admin,  # El destinatario es el usuario admin
                remitente=instance,  # El remitente es el usuario recién creado
                mensaje=f"{instance.username} ha enviado una solicitud para registrarse!",
                estado='pendiente',
                content_type=content_type,  # El tipo de contenido asociado
                object_id=instance.dni,  # El ID del objeto asociado
            )

            print(f"Notificación creada: {notificacion}")

            # Enviar la notificación en tiempo real
            enviar_notificacion(notificacion)

        except ValueError as e:
            print(f"Error: {e}")
        except Exception as e:
            print(f"Error inesperado: {e}")


#SEÑALES PARA TAREAS PERIODICAS

'''from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django_celery_beat.models import PeriodicTask, IntervalSchedule, CrontabSchedule
import json

@receiver(post_migrate)
def create_periodic_tasks(sender, **kwargs):
    if sender.name == "api":  # Solo ejecutarlo para la app 'api'
        # Crear un intervalo de 1 día si no existe
        schedule, _ = IntervalSchedule.objects.get_or_create(
            every=1, period=IntervalSchedule.DAYS
        )

        # Crear la tarea programada si no existe
        task, created = PeriodicTask.objects.get_or_create(
            name="Generar dataset RL diariamente",
            defaults={
                "interval": schedule,
                "task": "api.rl_model.tasks.generar_dataset",  # Ajusta el nombre de la tarea
                "kwargs": json.dumps({}),
            }
        )

        if not created:
            print("⏳ Tarea ya existente, no se volvió a crear.")
        else:
            print("✅ Tarea periódica creada con éxito.")

        # Crear un cron schedule para que se ejecute todos los días a las 3:00 AM
        schedule, _ = CrontabSchedule.objects.get_or_create(
            minute=6, hour=19, day_of_week="*", day_of_month="*", month_of_year="*"
        )

        # Crear la tarea programada si no existe
        task, created = PeriodicTask.objects.get_or_create(
            name="Entrenar modelo diariamente",
            defaults={
                "crontab": schedule,
                "task": "api.rl_model.tasks.train_if_needed",  # Ajusta el nombre de la tarea
                "kwargs": json.dumps({}),  # Si la tarea necesita argumentos, agrégalo aquí
            }
        )

        if not created:
            print("⏳ La tarea de entrenamiento ya existe, no se volvió a crear.")
        else:
            print("✅ Tarea de entrenamiento creada con éxito.")'''