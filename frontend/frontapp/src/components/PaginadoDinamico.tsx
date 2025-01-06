"use client";

import { useState } from "react";
import Button from "./SmallButton"; // Asegúrate de que la ruta sea correcta
import PaginadoItem from "./PaginadoItem"; // Importa el nuevo componente

type Dictionary = { [key: string]: string };

interface BoxPaginadoProps {
  data: Dictionary;
  mostrarImagen: boolean;
}

export default function BoxPaginado({ data, mostrarImagen}: BoxPaginadoProps) {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const itemsPerPage = 5;

  const keys = Object.keys(data); // Obtener las claves del diccionario
  const totalPages = Math.ceil(keys.length / itemsPerPage);
  

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Obtener los elementos para la página actual
  const paginatedItems = keys.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <div className="container mx-auto p-4">
      <hr className="border-none h-1 mb-4 bg-[#f6512b]" />
      <div className="grid grid-cols-1 gap-2">
        {paginatedItems.map((key) => (
          <PaginadoItem key={key} dni={key} nombre={data[key]} mostrarImagen={mostrarImagen} />
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <Button
          title="Anterior"
          font_bold="font-bold"
          onClick={handlePrev}
          className={`px-4 py-2 rounded ${
            currentPage === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
        <span className="text-gray-700 font-bold">
          Página {currentPage + 1} de {totalPages}
        </span>
        <Button
          title="Siguiente"
          font_bold="font-bold"
          onClick={handleNext}
          className={`px-4 py-2 rounded ${
            currentPage === totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>
    </div>
  );
}
