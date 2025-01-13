// components/RegisterForm.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import SearchWithFatherRes from '../SearchWithFatherRes';
export default function RegisterForm() {
  
  const [idPadreSeleccionado, setIdPadreSeleccionado] = useState<number | null>(null);

  const handlePadreSeleccionado = (dni: number) => {
    setIdPadreSeleccionado(dni); // Almacena el DNI del padre seleccionado
  };
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    fechaNacimiento: '',
    genero: '',
    rol: '',
    contrasena: '',
    repetirContrasena: '',
    provincia: '',
    ciudad: '',
    calle: '',
    numero: '',
    asociarPadre: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (formData.contrasena !== formData.repetirContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/signIn/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dni: formData.dni,
          nombre: formData.nombre,
          fecha_nac: formData.fechaNacimiento,
          genero: formData.genero,
          role: formData.rol.toLowerCase(),
          provincia: formData.provincia,
          ciudad: formData.ciudad,
          calle: formData.calle,
          numero: formData.numero,
          id_padre: idPadreSeleccionado || null,
          password: formData.contrasena,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar el usuario');
      }
  
      setSuccess(true);
      router.push('/auth/login');
      console.log('Usuario registrado exitosamente');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="w-full max-w-md px-4 py-6 space-y-4 border border-black rounded-lg">
      <h1 className="text-center text-2xl font-bold text-black">Registrarse</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* DNI */}
        <div>
          <label className="block text-black">DNI</label>
          <input
            type="text"
            name="dni"
            value={formData.dni}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-black">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          />
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <label className="block text-black">Fecha de Nacimiento</label>
          <input
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          />
        </div>

        {/* Género */}
        <div>
          <label className="block text-black">Género</label>
          <select
            name="genero"
            value={formData.genero}
            onChange={handleInputChange}
            className="w-full border border-black text-black rounded px-2 py-1"
            required
          >
            <option value="" disabled>Seleccionar Género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>

        {/* Rol */}
        <div>
          <label className="block text-black">Rol</label>
          <select
            name="rol"
            value={formData.rol}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          >
            <option value="" disabled>Seleccionar Rol</option>
            <option value="Paciente">Paciente</option>
            <option value="Padre">Padre</option>
          </select>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-black">Contraseña</label>
          <input
            type="password"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          />
        </div>

        {/* Repetir Contraseña */}
        <div>
          <label className="block text-black">Repetir Contraseña</label>
          <input
            type="password"
            name="repetirContrasena"
            value={formData.repetirContrasena}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          />
        </div>

        {/* Provincia */}
        <div>
          <label className="block text-black">Provincia</label>
          <input
            type="text"
            name="provincia"
            value={formData.provincia}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          />
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-black">Ciudad</label>
          <input
            type="text"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          />
        </div>

        {/* Calle */}
        <div>
          <label className="block text-black">Calle</label>
          <input
            type="text"
            name="calle"
            value={formData.calle}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          />
        </div>

        {/* Número */}
        <div>
          <label className="block text-black">Número</label>
          <input
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          />
        </div>

        {/* Asociar Padre */}
        {formData.rol === 'Paciente' && (
          <div className="p-3 border border-blue-500 rounded bg-blue-50">
            <h3 className="text-black font-bold mb-2">Asociar Padre</h3>
            <SearchWithFatherRes onPadreSeleccionado={handlePadreSeleccionado} />
            <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-100">
              <h3 className="text-black text-lg font-semibold mb-2">Padre seleccionado:</h3>
              <ul className="list-disc pl-5 text-black space-y-1">
                  <li key={idPadreSeleccionado} className="flex items-center">
                    <span className="font-medium">DNI:</span>
                    <span className="ml-2">{idPadreSeleccionado}</span>
                  </li>
              </ul>
            </div>
          </div>
        )}

        {/* Botón de Registrarse */}
        <button
          type="submit"
          className="w-full px-4 py-2 font-bold text-white bg-primary rounded hover:bg-red-900"
        >
          Registrarse
        </button>

        {/* Mensajes de error o éxito */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">¡Registro exitoso!</p>}

        {/* Link de iniciar sesión */}
        <p className="text-center text-black text-sm">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/auth/login" className="font-bold text-blue-500 hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
