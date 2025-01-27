'use client'

import { useSearchParams } from 'next/navigation'
import React from 'react'

const Revision = () => {
  const searchParams = useSearchParams()
  const form_id = searchParams.get('form_id')

  return (
    <div>form id: {form_id}</div>
  )

}

export default Revision