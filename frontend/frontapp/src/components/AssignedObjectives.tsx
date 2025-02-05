import { useCallback, useEffect, useState } from "react";

interface AssignedObjectivesProps {
  patientId: string | null; // Acepta null
}

const AssignedObjectives = ({ patientId }: AssignedObjectivesProps) => {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchAssignedObjectives = useCallback(async () => {
    if (!patientId) {
      console.error("patientId es null o undefined");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}objetivos-es-paciente/?user_id=${patientId}`);
      if (!response.ok) {
        throw new Error("Error al obtener los objetivos");
      }
      const data = await response.json();
      setObjectives(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  const handleUnassignObjective = async (objectiveId: number) => {
    try {
      const response = await fetch(`${baseUrl}patients/${patientId}/objectives/${objectiveId}/unassign/`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Error al desasignar el objetivo");
      }
      setObjectives(objectives.filter((obj) => obj.id !== objectiveId));
      alert("Objetivos Desasignados Correctamente");

    } catch (err) {
      console.error("Unassign error:", err);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchAssignedObjectives();
    } else {
      setLoading(false);
    }
  }, [fetchAssignedObjectives, patientId]);

  if (!patientId) {
    return <div className="text-gray-500 text-center py-4">No se ha seleccionado un paciente.</div>;
  }

  if (loading) {
    return <div>Cargando objetivos...</div>;
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4 text-lg">
        Objetivos Asignados
      </h3>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {objectives.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No hay objetivos asignados.
          </div>
        ) : (
          objectives.map((objective) => (
            <div
              key={objective.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span className="text-gray-800 font-medium">
                {objective.objetivo_id.nombre}
              </span>
              <button
                onClick={() => handleUnassignObjective(objective.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignedObjectives;