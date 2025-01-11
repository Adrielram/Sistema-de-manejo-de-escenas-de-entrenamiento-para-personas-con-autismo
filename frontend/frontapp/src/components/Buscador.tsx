"use client";

import React from 'react';
import Image from 'next/image';
import iconoBusqueda from '../../public/icon/icono_busqueda.png';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string; // Prop para cambiar el placeholder
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder = "Buscar" }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(event.target.value);
  };

  return (
    <div style={styles.container}>
      <input 
        type="text" 
        placeholder={placeholder} 
        style={styles.input} 
        onChange={handleInputChange} 
      />
      <Image 
        src={iconoBusqueda} 
        alt="Ícono de búsqueda" 
        width={30} 
        height={30} 
        style={styles.icon} 
      />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '8px',
    width: '300px',
    backgroundColor: 'white', // Fondo blanco
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
  },
  icon: {
    marginLeft: '8px',
  },
};

export default SearchBar;
