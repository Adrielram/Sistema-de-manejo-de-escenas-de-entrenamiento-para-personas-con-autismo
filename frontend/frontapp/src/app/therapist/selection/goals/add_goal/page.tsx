"use client";
import React, { useState } from "react";
import SingleSearchSelectBox from "../../../../../components/SingleSearchSelectBox";
import SearchSelectBox from "../../../../../components/SearchSelectBox";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../../../store/store";
//import { SceneWithOrder } from "../../../../../types"

const CreateObjetivo: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  //const [selectedScenes, setSelectedScenes] = useState<SceneWithOrder[]>([]);
  const [selectedScenes, setSelectedScenes] = useState([]);
  const [selectedObjectives, setSelectedObjectives] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const { center, username } = useSelector((state: RootState) => state.user)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    // First, resolve names to IDs
    const nameResponse = await fetch(`${baseUrl}goal/ResolveNamesToIds/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        center_name: center,
        username: username
      }),
      credentials: 'include', // Include cookies (to handle JWT cookie
    });
  
    if (!nameResponse.ok) {
      const errorData = await nameResponse.text(); // Read as text instead of JSON for error messages
      console.error("Error resolving names to IDs:", errorData);
      alert("Error al resolver los nombres a IDs.");
      return;
    }
    // Here, we parse the JSON data from the response
    const responseData = await nameResponse.json();
    console.log("Response Data:", responseData); // For debugging
  
    // const objetivoData = {
    //   nombre: titulo,
    //   descripcion: descripcion,
    //   video_explicativo_id: selectedSceneId,
    //   escenas: selectedScenes.map((item) => ({
    //     id: item.id,
    //     order: item.order !== null ? item.order : null // Usa el orden real o null si no es ordenable
    //   })),
    //   objetivos: selectedObjectives.map((item) => item.id),
    //   centro_profesional: responseData.center_professional,
    // };
    
    const objetivoData = {
      nombre: titulo,
      descripcion: descripcion,
      video_explicativo_id: selectedSceneId,
      escenas: selectedScenes.map((item) => item.id),
      objetivos: selectedObjectives.map((item) => item.id),
      centro_profesional: responseData.center_professional,
    };
  
    try {
      const createResponse = await fetch(`${baseUrl}create_objetivo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(objetivoData),
        credentials: 'include', // Include cookies (to handle JWT cookie
      });
  
      if (!createResponse.ok) {
        const errorText = await createResponse.text(); // Again, reading as text for error handling
        console.error("Error al crear el objetivo:", errorText);
        alert("Hubo un problema al crear el objetivo.");
        return;
      }
  
      const data = await createResponse.json();
      console.log("Objetivo creado con éxito:", data);
      alert("Objetivo creado con éxito.");
      // Here you could redirect or clear the form
    } catch (error) {
      console.error("Network error while creating objetivo:", error);
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
              } }
              apiUrl={`${baseUrl}escenas/`}             />


          </div>          
          <div>
            {/* <SortableSearchSelectBox
              title="Buscar Escenas"
              searchPlaceholder="Escribe el nombre de la escena..."
              getItemLabel={(item) => item.nombre as string}
              selectedItems={selectedScenes}
              onSelectItems={setSelectedScenes}
              apiUrl={`${baseUrl}escenas/`}
            /> */}

            <SearchSelectBox
              title="Buscar Escenas"
              searchPlaceholder="Escribe el nombre de la escena..."
              getItemLabel={(item) => item.nombre as string}
              selectedItems={selectedScenes}
              onSelectItems={setSelectedScenes}
              apiUrl={`${baseUrl}escenas/`}
            />

            <SearchSelectBox
              title="Buscar SubObjetivos"
              searchPlaceholder="Escribe el nombre del subobjetivo..."
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

        </form>
      </div>
    </div>
  );
};

export default CreateObjetivo;


