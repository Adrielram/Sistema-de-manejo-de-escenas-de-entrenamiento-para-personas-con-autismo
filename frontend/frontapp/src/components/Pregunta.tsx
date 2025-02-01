"use client";
import React, { useState, useEffect } from "react";
import Opcion from "./Opcion";

interface PreguntaProps {
  onAddPregunta: (pregunta: any) => void;
  esVerificacionAutomatica: boolean;
  objetivoId: string;
}

const Pregunta: React.FC<PreguntaProps> = ({ onAddPregunta, esVerificacionAutomatica, objetivoId }) => {
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState(esVerificacionAutomatica ? "multiple-choice" : "respuesta-corta");
  const [opciones, setOpciones] = useState<any[]>([]);
  const [correcta, setCorrecta] = useState("");
  const [escenas, setEscenas] = useState([]);
  const [escenaId, setEscenaId] = useState(null);  

  useEffect(() => {
    if (objetivoId) {
      fetch(`http://localhost:8000/api/objetivo/${objetivoId}/`)
        .then((res) => res.json())
        .then((data) => setEscenas(data.escenas_relacionadas || []))
        .catch((error) => console.error("Error al obtener escenas:", error));
    } else {
      setEscenas([]);
      setEscenaId(null);
    }
  }, [objetivoId]); 
  

  // Define los tipos de preguntas según el modo de verificación
  const tiposPermitidos = esVerificacionAutomatica
    ? ["multiple-choice"] // Solo "multiple-choice" si es con verificación automática
    : ["respuesta-corta", "respuesta-larga", "multiple-choice"]; // Todos los tipos si es sin verificación automática

  const agregarOpcion = (opcion: string) => {
    setOpciones([...opciones, { texto: opcion }]);
  };

  const eliminarOpcion = (index: number) => {
    setOpciones(opciones.filter((_, i) => i !== index));
  };

  useEffect(() => {
    setTipo(esVerificacionAutomatica ? "multiple-choice" : "respuesta-corta");
    setOpciones([]);
    setCorrecta("");
  }, [esVerificacionAutomatica]);

  const manejarAgregarPregunta = () => {
    console.log("Escenas: ", JSON.stringify(escenas));
    const pregunta = {
      texto,
      tipo,
      opciones: tipo === "multiple-choice" ? opciones : undefined,
      correcta: tipo === "multiple-choice" ? correcta : undefined,
      escena: escenaId || null,
      nombre_escena: escenas.find((escena) => escena.id === Number(escenaId))?.nombre || null

    };
    onAddPregunta(pregunta);
    setTexto("");
    setTipo(esVerificacionAutomatica ? "multiple-choice" : "respuesta-corta");
    setOpciones([]);
    setCorrecta("");
    setEscenaId(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Agregar Pregunta</h3>
      <label className="block text-sm font-medium text-gray-700">
        Seleccionar Escena:
        <select
          value={escenaId || ""}
          onChange={(e) => setEscenaId(e.target.value || null)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Ninguna</option>
          {escenas.map((escena) => (
            <option key={escena.id} value={escena.id}>
              {escena.nombre}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-gray-700">
        Texto de la pregunta:
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Escribe la pregunta aquí"
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        Tipo de pregunta:
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {tiposPermitidos.map((tipoOpcion) => (
            <option key={tipoOpcion} value={tipoOpcion}>
              {tipoOpcion === "respuesta-corta"
                ? "Respuesta Corta"
                : tipoOpcion === "respuesta-larga"
                ? "Respuesta Larga"
                : "Opción Múltiple"}
            </option>
          ))}
        </select>
      </label>

      {tipo === "multiple-choice" && (
        <div className="space-y-4">
          <Opcion onAddOpcion={agregarOpcion} />
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700">Opciones seleccionadas:</h4>
            <ul className="space-y-2 mt-2">
              {opciones.map((opcion, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span className="text-gray-800">{opcion.texto}</span>
                  <button
                    onClick={() => eliminarOpcion(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Respuesta Correcta:
            <input
              value={correcta}
              onChange={(e) => setCorrecta(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Escribe la respuesta correcta"
            />
          </label>
        </div>
      )}

      <button
        onClick={manejarAgregarPregunta}
        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
      >
        Agregar Pregunta
      </button>
    </div>
  );
};

export default Pregunta;
