"use client";
import React, { useEffect, useState } from 'react';
import {useSelector} from 'react-redux';
import { RootState } from "../../store/store";

interface Comentario {
  id: number;
  texto: string;
  visibilidad: boolean;
  usuario: string;
  idComentarioPadre: number | null;
  usuarioRespondido?: string | null;
}

interface ComentarioPacienteProps {
  idComentario: number;
  respuestas: number[];
  onResponder: (idComentario: number) => void; // Prop agregada para manejar respuestas
}

const ComentarioPaciente: React.FC<ComentarioPacienteProps> = ({ idComentario, respuestas, onResponder }) => {
  const [comentario, setComentario] = useState<Comentario | null>(null);
  const [mostrarRespuestas, setMostrarRespuestas] = useState(false);
  const { username,role } = useSelector((state: RootState) => state.user);
  useEffect(() => {
    const fetchComentario = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/comentarios/?idComentario=${idComentario}`);
        const data = await response.json();
        if (response.ok) {
          setComentario(data);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error al obtener el comentario:', error);
      }
    };
    fetchComentario();
  }, [idComentario]);

  if (!comentario) {
    return <div className="text-gray-500">Cargando comentario...</div>;
  }

  const esComentarioPrincipal = comentario.idComentarioPadre === null;

  return (
    <div className={`border border-gray-200 p-4 mb-3 rounded-lg ${
      esComentarioPrincipal ? 'bg-white text-black text-left text-base' : 'bg-gray-50 text-gray-600 text-right text-sm'
    }`}>
      {!esComentarioPrincipal && (
        <p className="italic mb-2">
          @{comentario.usuarioRespondido}
        </p>
      )}
      <p className='text-red-700'>{comentario.usuario}</p>
      <p>
      {comentario.visibilidad || role === 'terapeuta' || role === 'admin' || role === 'padre' || comentario.usuario === username 
        ? comentario.texto 
        : "Este comentario está oculto"}
      </p>
      
      {/* Verificar si el rol no es 'padre' antes de mostrar el botón respopnder */}
      {role !== 'padre' && (
        <button 
          onClick={() => onResponder(idComentario)} // Llama a la función pasada desde el padre
          className="mt-3 text-xs bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition-colors"
        >
          Responder
        </button>
      )}

      {respuestas.length > 0 && (
        <div className="mt-3">
          <button 
            onClick={() => setMostrarRespuestas(!mostrarRespuestas)}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
          >
            {mostrarRespuestas ? 'Ocultar respuestas' : `Ver respuestas (${respuestas.length})`}
          </button>

          {mostrarRespuestas && (
            <div className="ml-5 mt-3">
              {respuestas.map((respuestaId) => (
                <ComentarioPaciente 
                  key={respuestaId} 
                  idComentario={respuestaId} 
                  respuestas={[]} 
                  onResponder={onResponder} // Pasar la función correctamente
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComentarioPaciente;
