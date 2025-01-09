"use client";

import React, {useState}   from 'react'
const createAssesment: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [link, setLink]     = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     
    if(!nombre || !link) {
      alert("Todos los campos son obligatorios");
      return;
    }

    console.log({
      nombre,
      link
    });

    alert("Objetivo creado exitosamente");
    setNombre("");
    setLink("");

  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">
          Crear Evaluacion
        </h1>
      <form onSubmit={handleSubmit} className="">
        <div>
          <label htmlFor="titulo" className="block font-semibold text-gray-700 mb-2">
            Nombre Evaluacion
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
            placeholder="Ingrese el título"
          />
        </div>
        <div className='mt-4'>
          <label htmlFor="linkVideo" className="block  font-semibold text-gray-700 mb-2">
            Link al Forms
          </label>
          <input
            id="linkVideo"
            type="search"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
            placeholder="Ingrese el link"
          />
        </div>
      </form>
    </div>
    </div>

  )
}

export default createAssesment