'use client';

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false); // Resetear el estado de error al inicio
    
    try {
      const res = await fetch(`http://localhost:8000/api/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (data.message) {
        setMessage(data.message);
        setIsError(false);
        setEmail(""); // Limpiar solo en caso de éxito
      } else if (data.error) {
        setMessage(data.error);
        setIsError(true);
      }

    } catch {
      setMessage("Error de conexión. Por favor, intenta nuevamente.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-96">
        <h2 className="text-2xl font-semibold text-center mb-6">Recuperar Contraseña</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-2 rounded-lg transition duration-200 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            isError 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }`}>
            <p className="text-center text-sm">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}