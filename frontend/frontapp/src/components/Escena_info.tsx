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
  const [condiciones, setCondiciones] = useState<CondicionCumple>();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const verificarCondiciones = async (idEscena: number) => {
    try {
      const response = await fetch(
        `${baseUrl}verificar-condiciones/?username=${username}&escena_id=${idEscena}`,
        { credentials: 'include' }

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
    <div className="w-full overflow-auto">
      {escena ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
            {escena.nombre}
            </h2>
            <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Descripción:</span><br />
              {escena.descripcion}
            </p>
            <div className="space-y-2">
              <div className="text-gray-700">
              <span className="font-medium text-gray-900">Complejidad:</span><br />
              {escena.complejidad}
              </div>
              <div className="text-gray-700">
              <span className="font-medium text-gray-900">Idioma:</span><br />
              {escena.idioma}
              </div>
              <div className="text-gray-700">
              <span className="font-medium text-gray-900">Acento:</span><br />
              {escena.acento}
              </div>
            </div>

            {escena.condicion && condiciones && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Condiciones:</h3>
                <div className="space-y-2">
                  {escena.condicion.edad && (
                    <div className={condiciones.cumple_condiciones.edad ? 'text-green-600' : 'text-red-600'}>
                      Edad mínima: {escena.condicion.edad}
                    </div>
                  )}
                  {escena.condicion.fecha && (
                    <div className={condiciones.cumple_condiciones?.fecha ? 'text-green-600' : 'text-red-600'}>
                      Fecha mínima: {new Date(escena.condicion.fecha).toLocaleDateString()}
                    </div>
                  )}
                  {escena.condicion.objetivo && (
                    <div className={condiciones.cumple_condiciones?.objetivo ? 'text-green-600' : 'text-red-600'}>
                      Objetivo necesario: {escena.condicion.objetivo}
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={isButtonDisabled ? undefined : escenaHandleClick}
              disabled={isButtonDisabled}
              title={isButtonDisabled ? condiciones?.mensaje_bloqueo : undefined}
              className={`w-full py-3 px-4 rounded-lg font-medium mt-4 ${
                isButtonDisabled 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {escena?.bloqueada ? 'Escena bloqueada' : 'Ver video'}
            </button>
            
            {isButtonDisabled && condiciones?.mensaje_bloqueo && (
              <p className="text-sm text-red-600 mt-2">
                {condiciones.mensaje_bloqueo}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">Selecciona una escena para ver los detalles</p>
        </div>
      )}
    </div>
  );
};

export default EscenaInfo;