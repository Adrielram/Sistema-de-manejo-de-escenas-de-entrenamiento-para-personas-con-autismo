// components/forms/LoginForm.js
'use client'
import { useState } from 'react';
import Image from 'next/image';
export default function LoginForm() {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !password) {
      setError('Por favor, ingrese todos los campos');
      return;
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
        className="w-full py-3 bg-orange-700 text-white font-semibold rounded-md hover:bg-red-900"
      >
        Iniciar sesión
      </button>
    </form>
  );
}
