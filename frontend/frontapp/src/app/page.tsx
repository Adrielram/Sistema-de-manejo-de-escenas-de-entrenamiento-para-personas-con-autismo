"use client"
import React from 'react';
import RevisionFormulario from '../components/RevisionFormulario';

const CrearFormulario = () => {
  return(
    <RevisionFormulario formularioId={1} pacienteDni={40333444} terapeutaDni={31222333} />
  )
};

export default CrearFormulario;
