"use client";

import { useState, useEffect } from "react";
import ScrollVerticalYHorizontal from "../../../components/ScrollVerticalYHorizontal";
import SearchBar from "../../../components/Buscador";


interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

interface Objetivo {
  id: number;
  titulo: string;
}

interface Escena {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function Page() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [escenasActivas, setEscenasActivas] = useState<Escena[]>([]);
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const username = "paciente1";
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [objetivosFiltrados, setObjetivosFiltrados] = useState<Objetivo[]>([]);
  const [tituloObjetivoSeleccionado, setTituloObjetivoSeleccionado] = useState<string>("");

  const fetchObjetivos = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseURL}obtener_objetivos_usuario/?username=${username}&page=${page}&limit=6`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: PaginatedResponse = await response.json();
  
      const mappedResults = data.results.map((obj) => ({
        id: obj.id,
        titulo: obj.titulo,
      }));
  
      // Actualizamos objetivos solo cuando los datos están listos
      setObjetivos(mappedResults);
      setObjetivosFiltrados(mappedResults);
      setTotalPages(Math.ceil(data.count / 6));
  
      if (mappedResults.length > 0 && !objetivoSeleccionado) {
        const primerObjetivo = mappedResults[0];
        setObjetivoSeleccionado(primerObjetivo.id);
        setTituloObjetivoSeleccionado(primerObjetivo.titulo);
        fetchEscenas(primerObjetivo.id);
      }
    } catch (err) {
      setError("Error al cargar los objetivos");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  

  const fetchEscenas = async (objetivoId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseURL}obtener_escenas_por_objetivo/?objetivo_id=${objetivoId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setEscenasActivas(data);
    } catch (err) {
      setError("Error al cargar las escenas");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchObjetivosPorBusqueda = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseURL}buscar_objetivos/?username=${username}&query=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: Objetivo[] = await response.json();
      setObjetivosFiltrados(data);
    } catch (err) {
      setError("Error al buscar objetivos");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObjetivos(currentPage);
  }, [currentPage]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  
    if (searchQuery.trim() === "") {
      // Realiza una nueva llamada al backend para obtener todos los resultados
      fetchObjetivosPorBusqueda("");
      return;
    }
  
    fetchObjetivosPorBusqueda(searchQuery);
  };
  

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleObjetivoClick = (objetivoId: number) => {
    const objetivo =
      objetivos.find((obj) => obj.id === objetivoId) ||
      objetivosFiltrados.find((obj) => obj.id === objetivoId);

    if (objetivo) {
      setObjetivoSeleccionado(objetivoId);
      setTituloObjetivoSeleccionado(objetivo.titulo);
      fetchEscenas(objetivoId);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col md:flex-row md:h-screen gap-6">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">Buscador</h2>
        <SearchBar onSearch={handleSearch} placeholder="Buscar Objetivo" />

        {query && (
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-2">Resultados de la Búsqueda</h2>
          <div className="max-h-64 overflow-y-scroll bg-gray-50 rounded-lg shadow p-4">
            {objetivosFiltrados.length > 0 ? (
              <ul className="space-y-2">
                {objetivosFiltrados.map((objetivo) => (
                  <li
                    key={objetivo.id}
                    onClick={() => handleObjetivoClick(objetivo.id)}
                    className={`cursor-pointer p-4 bg-gray-100 rounded-lg shadow-sm hover:bg-blue-50 ${
                      objetivoSeleccionado === objetivo.id ? "bg-blue-200" : ""
                    }`}
                  >
                    {objetivo.titulo}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No se encontraron resultados.</p>
            )}
          </div>
        </div>
)}

        <h2 className="text-xl font-bold mb-2 mt-6">Objetivos</h2>
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
      <div className="hidden md:block w-0.5 bg-gray-200"></div>
      <div className="w-full md:w-[45%]">
        <h2 className="text-xl font-bold mb-2">
          {tituloObjetivoSeleccionado ? `Escenas - ${tituloObjetivoSeleccionado}` : "Escenas"}
        </h2>
        <div className="h-[500px] md:h-[calc(100vh-100px)] overflow-auto bg-gray-100 rounded-lg shadow p-4">
          <ul className="space-y-4">
            {escenasActivas.map((escena) => (
              <li
                key={escena.id}
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-blue-600 mb-2">{escena.nombre}</h3>
                <p className="text-gray-600">{escena.descripcion}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
