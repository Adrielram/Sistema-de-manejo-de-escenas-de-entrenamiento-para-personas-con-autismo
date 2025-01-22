"use client";

import { useState, useEffect } from "react";
import ScrollVerticalYHorizontal from "../../../components/ScrollVerticalYHorizontal";
import SearchBar from "../../../components/Buscador";
import { useDispatch, useSelector } from 'react-redux';
import { setObjetivoId } from "../../../../slices/userSlice";
import { RootState } from "../../../../store/store";
import { useRouter } from 'next/navigation';


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
}

export default function Page() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [escenasActivas, setEscenasActivas] = useState<Escena[]>([]);
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const { username } = useSelector((state: RootState) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [objetivosFiltrados, setObjetivosFiltrados] = useState<Objetivo[]>([]);
  const [tituloObjetivoSeleccionado, setTituloObjetivoSeleccionado] = useState<string>("");
  const dispatch = useDispatch();
  const router = useRouter();

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
  
      // Actualizar objetivos y páginas
      setObjetivos(mappedResults);
      setObjetivosFiltrados(mappedResults);
      setTotalPages(Math.ceil(data.count / 6));
  
      // Seleccionar automáticamente el primer objetivo de la nueva página
      if (mappedResults.length > 0) {
        const primerObjetivo = mappedResults[0];
        setObjetivoSeleccionado(primerObjetivo.id);
        dispatch(setObjetivoId({ objetivoId: primerObjetivo.id }));
        setTituloObjetivoSeleccionado(primerObjetivo.titulo);
        fetchEscenas(primerObjetivo.id);
      } else {
        // Si no hay resultados en la página, limpiar selección
        setObjetivoSeleccionado(null);
        setTituloObjetivoSeleccionado("");
        setEscenasActivas([]);
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
  
      // Seleccionar automáticamente el primer objetivo encontrado
      if (data.length > 0) {
        const primerObjetivo = data[0];
        setObjetivoSeleccionado(primerObjetivo.id);
        dispatch(setObjetivoId({ objetivoId: primerObjetivo.id }));
        setTituloObjetivoSeleccionado(primerObjetivo.titulo);
        fetchEscenas(primerObjetivo.id);
      } else {
        // Si no hay resultados, limpiar selección
        setObjetivoSeleccionado(null);
        setTituloObjetivoSeleccionado("");
        setEscenasActivas([]);
      }
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
      dispatch(setObjetivoId({objetivoId: objetivoId}));
    }
  };

  const handleEscenaClick = (escenaID: number) => {
    window.alert(`Escena ${escenaID}`)
    //router.push('./ver_video');
  }


  return (
    <div className="min-h-screen p-4 flex flex-col md:flex-row md:h-screen gap-6">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">Buscador</h2>
        <SearchBar onSearch={handleSearch} placeholder="Buscar Objetivo" />

        {query ? (
          <div className="mt-4">
            <h2 className="text-lg font-bold mb-2">Resultados de la Búsqueda</h2>
            <div className="max-h-64 overflow-y-scroll bg-gray-50 rounded-lg shadow p-4">
              {objetivosFiltrados.length > 0 ? (
                <ul className="space-y-2">
                  {objetivosFiltrados.map((objetivo) => (
                    <li
                      key={objetivo.id}
                      onClick={() => handleObjetivoClick(objetivo.id)}
                      className={`cursor-pointer flex items-center justify-between p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                        objetivoSeleccionado === objetivo.id
                          ? "bg-blue-100 border-blue-400"
                          : "bg-white border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <span className="text-base font-medium">{objetivo.titulo}</span>
                      {objetivoSeleccionado === objetivo.id && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-blue-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No se encontraron resultados.</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2 mt-6">Objetivos</h2>
            <ScrollVerticalYHorizontal
              elementos={objetivos}
              onObjetivoClick={handleObjetivoClick}
              selectedObjetivoId={objetivoSeleccionado}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
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
                <button
                  onClick={() => handleEscenaClick(escena.id)}
                  className="text-left w-full"
                >
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">{escena.nombre}</h3>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
