"use client";
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; 
import {useDispatch} from 'react-redux'; 
import { clearUser } from '../../slices/userSlice'; 
import { useSelector } from 'react-redux'; 
import { RootState } from "../../store/store";
const HeaderPaciente: React.FC = () => {
  const router = useRouter(); // Obtiene el router
  const dispatch = useDispatch();
  const {username} = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
      try {
        // Llama a la API del backend para el logout
        const response = await fetch('http://localhost:8000/api/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: username }),
          credentials: 'include',
        });
  
        if (response.ok) {
          dispatch(clearUser());
          router.push('/auth/login');
        } else {
          console.error('Error al cerrar sesión:', response.statusText);
        }
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
      }
    };

    const handleProfileClick = () => {
      router.push('./perfil');
    };

  return (
    <header className="bg-gray-800 fixed top-0 left-0 w-full flex items-center justify-between p-4 text-white shadow-md z-10">
      {/* Imagen clickeable */}
      <div className="flex-grow flex justify-center">
        <div
          className="relative w-20 h-20 flex items-center justify-center cursor-pointer"
          onClick={() => handleProfileClick()} // Llama a la función handleProfileClick cuando se hace clic
        >
          <div className="absolute inset-0 rounded-full bg-[#f5af76]"></div>
          <Image
            src="/icon/persona_silueta.png"
            alt="Logo"
            width={64}
            height={64}
            className="relative z-10"
          />
        </div>
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