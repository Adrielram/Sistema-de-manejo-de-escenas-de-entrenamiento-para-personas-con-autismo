"use client";

import React, { useState, useEffect } from "react";
import GenericDropdown from "../../../../components/SearchableDropDown";
import AssociatedList from "../../../../components/AssociatedList";

const CreateGroupPage = () => {
  const [therapists, setTherapists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [healthCenters, setHealthCenters] = useState([]);
  const [associatedTherapists, setAssociatedTherapists] = useState([]);
  const [associatedPatients, setAssociatedPatients] = useState([]);
  const [associatedHealthCenters, setAssociatedHealthCenters] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const healthCentersResponse = await fetch("http://127.0.0.1:8000/api/get_health_centers/");
      const therapistsResponse = await fetch("http://127.0.0.1:8000/api/get_therapists/");
      const patientsResponse = await fetch("http://127.0.0.1:8000/api/get_patients/");

      const healthCentersData = await healthCentersResponse.json();
      const therapistsData = await therapistsResponse.json();
      const patientsData = await patientsResponse.json();
      console.log("healthCentersData" + healthCentersData)
      console.log("therapistsData" + therapistsData)
      console.log("patientsData" + patientsData)

      setHealthCenters(healthCentersData);
      setTherapists(therapistsData);
      setPatients(patientsData);
    };

    fetchData();
  }, []);

  const handleAddItem = (item, setAssociatedItems, associatedItems) => {
    if (item) {
      const key = item.dni ? 'dni' : 'id';
      if (!associatedItems.find((i) => i[key] === item[key])) {
        setAssociatedItems((prev) => [...prev, item]);
      }
    }
  };
  
  const handleRemoveItem = (id, setAssociatedItems) => {
    setAssociatedItems((prev) => prev.filter((i) => i.dni !== id && i.id !== id));
  };

  const handleSave = async () => {
    const healthCenterId = associatedHealthCenters[0]?.dni;
    const therapistIds = associatedTherapists.map((t) => t.dni);
    const patientIds = associatedPatients.map((p) => p.dni);

    const response = await fetch("http://127.0.0.1:8000/api/create_group/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: groupName,
        health_center_id: healthCenterId,
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
        <label htmlFor="groupName" className="block text-center text-sm mb-2">
          Nombre del grupo:
        </label>
        <input
          id="groupName"
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Ingrese el nombre del grupo"
          className="p-2 w-full mb-5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />

        <div className="flex flex-wrap gap-5 justify-center">
          {/* Dropdown y lista de terapeutas */}
          <div className="flex-1 min-w-[300px]">
            <GenericDropdown
              title="Asociar Terapeuta"
              items={therapists}
              onSelect={(item) => handleAddItem(item, setAssociatedTherapists, associatedTherapists)}
            />
            <AssociatedList
              title="Terapeutas Asociados"
              items={associatedTherapists}
              onRemove={(id) => handleRemoveItem(id, setAssociatedTherapists)}
            />
          </div>

          {/* Dropdown y lista de pacientes */}
          <div className="flex-1 min-w-[300px]">
            <GenericDropdown
              title="Asociar Paciente"
              items={patients}
              onSelect={(item) => handleAddItem(item, setAssociatedPatients, associatedPatients)}
            />
            <AssociatedList
              title="Pacientes Asociados"
              items={associatedPatients}
              onRemove={(id) => handleRemoveItem(id, setAssociatedPatients)}
            />
          </div>

          {/* Dropdown y lista de centros de salud */}
          <div className="flex-1 min-w-[300px]">
            <GenericDropdown
              title="Asociar Centro de Salud"
              items={healthCenters}
              onSelect={(item) => handleAddItem(item, setAssociatedHealthCenters, associatedHealthCenters)}
            />
            <AssociatedList
              title="Centros de Salud Asociados"
              items={associatedHealthCenters}
              onRemove={(id) => handleRemoveItem(id, setAssociatedHealthCenters)}
            />
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 z-10 w-auto flex justify-center">
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#f6512b] hover:bg-[#d94421] rounded-full text-white font-bold text-base cursor-pointer transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Crear grupo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;