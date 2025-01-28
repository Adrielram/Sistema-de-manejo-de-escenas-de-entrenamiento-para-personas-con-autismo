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
  const [like, setLike] = useState<boolean | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>([]);
  const { username } = useSelector((state: RootState) => state.user);
  const [comentariosHashSet, setComentariosHashSet] = useState<{
    [key: number]: number[];
  }>({}); // HashSet con comentarios principales y sus respuestas
  const [reloadComentarios, setReloadComentarios] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { idEscena, objetivoId } = useSelector((state: RootState) => state.user);
  const searchParams = useSearchParams();
  const completedFormId = searchParams.get('completedFormId');
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    user: username, 
    escena: Number(idEscena),
    texto: '',
    visibilidad: true,
    comentario_respondido: 0,
    usuarioRespondido: '', // Nuevo campo para guardar el nombre del usuario respondido

  });

  const nuevoComentarioRef = useRef<HTMLDivElement>(null); // Referencia al componente NuevoComentario

  const handleResponder = async (idComentario: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/comentarios/?idComentario=${idComentario}`
      );
      const data = await response.json();
      if (response.ok) {
        setFormData((prev) => ({
          ...prev,
          comentario_respondido: idComentario,
          usuarioRespondido: data.usuario, // Asigna el nombre del usuario respondido
        }));

        // Scroll al fondo de la página
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
    const verificarFormulario = async (formId: string) => {
      const response = await fetch(`http://localhost:8000/api/verificar_form_completado/${formId}/${username}/`);
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
      const response = await fetch(`http://localhost:8000/api/listar_formularios_completados/${username}/`);
      if (response.ok) {
        const data = await response.json();
        console.log("Data: ", JSON.stringify(data));
        const completedIds = data.map((form: { formulario_id: number }) => form.formulario_id);
        setCompletedQuizzes(completedIds);
      }
    };

    cargarFormulariosCompletados();
  }, [username]); // Solo se ejecuta al renderizar el componente por primera vez



  useEffect(() => {
    // Fetch para obtener el HashSet de comentarios
    const fetchComentarios = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/comentarios/lista/?id_escena=${idEscena}`
        );
        const data = await response.json();

        if (response.ok) {
          // Access the nested hashset data
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
  
        // Encuentra el índice de la escena actual en las escenas obtenidas
        const index = data.findIndex((escena: Escena) => escena.id === Number(idEscena));
  
        if (index !== -1) {
          setCurrentVideoIndex(index); // Actualiza currentVideoIndex
          setEscena(data[index]); // Establece la escena actual
          setFormData((prev) => ({ ...prev, escena: data[index].id })); // Actualiza el formData
        } else {
          console.error('La escena actual no se encuentra en las escenas disponibles.');
        }
  
        // Actualiza la lista de videos con los enlaces de las escenas
        setVideos(data.map((escena: Escena) => escena.link));
  
        // Fetch para obtener las evaluaciones asociadas al objetivo y usuario
        const evaluacionesResponse = await fetch(`http://localhost:8000/api/get-evaluaciones/?username=${username}&objetivo_id=${objetivoId}`);
        
        if (!evaluacionesResponse.ok) {
          setQuizzes({ formularios: [] });
          throw new Error('Error al obtener las evaluaciones');
        }
  
        const evaluacionesData = await evaluacionesResponse.json();
        setQuizzes({ formularios: evaluacionesData.formularios }); 
      } catch (error) {
        console.error('Error en LoadData:', error);
      }
    };
  
    LoadData();
  }, [username, objetivoId, idEscena]); 

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
      //marcar video como visto
      marcarVideoComoVisto();
      // Actualiza el índice y la escena actual
      setCurrentVideoIndex(nextIndex);
      const siguienteEscena = escenas[nextIndex]; // Obtiene la siguiente escena
      setEscena(siguienteEscena);
      dispatch(setIdEscena({idEscena: siguienteEscena.id}));
  
  
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
      dispatch(setIdEscena({idEscena:escenaAnterior.id}));

      // Actualiza el formData con la nueva escena
      setFormData((prev) => ({ ...prev, escena: escenaAnterior.id }));
  
    } catch (error) {
      console.error('Error en handleVerVideoAnterior:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const marcarVideoComoVisto = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/video-visto/', {
        method: 'POST',
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

  const handleVerListaObjetivos = () => {
    router.push('./objetivos');
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

  const handleCompletarObjetivo = () => {
    marcarVideoComoVisto();
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quizzes Disponibles
                </h3>
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
              className="ml-2 text-red-500 hover:text-red-700 transition-colors"
            >
              &#x2716; {/* Código Unicode para la cruz roja */}
            </button>
          </div>
        )}
        <div ref={nuevoComentarioRef}>
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