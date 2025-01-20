"use client"
import React, { useState } from 'react';

interface OpcionProps {
  onAddOpcion: (opcion: string) => void;
}

const Opcion: React.FC<OpcionProps> = ({ onAddOpcion }) => {
  const [texto, setTexto] = useState('');

  const manejarAgregarOpcion = () => {
    if (texto) {
      onAddOpcion(texto);
      setTexto('');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md space-y-4">
        <label className="block text-sm font-medium text-gray-700">
            Texto de la opción:
            <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Escribe la opción aquí"
            />
        </label>
        <button
            onClick={manejarAgregarOpcion}
            className="w-full py-2 px-4 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition"
        >
            Agregar Opción
        </button>
    </div>
  );
};

export default Opcion;
