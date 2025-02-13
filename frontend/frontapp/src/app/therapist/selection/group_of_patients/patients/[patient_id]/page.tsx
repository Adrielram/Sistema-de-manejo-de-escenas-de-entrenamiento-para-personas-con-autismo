'use client'

import React, { useEffect, useState } from 'react';
import AssignedObjectives from '../../../../../../components/AssignedObjectives';
import { SceneWithOrder } from '../../../../../../types';
import SortableSearchSelectBox from '../../../../../../components/SortableSearchSelectBox';
import UserPathologies from '../../../../../../components/UserPathologies';
import { useSelector } from "react-redux";
import { RootState } from '../../../../../../../store/store';
interface Objetivo{
  id: number;
  nombre: string;
}
const EditPatient: React.FC<{ params: Promise<{ patient_id: string }> }> = ({ params }) => {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SceneWithOrder[]>([]);
  const [objetivoId, setObjetivoId] = useState<number | null>(null);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const { username } = useSelector( (state: RootState) => state.user)
  const { center } = useSelector( (state: RootState) => state.user)

  // Obtener el patientId de los parámetros
  useEffect(() => {
    const unwrapParams = async () => {
      try {
        const resolvedParams = await params;
        setPatientId(resolvedParams.patient_id);
      } catch (error) {
        console.error("Error resolviendo params:", error);
      }
    };
    unwrapParams();
  }, [params]);

  // Función para obtener todos los objetivos
  const fetchObjetivos = async () => {
    try {
      const response = await fetch(`${baseUrl}objetivos/?username=${username}&centername=${center}`);
      if (!response.ok) {
        throw new Error("Error al cargar los objetivos.");
      }
      const data = await response.json();
      setObjetivos(data);
    } catch (error) {
      console.error("Error fetching objetivos:", error);
    }
  };

  
  // Efecto para cargar todos los objetivos al montar el componente
  useEffect(() => {
    fetchObjetivos();
  }, []);

  // Función para manejar cambios en el orden
  const handleOrderChange = (orderableItems: SceneWithOrder[], nonOrderableItems: SceneWithOrder[]) => {
    console.log("Orderable Items:", orderableItems);
    console.log("Non-Orderable Items:", nonOrderableItems);
    // Aquí puedes hacer algo con estos datos, como enviarlos al backend
    console.log("objetivo Id", objetivoId);
  };
 
  // Función para obtener la etiqueta de un ítem
  const getItemLabel = (item: SceneWithOrder) => item.nombre;

  // Función que se ejecuta cuando se seleccionan o deseleccionan ítems
  const handleSelectItems = (items: SceneWithOrder[]) => {
    console.log("Selected Items actualizado:", items); // Depuración
    setSelectedItems(items);
  };

   // Función para guardar los cambios (orden de las escenas)
   const handleSubmit = async () => {
    try {
      // Separar los items en ordenables y no ordenables
      const orderableItems = selectedItems.filter(item => item.order !== null);
      const nonOrderableItems = selectedItems.filter(item => item.order === null);
  
      // Enviar ambos conjuntos de datos al backend
      const response = await fetch(`${baseUrl}objetivo_save_order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ordered_escenas: orderableItems.map((item) => ({
            id: item.id,
            order: item.order, // Incluir el orden actual
          })),
          non_ordered_escenas: nonOrderableItems.map((item) => item.id), // Solo los IDs para los no ordenables
          patientId: patientId,
          objetivoId: objetivoId,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Error al guardar el orden de las escenas.");
      }
      setSelectedItems([]);
      
      alert("¡Cambios guardados exitosamente!");
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Hubo un error al guardar los cambios.");
    }
  };

  return (
    <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-blue-100">
      {/* Selector de objetivo */}
      <div>
        <label htmlFor="objetivo" className="block text-gray-700 font-semibold mb-2">
          Selecciona un objetivo:
        </label>
        <select
          id="objetivo"
          onChange={(e) => {setObjetivoId(Number(e.target.value)); setSelectedItems([]); }}
          className="w-full pl-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
        >
          <option value="">-- Selecciona un objetivo --</option>
          {objetivos.map((objetivo) => (
            <option key={objetivo.id} value={objetivo.id}>
              {objetivo.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Componente SortableSearchSelectBox */}
      {objetivoId && (
        <>
          <SortableSearchSelectBox
            title="Selecciona Escenas"
            searchPlaceholder="Buscar escenas..."
            getItemLabel={getItemLabel}
            selectedItems={selectedItems}
            onSelectItems={handleSelectItems}
            onOrderChange={handleOrderChange} // Pasar la función de callback
            apiUrl={`${baseUrl}objetivo/${objetivoId}/user/${patientId}/escenas/`} // URL de la API que devuelve las escenas
            resetTrigger={selectedItems.length === 0}

          />
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
          >
            Guardar Cambios
          </button>
        </>
      )}

      <AssignedObjectives patientId={patientId} />
      <UserPathologies userId={patientId} />
      
    </div>
  );
};

export default EditPatient;