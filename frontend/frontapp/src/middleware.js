// middleware.js (ubicado en la raíz del directorio app)
import { NextResponse } from 'next/server';

export async function middleware(request) {
  console.log("Middleware ejecutado en la ruta:", request.nextUrl.pathname);

  try {
    // Verificar la sesión enviando la solicitud a la API para validar el token
    const response = await fetch('http://backend:8000/api/verify-session/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '', // Pasa las cookies del cliente
      },
      credentials: 'include', // Importante para enviar las cookies
    });

    if (response.ok) {
      return NextResponse.next();
    } else {
      console.error('Sesión no válida. Redirigiendo al login.');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } catch (error) {
    console.error('Error al verificar la sesión:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

// Configuración para las rutas que deben usar este middleware
export const config = {
  matcher: ['/homepage'], // Aquí defines las rutas que quieres proteger
};