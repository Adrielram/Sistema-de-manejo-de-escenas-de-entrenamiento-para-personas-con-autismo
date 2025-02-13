"use client";
import React from 'react';
//import ReactDOM from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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

type datosProps = {
  id: number;
  nombre: string;
  dni?: string;
  nombre_padre?: string;
  role?: string;
}

type BoxProps = {
  elem: datosProps;
  opciones: OpcionesProps;
  img: string;
};


const Box = ({elem , opciones, img}:BoxProps) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const handleDelete = async () => {
    let endpoint = '';
  
    if (elem.role) {
      // Es un usuario (paciente o terapeuta)
      endpoint = elem.role === 'paciente' ? `${baseUrl}pacientes/` : `${baseUrl}terapeutas/`;
    } else {
      // Es un grupo
      endpoint = `${baseUrl}grupos/`;
    }
  
    try {
      let response;
      if (elem.role){
          response = await fetch(`${endpoint}${elem.dni}/`, {
          method: 'DELETE',
        });
      }else{
          response = await fetch(`${endpoint}${elem.id}/`, {
          method: 'DELETE',
        });
      }
  
      if (response.ok) {
        alert(`Elemento ${elem.nombre} eliminado exitosamente.`);
        // Aquí podrías actualizar la lista localmente o refetch la lista
      } else {
        alert('Error al eliminar el elemento.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un problema al intentar eliminar el elemento.');
    }
  };
  
  

  const handleVer = () => {
    alert(`Ver detalles de ${elem.nombre}`);
  };

  const handleComments = async () => {
    if (!elem?.dni) {      
      return;
    }
    router.push(`/admin/patients/${elem.dni}`);
  };

  const handleEdit = () => {
    alert(`Editar a ${elem.nombre}`);
  };

  const handleSeguimiento = () => {
    alert(`Ver seguimiento de ${elem.nombre}`);
  };


  const elemento = {
    nombre: elem.nombre || "Sin asignar",
    dni: elem.dni || "Sin asignar",
    padreACargo: elem.nombre_padre || "Sin asignar"
  };  
  
  return (
    <div className="bg-white p-2 sm:p-3 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-1 border-2 border-gray-400 w-full max-w-xs sm:w-[200px] h-auto sm:h-[300px] text-sm sm:text-base mt-5">
      {/* Imagen de la persona */}
      <div className="flex items-center justify-center h-[100px]">
        <Image 
          width={80}
          height={80}
          src={img}
          alt="Silueta de persona"
          className="w-20 h-20"
        />
      </div>

      {/* Contenedor de información */}
      <div className="flex flex-col items-center justify-center space-y-2 w-full h-[120px]"> 
        <p className="text-sm sm:text-base font-medium text-black text-center">
          {elemento.nombre}
        </p>

        {/* Información personal */}
        {opciones.personalInfo && (
          <>
            <p className="text-xs sm:text-xs text-black text-center">
              {elemento.dni}
            </p>
            {elemento.padreACargo !== "Sin asignar" && (
              <p className="text-xs sm:text-xs text-black text-center break-words px-2">
                Padre a cargo: {elemento.padreACargo}
              </p>
            )}
          </>
        )}
      </div>

      {/* Botones y acciones */}
      <div className="flex flex-wrap justify-center w-full space-x-2 pb-6">
        {opciones.buttonVer && (
          <button
            onClick={handleVer}
            className="bg-primary text-white px-7 py-1.5 rounded-2xl hover:bg-primary-dark text-sm font-bold"
          >
            Ver
          </button>
        )}
        {opciones.buttonEdit && (
          <button
          onClick={handleEdit}
          className="bg-primary text-white px-7 py-1.5 rounded-2xl hover:bg-primary-dark text-sm font-bold"
          >
            EDITAR
          </button>
        )}
        {opciones.buttonSeguimiento && (
          <button
          onClick={handleSeguimiento}
          className="bg-primary text-white px-7 py-1.5 rounded-2xl hover:bg-primary-dark text-sm font-bold"
          >
            Seguimiento
          </button>
        )}
        {opciones.buttonComments && (
          <button
            onClick={handleComments}
            className="bg-primary text-white px-7 py-1.5 rounded-2xl hover:bg-primary-dark text-sm font-bold"
          >
            Comentarios
          </button>
        )}
      </div>

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

export default Box;