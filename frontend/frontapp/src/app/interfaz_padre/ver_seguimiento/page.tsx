"use client";

import React, { useEffect, useState } from "react";
import Objetivo from "../../../components/Objetivo";
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store';

type ObjetivoData = {
  id: number;
  nombre: string;
  descripcion: string;
};

type PersonaObjetivo = {
  progreso: number;
  objetivo_id: ObjetivoData;  
  resultado: string | null;
};

const ObjetivoList = () => {
  const { userId } = useSelector((state: RootState) => state.user)
  const [objetivos, setObjetivos] = useState<PersonaObjetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null); 

  useEffect(() => {
    const fetchNombreUsuario = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/get-name/?dni=${userId}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar el nombre del usuario');
        }
        
        const data = await response.json();
        setNombreUsuario(data.nombre); 
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      }
    };

    if (userId) {
      fetchNombreUsuario();
    }
  }, [userId]);

  useEffect(() => {
    const fetchObjetivos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/objetivos-paciente/?user_id=${userId}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar los objetivos');
        }
        
        const data = await response.json();
        setObjetivos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setObjetivos([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchObjetivos();
    }
  }, [userId]);

  const handleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleNavigate = (id: number) => {
    window.alert(`Navegando a comentarios del objetivo con id: ${id}`);
  };

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
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold justify-centrer text-gray-800 mb-6">Paciente: {nombreUsuario}</h1>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Lista de Objetivos</h1>
        {objetivos.length === 0 ? (
          <div className="text-gray-600 text-center">No hay objetivos disponibles</div>
        ) : (
          objetivos.map(({ progreso, objetivo_id, resultado }) => (
            <Objetivo
              key={objetivo_id.id}
              id={objetivo_id.id}
              titulo={objetivo_id.nombre}
              descripcion={objetivo_id.descripcion}
              expanded={expandedId === objetivo_id.id}
              onExpand={handleExpand}
              onNavigate={handleNavigate}
              resultado={resultado}
              progreso={progreso}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ObjetivoList;
