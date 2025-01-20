"use client";

import React, { useState } from "react";
import Image from "next/image";
import iconoBusqueda from "../../public/icon/icono_busqueda.png";

const GenericDropdown = ({ 
  title, 
  items, 
  onSelect,
  labelKey = "name",
  valueKey = "id",
  placeholder = "Buscar...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) => {
    const label = item[labelKey]?.toString().toLowerCase() || "";
    return label.includes(searchQuery.toLowerCase());
  });
  
  console.log('Items recibidos:', items);
  console.log('Items filtrados:', filteredItems);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSelect = (item) => {
    console.log('Item seleccionado:', item);
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <div className="relative mb-5 bg-white rounded-lg shadow-md">
      {/* Botón para abrir/cerrar la lista */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 text-sm text-left bg-gray-50 border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center"
      >
        <span>{title}</span>
        <span
          className={`
            inline-block w-0 h-0 ml-2.5 border-l-[5px] border-l-transparent 
            border-r-[5px] border-r-transparent border-t-[5px] border-t-[#f6512b] 
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `}
        />
      </button>

      {/* Contenido desplegable */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg z-10 max-h-[300px] overflow-y-auto shadow-md">
          {/* Campo de búsqueda con lupa */}
          <div className="flex items-center border border-gray-300 rounded-lg p-2 m-2.5 bg-white">
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleInputChange}
              className="flex-1 border-none outline-none text-base"
            />
            <Image
              src={iconoBusqueda}
              alt="Ícono de búsqueda"
              width={30}
              height={30}
              className="ml-2"
            />
          </div>

          {filteredItems.map((item, index) => (
            <div
              key={`${item[valueKey]}-${index}`}
              onClick={() => handleSelect(item)}
              className="p-2.5 cursor-pointer border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              {item[labelKey]}
            </div>
          ))}

          {/* Mensaje si no hay coincidencias */}
          {filteredItems.length === 0 && (
            <div className="p-2.5 text-gray-500 text-center bg-gray-50">
              Sin resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenericDropdown;