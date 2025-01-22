"use client"
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


const PacientePrincipal = () => {
  const router = useRouter();
  const HandleOnClick = () => {
    router.push('/paciente/video');
  };
  const HandleOnClickObj = () => {
    router.push('./objetivos_prueba');
  };
  return ( 
    <div className=" md:min-h-screen w-full flex items-start md:items-center justify-center md:justify-start p-0 pt-4 md:p-8  bg-[#f5af76]">
      
      {/* Texto en la parte superior izquierda */}
      <div className="fixed top-0 left-0 md:w-full w-1/3 ml-4 mt-4 text-white text-lg font-semibold z-10 flex flex-col md:flex-row ">
          {/* En resoluciones pequeñas, el texto se apilará */}
          <div className="md:text-center text-left">
              Sección: Seleccionar video        
          </div> 
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-between gap-16  md:gap-96 h-full ">
        {/* Contenedor para los SVGs */}
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-32  ">
          {/* SVG de mano usando Next.js Image - oculto en móviles */}
          <div className="hidden md:block relative w-48 h-48 md:w-96 md:h-96">
            <Image
              src="/images/hand.svg"
              alt="Hand icon"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 0, (min-width: 768px) 384px"
            />
          </div>

          {/* SVG con círculo de fondo */}
          <div className="flex-shrink-0">
          <button onClick={HandleOnClick} className="flex-shrink-0 focus:outline-none"> 
            <svg
              className="w-40 h-40 md:w-64 md:h-64 lg:w-80 lg:h-80"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              fill="none"
            >
              {/* Fondo circular */}
              <circle cx="50" cy="50" r="48" fill="#2563eb" />
              
              {/* Ícono de play */}
              <path
                d="M35 25L35 75L75 50L35 25Z"
                fill="currentColor"
                className="text-black"
              />
            </svg>
          </button>
    <p className="text-center text-black text-lg md:text-2xl lg:text-3xl font-bold mt-4">Ver video recomendado</p>
  </div>
        </div>

        {/* Botón */}
        <div className="flex-shrink-0">
          <button onClick={HandleOnClickObj} className="px-8 py-4 md:px-16 md:py-8 text-lg md:text-3xl font-bold text-white bg-blue-600 rounded-xl shadow-lg hover:bg-blue-700 transition-colors duration-300">
            VER OBJETIVOS
          </button>
        </div>
      </div>
    </div>
  );
};

export default PacientePrincipal;
