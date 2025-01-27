"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';

const EditScene: React.FC<{ params: Promise<{ edit_scene: string }> }> = ({ params }) => {
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [idioma, setIdioma] = useState("");
  const [acento, setAcento] = useState("");
  const [condiciones, setCondicion] = useState<string>("");
  const [complejidad, setComplejidad] = useState(0);
  const [linkVideo, setLinkVideo] = useState("");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const [descripcion, setDescripcion] = useState("");
  // Extraer `edit_scene` de `params` y guardarlo en el estado
  useEffect(() => {
    const unwrapParams = async () => {
      console.log("params:", params); // <-- Log para verificar params
      const resolvedParams = await params; // Espera a que la promesa se resuelva
      setSceneId(resolvedParams.edit_scene); // Almacena `edit_scene` en el estado
    };
    unwrapParams();
  }, [params]);

  // Cargar los datos de la escena al montar el componente
  useEffect(() => {
    if (!sceneId) return;

    const fetchScene = async () => {
      try {
        const response = await fetch(`${baseUrl}escenaById/${sceneId}/`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos de la escena");
        }
        const data = await response.json();
        setTitulo(data.nombre || "");
        setIdioma(data.idioma || "");
        setAcento(data.acento || "");
        setCondicion(data.condiciones || "");
        setComplejidad(data.complejidad || 0);
        setDescripcion(data.descripcion || "");
        setLinkVideo(data.link || "");
      } catch (error) {
        console.error(error);
        alert("No se pudieron cargar los datos de la escena");
      }
    };

    fetchScene();
  }, [sceneId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !idioma || !linkVideo || !acento || !complejidad || !descripcion)  {
      alert("Todos los campos son obligatorios");
      return;
    }

    // Crear un objeto con los datos actualizados
    const escenaActualizada = {
      nombre: titulo,
      idioma: idioma,
      acento: acento,
      descripcion: descripcion,
      condiciones: condiciones === "" ? null : condiciones, // Reemplaza cadena vacía por null
      complejidad: complejidad,
      link: linkVideo,
    };

    try {
      const response = await fetch(`${baseUrl}scenes/${sceneId}`, {
        method: "PUT", // Usa el método apropiado según tu API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(escenaActualizada),
      });

      if (response.ok) {
        alert("Escena actualizada exitosamente");
        router.push('/therapist/selection/scenes'); // Redirige a una página de listado de escenas

      } else {
        const errorData = await response.json();
        alert(`Error al actualizar la escena: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error al actualizar la escena:", error);
      alert("Ocurrió un error inesperado");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">
          Editar Escena
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
          <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-blue-100">
            <div>
              <label htmlFor="titulo" className="block font-semibold text-gray-700 mb-2">
                Título
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese el título"
              />
            </div>
            <div>
              <label htmlFor="descripcion" className="block font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF] min-h-[200px]"
                placeholder="Ingrese la descripción"
              />
            </div> 
            <div>
              <label htmlFor="idioma" className="block font-semibold text-gray-700 mb-2">
                Idioma
              </label>
              <input
                id="idioma"
                type="text"
                value={idioma}
                onChange={(e) => setIdioma(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese el Idioma"
              />
            </div>

            <div>
              <label htmlFor="acento" className="block font-semibold text-gray-700 mb-2">
                Acento
              </label>
              <input
                id="acento"
                type="text"
                value={acento}
                onChange={(e) => setAcento(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese el Acento"
              />
            </div>

            <div>
              <label htmlFor="complejidad" className="block font-semibold text-gray-700 mb-2">
                Complejidad
              </label>
              <input
                id="complejidad"
                type="number"
                value={complejidad}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value >= 0 && value <= 10) {
                    setComplejidad(value);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese la Complejidad"
                min="0"
                max="10"
              />
            </div>

            <div>
              <label htmlFor="condiciones" className="block font-semibold text-gray-700 mb-2">
                Condiciones
              </label>
              <input
                id="condiciones"
                type="text"
                value={condiciones}
                onChange={(e) => {
                  const value = e.target.value;
                  setCondicion(value === "" ? "" : value);
                }}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese las Condiciones"
              />
            </div>

            <div>
              <label htmlFor="linkVideo" className="block font-semibold text-gray-700 mb-2">
                Link al Video Explicativo
              </label>
              <input
                id="linkVideo"
                type="search"
                value={linkVideo}
                onChange={(e) => setLinkVideo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese el link"
              />
            </div>
          </div>

          <div className="lg:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full bg-[#3EA5FF] text-white font-semibold py-4 rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditScene;
