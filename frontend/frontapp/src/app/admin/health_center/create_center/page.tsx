"use client";

import React, { useEffect, useState } from "react";
import DropDownList from "../../../../components/DropDownList";

export default function Page() {
  const [nombreCentro, setNombreCentro] = useState<string>("");
  const [provincias, setProvincias] = useState<string[]>([]);
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [calle, setCalle] = useState<string>("");
  const [numero, setNumero] = useState<string>("");
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string>("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const fetchProvincesAndCities = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/get_info/");
        if (response.ok) {
          const data = await response.json();
          setProvincias(data.provinces.map((item: { provincia: string }) => item.provincia));
          setCiudades(data.cities.map((item: { ciudad: string }) => item.ciudad));
        } else {
          console.error("Error al cargar provincias y ciudades");
        }
      } catch (error) {
        console.error("Error de conexión al cargar provincias y ciudades:", error);
      }
    };

    fetchProvincesAndCities();
  }, []);

  const handleProvinciaChange = (selected: string) => {
    setProvinciaSeleccionada(selected);
    setCiudadSeleccionada(""); 
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    setErrorMessage("");

    const payload = {
      nombre: nombreCentro,
      provincia: provinciaSeleccionada,
      ciudad: ciudadSeleccionada,
      calle,
      numero,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/create_health_center/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        alert("Centro de salud creado con éxito");
        setNombreCentro("");
        setProvinciaSeleccionada("");
        setCiudadSeleccionada("");
        setCalle("");
        setNumero("");
      } else {
        setErrorMessage(responseData.message || "Error al guardar el centro de salud");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrorMessage("Hubo un problema al conectarse al servidor.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f0f0f0",
        padding: "40px", 
        minHeight: "100vh", 
      }}
    >
      <div
        style={{
          padding: "20px",
          backgroundColor: "#fff", 
          borderRadius: "10px", 
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
          color: "black",
          margin: "0 auto",
          maxWidth: "800px", 
        }}
      >
        {errorMessage && (
          <div style={{ 
            color: 'red', 
            marginBottom: '20px', 
            textAlign: 'center' 
          }}>
            {errorMessage}
          </div>
        )}

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
              pattern="^[0-9]+$"
              title="Solo se permiten números"
            />
          </div>
        </div>
  
        <button
        onClick={handleSubmit}
        style={{
          padding: "10px 20px",
          backgroundColor: "#f6512b",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          position: "fixed",
          bottom: "20px",
          right: "20px",
          maxWidth: "200px", // Define un ancho máximo para el botón
          width: "auto", // Permite que el tamaño del botón se ajuste automáticamente
        }}
      >
        Guardar Centro de Salud
      </button>
      </div>
  
      <style jsx>{`
      @media (max-width: 600px) {
        div > div {
          width: 100% !important;
        }
        input {
          width: 100%;
        }
        .form-container {
          padding: 10px;
        }
        button {
          width: auto; /* Ajusta el ancho automáticamente */
          max-width: 90%; /* Define el máximo ancho del botón como porcentaje */
          bottom: 10px;
          right: 10px;
          text-align: center; /* Centra el texto dentro del botón */
        }
      }
    `}</style>
    </div>
  );
}