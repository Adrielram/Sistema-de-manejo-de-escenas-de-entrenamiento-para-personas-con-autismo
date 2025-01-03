"use client";
import React from 'react';
//import ReactDOM from 'react-dom';
import Image from 'next/image';

// Ruta de las imágenes
//import photo from '../../public/icon/persona_silueta.png'; // Tu imagen de la silueta
import trashIcon from '../../public/icon/tacho_basura.png'; // Tu ícono de tacho de basura

// poner un parametro por cada opcion, en true o false
// personalInfo = true -> muestra dni y nombre del padre, sino no.
// button_ver -> muestra boton de ver el paciente
// trash_bin -> muestra tacho de basura
// button_comments -> muestra boton de comentarios
// button_edit -> muestra boton de editar
// button_seguimiento -> muestra boton de seguimiento

// dependiendo la cant de info, la tarjeta puede ser mas grande o mas chica. deberia adaptarse

type OpcionesProps = {
  // nombre se muestra siempre
  personalInfo?: boolean; // DNI y padre a cargo
  buttonVer?: boolean; // Muestra botón de "Ver"
  trashBin?: boolean; // Muestra icono de tacho de basura
  buttonComments?: boolean; // Muestra botón de "Comentarios"
  buttonEdit?: boolean; // Muestra botón de "Editar"
  buttonSeguimiento?: boolean; // Muestra botón de "Seguimiento"
};

type pacienteProps = {
  id: number;
  nombre: string;
  dni: string;
  padreACargo: string;
}

type BoxPacienteProps = {
  paciente: pacienteProps;
  opciones: OpcionesProps;
};


const Box_paciente = ({paciente,opciones}:BoxPacienteProps) => {
  const handleDelete = () => {
    alert('Eliminar persona');
  };

  const handleVer = () => {
    alert(`Ver detalles de ${paciente.nombre}`);
  };

  const handleComments = () => {
    alert(`Ver comentarios de ${paciente.nombre}`);
  };

  const handleEdit = () => {
    alert(`Editar a ${paciente.nombre}`);
  };

  const handleSeguimiento = () => {
    alert(`Ver seguimiento de ${paciente.nombre}`);
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
<p className="text-sm sm:text-base font-medium text-black text-center">{datosPaciente.nombre}</p>
{/* Información personal */}
{opciones.personalInfo && (
        <>
          <p className="text-sm sm:text-base font-medium text-black text-center">{datosPaciente.dni}</p>
          <p className="text-sm sm:text-base font-medium text-black text-center">
            Padre a cargo: {datosPaciente.padreACargo}
          </p>
        </>
      )}

      {/* Botones y acciones */}
      <div className="flex flex-wrap justify-center w-full space-x-2 mt-2">
        {opciones.buttonVer && (
          <button
            onClick={handleVer}
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm"
          >
            Ver
          </button>
        )}
        {opciones.buttonEdit && (
          <button
          onClick={handleEdit}
          className="bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark text-sm"
          >
            Editar
          </button>
        )}
        {opciones.buttonSeguimiento && (
          <button
          onClick={handleSeguimiento}
          className="bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark text-sm"
          >
            Seguimiento
          </button>
        )}
      </div>
        {opciones.buttonComments && (
          <button
            onClick={handleComments}
            className="bg-primary text-white px-2 py-1 rounded hover:bg-primary-dark text-sm"
          >
            Comentarios
          </button>
        )}

      {/* Icono del tacho de basura */}
      {opciones.trashBin && (
        <div className="flex justify-center w-full mt-2">
          <Image
            width={24}
            height={24}
            src={trashIcon}
            alt="Tacho de basura"
            className="w-6 h-6 cursor-pointer"
            onClick={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default Box_paciente;