import { cookies } from 'next/headers'; // Importar cookies desde next/headers

// Esta función lee las cookies y devuelve el token
export async function getTokenFromCookies () {
  const cookieStore = await cookies(); // Usar cookies desde next/headers
  const token = cookieStore.get('jwt')?.value; // Acceder al valor del token  
  return token; // Asegúrate de que 'authToken' coincida con el nombre de tu cookie
};
