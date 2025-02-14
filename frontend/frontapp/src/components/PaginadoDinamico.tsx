"use client";

import { useState, useEffect} from "react";
import Button from "./SmallButton";
import PaginadoItem from "./PaginadoItem";
import { OptionsProps } from "../types"; 

type Dictionary = { [key: string]: string };

interface BoxPaginadoProps {
  data: Dictionary;
  options: OptionsProps;
  img: string;
  ver_path?: string;
  edit_path?: string;
  patients_list_path?: string;
  supervision_path?: string;
  comments_path?: string;
  revision_path?: string;
  scenes_comments_path?: string;
  forms_path?: string;
  user_dni?: string;
  item_type: string;
  showImage: boolean;
  currentPage: number;
  totalItems: number;
  onSelect?: (id: string) => void;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemDeleted?: (id: string) => void;
  actualizar?: boolean;

}

export default function BoxPaginado({ 
  data: initialData, 
  options,
  img,
  ver_path,
  edit_path,
  patients_list_path,
  supervision_path,
  comments_path,
  revision_path,
  scenes_comments_path,
  forms_path,
  user_dni,
  item_type,
  showImage,
  currentPage, 
  totalItems: initialTotalItems,
  onPageChange,
  itemsPerPage,
  onItemDeleted,
  actualizar
}: BoxPaginadoProps) {
  const [data, setData] = useState<Dictionary>(initialData);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    if (actualizar) {
      setData(initialData);
    }
  }, [initialData,actualizar]);


  if (actualizar == null){
    actualizar = false;
  }


  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleDelete = (deletedId: string) => {
    // Actualizar el estado local eliminando el objetivo
    setData(prevData => {
      const newData = { ...prevData };
      delete newData[deletedId];
      return newData;
    });

    // Actualizar el total de items
    setTotalItems(prev => prev - 1);

    // Notificar al componente padre si es necesario
    if (onItemDeleted) {
      onItemDeleted(deletedId);
    }

    // Si la página actual queda vacía después de la eliminación, retroceder una página
    const itemsInCurrentPage = Object.keys(data).length;
    if (itemsInCurrentPage === 1 && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <hr className="border-none h-1 mb-4 bg-[#f6512b]" />
      
      <div className="flex justify-center items-center">
        <div className="flex flex-wrap gap-4">
          {Object.keys(data).length > 0 ? (
            Object.entries(data).map(([key, value]) => (
              <PaginadoItem 
                key={key} 
                id={key} 
                name={value} 
                showImage={showImage} 
                options={options} 
                img={img}
                ver_path={ver_path}
                edit_path={edit_path}
                patients_list_path={patients_list_path}
                supervision_path={supervision_path}
                comments_path={comments_path}
                revision_path={revision_path}
                scenes_comments_path={scenes_comments_path}
                forms_path={forms_path}
                user_dni={user_dni}
                item_type={item_type}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p className="text-center text-gray-500">No hay elementos para mostrar.</p>
          )}
        </div>
      </div>
  
      {/* Mostrar la paginación solo si hay elementos */}
      {totalItems > 0 && (
        <div className="flex justify-between mt-4">
          <Button
            title="Anterior"
            font_bold="font-bold"
            onClick={handlePrev}
            className={`px-4 py-2 rounded ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
          <span className="text-gray-700 font-bold">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            title="Siguiente"
            font_bold="font-bold"
            onClick={handleNext}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
        </div>
      )}
    </div>
  );
  
}
