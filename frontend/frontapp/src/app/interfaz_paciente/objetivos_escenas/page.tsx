"use client";

import { useState, useEffect } from "react";
import ScrollVerticalYHorizontal from "../../../components/ScrollVerticalYHorizontal";
import SearchBar from "../../../components/Buscador";

// VER CODIGO GPT O OBJETIVOS Y AGREGAR EL PAGINADO, PASAR ESA INFO AL COMPONENTE. LUEGO HACER EL FETCH DE LA ESCENA DADO UN OBJETIVO


interface Objetivo {
  id: number;
  titulo: string;
}

interface Escena {
  id: number;
  nombre: string;
  descripcion: string;
}

export default function Page() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [escenasActivas, setEscenasActivas] = useState<Escena[]>([]);
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_API_URL; // URL base de tu API
  const username = "paciente1"; // Reemplazar con el username real

  // Fetch de objetivos
  const fetchObjetivos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseURL}obtener_objetivos_usuario/?username=${username}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setObjetivos(data.results); // Suponiendo que `results` contiene la lista de objetivos
    } catch (err) {
      setError("Error al cargar los objetivos");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch de escenas para un objetivo seleccionado
  const fetchEscenas = async (objetivoId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseURL}obtener_escenas_por_objetivo/?objetivo_id=${objetivoId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setEscenasActivas(data.results); // Suponiendo que `results` contiene la lista de escenas
    } catch (err) {
      setError("Error al cargar las escenas");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObjetivos();
  }, []);

  const handleObjetivoClick = (objetivoId: number) => {
    setObjetivoSeleccionado(objetivoId);
    fetchEscenas(objetivoId);
  };

  return (
    <div className="flex h-screen p-4 gap-6">
      {error && (
        <div className="absolute top-0 right-0 m-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
          {error}
        </div>
      )}

      {/* Sección de Objetivos */}
      <div className="w-[30%]">
        <h2 className="text-xl font-bold mb-2">Objetivos</h2>
        <ScrollVerticalYHorizontal
          elementos={objetivos}
          onObjetivoClick={handleObjetivoClick}
          selectedObjetivoId={objetivoSeleccionado}
        />
      </div>

      {/* Separador vertical */}
      <div className="w-0.5 bg-gray-200"></div>

      {/* Sección de Escenas */}
      <div className="w-[45%]">
        <h2 className="text-xl font-bold mb-2">
          Escenas {objetivoSeleccionado && `- ${objetivos.find(obj => obj.id === objetivoSeleccionado)?.titulo}`}
        </h2>
        <div className="h-[calc(100vh-100px)] overflow-auto bg-gray-100 rounded-lg shadow p-4">
          {isLoading ? (
            <p>Cargando...</p>
          ) : (
            <ul className="space-y-4">
              {escenasActivas.map((escena) => (
                <li
                  key={escena.id}
                  className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">{escena.nombre}</h3>
                  <p className="text-gray-600">{escena.descripcion}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Separador vertical */}
      <div className="w-0.5 bg-gray-200"></div>

      {/* Sección de Buscador */}
      <div className="w-[25%]">
        <h2 className="text-xl font-bold mb-2">Buscador</h2>
        <div className="h-[calc(100vh-100px)]">
          <SearchBar onSearch={setQuery} placeholder="Buscar Objetivo" />
        </div>
      </div>
    </div>
  );
}
