'use client'
import React from 'react'

import { useState } from "react";

interface DropdownProps {
  items: string[]; // Array de items a mostrar en la lista
  listName: string; // Nombre de la lista
  onSelect?: (selectedItem: string) => void; // Callback al seleccionar un ítem
}
const DropDownList: React.FC<DropdownProps> = ({ listName, items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleSelect = (item: string) => {
    setSelectedItem(item); 
    setIsOpen(false); 
    if (onSelect) {
      onSelect(item); // Llama al callback si está definido
    }
  };

  return (
    <div className="relative inline-block w-64">
        <p className='pl-2 mb-2 font-semibold'>{listName}</p>
      {/* Botón para abrir/cerrar la lista */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full px-4 py-2 bg-white text-gray-600 rounded-sm shadow hover:bg-gray-200"
      >
        {selectedItem || "Selecciona una opción"}
        <span className={`ml-2 transform transition-transform duration-150 ${isOpen ? "rotate-180" : "rotate-0"}`}>▼</span>
      </button>

      {/* Lista desplegable */}
      {isOpen && (
        <ul className="absolute left-0 w-full mt-2 bg-white border border-gray-300 rounded-sm shadow-lg">
          {items.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 cursor-pointer"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropDownList;
