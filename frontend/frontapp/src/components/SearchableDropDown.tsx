
"use client";

import React, { useState } from "react";
import Image from "next/image";
import iconoBusqueda from "../../public/icon/icono_busqueda.png";

const GenericDropdown = ({ 
  title, 
  items, 
  onSelect,
  valueKey = "id",
  placeholder = "Buscar...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  console.log("Dropdown items:", items);
  // Filtrar elementos según el campo "name" o "nombre"
  const filteredItems = items.filter((item) => {
    const label = item.name || item.nombre || ""; // Prioriza "name" y luego "nombre"
    return label.toString().toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
  };

  return (
    <div className="mb-5 bg-white rounded-lg shadow-md overflow-visible">
    {/* Botón para abrir/cerrar la lista */}
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full px-3 py-2.5 text-sm text-left bg-gray-50 border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center"
    >
      <span>{title}</span>
      <span
        className={`inline-block w-0 h-0 ml-2.5 border-l-[5px] border-l-transparent 
          border-r-[5px] border-r-transparent border-t-[5px] border-t-[#f6512b] 
          transition-transform duration-200
          ${isOpen ? "rotate-180" : "rotate-0"}`}
      />
    </button>

    {/* Contenido desplegable */}
    {isOpen && (
      <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg z-50 max-h-[300px] overflow-y-auto shadow-md">
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

        {filteredItems.map((item, index) => {
          const label = item.name || item.nombre || "Sin Nombre"; // Mostrar algo por defecto si no hay nombre
          return (
            <div
              key={`${item[valueKey]}-${index}`}
              onClick={() => handleSelect(item)}
              className="p-2.5 cursor-pointer border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              {label}
            </div>
          );
        })}

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