"use client";

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const HeaderPaciente: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    console.log("Cerrar sesión");
    router.push('../auth/login');
  };

  return (
    <header className="bg-gray-800 fixed top-0 left-0 w-full flex items-center justify-center p-4 text-white shadow-md z-10">
      {/* Imagen clickeable centrada */}
      <a href="./profile">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#f5af76]"></div>
          <Image
            src="/icon/persona_silueta.png"
            alt="Logo"
            width={64}
            height={64}
            className="relative z-10 cursor-pointer"
          />
        </div>
      </a>

      {/* Botón de salir a la derecha */}
      <button
        onClick={handleLogout}
        className="absolute right-4 bg-red-500 text-white py-2 px-4 rounded"
      >
        Salir
      </button>
    </header>
  );
};

export default HeaderPaciente;
