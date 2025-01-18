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
  const [selectedCentersToAssociate, setselectedCentersToAssociate] = useState([]);
  const [selectedCentersToDisassociate, setselectedCentersToDisassociate] = useState([]);
  const {username} = useSelector((state: RootState) => state.user);
  const [associatedCenters, setAssociatedCenters] = useState([]); // Para almacenar los centros asociados
  const [resetTrigger, setResetTrigger] = useState(false);

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

  const handleSubmitOfAssociation = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const therapistCenterData = {
      username: username,
      centers: selectedCentersToAssociate.map(center => center.id),
    };
  
    console.log('Datos a enviar:', therapistCenterData); // Para depuración
    console.log('Datos a enviar 2:', JSON.stringify(therapistCenterData)); // Para depuración
  
    try {
      const response = await fetch(`http://localhost:8000/api/associate_center/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(therapistCenterData), // Serializar el cuerpo correctamente
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al asociar centros:", errorData);
        alert("Hubo un problema al asociar centros.");
        return;
      }
      setselectedCentersToAssociate([]); // Limpiar los centros seleccionados
      setResetTrigger((prev) => !prev); // Activa el reinicio del SearchSelectBox

      const data = await response.json();
      console.log("Centros asociados con éxito:", data);
      alert("Centros asociados con éxito.");
      // Aquí podrías redirigir o limpiar el formulario
    } catch (error) {
      console.error("Error de red al asociar centros:", error);
      alert("Error de red al intentar asociar centros.");
    }
  };

  const handleSubmitOfDisassociation = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const therapistCenterData = {
      username: username,
      centers: selectedCentersToDisassociate.map(center => center.id),
    };
  
    console.log('Datos a enviar:', therapistCenterData); // Para depuración
    console.log('Datos a enviar 2:', JSON.stringify(therapistCenterData)); // Para depuración
  
    try {
      const response = await fetch(`http://localhost:8000/api/desassociate_center/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(therapistCenterData), // Serializar el cuerpo correctamente
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al desasociar centros:", errorData);
        alert("Hubo un problema al desasociar centros.");
        return;
      }
      setselectedCentersToDisassociate([]); // Limpiar los centros seleccionados
      setResetTrigger((prev) => !prev); // Activa el reinicio del SearchSelectBox

      const data = await response.json();
      console.log("Centros desasociados con éxito:", data);
      alert("Centros desasociados con éxito.");
      // Aquí podrías redirigir o limpiar el formulario
    } catch (error) {
      console.error("Error de red al desasociar centros:", error);
      alert("Error de red al intentar desasociar centros.");
    }
  };

  return (
    <div>
      <Header />
        <div className='min-h-screen mb-10'>
          <div className="text-black p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">Selecciona un Centro de Salud</h1>
            <div className="flex flex-row flex-wrap justify-center gap-x-14 my-10">
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
          <form onSubmit={handleSubmitOfAssociation} className="grid grid-cols-1 gap-8 max-w-screen-sm mx-6 sm:mx-12 md:mx-auto">
            <div>
              <SearchSelectBox
                  title="Buscar centros de salud a asociar"
                  searchPlaceholder="Escribe el nombre del centro de salud..."
                  getItemLabel={(item) => item.nombre as string}
                  selectedItems={selectedCentersToAssociate}
                  onSelectItems={setselectedCentersToAssociate}
                  resetTrigger={resetTrigger} // Pasa el trigger al SearchSelectBox

                  apiUrl={`http://localhost:8000/api/get_not_associated_centers/${username}/`}
                />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-8 py-3 bg-[#3EA5FF] text-white font-semibold rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
              >
                Asociar Centros de Salud
              </button>
            </div>
          </form>
          <form onSubmit={handleSubmitOfDisassociation} className="grid grid-cols-1 gap-8 max-w-screen-sm mx-6 sm:mx-12 md:mx-auto my-12">
            <div>
              <SearchSelectBox
                  title="Buscar centros de salud a desasociar"
                  searchPlaceholder="Escribe el nombre del centro de salud..."
                  getItemLabel={(item) => item.nombre as string}
                  selectedItems={selectedCentersToDisassociate}
                  onSelectItems={setselectedCentersToDisassociate}
                  resetTrigger={resetTrigger} // Pasa el trigger al SearchSelectBox

                  apiUrl={`http://localhost:8000/api/get_associated_centers/${username}/`}
                />
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-8 py-3 bg-[#3EA5FF] text-white font-semibold rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
              >
                Desasociar Centros de Salud
              </button>
            </div>
          </form>
        </div>
      <Footer />
    </div>
  );
}
