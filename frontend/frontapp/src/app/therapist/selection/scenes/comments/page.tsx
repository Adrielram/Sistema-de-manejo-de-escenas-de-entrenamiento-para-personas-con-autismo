"use client";

import React, { useEffect, useState } from "react";
import ComentarioPaciente from "../../../../../components/ComentarioPaciente";
import { useSearchParams } from "next/navigation";

const ComentariosEscena = () => {
  const searchParams = useSearchParams();
  const escenaId = searchParams.get("scene_id");
  const [comentariosHashSet, setComentariosHashSet] = useState<{
    [key: number]: number[];
  }>({});
  const [loadingComentarios, setLoadingComentarios] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //const baseURL = process.env.NEXT_PUBLIC_API_URL;

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
        const response = await fetch(
          //const response = await fetch(`${baseURL}api/comentarios/lista/?id_escena=${escenaId}`);
          `http://localhost:8000/api/comentarios/lista/?id_escena=${escenaId}`
        );
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
  }, [escenaId]);

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
              onResponder={(id) => {
                console.log(`Respondiendo al comentario con ID: ${id}`);
              }}
            />
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-center">No existen comentarios para esta escena.</p>
      )}
    </div>
  );
};

export default ComentariosEscena;
