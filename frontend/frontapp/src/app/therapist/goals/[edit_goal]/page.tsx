import React from 'react'

export default async function goals({ params }: { params: Promise<{ edit_goal: string }> }) {
  const { edit_goal } = await params;
  return (
    <>
      <h1 className="text-black">Comentario ID: {edit_goal}</h1>
    </>
  )
}
