// components/RegisterForm.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    genero: '',
    rol: '',
    contrasena: '',
    repetirContrasena: '',
    pais: '',
    provincia: '',
    ciudad: '',
    calle: '',
    numero: '',
    asociarPadre: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.contrasena !== formData.repetirContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Aquí se hará el fetch al backend
    console.log('Datos enviados:', formData);
    setSuccess(true);
  };

  return (
    <div className="w-full max-w-md px-4 py-6 space-y-4 border border-black rounded-lg">
      <h1 className="text-center text-2xl font-bold text-black">Registrarse</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
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
            type="text"
            name="repetirContrasena"
            value={formData.repetirContrasena}
            onChange={handleInputChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            required
          />
        </div>

        {/* País */}
        <div>
          <label className="block text-black">País</label>
          <input
            type="text"
            name="pais"
            value={formData.pais}
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
            <input
              type="text"
              name="asociarPadre"
              placeholder="Buscar padre (opcional)"
              value={formData.asociarPadre}
              onChange={handleInputChange}
              className="w-full border text-black border-black rounded px-2 py-1"
            />
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
