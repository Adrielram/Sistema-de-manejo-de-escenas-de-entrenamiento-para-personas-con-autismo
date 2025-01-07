"use client";

import React, { useState } from "react";
import {create_objetivo} from '../../utils/api';
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
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Objetivo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="titulo" className="block font-medium mb-1 text-black">
            Título
          </label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Ingrese el título"
          />
        </div>
        <div>
          <label htmlFor="descripcion" className="block font-medium mb-1">
            Descripción
          </label>
          <input
            id="descripcion"
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Ingrese la descripción"
          />
        </div>
        <div>
          <label htmlFor="escena" className="block font-medium mb-1">
            Escena
          </label>
          <input
            id="Escena Id"
            type="text"
            value={escenaId}
            onChange={(e) => setEscenaId(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Ingrese el Id escena"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Crear Objetivo
        </button>
      </form>
    </div>
  );
};

export default CreateObjetivo;
