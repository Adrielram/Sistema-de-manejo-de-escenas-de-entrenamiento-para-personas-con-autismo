"use client";

import React, { useState } from "react";
import Comentario from "../../../components/Comentario";
import { useRouter } from "next/navigation";
const Page = () => {
  const videos = [
    "https://drive.google.com/file/d/17RTqxuu9WPX5Nwvs1h3s7wuQh5ldDDTz/preview", // Hide and seek
    "https://drive.google.com/file/d/1qzY31odKmd2FlrjU0VK4dkfezlzEcoaJ/preview", // Futgame
    "https://drive.google.com/file/d/1yPgHYRagTJXTqlrGhNkZDEy5zNY4-f77/preview", // Cartpole
  ];

  const quiz = [
    "https://docs.google.com/forms/d/e/1FAIpQLSfx8STfx-3if-hoIpA2f4mB-_ewwMSLRpbgXVaS_23TLYsJyw/viewform?usp=header", // Quiz 1
    "https://docs.google.com/forms/d/e/1FAIpQLSfrNgiBZhBCQ5zpgVTD8c9AqDS3nLubktTxRdvxzi83_Jrq3g/viewform?usp=header", // Quiz 2
  ];

  const router = useRouter();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  //const [comments, setComments] = useState([]); // Estado para almacenar comentarios
  const [newComment, setNewComment] = useState(""); // Estado para el input del nuevo comentario

  const handleVerSiguienteVideo = () => {
    setCurrentVideoIndex((prevIndex) => prevIndex + 1);
  };

  const handleVerListaObjetivos = () => {
    window.alert("Esto lo codea el adriel");
  };

  const handleQuizClick = (index) => {
    window.open(quiz[index], "_blank");
    setCompletedQuizzes((prev) => [...new Set([...prev, index])]);
  };

  const handleCompletarObjetivo = () => {
    router.push('../interfaz_paciente/principal');
  };

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      //setComments((prev) => [...prev, newComment]);
      //lamar a funcion del backend para guardar el comentario
      setNewComment(""); // Limpiar el input después de añadir el comentario
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

      {/* Añadir comentario */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Añadir un comentario
        </h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
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

      {/* Lista de comentarios */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Comentarios</h3>
        <Comentario />
      </div>
    </div>
  );
};

export default Page;
