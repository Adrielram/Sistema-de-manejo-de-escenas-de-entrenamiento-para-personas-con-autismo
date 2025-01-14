from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def enviar_notificacion(notificacion):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "notificaciones_general",
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
            },
        }
    )
