import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
class NotificacionConsumer(AsyncWebsocketConsumer):    
    async def connect(self):      
        from rest_framework.exceptions import AuthenticationFailed  
        # Extraer el token JWT del query_string
        query_string = self.scope["query_string"].decode("utf-8")
        token = self.get_token_from_query_string(query_string)
        print("Token JWT:", token)
        # Validar el token JWT
        try:
            user_info = self.verify_jwt(token)
            self.user = await self.get_user(user_info["username"])
            if not self.user.is_authenticated:
                raise AuthenticationFailed("Usuario no autenticado.")

            # Asignar al grupo de notificaciones
            self.group_name = f"notificaciones_{self.user.dni}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        except Exception as e:
            # Cierra la conexión si no está autenticado
            await self.close()
            return

    async def disconnect(self, close_code):
        # Remover del grupo al desconectar
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def enviar_notificacion(self, event):
        # Enviar mensajes al cliente
        await self.send(text_data=json.dumps(event["message"]))

    def get_token_from_query_string(self, query_string):
        # Extraer el token del query_string (e.g., ?token=abc123)
        params = dict(param.split("=") for param in query_string.split("&") if "=" in param)
        return params.get("token")

    def verify_jwt(self, token):
        from rest_framework_simplejwt.tokens import AccessToken        
        from rest_framework.exceptions import AuthenticationFailed
        # Lógica para validar el token
        if not token:
            raise AuthenticationFailed("Token no proporcionado.")

        try:
            # Decodificar el token usando SimpleJWT
            access_token = AccessToken(token)
            username = access_token["username"]
            role = access_token["role"]
            return {"username": username, "role": role}
        except Exception:
            raise AuthenticationFailed("Token inválido o expirado.")

    @database_sync_to_async
    def get_user(self, username):
        from django.contrib.auth import get_user_model
        # Consulta al modelo de usuario por nombre de usuario
        User = get_user_model()
        return User.objects.get(username=username)

