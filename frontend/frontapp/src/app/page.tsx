"use client";

import { useState } from "react";

const WelcomeEmailForm: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/send-email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientEmail }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("¡Correo de bienvenida enviado exitosamente!");
        setRecipientEmail(""); // Limpiar el campo después de enviar
      } else {
        setStatus(result.error || "Error al enviar el correo.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("Error al enviar el correo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <form onSubmit={handleSubmit}>
        <h1 className="text-lg font-bold mb-4">Enviar Correo de Bienvenida</h1>

        <label className="block mb-2">
          Correo Electrónico:
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full border px-2 py-1 mt-1 "
            required
          />
        </label>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-3 hover:bg-blue-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Enviar Correo"}
        </button>
      </form>

      {status && (
        <p className={`mt-4 ${status.startsWith("Error") ? "text-red-500" : "text-green-500"}`}>
          {status}
        </p>
      )}
    </div>
  );
};

export default WelcomeEmailForm;
