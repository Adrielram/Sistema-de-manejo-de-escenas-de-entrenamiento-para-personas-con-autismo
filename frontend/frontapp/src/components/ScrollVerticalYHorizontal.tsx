"use client";

import { useState, useEffect } from "react";



export default function ListaResponsive() {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Estado de carga

  const elementos = [
    { id: 1, texto: "Objetivo 1" },
    { id: 2, texto: "Objetivo 2" },
    { id: 3, texto: "Objetivo 3" },
    { id: 4, texto: "Objetivo 4" },
    { id: 5, texto: "Objetivo 5" },
    { id: 6, texto: "Objetivo 6" },
    { id: 7, texto: "Objetivo 6" },
    { id: 8, texto: "Objetivo 6" },
    { id: 9, texto: "Objetivo 6" },
    { id: 10, texto: "Objetivo 6" },
    { id: 11, texto: "Objetivo 6" },
    { id: 12, texto: "Objetivo 6" },
    { id: 13, texto: "Objetivo 6" },
    { id: 14, texto: "Objetivo 6" },
    { id: 15, texto: "Objetivo 6" },
  ];


  useEffect(() => {
    const updateOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
      setIsLoading(false); // Cambia a false una vez que se determina la orientación
    };

    // Inicializar orientación usando matchMedia
    const mediaQuery = window.matchMedia("(orientation: portrait)");
    setIsPortrait(mediaQuery.matches);
    setIsLoading(false); // Cambia a false inmediatamente al cargar

    // Escuchar cambios en la orientación
    mediaQuery.addEventListener("change", updateOrientation);

    // Escuchar cambios en el tamaño de la ventana
    window.addEventListener("resize", updateOrientation);

    // Cleanup event listeners
    return () => {
      mediaQuery.removeEventListener("change", updateOrientation);
      window.removeEventListener("resize", updateOrientation);
    };
  }, []);

  if (isLoading) {
    return null; // No renderiza nada mientras se carga
  }

  const handleButtonClick = (texto: string) => {
    alert(`Botón clickeado: ${texto}`);
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <div
        className={`flex-1 overflow-auto ${
          isPortrait ? "overflow-x-hidden" : "overflow-y-auto"
        } bg-gray-100 rounded-lg shadow`}
      >
        <ul
          className={`flex ${
            isPortrait ? "flex-row space-x-4" : "flex-col space-y-2"
          } p-4`}
        >
          {elementos.map((elemento) => (
            <li key={elemento.id} className="min-w-[150px]">
              <button
                onClick={() => handleButtonClick(elemento.texto)}
                className="w-full p-4 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-500 transition duration-300 ease-in-out"
              >
                {elemento.texto}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
