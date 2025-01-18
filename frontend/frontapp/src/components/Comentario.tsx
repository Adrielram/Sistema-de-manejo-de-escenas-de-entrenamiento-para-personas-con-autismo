"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
const Comentario = ({dni}) => {
  
  const [escenas, setEscenas] = useState<any[]>([]);
  const [comentarioActivo, setComentarioActivo] = useState<number | null>(null);

  useEffect(() => {
    if (!dni) return;

    const fetchComentarios = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${baseUrl}paciente/${dni}/comentarios/`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Error al obtener los comentarios");
        }
        const data = await response.json();
        setEscenas(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchComentarios();
  }, [dni]);

  const toggleEngranaje = (id: number) => {
    setComentarioActivo((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      {escenas.map((escena) => (
        <div key={escena.escena} className="flex flex-col w-full bg-greens-light_green shadow-2xl rounded-lg p-4 mb-4">
          <p className="font-bold text-black">ESCENA: {escena.escena}</p>
          {escena.comentarios.map((comentario) => (
            <div key={comentario.id} className="flex flex-col bg-white p-3 rounded-lg shadow-md">
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
                  <p className="ml-4 text-black font-medium">{comentario.texto}</p>
                </div>
              </div>

              {comentarioActivo === comentario.id && (
                <div className="mt-3 p-3 bg-gray-100 rounded-lg shadow-inner">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-black">VISIBILIDAD</p>
                  </div>
                  <div className="flex flex-col mt-2">
                    <label className="text-black">
                      <input type="radio" name={`visibilidad-${comentario.id}`} className="mr-2" defaultChecked={comentario.visibilidad} />
                      PUBLICO
                    </label>
                    <label className="text-black">
                      <input type="radio" name={`visibilidad-${comentario.id}`} className="mr-2" defaultChecked={!comentario.visibilidad} />
                      PRIVADO
                    </label>
                  </div>
                  <button className="mt-3 text-red-500 font-bold">BORRAR COMENTARIO</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Comentario;
