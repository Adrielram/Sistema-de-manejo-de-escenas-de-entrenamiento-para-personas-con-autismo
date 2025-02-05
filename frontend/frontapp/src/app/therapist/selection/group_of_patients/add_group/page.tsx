"use client";

import { RootState } from "../../../../../../store/store";
import { create_group } from "../../../../../utils/api"; // Asegúrate de importar correctamente la función
import { useSelector } from "react-redux";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Grupo {
  nombre_grupo: string;
  nombre_centro: string;
  terapeuta: string;
}

interface Persona {
  dni: string;
  nombre: string;
}

const CreateGroup: React.FC = () => {
  const { center, username } = useSelector((state: RootState) => state.user);
  const [nombre_grupo, setNombreGrupo] = useState("");
  const [pacientesEnGrupo, setPacientesEnGrupo] = useState<Persona[]>([]);
  const [pacientesSeleccionados, setPacientesSeleccionados] = useState<Set<string>>(new Set());
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [terapeutasEnGrupo, setTerapeutasEnGrupo] = useState<Persona[]>([]);
  const [terapeutasSeleccionados, setTerapeutasSeleccionados] = useState<Set<string>>(new Set());

  // Lógica para traer los pacientes desde la URL
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        const response = await fetch(`${baseUrl}get_patients/`); // Cambia "/api/pacientes" por la URL correcta
        if (!response.ok) {
          throw new Error("Error al cargar los pacientes");
        }
        const data: Persona[] = await response.json();
        setPacientesEnGrupo(data);
      } catch (error) {
        console.error("Error al traer los pacientes:", error);
        alert("Hubo un error al cargar los pacientes");
      }
    };

    fetchPacientes();
  }, []);


  useEffect(() => {
    const fetchTerapeutas = async () => {
      try {
        const response = await fetch(`${baseUrl}getTherapistsExcluding/${username}/`); // Cambia "/api/pacientes" por la URL correcta
        if (!response.ok) {
          throw new Error("Error al cargar los terapeutas");
        }
        const data: Persona[] = await response.json();
        setTerapeutasEnGrupo(data);
      } catch (error) {
        console.error("Error al traer los pacientes:", error);
        alert("Hubo un error al cargar los pacientes");
      }
    };
    fetchTerapeutas();
  }, [username]);

  // Manejar la selección de pacientes
  const handlePacienteSelection = (dni: string) => {
    setPacientesSeleccionados((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dni)) {
        newSet.delete(dni); // Quita el paciente si ya estaba seleccionado
      } else {
        newSet.add(dni); // Agrega el paciente si no estaba seleccionado
      }
      return newSet;
    });
  };

  const handleTherapistSelection = (dni: string) => {
    setTerapeutasSeleccionados((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dni)) {
        newSet.delete(dni); // Quita el paciente si ya estaba seleccionado
      } else {
        newSet.add(dni); // Agrega el paciente si no estaba seleccionado
      }
      return newSet;
    });
  };

  // Manejar el envío del formulario (crear grupo)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre_grupo || pacientesSeleccionados.size === 0) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const grupoData: Grupo = {
      nombre_grupo: nombre_grupo,
      nombre_centro: center,
      terapeuta: username,
    };

    try {
      // Llamar a la función de creación
      const result = await create_group({
        ...grupoData,
        pacientes: Array.from(pacientesSeleccionados), // Pasar los DNIs seleccionados
        terapeutas: Array.from(terapeutasSeleccionados),
      });

      if (result.success) {
        alert("Grupo creado exitosamente");
        router.push("/therapist/selection/group_of_patients"); // Redirigir después de crear
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error inesperado");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">
          Crear Grupo
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8">
          {/* Columna izquierda */}
          <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-blue-100">
            <div>
              <label
                htmlFor="nombre_grupo"
                className="block font-semibold text-gray-700 mb-2"
              >
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
              <label className="block font-semibold text-gray-700 mb-2">
                Pacientes a Agregar
              </label>
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
                    <label
                      htmlFor={`paciente-${paciente.dni}`}
                      className="ml-2 text-gray-800"
                    >
                      {paciente.nombre}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div> { terapeutasEnGrupo.length > 0 && (<><label className="block font-semibold text-gray-700 mb-2">
              Terapeutas a Agregar
            </label><div className="space-y-2">
                {terapeutasEnGrupo.map((terapeuta) => (
                  <div key={terapeuta.dni} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`paciente-${terapeuta.dni}`}
                      checked={terapeutasSeleccionados.has(terapeuta.dni)}
                      onChange={() => handleTherapistSelection(terapeuta.dni)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-[#3EA5FF]" />
                    <label
                      htmlFor={`paciente-${terapeuta.dni}`}
                      className="ml-2 text-gray-800"
                    >
                      {terapeuta.nombre}
                    </label>
                  </div>
                ))}
              </div></>)}
              
            </div>
          </div>

          {/* Botón de submit a pantalla completa */}
          <div className="lg:col-span-2 mt-6">
            <button
              type="submit"
              className="w-full bg-[#3EA5FF] text-white font-semibold py-4 rounded-xl hover:bg-[#2E8BFF] transition duration-300 shadow-lg hover:shadow-xl"
            >
              Crear Grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
