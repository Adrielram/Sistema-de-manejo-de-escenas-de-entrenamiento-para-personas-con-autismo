"use client";

import { useState, useEffect } from "react";
import BigButton from "./BigButton";

interface Props {
  elementos: Array<{ id: number; titulo: string }>;
  onObjetivoClick: (id: number) => void;
  selectedObjetivoId: number | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export default function ScrollVerticalYHorizontal({
  elementos,
  onObjetivoClick,
  selectedObjetivoId,
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}: Props) {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

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
    <div className="w-full flex flex-col">
      <div
        className={`overflow-auto flex-grow ${
          isPortrait ? "overflow-x-scroll" : "overflow-y-scroll"
        } ${
          isPortrait ? "max-h-96" : "h-[calc(100vh-150px)]"
        } bg-gray-100 rounded-lg shadow`}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
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
                  //title={elemento.titulo}
                  title = {elemento.titulo}
                  color={selectedObjetivoId === elemento.id ? "bg-blue-800" : "bg-blue-600"}
                  font_bold="font-bold"
                  hover="hover:bg-blue-700"
                  onClick={() => onObjetivoClick(elemento.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mt-4 px-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Anterior
        </button>
        <span className="text-sm">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}