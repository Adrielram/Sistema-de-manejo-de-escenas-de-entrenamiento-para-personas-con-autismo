"use client";

import { useState, useEffect } from "react";
import ScrollVerticalYHorizontal from "../../../components/ScrollVerticalYHorizontal";
import SearchBar from "../../../components/Buscador";
import { useDispatch, useSelector } from 'react-redux';
import { setIdEscena, setObjetivoId } from "../../../../slices/userSlice";
import { RootState } from "../../../../store/store";
import { useRouter } from 'next/navigation';


interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Escena[];
}

interface Escena {
  id: number;
  nombre: string;
  descripcion: string;
  idioma: string;
  acento: string;
  complejidad: number;
  condiciones: string;
  bloqueada: boolean;
  mensaje_bloqueo: string;
}

export default function Page() {
  const [escenas, setEscenas] = useState<Escena[]>([]);
  const [escenaSeleccionada, setEscenaSeleccionada] = useState<Escena | null>(null);
  const [query, setQuery] = useState("");
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const { username, idEscena } = useSelector((state: RootState) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [escenasFiltradas, setEscenasFiltradas] = useState<Escena[]>([]);
  const dispatch = useDispatch();
  const router = useRouter();


  const fetchEscenaPorBusqueda = async (searchQuery: string) => {
    try {
      const response = await fetch(
        `${baseURL}buscar-escenas/?username=${username}&query=${searchQuery}`
      );
  
      // Verifica si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      // Convierte la respuesta a JSON
      const data: Escena[] = await response.json();

      setEscenasFiltradas(data);
      setEscenaSeleccionada(null);
  
    } catch (err) {
      console.error(err);
    }
  };
  

  const verificarEscenaAsignada = async (idEscena: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/verificar-escena/?user_id=${username}&escena_id=${idEscena}`
      );
  
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }
  
      const data = await response.json();
      return {
        asignada: data.asignada,
        objetivo_id: data.objetivo_id,
        error: null
      };
    } catch (error) {
      console.error("Error al verificar la escena:", error);
      return {
        asignada: false,
        objetivo_id: null,
        error: error.message
      };
    }
  };
  

  useEffect(() => {
    const fetchEscenas = async (page: number = 1) => {
      try {
        if (!username) {
          console.error("Username no encontrado en el estado de Redux.");
          return;
        }
  
        const response = await fetch(`${baseURL}get-escenas-list/?page=${page}&limit=6&username=${username}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data: PaginatedResponse = await response.json();
  
        const mappedResults = data.results.map((esc) => ({
          id: esc.id,
          nombre: esc.nombre,
          descripcion: esc.descripcion,
          idioma: esc.idioma,
          acento: esc.acento,
          complejidad: esc.complejidad,
          condiciones: esc.condiciones,
          bloqueada: esc.bloqueada,
          mensaje_bloqueo: esc.mensaje_bloqueo
        }));
  
        setEscenas(mappedResults);
        setTotalPages(Math.ceil(data.count / 6));
        setEscenaSeleccionada(null);

      } catch (err) {
        console.error(err);
      }
    };
    fetchEscenas(currentPage);
  }, [currentPage, baseURL, dispatch, username]);
  
  useEffect(() => {
    let isMounted = true;
  
    const checkEscena = async () => {
      if (!idEscena) {
        dispatch(setObjetivoId({ objetivoId: "" }));
        return;
      }
  
      try {
        const result = await verificarEscenaAsignada(idEscena);
        if (!isMounted) return;
  
        if (result.asignada) {
          dispatch(setObjetivoId({ objetivoId: result.objetivo_id }));
        } else {
          dispatch(setObjetivoId({ objetivoId: "" }));
        }
      } catch (error) {
        console.error("Error verificando escena:", error);
        if (isMounted) {
          dispatch(setObjetivoId({ objetivoId: "" }));
        }
      }
    };
  
    checkEscena();
  
    return () => {
      isMounted = false;
    };
  }, [idEscena]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  
    if (searchQuery.trim() === "") {
      // Realiza una nueva llamada al backend para obtener todos los resultados
      fetchEscenaPorBusqueda("");
      return;
    }
  
    fetchEscenaPorBusqueda(searchQuery);
  };
  

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };


  const handleMostrarDescripcion = (escenaP: number) => { 
  // Buscar en escenasFiltradas si hay una búsqueda activa, sino en escenas
  const escenaSeleccionada = query 
    ? escenasFiltradas.find((escena) => escena.id === escenaP)
    : escenas.find((escena) => escena.id === escenaP);
  
  if (escenaSeleccionada && !escenaSeleccionada.bloqueada) {
    setEscenaSeleccionada(escenaSeleccionada);
    dispatch(setIdEscena({idEscena: escenaP}));
  }
};

  const handleEscenaClick = () => {
    if (!escenaSeleccionada || escenaSeleccionada.bloqueada) {
      alert('Esta escena está bloqueada. Completa las escenas anteriores para desbloquear.');
      return;
    }
    router.push('./ver_video');
  };


  return (
        <div className="flex flex-col min-h-screen p-4 gap-6">
          <div className="flex flex-col md:flex-row md:h-screen gap-4">
            <div className="w-full">
            <SearchBar onSearch={handleSearch} placeholder="Busca una escena..." />
            {query ? (
              <div className="mt-4">
                <h2 className="text-lg font-bold mb-2">Resultados de la Búsqueda</h2>
                <div className="max-h-[80vh] overflow-auto bg-gray-50 rounded-lg shadow p-4">
                  <ul className="space-y-2">
                  {!escenasFiltradas || escenasFiltradas.length === 0 ? (
                      <p className="text-gray-500 text-center">No se encontraron resultados.</p>
                    ) : (
                    escenasFiltradas.map((escena) => (
                      <li
                        key={escena.id}
                        onClick={() => !escena.bloqueada && handleMostrarDescripcion(escena.id)}
                        className={`flex items-center justify-between p-4 gap-4 rounded-lg shadow-sm border transition-shadow 
                          ${escena.bloqueada 
                            ? "bg-gray-100 opacity-50 cursor-not-allowed" 
                            : "cursor-pointer hover:shadow-md bg-white border-gray-200 hover:border-blue-300"} 
                          ${escenaSeleccionada?.id === escena.id && !escena.bloqueada 
                            ? "bg-blue-100 border-blue-400" 
                            : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base font-medium">{escena.nombre}</span>
                          {escena.bloqueada && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="h-5 w-5 text-gray-500"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {escena.bloqueada && escena.mensaje_bloqueo && (
                            <span className="text-lg text-gray-500 text-right flex-grow">
                              {escena.mensaje_bloqueo}
                            </span>
                          )}
                          
                          {!escena.bloqueada && escenaSeleccionada?.id === escena.id && (
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
                        </div>
                      </li>
                    )))}
                  </ul>
                </div>
              </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-2 mt-6">Escenas</h2>
                  {escenas.length > 0 ? (
                    <ScrollVerticalYHorizontal
                      elementos={escenas}
                      onElementoClick={handleMostrarDescripcion}
                      selectedElementoId={escenaSeleccionada ? escenaSeleccionada.id : null}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No se encontraron objetivos para mostrar.
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="hidden md:block w-0.5 bg-gray-200"></div>
            <div className="w-full md:w-[45%]">
              {escenaSeleccionada ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    {`Datos completos de la escena: ${escenaSeleccionada.nombre}`}
                  </h2>
                  <div className="max-w-lg mx-auto overflow-auto bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <ul className="space-y-4">
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Nombre:</span> {escenaSeleccionada.nombre}
                      </li>
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Descripción:</span> {escenaSeleccionada.descripcion}
                      </li>
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Complejidad:</span> {escenaSeleccionada.complejidad}
                      </li>
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Idioma:</span> {escenaSeleccionada.idioma}
                      </li>
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Acento:</span> {escenaSeleccionada.acento}
                      </li>
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Condiciones:</span> {escenaSeleccionada.condiciones}
                      </li>
                    </ul>
                    <button
                      onClick={handleEscenaClick}
                      disabled={!escenaSeleccionada || escenaSeleccionada.bloqueada}
                      className={`mt-6 w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
                        escenaSeleccionada?.bloqueada 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {escenaSeleccionada?.bloqueada ? 'Escena bloqueada' : 'Ver video'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-100 rounded-lg shadow-md border border-gray-200">
                  <p className="text-lg font-medium">Selecciona una escena para ver los detalles.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }