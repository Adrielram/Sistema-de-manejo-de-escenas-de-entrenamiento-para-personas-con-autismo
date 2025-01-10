"use client";

import React, { useState } from 'react';
import Comentario from '../../../components/Comentario';

const Page = () => {
  // Array de videos
  const videos = [
    "https://drive.google.com/file/d/17RTqxuu9WPX5Nwvs1h3s7wuQh5ldDDTz/preview", // Hide and seek
    "https://drive.google.com/file/d/1qzY31odKmd2FlrjU0VK4dkfezlzEcoaJ/preview", // Futgame
    "https://drive.google.com/file/d/1yPgHYRagTJXTqlrGhNkZDEy5zNY4-f77/preview" // Cartpole
    // esta lista va a venir por un fetch a la base de datos
  ];

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0); 

  // Función para mostrar el siguiente video
  const handleVerSiguienteVideo = () => {
    setCurrentVideoIndex((prevIndex) => prevIndex + 1); 
  };

  // Manejador vacío para el otro botón
  const handleVerListaObjetivos = () => {
    window.alert("Esto lo codea el adriel");
  };

  return (
    <div className="flex flex-col px-4 py-4 min-h-screen">
      <div className="flex flex-col lg:flex-row items-stretch"> 
        <div className="mr-0 lg:mr-4 mb-4 lg:mb-0 relative w-full max-w-[854px]"> 
          <iframe
            src={videos[currentVideoIndex]} 
            className="rounded-lg shadow-lg border-0 w-full h-full" 
            allow="autoplay; fullscreen"
            style={{ aspectRatio: '16 / 9' }} // Mantener relación de aspecto
          ></iframe>
        </div>

        <div className="flex flex-col items-center justify-center flex-grow h-full"> 
          <div className="flex flex-col justify-center flex-grow space-y-4">
            <button 
              onClick={handleVerListaObjetivos} 
              className="bg-blue-500 text-white w-full py-4 rounded text-lg"> 
              Ver lista de objetivos
            </button>

            {currentVideoIndex < videos.length - 1 && (
              <button 
                onClick={handleVerSiguienteVideo}
                className="bg-green-500 text-white w-full py-4 rounded text-lg"> 
                Ver siguiente video
              </button>
            )}
          </div>

          {/* Mostrar el cuadrado solo si estamos en el último video */}
          {currentVideoIndex === videos.length - 1 && (
            <div className="w-48 h-48 bg-gray-300 rounded mt-4">aca van los quiz</div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Comentario />
      </div>
    </div>
  );
};

export default Page;
