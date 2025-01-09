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



const CreateObjetivo: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [idioma, setIdioma] = useState("");
  const [acento, setAcento] = useState("");
  const [complejidad, setComplejidad] = useState(0);
  const [edad, setEdad] = useState("");
  const [searchObjetivos, setSearchObjetivos] = useState("");
  const [objetivos, setObjetivos] = useState<SubObjetivo[]>([
    { id: 1, titulo: "Título Objetivo 1", seleccionado: false },
    { id: 2, titulo: "Título Objetivo 2", seleccionado: false },
    { id: 3, titulo: "Título Objetivo 3", seleccionado: false },
    { id: 4, titulo: "Título Objetivo 4", seleccionado: false },
    { id: 5, titulo: "Título Objetivo 4", seleccionado: false },

  ]);

  const [linkVideo, setLinkVideo] = useState("");

  const filteredObjetivosNecesarios = objetivos.filter(sub => 
    sub.titulo.toLowerCase().includes(searchObjetivos.toLowerCase())
  );

  const toggleObjetivos = (id: number) => {
    setObjetivos(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, seleccionado: !sub.seleccionado } : sub
      )
    );
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !idioma || !linkVideo || !acento || !complejidad ) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const objetivosSeleccionados = objetivos.filter(
      (sub) => sub.seleccionado
    );

    console.log({
      titulo,
      idioma,
      acento,
      complejidad,
      objetivosSeleccionados,
      linkVideo,
    });

    alert("Objetivo creado exitosamente");

    setTitulo("");
    setAcento("");
    setIdioma("");
    setComplejidad(0);
    setEdad("");
    setSearchObjetivos("");
    setObjetivos((prev) =>
      prev.map((sub) => ({ ...sub, seleccionado: false }))
    );
    setLinkVideo("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">
          Crear Escena
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
              <label htmlFor="idioma" className="block font-semibold text-gray-700 mb-2">
                Idioma
              </label>
              <input
                id="idioma"
                type="text"
                value={idioma}
                onChange={(e) => setIdioma(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese el Idioma"
              />
            </div>

            <div>
              <label htmlFor="acento" className="block font-semibold text-gray-700 mb-2">
                Acento
              </label>
              <input
                id="acento"
                type="text"
                value={acento}
                onChange={(e) => setAcento(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese el Acento"
              />
            </div>

            <div>
              <label htmlFor="complejidad" className="block font-semibold text-gray-700 mb-2">
                Complejidad
              </label>
              <input
                id="complejidad"
                type="number"
                value={complejidad}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value >= 0 && value <= 10) {
                    setComplejidad(value); // Solo actualiza si está en el rango
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese la Complejidad"
                min="0" // Establece el valor mínimo
                max="10" // Establece el valor máximo
                />
            </div>
            
            <div>
              <label htmlFor="edad" className="block font-semibold text-gray-700 mb-2">
                Edad Necesaria
              </label>
              <input
                id="edad"
                type="text"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese la Edad"
              />
            </div>
            
            <div>
              <label htmlFor="linkVideo" className="block font-semibold text-gray-700 mb-2">
                Link al Video Explicativo
              </label>
              <input
                id="linkVideo"
                type="search"
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
              title="Objetivos Necesarios"
              items={filteredObjetivosNecesarios}
              searchValue={searchObjetivos}
              onSearchChange={setSearchObjetivos}
              onToggleItem={toggleObjetivos}
              searchPlaceholder="Buscar Objetivos Necesarios..."
              getItemLabel={(item) => String(item.titulo)}
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