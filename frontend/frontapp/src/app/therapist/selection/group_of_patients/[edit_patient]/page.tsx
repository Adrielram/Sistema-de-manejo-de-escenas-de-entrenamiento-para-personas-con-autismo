import React from 'react'

export default async function patients({ params }: { params: Promise<{ edit_patient: string }> }) {
  const { edit_patient } = await params;
  return (
    <>
      <h1 className="text-black">{edit_patient}</h1>
    </>
  )
}
