"use client"
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store'

const Selection: React.FC = () => {
  const { center } = useSelector((state: RootState) => state.user)

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl">
        <div className="p-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-semibold text-gray-800">
                Centro de Salud Seleccionado
              </h2>
              <p className="text-2xl font-bold text-blue-600 mt-4 p-4 bg-blue-50 rounded-lg">
                {center || "No seleccionado"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Selection