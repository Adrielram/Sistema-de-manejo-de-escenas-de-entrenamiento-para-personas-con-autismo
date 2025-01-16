import React from 'react'

import { notFound } from 'next/navigation'

export default async function goals({ params }: { params: Promise<{ edit_goal: string }> }) {
  const { edit_goal } = await params;

  async function getPost(edit_goal: string) {
    const res = await fetch(`http://backend:8000/api/objetivo/${edit_goal}/`, {
      cache: 'force-cache',
    })
    const post = await res.json()
    if (!post) notFound()
    return post
  }

  const objetivo = await getPost(edit_goal)

  return (
    <div>
      <h1 className="text-black">Objetivo: {objetivo.nombre}</h1>
      <p>Descripción: {objetivo.descripcion}</p>
      
      <h2>Escena Explicativa</h2>
      <p>Nombre: {objetivo.escena_explicativa.nombre}</p>
      <p>Idioma: {objetivo.escena_explicativa.idioma}</p>
      <p>Acento: {objetivo.escena_explicativa.acento}</p>
      <p>Complejidad: {objetivo.escena_explicativa.complejidad}</p>
      <a href={objetivo.escena_explicativa.link}>Ver Escena</a>

      <h2>Escenas Relacionadas</h2>
      <ul>
        {objetivo.escenas_relacionadas.map((escena) => (
          <li key={escena.id}>
            <p>Nombre: {escena.nombre}</p>
            <p>Idioma: {escena.idioma}</p>
            <p>Acento: {escena.acento}</p>
            <p>Complejidad: {escena.complejidad}</p>
            <a href={escena.link}>Ver Escena</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
