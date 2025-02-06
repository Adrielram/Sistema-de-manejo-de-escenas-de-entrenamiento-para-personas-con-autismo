"use client";
import { create_scene } from '../../../../../utils/api';
import React, { useState } from "react";

const CreateScene: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [idioma, setIdioma] = useState("");
  const [acento, setAcento] = useState("");
  const [complejidad, setComplejidad] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [linkVideo, setLinkVideo] = useState("");

  // Nuevos estados para condiciones
  const [mostrarCondicion, setMostrarCondicion] = useState(false);
  const [edad, setEdad] = useState<number | "">("");
  const [objetivo, setObjetivo] = useState<number | null>(null);
  const [fecha, setFecha] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !idioma || !linkVideo || !acento || !complejidad) {
      alert("Todos los campos son obligatorios");
      return;
    }
  
    try {
      let nuevaCondicionId = null;
  
      // Si hay una condición, créala antes de enviar la escena
      if (mostrarCondicion && (edad || objetivo || fecha)) {
        const nuevaCondicion = { 
          edad: edad || null, 
          objetivo: objetivo || null, 
          fecha: fecha || null 
        };
        const response = await fetch("http://localhost:8000/api/create_condition/", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevaCondicion),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error al crear la condición: ${errorData.error}`);
        }
  
        const result = await response.json();
        nuevaCondicionId = result.id; // Guardamos el ID localmente
      }
  
      const nuevaEscena = {
        nombre: titulo,
        descripcion,
        idioma,
        acento,
        condicion: nuevaCondicionId, // Usamos el ID local
        complejidad,
        link: linkVideo,
      };
  
      const result = await create_scene(nuevaEscena);
      if (result.success) {
        alert("Escena creada exitosamente");
        // Resetear todos los campos
        setTitulo("");
        setAcento("");
        setIdioma("");
        setDescripcion("");
        setComplejidad(0);
        setLinkVideo("");
        setEdad("");
        setObjetivo(null);
        setFecha("");
        setMostrarCondicion(false);
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
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">Crear Escena</h1>
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
              <label className="block font-semibold text-gray-700 mb-2">Condiciones</label>
              <button
                type="button"
                className="bg-blue-500 text-white p-2 rounded-lg"
                onClick={() => setMostrarCondicion(!mostrarCondicion)}
              >
                {mostrarCondicion ? "Ocultar" : "Agregar Condición"}
              </button>

              {mostrarCondicion && (
                <div className="mt-4 space-y-4 p-4 border border-gray-300 rounded-lg">
                  <div>
                    <label className="block text-gray-700">Edad</label>
                    <input
                      type="number"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value ? parseInt(e.target.value) : "")}
                      className="w-full border p-2 rounded-lg"
                      placeholder="Ingrese la edad"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Objetivo</label>
                    <input
                      type="number"
                      value={objetivo ?? ""}
                      onChange={(e) => setObjetivo(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full border p-2 rounded-lg"
                      placeholder="Ingrese el objetivo"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Fecha</label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full border p-2 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
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
          
          <button 
            type="submit" 
            className="w-full bg-[#3EA5FF] text-white font-semibold py-4 rounded-xl hover:bg-[#2E8BFF]"
          >
            Crear Escena
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateScene;