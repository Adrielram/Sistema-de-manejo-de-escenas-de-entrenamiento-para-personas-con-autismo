"use client";
import React, { useState, useEffect } from "react";
import Pregunta from "./Pregunta";

interface FormularioProps {
  onSubmit: (formulario: any) => void;
}

const Formulario: React.FC<FormularioProps> = ({ onSubmit }) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [modoVerificacion, setModoVerificacion] = useState<string | null>(null);
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [objetivos, setObjetivos] = useState([]);
  const [objetivo_id, setObjetivoId] = useState("");
  const agregarPregunta = (pregunta: any) => {
    setPreguntas([...preguntas, pregunta]);
  };

  const eliminarPregunta = (index: number) => {
    const nuevasPreguntas = preguntas.filter((_, i) => i !== index);
    setPreguntas(nuevasPreguntas);
  };

  const manejarCambioModoVerificacion = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModoVerificacion(e.target.value);
    setPreguntas([]); // Limpiamos el estado de las preguntas
  };

  const manejarCambioObjetivo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setObjetivoId(e.target.value);
    setPreguntas([]); // Limpiamos el estado de las preguntas
  }

  const manejarEnvio = () => {
    if (!nombre || !descripcion || !modoVerificacion || !objetivo_id) {
      alert("Por favor complete todos los campos.");
      return;
    }
    const formulario = {
      nombre,
      descripcion,
      es_verificacion_automatica: modoVerificacion === "con-verificacion",
      creado_por: 31222333, // Aquí puedes usar el ID del usuario autenticado
      objetivo_id,
      preguntas,
    };
    onSubmit(formulario);
  };


  useEffect(() => {
    fetch("http://localhost:8000/api/objetivos/")
      .then((res) => res.json())
      .then((data) => setObjetivos(data))
      .catch((error) => console.error("Error al obtener objetivos:", error));
  }, []);

  console.log("preguntas:" ,JSON.stringify(preguntas));

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Crear Formulario</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Título:</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
          placeholder="Ingrese el título del formulario"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Descripción:</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
          rows={3}
          placeholder="Ingrese una breve descripción del formulario"
        />
      </div>

      <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-1">Seleccionar Objetivo:</label>
      <select
        value={objetivo_id}
        onChange={manejarCambioObjetivo}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
      >
        <option value="">Seleccione un objetivo</option>
        {objetivos.map((obj) => (
          <option key={obj.id} value={obj.id}>
            {obj.nombre}
          </option>
        ))}
      </select>
    </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Modo de Verificación:</label>
        <select
          value={modoVerificacion || ""}
          onChange={manejarCambioModoVerificacion}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none"
        >
          <option value="" disabled>Seleccione una opción</option>
          <option value="con-verificacion">Con Verificación Automática</option>
          <option value="sin-verificacion">Sin Verificación Automática</option>
        </select>
      </div>

      {modoVerificacion && objetivo_id && (
        <Pregunta
          onAddPregunta={agregarPregunta}
          esVerificacionAutomatica={modoVerificacion === "con-verificacion"}
          objetivoId={objetivo_id}
        />
      )}

      {/* Preguntas agregadas */}
      {preguntas.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">Preguntas Agregadas</h3>
          <div className="space-y-4">
            {preguntas.map((pregunta, index) => (
              <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p><strong>Pregunta {index + 1}:</strong> {pregunta.texto}</p>
                <p><strong>Tipo:</strong> {pregunta.tipo}</p>
                <p><strong>Escena relacionada: {pregunta.nombre_escena || "Ninguna"}  </strong></p>
                {pregunta.tipo === "multiple-choice" && (
                  <div>
                    <strong>Opciones:</strong>
                    <ul className="list-disc pl-6">
                      {pregunta.opciones.map((opcion: { texto: string }, idx: number) => (
                        <li key={idx}>{opcion.texto}</li>
                      ))}
                    </ul>
                    <p><strong>Respuesta Correcta:</strong> {pregunta.correcta}</p>
                  </div>
                )}
                <button
                  onClick={() => eliminarPregunta(index)}
                  className="mt-2 text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={manejarEnvio}
        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
      >
        Crear Formulario
      </button>
    </div>
  );
};

export default Formulario;
