"use client";

import React, { useState } from "react";
import SearchSelectBox from "../../../../components/SearchSelectBox";

interface Item {
  id: number;
  seleccionado: boolean;
}

interface SubObjetivo extends Item {
  titulo: string;
  [key: string]: string | number | boolean; // Índice flexible heredado
}

interface Escena extends Item {
  nombre: string;
  [key: string]: string | number | boolean; // Índice flexible heredado
}

const CreateObjetivo: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [searchSubObjetivos, setSearchSubObjetivos] = useState("");
  const [searchEscenas, setSearchEscenas] = useState("");
  const [subObjetivos, setSubObjetivos] = useState<SubObjetivo[]>([
    { id: 1, titulo: "Título Sub-Objetivo 1", seleccionado: false },
    { id: 2, titulo: "Título Sub-Objetivo 2", seleccionado: false },
    { id: 3, titulo: "Título Sub-Objetivo 3", seleccionado: false },
    { id: 4, titulo: "Título Sub-Objetivo 4", seleccionado: false },
    { id: 5, titulo: "Título Sub-Objetivo 4", seleccionado: false },

  ]);
  const [escenas, setEscenas] = useState<Escena[]>([
    { id: 1, nombre: "Nombre Escena 1", seleccionado: false },
    { id: 2, nombre: "Nombre Escena 2", seleccionado: false },
    { id: 3, nombre: "Nombre Escena 3", seleccionado: false },
    { id: 4, nombre: "Nombre Escena 4", seleccionado: false },
  ]);
  const [linkVideo, setLinkVideo] = useState("");

  const filteredSubObjetivos = subObjetivos.filter(sub => 
    sub.titulo.toLowerCase().includes(searchSubObjetivos.toLowerCase())
  );

  const filteredEscenas = escenas.filter(escena => 
    escena.nombre.toLowerCase().includes(searchEscenas.toLowerCase())
  );

  const toggleSubObjetivo = (id: number) => {
    setSubObjetivos(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, seleccionado: !sub.seleccionado } : sub
      )
    );
  };

  const toggleEscena = (id: number) => {
    setEscenas(prev =>
      prev.map(escena =>
        escena.id === id ? { ...escena, seleccionado: !escena.seleccionado } : escena
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !descripcion || !linkVideo) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const subObjetivosSeleccionados = subObjetivos.filter(
      (sub) => sub.seleccionado
    );
    const escenasSeleccionadas = escenas.filter((escena) => escena.seleccionado);

    console.log({
      titulo,
      descripcion,
      subObjetivosSeleccionados,
      escenasSeleccionadas,
      linkVideo,
    });

    alert("Objetivo creado exitosamente");

    setTitulo("");
    setDescripcion("");
    setSubObjetivos((prev) =>
      prev.map((sub) => ({ ...sub, seleccionado: false }))
    );
    setEscenas((prev) => prev.map((escena) => ({ ...escena, seleccionado: false })));
    setLinkVideo("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">
          Crear Objetivo
        </h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1  lg:grid-cols-2 gap-8" >
        {/* Columna izquierda */}
          <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-blue-100">
            <div>
              <label htmlFor="titulo" className="block font-semibold text-gray-700 mb-2">
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
              <label htmlFor="descripcion" className="block font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF] min-h-[200px]"
                placeholder="Ingrese la descripción"
              />
            </div>
            
            <div>
              <label htmlFor="linkVideo" className="block font-semibold text-gray-700 mb-2">
                Link al Video Explicativo
              </label>
              <input
                id="linkVideo"
                type="text"
                value={linkVideo}
                onChange={(e) => setLinkVideo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese el link"
              />
            </div>
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            <SearchSelectBox
              title="Sub-Objetivos"
              items={filteredSubObjetivos}
              searchValue={searchSubObjetivos}
              onSearchChange={setSearchSubObjetivos}
              onToggleItem={toggleSubObjetivo}
              searchPlaceholder="Buscar sub-objetivos..."
              getItemLabel={(item) => String(item.titulo)}
            />

            <SearchSelectBox
              title="Escenas"
              items={filteredEscenas}
              searchValue={searchEscenas}
              onSearchChange={setSearchEscenas}
              onToggleItem={toggleEscena}
              searchPlaceholder="Buscar escenas..."
              getItemLabel={(item) => String(item.nombre)}
            />
          </div>

          {/* Botón de submit a pantalla completa */}
          <div className="lg:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full bg-[#3EA5FF] text-white font-semibold py-4 rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
            >
              Crear Objetivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateObjetivo;