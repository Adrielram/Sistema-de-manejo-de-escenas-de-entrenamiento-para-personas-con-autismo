"use client";
import React from 'react';
import Image from 'next/image';
import Button from './Button'; // Asegúrate de ajustar la ruta de importación según la ubicación real del archivo.

// Importa las imágenes correctamente
import rolloCine from '../../public/icon/Rollo_cine.png';
import tachoBasura from '../../public/icon/tacho_basura.png';

type Box_Escena_Props = {
    nombreEscena : string;
}

const Box_Escena = ({nombreEscena}:Box_Escena_Props) => {
    return (
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-1 border-2 border-gray-400 w-full max-w-xs sm:w-[200px] h-auto sm:h-[300px] text-sm sm:text-base">
            {/* Imagen del rollo de cine */}
            <div className="flex items-center justify-center space-x-2">
                <Image 
                    width={144}  // Ajusta el tamaño de la imagen
                    height={30}  // Ajusta el tamaño de la imagen
                    src={rolloCine}
                    alt="Rollo de cine"
                    className="w-15 h-15"  // Cambié el tamaño a más pequeño
                />
            </div>
            {/* Título de la escena con texto negro */}
            <div className="text-center mt-2 text-black">
                <p className="font-bold">{nombreEscena}</p>
            </div>
            {/* Botón */}
            <div className="mt-4">
                <Button 
                    type="button" 
                    title="Agregar Escena" 
                    className="bg-[#f6512b] hover:bg-[#f6512b] text-white px-4 py-2" // Cambié el color de fondo aquí
                    onClick={() => alert('¡Escena agregada!')}
                />
            </div>
            {/* Imagen del tacho de basura */}
            <div className="flex items-center justify-center w-full h-full">
                <Image 
                    width={120}  // Ajusta el tamaño de la imagen
                    height={24}  // Ajusta el tamaño de la imagen
                    src={tachoBasura}
                    alt="Tacho de basura"
                    className="w-8 h-8"  // Cambié el tamaño a más pequeño y ajustado
                />
            </div>
        </div>
    );
};

export default Box_Escena;
