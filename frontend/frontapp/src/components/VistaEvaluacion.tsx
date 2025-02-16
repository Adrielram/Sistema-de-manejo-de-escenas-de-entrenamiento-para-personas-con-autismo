"use client"
import React, { useEffect, useState } from "react";

interface Opcion {
  texto: string;
}

interface Pregunta {
  id: number;
  texto: string;
  tipo: string;
  opciones: Opcion[];
  correcta: string | null;
}

interface Formulario {
  id: number;
  nombre: string;
  descripcion: string;
  preguntas: Pregunta[];
}

interface VistaEvaluacionProps {
  formularioId: number;
}

const VistaEvaluacion: React.FC<VistaEvaluacionProps> = ({ formularioId }) => {
  const [formulario, setFormulario] = useState<Formulario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}formularios/${formularioId}/`, {credentials: 'include'});

        if (!response.ok) throw new Error("Error al cargar el formulario");
        
        const data = await response.json();
        setFormulario(data);
      } catch {
        setError("Error al cargar el formulario");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formularioId]);

  if (loading) return <p className="text-center text-gray-600">Cargando formulario...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      {formulario && (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{formulario.nombre}</h1>
          {formulario.descripcion && (
            <p className="text-gray-600 mt-2">{formulario.descripcion}</p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {formulario?.preguntas?.map((pregunta) => (
          <div key={pregunta.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-700">
                {pregunta.texto}
              </h3>
              <span className="text-sm text-gray-500">
                ({pregunta.tipo.replace(/-/g, ' ')})
              </span>
            </div>

            {pregunta.opciones.length > 0 && (
              <ul className="space-y-2 ml-4">
                {pregunta.opciones.map((opcion, index) => (
                  <li 
                    key={`${pregunta.id}-${index}`}
                    className="text-gray-600"
                  >
                    <span className="mr-2">•</span>
                    {opcion.texto}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VistaEvaluacion;