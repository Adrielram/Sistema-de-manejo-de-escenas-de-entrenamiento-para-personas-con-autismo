"use client";
import React, { useState, useEffect, use } from "react";
import SingleSearchSelectBox from "../../../../../components/SingleSearchSelectBox";
import SearchSelectBox from "../../../../../components/SearchSelectBox";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../../../store/store";
import { useRouter } from 'next/navigation';

const EditObjetivo: React.FC<{ params: Promise<{ edit_goal: string }> }> = ({ params }) => {
  // Use React.use to unwrap the Promise
  const { edit_goal } = use(params);
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  const [selectedScenes, setSelectedScenes] = useState([]);
  const [selectedObjectives, setSelectedObjectives] = useState([]);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const { center, username } = useSelector((state: RootState) => state.user)
  const[objetivoId, setObjetivoId] = useState(0);
  // Assume you have state for all scenes if you want to manage them all:

  useEffect(() => {
    const fetchObjetivo = async () => {
      try {
        const response = await fetch(`${baseUrl}objetivo/${edit_goal}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include' // Include cookies (to handle JWT cookie
        });
        if (!response.ok) throw new Error('Objetivo no encontrado');
        const objetivo = await response.json();
        console.log("Objetivo:", objetivo);
        setTitulo(objetivo.nombre);
        setObjetivoId(objetivo.id);
        setDescripcion(objetivo.descripcion);
        setSelectedSceneId(objetivo.video_explicativo_id);
        setSelectedScenes(objetivo.escenas || []);
        setSelectedObjectives(objetivo.objetivos || []);
      } catch (error) {
        console.error("Error fetching objetivo:", error);
      }
    };

    fetchObjetivo();
  }, [baseUrl, edit_goal]);

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
      credentials: 'include',
    });
  
    if (!nameResponse.ok) {
      const errorData = await nameResponse.text();
      console.error("Error resolving names to IDs:", errorData);
      alert("Error al resolver los nombres a IDs.");
      return;
    }
    const responseData = await nameResponse.json();
  
    const objetivoData = {
      id: (await params).edit_goal, // Assuming your API needs this for updates
      nombre: titulo,
      descripcion: descripcion,
      video_explicativo_id: selectedSceneId,
      escenas: selectedScenes.map((item) => item.id),
      objetivos: selectedObjectives.map((item) => item.id),
      centro_profesional: responseData.center_professional,
    };
  
    try {
      const createResponse = await fetch(`${baseUrl}objetivos/${objetivoId}/`, {
        method: "PUT", // Change to PUT for updating
        credentials: "include",

        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify(objetivoData),

      });
  
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("Error al actualizar el objetivo:", errorText);
        alert("Hubo un problema al actualizar el objetivo.");
        return;
      }
  
      const data = await createResponse.json();
      console.log("Objetivo actualizado con éxito:", data);
      alert("Objetivo actualizado con éxito.");
      // Here you could redirect or clear the form
      router.push('/therapist/selection/goals'); // Redirige a una página de listado de escenas

    } catch (error) {
      console.error("Network error while updating objetivo:", error);
      alert("Error de red al intentar actualizar el objetivo.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">
          Editar Objetivo
        </h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1  lg:grid-cols-2 gap-8" >
          {/* Your form fields remain the same but with initial values */}
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
            getItemLabel={(item) => item?.nombre as string || "Sin Nombre"}
            selectedItemId={selectedSceneId}
            onSelectItem={setSelectedSceneId}
            apiUrl={`${baseUrl}escenas/`} />
          

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
              title="Buscar SubObjetivos"
              searchPlaceholder="Escribe el nombre del objetivo..."
              getItemLabel={(item) => item.nombre as string}
              selectedItems={selectedObjectives}
              onSelectItems={setSelectedObjectives}
              apiUrl={`${baseUrl}objetivos-list/`}
            />
          </div>

          <div className="lg:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full bg-[#3EA5FF] text-white font-semibold py-4 rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
            >
              Actualizar Objetivo
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditObjetivo;