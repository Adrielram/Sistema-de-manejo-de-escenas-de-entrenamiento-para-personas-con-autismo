'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation'; // Importa useRouter para manejar la navegación
import { setCenter } from '../../../slices/userSlice';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SearchSelectBox from '../../components/SearchSelectBox';
import { RootState } from '../../../store/store';

export default function Therapist() {
  const dispatch = useDispatch();
  const router = useRouter();
  const handleSetCentroSalud = (center: string) => {
    dispatch(setCenter({ center })); 
    router.push('/therapist/selection'); 
  };
  const [selectedCenters, setSelectedCenters] = useState([]);
  const {username} = useSelector((state: RootState) => state.user);
  const [associatedCenters, setAssociatedCenters] = useState([]); // Para almacenar los centros asociados

  const fetchAssociatedCenters = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/get_associated_centers/${username}/`);
      if (!response.ok) throw new Error('Error al cargar los centros asociados');
      const data = await response.json();
      setAssociatedCenters(data.results); // Guarda los centros asociados en el estado
    } catch (err) {
      console.error(err);
      alert('Hubo un error al cargar los centros asociados.');
    }
  };

  useEffect(() => {
    if (username) fetchAssociatedCenters();
  },);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const therapistCenterData = {
      username: username,
      centers: selectedCenters.map((item) => item.id), // IDs de los centros seleccionados
    };
  
    try {
      const response = await fetch(`http://localhost:8000/api/associate_center/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(therapistCenterData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al asociar centros:", errorData);
        alert("Hubo un problema al asociar centros.");
        return;
      }
  
      const data = await response.json();
      console.log("Centros asociados con éxito:", data);
      alert("Centros asociados con éxito.");
      // Aquí podrías redirigir o limpiar el formulario
    } catch (error) {
      console.error("Error de red al asociar centros:", error);
      alert("Error de red al intentar asociar centros.");
    }
  };

  return (
    <div>
      <Header />
        <div className="text-black p-6">
          <h1 className="text-2xl font-bold mb-4">Selecciona un Centro de Salud</h1>
          <div className="flex flex-row flex-wrap justify-center gap-x-14">
            {associatedCenters.map((center, index) => (
              <li key={index} className='list-none'>
                <button
                  onClick={() => handleSetCentroSalud(center.nombre)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                  {center.nombre}
                </button>
              </li>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
          <div>
            <SearchSelectBox
                title="Buscar centros de salud"
                searchPlaceholder="Escribe el nombre del centro de salud..."
                getItemLabel={(item) => item.nombre as string}
                selectedItems={selectedCenters}
                onSelectItems={setSelectedCenters}
                apiUrl={`http://localhost:8000/api/get_not_associated_centers/${username}/`}
              />
          </div>
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-8 py-3 bg-[#3EA5FF] text-white font-semibold rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
            >
              Crear Objetivo
            </button>
          </div>
        </form>
      <Footer />
    </div>
  );
}
