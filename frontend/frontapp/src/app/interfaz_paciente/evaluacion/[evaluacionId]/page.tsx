import React from 'react'
import ResponderForm from '../../../../components/ResponderForm';

export default async function evaluacion({ params }: { params: Promise<{ evaluacionId: string }> }) {
  const { evaluacionId } = await params;

  return (
    <>
      <h1 className="text-black">Evaluacion ID: {evaluacionId}</h1>
      <ResponderForm idform={evaluacionId} />
    </>
  )
}