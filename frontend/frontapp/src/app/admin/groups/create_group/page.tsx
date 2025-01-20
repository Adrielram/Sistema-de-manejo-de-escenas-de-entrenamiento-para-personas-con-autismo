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

  // Fetch data for health centers, therapists, and patients
  useEffect(() => {
    const fetchData = async () => {
      const healthCentersResponse = await fetch("http://127.0.0.1:8000/api/get_health_centers/");
      const therapistsResponse = await fetch("http://127.0.0.1:8000/api/get_therapists/");
      const patientsResponse = await fetch("http://127.0.0.1:8000/api/get_patients/");

      const healthCentersData = await healthCentersResponse.json();
      const therapistsData = await therapistsResponse.json();
      const patientsData = await patientsResponse.json();
      console.log(healthCentersData)
      console.log(therapistsData)
      console.log(patientsData)

      setHealthCenters(healthCentersData);
      setTherapists(therapistsData);
      setPatients(patientsData);
    };

    fetchData();
  }, []);

  const handleAddItem = (item, setAssociatedItems, associatedItems) => {
    if (item) {
      const key = item.dni ? 'dni' : 'id'; // Verificar si tiene dni o id
      if (!associatedItems.find((i) => i[key] === item[key])) {
        setAssociatedItems((prev) => [...prev, item]);
      }
    }
  };
  
  const handleRemoveItem = (id, setAssociatedItems) => {
    setAssociatedItems((prev) => prev.filter((i) => i.dni !== id && i.id !== id)); // Filtrar por dni o id
  };
  

  const handleSave = async () => {
    const healthCenterId = associatedHealthCenters[0]?.dni; // Asumiendo un solo centro de salud seleccionado
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
          className="p-2 w-full mb-5 border border-gray-300 rounded-md text-sm"
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
        <div className="save-button-container">
          <button className="save-button" onClick={handleSave}>Crear grupo</button>
        </div>
      </div>

      <style jsx>{`
        .save-button-container {
          display: flex;
          justify-content: center;
          position: fixed;
          bottom: 20px; /* Fija el botón 20px por encima del borde inferior */
          left: 50%; /* Centra el botón horizontalmente */
          transform: translateX(-50%); /* Ajusta para centrar perfectamente */
          width: auto;
          z-index: 1000; /* Asegura que el botón esté por encima de otros elementos */
        }

        .save-button {
          padding: 10px 20px;
          background-color: #f6512b; /* Color naranja */
          border: none;
          border-radius: 25px;
          color: white;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .save-button:hover {
          background-color: #d94421; /* Naranja más oscuro al pasar el mouse */
        }

        /* Media Query para pantallas pequeñas */
        @media (max-width: 768px) {
          .save-button-container {
            justify-content: center;
            left: 50%;
            transform: translateX(-50%);
          }

          .save-button {
            margin: 0 10px; /* Ajusta los márgenes para pantallas pequeñas */
          }
        }
      `}</style>

    </div>
  );
};

export default CreateGroupPage;
