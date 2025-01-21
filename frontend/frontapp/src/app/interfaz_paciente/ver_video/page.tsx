"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ComentarioPaciente from "../../../components/ComentarioPaciente";

const VerVideo = () => {
  const videos = [
    "https://drive.google.com/file/d/17RTqxuu9WPX5Nwvs1h3s7wuQh5ldDDTz/preview", // Hide and seek
    "https://drive.google.com/file/d/1qzY31odKmd2FlrjU0VK4dkfezlzEcoaJ/preview", // Futgame
    "https://drive.google.com/file/d/1yPgHYRagTJXTqlrGhNkZDEy5zNY4-f77/preview", // Cartpole
  ];

  const quiz = [
    "https://docs.google.com/forms/d/e/1FAIpQLSfx8STfx-3if-hoIpA2f4mB-_ewwMSLRpbgXVaS_23TLYsJyw/viewform?usp=header", // Quiz 1
    "https://docs.google.com/forms/d/e/1FAIpQLSfrNgiBZhBCQ5zpgVTD8c9AqDS3nLubktTxRdvxzi83_Jrq3g/viewform?usp=header", // Quiz 2
  ];

  const [formData, setFormData] = useState({
    escena_id: "1", // Cambiar por el ID de la escena actual
    personaobjetivo_user_id: "1", // Cambiar por el ID del usuario actual
    personaobjetivo_objetivo_id: "1", // Cambiar por el ID del objetivo actual
    texto: "",
  });

  const router = useRouter();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState<number[]>([]);
  const [comentariosHashSet, setComentariosHashSet] = useState<{
    [key: number]: number[];
  }>({}); // HashSet con comentarios principales y sus respuestas

  const idPersona = 1; // Supongamos que es el ID de la persona actual
  const idObjetivo = 1; // ID del objetivo
  const idEscena = 9; // ID de la escena

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
  }, [idPersona, idObjetivo, idEscena]);

  const handleVerSiguienteVideo = () => {
    setCurrentVideoIndex((prevIndex) => prevIndex + 1);
  };

  const handleVerListaObjetivos = () => {
    window.alert("Esto lo codea el adriel");
    //router.push('../interfaz_paciente/ver_objetivos');
  };

  const handleQuizClick = (index: number) => {
    window.open(quiz[index], "_blank");
    setCompletedQuizzes((prev) => [...new Set([...prev, index])]);
  };

  const handleCompletarObjetivo = () => {
    router.push("../interfaz_paciente/principal");
  };

  const handleAddComment = async () => {
    if (formData.texto.trim() !== "") {
      try {
        const response = await fetch(
          "http://localhost:8000/api/registrar_comentario/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Error al guardar el comentario");
        }
        setFormData((prev) => ({ ...prev, texto: "" }));
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const allQuizzesCompleted = completedQuizzes.length === quiz.length;

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
                {quiz.map((quizLink, index) => (
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

      
      <div>
        <h1>Comentarios</h1>
        {/* Renderizado de comentarios */}
        {Object.keys(comentariosHashSet).map((principalId) => (
          <div key={principalId} className="mb-4">
            <ComentarioPaciente
              idComentario={parseInt(principalId)}
              respuestas={comentariosHashSet[parseInt(principalId)]}
            />
          </div>
        ))}
      </div>
      
      {/* Añadir comentario */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Añadir un comentario
        </h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={formData.texto}
            onChange={(e) =>
              setFormData({ ...formData, texto: e.target.value })
            }
            placeholder="Escribe tu comentario..."
            className="border border-gray-300 rounded-lg py-2 px-4 w-full"
          />
          <button
            onClick={handleAddComment}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm shadow-sm hover:shadow-md transition-all"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerVideo;
