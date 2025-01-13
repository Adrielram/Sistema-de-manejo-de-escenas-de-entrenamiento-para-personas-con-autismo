
'use client'; 
import Image from 'next/image';
import Link from 'next/link';
import NotificationMenu from './NotificationsMenu'; // Importa el componente
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../slices/userSlice';
import { RootState } from "../../store/store"; // Asegúrate de importar el tipo correcto
import {useRouter} from 'next/navigation';

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const { username, isLoggedIn } = useSelector((state: RootState) => state.user);
  const handleLogout = async () => {
    try {
      // Llama a la API del backend para el logout
      const response = await fetch('http://localhost:8000/api/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username }),
        credentials: 'include', // Incluir cookies (para manejar la cookie JWT)
      });

      if (response.ok) {
        // Limpia el estado global del Redux
        dispatch(clearUser());
        // Redirige al usuario a la página de inicio de sesión
        router.push('/auth/login');
      } else {
        console.error('Error al cerrar sesión:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="bg-[#F6512B] fixed top-0 left-0 w-full flex items-center justify-between px-4 py-2 text-white shadow-md">
      {/* Logo Section (Left-aligned) */}
      <div className="flex items-center space-x-2">
        <Image
          width={48}
          height={48}
          src="/images/fotocasabela.png"
          alt="Centro Casabella Logo"
          className="w-10 h-10 sm:w-12 sm:h-12" // Ajuste responsivo del tamaño del logo
          priority
        />
        <p className="font-bold text-sm sm:text-lg whitespace-nowrap">
          Centro Casabella
        </p>
      </div>

      {/* Action Buttons or Greeting (Right-aligned) */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {isLoggedIn ? (
          <>
            <p className="text-white font-semibold">Hola, {username}!</p>
            <button
              onClick={handleLogout}
              className="rounded border-2 border-black bg-white px-2 py-1 text-xs font-bold text-black transition duration-100 hover:bg-red-500 hover:text-white sm:px-3 sm:py-1 sm:text-base"
            >
              Cerrar sesión
            </button>
            <NotificationMenu />
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="rounded border-2 border-black bg-white px-2 py-1 text-xs font-bold text-black transition duration-100 hover:bg-green-500 hover:text-black sm:px-3 sm:py-1 sm:text-base"
              aria-label="Log in to your account"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="rounded border-2 border-black bg-black px-2 py-1 text-xs font-bold text-white transition duration-100 hover:bg-[#44eefa] hover:text-black sm:px-3 sm:py-1 sm:text-base"
              aria-label="Register a new account"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
