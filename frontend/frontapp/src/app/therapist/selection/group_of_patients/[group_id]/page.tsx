"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Paciente {
  dni: number;
  nombre: string;
}

const EditGroup: React.FC<{ params: Promise<{ group_id: string }> }> = ({ params }) => {
  const [grupoId, setGrupoId] = useState<string | null>(null);
  const [nombre_grupo, setNombreGrupo] = useState("");
  const [pacientesDisponibles, setPacientesDisponibles] = useState<Paciente[]>([]);
  const [pacientesEnGrupo, setPacientesEnGrupo] = useState<Paciente[]>([]);
  const [pacientesSeleccionados, setPacientesSeleccionados] = useState<Set<number>>(new Set());

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    const unwrapParams = async () => {
      try {
        const resolvedParams = await params;
        setGrupoId(resolvedParams.group_id);
      } catch (error) {
        console.error("Error resolviendo params:", error);
      }
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!grupoId) return;

    const fetchGroupDetails = async () => {
      try {
        const response = await fetch(`${baseUrl}grupoById/${grupoId}/`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos del grupo");
        }
        const data = await response.json();
        setNombreGrupo(data.nombre || "");
      } catch (error) {
        console.error(error);
        alert("No se pudieron cargar los datos del grupo");
      }
    };

    const fetchPacientesDisponibles = async () => {
      try {
        const response = await fetch(`${baseUrl}get_patients_not_in_group/?group_id=${grupoId}`);
        if (!response.ok) {
          throw new Error("Error al obtener los pacientes disponibles");
      };
      unwrapParams();
    }, [params]);    
  
    // Cargar los datos de la escena al montar el componente
    useEffect(() => {
      if (!grupoId) return;

      const fetchScene = async () => {
        console.log("Iniciando fetch para grupoId:", grupoId); // <-- Log antes de la solicitud

        try {
          const response = await fetch(`${baseUrl}grupoById/${grupoId}/`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include' // Include cookies (to handle JWT cookie
            });
          console.log("response" , response);

          if (!response.ok) {
            throw new Error("Error al obtener los datos de la escena");
          }
          const data = await response.json();
          console.log("data",data);
          setNombreGrupo(data.nombre || "");

        } catch (error) {
          console.error(error);
          alert("No se pudieron cargar los datos de la escena");

        }
        const data = await response.json();
        setPacientesDisponibles(data);
      } catch (error) {
        console.error(error);
        alert("No se pudieron cargar los pacientes disponibles");
      }
    };

    const fetchPacientesEnGrupo = async () => {
      try {
        const response = await fetch(`${baseUrl}get_patients_per_group/?group_id=${grupoId}`);
        if (!response.ok) {
          throw new Error("Error al obtener los pacientes en el grupo");
        }
        const data = await response.json();
        setPacientesEnGrupo(data);
        // Initialize selected patients with those already in the group
        setPacientesSeleccionados(new Set(data.map((paciente: Paciente) => paciente.dni)));
      } catch (error) {
        console.error(error);
        alert("No se pudieron cargar los pacientes en el grupo");
      }
    };

    fetchGroupDetails();
    fetchPacientesDisponibles();
    fetchPacientesEnGrupo();
  }, [grupoId]);

  const handlePacienteSelection = (pacienteId: number) => {
    setPacientesSeleccionados((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pacienteId)) {
        newSet.delete(pacienteId);
      } else {
        newSet.add(pacienteId);
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre_grupo) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const grupoActualizado = {
      nombre: nombre_grupo,
      pacientes: Array.from(pacientesSeleccionados),
    };

    try {
      const response = await fetch(`${baseUrl}groups/${grupoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(grupoActualizado),
      });

      if (response.ok) {
        alert("Grupo actualizado exitosamente");
        router.push("/therapist/selection/group_of_patients");
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar el grupo: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error al actualizar el grupo:", error);
      alert("Ocurrió un error inesperado");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">Editar Grupo</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
          <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-blue-100">
            <div>
              <label htmlFor="nombre_grupo" className="block font-semibold text-gray-700 mb-2">
                Nombre Grupo
              </label>
              <input
                id="nombre_grupo"
                type="text"
                value={nombre_grupo}
                onChange={(e) => setNombreGrupo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
                placeholder="Ingrese el nombre del grupo"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Pacientes en el Grupo</label>
              <div className="space-y-2">
                {pacientesEnGrupo.map((paciente) => (
                  <div key={paciente.dni} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`paciente-${paciente.dni}`}
                      checked={pacientesSeleccionados.has(paciente.dni)}
                      onChange={() => handlePacienteSelection(paciente.dni)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-[#3EA5FF]"
                    />
                    <label htmlFor={`paciente-${paciente.dni}`} className="ml-2 text-gray-800">
                      {paciente.nombre}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-2">Pacientes Disponibles</label>
              <div className="space-y-2">
                {pacientesDisponibles.map((paciente) => (
                  <div key={paciente.dni} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`paciente-${paciente.dni}`}
                      checked={pacientesSeleccionados.has(paciente.dni)}
                      onChange={() => handlePacienteSelection(paciente.dni)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-[#3EA5FF]"
                    />
                    <label htmlFor={`paciente-${paciente.dni}`} className="ml-2 text-gray-800">
                      {paciente.nombre}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full bg-[#3EA5FF] text-white font-semibold py-4 rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroup;