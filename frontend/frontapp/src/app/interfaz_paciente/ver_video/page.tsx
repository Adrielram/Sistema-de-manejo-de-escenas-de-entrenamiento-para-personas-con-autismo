"use client";

import React, { useEffect, useState, useRef } from "react";
import ComentarioPaciente from "../../../components/ComentarioPaciente";
import { NuevoComentario } from "../../../components/NuevoComentario";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../store/store";

const VerVideo = () => {
  const { username } = useSelector((state: RootState) => state.user);

  const [comentariosHashSet, setComentariosHashSet] = useState<{
    [key: number]: number[];
  }>({}); // HashSet con comentarios principales y sus respuestas

  //const { idEscena } = useSelector((state: RootState) => state.user); PONER CUANDO ANDE LO DE REDUX
  const idEscena = 1; // ID de la escena (QUITAR CUANDO ANDE LO DE REDUX)

  const [reloadComentarios, setReloadComentarios] = useState(false);

  const [formData, setFormData] = useState({
    user: username,
    escena: idEscena,
    texto: '',
    visibilidad: true,
    comentario_respondido: 0,
    usuarioRespondido: '', // Nuevo campo para guardar el nombre del usuario respondido
  });

  const nuevoComentarioRef = useRef<HTMLDivElement>(null); // Referencia al componente NuevoComentario

  const handleResponder = async (idComentario: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/comentarios/?idComentario=${idComentario}`
      );
      const data = await response.json();
      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          comentario_respondido: idComentario,
          usuarioRespondido: data.usuario, // Asigna el nombre del usuario respondido
        }));

        // Scroll al fondo de la página
        if (nuevoComentarioRef.current) {
          nuevoComentarioRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error al obtener el usuario del comentario:", error);
    }
  };

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
  }, [ idEscena, reloadComentarios]); // Dependencia adicional para recargar comentarios

  return (
    <div className="flex flex-col px-4 py-4 min-h-screen">
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Comentarios</h3>
        <div>
          {/* Renderizado de comentarios */}
          {Object.keys(comentariosHashSet).map((principalId) => (
            <div key={principalId} className="mb-4">
              <ComentarioPaciente
                idComentario={parseInt(principalId)}
                respuestas={comentariosHashSet[parseInt(principalId)]}
                onResponder={handleResponder}
              />
            </div>
          ))}
        </div>
        {formData.comentario_respondido !== 0 && (
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <p>Respondiendo a @{formData.user}</p>
            <button
              onClick={() =>
                setFormData((prev) => ({ ...prev, comentario_respondido: 0 }))
              }
              className="ml-2 text-red-500 hover:text-red-700 transition-colors"
            >
              &#x2716; {/* Código Unicode para la cruz roja */}
            </button>
          </div>
        )}
        <div ref={nuevoComentarioRef}>
          <NuevoComentario
            formData={formData}
            setFormData={setFormData}
            onCommentAdded={() => setReloadComentarios(!reloadComentarios)} // Llama a esta función cuando se agrega un comentario
          />
        </div>
      </div>
    </div>
  );
};

export default VerVideo;
