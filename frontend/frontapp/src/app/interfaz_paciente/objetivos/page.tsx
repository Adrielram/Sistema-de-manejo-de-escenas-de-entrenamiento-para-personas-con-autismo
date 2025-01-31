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
  edad?: number;
  fecha?: string;
  objetivo?: string;
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
  const [totalPagesEscenas, setTotalPagesEscenas] = useState(1);
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
        const mapped = data.results.map(esc => ({
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
        setTotalPagesEscenas(Math.ceil(data.count / 6)); // Actualizar total de páginas
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
      <div className="w-full md:w-[55%] flex flex-col gap-4 items-start"> {/* Cambio importante aquí */}
        <div className="w-full">
          <h2 className="text-xl font-bold mb-2">Objetivos</h2>
          <div className="h-[300px]"> {/* Altura fija */}
            <ScrollVerticalYHorizontal
              elementos={objetivos.map(obj => ({ 
                ...obj, 
                bloqueada: false,
                mensaje_bloqueo: undefined 
              }))}
              onElementoClick={handleObjetivoClick}
              selectedElementoId={selectedObjetivo?.id || null}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              bloqueadaMap={{}}
            />
          </div>
        </div>
        {selectedObjetivo && (
  <div className="w-full mt-8"> {/* Aumentamos el margen superior */}
    <h2 className="text-xl font-bold   rounded-t-lg"> {/* Fondo y padding */}
      Escenas de: {selectedObjetivo.nombre}
    </h2>
    <div className="h-[300px] border-t border-gray-200"> {/* Borde superior */}
              <ScrollVerticalYHorizontal
                elementos={escenasDelObjetivo}
                onElementoClick={handleEscenaClick}
                selectedElementoId={selectedEscena?.id || null}
                currentPage={currentPageEscenas}
                totalPages={totalPagesEscenas}
                onPageChange={setCurrentPageEscenas}
                bloqueadaMap={escenasDelObjetivo.reduce((acc, e) => {
                  acc[e.id] = e.bloqueada;
                  return acc;
                }, {} as Record<number, boolean>)}
              />
            </div>
          </div>
        )}
      </div>

      <EscenaInfo escena={selectedEscena} escenaHandleClick={handleVerVideo} />
    </div>
  );
}