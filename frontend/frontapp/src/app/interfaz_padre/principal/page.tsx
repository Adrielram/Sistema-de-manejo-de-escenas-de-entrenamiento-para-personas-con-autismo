"use client";
import React, { useEffect, useState } from 'react';
import Box_paciente from '../../../components/Box_paciente';
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store';
 


const VerHijos = () => {
  const { username } = useSelector((state: RootState) => state.user)
  const [hijos, setHijos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para obtener el DNI a partir del username
    const fetchDNI = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/get-dni/?username=${username}`);
        if (!response.ok) {
          throw new Error('Error al obtener el DNI');
        }
        const data = await response.json();
        return data.dni; 
      } catch (error) {
        setError(error.message);
        throw error; 
      }
    };
  
    // Función para obtener los hijos desde el backend
    const fetchHijos = async (dni) => {
      try {
        const response = await fetch(`http://localhost:8000/api/HijosListView/?padre_id=${dni}`);
        if (!response.ok) {
          throw new Error('Error al obtener los hijos');
        }
        const data = await response.json();
        setHijos(data);
        console.log("DATA HIJOS:  ", JSON.stringify(data));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    const fetchData = async () => {
      setLoading(true);
      try {
        const dni = await fetchDNI(); 
        await fetchHijos(dni); 
      } catch {
        setLoading(false); 
      }
    };
  
    fetchData(); 
  }, [username]);

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
