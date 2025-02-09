 'use client'

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VisualList from "../../../../../../components/element_list";

const GoalsPage = () => {
  const [reachedGoals, setReachedGoals] = useState([]);
  const [unreachedGoals, setUnreachedGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams()
  const patient_dni = searchParams.get('patient_dni')
  const patient_name = searchParams.get('patient_name')

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch de los objetivos alcanzados
        const reachedResponse = await fetch(`http://localhost:8000/api/get_reached_goals/?user_dni=${encodeURIComponent(patient_dni)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // Incluir cookies (para manejar la cookie JWT)
        });

        if (!reachedResponse.ok) {
          throw new Error("Error al obtener los objetivos alcanzados.");
        }
        const reachedData = await reachedResponse.json();

        // Fetch de los objetivos no alcanzados

        const unreachedResponse = await fetch(`http://localhost:8000/api/get_unreached_goals/?user_dni=${encodeURIComponent(patient_dni)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // Incluir cookies (para manejar la cookie JWT)
        });
        if (!unreachedResponse.ok) {
          throw new Error("Error al obtener los objetivos no alcanzados.");
        }
        const unreachedData = await unreachedResponse.json();

        // Actualizar los estados con los datos obtenidos
        setReachedGoals(reachedData);
        setUnreachedGoals(unreachedData);
      } catch (err) {
        console.error(err);
        setError("Hubo un problema al cargar los datos. Inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [patient_dni]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Objetivos del paciente {patient_name}</h1>
      {loading && <p className="text-gray-500">Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <VisualList
          selectedItems={reachedGoals}
          unselectedItems={unreachedGoals}
          //getItemLabel={(item) => item.nombre || `Objetivo #${item.id}`}
          getItemLabel={(item) => (item.nombre ? String(item.nombre) : `Objetivo #${String(item.id)}`)}
          item_type="Objetivos"
          label_selected="Objetivos cumplidos"
          label_unselected="Objetivos no cumplidos"
        />
      )}
    </div>
  );
};

export default GoalsPage;
