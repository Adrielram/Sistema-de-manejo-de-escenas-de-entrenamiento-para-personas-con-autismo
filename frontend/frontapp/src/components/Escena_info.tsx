'use client'
import React from 'react'

interface Condicion {
    id: number;
    edad?: number;
    fecha?: string;
    objetivo?: string;
    cumple_condiciones: {
        edad: boolean;
        fecha: boolean;
        objetivo: boolean;
    };
}

interface Escena {
    id: number;
    nombre: string;
    descripcion: string;
    idioma: string;
    acento: string;
    complejidad: number;
    condicion: Condicion;
    bloqueada: boolean;
    mensaje_bloqueo?: string;
  }

interface EscenaInfoProps {
  escena: Escena;
  escenaHandleClick: () => void;
}

const EscenaInfo: React.FC<EscenaInfoProps> = ({ escena, escenaHandleClick }) => {
    return (
        
            <div className="w-full md:w-[45%]">
              {escena ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-gray-800">
                    {`Datos completos de la escena: ${escena.nombre}`}
                  </h2>
                  <div className="max-w-lg mx-auto overflow-auto bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <ul className="space-y-4">
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Nombre:</span> {escena.nombre}
                      </li>
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Descripción:</span> {escena.descripcion}
                      </li>
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Complejidad:</span> {escena.complejidad}
                      </li>
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Idioma:</span> {escena.idioma}
                      </li>
                      <li className="text-gray-700">
                        <span className="font-semibold text-gray-900">Acento:</span> {escena.acento}
                      </li>
                      {escena.condicion && (
                        <>
                          {escena.condicion.edad || escena.condicion.fecha || escena.condicion.objetivo ? (
                            <div>
                              <h1>Condición:</h1>
                              {escena.condicion.edad && (
                                <li className="text-gray-700">
                                  <span className="font-semibold text-gray-900">Edad minima:</span> {escena.condicion.edad}
                                </li>
                                  )}
                                {escena.condicion.fecha && (
                                <li className="text-gray-700">
                                    <span className="font-semibold text-gray-900">Fecha mínima:</span> 
                                    <span> 
                                        {
                                         new Date(escena.condicion.fecha).toISOString().slice(8, 10) + '/' + 
                                         new Date(escena.condicion.fecha).toISOString().slice(5, 7) + '/' + 
                                         new Date(escena.condicion.fecha).toISOString().slice(0, 4)
                                        }
                                    </span>
                                </li>
                                  )}
                                {escena.condicion.objetivo && (
                                    <li className="text-gray-700">
                                        <span className="font-semibold text-gray-900">Objetivo necesario:</span> {escena.condicion.objetivo}
                                    </li>
                                )}
                            </div>
                          ) : null}
                        </>
                      )}
                    </ul>
                    <button
                      onClick={escenaHandleClick}
                      disabled={!escena || escena.bloqueada}
                      className={`mt-6 w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
                        escena?.bloqueada 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {escena?.bloqueada ? 'Escena bloqueada' : 'Ver video'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-100 rounded-lg shadow-md border border-gray-200">
                  <p className="text-lg font-medium">Selecciona una escena para ver los detalles.</p>
                </div>
              )}
            </div>
    );
};

export default EscenaInfo
