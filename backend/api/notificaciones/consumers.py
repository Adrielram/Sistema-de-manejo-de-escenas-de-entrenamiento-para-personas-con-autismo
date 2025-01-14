import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificacionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Quitar la verificación de autenticación
        # self.user = self.scope["user"]
        # if self.user.is_authenticated:
        self.group_name = "notificaciones_general"  # O cualquier nombre de grupo que prefieras
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # No necesitamos verificar autenticación aquí tampoco
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def enviar_notificacion(self, event):
        await self.send(text_data=json.dumps(event["message"]))
