"use client";

import React, { useState } from "react";
import {create_objetivo} from '../../../../utils/api';
interface Objetivo {
  titulo: string;
  descripcion: string;
  escenaId: number;  // Esto se transformará a 'escena' en el backend
}

const CreateObjetivo: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [escenaId, setEscenaId] = useState("");

  
  const  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!titulo || !descripcion || !escenaId) {
      alert("Todos los campos son obligatorios");
      return;
    }
  
    const nuevoObjetivo: Objetivo = {
      titulo,
      descripcion,
      escenaId: Number(escenaId),
    };
  
    try {
        const response = await create_objetivo(nuevoObjetivo);

        if (response.success) {
            alert('Objetivo añadido exitosamente');
        } else {
            alert('No se pudo completar la operación.');
        }
    } catch (error) {
        console.error('Error en la solicitud:', error);
    }
    // Resetear formulario
    setTitulo("");
    setDescripcion("");
    setEscenaId("");
  };
  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-100 border-4 border-[#3EA5FF] rounded-lg shadow-2xl mt-20 ">
      <h1 className="text-3xl font-bold text-[#3EA5FF] mb-6 text-center  px-4 py-2 rounded">
      Crear Objetivo
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="titulo"
            className="block font-semibold text-gray-700 mb-2"
          >
            Título
          </label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
            placeholder="Ingrese el título"
          />
        </div>
        <div>
          <label
            htmlFor="descripcion"
            className="block font-semibold text-gray-700 mb-2"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
            placeholder="Ingrese la descripción"
          />
        </div>
        <div>
          <label
            htmlFor="escena"
            className="block font-semibold text-gray-700 mb-2"
          >
            Escena
          </label>
          <input
            id="escena"
            type="text"
            value={escenaId}
            onChange={(e) => setEscenaId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
            placeholder="Ingrese el ID de la escena"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#3EA5FF] text-white font-semibold py-3 rounded-lg hover:bg-[#2E8BFF] transition duration-300"
        >
          Crear Objetivo
        </button>
      </form>
    </div>
  );
  
};

export default CreateObjetivo;
