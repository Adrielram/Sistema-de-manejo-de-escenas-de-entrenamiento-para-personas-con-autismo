"use client";

import React, { useEffect,useRef, useState } from "react";
import Objetivo from "../../../components/Objetivo";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUserId, setObjetivoId, setIdEscena } from "../../../../slices/userSlice";
import { RootState } from "../../../../store/store";
import ComentarioPaciente from "../../../components/ComentarioPaciente";
import BoxPaginado from "../../../components/PaginadoDinamico";
type ObjetivoData = {
  id: number;
  nombre: string;
  descripcion: string;
};

type PersonaObjetivo = {
  id: number;
  progreso: number;
  objetivo_id: ObjetivoData;
  resultado: string | null;
};

interface Escena {
  id: number;
  nombre: string;
}

const ObjetivoList = () => {
  const { userId, objetivoId } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const [objetivos, setObjetivos] = useState<PersonaObjetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [escenasActivas, setEscenasActivas] = useState<Escena[]>([]);
  const [escenaSeleccionada, setEscenaSeleccionada] = useState<number | null>(null);
  const [comentariosHashSet, setComentariosHashSet] = useState<{
    [key: number]: number[];
  }>({});
  const comentariosRef = useRef<HTMLDivElement>(null);
  const [evaluaciones, setEvaluaciones] = useState<{ [key: string]: string }>({});
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch objetivos
  useEffect(() => {
    const fetchObjetivos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}objetivos-ev-paciente/?user_id=${userId}`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error("Error al cargar los objetivos");
        const data = await response.json();
        setObjetivos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setObjetivos([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchObjetivos();
  }, [userId]);

  // Fetch escenas activas
  const fetchEscenas = async () => {
    try {
      const response = await fetch(`${baseURL}obtener_escenas_por_objetivo/?objetivo_id=${objetivoId}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data: Escena[] = await response.json();
      setEscenasActivas(data);
    } catch (err) {
      console.error("Error al cargar las escenas", err);
    }
  };

  

  const handleExpand = (id: number) => {
    dispatch(setUserId({ userId: userId }));
    dispatch(setObjetivoId({ objetivoId: id }));
    setExpandedId(expandedId === id ? null : id);
  };

  const handleVerComentariosClick = (id: number) => {
    dispatch(setObjetivoId({ objetivoId: id })); // Guarda el ID del objetivo en Redux
    setSidebarVisible(true); // Abre el sidebar de las escenas
    fetchEscenas(); // Carga las escenas asociadas al objetivo
  };

  // Fetch evaluaciones
  const fetchEvaluaciones = async (page: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}get_forms_patient/?dni=${userId}&page=${page}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) throw new Error("Error al obtener las evaluaciones");
  
      const data: { count: number; results: { evaluacion: number }[] } = await response.json();
      
      setTotalItems(data.count);  // Total de evaluaciones disponibles
      
      const formattedData: { [key: string]: string } = {};
      data.results.forEach((item) => {
        formattedData[item.evaluacion.toString()] = `Evaluación ${item.evaluacion}`;
      });
  
      setEvaluaciones(formattedData); // Actualiza las evaluaciones con la página actual
    } catch (error) {
      console.error("Error al obtener las evaluaciones:", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleVerEvaluacionesClick = () => {
    setSidebarVisible(false); // Cierra el sidebar de escenas
    setEscenaSeleccionada(null); // Resetea la escena seleccionada
    setComentariosHashSet({}); // Limpia los comentarios
    fetchEvaluaciones(currentPage); // Carga las evaluaciones
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchEvaluaciones(newPage); // Actualiza las evaluaciones con la nueva página
  };
  

  const opProps = {
    trashBin: false,
    buttonVer: true,
  };
  

  const handleEscenaClick = (escenaId: number) => {
    setEscenaSeleccionada(escenaId);
    dispatch(setIdEscena({ idEscena: escenaId }));
    
    // Fetch de comentarios similar a tu implementación anterior
    const fetchComentarios = async () => {
      try {
        const response = await fetch(
          `${baseUrl}comentarios/lista/?id_escena=${escenaId}`,
          { credentials: 'include' }
        );
        const data = await response.json();

        if (response.ok) {
          setComentariosHashSet(data.hashset);
          
          // Scroll a los comentarios
          if (comentariosRef.current) {
            comentariosRef.current.scrollIntoView({ behavior: "smooth" });
          }
        } else {
          console.error(data.error);
          setComentariosHashSet({});
        }
      } catch (error) {
        console.error("Error al obtener los comentarios:", error);
        setComentariosHashSet({});
      }
    };

    fetchComentarios();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center items-center">
        <div className="text-gray-600">Cargando objetivos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center items-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col md:flex-row gap-6">
      {/* Lista de objetivos */}
      <div className="w-full flex-1">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Lista de Objetivos</h1>
          {objetivos.map(({ id, progreso, objetivo_id }) => (
            <Objetivo
              key={id}
              id={objetivo_id.id}
              titulo={objetivo_id.nombre}
              descripcion={objetivo_id.descripcion}
              expanded={expandedId === objetivo_id.id}
              onExpand={handleExpand}
              progreso={progreso}
              onNavigateComentarios={() => handleVerComentariosClick(objetivo_id.id)} // Usa este evento para manejar el clic
              onNavigateEvaluaciones={() => handleVerEvaluacionesClick()} // No implementado
            />
          ))}         
        </div>

         {!sidebarVisible && (
          <>
            {/* Evaluaciones paginadas */}
            {Object.keys(evaluaciones).length > 0 && (
              <div className="container mx-auto p-4">
              <h2 className="text-xl font-bold mb-4">Evaluaciones del Paciente</h2>
              <BoxPaginado
                data={evaluaciones}
                options={opProps}
                img="/icon/evaluacion.png"
                ver_path="/interfaz_padre/ver_seguimiento/evaluaciones/"
                item_type="Evaluación"
                showImage={true}
                currentPage={currentPage}
                totalItems={totalItems}
                onPageChange={handlePageChange}
                itemsPerPage={8}
              />
            </div>
            )}          
          </>
          )} 

        {/* Comentarios debajo de los objetivos */}
        {escenaSeleccionada && (
        <div ref={comentariosRef} className="mt-6">
          <h2 className="text-xl font-bold mb-4">Comentarios de la Escena {escenaSeleccionada}</h2>
          {Object.keys(comentariosHashSet).length > 0 ? (
            Object.keys(comentariosHashSet).map((principalId) => (
              <div key={principalId} className="mb-4">
                <ComentarioPaciente
                  idComentario={parseInt(principalId)}
                  respuestas={comentariosHashSet[parseInt(principalId)]}
                  onResponder={() => {}}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No existen comentarios para esta escena</p>
          )}
        </div>
        )}
      </div>

      {/* Sidebar */}
      {sidebarVisible && (
        <div className="w-full md:w-[45%] bg-gray-100 rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-2">Escenas</h2>
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
      )}
    </div>
  );
};

export default ObjetivoList;
