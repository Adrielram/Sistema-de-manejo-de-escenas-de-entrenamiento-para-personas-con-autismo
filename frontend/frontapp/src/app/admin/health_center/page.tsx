"use client";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import Image from 'next/image';

interface HealthCenter {
  id: number;
  name: string;
  color: string;
}

export default function HealthCenterPage() {
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);

  useEffect(() => {
    // Paleta de colores en tonos de azul
    const colorPalette = [
      "bg-blue-300", "bg-blue-400", "bg-blue-500", "bg-blue-600", "bg-blue-700",  // Azules
      "bg-orange-300", "bg-orange-400", "bg-orange-500", "bg-orange-600", "bg-orange-700",  // Naranjas
      "bg-purple-300", "bg-purple-400", "bg-purple-500", "bg-purple-600", "bg-purple-700",  // Violetas
      "bg-teal-300", "bg-teal-400", "bg-teal-500", "bg-teal-600", "bg-teal-700"  // Celestes
    ];
    

    // Generar colores aleatorios sin repetición
    const generateUniqueColors = (count: number) => {
      const shuffled = colorPalette.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    const colors = generateUniqueColors(6);

    const mockHealthCenters: HealthCenter[] = [
      { id: 1, name: "Centro de Salud Tandil", color: colors[0] },
      { id: 2, name: "Hospital San Martín", color: colors[1] },
      { id: 3, name: "Clínica del Sol", color: colors[2] },
      { id: 4, name: "Centro Médico Sur", color: colors[3] },
      { id: 5, name: "Hospital Regional Norte", color: colors[4] },
      { id: 6, name: "Consultorio Los Álamos", color: colors[5] },
    ];

    setHealthCenters(mockHealthCenters);
  }, []);

  const handleDelete = (id: number) => {
    setHealthCenters(healthCenters.filter(center => center.id !== id));
  };

  return (
    <div className="container mx-auto p-6">
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
              <h2 className="text-xl font-semibold text-black">{center.name}</h2>
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
