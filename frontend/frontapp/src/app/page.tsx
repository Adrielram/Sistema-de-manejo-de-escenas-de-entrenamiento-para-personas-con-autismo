"use client"
/*import React from 'react';
import RevisionFormulario from '../components/RevisionFormulario';

const CrearFormulario = () => {
  return(
    {/*<RevisionFormulario formularioId={1} pacienteDni={40333444} terapeutaDni={31222333} />}
    
  )
};

export default CrearFormulario;*/

import { useState, useEffect } from "react";
import ResponderForm from "../components/ResponderForm";
import RevisionFormulario from "../components/RevisionFormulario";

const Page = () => {
  const [volverRealizar, setvolverRealizar] = useState(false);
  const [habilitado, setHabilitado] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL; 
  const formularioId = 1;
  const pacienteDni = 40333444;

  const checkRevisionStatus = async () => {

    const response = await fetch(
      `${baseUrl}obtener_estado_revision/?formulario_id=${formularioId}&paciente_dni=${pacienteDni}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );    
    const data = await response.json();
    console.log("Data revision: ",  JSON.stringify(data));
    setHabilitado(data.revision);
    setvolverRealizar(data.volver_a_realizar);
  };

  useEffect(() => {
    checkRevisionStatus();
  }, []);

  return (
    <div>
      {volverRealizar && (
        <ResponderForm
          idform={formularioId}
          onSubmitted={() => {
            setvolverRealizar(false);
          }}
        />
      )}
      {habilitado && (
        <RevisionFormulario
          formularioId={formularioId}
          pacienteDni={pacienteDni}
          terapeutaDni={31222333}
        />
      )}
      {!habilitado && (
        <p>Esperando que el terapeuta habilite la revisión.</p>
      )}
    </div>
  );
};

export default Page;

