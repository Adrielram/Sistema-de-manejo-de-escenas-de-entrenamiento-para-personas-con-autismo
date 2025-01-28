"use client";
import { create_scene } from '../../../../../utils/api'; // Asegúrate de importar correctamente la función

import React, { useState } from "react";



const CreateScene: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [idioma, setIdioma] = useState("");
  const [acento, setAcento] = useState("");
  const [condiciones, setCondicion] = useState<string>("");
  const [complejidad, setComplejidad] = useState(0);
 

  const [linkVideo, setLinkVideo] = useState("");

  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!titulo || !idioma || !linkVideo || !acento || !complejidad) {
      alert("Todos los campos son obligatorios");
      return;
  }

  // Crear un objeto con los datos
  const nuevaEscena = {
      nombre: titulo,
      idioma: idioma,
      acento: acento,
      condiciones: condiciones === "" ? null : condiciones, // Reemplaza cadena vacía por null
      complejidad: complejidad,
      link: linkVideo,
  };

  try {
      // Llamar a la función de creación
      const result = await create_scene(nuevaEscena);

      if (result.success) {
          alert("Escena creada exitosamente");
          
          // Resetear los campos
          setTitulo("");
          setAcento("");
          setIdioma("");
          setCondicion("");
          setComplejidad(0);
          setLinkVideo("");
      } else {
          alert(`Error al crear la escena: ${result.error}`);
      }
  } catch (error) {
      console.error("Error al crear la escena:", error);
      alert("Ocurrió un error inesperado");
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">
          Crear Escena
        </h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8" >
        {/* Columna izquierda */}
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
                    setComplejidad(value); // Solo actualiza si está en el rango
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese la Complejidad"
                min="0" // Establece el valor mínimo
                max="10" // Establece el valor máximo
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


          {/* Botón de submit a pantalla completa */}
          <div className="lg:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full bg-[#3EA5FF] text-white font-semibold py-4 rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
            >
              Crear Escena
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScene;