// middleware.js
import { NextResponse } from 'next/server';

export async function middleware(request) {
  console.log("Middleware ejecutado en la ruta:", request.nextUrl.pathname);

  const protectedRoutes = {
    paciente: "/interfaz_paciente",
    padre: "/interfaz_padre",
    terapeuta: "/therapist",
    admin: "/admin",
  };

  const cookie = request.headers.get('cookie');

  // Verificar si existe una cookie válida
  if (cookie && cookie.includes('jwt=')) {
    try {
      // Llamar al endpoint de verificación de sesión
      const response = await fetch('http://backend:8000/api/verify-session/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': request.headers.get('cookie') || '', // Pasa las cookies del cliente
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const { role } = data;
        const currentPath = request.nextUrl.pathname;

        // Verificar si la ruta coincide con el role permitido
        if (protectedRoutes[role] && currentPath.startsWith(protectedRoutes[role])) {
          return NextResponse.next(); // Permitir el acceso
        } else {
          console.error("Acceso denegado: Role no autorizado para esta ruta.");
          return NextResponse.redirect(new URL('/error_forbidden', request.url));
        }
      } else {
        console.error('Sesión no válida. Redirigiendo al login.');
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } catch (error) {
      console.error('Error al verificar la sesión:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }
}

// Configuración para las rutas que deben usar este middleware
export const config = {
  matcher: ['/interfaz_paciente/:path*', '/interfaz_padre/:path*', '/therapist/:path*', '/admin/:path*'],
};