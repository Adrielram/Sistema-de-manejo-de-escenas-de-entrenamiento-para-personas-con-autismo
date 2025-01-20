"use client"
import React from 'react';
import Formulario from '../components/Formulario';
import { enviarFormulario } from '../utils/api';

const CrearFormulario: React.FC = () => {
  const manejarEnvio = async (formulario) => {
    const resultado = await enviarFormulario(formulario);
    console.log('Formulario creado:', resultado);
  };

  return (
    <div>      
      <Formulario onSubmit={manejarEnvio} />
    </div>
  );
};

export default CrearFormulario;
