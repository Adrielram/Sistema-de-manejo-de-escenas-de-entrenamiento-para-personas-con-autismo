'use client'

import { useSearchParams } from 'next/navigation'
import React from 'react'

const FollowPatient = () => {
    const searchParams = useSearchParams()
    const patient_id = searchParams.get('patient_id')
  
    return (
        <div>{patient_id}</div>
    )
}

export default FollowPatient