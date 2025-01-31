'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ResponderForm = ({ idform, onSubmitted = () => {}}) => {
  const [formulario, setFormulario] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [error, setError] = useState("");
  const [resultados, setResultados] = useState({});
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    fetch(`${baseUrl}formularios/${idform}/`)
      .then((res) => res.json())
      .then((data) => setFormulario(data))
      .catch(() => setError("Error al cargar el formulario"));
  }, [idform]);

  const handleInputChange = (preguntaId, value) => {
    setRespuestas({ ...respuestas, [preguntaId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formulario) return;

    // Validar que todas las preguntas tengan respuesta
  const faltanRespuestas = formulario.preguntas.some((pregunta) => {
    const respuesta = respuestas[pregunta.id];
    return !respuesta || respuesta.trim() === ""; // Verifica si está vacía
  });

  if (faltanRespuestas) {
    alert("Por favor, completa todas las respuestas antes de enviar.");
    return; // Detener el envío
  }

    const respuestasAEnviar = formulario.preguntas.map((pregunta) => {
      const respuesta = respuestas[pregunta.id] || "";
      const correcta = 
        formulario.es_verificacion_automatica && pregunta.tipo === "multiple-choice"
          ? respuesta === pregunta.correcta
          : null;

      return {
        pregunta: pregunta.id,
        respuesta,
        correcta,
        paciente: 40333444, // Ajusta esto según el paciente actual
      };
    });

    try {
      await fetch(`${baseUrl}respuestas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(respuestasAEnviar),
      });

      await fetch(`${baseUrl}registrar-respuesta/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formulario_id: idform,
          paciente_dni: 40333444, // Ajusta según el paciente actual
          verificado_automatico: formulario.es_verificacion_automatica,
        }),
      });

      if (formulario.es_verificacion_automatica) {
        const nuevosResultados = {};
        respuestasAEnviar.forEach((respuesta) => {
          if (respuesta.correcta !== null) {
            nuevosResultados[respuesta.pregunta] = respuesta.correcta;
          }
        });
        setResultados(nuevosResultados);
      } else {
        alert("Formulario enviado. Espera la revisión del terapeuta.");
        setRespuestas({});
        onSubmitted(); // Llamar a la función pasada por props
      }      
      router.push(`/interfaz_paciente/ver_video?completedFormId=${idform}`);      
    } catch (err) {
      console.error(err);
      setError("Error al enviar las respuestas");
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;

  if (!formulario) return <p>Cargando formulario...</p>;
  console.log("Formularioooo: "+JSON.stringify(formulario));
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{formulario.titulo}</h1>
      <p className="text-gray-700 mb-6">{formulario.descripcion}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formulario.preguntas.map((pregunta) => (
          <div 
            key={pregunta.id} 
            className={`border-b pb-4`}
          >
            <label className="block font-medium text-gray-800 mb-2">
              {pregunta.texto}
            </label>

            
            {(pregunta.nombre_escena ? (
              <label className="block font-medium text-gray-800 mb-2">
                Escena relacionada: {pregunta.nombre_escena}
              </label>
            ) : (
              <label className="block font-medium text-gray-800 mb-2">
                Pregunta General
              </label>
            ))}          
            

            {pregunta.tipo === "multiple-choice" ? (
              <div>
                {pregunta.opciones.map((opcion, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="radio"
                      id={`${pregunta.id}-${index}`}
                      name={`pregunta-${pregunta.id}`}
                      value={opcion.texto}
                      onChange={() => handleInputChange(pregunta.id, opcion.texto)}
                      className="mr-2"
                    />
                    <label htmlFor={`${pregunta.id}-${index}`}>{opcion.texto}</label>
                  </div>
                ))}
              </div>
            ) : (
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                onChange={(e) => handleInputChange(pregunta.id, e.target.value)}
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Enviar Respuestas
        </button>
      </form>
    </div>
  );
};

export default ResponderForm;