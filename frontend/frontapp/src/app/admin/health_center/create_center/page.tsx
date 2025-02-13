"use client";

import React, { useEffect, useState } from "react";

export default function Page() {
  const [nombreCentro, setNombreCentro] = useState<string>("");
  const [provincia, setProvincia] = useState<string>("");
  const [ciudad, setCiudad] = useState<string>("");
  const [calle, setCalle] = useState<string>("");
  const [numero, setNumero] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    
  }, []);

  const handleSubmit = async () => {
    setErrorMessage("");

    const payload = {
      nombre: nombreCentro,
      provincia,
      ciudad,
      calle,
      numero,
    };

    try {
      const response = await fetch("http://localhost:8000/api/create_health_center/", {
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
        setProvincia("");
        setCiudad("");
        setCalle("");
        setNumero("");
      } else {
        setErrorMessage(responseData.message || "Error al guardar el centro de salud");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setErrorMessage("Hubo un problema al conectarse al servidor.");
      console.error("Error de conexión:", error);
      setErrorMessage("Hubo un problema al conectarse al servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8 overflow-hidden">
        {errorMessage && (
          <div className="text-red-500 text-center mb-4">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">
              Nombre del Centro de Salud
            </label>
            <input
              type="text"
              value={nombreCentro}
              onChange={(e) => setNombreCentro(e.target.value)}
              placeholder="Nombre del centro"
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full">
                <label className="block text-sm font-medium mb-1">
                  Provincia
                </label>
                <input
                  type="text"
                  value={provincia}
                  onChange={(e) => setProvincia(e.target.value)}
                  placeholder="Provincia"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Ciudad"
                  className="w-full p-2 border rounded-md"
                />
              </div>

            <div className="w-full">
              <label className="block text-sm font-medium mb-1">
                Calle
              </label>
              <input
                type="text"
                value={calle}
                onChange={(e) => setCalle(e.target.value)}
                placeholder="Calle"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium mb-1">
                Número
              </label>
              <input
                type="text"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Número"
                pattern="^[0-9]+$"
                title="Solo se permiten números"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            className="fixed bottom-4 right-4 sm:relative sm:bottom-auto sm:right-auto bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md shadow-md transition-colors"
          >
            Guardar Centro de Salud
          </button>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .grid {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}