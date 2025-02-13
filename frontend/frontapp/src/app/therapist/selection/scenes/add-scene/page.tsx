"use client";
import { create_scene } from '../../../../../utils/api';
import React, { useState, useEffect } from "react";
import GenericDropdown from "../../../../../components/SearchableDropDown";

// Define interfaces for our data structures
interface Objetivo {
  id: number;
  nombre: string;
}

interface CondicionFields {
  edad?: number;
  objetivo_id?: number;
  fecha?: string;
}


interface NuevaEscena {
  nombre: string;
  descripcion: string;
  idioma: string;
  acento: string;
  condicionFields: CondicionFields | null;
  complejidad: number;
  link: string;
}


const CreateScene: React.FC = () => {
  const [titulo, setTitulo] = useState("");
  const [idioma, setIdioma] = useState("");
  const [acento, setAcento] = useState("");
  const [complejidad, setComplejidad] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [linkVideo, setLinkVideo] = useState("");

  // Estados para condiciones
  const [mostrarCondicion, setMostrarCondicion] = useState(false);
  const [edad, setEdad] = useState<number | "">("");
  const [objetivo, setObjetivo] = useState<number | null>(null);
  const [fecha, setFecha] = useState("");
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dropdownTitle, setDropdownTitle] = useState("Seleccione un objetivo");
  
  useEffect(() => {
    const fetchObjetivos = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/objetivos-list/");
        const data = await response.json();
        const objetivosArray = data.results || [];
        setObjetivos(objetivosArray);
      } catch (error) {
        console.error("Error al obtener los objetivos:", error);
        setObjetivos([]);
      }
    };
    fetchObjetivos();
  }, []);

  const validateForm = (): string | null => {
    const requiredFields: Record<string, string | number> = {
      titulo,
      idioma,
      linkVideo,
      acento,
      complejidad
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value || (key === 'complejidad' && value === 0))
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      return `Por favor complete los siguientes campos: ${emptyFields.join(', ')}`;
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Crear el objeto condicionFields aquí mismo, sin usar setState
      let condicionFields: CondicionFields | null = null;
      
      if (mostrarCondicion) {
        condicionFields = {};
        
        if (edad !== "") {
          condicionFields.edad = Number(edad);
        }
        
        if (objetivo !== null) {
          condicionFields.objetivo_id = objetivo;
        }
        
        if (fecha) {
          condicionFields.fecha = fecha;
        }
        
        // Si no hay ningún campo con valor, establecer como null
        if (Object.keys(condicionFields).length === 0) {
          condicionFields = null;
        }
      }
      
      const nuevaEscena: NuevaEscena = {
        nombre: titulo,
        descripcion,
        idioma,
        acento,
        condicionFields, // Usar directamente el objeto creado
        complejidad,
        link: linkVideo,
      };

      
      const result = await create_scene(nuevaEscena);
      
      if (result.success) {
        alert("Escena creada exitosamente");
        // Reset form fields
        setTitulo("");
        setAcento("");
        setIdioma("");
        setDescripcion("");
        setComplejidad(0);
        setLinkVideo("");
        setEdad("");
        setObjetivo(null);
        setFecha("");
        setMostrarCondicion(false);
        setDropdownTitle("Seleccione un objetivo");
      } else {
        alert(`Error al crear la escena: ${result.error}`);
      }
    } catch (error) {
      console.error("Error al crear la escena:", error);
      alert(`Ocurrió un error: ${error instanceof Error ? error.message : 'Error inesperado'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleObjetivoSelect = (item: { id: number; name?: string; nombre?: string }) => {
    try {
      const id = item.id;
      const nombre = item.name || item.nombre;
      
      if (id && nombre) {
        setObjetivo(id);
        setDropdownTitle(nombre);
      } else {
        setObjetivo(null);
        setDropdownTitle("Seleccione un objetivo");
      }
    } catch (error) {
      console.error("Error al seleccionar objetivo:", error);
      setObjetivo(null);
      setDropdownTitle("Seleccione un objetivo");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">Crear Escena</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
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
                    setComplejidad(value);
                  }
                }}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese la Complejidad"
                min="0"
                max="10"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Condiciones</label>
              <button
                type="button"
                className="bg-blue-500 text-white p-2 rounded-lg"
                onClick={() => setMostrarCondicion(!mostrarCondicion)}
              >
                {mostrarCondicion ? "Ocultar" : "Agregar Condición"}
              </button>

              {mostrarCondicion && (
                <div className="mt-4 space-y-4 p-4 border border-gray-300 rounded-lg">
                  <div>
                    <label className="block text-gray-700">Edad</label>
                    <input
                      type="number"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value ? parseInt(e.target.value) : "")}
                      className="w-full border p-2 rounded-lg"
                      placeholder="Ingrese la edad"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">Objetivo</label>
                    {objetivos?.length > 0 ? (
                      <div 
                        className="relative w-full" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <GenericDropdown
                          title={dropdownTitle}
                          items={objetivos.map((obj) => ({ 
                            id: obj.id,
                            name: obj.nombre, // Asegurarnos de usar nombre consistentemente
                          }))}
                          onSelect={handleObjetivoSelect}
                          placeholder="Seleccione un objetivo"
                          maxHeight="200px"
                          valueKey="id"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No hay objetivos disponibles.</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-700">Fecha</label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      className="w-full border p-2 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
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
          <button 
            type="submit" 
            className="w-full bg-[#3EA5FF] text-white font-semibold py-4 rounded-xl hover:bg-[#2E8BFF]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creando..." : "Crear Escena"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateScene;