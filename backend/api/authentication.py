# api/authentication.py
from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('jwt')  # Obtiene el token de la cookie
        if not token:
            return None  # No autenticación si no hay token

        try:
            validated_token = self.get_validated_token(token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except Exception as e:
            print("Error al autenticar con CookieJWTAuthentication:", e)
            return None
