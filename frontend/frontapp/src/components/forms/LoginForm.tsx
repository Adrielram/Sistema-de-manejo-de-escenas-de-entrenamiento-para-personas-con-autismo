// components/forms/LoginForm.js
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
export default function LoginForm() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const router = useRouter();
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!user || !password) {
      setError('Por favor, ingrese todos los campos');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user, password }),
        credentials: 'include', // Incluir cookies (para manejar la cookie JWT)
      });

      if (response.ok) {
        // Si el login es exitoso, redirige al homepage
        console.log('Login exitoso');
        router.push('/homepage');
      } else {
        const data = await response.json();
        setError(data.detail || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Hubo un problema con el servidor. Inténtalo más tarde.');
    }

    console.log('Enviando datos de login...');
    setUser('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="mb-4">
        <label htmlFor="user" className="block text-sm font-semibold text-black">Usuario</label>
        <input
          type="user"
          id="user"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Nombre de Usuario o DNI"
          required
          className="w-full p-3 border border-gray-300 rounded-md mt-1 text-black"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-semibold text-black">Contraseña</label>
        <div className="relative">
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
      </div>
      <button
        type="submit"
        className="w-full py-3 bg-[#F6512B] text-white font-semibold rounded-md hover:bg-red-900"
      >
        Iniciar sesión
      </button>
    </form>
  );
}
