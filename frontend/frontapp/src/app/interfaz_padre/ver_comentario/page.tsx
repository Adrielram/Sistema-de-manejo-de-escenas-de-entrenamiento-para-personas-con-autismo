"use client";

import React from "react";
import Comentario from "../../../components/Comentario";
import {useSelector} from "react-redux";
import { RootState } from "../../../../store/store";

const ComentariosList = () => {
  const {userId} = useSelector((state: RootState) => state.user); // Obtén el userId del estado global
  const {objetivoId} = useSelector((state: RootState) => state.user);

  const username = "Mateo Romero"; // Simulación de datos

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Paciente {username} con userid: {userId}</h1>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Comentarios del objetivo: {objetivoId}</h1>
        <Comentario/> {/* Pasa los datos al componente Comentario */}
      </div>
    </div>
  );
};

export default ComentariosList;
