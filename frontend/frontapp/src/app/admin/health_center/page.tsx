"use client";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import Image from "next/image";

//const baseUrl = process.env.NEXT_PUBLIC_API_URL;

interface HealthCenter {
  id: number;
  nombre: string;
  color: string;
}

export default function HealthCenterPage() {
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);

  useEffect(() => {
    // Paleta de colores en tonos variados
    const colorPalette = [
      "bg-blue-300", "bg-blue-400", "bg-blue-500", "bg-blue-600", "bg-blue-700", // Azules
      "bg-orange-300", "bg-orange-400", "bg-orange-500", "bg-orange-600", "bg-orange-700", // Naranjas
      "bg-purple-300", "bg-purple-400", "bg-purple-500", "bg-purple-600", "bg-purple-700", // Violetas
      "bg-teal-300", "bg-teal-400", "bg-teal-500", "bg-teal-600", "bg-teal-700", // Celestes
    ];

    const fetchHealthCenters = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/health_centers/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Error al obtener los centros de salud:", response.statusText);
          return;
        }

        const data: { id: number; nombre: string }[] = await response.json();

        // Asignar colores aleatorios a cada centro de salud
        const shuffledColors = colorPalette.sort(() => 0.5 - Math.random());
        const centersWithColors = data.map((center, index) => ({
          ...center,
          color: shuffledColors[index % colorPalette.length],
        }));

        setHealthCenters(centersWithColors);
      } catch (error) {
        console.error("Error en la solicitud al backend:", error);
      }
    };

    fetchHealthCenters();
  }, []);
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/health_centers/${id}/delete/`, {
        method: "DELETE",
        credentials: "include", // Uso del token solo para eliminación
      });
  
      if (response.ok) {
        setHealthCenters(healthCenters.filter((center) => center.id !== id));
      } else {
        console.error("Error al eliminar el centro de salud:", response.statusText);
      }
    } catch (error) {
      console.error("Error al enviar la solicitud de eliminación:", error);
    }
  };


  return (
    <div className="container mx-auto p-6 lg:pl-64">
      <h1 className="text-3xl font-bold mb-6 text-black">Centros de Salud</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {healthCenters.map((center) => (
          <div key={center.id} className="flex flex-col items-center">
            <div className={`w-48 h-48 rounded-lg shadow-md ${center.color} flex items-center justify-center`}>
              <Image
                src="/icon/hospital.png"
                alt="Centro de Salud"
                width={120}
                height={120}
                className="rounded-full"
              />
            </div>
            <div className="flex items-center justify-center mt-4">
              <h2 className="text-xl font-semibold text-black">{center.nombre}</h2>
              <button
                onClick={() => handleDelete(center.id)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                <FaTrash size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
