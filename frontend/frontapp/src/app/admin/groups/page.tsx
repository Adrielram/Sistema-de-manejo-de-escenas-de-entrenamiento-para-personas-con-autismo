"use client";

import React, { useState, useEffect } from "react";
import GenericDropdown from "../../../components/SearchableDropDown";
import AssociatedList from "../../../components/AssociatedList";

const ManageGroupPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [associatedTherapists, setAssociatedTherapists] = useState([]);
  const [associatedPatients, setAssociatedPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Iniciando fetch de grupos...');
        const response = await fetch("http://localhost:8000/api/get_groups/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        if (Array.isArray(data)) {
          console.log('Número de grupos recibidos:', data.length);
        } else {
          console.log('Estructura de datos recibida:', typeof data);
        }

        setGroups(data);
      } catch (err) {
        console.log('Error completo:', err);
        setError(err.message);
        console.error("Error al obtener los grupos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    console.log('useEffect ejecutándose...');
    fetchGroupData();
}, []);

  // Efecto para actualizar los estados cuando se selecciona un grupo
  useEffect(() => {
    if (selectedGroup) {
      setAssociatedTherapists(selectedGroup.therapists || []);
      setAssociatedPatients(selectedGroup.patients || []);
    } else {
      setAssociatedTherapists([]);
      setAssociatedPatients([]);
    }
  }, [selectedGroup]); // Se ejecuta cuando cambia el grupo seleccionado

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleSave = async () => {
    if (!selectedGroup) return;

    setIsLoading(true);
    setError(null);

    try {
      const therapistIds = associatedTherapists.map((t) => t.id);
      const patientIds = associatedPatients.map((p) => p.id);

      const response = await fetch(`http://localhost:8000/api/update_group/${selectedGroup.id}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          therapist_ids: therapistIds,
          patient_ids: patientIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      alert(result.message);
      
      // Actualizar la lista de grupos después de guardar
      const updatedGroups = groups.map(group => 
        group.id === selectedGroup.id 
          ? { ...group, therapists: associatedTherapists, patients: associatedPatients }
          : group
      );
      setGroups(updatedGroups);

    } catch (err) {
      setError(err.message);
      alert("Error al guardar los cambios");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTherapist = (therapist) => {
    if (!associatedTherapists.some((t) => t.id === therapist.id)) {
      setAssociatedTherapists(prev => [...prev, therapist]);
    }
  };

  const handleAddPatient = (patient) => {
    if (!associatedPatients.some((p) => p.id === patient.id)) {
      setAssociatedPatients(prev => [...prev, patient]);
    }
  };

  return (
    <div className="p-5 text-black min-h-screen flex justify-center">
      <div className="max-w-3xl w-full">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <label htmlFor="groupSelect" className="block text-center text-sm mb-2">
          Seleccionar grupo:
        </label>
        <GenericDropdown
          title="Seleccionar Grupo"
          items={groups}
          onSelect={handleGroupSelect}
        />

        {selectedGroup && (
          <>
            <div className="flex flex-wrap gap-5 justify-center mt-5">
              <div className="flex-1 min-w-[300px] sm:w-[48%] lg:w-[30%]">
                <GenericDropdown
                  title="Editar Terapeutas"
                  items={selectedGroup.therapists}
                  onSelect={handleAddTherapist}
                />
                <AssociatedList
                  title="Terapeutas Asociados"
                  items={associatedTherapists}
                  onRemove={(id) =>
                    setAssociatedTherapists((prev) => prev.filter((t) => t.id !== id))
                  }
                />
              </div>

              <div className="flex-1 min-w-[300px] sm:w-[48%] lg:w-[30%]">
                <GenericDropdown
                  title="Editar Pacientes"
                  items={selectedGroup.patients}
                  onSelect={handleAddPatient}
                />
                <AssociatedList
                  title="Pacientes Asociados"
                  items={associatedPatients}
                  onRemove={(id) =>
                    setAssociatedPatients((prev) => prev.filter((p) => p.id !== id))
                  }
                />
              </div>
            </div>

            <div className="save-button-container mt-5 text-center">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageGroupPage;