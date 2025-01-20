"use client";

import React, { useState, useEffect } from "react";
import GenericDropdown from "../../../components/SearchableDropDown";
import AssociatedList from "../../../components/AssociatedList";

const ManageGroupPage = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);

  const [associatedTherapists, setAssociatedTherapists] = useState([]);
  const [associatedPatients, setAssociatedPatients] = useState([]);

  // Fetch all groups, including therapists and patients
  useEffect(() => {
    const fetchGroupData = async () => {
      const response = await fetch("http://127.0.0.1:8000/api/get_groups/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data); // Set all groups with their therapists and patients
      } else {
        console.error("Error al obtener los grupos:", response.statusText);
      }
    };

    fetchGroupData();
  }, []);

  const handleGroupSelect = (group) => {
    console.log("Grupo seleccionado:", group);  // Verifica qué datos llegan
    setSelectedGroup(group);  // Establecer el grupo seleccionado
    setAssociatedTherapists(group.therapists || []);  // Asignar los terapeutas del grupo
    setAssociatedPatients(group.patients || []);  // Asignar los pacientes del grupo
  };
  
  // Save changes to the selected group
  const handleSave = async () => {
    const therapistIds = associatedTherapists.map((t) => t.id);
    const patientIds = associatedPatients.map((p) => p.id);

    const response = await fetch(`http://127.0.0.1:8000/api/update_group/${selectedGroup.id}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        therapist_ids: therapistIds,
        patient_ids: patientIds,
      }),
    });

    const result = await response.json();
    alert(result.message);
  };

  return (
    <div className="p-5 text-black min-h-screen flex justify-center">
      <div className="max-w-3xl w-full">
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
                  items={[]} // Puedes incluir opciones adicionales si es necesario
                  onSelect={(item) =>
                    !associatedTherapists.some((t) => t.id === item.id) &&
                    setAssociatedTherapists((prev) => [...prev, item])
                  }
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
                  items={[]} // Igual que arriba
                  onSelect={(item) =>
                    !associatedPatients.some((p) => p.id === item.id) &&
                    setAssociatedPatients((prev) => [...prev, item])
                  }
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
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSave}
              >
                Guardar cambios
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageGroupPage;
