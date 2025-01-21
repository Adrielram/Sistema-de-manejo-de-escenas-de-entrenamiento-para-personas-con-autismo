"use client";

import React, { useEffect, useState } from "react";
import Comentario from "../../../components/Comentario";
import { NuevoComentario } from "../../../components/NuevoComentario";
import { useRouter } from "next/navigation";
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
  const [quizzes, setQuizzes] = useState<string[]>([]);
  const [escenas, setEscenas] = useState<Escena[]>([]);
  const [poe, setPoe] = useState<string>();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>([]);
  const [index ,setIndex ] = useState<number>();
  const { username } = useSelector((state: RootState) => state.user);
  //const { objetivoId } = useSelector((state: RootState) => state.user)
  const objetivoId = 3;
  const router = useRouter();

  const [formData, setFormData] = useState({
    user: username, 
    escena: '',
    texto: '',
    visibilidad: true,
    comentario_respondido: null,
  });

  useEffect(() => {
    const fetchPersObjEsc = async (escena_id) => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/get-persona-obj-esc/?username=${username}&objetivo_id=${objetivoId}&escena_id=${escena_id}`
        );
        
        if (!response.ok) {
          throw new Error('Error al obtener el id');
        }
        
        const data = await response.json();
        setPoe(data.id); 
        setFormData((prev) => ({ ...prev, persona_objetivo_escena: data.id }));
      } catch (error) {
        console.error('Error en fetchPersObjEsc:', error);
      }
    };

    if (escenas.length > 0 && index >= 0 && index < escenas.length) {
      const escenaActual = escenas[index];
      if (escenaActual) {
        fetchPersObjEsc(escenaActual.id);
      }
    }
  }, [username,escenas, index]);



  useEffect(() => {
    const LoadData = async () => {
      setIndex(1);
      try {
        // Fetch para obtener las escenas relacionadas al objetivo
        const response = await fetch(`http://localhost:8000/api/get-escenas-obj/?objetivo_id=${objetivoId}`);
        
        if (!response.ok) {
          throw new Error('Error al obtener las escenas');
        }
        
        const data = await response.json();
        setEscenas(data);
        setFormData((prev) => ({ ...prev, escena: data[0].id }));
        // Obtener los links de las escenas
        const videos = data.map((escena) => escena.link);
        setVideos(videos);
  
        // Fetch para obtener las evaluaciones asociadas al objetivo y usuario
        const evaluacionesResponse = await fetch(`http://localhost:8000/api/get-evaluaciones/?username=${username}&objetivo_id=${objetivoId}`);
        
        if (!evaluacionesResponse.ok) {
          throw new Error('Error al obtener las evaluaciones');
        }
  
        const evaluacionesData = await evaluacionesResponse.json();
        const evaluacionLinks = evaluacionesData.links; 
        setQuizzes(evaluacionLinks);

  
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
    // Ejecutar la función
    LoadData();
  }, [username, objetivoId]);

  const handleVerSiguienteVideo = async () => {
    try {
      if (currentVideoIndex + 1 >= escenas.length) {
        console.error('No hay más videos para mostrar');
        return;
      }
  
      // Incrementar el índice del video actual
      setCurrentVideoIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        setIndex(nextIndex);
        marcarVideoComoVisto(poe[0]);
        const escena = escenas[nextIndex].id.toString();
        setFormData((prev) => ({ ...prev, escena })); 
        return nextIndex; 
      });
    } catch (error) {
      console.error('Error en handleVerSiguienteVideo:', error);
    }
  };
  

  const marcarVideoComoVisto = async (personaObjetivoEscenaId) => {
    try {
      const response = await fetch('http://localhost:8000/api/video-visto/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona_objetivo_escena_id: personaObjetivoEscenaId, 
        }),
      });
  
      if (!response.ok) {
        throw new Error('Error al marcar el video como visto');
      }
  
      const data = await response.json();
      console.log(data.message); // Mensaje de éxito
    } catch (error) {
      console.error('Error al marcar el video como visto:', error);
    }
  };

  const handleVerListaObjetivos = () => {
    router.push('./ver_objetivos');
  };

  const handleQuizClick = (index: number) => {
    window.open(quizzes[index], "_blank");
    setCompletedQuizzes((prev) => [...new Set([...prev, index])]);
  };

  const handleCompletarObjetivo = () => {
    
    router.push('./principal');
  };


  const allQuizzesCompleted = completedQuizzes.length === quizzes.length;

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
                className="bg-green-500 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all w-full"
              >
                Ver siguiente video
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
                {quizzes.map((quizLink, index) => (
                  <div key={index} className="flex items-center w-full">
                    <button
                      onClick={() => handleQuizClick(index)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all flex-grow"
                    >
                      Quiz {index + 1}
                    </button>
                    {completedQuizzes.includes(index) && (
                      <span className="ml-2 text-green-500 font-semibold">
                        ✔
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Botón "Completar objetivo" */}
              {allQuizzesCompleted && (
                <button
                  onClick={handleCompletarObjetivo}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all mt-4 w-full"
                >
                  Completar objetivo
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <h1>{poe}</h1>
      <NuevoComentario formData={formData} setFormData={setFormData} />
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Comentarios</h3>
        <Comentario />
      </div>
    </div>
  );
};

export default VerVideo;