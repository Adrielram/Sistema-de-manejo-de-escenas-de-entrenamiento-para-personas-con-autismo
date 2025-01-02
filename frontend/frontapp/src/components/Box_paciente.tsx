import React from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';

// Ruta de las imágenes
import photo from '../../public/icon/persona_silueta.png'; // Tu imagen de la silueta
import trashIcon from '../../public/icon/tacho_basura.png'; // Tu ícono de tacho de basura

type pacienteProps = {
  id: number;
  nombre: string;
  dni: string;
  padreACargo: string;
}

type paciente = {
  paciente: pacienteProps;
}

const Box_paciente = ({paciente}:paciente) => {
  const handleDelete = () => {
    alert('Eliminar persona');
  };

  const datosPaciente = {
    nombre: paciente.nombre || "Sin asignar",
    dni: paciente.dni || "Sin asignar",
    padreACargo: paciente.padreACargo || "Sin asignar"
  };
  
  return (
    <div className="bg-white p-2 sm:p-3 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-1 border-2 border-gray-400 w-full max-w-xs sm:w-[200px] h-auto sm:h-[300px] text-sm sm:text-base">
      {/* Imagen de la persona */}
      <div className="flex items-center justify-center space-x-2">
        <Image 
          width={80}  // Ajustamos el tamaño de la imagen
          height={80}  // Ajustamos el tamaño de la imagen
          src="/icon/persona_silueta.png"
          alt="Silueta de persona"
          className="w-20 h-20"  // Ajustamos la clase de tamaño
        />
      </div>

      {/* Textos debajo de la imagen */}
      <p className="text-sm sm:text-base font-medium text-black text-center">{datosPaciente.nombre}</p>
      <p className="text-sm sm:text-base font-medium text-black text-center">{datosPaciente.dni}</p>
      <p className="text-sm sm:text-base font-medium text-black text-center ">Padre a cargo: {datosPaciente.padreACargo}</p>

      {/* Imagen centrada debajo de los textos */}
      <div className="flex justify-center w-full">
        <Image 
          width={24}  // Ajustamos el tamaño de la imagen
          height={24} // Ajustamos el tamaño de la imagen
          src="/icon/tacho_basura.png"
          alt="Tacho de basura"
          className="w-6 h-6 mt-2"  // Ajustamos el tamaño y margen superior
        />
      </div>
    </div>
  );
};

export default Box_paciente;
