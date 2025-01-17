"use client";

import { useState, useEffect } from "react";
import ScrollVerticalYHorizontal from "../../../components/ScrollVerticalYHorizontal";
import SearchBar from "../../../components/Buscador"; // Asegúrate de mover los datos mock a un archivo separado

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export default function Page() {
  const [objetivos, setObjetivos] = useState<Array<{ id: number; titulo: string }>>([]);
  //const [escenasActivas, setEscenasActivas] = useState();
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<number>();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const username = 'paciente1'; // Reemplazar con el username real
  // USERNAME SACARLO DEL ESTADO DE REDUX
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const fetchObjetivos = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseURL}obtener_objetivos_usuario/?username=${username}&page=${page}&limit=4`
        //`http://localhost:8000/api/obtener_objetivos_usuario/?username=${username}&page=${page}&limit=4`
       //`http://localhost:8000/api/obtener_centros_de_salud/?username=${username}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: PaginatedResponse = await response.json();
  
      // Mapear a la estructura esperada
      const mappedResults = data.results.map(obj => ({
        id: obj.id,
        titulo: obj.titulo, 
      }));
      setObjetivos(mappedResults);
      setTotalPages(Math.ceil(data.count / 4));
  
      if (mappedResults.length > 0 && !objetivoSeleccionado) {
        
        setObjetivoSeleccionado(mappedResults[0].id);
      }
    } catch (err) {
      setError("Error al cargar los objetivos");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchObjetivos(currentPage);
  }, [currentPage, username]);

  const handleObjetivoClick = (objetivoId: number) => {
    const objetivo = objetivos.find(obj => obj.id === objetivoId);
    if (objetivo) {
      setObjetivoSeleccionado(objetivoId);
      //setEscenasActivas(objetivo.escenas);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="flex h-screen p-4 gap-6">
      {error && (
        <div className="absolute top-0 right-0 m-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Sección de Objetivos - 30% del ancho */}
      <div className="w-[30%]">
        <h2 className="text-xl font-bold mb-2">Objetivos</h2>
        <ScrollVerticalYHorizontal 
          elementos={objetivos}
          onObjetivoClick={handleObjetivoClick}
          selectedObjetivoId={objetivoSeleccionado}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>

      {/* Resto del código igual... */}
    </div>
  );
}