 'use client'

import React, { useEffect, useState } from "react";
import Objetivo from "../../../../../../components/Objetivo";
import { useDispatch,  } from "react-redux";
import { setUserId, setObjetivoId } from "../../../../../../../slices/userSlice";
import { useSearchParams } from "next/navigation";
type ObjetivoData = {
  id: number;
  nombre: string;
  descripcion: string;
};

type PersonaObjetivo = {
  id: number;
  progreso: number;
  objetivo_id: ObjetivoData;
  resultado: string | null;
};

const GoalsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objetivos, setObjetivos] = useState<PersonaObjetivo[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const patient_dni = searchParams.get('patient_dni');

  // Fetch objetivos
    useEffect(() => {
      const fetchObjetivos = async () => {
        try {
          setLoading(true);

          const response = await fetch(`http://localhost:8000/api/objetivos-ev-paciente/?user_id=${patient_dni}`);
          if (!response.ok) throw new Error("Error al cargar los objetivos");
          const data = await response.json();       console.log("Fetched data:", data); // Debug log

          setObjetivos(data);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error desconocido");
          setObjetivos([]);
        } finally {
          setLoading(false);
        }
      };
  
      if (patient_dni) fetchObjetivos();
    }, [patient_dni]);
  
  
  const handleExpand = (id: number) => {
      dispatch(setUserId({ userId: patient_dni }));
      dispatch(setObjetivoId({ objetivoId: id }));
      setExpandedId(expandedId === id ? null : id);
    };

    if (!patient_dni) {
      return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center items-center">
          <div className="text-gray-600">No se ha encontrado un usuario.</div>
        </div>
      );
    }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center items-center">
        <div className="text-gray-600">Cargando objetivos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center items-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="w-full lg:w-4/5 mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Lista de Objetivos</h1>
        {objetivos.map(({ id, progreso, objetivo_id }) => (
          <Objetivo
            key={id}
            id={objetivo_id.id}
            titulo={objetivo_id.nombre}
            descripcion={objetivo_id.descripcion}
            expanded={expandedId === objetivo_id.id}
            onExpand={handleExpand}
            progreso={progreso}
            terapeuta_interface={true}
          />
        ))}
      </div>
    </div>
  );
};

export default GoalsPage;
