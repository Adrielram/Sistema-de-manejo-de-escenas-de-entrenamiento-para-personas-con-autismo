"use client";

import React, { useEffect, useState } from "react";
import Comentario from "../../../components/Comentario";
import { NuevoComentario } from "../../../components/NuevoComentario";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../store/store"; 

interface Escena {
  id: number;
  idioma: string;
  acento: string;
  complejidad: number;
  condiciones: string;
  link: string;
  nombre: string;
}

const VerVideo = () => {
  const [videos, setVideos] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState({ formularios: [] });
  const [escenas, setEscenas] = useState<Escena[]>([]);
  const [escena, setEscena] = useState<Escena>();
  const [poe, setPoe] = useState<number>();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>([]);
  const { username } = useSelector((state: RootState) => state.user);
  const objetivoId = 1;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [reloadComentarios, setReloadComentarios] = useState(false);
  const searchParams = useSearchParams();
  const completedFormId = searchParams.get('completedFormId');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [formData, setFormData] = useState({
    user: username, 
    escena: 0,
    texto: '',
    visibilidad: true,
    comentario_respondido: null,
  });

  useEffect(() => {
    const verificarFormulario = async (formId: string) => {
      const response = await fetch(`${baseUrl}verificar_form_completado/${formId}/${username}/`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'completado') {
          setCompletedQuizzes((prev) => [...new Set([...prev, parseInt(formId, 10)])]);
        }
      }
    };

    if (completedFormId) {
      verificarFormulario(completedFormId);
    }
  }, [completedFormId]);

  useEffect(() => {
    const cargarFormulariosCompletados = async () => {
      const response = await fetch(`${baseUrl}listar_formularios_completados/${username}/`);
      if (response.ok) {
        const data = await response.json();
        console.log("Data: ", JSON.stringify(data));
        const completedIds = data.map((form: { formulario_id: number }) => form.formulario_id);
        setCompletedQuizzes(completedIds);
      }
    };

    cargarFormulariosCompletados();
  }, []); // Solo se ejecuta al renderizar el componente por primera vez

 

  

  useEffect(() => {
    const fetchPersObjEsc = async (escena_id: number) => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/get-persona-obj-esc/?username=${username}&objetivo_id=${objetivoId}&escena_id=${escena_id}`
        );       
        
        const data = await response.json();
        setPoe(data.id); 
        setFormData((prev) => ({ ...prev, persona_objetivo_escena: data.id }));
      } catch (error) {
        console.error('Error en fetchPersObjEsc:', error);
      }
    };

    const escenaActual = escena;
    if (escenaActual) {
      fetchPersObjEsc(escenaActual.id);
    }
  }, [escena, username]);

  useEffect(() => {
    const LoadData = async () => {
      try {
        // Fetch para obtener las escenas relacionadas al objetivo
        const response = await fetch(`http://localhost:8000/api/get-escenas-obj/?objetivo_id=${objetivoId}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener las escenas');
        }
        
        const data = await response.json();
        setEscenas(data);
        if (data.length > 0) {
          const primeraEscena = data[0];
          setEscena(primeraEscena);
          const e = primeraEscena.id;
          setFormData((prev) => ({ ...prev, escena: e }));
        }
  
        setVideos(data.map((escena: Escena) => escena.link));
  
        // Fetch para obtener las evaluaciones asociadas al objetivo y usuario
        const evaluacionesResponse = await fetch(`http://localhost:8000/api/get-evaluaciones/?username=${username}&objetivo_id=${objetivoId}`);
        
        if (!evaluacionesResponse.ok) {
          throw new Error('Error al obtener las evaluaciones');
        }
  
        const evaluacionesData = await evaluacionesResponse.json();
        setQuizzes(evaluacionesData); 
        console.log("Evaluaciones data: ", JSON.stringify(evaluacionesData));
  
      } catch (error) {
        console.error('Error en LoadData:', error);
      }
    };
  
    LoadData();
  }, [username, objetivoId]); // Elimina `escena` de las dependencias

  const handleVerSiguienteVideo = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const nextIndex = currentVideoIndex + 1;
  
      // Verifica si hay más videos para mostrar
      if (nextIndex >= escenas.length) {
        console.error('No hay más videos para mostrar');
        return;
      }
  
      // Actualiza el índice y la escena actual
      setCurrentVideoIndex(nextIndex);
      const siguienteEscena = escenas[nextIndex]; // Obtiene la siguiente escena
      setEscena(siguienteEscena);
  
      // Marca el video como visto solo después de que `poe` se haya actualizado
      if (poe) {
        marcarVideoComoVisto(poe);
      }
  
      // Actualiza el formData con la nueva escena
      setFormData((prev) => ({ ...prev, escena: siguienteEscena.id }));
  
    } catch (error) {
      console.error('Error en handleVerSiguienteVideo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerVideoAnterior = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const previousIndex = currentVideoIndex - 1;
  
      // Verifica si hay un video anterior
      if (previousIndex < 0) {
        console.error('No hay más videos para mostrar hacia atrás');
        return;
      }
  
      // Actualiza el índice y la escena actual
      setCurrentVideoIndex(previousIndex);
      const escenaAnterior = escenas[previousIndex]; // Obtiene la escena anterior
      setEscena(escenaAnterior);
  
      // Actualiza el formData con la nueva escena
      setFormData((prev) => ({ ...prev, escena: escenaAnterior.id }));
  
    } catch (error) {
      console.error('Error en handleVerVideoAnterior:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const marcarVideoComoVisto = async (personaObjetivoEscenaId: number) => {
    try {
      const response = await fetch('http://localhost:8000/api/video-visto/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ persona_objetivo_escena_id: personaObjetivoEscenaId }),
      });
  
      if (!response.ok) {
        throw new Error('Error al marcar el video como visto');
      }
    } catch (error) {
      console.error('Error al marcar el video como visto:', error);
    }
  };

  const handleVerListaObjetivos = () => {
    router.push('./ver_objetivos');
  };

  const handleQuizClick = (index: number) => {      
    router.push(`/interfaz_paciente/evaluacion/${index}`);      
    //setCompletedQuizzes((prev) => [...new Set([...prev, index])]);
  };

  const handleCompletarObjetivo = () => {
    marcarVideoComoVisto(poe);
    router.push('./principal');
  };

  const allQuizzesCompleted = completedQuizzes.length === (quizzes?.formularios?.length || 0);


  return (
    <div className="flex flex-col px-4 py-4 min-h-screen">
      {/* Contenedor principal */}
      <div className="flex flex-col lg:flex-row items-stretch">
        {/* Video */}
        <div className="mr-0 lg:mr-4 mb-4 lg:mb-0 relative w-full max-w-[854px]">
          <iframe
            src={videos[currentVideoIndex]}
            className="rounded-lg shadow-lg border-0 w-full h-full"
            allow="autoplay; fullscreen"
            style={{ aspectRatio: "16 / 9" }}
          ></iframe>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col items-center justify-center flex-grow h-full">
          <div className="flex flex-col justify-center flex-grow space-y-4 w-full max-w-sm">
            <button
              onClick={handleVerListaObjetivos}
              className="bg-blue-500 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all w-full"
            >
              Ver lista de objetivos
            </button>

            {currentVideoIndex < videos.length - 1 && (
              <button
                onClick={handleVerSiguienteVideo}
                disabled={isLoading} 
                className={`bg-green-500 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Cargando...' : 'Ver siguiente video'}
              </button>
              
            )}
            {currentVideoIndex > 0 && (
              <button
                onClick={handleVerVideoAnterior}
                disabled={isLoading}
                className={`bg-red-500 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Cargando...' : 'Ver video anterior'}
              </button>
            )}
          </div>
            {/* Quizzes */}
            {currentVideoIndex === videos.length - 1 && (
              <div className="flex flex-col items-center w-full max-w-sm bg-white border border-gray-300 rounded-lg shadow-md p-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quizzes Disponibles
                </h3>
                <div className="flex flex-col space-y-2 w-full">
                  {quizzes?.formularios && quizzes.formularios.map((quiz) => (
                    <div key={quiz.id} className="flex items-center w-full">
                      <button
                        onClick={() => handleQuizClick(quiz.id)}
                        disabled={completedQuizzes.includes(quiz.id)}
                        className={`bg-blue-500 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all flex-grow 
                          ${completedQuizzes.includes(quiz.id) ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                      >
                        {quiz.titulo}
                      </button>
                      {completedQuizzes.includes(quiz.id) && (
                        <span className="ml-2 text-green-500 font-semibold">
                          ✔
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {allQuizzesCompleted && (
                  <button
                    onClick={handleCompletarObjetivo}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all w-full mt-4"
                  >
                    Completar objetivo
                  </button>
                )}
              </div>
          )}
        </div>
      </div>
      {/* Comentarios */}
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Comentarios</h2>
        <Comentario/>
        <NuevoComentario
          formData={formData}
          setFormData={setFormData}
          onCommentAdded={() => setReloadComentarios(!reloadComentarios)} // Llama a esta función cuando se agrega un comentario
        />
      </div>
    </div>
  );
};

export default VerVideo;
