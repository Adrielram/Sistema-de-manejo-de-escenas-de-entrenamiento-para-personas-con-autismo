"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "../../../../components/Buscador";
import BoxPaginado from "../../../../components/PaginadoDinamico";


type Dictionary = { [key: string]: string };

interface Patient {
  username: string;
  nombre: string;
  dni: string;
  padreACargo: string;
}


const PatientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [patientsDictionary, setPatientsDictionary] = useState<Dictionary>();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const fetchAllPatients = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/get_patients/", {
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
        setAllPatients(data);
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        alert("Ocurrió un error al buscar los pacientes");
      }
    };

    fetchAllPatients();
  }, []);

  useEffect(() => {
    if (patients.length === 0) return;
  
    const dictionary: Dictionary = patients.reduce((acc, patient) => {
      acc[patient.dni] = patient.nombre;
      return acc;
    }, {} as Dictionary);
  
    setPatientsDictionary(dictionary);
  }, [patients]); // Change from allPatients to patients


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 50);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm.trim() === "") {
      setPatients(allPatients);
      return;
    }

    const fetchPatients = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/patients/?dni_o_nombre=${debouncedSearchTerm}`, {
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
  }, [debouncedSearchTerm, allPatients]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSelectPatient = (patientDni: string) => {
    console.log("Seleccionado DNI:", patientDni);
    const selected = patients.find((p) => p.dni === patientDni);
    console.log("Paciente encontrado:", selected);
    setSelectedPatient(selected || null);
  };

  console.log("Passing to BoxPaginado - data:", patientsDictionary);

  return (
    <div>
      <SearchBar onSearch={handleSearch} />

      {patients.map((patient) => (
        <div key={patient.dni} className="patient-card">
          <p>Nombre: {patient.nombre}</p>
          <p>DNI: {patient.dni}</p>
          <p>Username: {patient.username}</p>
          <p>Padre a Cargo: {patient.padreACargo}</p>
        </div>
      ))}

      
      <div className="container mx-auto p-4">
      <BoxPaginado
        data={patientsDictionary || {}}
        onSelect={handleSelectPatient}
        options={{}}
        img="/icon/persona_silueta.png"
        edit_path=""
        item_type="Patient"
        showImage={true}
        currentPage={1}
        totalItems={patients.length}
        onPageChange={() => {}}
        itemsPerPage={10}
        actualizar={true}
      />
      </div>
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
