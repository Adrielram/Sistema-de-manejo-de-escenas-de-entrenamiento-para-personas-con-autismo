import React from 'react';
import ProgressBar from './ProgressBar'; // Asegúrate de que la ruta sea correcta


const Objetivo = ({
  id,
  titulo,
  descripcion,
  expanded,
  onExpand,
  onNavigate,
  resultado,
  progreso,
}: {
  id: number;
  titulo: string;
  descripcion: string;
  expanded: boolean;
  onExpand: (id: number) => void;
  onNavigate: (id: number) => void;
  resultado: string;
  progreso: number; // Añadido para recibir el progreso
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg cursor-pointer p-4 mb-4">
      <h2 className="text-lg font-bold" onClick={() => onExpand(id)}>
        {titulo}
      </h2>
      {expanded && (
        <div>
          <p>{descripcion}</p>
          <ProgressBar progress={progreso} /> {/* Usar la barra de progreso aquí */}
          <p>{resultado}</p>
          <button
            onClick={() => onNavigate(id)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Ver comentarios
          </button>
        </div>
      )}
    </div>
  );
};

export default Objetivo;
