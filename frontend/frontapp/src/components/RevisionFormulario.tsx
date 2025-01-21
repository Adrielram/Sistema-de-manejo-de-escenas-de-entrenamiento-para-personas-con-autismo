"use client"
import React, { useEffect, useState } from "react";

interface Comentario {
  id: number;
  texto: string;
  fecha: string;
  respuesta: number;
  terapeuta: number;
}

interface Respuesta {
  id: number;
  pregunta: number;
  paciente: number;
  respuesta: string;
  correcta: boolean | null;
  nota: string | null;
  comentarios: Comentario[];
  nombre_pregunta: string;
}

interface Formulario {
  id: number;
  titulo: string;
  descripcion: string;
}

interface RespuestasFormularioProps {
  formularioId: number;
  pacienteDni: number;
  terapeutaDni: number;
}

const RevisionFormulario: React.FC<RespuestasFormularioProps> = ({
  formularioId,
  pacienteDni,
  terapeutaDni,
}) => {
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/formularios/${formularioId}/${pacienteDni}/`
        );
        if (!response.ok) {
          throw new Error("Error al cargar los datos del formulario.");
        }
        const data = await response.json();
        setFormulario(data.formulario);
        setRespuestas(data.respuestas);
      } catch (err) {
        setError("Error al cargar los datos del formulario.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formularioId, pacienteDni]);

  const handleAddComment = async (respuestaId: number) => {
    if (!comentarios[respuestaId]) return;

    try {
      const newComment = {
        respuesta: respuestaId,
        terapeuta: terapeutaDni,
        texto: comentarios[respuestaId],
      };

      const response = await fetch("http://localhost:8000/api/comentario_profesional/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newComment),
      });

      if (!response.ok) {
        throw new Error("Error al agregar el comentario.");
      }

      const createdComment: Comentario = await response.json();

      setRespuestas((prevRespuestas) =>
        prevRespuestas.map((respuesta) =>
          respuesta.id === respuestaId
            ? {
                ...respuesta,
                comentarios: [...respuesta.comentarios, createdComment],
              }
            : respuesta
        )
      );

      setComentarios((prev) => ({ ...prev, [respuestaId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Cargando datos...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {formulario && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{formulario.titulo}</h1>
          <p className="text-gray-600">{formulario.descripcion}</p>
        </div>
      )}

      <ul className="space-y-4">
        {respuestas.map((respuesta) => (
          <li
            key={respuesta.id}
            className="p-4 border border-gray-300 rounded-lg shadow-sm"
          >
            <p className="font-medium text-gray-700">
              <strong>Pregunta: {respuesta.nombre_pregunta}</strong>
            </p>
            <p className="font-medium text-gray-700">
              <strong>Respuesta: {respuesta.respuesta}</strong> 
            </p>
            <p className="text-gray-600">
              <strong>Correcta:</strong> {" "}
              {respuesta.correcta !== null ? (respuesta.correcta ? "Sí" : "No") : "Pendiente"}
            </p>

            <div className="mt-4">
              <h4 className="font-semibold text-gray-800">Comentarios:</h4>
              <ul className="list-disc list-inside">
                {respuesta.comentarios.map((comentario) => (
                  <li key={comentario.id} className="text-gray-600">
                    {comentario.texto} (Fecha: {new Date(comentario.fecha).toLocaleString()})
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <textarea
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Agregar un comentario"
                value={comentarios[respuesta.id] || ""}
                onChange={(e) =>
                  setComentarios((prev) => ({
                    ...prev,
                    [respuesta.id]: e.target.value,
                  }))
                }
              ></textarea>
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => handleAddComment(respuesta.id)}
              >
                Enviar Comentario
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RevisionFormulario;
