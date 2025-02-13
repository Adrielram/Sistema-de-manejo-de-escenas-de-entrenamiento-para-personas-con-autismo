"use client";

import React, { useEffect, useState, useRef } from "react";
import ComentarioPaciente from "../../../../../components/ComentarioPaciente";
import { NuevoComentario } from "../../../../../components/NuevoComentario"
import { useSearchParams } from "next/navigation";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../../../store/store";

const ComentariosEscena = () => {
  const searchParams = useSearchParams();
  const escenaId = searchParams.get("scene_id");
  const [comentariosHashSet, setComentariosHashSet] = useState<{
    [key: number]: number[];
  }>({});
  const [loadingComentarios, setLoadingComentarios] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadComentarios, setReloadComentarios] = useState(false);
  const { username } = useSelector((state: RootState) => state.user);
  const nuevoComentarioRef = useRef<HTMLDivElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    user: username, 
    escena: Number(escenaId),
    texto: '',
    visibilidad: true,
    comentario_respondido: 0,
    usuarioRespondido: '',
  });

  // Fetch para cargar los comentarios de la escena
  useEffect(() => {
    const fetchComentarios = async () => {
      if (!escenaId) {
        setError("No se proporcionó un identificador de escena.");
        setLoadingComentarios(false);
        return;
      }

      try {
        setLoadingComentarios(true);
        const response = await fetch(`${baseUrl}comentarios/lista/?id_escena=${escenaId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include', // Incluir cookies (para manejar la cookie JWT)
        });
        const data = await response.json();

        if (response.ok) {
          setComentariosHashSet(data.hashset || {});
        } else {
          console.error(data.error);
          setError("Error al cargar los comentarios.");
        }
      } catch (err) {
        console.error("Error al obtener los comentarios:", err);
        setError("Error al conectarse al servidor.");
      } finally {
        setLoadingComentarios(false);
      }
    };

    fetchComentarios();
  }, [escenaId, reloadComentarios]);

  const handleResponder = async (idComentario: number) => {
    try {
      const response = await fetch(
        `${baseUrl}comentarios/?idComentario=${idComentario}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          comentario_respondido: idComentario,
          usuarioRespondido: data.usuario,
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

  if (loadingComentarios) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-gray-600">Cargando comentarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Comentarios de la Escena {escenaId}</h1>
      
      {Object.keys(comentariosHashSet).length > 0 ? (
        Object.keys(comentariosHashSet).map((principalId) => (
          <div key={principalId} className="mb-4">
            <ComentarioPaciente
              idComentario={parseInt(principalId)}
              respuestas={comentariosHashSet[parseInt(principalId)]}
              onResponder={handleResponder}
            />
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No existen comentarios para esta escena.</p>
      )}

      {formData.comentario_respondido !== 0 && (
        <div className="flex items-center text-sm text-gray-600 mt-2">
          <p>Respondiendo a @{formData.usuarioRespondido}</p>
          <button
            onClick={() =>
              setFormData((prev) => ({ ...prev, comentario_respondido: 0 }))
            }
            className="ml-2 text-red-500 hover:text-red-700 transition-colors"
          >
            &#x2716;
          </button>
        </div>
      )}

      <div ref={nuevoComentarioRef}>
        <NuevoComentario
          formData={formData}
          setFormData={setFormData}
          onCommentAdded={() => setReloadComentarios(!reloadComentarios)}
        />
      </div>
    </div>
  );
};

export default ComentariosEscena;