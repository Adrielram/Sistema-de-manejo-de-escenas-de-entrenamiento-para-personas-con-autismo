"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "../../../components/Buscador";
import Box from "../../../components/Box";

const Page = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Estados
  const [terapeutas, setTerapeutas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // Función para obtener pacientes
  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}terapeutas/?nombre=${query}&page=${page}`, { credentials: 'include' }
      );
      const data = await response.json();
      setTerapeutas(data.results || []); // Asegurarse de que results exista
      setNextPage(data.next);
      setPrevPage(data.previous);
    } catch (error) {
      console.error("Error fetching pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar pacientes cuando cambian query o página
  useEffect(() => {
    fetchPacientes();
  }, [query, page]);

  // Manejo de búsqueda
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1); // Reinicia a la primera página con cada nueva búsqueda
  };

  // Manejo de cambio de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="p-5 bg-gray-100 min-h-screen">
      {/* Barra de búsqueda */}
      <SearchBar onSearch={handleSearch} />

      {/* Indicador de carga */}
      {loading && <p className="text-center text-gray-500">Cargando...</p>}

      {/* Resultados de pacientes */}
      {!loading && terapeutas.length === 0 && (
        <p className="text-center text-gray-500">No se encontraron terapeutas.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {terapeutas.map((terapeuta) => (
          <Box
            key={terapeuta.dni}
            elem={terapeuta}
            opciones={{
              personalInfo: true,
              buttonVer: false,
              buttonEdit: false,
              buttonSeguimiento: false,
              buttonComments: false,
              trashBin: true,
            }}
            img="/icon/persona_silueta.png"
          />
        ))}
      </div>      

      {/* Paginación */}
      <div className="flex justify-center items-center mt-5">
        <button
          className={`px-4 py-2 border ${
            prevPage ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
          } rounded-lg`}
          onClick={() => handlePageChange(page - 1)}
          disabled={!prevPage}
        >
          Anterior
        </button>
        <span className="px-4">{page}</span>
        <button
          className={`px-4 py-2 border ${
            nextPage ? "bg-blue-500 text-white" : "bg-gray-300 text-gray-500"
          } rounded-lg`}
          onClick={() => handlePageChange(page + 1)}
          disabled={!nextPage}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Page;
