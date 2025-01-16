'use client';

import React from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation'; // Importa useRouter para manejar la navegación
import { setCenter } from '../../../slices/userSlice';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function Therapist() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSetCentroSalud = (centro: string) => {
    dispatch(setCenter({ centro })); 
    router.push('/therapist/selection'); 
  };

  return (
    <div>
      <Header />
        <div className="text-black p-6">
          <h1 className="text-2xl font-bold mb-4">Selecciona un Centro de Salud</h1>
          <div className="h-screen">
            <button
              onClick={() => handleSetCentroSalud('Centro 1')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Centro 1
            </button>
            <button
              onClick={() => handleSetCentroSalud('Centro 2')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Centro 2
            </button>
            <button
              onClick={() => handleSetCentroSalud('Centro 3')}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Centro 3
            </button>
          </div>
        </div>
      <Footer />
    </div>
  );
}
