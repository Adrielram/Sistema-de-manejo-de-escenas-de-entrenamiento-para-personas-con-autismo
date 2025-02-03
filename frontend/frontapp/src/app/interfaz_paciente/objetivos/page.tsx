"use client";

import { useState, useEffect } from "react";
import ScrollVerticalYHorizontal from "../../../components/ScrollVerticalYHorizontal";
import { useDispatch, useSelector } from 'react-redux';
import { setIdEscena, setObjetivoId } from "../../../../slices/userSlice";
import { RootState } from "../../../../store/store";
import { useRouter } from 'next/navigation';
import EscenaInfo from "../../../components/Escena_info";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Escena[];
}

interface Objetivo {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Condicion {
  id: number;
  cumple_condiciones: {
    edad: boolean;
    fecha: boolean;
    objetivo: boolean;
  };
}

interface Escena {
  id: number;
  nombre: string;
  descripcion: string;
  idioma: string;
  acento: string;
  complejidad: number;
  condicion: Condicion;
  bloqueada: boolean;
  mensaje_bloqueo?: string;
}


export default function Page() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [selectedObjetivo, setSelectedObjetivo] = useState<Objetivo | null>(null);
  const [escenasDelObjetivo, setEscenasDelObjetivo] = useState<Escena[]>([]);
  const [selectedEscena, setSelectedEscena] = useState<Escena | null>(null);
  const [currentPage, setCurrentPage] = useState(1);  //paginado de objetivos
  const [currentPageEscenas, setCurrentPageEscenas] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const baseURL = process.env.NEXT_PUBLIC_API_URL;
  const { username } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  // Fetch objetivos
  useEffect(() => {
    const fetchObjetivos = async () => {
      try {
        if (!username) {
          console.error("Username no encontrado");
          return;
        }

        const response = await fetch(
          `${baseURL}get-objetivos-list/?page=${currentPage}&limit=4&username=${username}`
        );
        
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data: PaginatedResponse = await response.json();

        const mapped = data.results.map(obj => ({
          id: obj.id,
          nombre: obj.nombre,
          descripcion: obj.descripcion
        }));

        setObjetivos(mapped);
        setTotalPages(Math.ceil(data.count / 6));

        // Seleccionar primer objetivo
        if (mapped.length > 0) {
          setSelectedObjetivo(mapped[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchObjetivos();
  }, [currentPage, username]);

  // Fetch escenas cuando cambia el objetivo seleccionado
  useEffect(() => {
    const fetchEscenasPorObjetivo = async (page: number = 1) => {
      if (!selectedObjetivo) return;
  
      try {
        const response = await fetch(
          `${baseURL}escenas-por-objetivo/?objetivo_id=${selectedObjetivo.id}&username=${username}&page=${page}&limit=4`
        );
        
        
        if (!response.ok) {
          // Si hay error de paginación, forzar página 1
          if (response.status === 404 && page > 1) {
            setCurrentPageEscenas(1);
            return;
          }
          throw new Error(`Error: ${response.status}`);
        }
        //const data: Escena[] = await response.json();
        const data = await response.json();

        //const mapped = data.map(esc => ({
        const mapped = data.map(esc => ({
          id: esc.id,
          nombre: esc.nombre,
          descripcion: esc.descripcion,
          idioma: esc.idioma,
          acento: esc.acento,
          complejidad: esc.complejidad,
          condicion: esc.condicion,
          bloqueada: esc.bloqueada,
          mensaje_bloqueo: esc.mensaje_bloqueo
        }));

        setEscenasDelObjetivo(mapped);
        // Seleccionar primera escena no bloqueada
        //const primeraNoBloqueada = mapped.find(e => !e.bloqueada);
        //setSelectedEscena(primeraNoBloqueada || null);
      } catch (err) {
        console.error(err);
        setCurrentPageEscenas(1); // Resetear a página 1 ante errores
      }
    };
    fetchEscenasPorObjetivo(currentPageEscenas);
  }, [selectedObjetivo, currentPageEscenas]);



  const handleObjetivoClick = (id: number) => {
    const objetivo = objetivos.find(obj => obj.id === id);
    if (objetivo) {
      setSelectedObjetivo(objetivo);
      dispatch(setObjetivoId({ objetivoId: objetivo.id.toString() }));
      setCurrentPageEscenas(1);
      dispatch(setIdEscena({ idEscena: null })); // Limpiar escena seleccionada
    }
    setSelectedEscena(null); // Asegurar reset visual
  };
  
  // Modificar handleEscenaClick para asegurar objetivoId
  const handleEscenaClick = async (id: number) => {
    const escena = escenasDelObjetivo.find(e => e.id === id);
    if (escena && !escena.bloqueada) {
      setSelectedEscena(escena);
      dispatch(setIdEscena({ idEscena: id }));
      

    }
  };

  const handleVerVideo = () => {
    if (selectedEscena && !selectedEscena.bloqueada) {
      router.push('./ver_video');
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col md:flex-row md:h-screen gap-6">
      {/* Panel izquierdo - Lista de objetivos y escenas */}
      <div className="w-full md:w-[65%] flex flex-col gap-6 items-start">
        <div className="w-full">
          <h2 className="text-xl font-bold mb-2 sm:text-2xl">Objetivos</h2>
          <div className="h-[300px]"> {/* Altura fija */}
            <ScrollVerticalYHorizontal
              elementos={objetivos.map(obj => ({ 
                id: obj.id,
                nombre: obj.nombre,
                descripcion: obj.descripcion,
                bloqueada: false,
                mensaje_bloqueo: undefined,
                // Campos dummy para cumplir con la interfaz
                idioma: '',
                acento: '',
                complejidad: 0,
                condicion: {
                  id: 0,
                  cumple_condiciones: {
                    edad: true,
                    fecha: true,
                    objetivo: true
                  }
                }
              }))}
              onElementoClick={handleObjetivoClick}
              selectedElementoId={selectedObjetivo?.id || null}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
        {selectedObjetivo && (
          <div className="w-full md:mt-8 mt-6">
            <h2 className="text-xl font-bold mb-2 sm:text-2xl">
              Escenas de: {selectedObjetivo.nombre}
            </h2>
            <div className="h-[300px] border-t bg-gray-50 border-gray-200 rounded-lg ">
              <div className="h-full overflow-y-auto pr-2 ">
                {escenasDelObjetivo.map(escena => (
                  <div
                    key={escena.id}
                    onClick={() => handleEscenaClick(escena.id)}
                    className={` flex items-center justify-between md:p-3 p-4 my-2 rounded-lg border transition-all cursor-pointer  ${
                      escena.bloqueada 
                        ? "bg-gray-100 opacity-50 cursor-not-allowed"
                        : "cursor-pointer bg-white hover:border-blue-300 hover:shadow-md"
                    } ${
                      selectedEscena?.id === escena.id && !escena.bloqueada
                        ? "bg-blue-100 border-blue-400"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{escena.nombre}</span>
                      {escena.bloqueada && (
                        <svg 
                          className="h-5 w-5 text-gray-500"
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    {escena.mensaje_bloqueo && (
                      <p className="text-sm text-gray-500 mt-1">{escena.mensaje_bloqueo}</p>
                    )}
                    {selectedEscena?.id === escena.id && !escena.bloqueada && (
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
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <EscenaInfo escena={selectedEscena} escenaHandleClick={handleVerVideo} />
    </div>
  );
}