'use client'

import { useSearchParams } from 'next/navigation'
import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from "react-redux";
import { setUserId, setObjetivoId, setIdEscena } from '../../../../../../../slices/userSlice';
import ComentarioPaciente from '../../../../../../components/ComentarioPaciente';

interface Escena {
    id: number;
    nombre: string;
}

const PatientComments = () => {
    const searchParams = useSearchParams()
    const patient_id = searchParams.get('patient_dni')

    const dispatch = useDispatch();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [escenasActivas, setEscenasActivas] = useState<Escena[]>([]);
    const [escenaSeleccionada, setEscenaSeleccionada] = useState<number | null>(null);
    const [comentariosHashSet, setComentariosHashSet] = useState<{
      [key: number]: number[];
    }>({});
    const comentariosRef = useRef<HTMLDivElement>(null);
    
    const handleEscenaClick = (escenaId: number) => {
        setEscenaSeleccionada(escenaId);
        dispatch(setIdEscena({ idEscena: escenaId }));
        
        const fetchComentarios = async () => {
          try {
            const response = await fetch(
              `http://localhost:8000/api/comentarios/lista/?id_escena=${escenaId}`
            );
            const data = await response.json();
    
            if (response.ok) {
              setComentariosHashSet(data.hashset);
              
              // Scroll a los comentarios
              if (comentariosRef.current) {
                comentariosRef.current.scrollIntoView({ behavior: "smooth" });
              }
            } else {
              console.error(data.error);
              setComentariosHashSet({});
            }
          } catch (error) {
            console.error("Error al obtener los comentarios:", error);
            setComentariosHashSet({});
          }
        };
    
        fetchComentarios();
      };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col md:flex-row gap-6">
            <div className="w-full flex-1">
                {/* Comentarios */}
                {escenaSeleccionada && (
                <div ref={comentariosRef} className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Comentarios de la Escena {escenaSeleccionada}</h2>
                    {Object.keys(comentariosHashSet).length > 0 ? (
                    Object.keys(comentariosHashSet).map((principalId) => (
                        <div key={principalId} className="mb-4">
                        <ComentarioPaciente
                            idComentario={parseInt(principalId)}
                            respuestas={comentariosHashSet[parseInt(principalId)]}
                            onResponder={() => {}}
                        />
                        </div>
                    ))
                    ) : (
                    <p className="text-gray-500 text-center">No existen comentarios para esta escena</p>
                    )}
                </div>
                )}

                {/* Sidebar */}
                {sidebarVisible && (
                    <div className="w-full md:w-[45%] bg-gray-100 rounded-lg shadow p-4">
                    <h2 className="text-xl font-bold mb-2">Escenas</h2>
                    <ul className="space-y-4">
                        {escenasActivas.map((escena) => (
                        <li
                            key={escena.id}
                            className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <button
                            onClick={() => handleEscenaClick(escena.id)}
                            className="text-left w-full"
                            >
                            <h3 className="text-lg font-semibold text-blue-600 mb-2">{escena.nombre}</h3>
                            </button>
                        </li>
                        ))}
                    </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientComments