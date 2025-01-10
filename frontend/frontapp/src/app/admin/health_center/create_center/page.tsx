"use client";
import React, { useState, useEffect } from "react";
import DropDownList from "../../../../components/DropDownList";
import SearchableDropDown from "../../../../components/SearchableDropDown";

const CrearCentroSalud: React.FC = () => {
  const [provincias, setProvincias] = useState<string[]>([]);
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [grupos, setGrupos] = useState<string[]>([]);
  const [nombreCentro, setNombreCentro] = useState("");
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [calle, setCalle] = useState("");
  const [numero, setNumero] = useState("");
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provinciasResponse = await fetch("/api/provincias");
        const gruposResponse = await fetch("/api/grupos");
        setProvincias(await provinciasResponse.json());
        setGrupos(await gruposResponse.json());
      } catch (error) {
        console.error("Error al obtener datos del backend:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCiudades = async () => {
      if (provinciaSeleccionada) {
        try {
          const ciudadesResponse = await fetch(
            `/api/ciudades?provincia=${provinciaSeleccionada}`
          );
          setCiudades(await ciudadesResponse.json());
        } catch (error) {
          console.error("Error al obtener ciudades:", error);
        }
      } else {
        setCiudades([]);
      }
    };

    fetchCiudades();
  }, [provinciaSeleccionada]);

  const handleProvinciaChange = (selected: string) => {
    setProvinciaSeleccionada(selected);
    setCiudadSeleccionada(""); // Resetear ciudad cuando se cambia de provincia
  };

  const handleSubmit = () => {
    const nuevoCentroSalud = {
      nombre: nombreCentro,
      provincia: provinciaSeleccionada,
      ciudad: ciudadSeleccionada,
      calle,
      numero,
      grupo: grupoSeleccionado,
    };

    console.log("Datos del nuevo centro de salud:", nuevoCentroSalud);
    // Lógica para enviar al backend
    // fetch('/api/centros', { method: 'POST', body: JSON.stringify(nuevoCentroSalud), headers: { 'Content-Type': 'application/json' } })
  };

  return (
    <div style={{ padding: "20px", color: "black" }}>
      <div>
        <label>Nombre del Centro de Salud</label>
        <input
          type="text"
          value={nombreCentro}
          onChange={(e) => setNombreCentro(e.target.value)}
          placeholder="Nombre del centro"
          style={{
            width: "100%",
            marginBottom: "20px",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div style={{ width: "48%", marginBottom: "20px" }}>
          <DropDownList
            listName="Provincias"
            items={provincias}
            onSelect={(selected: string) => handleProvinciaChange(selected)}
          />
        </div>

        <div style={{ width: "48%", marginBottom: "20px" }}>
          <DropDownList
            listName="Ciudades"
            items={ciudades}
            onSelect={(selected: string) => setCiudadSeleccionada(selected)}
          />
        </div>

        <div style={{ width: "48%", marginBottom: "20px" }}>
          <label style={{ fontWeight: "bold" }}>Calle</label>
          <input
            type="text"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            placeholder="Calle"
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ width: "48%", marginBottom: "20px" }}>
          <label style={{ fontWeight: "bold" }}>Número</label>
          <input
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Número"
            style={{ width: "100%" }}
            pattern="^[0-9]+$" // Esto es para asegurar que solo se ingresen números
            title="Solo se permiten números"
          />
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>Grupo Asociado</label>
        <SearchableDropDown
          title="Grupos"
          items={grupos}
          onSelect={(selected: string) => setGrupoSeleccionado(selected)}
        />
      </div>

      <button
        onClick={handleSubmit}
        style={{
          padding: "10px 20px",
          backgroundColor: "#f6512b", // Color del botón actualizado
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          position: "fixed", // Fijar el botón en la parte inferior derecha
          bottom: "20px",
          right: "20px",
        }}
      >
        Guardar Centro de Salud
      </button>

      {/* Media Query para pantallas pequeñas */}
      <style jsx>{`
        @media (max-width: 600px) {
          div > div {
            width: 100% !important; /* Cambiar el ancho a 100% en pantallas pequeñas */
          }
          .form-container {
            padding: 10px;
          }
          button {
            width: 90%;
            bottom: 10px;
            right: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default CrearCentroSalud;
