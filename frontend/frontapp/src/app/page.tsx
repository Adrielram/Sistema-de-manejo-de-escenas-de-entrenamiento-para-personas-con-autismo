
'use client'

import { useState } from "react";
import DropDownList from "@/components/DropDownList";

import Button from "@/components/SmallButton";
//import { Button } from "@headlessui/react";

export default function Home() {

  const names = ["Voces del Espectro", "Superando Barreras", "Mentes Maravillosas", "Diferentes, Iguales"]; // Opciones de la lista
  const [selectedName, setSelectedName] = useState<string | null>(null); // Nombre seleccionado

  const handleSelect = (name: string) => {
    setSelectedName(name); 
    console.log("Opción seleccionada:", name);
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-black">
      <div>
        <h1 className="mb-4 text-2xl font-bold">
          Seleccionaste: {selectedName || "Ninguno"}
        </h1>
        <DropDownList items={names} listName="Asociar Grupo" onSelect={handleSelect} />
      </div>
    </main>
  );
}
