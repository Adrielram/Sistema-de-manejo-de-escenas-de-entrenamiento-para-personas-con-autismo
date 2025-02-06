"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "../../../../components/Buscador";
import PaginadoDinamico from "../../../../components/PaginadoDinamico";

const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      if (searchTerm.trim() === "") {
        setPatients([]);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/api/patients?dni_o_nombre=${searchTerm}`, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error al obtener pacientes: ${errorData.error}`);
        }

        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        alert("Ocurrió un error al buscar los pacientes");
      }
    };

    fetchPatients();
  }, [searchTerm]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSelectPatient = (patientDni) => {
    const selected = patients.find((p) => p.dni === patientDni);
    setSelectedPatient(selected);
  };

  const patientsDictionary = patients.reduce((acc, patient) => {
    acc[patient.dni] = patient.nombre;
    return acc;
  }, {});

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <PaginadoDinamico 
        data={patientsDictionary} 
        onSelect={handleSelectPatient}
        options={{}} 
        img="" 
        edit_path="" 
        item_type="patient" 
        showImage={false} 
        currentPage={1} 
        totalItems={patients.length} 
        onPageChange={() => {}} 
        itemsPerPage={10} 
      />
      {selectedPatient && (
        <div>
          <h2>Detalles del Paciente</h2>
          <p><strong>Nombre:</strong> {selectedPatient.nombre}</p>
          <p><strong>Username:</strong> {selectedPatient.username}</p>
          <p><strong>DNI:</strong> {selectedPatient.dni}</p>
        </div>
      )}
    </div>
  );
};

export default PatientList;