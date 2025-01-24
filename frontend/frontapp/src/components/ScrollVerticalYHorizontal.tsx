"use client";

import { useState, useEffect, memo } from "react";

interface Props {
  elementos: Array<{ id: number; titulo: string; descripcion: string }>;
  onObjetivoClick: (id: number) => void;
  selectedObjetivoId: number | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function ScrollVerticalYHorizontalComponent({
  elementos,
  onObjetivoClick,
  selectedObjetivoId,
  currentPage,
  totalPages,
  onPageChange,
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
    <div className="w-full flex flex-col gap-2">
      <div
        className={`overflow-auto ${
          isPortrait ? "overflow-x-scroll" : "overflow-y-scroll"
        } ${isPortrait ? "max-h-64" : "max-h-[400px]"} bg-gray-50 rounded-lg shadow p-4`}
      >
        <ul
          className={`flex ${
            isPortrait ? "flex-row space-x-4" : "flex-col space-y-2"
          }`}
        >
          {elementos.map((elemento) => (
            <li
              key={elemento.id}
              className="flex justify-center items-center"
              style={{ minWidth: isPortrait ? "fit-content" : "auto" }}
            >
              <div
                onClick={() => onObjetivoClick(elemento.id)}
                className={`w-full cursor-pointer flex items-center justify-between p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                  selectedObjetivoId === elemento.id
                    ? "bg-blue-100 border-blue-400"
                    : "bg-white border-gray-200 hover:border-blue-300"
                }`}
              >
                <span className="text-base font-medium">{elemento.titulo}</span>
                <p
                  className={`flex-1 ml-4 text-right ${
                    isPortrait ? "hidden" : "block"
                  }`}
                >
                  Descripcion: {elemento.descripcion}
                </p>
                {selectedObjetivoId === elemento.id && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-1.5 rounded ${
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
          className={`px-4 py-1.5 rounded ${
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

const ScrollVerticalYHorizontal = memo(ScrollVerticalYHorizontalComponent);
export default ScrollVerticalYHorizontal;