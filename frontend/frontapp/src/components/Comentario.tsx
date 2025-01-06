"use client";
import React, { useState } from "react";
import Image from "next/image";

const comentarios = [
  { id: 1, texto: "Este es el primer comentario" },
  { id: 2, texto: "Otro comentario importante" },
  { id: 3, texto: "Este objetivo es clave para el proyecto" },
];

const objetivos = [
  { id: 1, texto: "Hablar en una plaza con paqui" },
  { id: 2, texto: "Hablar en una plaza con paqui otra vez" },
];

const Comentario = () => {
  const [objetivoAbierto, setObjetivoAbierto] = useState<number | null>(null);
  const [comentarioActivo, setComentarioActivo] = useState<number | null>(null);

  const toggleDesplegarObjetivo = (id : number) => {
    setObjetivoAbierto((prev) => (prev === id ? null : id)); // Alterna el estado del objetivo
    setComentarioActivo(null); // Cierra cualquier comentario abierto cuando se cambia de objetivo
  };

  const toggleEngranaje = (id : number) => {
    setComentarioActivo((prev) => (prev === id ? null : id)); // Alterna el comentario activo
  };

  return (
    
    <div>
      {objetivos.map((objetivo) => (
        <div
          key={objetivo.id}
          className="flex flex-col w-full bg-greens-light_green shadow-2xl rounded-lg p-4 mb-4"
        >
          {/* Cabecera del objetivo */}
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-col justify-center">
              <p className="font-bold text-black">
                COMENTARIOS OBJETIVO {objetivo.id}
              </p>
              <p className="ml-3 text-black">DESCRIPCIÓN DEL OBJETIVO: {objetivo.texto} </p>
            </div>

            <Image
              src="/menu_desplegable.png"
              alt="Menu Desplegable"
              width={40}
              height={40}
              className="cursor-pointer"
              onClick={() => toggleDesplegarObjetivo(objetivo.id)} 
            />
          </div>

          {/* Lista de comentarios del objetivo */}
          {objetivoAbierto === objetivo.id && (
            <div className="flex flex-col gap-4 mt-4">
              {comentarios.map((comentario) => (
                <div
                  key={comentario.id}
                  className="flex flex-col bg-white p-3 rounded-lg shadow-md"
                >
                  {/* Cabecera del comentario */}
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                      <Image
                        src="/engranaje.png"
                        alt="Engranaje"
                        width={30}
                        height={30}
                        className="cursor-pointer"
                        onClick={() => toggleEngranaje(comentario.id)} // Alterna el engranaje del comentario
                      />
                      <p className="ml-4 text-black font-medium">{comentario.texto}</p>
                    </div>
                  </div>

                  {/* Detalles del comentario */}
                  {comentarioActivo === comentario.id && (
                    <div className="mt-3 p-3 bg-gray-100 rounded-lg shadow-inner">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-black">VISIBILIDAD</p>                       
                      </div>
                      <div className="flex flex-col mt-2">
                        <label className="text-black">
                            <input
                            type="radio"
                            name="visibilidad" // Usar el mismo "name" agrupa los botones
                            className="mr-2"
                            />
                            PUBLICO
                        </label>
                        <label className="text-black">
                            <input
                            type="radio"
                            name="visibilidad"
                            className="mr-2"
                            />
                            PRIVADO
                        </label>
                        </div>
                      <button className="mt-3 text-red-500 font-bold">
                        BORRAR COMENTARIO
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Comentario;
