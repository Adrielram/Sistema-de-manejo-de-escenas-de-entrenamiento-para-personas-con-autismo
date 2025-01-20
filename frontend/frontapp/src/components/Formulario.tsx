"use client"
import React, { useState } from 'react';
import Pregunta from './Pregunta';

interface FormularioProps {
  onSubmit: (formulario) => void;
}

const Formulario: React.FC<FormularioProps> = ({ onSubmit }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [esVerificacionAutomatica, setEsVerificacionAutomatica] = useState(false);
  const [preguntas, setPreguntas] = useState<any[]>([]);

  const agregarPregunta = (pregunta) => {
    setPreguntas([...preguntas, pregunta]);
  };

  const eliminarPregunta = (index: number) => {
    const nuevasPreguntas = preguntas.filter((_, i) => i !== index);
    setPreguntas(nuevasPreguntas);
  };

  const manejarEnvio = () => {
    const formulario = {
      titulo,
      descripcion,
      es_verificacion_automatica: esVerificacionAutomatica,
      creado_por: 31222333, // Aquí puedes usar el ID del usuario autenticado
      preguntas,
    };
    onSubmit(formulario);
  };
  {console.log("Preguntas: "+JSON.stringify(preguntas))}
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Crear Formulario</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Título:
        </label>
        <input 
          value={titulo} 
          onChange={(e) => setTitulo(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none" 
          placeholder="Ingrese el título del formulario" 
        />
      </div>
  
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Descripción:
        </label>
        <textarea 
          value={descripcion} 
          onChange={(e) => setDescripcion(e.target.value)} 
          className="w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 focus:outline-none" 
          rows={3} 
          placeholder="Ingrese una breve descripción del formulario" 
        />
      </div>
  
      <div className="mb-4 flex items-center">
        <input 
          type="checkbox" 
          checked={esVerificacionAutomatica} 
          onChange={(e) => setEsVerificacionAutomatica(e.target.checked)} 
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
        />
        <label className="ml-2 text-gray-700">
          ¿Verificación Automática?
        </label>
      </div>
        
      <Pregunta onAddPregunta={agregarPregunta} esVerificacionAutomatica={esVerificacionAutomatica} />

      {/* Aquí se mostrarán las preguntas agregadas */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800">Preguntas Agregadas</h3>
        <div className="space-y-4">
          {preguntas.map((pregunta, index) => (
            <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p><strong>Pregunta {index + 1}:</strong> {pregunta.texto}</p>
              <p><strong>Tipo:</strong> {pregunta.tipo}</p>
              {pregunta.tipo === 'multiple-choice' && (
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
