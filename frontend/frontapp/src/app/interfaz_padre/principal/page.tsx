"use client";
import React, { useEffect, useState } from 'react';
import Box_paciente from '../../../components/Box_paciente';

const VerHijos = () => {
  const padreId = 222; // ESTO ES EL DNI DEL PADRE, LO DEBERIA OBTENER DEL USUARIO LOGUEADO
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para obtener los hijos desde el backend
    const fetchHijos = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/HijosListView/?padre_id=${padreId}`);
        if (!response.ok) {
          throw new Error('Error al obtener los hijos');
        }
        const data = await response.json();
        setHijos(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHijos();
  }, []);

  if (loading) {
    return <div className="text-center">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  const opciones = {
    personalInfo: false,
    buttonVer: false,
    buttonComments: false,
    buttonEdit: false,
    buttonSeguimiento: true,
    trashBin: false,
  };

  const hijosOrdenados = hijos.sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Seguimiento de hijos
      </h1>
      <div className="flex flex-col items-center justify-center w-full gap-4 md:flex-row md:flex-wrap md:justify-center">
        {hijosOrdenados.map((hijo) => (
          <Box_paciente key={hijo.dni} paciente={hijo} opciones={opciones} />
        ))}
      </div>
    </div>
  );
}

export default VerHijos;
