from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from api.models import User

def enviar_notificacion_admin(notificacion):
    channel_layer = get_channel_layer()
    print(get_channel_layer())
    if not channel_layer:
        print("Channel layer no disponible")
        return
    try:
        admin_user = User.objects.get(role="admin")
        group_name = f"notificaciones_{admin_user.dni}"  
        print("Group name: ", group_name)

        print("Notificación ID:", notificacion.id)
        print("Mensaje:", notificacion.mensaje)
        print("Estado:", notificacion.estado)
        print("Timestamp:", notificacion.timestamp)
        print("Tipo:", notificacion.content_type)
        print("Objeto ID:", notificacion.object_id)
        print("Remitente:", notificacion.remitente)

        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                "type": "enviar_notificacion",
                "message": {
                    "id": notificacion.id,
                    "mensaje": notificacion.mensaje,
                    "estado": notificacion.estado,
                    "timestamp": notificacion.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    "tipo": str(notificacion.content_type) if notificacion.content_type else "None",
                    "objeto_id": notificacion.object_id if notificacion.object_id else "None",
                    "remitente": notificacion.remitente.username if notificacion.remitente else "None",
                    "type": "enviar_notificacion"
                },
            }
        )
    except User.DoesNotExist:
        print("No se encontró un usuario administrador.")
    except Exception as e:
        print("Error en enviar_notificacion_admin:", e)



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

