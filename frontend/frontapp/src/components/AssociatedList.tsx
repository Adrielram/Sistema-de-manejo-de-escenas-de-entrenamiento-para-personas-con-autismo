import React from 'react';

interface Item {
  dni: string;
  nombre: string;
  id?: number;
  name?: string;
}

interface AssociatedListProps {
  title: string;
  items: Item[];
  onRemove: (id: string) => void;
  style?: React.CSSProperties;
}
const AssociatedList: React.FC<AssociatedListProps> = ({ title, items, onRemove, style }) => {
  return (
    <div className="associated-list bg-white p-4 rounded-lg shadow-md" style={style}>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <hr className="border-0 h-[3px] bg-orange-500 mb-4" />
      <ul className="list-none p-0 m-0">
        {items.map(item => {
          const key = item.dni || item.id; // Aceptar ambas propiedades
          const name = item.nombre || item.name; // Aceptar ambas propiedades

          return (
            <li key={key} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <span>{name}</span>
              <button
                className="text-red-500 hover:text-red-700 focus:outline-none"
                onClick={() => onRemove(item[key])}
                aria-label={`Eliminar ${item.name || item.nombre}`}
              >
                🗑️
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-center gap-4 mt-4">
        <button className="px-4 py-2 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors">
          Anterior
        </button>
        <button className="px-4 py-2 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors">
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default AssociatedList;