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
        const response = await fetch(`${baseUrl}get-dni/?username=${encodeURIComponent(username)}`)
        if (!response.ok) {
          throw new Error('Error al obtener el DNI del terapeuta')
        }

        const data = await response.json()
        setTerapeutaDni(Number(data.dni)) // Conversión de string a number
      } catch (error) {
        console.error('Error al obtener el DNI del terapeuta:', error)
        setTerapeutaDni(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDni()
  }, [username])

  const formIdNumber = form_id ? Number(form_id) : null // Conversión de form_id a number

  if (!formIdNumber || !patient_dni) {
    return <div>Error: Faltan parámetros obligatorios</div>
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!terapeutaDni) {
    return <div>Error: No se pudo obtener el DNI del terapeuta</div>
  }

  return (
    <RevisionFormulario
      formularioId={formIdNumber}
      pacienteDni={patient_dni}
      terapeutaDni={terapeutaDni}
      rolUsuario="terapeuta"
    />
  )
}

export default Revision