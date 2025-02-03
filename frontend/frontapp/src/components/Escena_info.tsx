"use_client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from "../../store/store";

interface CondicionCumple {
  cumple_condiciones: {   
    edad: boolean;
    fecha: boolean;
    objetivo: boolean;
  };
  mensaje_bloqueo?: string | null;
}


interface CondicionProp {
  id: number;
  edad?: number;
  fecha?: string;
  objetivo?: string;
}

interface Escena {
  id: number;
  nombre: string;
  descripcion: string;
  idioma: string;
  acento: string;
  complejidad: number;
  condicion?: CondicionProp;
  bloqueada: boolean;
  mensaje_bloqueo?: string;
}

interface EscenaInfoProps {
  escena: Escena;
  escenaHandleClick: () => void;
}

const EscenaInfo: React.FC<EscenaInfoProps> = ({ escena, escenaHandleClick }) => {

  const { username } = useSelector((state: RootState) => state.user);
  const [condiciones, setCondiciones] = useState<CondicionCumple | null>(null);

  const verificarCondiciones = async (idEscena: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/verificar-condiciones/?username=${username}&escena_id=${idEscena}`
      );

      if (!response.ok) {
        throw new Error(`Error en la verificación de condiciones: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al verificar condiciones:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchCondiciones = async () => {
      if (escena && escena.id) {
        const result= await verificarCondiciones(escena.id);
        setCondiciones(result);
      }
    };

    fetchCondiciones();
  }, [escena]);

    // Determinar si el botón debe estar deshabilitado
    let isButtonDisabled = false;
    if ((condiciones?.mensaje_bloqueo) || (escena?.bloqueada)) {
      isButtonDisabled = true;
    }

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
            </ul>

            {/* Mostrar la información de condiciones si existe */}
            {escena.condicion && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Condición:</h3>
                <ul className="list-disc list-inside space-y-2">
                  {escena.condicion.edad && (
                    <li className={`text-gray-700 ${condiciones.cumple_condiciones.edad ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="font-semibold text-gray-900">Edad mínima:</span> {escena.condicion.edad}
                    </li>
                  )}
                  {escena.condicion.fecha && (
                    <li className={`text-gray-700 ${condiciones.cumple_condiciones?.fecha ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="font-semibold text-gray-900">Fecha mínima:</span>
                      <span>
                        {new Date(escena.condicion.fecha).toISOString().slice(8, 10) + '/' +
                          new Date(escena.condicion.fecha).toISOString().slice(5, 7) + '/' +
                          new Date(escena.condicion.fecha).toISOString().slice(0, 4)}
                      </span>
                    </li>
                  )}
                  {escena.condicion.objetivo && (
                    <li className={`text-gray-700 ${condiciones.cumple_condiciones?.objetivo ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="font-semibold text-gray-900">Objetivo necesario:</span> {escena.condicion.objetivo}
                    </li>
                  )}
                </ul>
              </div>
            )}

          <button
            onClick={isButtonDisabled ? undefined : escenaHandleClick}
            disabled={isButtonDisabled}
            title={isButtonDisabled ? condiciones?.mensaje_bloqueo : undefined}
            className={`mt-6 w-full font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${isButtonDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {escena?.bloqueada ?'Escena bloqueada' : 'Ver video'}
          </button>
          {isButtonDisabled && condiciones?.mensaje_bloqueo && (
                <div className=" border-gray-300 rounded-lg ">
                  <p className="text-sm text-red-600">{condiciones.mensaje_bloqueo}</p>
                </div>
              )}
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-gray-500 bg-gray-100 rounded-lg shadow-md border border-gray-200">
          <p className="text-lg font-medium">Selecciona una escena para ver los detalles.</p>
        </div>
      )}
    </div>
  );
}

export default EscenaInfo;
