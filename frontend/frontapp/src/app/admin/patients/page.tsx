"use client";
import React, { useState, useEffect } from "react";
import SearchBar from "../../../components/Buscador";
import Box from "../../../components/Box";

const PacientesPage = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const fetchPacientes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${baseUrl}pacientes/?nombre=${query}&page=${page}`
      );
      const data = await response.json();
      console.log("Data:", data);
      setPacientes(data.results);
      console.log("Pacientes:", data.results);
      setNextPage(data.next);
      setPrevPage(data.previous);
    } catch (error) {
      console.error("Error fetching pacientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, [query, page]);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    setPage(1); // Reiniciar a la primera página cuando cambia la búsqueda
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (    
    <div>
      <SearchBar onSearch={handleSearch} />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-1 p-1 sm:p-2 bg-white mt-5">
          {pacientes.map((paciente) => (
            <div key={paciente.dni} className="flex flex-col items-center justify-center w-full">
              <Box
                elem={paciente}
                opciones={{
                  personalInfo: true,
                  buttonVer: false,
                  buttonEdit: false,
                  buttonSeguimiento: false,
                  buttonComments: true,
                  trashBin: true,
                }}
                img="/icon/persona_silueta.png"
              />
            </div>
          ))}
        </div>
      )}
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

export default PacientesPage;
