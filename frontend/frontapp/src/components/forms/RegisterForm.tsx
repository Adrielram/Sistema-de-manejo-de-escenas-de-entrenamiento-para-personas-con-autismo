// components/RegisterForm.tsx
'use client';

import { useState,useEffect,useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from "react-google-recaptcha";


import SearchWithFatherRes from '../SearchWithFatherRes';

interface Symptom {
  nombre: string;
  similitud: number;
}

export default function RegisterForm() {
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
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
    sintomas: '',
  });
  const [centros, setCentros] = useState<{ id: number; nombre: string }[]>([]); // Inicializar como un array vacío
  const pagina = 1; // Página actual
  const [centrosSeleccionados, setCentrosSeleccionados] = useState<number[]>([]); // IDs de los centros seleccionados
  const [paginaAnterior, setPaginaAnterior] = useState<number | null>(null);
  const [paginaSiguiente, setPaginaSiguiente] = useState<number | null>(null);
  const [sintomas, setSintomas] = useState('');
  const [sintomasEnviados, setSintomasEnviados] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [sintomasPrediction, setSintomasPrediction] = useState<Symptom[]>([]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    console.log('Sintomas:', sintomasPrediction);
  }, [sintomasPrediction]); // This effect runs every time sintomasPrediction changes

  const handleSintomasChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSintomas(e.target.value);
  };

  const handleCentroClick = (id: number) => {
    setCentrosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((centroId) => centroId !== id) : [...prev, id]
    );
  };

  const enviarSintomas = async () => {
    setError('');
    if (!sintomas.trim()) {
      setError('Debe ingresar sus síntomas antes de enviarlos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/spacy-patologias/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto:sintomas }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar los síntomas');
      }
      const data = await response.json(); // Almacena la respuesta del backend
      console.log(data.patologias); // Depuración: Muestra la respuesta en consola 
      setSintomasPrediction(data.patologias);
      console.log('Sintomas', sintomasPrediction);
      setSintomasEnviados(true);
      alert('Síntomas enviados exitosamente.');
    } catch (err) {
      setError((err as Error).message);
    }
  };


  const fetchCentros = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/obtener_centros_de_salud/?page=${page}`);
      if (!response.ok) throw new Error('Error al cargar centros de salud');
      const data = await response.json();
  
      console.log(data); // Verifica que `data.results` contenga los centros de salud
  
      // Actualiza el estado con los centros y otros datos relevantes
      setCentros(data.results || []); // `results` contiene los centros
      setPaginaAnterior(data.previous ? page - 1 : null);
      setPaginaSiguiente(data.next ? page + 1 : null);
    } catch (err) {
      console.error(err); // Depuración: Muestra el error en consola
      setError((err as Error).message); // Muestra el mensaje de error en el front
    }
  };
  useEffect(() => {
    if (formData.rol === 'Terapeuta') fetchCentros(pagina);
  }, [formData.rol, pagina]);

  const handleSubmit = async (e: React.FormEvent) => {
  console.log("Centros seleccionados: ", centrosSeleccionados);
  e.preventDefault();
  setError('');
  setSuccess(false);

  if (formData.rol === 'Paciente' && !sintomasEnviados) {
    setError('Debe enviar sus síntomas antes de registrarse.');
    return;
  }

  if (formData.contrasena !== formData.repetirContrasena) {
    setError('Las contraseñas no coinciden');
    return;
  }

  const recaptchaValue = recaptchaRef.current?.getValue();
  if (!recaptchaValue) {
    setError('Por favor, completa el captcha.');
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
        centros_de_salud: centrosSeleccionados,
        sintomas: sintomasPrediction || null, // Enviar la predicción de síntomas 
        texto: sintomas, // Enviar el texto original de los síntomas
        captcha: recaptchaValue, // Enviar el token del captcha
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

const recargarCaptcha = () => {
  grecaptcha.reset();  // Esto reinicia el CAPTCHA
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
            <option value="Terapeuta">Terapeuta</option>
            <option value="Admin">Admin</option>

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
        {/* Síntomas */}
        {formData.rol === 'Paciente' && 
        (<div>
          <label className="block text-black">Cuéntanos más sobre ti</label>

          <textarea
            name="sintomas"
            value={sintomas}
            onChange={handleSintomasChange}
            className="w-full border text-black border-black rounded px-2 py-1"
            rows={5}
            required
          />
          <button
            type="button"
            onClick={enviarSintomas}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={sintomasEnviados}
          >
            {sintomasEnviados ? 'Síntomas enviados' : 'Enviar Síntomas'}
          </button>
        </div>)}
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
        {/* Centros de salud para terapeutas */}
        {formData.rol === 'Terapeuta' && (
          <div className="p-4 border border-blue-500 rounded bg-blue-50">
            <h3 className="text-black font-bold mb-2">Seleccionar Centros de Salud</h3>
            <ul className="space-y-2">
              {centros?.length > 0 ? (
                centros.map((centro: { id: number; nombre: string }) => (
                  <li
                    key={centro.id}
                    className={`p-2 border rounded cursor-pointer ${
                      centrosSeleccionados.includes(centro.id)
                        ? 'bg-green-300'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleCentroClick(centro.id)}
                  >
                    {centro.nombre}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Cargando centros de salud...</p>
              )}
            </ul>        
            <div className="flex justify-between mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded"
                disabled={!paginaAnterior} // Deshabilita si no hay página anterior
                onClick={() => fetchCentros(paginaAnterior)}
              >
                &lt; Anterior
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 rounded"
                disabled={!paginaSiguiente} // Deshabilita si no hay página siguiente
                onClick={() => fetchCentros(paginaSiguiente)}
              >
                Siguiente &gt;
              </button>
            </div>         
          </div>
        )}
        {/* ACA IRIA UN CHECK DE TERMINOS Y CONDICIONES SI SE LO REQUIERE */}
        <div>
         <ReCAPTCHA
        sitekey="6LcQ5s8qAAAAANKXXFcFscOAUhu89owU8pCgujz5"
        ref={recaptchaRef}
        />
        <button
          onClick={recargarCaptcha}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
          >
            Recargar CAPTCHA
        </button>

        </div>
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
