"use client";

import { useState, useEffect } from "react";
import Button from "./SmallButton";

export default function ScrollVerticalYHorizontal() {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  //const [elementos, setElementos] = useState<{ id: number; texto: string }[]>(
  //  []
  //);

 const elementos = [
    { id: 1, texto: "Objetivo 1" },
    { id: 2, texto: "Objetivo 2" },
    { id: 3, texto: "Objetivo 3" },
    { id: 4, texto: "Objetivo 4" },
    { id: 5, texto: "Objetivo 5" },
    { id: 6, texto: "Objetivo 6 con mucho texto para probar el ajuste" },
    { id: 7, texto: "Objetivo 2" },
    { id: 8, texto: "Objetivo 3" },
    { id: 9, texto: "Objetivo 4" },
    { id: 10, texto: "Objetivo 5" },
    { id: 11, texto: "Objetivo 6 con mucho texto para probar el ajuste" },
    { id: 12, texto: "Objetivo 2" },
    { id: 13, texto: "Objetivo 3" },
    { id: 14, texto: "Objetivo 4" },
    { id: 15, texto: "Objetivo 5" },
    { id: 16, texto: "Objetivo 6 con mucho texto para probar el ajuste" },
    { id: 17, texto: "Objetivo 2" },
    { id: 18, texto: "Objetivo 3" },
    { id: 19, texto: "Objetivo 4" },
  ];

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


  const handleButtonClick = () => {
    //aca vamos a hacer la funcionalidad del boton
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Elementos</h1>
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
              <Button
                title={elemento.texto}
                color="bg-blue-600"
                font_bold="font-bold"
                hover="hover:bg-blue-700"
                onClick={() => handleButtonClick()}
                className="w-full h-12 flex-shrink-0 break-words whitespace-pre-wrap text-center"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
