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
    <div className="flex items-center justify-center min-h-screen">
      {/* Contenedor con ancho y altura fijos */}
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-4 mb-4 border-2 border-gray-400 w-[300px] h-[400px]"> 
        {/* Imagen de la persona */}
        <div className="flex items-center justify-center space-x-2">
          <Image 
            width={240}  // Aumenté el tamaño de la imagen
            height={52}  // Aumenté el tamaño de la imagen
            src="/icon/persona_silueta.png"
            alt="Silueta de persona"
            className="w-24 h-24"  // Aumenté la clase de tamaño
          />
        </div>
  
        {/* Textos debajo de la imagen */}
        <p className="text-lg font-medium text-black text-ellipsis overflow-hidden whitespace-nowrap">{datosPaciente.nombre}</p>
        <p className="text-lg font-medium text-black text-ellipsis overflow-hidden whitespace-nowrap">{datosPaciente.dni}</p>
        <p className="text-lg font-medium text-black text-ellipsis overflow-hidden whitespace-nowrap">Padre a cargo: {datosPaciente.padreACargo}</p>
  
        {/* Imagen centrada debajo de los textos */}
        <div className="flex justify-center w-full">
          <Image 
            width={30}  // Achicamos el tamaño de la imagen
            height={30} // Achicamos el tamaño de la imagen
            src="/icon/tacho_basura.png"
            alt="Tacho de basura"
            className="w-8 h-8 mt-4"  // Ajustamos el tamaño y margen superior
          />
        </div>
      </div>
    </div>
  );
}

export default Box_paciente;
