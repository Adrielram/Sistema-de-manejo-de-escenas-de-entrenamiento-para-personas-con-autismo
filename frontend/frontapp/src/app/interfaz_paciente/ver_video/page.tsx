"use client";

import React, { useEffect, useState } from "react";
import ComentarioPaciente from "../../../components/ComentarioPaciente";
import { NuevoComentario } from "../../../components/NuevoComentario";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../store/store";

const VerVideo = () => {
  const { username } = useSelector((state: RootState) => state.user);

  const [comentariosHashSet, setComentariosHashSet] = useState<{
    [key: number]: number[];
  }>({}); // HashSet con comentarios principales y sus respuestas

  const idPersona = 43305894; // Supongamos que es el ID de la persona actual
  const idEscena = 1; // ID de la escena

  // Estado para controlar la actualización
  const [reloadComentarios, setReloadComentarios] = useState(false);

  const [formData, setFormData] = useState({
    user: username,
    escena: idEscena,
    texto: '',
    visibilidad: true,
    comentario_respondido: 0,
  });

  useEffect(() => {
    // Fetch para obtener el HashSet de comentarios
    const fetchComentarios = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/comentarios/lista/?id_escena=${idEscena}`
        );
        const data = await response.json();

        if (response.ok) {
          // Access the nested hashset data
          if (data && data.hashset && typeof data.hashset === 'object') {
            setComentariosHashSet(data.hashset);
          } else {
            console.error('Datos inesperados:', data);
            setComentariosHashSet({});
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
  }, [idPersona, idEscena, reloadComentarios]); // Dependencia adicional para recargar comentarios

  return (
    <div className="flex flex-col px-4 py-4 min-h-screen">
      {/* Contenedor principal */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Comentarios</h3>
        <div>
          <h1>Comentarios</h1>
          {/* Renderizado de comentarios */}
          {Object.keys(comentariosHashSet).map((principalId) => (
            <div key={principalId} className="mb-4">
              <ComentarioPaciente
                idComentario={parseInt(principalId)}
                respuestas={comentariosHashSet[parseInt(principalId)]}
              />
            </div>
          ))}
        </div>
        <NuevoComentario
          formData={formData}
          setFormData={setFormData}
          onCommentAdded={() => setReloadComentarios(!reloadComentarios)} // Llama a esta función cuando se agrega un comentario
        />
      </div>
    </div>
  );
};

export default VerVideo;
