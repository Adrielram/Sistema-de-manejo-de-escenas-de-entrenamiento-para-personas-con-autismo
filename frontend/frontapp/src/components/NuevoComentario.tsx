"use client";

import React from "react";

interface NuevoComentarioProps {
  formData: {
    user: string;
    escena: number;
    texto: string;
    visibilidad: boolean;
    comentario_respondido: number | null;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    user: string;
    escena: number;
    texto: string;
    visibilidad: boolean;
    comentario_respondido: number | null;
  }>>;
  onCommentAdded: () => void; // Nueva función para notificar que se agregó un comentario
}

export const NuevoComentario: React.FC<NuevoComentarioProps> = ({ formData, setFormData, onCommentAdded }) => {
  const handleAddComment = async () => {
    if (formData.texto.trim() !== "") {
      try {
        console.log(formData);
        const response = await fetch("http://localhost:8000/api/registrar_comentario/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Error al guardar el comentario");
        }

        // Llama a la función para notificar que se agregó un comentario
        onCommentAdded();
        setFormData((prev) => ({ ...prev, texto: "" }));
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Añadir un comentario
      </h3>
      <div className="flex flex-col space-y-2">
        <textarea
          value={formData.texto}
          onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
          placeholder="Escribe tu comentario..."
          className="border border-gray-300 rounded-lg py-2 px-4 w-full"
        />
        <div className="flex items-center gap-4 ml-auto">
          <label className="flex items-center cursor-pointer space-x-2">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.visibilidad}
                onChange={(e) => setFormData({ ...formData, visibilidad: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-red-500 rounded-full peer-checked:bg-blue-500 transition-all"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition-all"></div>
            </div>
            <span className="text-gray-700 text-sm">
              {formData.visibilidad ? "Público" : "Privado"}
            </span>
          </label>
          <button
            onClick={handleAddComment}
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-lg text-sm shadow-sm hover:shadow-md transition-all"
          >
            Añadir Comentario
          </button>
        </div>
      </div>
    </div>
  );
};