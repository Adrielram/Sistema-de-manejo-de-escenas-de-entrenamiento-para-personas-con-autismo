"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Importa el hook useRouter

const HeaderPaciente: React.FC = () => {
  const router = useRouter(); // Obtiene el router

  const handleLogout = () => {
    console.log("Cerrar sesión");
    // Redirige al usuario a la página de login
    router.push('/auth/login');
  };

  return (
    <header className="bg-gray-800 fixed top-0 left-0 w-full flex items-center justify-between p-4 text-white shadow-md z-10">
      {/* Imagen clickeable */}
      <div className="flex-grow flex justify-center">
        <a href="./perfil"> {/* CAMBIAR AL PROFILE*/}
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
