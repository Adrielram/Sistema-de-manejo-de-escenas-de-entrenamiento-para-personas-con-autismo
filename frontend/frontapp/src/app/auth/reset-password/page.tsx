"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function ResetPassword() {
    const searchParams = useSearchParams();
    const router = useRouter(); 
    const token = searchParams.get("token");
    const uid = searchParams.get("uid");

    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordHidden, setIsPasswordHidden] = useState(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;


  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);
  
    try {
      const res = await fetch(`${baseUrl}reset-password/`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, uid, new_password: password }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        setMessage("Contraseña cambiada con éxito");
        setIsError(false);
        setPassword("");
  
        setTimeout(() => {
          router.push("/auth/login"); 
        }, 2000);
      } else {
        setMessage(data.error || "Error al cambiar la contraseña");
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
        <h2 className="text-2xl font-semibold text-center mb-6">Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit}>
          <div className="relative mb-4">
            <input
                type={isPasswordHidden ? 'password' : 'text'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
                className="w-full p-3 border border-gray-300 rounded-md mt-1 text-black pr-10"
                />
                <Image
                src="/images/ocultarContra.jpg"
                alt="Mostrar/Ocultar Contraseña"
                width={24}
                height={24}
                className={`absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer ${
                    isPasswordHidden ? 'opacity-100' : 'opacity-50'
                }`}
                onClick={() => setIsPasswordHidden(!isPasswordHidden)}
                />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full font-bold py-2 rounded-lg transition duration-200 ${
              isLoading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {isLoading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            isError 
              ? "bg-red-100 text-red-700 border border-red-200" 
              : "bg-green-100 text-green-700 border border-green-200"
          }`}>
            <p className="text-center text-sm">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
