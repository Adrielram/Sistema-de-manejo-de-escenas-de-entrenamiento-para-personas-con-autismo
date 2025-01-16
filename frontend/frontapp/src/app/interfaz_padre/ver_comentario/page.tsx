"use client";

import React, { useEffect, useState } from "react";
import Comentario from "../../../components/Comentario";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

const ComentariosList = () => {
  const { userId } = useSelector((state: RootState) => state.user); 
  const { objetivoId } = useSelector((state: RootState) => state.user);
  
  const [ userName, setUserName] = useState<string | null>(null); 
  const [loading, setLoading] = useState<boolean>(true); 

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/get-name/?dni=${userId}`);
        if (!response.ok) {
          throw new Error("Error al obtener el nombre de usuario");
        }
        const data = await response.json();
        setUserName(data.nombre); 
      } catch (error) {
        console.error("Error:", error);
        setUserName("No disponible"); 
      } finally {
        setLoading(false); 
      }
    };

    fetchUsername();
  }, [userId]); 

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {loading ? ( 
          <h1 className="text-xl text-gray-800">Cargando...</h1>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Paciente: {userName}</h1>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Comentarios del objetivo: {objetivoId}</h1>
            <Comentario/> {/* Pasa los datos al componente Comentario */}
          </>
        )}
      </div>
    </div>
  );
};

export default ComentariosList;
