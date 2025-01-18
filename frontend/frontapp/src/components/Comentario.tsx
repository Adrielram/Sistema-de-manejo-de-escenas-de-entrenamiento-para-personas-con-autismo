"use client";
import React, { useState } from "react";
import Image from "next/image";

// Datos de ejemplo
const escenas = [
  {
    escena: "Escena 1",
    comentarios: [
      {
        id: 1,
        texto: "En el minuto 1:31 no entiendo que dice el letrero",
        visibilidad: true,
      },
      {
        id: 3,
        texto: "¿Qué significa la señal al lado del puente?",
        visibilidad: true,
      },
      {
        id: 5,
        texto: "¡Gracias! Eso explica por qué había un camión detenido ahí.",
        visibilidad: true,
      },
      {
        id: 9,
        texto: "¿Qué es lo que muestra la pantalla del tablero en el minuto 2:15?",
        visibilidad: true,
      },
    ],
  },
  {
    escena: "Escena 2",
    comentarios: [
      {
        id: 6,
        texto: "¿Por qué el auto rojo se detiene en la esquina?",
        visibilidad: true,
      },
      {
        id: 8,
        texto: "Entendido, es importante respetar a los peatones.",
        visibilidad: true,
      },
      {
        id: 11,
        texto: "¿Qué tipo de señal es la que está al costado del camino en el minuto 3:45?",
        visibilidad: true,
      },
    ],
  },
];

const Comentario = () => {
  const [escenaAbierta, setEscenaAbierta] = useState<string | null>(null);
  const [comentarioActivo, setComentarioActivo] = useState<number | null>(null);

  const toggleDesplegarEscena = (escena: string) => {
    setEscenaAbierta((prev) => (prev === escena ? null : escena)); // Alterna la escena abierta
    setComentarioActivo(null); // Cierra cualquier comentario activo cuando se cambia de escena
  };

  const toggleEngranaje = (id: number) => {
    setComentarioActivo((prev) => (prev === id ? null : id)); // Alterna el comentario activo
  };

  return (
    <div>
      {escenas.map(({ escena, comentarios }) => (
        <div
          key={escena}
          className="flex flex-col w-full bg-greens-light_green shadow-2xl rounded-lg p-4 mb-4"
        >
          {/* Cabecera de la escena */}
          <div className="flex flex-row items-center justify-between w-full">
            <div className="flex flex-col justify-center">
              <p className="font-bold text-black">{escena.toUpperCase()}</p>
            </div>

            <Image
              src="/menu_desplegable.png"
              alt="Menu Desplegable"
              width={40}
              height={40}
              className="cursor-pointer"
              onClick={() => toggleDesplegarEscena(escena)}
            />
          </div>

          {/* Lista de comentarios de la escena */}
          {escenaAbierta === escena && (
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
                        onClick={() => toggleEngranaje(comentario.id)}
                      />
                      <p className="ml-4 text-black font-medium">
                        {comentario.texto}
                      </p>
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
                            name={`visibilidad-${comentario.id}`}
                            className="mr-2"
                            defaultChecked={comentario.visibilidad}
                          />
                          PÚBLICO
                        </label>
                        <label className="text-black">
                          <input
                            type="radio"
                            name={`visibilidad-${comentario.id}`}
                            className="mr-2"
                            defaultChecked={!comentario.visibilidad}
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
