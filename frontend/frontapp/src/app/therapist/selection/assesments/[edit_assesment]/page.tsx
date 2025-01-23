import React from 'react'

export default async function assesments({ params }: { params: Promise<{ edit_assesment: string }> }) {
  const { edit_assesment } = await params;
  return (
    <>
      <h1 className="text-black">Comentario ID: {edit_assesment}</h1>
    </>
  )
}
