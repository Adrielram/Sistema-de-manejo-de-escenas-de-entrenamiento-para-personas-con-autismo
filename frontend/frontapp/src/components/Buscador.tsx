"use client";

import React, { useRef } from "react";
import Image from "next/image";
import iconoBusqueda from "../../public/icon/icono_busqueda.png";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string; // Prop para cambiar el placeholder
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchClick = () => {
    if (inputRef.current) {
      const query = inputRef.current.value;
      onSearch(query);
    }
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-lg p-2 w-72 bg-white">
      <input
        type="text"
        placeholder="Buscar"
        ref={inputRef}
        className="flex-1 border-none outline-none text-lg text-black"
      />
      <Image
        src={iconoBusqueda}
        alt="Ícono de búsqueda"
        width={30}
        height={30}
        className="ml-2 cursor-pointer"
        onClick={handleSearchClick}
      />
    </div>
  );
};

export default SearchBar;
