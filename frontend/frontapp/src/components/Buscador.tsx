'use client';

import React, { useEffect, useState } from 'react';

type PacienteProps = {
  username: string;
  nombre: string;
  dni: string;
  padreACargo: string;
};

const BuscadorPacientes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pacientes, setPacientes] = useState<PacienteProps[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<PacienteProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/pacientes/');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data: PacienteProps[] = await response.json();
        setPacientes(data);
        setFilteredPacientes(data); // Es necesario mostrar todos al principio
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Ocurrió un error desconocido.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);


  //funcion que aplica el filtro
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const results = pacientes.filter(    
      (paciente) =>
        paciente.nombre.toLowerCase().startsWith(query) ||
        (paciente.dni && String(paciente.dni).startsWith(query)) || 
        paciente.padreACargo.toLowerCase().startsWith(query)
    );
    
    setFilteredPacientes(results);
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Buscador de Pacientes</h1>
      <input
        type="text"
        placeholder="Buscar por nombre, DNI o padre a cargo"
        value={searchQuery}
        onChange={handleSearch}
        className="border border-gray-300 rounded px-2 py-1 w-full mb-4"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPacientes.map((paciente) => (
          <div
            key={paciente.username}
            className="bg-white p-3 rounded shadow border border-gray-200"
          >
            <p><strong>Nombre:</strong> {paciente.nombre}</p>
            <p><strong>DNI:</strong> {paciente.dni}</p>
            <p><strong>Padre a cargo:</strong> {paciente.padreACargo}</p>
          </div>
        ))}
        {filteredPacientes.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No se encontraron pacientes.
          </p>
        )}
      </div>
    </div>
  );
};

export default BuscadorPacientes;
