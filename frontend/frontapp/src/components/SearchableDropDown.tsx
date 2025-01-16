"use client";

import React, { useState } from "react";
import Image from "next/image";
import iconoBusqueda from "../../public/icon/icono_busqueda.png";

const GenericDropdown = ({ title, items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtra los elementos según el término de búsqueda
  const filteredItems = items.filter((item) =>
    item.nombre && item.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  console.log('items-------------------' + items);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget; // Especificamos el tipo HTMLDivElement
    target.style.background = "#f9f9f9";
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget; // Especificamos el tipo HTMLDivElement
    target.style.background = "#fff";
  };

  return (
    <div style={styles.dropdownContainer}>
      {/* Botón para abrir/cerrar la lista */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.dropdownButton}
      >
        <span>{title}</span>
        <span
          style={{
            ...styles.triangle,
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
          }}
        />
      </button>

      {/* Contenido desplegable */}
      {isOpen && (
        <div style={styles.dropdownContent}>
          {/* Campo de búsqueda con lupa */}
          <div style={styles.searchBarContainer}>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={handleInputChange}
              style={styles.searchInput}
            />
            <Image
              src={iconoBusqueda}
              alt="Ícono de búsqueda"
              width={30}
              height={30}
              style={styles.searchIcon}
            />
          </div>

          {/* Lista de elementos */}
          {filteredItems.map((item) => {
            // Determinar si se usa 'dni' o 'id'
            const key = item.dni ? 'dni' : 'id';

            return (
              <div
                key={item[key]} // Usar 'dni' o 'id' como clave
                onClick={() => {
                  onSelect(item);
                  setIsOpen(false); // Cierra el dropdown después de seleccionar
                }}
                style={styles.listItem}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {item.nombre}
              </div>
            );
          })}


          {/* Mensaje si no hay coincidencias */}
          {filteredItems.length === 0 && (
            <div style={styles.noResults}>Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  dropdownContainer: {
    position: "relative",
    marginBottom: "20px",
    background: "#fff", // Fondo blanco para el contenedor principal
    borderRadius: "8px", // Opcional para un diseño uniforme
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)", // Opcional, un toque visual
  },
  dropdownButton: {
    padding: "10px",
    width: "100%",
    fontSize: "14px",
    textAlign: "left" as const, // Corregido para TypeScript
    background: "#f0f0f0",
    border: "1px solid #ccc",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  triangle: {
    display: "inline-block",
    width: "0",
    height: "0",
    marginLeft: "10px",
    borderLeft: "5px solid transparent",
    borderRight: "5px solid transparent",
    borderTop: "5px solid #f6512b", // Triángulo naranja
    transition: "transform 0.2s",
  },
  dropdownContent: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    zIndex: 1000,
    maxHeight: "300px",
    overflowY: "auto",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
  },
  searchBarContainer: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "8px",
    margin: "10px",
    backgroundColor: "white",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "16px",
  },
  searchIcon: {
    marginLeft: "8px",
  },
  listItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    background: "#fff",
    transition: "background 0.2s",
  },
  noResults: {
    padding: "10px",
    color: "#888",
    textAlign: "center" as const, // Corregido para TypeScript
    background: "#f9f9f9",
  },
};

export default GenericDropdown;
