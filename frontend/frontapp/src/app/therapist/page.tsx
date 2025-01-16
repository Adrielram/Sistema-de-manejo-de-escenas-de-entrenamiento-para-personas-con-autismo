'use client';
import React from 'react'
import { useDispatch } from 'react-redux';
import { setCentroSalud } from '../../../slices/userSlice'  
export default function Therapist () { 
  const dispatch = useDispatch();
  const handleSetCentroSalud = () => {
  dispatch(setCentroSalud({centro: 'centro1'}))
  }

  return (
    <div className='text-black'>
      <button onClick={handleSetCentroSalud} className='bg-blue-500 text-white px-4 py-2 rounded-lg'>
        Centro de Salud
      </button>
    </div>
  )
}

