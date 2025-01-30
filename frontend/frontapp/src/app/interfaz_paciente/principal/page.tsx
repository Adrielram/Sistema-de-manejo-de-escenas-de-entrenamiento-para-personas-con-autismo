"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

const PacientePrincipal = () => {
  const router = useRouter();

  const HandleOnClick = () => router.push('./ver_video');
  const HandleOnClickObj = () => router.push('./objetivos');
  const HandleOnClickEsc = () => router.push('./escenas');

  return (
    <div className="md:min-h-screen w-full flex flex-col items-center justify-center overflow-hidden p-4 md:p-8 bg-[#f5af76]">
      
      {/* Texto en la parte superior izquierda */}
      <div className="fixed top-4 left-4 md:top-8 md:left-8 text-white text-lg font-semibold">
        Sección: Seleccionar video
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-center gap-16 md:gap-32 h-full w-full">
        {/* Botón principal de video */}
        <div className="flex flex-col items-center text-center">
          <button onClick={HandleOnClick} className="focus:outline-none">
            <svg className="w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="48" fill="#2563eb" />
              <path d="M35 25L35 75L75 50L35 25Z" fill="currentColor" className="text-black" />
            </svg>
          </button>
          <p className="text-black text-lg md:text-2xl lg:text-3xl font-bold mt-4">Ver video recomendado</p>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex flex-col w-full max-w-xs md:max-w-md lg:max-w-lg gap-6 md:gap-8 mt-8">
        <button onClick={HandleOnClickObj} className="w-full py-4 md:py-6 text-lg md:text-2xl font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center">
          VER OBJETIVOS
        </button>
        <button onClick={HandleOnClickEsc} className="w-full py-4 md:py-6 text-lg md:text-2xl font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center">
          VER ESCENAS
        </button>
      </div>
    </div>
  );
};

export default PacientePrincipal;
