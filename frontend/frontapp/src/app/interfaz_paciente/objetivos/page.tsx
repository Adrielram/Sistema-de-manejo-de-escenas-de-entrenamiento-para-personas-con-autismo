"use client";

import { useState, useEffect } from "react";
import ScrollVerticalYHorizontal from "../../../components/ScrollVerticalYHorizontal";
import SearchBar from "../../../components/Buscador";
import { useDispatch, useSelector } from 'react-redux';
import { setIdEscena } from "../../../../slices/userSlice";
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
}

export default function Page() {
  const [escenas, setEscenas] = useState<Escena[]>([]);
  const [escenaSeleccionada, setEscenaSeleccionada] = useState<Escena | null>(null);
  //const [query, setQuery] = useState("");
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  //const { username } = useSelector((state: RootState) => state.user);
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

  useEffect(() => {
    const fetchEscenas = async (page: number = 1) => {
      try {
        const response = await fetch(`${baseURL}get-escenas-list/?page=${page}&limit=6`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data: PaginatedResponse = await response.json();
    
        const mappedResults = data.results.map((esc) => ({
          id: esc.id,
          nombre: esc.nombre, // Asegúrate de que el campo sea 'nombre'
          descripcion: esc.descripcion,
          idioma: esc.idioma,
          acento: esc.acento,
          complejidad: esc.complejidad,
          condiciones: esc.condiciones,
        }));
    
        setEscenas(mappedResults);
        setTotalPages(Math.ceil(data.count / 6));
    
        if (mappedResults.length > 0) {
          const primerEscena = mappedResults[0];
          setEscenaSeleccionada(primerEscena); 
          dispatch(setIdEscena({ idEscena: primerEscena.id })); 
        } else {
          setEscenaSeleccionada(null);
          setEscenas([]);
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


  const handleEscenaClick = () => {
    if (!escenaSeleccionada) {
      alert('Por favor, selecciona una escena antes de continuar.');
      return;
    }
    //window.alert(`Escena ${escenaID}`)
    router.push('./ver_video');
  };

  const handleMostrarDescripcion = (escenaP: number) => { 
    const escenaSeleccionada = escenas.find((escena) => escena.id === escenaP);
    if (escenaSeleccionada) {
      dispatch(setIdEscena({idEscena: escenaP}));
      setEscenaSeleccionada(escenaSeleccionada);
    }
  }

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
                  onClick={() => handleEscenaClick()}
                  className="mt-6 w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Ver video
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
