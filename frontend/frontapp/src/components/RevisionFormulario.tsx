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
  pacienteDni: string;
  terapeutaDni?: number;
  rolUsuario: "terapeuta" | "persona";
}

const RevisionFormulario: React.FC<RespuestasFormularioProps> = ({
  formularioId,
  pacienteDni,
  terapeutaDni,
  rolUsuario,
}) => {
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comentarios, setComentarios] = useState<{ [key: number]: string }>({});
  const [nuevasNotas, setNuevasNotas] = useState<{ [key: number]: string }>({});
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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
        console.log("Data revision: ", JSON.stringify(data));
  
        setFormulario(data.formulario);
  
        // Obtener el último intento por fecha
        const ultimoIntentoId = data.respuestas.reduce((max, current) =>
          new Date(current.fecha_intento) > new Date(max.fecha_intento) ? current : max
        ).intento_id;
  
        // Filtrar las respuestas del último intento
        const respuestasUltimoIntento = data.respuestas.filter(
          (respuesta) => respuesta.intento_id === ultimoIntentoId
        );
  
        setRespuestas(respuestasUltimoIntento);
      } catch (err) {
        setError("Error al cargar los datos del formulario.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [formularioId, pacienteDni]);
  

  const handleActualizarNota = async (respuestaId: number) => {
    const nuevaNota = nuevasNotas[respuestaId];
    if (!nuevaNota || isNaN(Number(nuevaNota)) || Number(nuevaNota) < 0 || Number(nuevaNota) > 10) {
      alert("Por favor, ingrese un valor numérico válido para la nota.");
      return;
    }  
    try {
      const response = await fetch(`http://localhost:8000/api/respuestas/${respuestaId}/actualizar-nota/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nota: nuevaNota }),
      });
  
      if (!response.ok) {
        throw new Error("Error al actualizar la nota.");
      }
  
      // Actualiza las respuestas localmente
      setRespuestas((prevRespuestas) =>
        prevRespuestas.map((respuesta) =>
          respuesta.id === respuestaId
            ? { ...respuesta, nota: nuevaNota }
            : respuesta
        )
      );
      setNuevasNotas((prev) => ({ ...prev, [respuestaId]: "" }));
  
      alert("Nota actualizada correctamente.");
    } catch (err) {
      console.error(err);
      alert("Hubo un error al actualizar la nota.");
    }
  };

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

  
  const actualizarRespuesta = async (idRespuesta:number , esCorrecta: boolean) => {
    try {
      const url = `${baseUrl}respuesta/${idRespuesta}/${esCorrecta ? "correcta" : "incorrecta"}/`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la respuesta");
      }

      setRespuestas((prevRespuestas) =>
        prevRespuestas.map((respuesta) =>
          respuesta.id === idRespuesta ? { ...respuesta, correcta: esCorrecta } : respuesta
        )
      );

      alert(`Respuesta marcada como ${esCorrecta ? "Correcta" : "Incorrecta"}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al actualizar la respuesta");
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
            <p className="font-medium text-gray-700 flex justify-between">
              <span>
                <strong>Pregunta: {respuesta.nombre_pregunta}</strong>
              </span>
              <span className="text-gray-600">
                <strong>Nota:</strong> {respuesta.nota || "Pendiente"}
              </span>
            </p>
            <p className="font-medium text-gray-700">
              <strong>Respuesta: {respuesta.respuesta}</strong> 
            </p>
            <p className="text-gray-600">
              <strong>Correcta:</strong> {" "}
              {respuesta.correcta !== null ? (respuesta.correcta ? "Sí" : "No") : "Pendiente"}              
            </p>
            {/* Botones de Corrección */}
            {rolUsuario === "terapeuta" && (
              <>
                {respuesta.correcta === null && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => actualizarRespuesta(respuesta.id, true)}
                      className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      ✔️
                    </button>
                    <button
                      onClick={() => actualizarRespuesta(respuesta.id, false)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      ❌
                    </button>
                  </div>              
                )}              
              </>
            )}

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
            {rolUsuario === "terapeuta" && (
              <>
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
              </>
            )}
           
            {rolUsuario === "terapeuta" && (
              <>
                <div className="mt-4">
                <label className="block text-gray-700 font-medium">Asignar nota:</label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="mt-2 p-2 border border-gray-300 rounded-lg w-20 focus:outline-none focus:ring focus:ring-blue-300"
                      placeholder="0-10"
                      value={nuevasNotas[respuesta.id] || ""}
                      onChange={(e) =>
                        setNuevasNotas((prev) => ({
                          ...prev,
                          [respuesta.id]: e.target.value,
                        }))
                      }
                    />
                    <button
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      onClick={() => handleActualizarNota(respuesta.id)}
                    >
                      Guardar Nota
                    </button> 
                  </div> 
                </div>                        
              </>           
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RevisionFormulario;
