"use client";
import {useSelector} from 'react-redux';
import React, { useState } from "react";
import SingleSearchSelectBox from "../../../../../components/SingleSearchSelectBox";
import SearchSelectBox from "../../../../../components/SearchSelectBox";
import { RootState } from '../../../../../../store/store';

const CreateObjetivo: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  const [selectedScenes, setSelectedScenes] = useState([]);
  const [selectedObjectives, setSelectedObjectives] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const {username} = useSelector((state: RootState) => state.user);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const objetivoData = {
      nombre: titulo,
      descripcion,
      video_explicativo_id: selectedSceneId, // ID del video explicativo
      escenas: selectedScenes.map((item) => item.id), // IDs de las escenas seleccionadas
      objetivos: selectedObjectives.map((item) => item.id),
    };
  
    try {
      const response = await fetch(`${baseUrl}create_objetivo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(objetivoData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al crear el objetivo:", errorData);
        alert("Hubo un problema al crear el objetivo.");
        return;
      }
  
      const data = await response.json();
      console.log("Objetivo creado con éxito:", data);
      alert("Objetivo creado con éxito.");
      // Aquí podrías redirigir o limpiar el formulario
    } catch (error) {
      console.error("Error de red al crear el objetivo:", error);
      alert("Error de red al intentar crear el objetivo.");
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">
          Crear Objetivo
        </h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1  lg:grid-cols-2 gap-8" >
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
            
            <SingleSearchSelectBox
              title="Buscar Video Explicativo"
              searchPlaceholder="Escribe el nombre de la escena..."
              getItemLabel={(item) => item.nombre as string}
              selectedItemId={selectedSceneId}
              onSelectItem={(id) => {
                console.log("Escena seleccionada:", id);
                setSelectedSceneId(id); // Actualiza el estado con el id seleccionado
              }}
              apiUrl={`${baseUrl}escenas/`}
            />


          </div>          
          <div>
            <SearchSelectBox
              title="Buscar Escenas"
              searchPlaceholder="Escribe el nombre de la escena..."
              getItemLabel={(item) => item.nombre as string}
              selectedItems={selectedScenes}
              onSelectItems={setSelectedScenes}
              apiUrl={`${baseUrl}escenas/`}
            />

            <SearchSelectBox
              title="Buscar Objetivos"
              searchPlaceholder="Escribe el nombre del objetivo..."
              getItemLabel={(item) => item.nombre as string} // Asumiendo que cada objetivo tiene un campo 'nombre'
              selectedItems={selectedObjectives}
              onSelectItems={setSelectedObjectives} // Maneja la selección de objetivos
              apiUrl={`${baseUrl}objetivos-list/`} // URL para los objetivos
            />

            {/* Botón para manejar los IDs seleccionados 
            <button
              onClick={() => console.log("Escenas seleccionadas (IDs):", selectedScenes.map((item) => item.id))}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
              type="button"
            >
              Obtener IDs Seleccionados
            </button>
             */}
           
          </div>

          {/* Botón de submit a pantalla completa */}
          <div className="lg:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full bg-[#3EA5FF] text-white font-semibold py-4 rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
            >
              Crear Objetivo
            </button>
          </div>
          <div className="lg:col-span-2 mt-6">
            {username}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateObjetivo;