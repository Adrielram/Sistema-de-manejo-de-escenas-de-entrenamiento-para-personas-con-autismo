import React, { useCallback, useEffect, useState } from "react";

interface Pathology {
  id: number;
  nombre: string;
  descripcion: string;
}

interface AssignedPathology {
  id: number;
  patologia_id: Pathology;
  certeza: number;
  nombre: string;
}

interface UserPathologiesProps {
  userId: string | null;
}

const UserPathologies = ({ userId }: UserPathologiesProps) => {
  const [assignedPathologies, setAssignedPathologies] = useState<AssignedPathology[]>([]);
  const [allPathologies, setAllPathologies] = useState<Pathology[]>([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchPathologies = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log("Fetching pathologies for user:", userId);
      // Obtener las patologías asignadas al usuario
      const assignedRes = await fetch(`${baseUrl}get_pathologies_from_user/${userId}/`);
      if (!assignedRes.ok) throw new Error("Error al obtener patologías asignadas");
      const assignedData: AssignedPathology[] = await assignedRes.json();

      // Obtener todas las patologías disponibles
      const allRes = await fetch(`${baseUrl}patologias/`);
      if (!allRes.ok) throw new Error("Error al obtener todas las patologías");
      const allData: Pathology[] = await allRes.json();
      console.log("assignedData:", assignedData);
      console.log("allData:", allData);
      
      // Filtrar las patologías disponibles (las que aún no están asignadas)
      const availablePathologies = allData.filter(
        (p) => !assignedData.some((ap) => ap.id === p.id)
      );
      
      // Ordenar por certeza descendente
      assignedData.sort((a, b) => b.certeza - a.certeza);

      setAssignedPathologies(assignedData);
      setAllPathologies(availablePathologies);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleAssignPathology = async (pathologyId: number) => {
    try {
      const response = await fetch(`${baseUrl}assign-pathology/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, patologia_id: pathologyId}),
      });
      if (!response.ok) throw new Error("Error al asignar la patología");
      
      fetchPathologies(); // Refrescar lista
    } catch (err) {
      console.error("Assign error:", err);
    }
  };

  const handleUnassignPathology = async (pathologyId: number) => {
    try {
      const response = await fetch(`${baseUrl}unassign-pathology/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, patologia_id: pathologyId }),
      });
      if (!response.ok) throw new Error("Error al eliminar la patología");

      fetchPathologies(); // Refrescar lista
    } catch (err) {
      console.error("Unassign error:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPathologies();
    }
  }, [fetchPathologies, userId]);

  if (!userId) return <div className="text-gray-500 text-center py-4">No se ha seleccionado un usuario.</div>;

  if (loading) return <div>Cargando patologías...</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4 text-lg">Patologías del Usuario</h3>

      {/* Lista de patologías asignadas */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {assignedPathologies.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No hay patologías asignadas.</div>
        ) : (
          assignedPathologies.map((pathology) => (
            <div key={pathology.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors">
              <span className="text-gray-800 font-medium">{pathology.nombre} ({pathology.certeza}%)</span>

              <button
                onClick={() => handleUnassignPathology(pathology.id)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Selector de nuevas patologías */}
      <div className="mt-4">
        <h4 className="text-gray-700 font-semibold">Agregar nueva patología</h4>
        <select
          className="w-full p-2 border rounded-lg mt-2"
          onChange={(e) => handleAssignPathology(Number(e.target.value))}
        >
          <option value="">Seleccionar patología...</option>
          {allPathologies.map((pathology) => (
            <option key={pathology.id} value={pathology.id}>
              {pathology.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UserPathologies;
