"use client";

import { useState } from "react";
import ScrollVerticalYHorizontal from "../../../components/ScrollVerticalYHorizontal";

const mockObjetivos = [
    {
      id: 1,
      titulo: "Mejorar la comunicación",
      escenas: [
        {
          id: 101,
          nombre: "Escena 1: Comunicación básica",
          descripcion: "Practicar saludos y presentaciones básicas"
        },
        {
          id: 102,
          nombre: "Escena 2: Conversación simple",
          descripcion: "Mantener una conversación corta sobre temas cotidianos"
        }
      ]
    },
    {
      id: 2,
      titulo: "Desarrollar autonomía",
      escenas: [
        {
          id: 201,
          nombre: "Escena 1: Vestimenta",
          descripcion: "Practicar cómo vestirse de manera independiente"
        },
        {
          id: 202,
          nombre: "Escena 2: Alimentación",
          descripcion: "Aprender a preparar un desayuno simple"
        },
        {
          id: 203,
          nombre: "Escena 3: Higiene",
          descripcion: "Rutina de higiene personal básica"
        }
      ]
    },
    {
      id: 3,
      titulo: "Habilidades sociales",
      escenas: [
        {
          id: 301,
          nombre: "Escena 1: Interacción grupal",
          descripcion: "Participar en actividades grupales"
        },
        {
          id: 302,
          nombre: "Escena 2: Emociones",
          descripcion: "Reconocer y expresar emociones básicas"
        }
      ]
    },
    {
      id: 4,
      titulo: "Aprendizaje académico",
      escenas: [
        {
          id: 401,
          nombre: "Escena 1: Lectura",
          descripcion: "Practicar lectura comprensiva de titulos simples"
        },
        {
          id: 402,
          nombre: "Escena 2: Matemáticas",
          descripcion: "Resolver operaciones matemáticas básicas"
        }
      ]
    },
    {
      id: 5,
      titulo: "Motricidad fina",
      escenas: [
        {
          id: 501,
          nombre: "Escena 1: Escritura",
          descripcion: "Practicar la escritura de letras y números"
        },
        {
          id: 502,
          nombre: "Escena 2: Manualidades",
          descripcion: "Realizar actividades de corte y pegado"
        }
      ]
    },
    {      id: 6,
        titulo: "Motricidad fina",
        escenas: [
          {
            id: 501,
            nombre: "Escena 1: Escritura",
            descripcion: "Practicar la escritura de letras y números"
          },
          {
            id: 502,
            nombre: "Escena 2: Manualidades",
            descripcion: "Realizar actividades de corte y pegado"
          }
        ]},
        {      id: 7,
            titulo: "Motricidad fina",
            escenas: [
              {
                id: 501,
                nombre: "Escena 1: Escritura",
                descripcion: "Practicar la escritura de letras y números"
              },
              {
                id: 502,
                nombre: "Escena 2: Manualidades",
                descripcion: "Realizar actividades de corte y pegado"
              }
            ]},
            {      id: 8,
                titulo: "Motricidad fina",
                escenas: [
                  {
                    id: 501,
                    nombre: "Escena 1: Escritura",
                    descripcion: "Practicar la escritura de letras y números"
                  },
                  {
                    id: 502,
                    nombre: "Escena 2: Manualidades",
                    descripcion: "Realizar actividades de corte y pegado"
                  }
                ]},
                {      id: 9,
                    titulo: "Motricidad fina",
                    escenas: [
                      {
                        id: 501,
                        nombre: "Escena 1: Escritura",
                        descripcion: "Practicar la escritura de letras y números"
                      },
                      {
                        id: 502,
                        nombre: "Escena 2: Manualidades",
                        descripcion: "Realizar actividades de corte y pegado"
                      }
                    ]},
                    {      id: 10,
                        titulo: "Motricidad fina",
                        escenas: [
                          {
                            id: 501,
                            nombre: "Escena 1: Escritura",
                            descripcion: "Practicar la escritura de letras y números"
                          },
                          {
                            id: 502,
                            nombre: "Escena 2: Manualidades",
                            descripcion: "Realizar actividades de corte y pegado"
                          }
                        ]},
                        {      id: 11,
                            titulo: "Motricidad fina",
                            escenas: [
                              {
                                id: 501,
                                nombre: "Escena 1: Escritura",
                                descripcion: "Practicar la escritura de letras y números"
                              },
                              {
                                id: 502,
                                nombre: "Escena 2: Manualidades",
                                descripcion: "Realizar actividades de corte y pegado"
                              }
                            ]},
                            {      id: 12,
                                titulo: "Motricidad fina",
                                escenas: [
                                  {
                                    id: 501,
                                    nombre: "Escena 1: Escritura",
                                    descripcion: "Practicar la escritura de letras y números"
                                  },
                                  {
                                    id: 502,
                                    nombre: "Escena 2: Manualidades",
                                    descripcion: "Realizar actividades de corte y pegado"
                                  }
                                ]},
                                {      id: 13,
                                    titulo: "Motricidad fina",
                                    escenas: [
                                      {
                                        id: 501,
                                        nombre: "Escena 1: Escritura",
                                        descripcion: "Practicar la escritura de letras y números"
                                      },
                                      {
                                        id: 502,
                                        nombre: "Escena 2: Manualidades",
                                        descripcion: "Realizar actividades de corte y pegado"
                                      }
                                    ]}
  ];

export default function Page() {
  const [escenasActivas, setEscenasActivas] = useState(mockObjetivos[0].escenas);
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<number>(mockObjetivos[0].id);

  const handleObjetivoClick = (objetivoId: number) => {
    const objetivo = mockObjetivos.find(obj => obj.id === objetivoId);
    if (objetivo) {
      setObjetivoSeleccionado(objetivoId);
      setEscenasActivas(objetivo.escenas);
    }
  };

  return (
    <div className="flex h-screen p-4 gap-6">
      {/* Sección de Objetivos - 40% del ancho */}
      <div className="w-2/5">
        <h2 className="text-xl font-bold mb-2">Objetivos</h2>
        <ScrollVerticalYHorizontal 
          elementos={mockObjetivos}
          onObjetivoClick={handleObjetivoClick}
          selectedObjetivoId={objetivoSeleccionado}
        />
      </div>

      {/* Separador vertical */}
      <div className="w-0.5 bg-gray-200"></div>

      {/* Sección de Escenas - 60% del ancho */}
      <div className="w-3/5">
        <h2 className="text-xl font-bold mb-2">
          Escenas {objetivoSeleccionado && `- ${mockObjetivos.find(obj => obj.id === objetivoSeleccionado)?.titulo}`}
        </h2>
        <div className="h-[calc(100vh-100px)] overflow-auto bg-gray-100 rounded-lg shadow p-4">
          <ul className="space-y-4">
            {escenasActivas.map((escena) => (
              <li
                key={escena.id}
                className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-blue-600 mb-2">{escena.nombre}</h3>
                <p className="text-gray-600">{escena.descripcion}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}