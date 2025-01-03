'use client';

import React, { useState } from 'react';

type PacienteProps = {
  id: number;
  nombre: string;
  dni: string;
  padreACargo: string;
};

const pacientesMock: PacienteProps[] = [
    { id: 1, nombre: "Adriel Ram Ferrero", dni: "445357637", padreACargo:"marithe"},
    { id: 2, nombre: "Braian Rautto", dni: "255350234", padreACargo:"la patriciaaaaaaaaaaa"},
    {id:3,nombre:"Hector Omar Miño",dni:"123456789",padreACargo:"nomeacuerdo"},
    {id:4,nombre:"Mateo Romero",dni:"123456789",padreACargo:"nomeacuerdo"},
    {id:5,nombre:"Tomas Guerrero",dni:"123456789",padreACargo:"nomeacuerdo"},
    {id:6,nombre:"Juan Ladux",dni:"123456789",padreACargo:""},
    {id:7,nombre:"Tomas Rodriguez",dni:"123456",padreACargo:"idk"},
    {id:8,nombre:"Bonelli del Hoyo", dni:"1234",padreACargo:"idk"},
];

const Buscador: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPacientes, setFilteredPacientes] = useState(pacientesMock);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    const results = pacientesMock.filter(
      (paciente) =>
        paciente.nombre.toLowerCase().includes(query) ||
        paciente.dni.includes(query) ||
        paciente.padreACargo.toLowerCase().includes(query)
    );

    setFilteredPacientes(results);
  };

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
            key={paciente.id}
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

export default Buscador
