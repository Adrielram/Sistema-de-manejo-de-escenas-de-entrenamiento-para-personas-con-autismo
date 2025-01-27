'use client'

import { useSearchParams } from 'next/navigation'
import React from 'react'

const forms = () => {
  const searchParams = useSearchParams()
  const patient_dni = searchParams.get('patient_dni')

  return (
    <div>{patient_dni}</div>
  )
}

export default forms