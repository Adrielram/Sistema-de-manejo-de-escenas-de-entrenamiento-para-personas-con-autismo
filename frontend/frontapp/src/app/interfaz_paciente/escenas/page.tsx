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
  results: any[];
}

interface Escena {
  id: number;
  nombre: string;
  descripcion: string;
  idioma: string;
  acento: string;
  complejidad: number;
  condiciones: string;
  bloqueada: boolean; // Añadir nuevo campo
}

export default function Page() {
  const [escenas, setEscenas] = useState<Escena[]>([]);
  const [escenaSeleccionada, setEscenaSeleccionada] = useState<Escena | null>(null);
  //const [query, setQuery] = useState("");
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const { username, escenaId } = useSelector((state: RootState) => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  //const [escenasFiltradas, setEscenasFiltradas] = useState<Escena[]>([]);
  const dispatch = useDispatch();
  const router = useRouter();


  /*const fetchEscenaPorBusqueda = async (searchQuery: string) => {
    try {
      const response = await fetch(
        `${baseURL}buscar_objetivos/?username=${username}&query=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: Escena[] = await response.json();
      setEscenasFiltradas(data);
  
      // Seleccionar automáticamente el primer objetivo encontrado
      if (data.length > 0) {
        const esc = data[0]
        setEscenaSeleccionada(esc);
        dispatch(setIdEscena({ idEscena: esc.id})); 
      } else {
        // Si no hay resultados en la página, limpiar selección
        setEscenaSeleccionada(null);
        setEscenas([])
      }
    } catch (err) {
      console.error(err);
  };
  */

  const verificarEscenaAsignada = async (escenaId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/verificar-escena/?user_id=${username}&escena_id=${escenaId}`
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
    if (escenaId) {
      verificarEscenaAsignada(escenaId);
    }
  }, [escenaId]);

  useEffect(() => {
    const fetchEscenas = async (page: number = 1) => {
      try {
        const response = await fetch(`${baseURL}get-escenas-list/?page=${page}&limit=6`);
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
          bloqueada: esc.bloqueada // Añadir campo bloqueada
        }));
    
        setEscenas(mappedResults);
        setTotalPages(Math.ceil(data.count / 6));

        // Seleccionar primera escena NO bloqueada
        const primeraEscenaNoBloqueada = mappedResults.find(esc => !esc.bloqueada);
        if (primeraEscenaNoBloqueada) {
          setEscenaSeleccionada(primeraEscenaNoBloqueada); 
          dispatch(setIdEscena({ idEscena: primeraEscenaNoBloqueada.id }));
        } else {
          setEscenaSeleccionada(null);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEscenas(currentPage);
  }, [currentPage, baseURL, dispatch]);

  /*const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  
    if (searchQuery.trim() === "") {
      // Realiza una nueva llamada al backend para obtener todos los resultados
      fetchEscenaPorBusqueda("");
      return;
    }
  
    fetchEscenaPorBusqueda(searchQuery);
  };
  */

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };


const handleMostrarDescripcion = async (escenaP: number) => { 
    const escenaSeleccionada = escenas.find((escena) => escena.id === escenaP);
    
    if (escenaSeleccionada && !escenaSeleccionada.bloqueada) {
      dispatch(setIdEscena({idEscena: escenaP}));
      setEscenaSeleccionada(escenaSeleccionada);
      
      try {
        const result = await verificarEscenaAsignada(escenaSeleccionada.id);
        
        if (result.error) {
          console.error("Error verificando la escena:", result.error);
          return;
        }
  
        if (result.asignada) {
          dispatch(setObjetivoId({ objetivoId: result.objetivo_id }));
        } else {
          dispatch(setObjetivoId({ objetivoId: "" }));
        }
      } catch (error) {
        console.error("Error al verificar la escena:", error);
      }
    }
  }

  const handleEscenaClick = () => {
    if (!escenaSeleccionada || escenaSeleccionada.bloqueada) {
      alert('Esta escena está bloqueada. Completa las escenas anteriores para desbloquear.');
      return;
    }
    router.push('./ver_video');
  };

  return (
    <div className="min-h-screen p-4 flex flex-col md:flex-row md:h-screen gap-6">
      <div className="w-full">
            <h2 className="text-xl font-bold mb-2 mt-6">Escenas</h2>
            {escenas.length > 0 ? (
              <ScrollVerticalYHorizontal
                elementos={escenas}
                onElementoClick={handleMostrarDescripcion}
                selectedElementoId={escenaSeleccionada ? escenaSeleccionada.id : null}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                bloqueadaMap={escenas.reduce((acc, esc) => {
                  acc[esc.id] = esc.bloqueada;
                  return acc;
                }, {} as Record<number, boolean>)}
              />
            ) : (
              <div className="text-center py-4 text-gray-500">
                No se encontraron objetivos para mostrar.
              </div>
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
  );
}
