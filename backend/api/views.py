from django.shortcuts import render
from django.http import JsonResponse
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response

def example_view(request):
    return JsonResponse({'message': 'Hello, world!'})

@api_view(['POST'])
def login(request):
    serializer = TokenObtainPairSerializer(data=request.data)
    if serializer.is_valid():
        response = Response({"message": "Login successful"})
        # Almacenar el token de acceso en una cookie HTTP-only
        response.set_cookie(
            'jwt',  # Nombre de la cookie
            serializer.validated_data['access'],  # Token JWT
            httponly=True,  # Previene acceso desde JavaScript
            samesite='Lax'  # Mejora seguridad contra ataques CSRF
        )
        return response
    return Response(serializer.errors, status=400)


@api_view(['POST'])
def logout(request):
    response = Response({"message": "Logout successful"})
    # Borrar la cookie JWT
    response.delete_cookie('jwt')
    return response