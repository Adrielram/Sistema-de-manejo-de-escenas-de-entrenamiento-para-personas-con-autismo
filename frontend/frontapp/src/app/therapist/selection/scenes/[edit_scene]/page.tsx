import React from 'react'

export default async function scenes({ params }: { params: Promise<{ edit_scene: string }> }) {
  const { edit_scene } = await params;
  return (
    <>
      <h1 className="text-black">Comentario ID: {edit_scene}</h1>
    </>
  )
}
