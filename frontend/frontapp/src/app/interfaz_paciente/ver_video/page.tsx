"use client";

import React, { useEffect, useState, useRef } from "react";
import { NuevoComentario } from "../../../components/NuevoComentario";
import ComentarioPaciente from "../../../components/ComentarioPaciente";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../store/store";
import { useDispatch } from "react-redux";
import { setIdEscena } from "../../../../slices/userSlice";

interface Escena {
  id: number;
  idioma: string;
  acento: string;
  condiciones: string | null;
  complejidad: number;
  link: string;
  nombre: string;
  descripcion: string;
}

const VerVideo = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [videos, setVideos] = useState<string[]>([]);
  const [quizzes, setQuizzes] = useState({ formularios: [] });
  const [quizStates, setQuizStates] = useState<Record<number, { revision: boolean; volver_a_realizar: boolean; tiene_respuestas: boolean }>>({});
  const [escenas, setEscenas] = useState<Escena[]>([]);
  const [escena, setEscena] = useState<Escena>();
  const [like, setLike] = useState<boolean | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>([]);
  const [comentariosHashSet, setComentariosHashSet] = useState<{
    [key: number]: number[];
  }>({}); 
  const [reloadComentarios, setReloadComentarios] = useState(false);
  const router = useRouter();
  const { username, idEscena, objetivoId } = useSelector((state: RootState) => state.user);
  const searchParams = useSearchParams();
  const completedFormId = searchParams.get('completedFormId');
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const nuevoComentarioRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    user: username, 
    escena: Number(idEscena),
    texto: '',
    visibilidad: true,
    comentario_respondido: 0,
    usuarioRespondido: '', 
  });

  //FORMULARIOS
  useEffect(() => {
    const verificarFormulario = async (formId: string) => {
      const response = await fetch(`${baseUrl}verificar_form_completado/${formId}/${username}/`,
        { credentials: 'include' }
      );
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
  }, [completedFormId, username]);

  useEffect(() => {
    const cargarFormulariosCompletados = async () => {
      const response = await fetch(`${baseUrl}listar_formularios_completados/${username}/`,
        { credentials: 'include' }
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Data: ", JSON.stringify(data));
        const completedIds = data.map((form: { formulario_id: number }) => form.formulario_id);
        setCompletedQuizzes(completedIds);
      }
    };
    cargarFormulariosCompletados();
  }, [username]); 
  
  useEffect(() => {
    const fetchQuizStates = async () => {
      const newQuizStates: Record<number, { revision: boolean; volver_a_realizar: boolean; tiene_respuestas: boolean }> = {};
      for (const quiz of quizzes.formularios) {
        try {
          const response = await fetch(`${baseUrl}obtener_estado_revision/?formulario_id=${quiz.id}&username=${username}`,
            { credentials: 'include' }
          );
          if (response.ok) {
            const data = await response.json();
            newQuizStates[quiz.id] = data;
          }
        } catch (error) {
          console.error("Error obteniendo estado de revisión:", error);
        }
      }
      setQuizStates(newQuizStates);
    };

    if (quizzes.formularios.length > 0) {
      fetchQuizStates();
    }
  }, [quizzes, username]);

  //COMENTARIOS
  const handleResponder = async (idComentario: number) => {
    try {
      const response = await fetch(
        `${baseUrl}comentarios/?idComentario=${idComentario}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          comentario_respondido: idComentario,
          usuarioRespondido: data.usuario, 
        }));

        if (nuevoComentarioRef.current) {
          nuevoComentarioRef.current.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error al obtener el usuario del comentario:", error);
    }
  };

  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const response = await fetch(
          `${baseUrl}comentarios/lista/?id_escena=${idEscena}`,
          { credentials: 'include' }
        );
        const data = await response.json();

        if (response.ok) {
          if (data && data.hashset && typeof data.hashset === 'object') {
            setComentariosHashSet(data.hashset);
          } else {
            console.error('Datos inesperados:', data);
            setComentariosHashSet({});
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
  }, [idEscena, reloadComentarios]);


  //FETCH DE VIDEOS Y EVALUACIONES
  useEffect(() => {
    const LoadData = async () => {
      try {
        if (objetivoId !== "") {  //CASO CUANDO HAY OBJETIVO
          // Fetch para obtener las escenas relacionadas al objetivo
          const response = await fetch(`${baseUrl}get-escenas-obj/?objetivo_id=${objetivoId}`,
            { credentials: 'include' }
          );
          
          if (!response.ok) {
            throw new Error('Error al obtener las escenas');
          }
          
          const data = await response.json();
          setEscenas(data);
    
          // Encuentra el índice de la escena actual en las escenas obtenidas
          const index = data.findIndex((escena: Escena) => escena.id === Number(idEscena));
    
          if (index !== -1) {
            setCurrentVideoIndex(index); 
            setEscena(data[index]); 
            setFormData((prev) => ({ ...prev, escena: data[index].id })); 
          } else {
            console.error('La escena actual no se encuentra en las escenas disponibles.');
          }
          setVideos(data.map((escena: Escena) => escena.link));
          
          // Fetch para obtener las evaluaciones asociadas al objetivo y usuario
          const evaluacionesResponse = await fetch(`${baseUrl}get-evaluaciones/?username=${username}&objetivo_id=${objetivoId}`,
            { credentials: 'include' }
          );
            
          if (!evaluacionesResponse.ok) {
            setQuizzes({ formularios: [] });
            throw new Error('Error al obtener las evaluaciones');
          }
      
          const evaluacionesData = await evaluacionesResponse.json();
          setQuizzes({ formularios: evaluacionesData.formularios }); 
        } 
        else {  //CASO CUANDO NO HAY OBJETIVO
          // Fetch para obtener la escena
          const escenaResponse = await fetch(`${baseUrl}get-escena/?escena_id=${idEscena}`,
            { credentials: 'include' }
          );
          if (!escenaResponse.ok) {
            throw new Error('Error al obtener la escena');
          }
          const escenaData = await escenaResponse.json();
          setVideos([escenaData.link]);
          setCurrentVideoIndex(0);
          setEscena(escenaData);
          setEscenas([escenaData]);
        }
      } catch (error) {
        console.error('Error en LoadData:', error);
      } finally {
        setLoading(false);
      }
    };
  
    LoadData();
  }, [username, objetivoId, idEscena]); 

  const handleVerSiguienteVideo = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const nextIndex = currentVideoIndex + 1;
      if (nextIndex >= escenas.length) {
        console.error('No hay más videos para mostrar');
        return;
      }

      marcarVideoComoVisto();
      setCurrentVideoIndex(nextIndex);
      const siguienteEscena = escenas[nextIndex];
      setEscena(siguienteEscena);
      dispatch(setIdEscena({idEscena: siguienteEscena.id}));
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
      if (previousIndex < 0) {
        console.error('No hay más videos para mostrar hacia atrás');
        return;
      }
  
      setCurrentVideoIndex(previousIndex);
      const escenaAnterior = escenas[previousIndex]; 
      setEscena(escenaAnterior);
      dispatch(setIdEscena({idEscena:escenaAnterior.id}));
      setFormData((prev) => ({ ...prev, escena: escenaAnterior.id }));
  
    } catch (error) {
      console.error('Error en handleVerVideoAnterior:', error);
    } finally {
      setIsLoading(false);
    }
  };
  

  if (loading) {
    return <p>Cargando...</p>;
  }

  const marcarVideoComoVisto = async () => {
    try {
      const response = await fetch(`${baseUrl}video-visto/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paciente_id: username, escena_id: escena.id, like: like ?? null }),
      });
  
      if (!response.ok) {
        throw new Error('Error al marcar el video como visto');
      }
    } catch (error) {
      console.error('Error al marcar el video como visto:', error);
    }
  };

  const handleVolver = () => {
    router.push('./principal');
  };

  const handleLike= () => {
    if (like === true){
      setLike(null);
    }else{
      setLike(true);
    }
  }

  const handleDislike = () => {
    if (like === false){
      setLike(null);
    }
    else{
      setLike(false); 
    }
  }

  const handleQuizClick = (index: number) => {      
    router.push(`/interfaz_paciente/evaluacion/${index}`);      
  };

  const handleQuizClickRevisar = (index: number) => {
    router.push(`/interfaz_paciente/evaluacion/${index}?ver_revision=true`);
  };

  const handleCompletarObjetivo = () => {
    marcarVideoComoVisto();
    // SOLO SI TODOS LOS QUIZZES ESTÁN COMPLETADOS
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
              onClick={handleVolver}
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
          <div className="flex space-x-4 items-center justify-center mt-4">
            <button
              onClick={handleLike}
              className={`rounded-lg px-4 py-2 shadow transition duration-300 ${
                like === true
                  ? 'bg-blue-700 text-white border-4 border-blue-900 scale-105'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              👍 {like === true ? 'Me gusta' : 'Me gusta'}
            </button>
            <button
              onClick={handleDislike}
              className={`rounded-lg px-4 py-2 shadow transition duration-300 ${
                like === false
                  ? 'bg-red-700 text-white border-4 border-red-900 scale-105'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              👎 {like === false ? 'No me gusta' : 'No me gusta'}
            </button>
          </div>
            {/* Quizzes */}
            {currentVideoIndex === videos.length - 1 && (
              <div className="flex flex-col items-center w-full max-w-sm bg-white border border-gray-300 rounded-lg shadow-md p-4 mt-4">
                  {quizzes?.formularios?.length > 0 && <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Quizzes Disponibles
                  </h3>}
                <div className="flex flex-col space-y-2 w-full">
                {quizzes?.formularios?.length > 0 && quizzes.formularios.map((quiz) => (
                    <div key={quiz.id} className="flex items-center w-full">
                      <button
                        onClick={() => handleQuizClick(quiz.id)}
                        className={`bg-blue-500 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all flex-grow `}
                      >
                        {quiz.nombre}
                      </button>
                      {completedQuizzes.includes(quiz.id) && (
                        <span className="ml-2 text-green-500 font-semibold">✔</span>
                      )}
                      <button
                        disabled={quizStates[quiz.id]?.revision || !quizStates[quiz.id]?.tiene_respuestas}
                        className={`ml-2 bg-yellow-500 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all 
                          ${quizStates[quiz.id]?.revision || !quizStates[quiz.id]?.tiene_respuestas ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-yellow-600'}`}
                        onClick={() => handleQuizClickRevisar(quiz.id)}
                      >
                        Ver Revisión
                      </button>
                    </div>
                  ))}
                </div>
                {completedQuizzes.length === quizzes.formularios.length && (
                  <button
                    onClick={() => handleCompletarObjetivo()}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all w-full mt-4"
                  >
                    Completar objetivo
                  </button>
                )}
              </div>
            )}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Comentarios</h3>
        <div>
          {/* Renderizado de comentarios */}
          {Object.keys(comentariosHashSet).map((principalId) => (
            <div key={principalId} className="mb-4">
              <ComentarioPaciente
                idComentario={parseInt(principalId)}
                respuestas={comentariosHashSet[parseInt(principalId)]}
                onResponder={handleResponder}
              />
            </div>
          ))}
        </div>
        {formData.comentario_respondido !== 0 && (
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <p>Respondiendo a @{formData.user}</p>
            <button
              onClick={() =>
                setFormData((prev) => ({ ...prev, comentario_respondido: 0 }))
              }
              className="ml-2 text-red-500 scale-150 hover:text-red-700 transition-colors"
            >
              &#x2716; 
            </button>
          </div>
        )}
        <div ref={nuevoComentarioRef}>
          <NuevoComentario
            formData={formData}
            setFormData={setFormData}
            onCommentAdded={() => setReloadComentarios(!reloadComentarios)} 
          />
        </div>
    </div>
  );
};

export default VerVideo;