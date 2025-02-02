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
