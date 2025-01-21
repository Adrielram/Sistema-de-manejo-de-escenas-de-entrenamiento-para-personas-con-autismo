"use client"
import React from 'react';
import Formulario from '../components/Formulario';
import { enviarFormulario } from '../utils/api';
import ResponderForm from '../components/ResponderForm';

const CrearFormulario: React.FC = () => {
  const manejarEnvio = async (formulario) => {
    const resultado = await enviarFormulario(formulario);
    if (!resultado.success){
      alert("No se pudo crear el formulario.")
    }else{
      alert("Formulario creado exitosamente");
      console.log('Formulario creado:', resultado);
    }
    
  };

  return (
    <div>      
      <Formulario onSubmit={manejarEnvio} />
      <ResponderForm />

    </div>
  );
};

export default CrearFormulario;
