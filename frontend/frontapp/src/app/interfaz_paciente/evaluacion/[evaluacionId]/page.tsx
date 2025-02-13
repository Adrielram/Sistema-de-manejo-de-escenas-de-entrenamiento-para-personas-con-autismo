'use client'

import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'
import { useState, useEffect } from 'react'
import ResponderForm from '../../../../components/ResponderForm'
import RevisionFormulario from '../../../../components/RevisionFormulario'
import { RootState } from "../../../../../store/store";
import { useSelector } from "react-redux";

export default function Evaluacion() {
  const { evaluacionId } = useParams<{ evaluacionId: string }>()
  const searchParams = useSearchParams()
  const verRevision = searchParams.get('ver_revision') === 'true'
  const { username } = useSelector((state: RootState) => state.user); // Obtén el userId desde Redux
  const [dni, setDni] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const formIdNumber = Number(evaluacionId)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
      const fetchDni = async () => {
        if (!username) {
          console.error('Username no disponible')
          return
        }
  
        try {
          const response = await fetch(`${baseUrl}get-dni/?username=${encodeURIComponent(username)}`,{ credentials: 'include' })
          if (!response.ok) {
            throw new Error('Error al obtener el DNI del terapeuta')
          }
  
          const data = await response.json()
          setDni(String(data.dni))
        } catch (error) {
          console.error('Error al obtener el DNI del terapeuta:', error)
          setDni(null)
        } finally {
          setLoading(false)
        }
      }
  
      fetchDni()
    }, [username])

  if (loading) {
    return <div className="text-gray-500">Cargando...</div>
  }

  return (
    <div className="p-6">    
      {verRevision ? (
        <RevisionFormulario
        formularioId={formIdNumber} 
        pacienteDni={dni}
        rolUsuario="persona"
      />
      ) : (
        <ResponderForm idform={evaluacionId} dni={dni} />
      )}
    </div>
  )
}
