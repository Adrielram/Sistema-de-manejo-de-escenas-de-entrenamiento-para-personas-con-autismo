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
        const response = await fetch("http://localhost:8000/api/get_groups/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        setGroups(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      console.log("Pacientes recibidos del back:", selectedGroup.patients);
      setAssociatedTherapists(selectedGroup.therapists || []);
      setAssociatedPatients(selectedGroup.patients || []);
    } else {
      setAssociatedTherapists([]);
      setAssociatedPatients([]);
    }
  }, [selectedGroup]);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleRemoveTherapist = async (therapistId) => {
    if (!selectedGroup) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/personagrupo/${selectedGroup.id}/${therapistId}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      alert(result.message);

      // Actualizar la lista de terapeutas después de eliminar
      setAssociatedTherapists((prev) => prev.filter((t) => t.id !== therapistId));
    } catch (err) {
      setError(err.message);
      alert("Error al eliminar el terapeuta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePatient = async (patientId) => {
    if (!selectedGroup || !patientId) return;  // verificación de patientId
  
    console.log("El patientId es:", patientId); // Agregar este log
    if (!selectedGroup) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/personagrupo/${selectedGroup.id}/${patientId}/`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      alert(result.message);

      // Actualizar la lista de pacientes después de eliminar
      setAssociatedPatients((prev) => prev.filter((p) => p.id !== patientId));
    } catch (err) {
      setError(err.message);
      alert("Error al eliminar el paciente.");
    } finally {
      setIsLoading(false);
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
          title={selectedGroup ? selectedGroup.name : "Seleccionar Grupo"}
          items={groups}
          onSelect={handleGroupSelect}
        />

        {selectedGroup && (
          <>
            <div className="flex flex-wrap gap-5 justify-center mt-5">
              <div className="flex-1 min-w-[300px] sm:w-[48%] lg:w-[30%]">
                <AssociatedList
                  title="Terapeutas Asociados"
                  items={associatedTherapists}
                  onRemove={handleRemoveTherapist}
                />
              </div>

              <div className="flex-1 min-w-[300px] sm:w-[48%] lg:w-[30%]">
                <AssociatedList
                  title="Pacientes Asociados"
                  items={associatedPatients}
                  /*onRemove={(patient) => {
                    console.log("Los pacientes asociados son:", associatedPatients);
                    console.log("El paciente a eliminar es:", patient); // Verificar el objeto completo
                    handleRemovePatient(patient); // Asegúrate de pasar el id correctamente
                  }}*/
                  onRemove={handleRemovePatient}                  
                />
              </div>
            </div>

            <div className="save-button-container mt-5 text-center">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                onClick={() => alert("Funcionalidad para guardar")}
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
