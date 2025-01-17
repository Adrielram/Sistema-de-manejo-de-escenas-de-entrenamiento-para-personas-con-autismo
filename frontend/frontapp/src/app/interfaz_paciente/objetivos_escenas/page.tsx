"use client";

import { useState, useEffect } from "react";
import ScrollVerticalYHorizontal from "../../../components/ScrollVerticalYHorizontal";
import SearchBar from "../../../components/Buscador";

// VER CODIGO GPT O OBJETIVOS Y AGREGAR EL PAGINADO, PASAR ESA INFO AL COMPONENTE. LUEGO HACER EL FETCH DE LA ESCENA DADO UN OBJETIVO

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
  const baseURL = process.env.NEXT_PUBLIC_API_URL; // URL base de tu API
  const username = "paciente1"; // Reemplazar con el username real
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [totalPages, setTotalPages] = useState(1); // Estado para las páginas totales


  // Fetch de objetivos
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

      // Mapear los datos al formato esperado
      const mappedResults = data.results.map((obj) => ({
        id: obj.id,
        titulo: obj.titulo,
      }));
      setObjetivos(mappedResults);
      setTotalPages(Math.ceil(data.count / 6)); // Calcular el total de páginas

      // Seleccionar automáticamente el primer objetivo si no hay uno seleccionado
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

  // Fetch de escenas para un objetivo seleccionado
  const fetchEscenas = async (objetivoId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseURL}obtener_escenas_por_objetivo/?objetivo_id=${objetivoId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setEscenasActivas(data); // pero no esta el campo results en el json que devuelve... quiero agarrar el nombre
    } catch (err) {
      setError("Error al cargar las escenas");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObjetivos(currentPage);
  }, [currentPage]);

  // Manejar el cambio de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Manejar el clic en un objetivo
  const handleObjetivoClick = (objetivoId: number) => {
    setObjetivoSeleccionado(objetivoId);
    fetchEscenas(objetivoId);
  };

  return (
    // Cambiamos el contenedor principal para manejar responsive
    <div className="min-h-screen p-4 flex flex-col md:flex-row md:h-screen gap-6">
      {/* Contenedor para móvil que agrupa Buscador y Objetivos */}
      <div className="flex flex-col md:hidden gap-6 w-full">
        {/* Buscador en móvil */}
        <div className="w-full">
          <h2 className="text-xl font-bold mb-2">Buscador</h2>
          <SearchBar onSearch={setQuery} placeholder="Buscar Objetivo" />
        </div>

        {/* Objetivos en móvil */}
<div className="w-full">
  <h2 className="text-xl font-bold mb-2">Objetivos</h2>
  <div className="h-fit"> {/* Removido max-h-[400px] */}
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
  </div>
  </div>
{/* Objetivos en desktop */}
<div className="hidden md:flex md:w-[30%] md:flex-col">
  <h2 className="text-xl font-bold mb-2">Objetivos</h2>
  <div className="h-fit"> {/* Removido max-h-[600px] */}
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
</div>

      {/* Separador vertical - solo visible en desktop */}
      <div className="hidden md:block w-0.5 bg-gray-200"></div>

      {/* Escenas */}
      <div className="w-full md:w-[45%]">
        <h2 className="text-xl font-bold mb-2">
        Escenas {objetivoSeleccionado && `- ${objetivos.find(obj => obj.id === objetivoSeleccionado)?.titulo}`}
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

      {/* Separador vertical - solo visible en desktop */}
      <div className="hidden md:block w-0.5 bg-gray-200"></div>

      {/* Buscador en desktop */}
      <div className="hidden md:block md:w-[25%]">
        <h2 className="text-xl font-bold mb-2">Buscador</h2>
        <div className="h-[calc(100vh-100px)]">
          <SearchBar onSearch={setQuery} placeholder="Buscar Objetivo" />
        </div>
      </div>
    </div>
  );
}