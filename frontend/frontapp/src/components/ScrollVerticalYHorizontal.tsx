"use client";

import { useState, useEffect } from "react";
import BigButton from "./BigButton";

interface Props {
  elementos: Array<{ id: number; titulo: string }>;
  onObjetivoClick: (id: number) => void;
  selectedObjetivoId: number | null;
}

export default function ScrollVerticalYHorizontal({ 
  elementos, 
  onObjetivoClick,
  selectedObjetivoId 
}: Props) {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  

  /* useEffect(() => {
    const fetchObjetivos = async () => {
      try {
        const response = await fetch("localhost:8000/api/objetivos");
        if (!response.ok) {
          throw new Error(`Error en la solicitud: ${response.status}`);
        }
        const data = await response.json();
        setElementos(data);
      } catch (error) {
        console.error("Error al obtener los objetivos:", error);
        setElementos([]); // En caso de error, dejamos la lista vacía
      }
    };

    fetchObjetivos();
  }, []);
 */

  useEffect(() => {
    const updateOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    const mediaQuery = window.matchMedia("(orientation: portrait)");
    setIsPortrait(mediaQuery.matches);

    mediaQuery.addEventListener("change", updateOrientation);

    return () => {
      mediaQuery.removeEventListener("change", updateOrientation);
    };
  }, []);




  return (
    <div className="container mx-auto">
      <div
        className={`overflow-auto ${
          isPortrait ? "overflow-x-scroll" : "overflow-y-scroll"
        } ${
          isPortrait ? "max-h-96" : "h-[calc(100vh-100px)]"
        } bg-gray-100 rounded-lg shadow`}
      >
        <ul
          className={`flex ${
            isPortrait ? "flex-row space-x-4" : "flex-col space-y-2"
          } p-4`}
        >
          {elementos.map((elemento) => (
            <li
              key={elemento.id}
              className="flex justify-center items-center"
              style={{ minWidth: isPortrait ? "fit-content" : "150px" }}
            >
              <BigButton
                title={elemento.titulo}
                color={selectedObjetivoId === elemento.id ? "bg-blue-800" : "bg-blue-600"}
                font_bold="font-bold"
                hover="hover:bg-blue-700"
                onClick={() => onObjetivoClick(elemento.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
