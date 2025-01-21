import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { OptionsProps } from "../types"; 

interface PaginadoItemProps {
  id: string;
  name: string;
  showImage: boolean;
  options: OptionsProps;
  img: string;
  edit_path?: string;
  onDelete: (id: string) => void;
}

const PaginadoItem: React.FC<PaginadoItemProps> = ({ 
  id, 
  name, 
  options, 
  img, 
  edit_path, 
  showImage, 
  onDelete 
}) => {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/goal/${id}/delete/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Objetivo eliminado correctamente.");
        // Llamamos a la función onDelete para actualizar el estado en el componente padre
        onDelete(id);
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar el objetivo: ${errorData.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error eliminando el objetivo:", error);
      alert("Hubo un problema al intentar eliminar el objetivo.");
    }
  };

  const handleVer = () => {
    alert(`Ver detalles de ${name}`);
  };

  const handleComments = () => {
    alert(`Ver comentarios de ${name}`);
  };

  const handleEdit = () => {
    router.push(edit_path);
  };

  const handleSeguimiento = () => {
    alert(`Ver seguimiento de ${name}`);
  };

  return (
    <div className="bg-white p-2 sm:p-5 rounded-lg shadow-lg flex flex-col items-center justify-center space-y-1 border-2 border-gray-400 w-full max-w-xs sm:w-[200px] h-auto sm:h-[300px] text-sm sm:text-base mt-5">
      {/* Imagen */}
      <div className="flex items-center justify-center h-[100px]">
        <Image
          width={80}
          height={80}
          src={img}
          alt="Imagen del contenido" // colocar una variable que defina al componente para describirlo
          className="w-20 h-20"
        />
      </div>

      {/* Contenido */}
      <div className="flex flex-col items-center justify-center space-y-2 w-full h-[120px]">
        <p className="text-sm sm:text-base font-medium text-black text-center">
          {name}
        </p>
        {/* <p className="text-xs sm:text-xs text-gray-600 text-center">
          ID: {id}
        </p> */}
      </div>

      {/* Botones y acciones */}
      <div className="flex flex-wrap justify-center w-full space-x-2 pb-6">
        {options.buttonVer && (
          <button
            onClick={handleVer}
            className="bg-primary text-white px-7 py-1.5 rounded-2xl hover:bg-primary-dark text-sm font-semibold"
          >
            Ver
          </button>
        )}
        {options.buttonEdit && (
          <button
          onClick={handleEdit}
          className="bg-primary text-white px-7 py-1.5 rounded-2xl hover:bg-primary-dark text-sm font-semibold"
          >
            EDITAR
          </button>
        )}
        {options.buttonSeguimiento && (
          <button
          onClick={handleSeguimiento}
          className="bg-primary text-white px-7 py-1.5 rounded-2xl hover:bg-primary-dark text-sm font-semibold"
          >
            Seguimiento
          </button>
        )}
        {options.buttonComments && (
          <button
            onClick={handleComments}
            className="bg-primary text-white px-7 py-1.5 rounded-2xl hover:bg-primary-dark text-sm font-semibold"
          >
            Comentarios
          </button>
        )}
      </div>

      {/* Icono del tacho de basura */}
      {showImage && (
        <div className="flex justify-center w-full mt-2">
          <Image
            width={24}
            height={24}
            src="/images/trash.png"
            alt="Eliminar"
            className="w-6 h-6 cursor-pointer"
            onClick={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default PaginadoItem;
