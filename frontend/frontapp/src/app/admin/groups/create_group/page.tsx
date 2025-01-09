"use client";

import React, { useState } from "react";
import GenericDropdown from "../../../../components/SearchableDropDown";
import AssociatedList from "../../../../components/AssociatedList";

const CreateGroupPage = () => {
  const [therapists, setTherapists] = useState([
    { id: 1, name: "Terapeuta 1" },
    { id: 2, name: "Terapeuta 2" },
    { id: 3, name: "Terapeuta 3" },
  ]);

  const [patients, setPatients] = useState([
    { id: 1, name: "Paciente 1" },
    { id: 2, name: "Paciente 2" },
    { id: 3, name: "Paciente 3" },
  ]);

  const [associatedTherapists, setAssociatedTherapists] = useState([]);
  const [associatedPatients, setAssociatedPatients] = useState([]);

  const handleAddTherapist = (therapist) => {
    if (therapist && !associatedTherapists.find((t) => t.id === therapist.id)) {
      setAssociatedTherapists((prev) => [...prev, therapist]);
    }
  };

  const handleAddPatient = (patient) => {
    if (patient && !associatedPatients.find((p) => p.id === patient.id)) {
      setAssociatedPatients((prev) => [...prev, patient]);
    }
  };

  const handleRemoveTherapist = (id) => {
    setAssociatedTherapists((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRemovePatient = (id) => {
    setAssociatedPatients((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = () => {
    // Lógica para guardar los cambios
    alert("Cambios guardados!");
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        color: "black",
        minHeight: "100vh", // Asegura que el contenido tenga una altura mínima de 100vh
        paddingBottom: "60px", // Deja espacio para el botón en la parte inferior
      }}
    >
      <label
        htmlFor="groupName"
        style={{
          display: "block",
          marginBottom: "10px",
          textAlign: "center",
          fontSize: "14px",
        }}
      >
        Nombre del grupo:
      </label>
      <input
        id="groupName"
        type="text"
        placeholder="Ingrese el nombre del grupo"
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "20px",
          fontSize: "14px",
        }}
      />

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "20px",
          flexWrap: "wrap", // Esto permite que los elementos se reorganicen en pantallas pequeñas
        }}
      >
        {/* Dropdown y lista de terapeutas */}
        <div style={{ flex: "1 1 300px" }}> {/* Flex: se adapta según el tamaño */}
          <GenericDropdown
            title="Asociar Terapeuta"
            items={therapists}
            onSelect={handleAddTherapist}
          />
          <AssociatedList
            title="Terapeutas Asociados"
            items={associatedTherapists}
            onRemove={handleRemoveTherapist}
          />
        </div>

        {/* Dropdown y lista de pacientes */}
        <div style={{ flex: "1 1 300px" }}> {/* Flex: se adapta según el tamaño */}
          <GenericDropdown
            title="Asociar Paciente"
            items={patients}
            onSelect={handleAddPatient}
          />
          <AssociatedList
            title="Pacientes Asociados"
            items={associatedPatients}
            onRemove={handleRemovePatient}
          />
        </div>
      </div>

      {/* Botón Guardar */}
      <div className="save-button-container">
        <button className="save-button" onClick={handleSave}>Guardar grupo</button>
      </div>

      <style jsx>{`
        .save-button-container {
          display: flex;
          justify-content: flex-end;
          position: fixed;
          bottom: 20px; /* Fija el botón 20px por encima del borde inferior */
          right: 20px; /* Coloca el botón en la esquina derecha */
          width: 100%; /* Asegura que se ocupe todo el ancho */
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
          align-self: flex-end;
        }

        .save-button:hover {
          background-color: #d94421; /* Naranja más oscuro al pasar el mouse */
        }

        /* Media Query para pantallas pequeñas */
        @media (max-width: 768px) {
          .save-button-container {
            justify-content: center;
            right: auto;
            left: 0;
            width: auto;
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
