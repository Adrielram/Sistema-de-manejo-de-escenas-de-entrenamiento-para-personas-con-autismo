'use client';

import ScrollVerticalYHorizontal  from "../../components/ScrollVerticalYHorizontal";
import BoxPaginado from "../../components/PaginadoDinamico";
import { useState } from "react";

const data = {
    "43305922": "Mateo Romero",
    "41567234": "Lucía Gómez",
    "38976453": "Carlos Pérez",
    "45238901": "Ana Rodríguez",
    "40123456": "Julián Fernández",
    "37456321": "Laura Sánchez",
    "46789012": "Mariana López",
    "39124567": "Gabriel Torres",
    "45098765": "Sofía Martínez",
    "40234567": "Martín García"
  };

  
  export default function Page() {
    const [mostrarImagen] = useState<boolean>(true); // Controla la visibilidad de la imagen
    return (
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 p-4">
            <ScrollVerticalYHorizontal/>
          </div>
          <div className="w-full md:w-2/3 p-4">
            <h1>Box paginado</h1>
            <BoxPaginado data={data} mostrarImagen={mostrarImagen}/>
          </div>
        </div>
    );
};

export default Objetivos;