import React from "react";
import Image from "next/image";

interface PaginadoItemProps {
  dni: string;
  nombre: string;
  mostrarImagen: boolean;
}

const PaginadoItem: React.FC<PaginadoItemProps> = ({ dni, nombre, mostrarImagen }) => {

    const handleImageClick = () => {
        // Aquí puedes agregar la lógica que necesites
      };

  return (
    <div className="p-4 bg-white border rounded shadow-sm hover:bg-gray-50 flex items-center justify-between">
      {/* Contenedor para DNI y Nombre */}
      <div className="flex flex-col">
        <p className="text-gray-700 font-normal">{nombre}  -  {dni}</p>
      </div>
      
       {/* Imagen como botón */}
       {mostrarImagen && (
        <button onClick={handleImageClick}>
          <Image
            width={24}
            height={24}
            src="/images/trash.png"
            alt="Eliminar"
            className="w-6 h-6"
          />
        </button>
      )}
    </div>
  );
};

export default PaginadoItem;
