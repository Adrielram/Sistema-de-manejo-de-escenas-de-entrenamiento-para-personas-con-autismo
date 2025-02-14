'use client'

import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import RevisionFormulario from '../../../../../../../components/RevisionFormulario'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../../../../../store/store'

const Revision = () => {
  const searchParams = useSearchParams()
  const form_id = searchParams.get('form_id')
  const patient_dni = searchParams.get('patient_dni')
  const { username } = useSelector((state: RootState) => state.user)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [terapeutaDni, setTerapeutaDni] = useState<number | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchDni = async () => {
      if (!username) {
        console.error('Username no disponible')
        return
      }

      try {
        const response = await fetch(`${baseUrl}get-dni/?username=${encodeURIComponent(username)}`,
        { credentials: 'include' }
      )
        if (!response.ok) {
          throw new Error('Error al obtener el DNI del terapeuta')
        }

        const data = await response.json()
        setTerapeutaDni(Number(data.dni))
      } catch (error) {
        console.error('Error al obtener el DNI del terapeuta:', error)
        setTerapeutaDni(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDni()
  }, [username])

  const formIdNumber = form_id ? Number(form_id) : null

  if (!formIdNumber || !patient_dni) {
    return <div className="text-red-500 font-bold">Error: Faltan parámetros obligatorios</div>
  }

  if (loading) {
    return <div className="text-gray-500">Cargando...</div>
  }

  if (!terapeutaDni) {
    return <div className="text-red-500">Error: No se pudo obtener el DNI del terapeuta</div>
  }

  // 🔹 Función para habilitar la revisión
  const habilitarRevision = async () => {
    try {
      const response = await fetch(`${baseUrl}habilitar-revision/${formIdNumber}/${patient_dni}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Error al habilitar la revisión')
      }

      alert('Revisión habilitada con éxito')
      //route.push('/therapist/selection/group_of_patients/patients')
    } catch (error) {
      console.error('Error:', error)
      alert('Hubo un problema al habilitar la revisión')
    }
    
  }

  // 🔹 Función para habilitar volver a realizar
  const habilitarVolverARealizar = async () => {
    try {
      const response = await fetch(`${baseUrl}habilitar-volver-a-realizar/${formIdNumber}/${patient_dni}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Error al habilitar volver a realizar')
      }

      alert('Volver a realizar habilitado con éxito')
    } catch (error) {
      console.error('Error:', error)
      alert('Hubo un problema al habilitar volver a realizar')
    }
  }

  return (
    <div className="p-4">
      <RevisionFormulario
        formularioId={formIdNumber}
        pacienteDni={patient_dni}
        terapeutaDni={terapeutaDni}
        rolUsuario="terapeuta"
      />

      {/* Botones con Tailwind */}
      <div className="mt-6 flex justify-center space-x-4">
        <button 
          onClick={habilitarRevision} 
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-300"
        >
          Habilitar Revisión
        </button>
        <button 
          onClick={habilitarVolverARealizar} 
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300"
        >
          Volver a Realizar
        </button>
      </div>
    </div>
  )
}

export default Revision
