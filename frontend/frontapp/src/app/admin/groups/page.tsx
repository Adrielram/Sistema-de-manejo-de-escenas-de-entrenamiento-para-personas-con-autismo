"use client";

import React, { useState, useEffect } from "react";
import GenericDropdown from "../../../components/SearchableDropDown";
import AssociatedList from "../../../components/AssociatedList";

const ManageGroupPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [associatedTherapists, setAssociatedTherapists] = useState([]);
  const [associatedPatients, setAssociatedPatients] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener los datos de un grupo específico
  const fetchGroupData = async (groupId) => {
    try {
      const response = await fetch("http://localhost:8000/api/get_groups/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const updatedGroup = data.find(group => group.id === groupId);
      
      if (updatedGroup) {
        setSelectedGroup(updatedGroup);
        // Actualizar las listas asociadas con el formato correcto
        setAssociatedTherapists(updatedGroup.therapists.map(t => ({
          dni: t.id,
          nombre: t.name
        })));
        setAssociatedPatients(updatedGroup.patients.map(p => ({
          dni: p.id,
          nombre: p.name
        })));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch inicial de grupos
  useEffect(() => {
    const fetchGroups = async () => {
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
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setGroups(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Fetch de terapeutas y pacientes
  useEffect(() => {
    const fetchTherapistsAndPatients = async () => {
      try {
        const [therapistResponse, patientResponse] = await Promise.all([
          fetch("http://localhost:8000/api/get_therapists/", { method: "GET" }),
          fetch("http://localhost:8000/api/get_patients/", { method: "GET" })
        ]);

        if (!therapistResponse.ok || !patientResponse.ok) {
          throw new Error("Error fetching therapists or patients");
        }

        const [therapistData, patientData] = await Promise.all([
          therapistResponse.json(),
          patientResponse.json()
        ]);

        setTherapists(therapistData);
        setPatients(patientData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchTherapistsAndPatients();
  }, []);

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    // Actualizar las listas asociadas con el formato correcto
    setAssociatedTherapists(group.therapists.map(t => ({
      dni: t.id,
      nombre: t.name
    })));
    setAssociatedPatients(group.patients.map(p => ({
      dni: p.id,
      nombre: p.name
    })));
  };

  const handleAddTherapist = (therapist) => {
    if (!selectedGroup) return;
    if (!associatedTherapists.some(t => t.dni === therapist.dni)) {
      setAssociatedTherapists(prev => [...prev, therapist]);
    }
  };

  const handleAddPatient = (patient) => {
    if (!selectedGroup) return;
    if (!associatedPatients.some(p => p.dni === patient.dni)) {
      setAssociatedPatients(prev => [...prev, patient]);
    }
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
        throw new Error(`Error: ${response.status}`);
      }

      // Actualizar el estado local inmediatamente
      setAssociatedTherapists(prev => prev.filter(t => t.dni !== therapistId));
      
      // Recargar los datos del grupo para asegurar sincronización
      await fetchGroupData(selectedGroup.id);
      
      alert("Terapeuta eliminado exitosamente.");
    } catch (err) {
      setError(err.message);
      alert("Error al eliminar el terapeuta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePatient = async (patientId) => {
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
        throw new Error(`Error: ${response.status}`);
      }

      // Actualizar el estado local inmediatamente
      setAssociatedPatients(prev => prev.filter(p => p.dni !== patientId));
      
      // Recargar los datos del grupo para asegurar sincronización
      await fetchGroupData(selectedGroup.id);
      
      alert("Paciente eliminado exitosamente.");
    } catch (err) {
      setError(err.message);
      alert("Error al eliminar el paciente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedGroup) {
      alert("Primero selecciona un grupo.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/update_group_associations/${selectedGroup.id}/`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            therapists: associatedTherapists.map(t => t.dni),
            patients: associatedPatients.map(p => p.dni),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Recargar los datos del grupo después de guardar
      await fetchGroupData(selectedGroup.id);
      
      alert("Cambios guardados exitosamente.");
    } catch (err) {
      setError(err.message);
      alert("Error al guardar los cambios.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-gray-50 pt-16"> {/* Añadido pt-16 en lugar del div espaciador */}
      <div className="container mx-auto px-4 lg:pl-64">
        <div className="w-full max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl relative" style={{ zIndex: 0 }}> {/* Forzamos un z-index bajo */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="mb-8">
              <label htmlFor="groupSelect" className="block text-center text-sm mb-2">
                Seleccionar grupo:
              </label>
              <div className="relative" style={{ zIndex: 1 }}> {/* z-index más bajo que el header */}
                <GenericDropdown
                  title={selectedGroup ? selectedGroup.name : "Seleccionar Grupo"}
                  items={groups}
                  onSelect={handleGroupSelect}
                />
              </div>
            </div>

            {selectedGroup && (
              <div>
                <div className="flex flex-wrap gap-5 justify-center mt-5">
                  <div className="flex-1 min-w-[300px] sm:w-[48%] lg:w-[30%]">
                    <div className="relative" style={{ zIndex: 1 }}> {/* z-index más bajo que el header */}
                      <GenericDropdown
                        title="Agregar Terapeuta"
                        items={therapists}
                        onSelect={handleAddTherapist}
                      />
                    </div>
                    <AssociatedList
                      title="Terapeutas Asociados"
                      items={associatedTherapists}
                      onRemove={handleRemoveTherapist}
                    />
                  </div>

                  <div className="flex-1 min-w-[300px] sm:w-[48%] lg:w-[30%]">
                    <div className="relative" style={{ zIndex: 1 }}> {/* z-index más bajo que el header */}
                      <GenericDropdown
                        title="Agregar Paciente"
                        items={patients}
                        onSelect={handleAddPatient}
                      />
                    </div>
                    <AssociatedList
                      title="Pacientes Asociados"
                      items={associatedPatients}
                      onRemove={handleRemovePatient}
                    />
                  </div>
                </div>

                <div className="save-button-container mt-5 text-center">
                  <button
                    className="px-4 py-2 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-colors"
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                  >
                    {isLoading ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
);
};

export default ManageGroupPage;