"use client";

import { useState, useEffect } from "react";
import ScrollVerticalYHorizontal from "../../../components/ScrollVerticalYHorizontal";

// le paso al back el usuario (d alguna manera)
// me devuelve objetivos con las escenas de c/u

interface Escena{  
  id: number;
  idioma: string;
  complejidad: number;
  link: string;
  nombre: string;
}

/*interface Objetivo {
  id: number;
  titulo: string;
  descripcion: string;
  escena: Escena; // explicativa
  escenas: Escena[];  // todas las del objetivo
}
*/
interface Objetivo {
  id: number;
  titulo: string;
  descripcion: string;
  escena_id: number;
}

export default function Page() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [escenasActivas, setEscenasActivas] = useState<Escena[]>([]);
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // para probar:
  /*const elementos = [
    { id: 1, texto: "Objetivo 1", escena: { id: 1, nombreEscena: "Escena1" } },
    { id: 2, texto: "Objetivo 2", escena: { id: 2, nombreEscena: "Escena2" } },
    { id: 3, texto: "Objetivo 3", escena: { id: 3, nombreEscena: "Escena3" } },
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
*/


  useEffect(() => {
    const fetchObjetivos = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        // SI NO SE RENDERIZADA DEL LADO DEL CLIENTE, NO USAR 'LOCALHOST', USAR 'BACKEND'
        const response = await fetch(
          //`${baseUrl}objetivos`
          'http://localhost:8000/api/objetivos'
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        } 
        const data = await response.json();
        setObjetivos(data);
      } catch (err) {
        setError("Error al cargar los objetivos");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchObjetivos();
  }, []);


  const handleObjetivoClick = (objetivoId: number) => {
    const objetivo = objetivos.find(obj => obj.id === objetivoId);
    if (objetivo) {
      setObjetivoSeleccionado(objetivoId);
      //setEscenasActivas(objetivo.escenas);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="flex flex-col h-screen p-4 space-y-6">
      {/* Sección de Objetivos */}
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-2">Objetivos</h2>
        <ScrollVerticalYHorizontal 
          elementos={objetivos}
          onObjetivoClick={handleObjetivoClick}
          selectedObjetivoId={objetivoSeleccionado}
        />
      </div>

      {/* Sección de Escenas */}
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-2">Escenas</h2>
        <div className="overflow-auto h-[calc(50vh-100px)] bg-gray-100 rounded-lg shadow p-4">
          {escenasActivas.length > 0 ? (
            <ul className="space-y-2">
              {escenasActivas.map((escena) => (
                <li
                  key={escena.id}
                  className="p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold">{escena.nombre}</h3>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              {objetivoSeleccionado 
                ? "Este objetivo no tiene escenas"
                : "Selecciona un objetivo para ver sus escenas"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}