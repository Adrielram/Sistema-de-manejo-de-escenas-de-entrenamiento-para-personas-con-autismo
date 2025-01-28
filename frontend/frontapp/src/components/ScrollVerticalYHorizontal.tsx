"use client";

import { useState, useEffect, memo } from "react";

interface Props {
  elementos: Array<{ 
    id: number; 
    nombre: string; 
    descripcion: string; 
    idioma:string; 
    acento:string; 
    complejidad:number;
    condiciones:string;
    bloqueada: boolean; // Nueva propiedad
  }>;
  onElementoClick: (id: number) => void;
  selectedElementoId: number | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function ScrollVerticalYHorizontalComponent({
  elementos,
  onElementoClick,
  selectedElementoId,
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
                onClick={() => !elemento.bloqueada && onElementoClick(elemento.id)}
                className={`w-full flex items-center justify-between p-4 rounded-lg shadow-sm border transition-shadow ${
                  elemento.bloqueada
                    ? "bg-gray-100 opacity-50 cursor-not-allowed"
                    : "cursor-pointer bg-white hover:border-blue-300 hover:shadow-md"
                } ${
                  selectedElementoId === elemento.id && !elemento.bloqueada
                    ? "bg-blue-100 border-blue-400"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base font-medium">{elemento.nombre}</span>
                  {elemento.bloqueada && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-gray-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <p
                    className={`flex-1 ml-4 text-right ${
                      isPortrait ? "hidden" : "block"
                    }`}
                  >
                  </p>
                  {selectedElementoId === elemento.id && !elemento.bloqueada && (
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