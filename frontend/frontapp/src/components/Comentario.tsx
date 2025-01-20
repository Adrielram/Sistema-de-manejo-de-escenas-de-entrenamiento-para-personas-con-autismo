"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
const Comentario = ({dni}) => {
  
  const [escenas, setEscenas] = useState<any[]>([]);
  const [comentarioActivo, setComentarioActivo] = useState<number | null>(null);

  
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
  
  const fetchBorrarComentario = async (id) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}comentarios/borrar/${id}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Error al borrar el comentario");
      }
      alert("Comentario eliminado exitosamente");
      setEscenas((prevEscenas) =>
        prevEscenas.map((escena) => ({
          ...escena,
          comentarios: escena.comentarios.filter((comentario) => comentario.id !== id),
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const actualizarVisibilidadLocal = (id, nuevaVisibilidad) => {
    setEscenas((prevEscenas) =>
      prevEscenas.map((escena) => ({
        ...escena,
        comentarios: escena.comentarios.map((comentario) =>
          comentario.id === id
            ? { ...comentario, visibilidad: nuevaVisibilidad }
            : comentario
        ),
      }))
    );
  };
  
  // Modifica fetchCambiarVisibilidad para actualizar el estado local
  const fetchCambiarVisibilidad = async (id, visibilidad) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}comentarios/cambiar-visibilidad/${id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visibilidad }),
      });
      if (!response.ok) {
        throw new Error("Error al cambiar la visibilidad");
      }
      const data = await response.json();
      console.log("Visibilidad actualizada:", data);
  
      // Actualizar estado local
      actualizarVisibilidadLocal(id, visibilidad);
      alert("Visibilidad actualizada correctamente");
    } catch (error) {
      console.error(error);
    }
  };
  

  useEffect(() => {
    if (!dni) return;  
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
                    <input
                      type="radio"
                      name={`visibilidad-${comentario.id}`}
                      className="mr-2"
                      defaultChecked={comentario.visibilidad}
                      onChange={() => fetchCambiarVisibilidad(comentario.id, true)}
                    />
                    PUBLICO
                  </label>
                  <label className="text-black">
                    <input
                      type="radio"
                      name={`visibilidad-${comentario.id}`}
                      className="mr-2"
                      defaultChecked={!comentario.visibilidad}
                      onChange={() => fetchCambiarVisibilidad(comentario.id, false)}
                    />
                    PRIVADO
                  </label>
                  </div>
                  <button className="mt-3 text-red-500 font-bold"
                          onClick={() => fetchBorrarComentario(comentario.id)}
                  >
                    BORRAR COMENTARIO
                  </button>
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
