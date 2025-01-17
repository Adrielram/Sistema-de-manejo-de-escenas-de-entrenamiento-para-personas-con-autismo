"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter
import {useDispatch} from 'react-redux'; 
import { clearUser } from '../../slices/userSlice'; 
import { useSelector } from 'react-redux'; 
import { RootState } from "../../store/store";
const HeaderPaciente: React.FC = () => {
  const router = useRouter(); // Obtiene el router
  const dispatch = useDispatch();
  const {username} = useSelector((state: RootState) => state.user); // Obtiene el username del estado global
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
    <header className="bg-gray-800 fixed top-0 left-0 w-full flex items-center justify-between p-4 text-white shadow-md z-10">
      {/* Imagen clickeable */}
      <div className="flex-grow flex justify-center">
        <a href="/auth/login"> {/* CAMBIAR AL PROFILE*/}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#F6512B]"></div>
            <Image
              src="/icon/persona_silueta.png"
              alt="Logo"
              width={64}
              height={64} 
              className="relative z-10 cursor-pointer"
            />
          </div>
        </a>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white py-2 px-4 rounded"
      >
        Salir
      </button>
    </header>
  );
};

export default HeaderPaciente;