from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from api.models import User

def enviar_notificacion_admin(notificacion):
    channel_layer = get_channel_layer()   
    try:
        admin_user = User.objects.get(role="admin")
        group_name = f"notificaciones_{admin_user.dni}"  # Grupo del administrador
        
        # Enviar la notificación al grupo del administrador
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "enviar_notificacion",
                "message": {
                    "id": notificacion.id,
                    "mensaje": notificacion.mensaje,
                    "estado": notificacion.estado,
                    "timestamp": notificacion.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    "tipo": str(notificacion.content_type),
                    "objeto_id": notificacion.object_id,
                    "remitente": notificacion.remitente.username if notificacion.remitente else None,
                    "type": "enviar_notificacion"
                },
            }
        )
    except User.DoesNotExist:
        print("No se encontró un usuario administrador.")


def actualizar_notificacion(notification_id, estado):
    channel_layer = get_channel_layer()
    admin_user = User.objects.get(role="admin")
    async_to_sync(channel_layer.group_send)(
        f"notificaciones_{admin_user.dni}",
        {
            "type": "notificacion_actualizada",
            "message": {"id": notification_id, "estado": estado, "type": "notificacion_actualizada"},
        },
    )

