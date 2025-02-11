'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setUser } from '../../../slices/userSlice';
import Image from 'next/image';

export default function LoginForm() {
  const [user, setUserState] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(true);
  const router = useRouter();
  const dispatch = useDispatch();
  
  const handleSubmit = async (e) => {
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
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json(); 

        dispatch(setUser({ username: data.username, loggedIn: true, role: data.role }));
        
        console.log('Login exitoso ' + data.username);
        if (data.role === "admin") {
          router.push('/admin/health_center');
        } else if (data.role === "paciente") {
          router.push('/interfaz_paciente/principal');
        } else if (data.role === "padre") {
          router.push('/interfaz_padre/principal');
        } else if (data.role === "terapeuta") {
          router.push('/therapist');
        } else {
          setError('Rol desconocido. Contacte al soporte.');
        }
        
      } else {
        const data = await response.json();
        setError(data.detail || 'Error al iniciar sesión');
      }
    } catch {
      setError('Hubo un problema con el servidor. Inténtalo más tarde.');
    }

    setUserState('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="mb-4">
        <label htmlFor="user" className="block text-sm font-semibold text-black">Usuario</label>
        <input
          type="text"
          id="user"
          value={user}
          onChange={(e) => setUserState(e.target.value)}
          placeholder="Nombre de Usuario"
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

      {/* Enlace "Olvidé mi contraseña" con useRouter */}
      <div className="text-right mb-4">
        <button
          type="button"
          onClick={() => router.push('./forgot-password')}
          className="text-sm text-blue-500 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </button>
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
