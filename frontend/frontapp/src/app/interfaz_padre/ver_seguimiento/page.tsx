"use client";

import React, { useEffect, useState } from "react";
import Objetivo from "../../../components/Objetivo";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUserId, setObjetivoId } from "../../../../slices/userSlice";
import {useSelector} from "react-redux";
import { RootState } from "../../../../store/store";

type ObjetivoData = {
  id: number;
  nombre: string;
  descripcion: string;
};

type PersonaObjetivo = {
  progreso: number;
  objetivo: ObjetivoData;
  resultado: string | null;
};

const ObjetivoList = () => {
  const {userId} = useSelector((state: RootState) => state.user); // Obtén el userId del estado global
  const dispatch = useDispatch();
  const username = "Mateo Romero"; // Simulación de datos
  const [objetivos, setObjetivos] = useState<PersonaObjetivo[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const router = useRouter();
  
  

  useEffect(() => {
    // Simulación de datos
    
    const simulatedData: PersonaObjetivo[] = [
      {
        progreso: 30,
        objetivo: {
          id: 1,
          nombre: "Objetivo 1",
          descripcion: "Descripción del objetivo 1",
        },
        resultado: "Resultado del objetivo 1",
      },
      {
        progreso: 50,
        objetivo: {
          id: 2,
          nombre: "Objetivo 2",
          descripcion: "Descripción del objetivo 2",
        },
        resultado: null,
      },
      {
        progreso: 70,
        objetivo: {
          id: 3,
          nombre: "Objetivo 3",
          descripcion: "Descripción del objetivo 3",
        },
        resultado: "Resultado del objetivo 3",
      },
      {
        progreso: 90,
        objetivo: {
          id: 4,
          nombre: "Objetivo 4",
          descripcion: "Descripción del objetivo 4",
        },
        resultado: "Resultado del objetivo 4",
      },
      {
        progreso: 100,
        objetivo: {
          id: 5,
          nombre: "Objetivo 5",
          descripcion: "Descripción del objetivo 5",
        },
        resultado: "Resultado del objetivo 5",
      },
    ];

    // Simular la carga de datos
    setObjetivos(simulatedData);
  }, []); // Se ejecuta solo una vez en el primer renderizado

  const handleExpand = (id: number) => {
    dispatch(setUserId({userId:userId}));
    dispatch(setObjetivoId({objetivoId:id}));
    setExpandedId(expandedId === id ? null : id);
  };

  const handleNavigate = () => {
    router.push(`./ver_comentario/`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Paciente {username}</h1>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Lista de Objetivos {userId}</h1>
        {objetivos.map(({ progreso, objetivo, resultado }) => (
          <Objetivo
            key={objetivo.id}
            id={objetivo.id}
            titulo={objetivo.nombre}
            descripcion={objetivo.descripcion} // Puedes ajustar esto según sea necesario
            expanded={expandedId === objetivo.id}
            onExpand={handleExpand}
            onNavigate={() => handleNavigate()}
            resultado={resultado}
            progreso={progreso} // Pasar el progreso aquí
          />
        ))}
      </div>
    </div>
  );
};

export default ObjetivoList;
