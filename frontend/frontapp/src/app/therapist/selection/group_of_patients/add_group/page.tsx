"use client";
import { RootState } from '../../../../../../store/store';
import { create_group } from '../../../../../utils/api'; // Asegúrate de importar correctamente la función
import { useSelector } from 'react-redux';
import React, { useState } from "react";



const CreateGroup: React.FC = () => {
  const { center } = useSelector((state: RootState) => state.user);
  const [nombre_grupo, setNombreGrupo] = useState("");


  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!nombre_grupo) {
      alert("Todos los campos son obligatorios");
      return;
  }

  // Crear un objeto con los datos
  const nuevoGrupo = {
    nombre_grupo: nombre_grupo,
    nombre_centro: center
  };

  try {
      // Llamar a la función de creación
      const result = await create_group(nuevoGrupo);

      if (result.success) {
          alert("Escena creada exitosamente");
          
          // Resetear los campos
          setNombreGrupo("");
      } else {
          alert(`Error al crear el grupo: ${result.error}`);
      }
  } catch (error) {
      console.error("Error al crear el grupo:", error);
      alert("Ocurrió un error inesperado");
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">
          Crear Grupo
        </h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8" >
        {/* Columna izquierda */}
          <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-blue-100">
            <div>
              <label htmlFor="titulo" className="block font-semibold text-gray-700 mb-2">
                Nombre Grupo
              </label>
              <input
                id="titulo"
                type="text"
                value={nombre_grupo}
                onChange={(e) => setNombreGrupo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese el título"
              />
            </div>

          </div>

          {/* Botón de submit a pantalla completa */}
          <div className="lg:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full bg-[#3EA5FF] text-white font-semibold py-4 rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
            >
              Crear Grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;