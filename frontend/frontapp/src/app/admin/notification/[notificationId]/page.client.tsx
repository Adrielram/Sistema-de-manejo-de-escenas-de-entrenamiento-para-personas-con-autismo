"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Escena {
  id?: number;
  nombre?: string;
  link: string;
}

interface ObjetivoPrevio {
  id: number;
  nombre: string;
}

interface Objetivo {
  nombre: string;
  video_explicativo: string;
  descripcion?: string;  
}

// Interfaz para las opciones de una pregunta
interface Opcion {
  id: number;
  texto: string;
}

// Interfaz para las preguntas dentro de un formulario
interface Pregunta {
  id: number;
  texto: string;
  tipo: "multiple-choice" | "respuesta-corta" | "respuesta-larga";
  opciones?: Opcion[]; // Opciones disponibles para la pregunta (si aplica)
}

// Interfaz para el formulario asociado a la notificación
interface Formulario {
  id: number;
  nombre: string;
  descripcion?: string;
  es_verificacion_automatica: boolean;
  habilitada: boolean;
}

interface Notification {
  id: number;
  destinatario: string;
  remitente: string;
  mensaje: string;
  estado: "pendiente" | "leida" | "eliminada";
  timestamp: Date;
  escena?: Escena;
  objetivo?: Objetivo;
  escenas_vinculadas?: Escena[];
  objetivos_previos?: ObjetivoPrevio[];
  formulario?: Formulario;
  preguntas?: Pregunta[];

}

const NotificationPage = ({ token }: { token: string }) => {
  const { notificationId } = useParams() as { notificationId: string }; // Obtén el ID de la notificación desde la URL
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}notificaciones/${notificationId}/`, {
          method: "GET",
          headers: {            
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Error al obtener la notificación");
        }
        const data: Notification = await response.json();
        setNotification(data);
      } catch (err) {
        console.log("Error: " + err);
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (notificationId) {
      fetchNotification();
    }
  }, [notificationId]);

  const handleAccept = async () => {
    try {
      const response = await fetch(`${baseUrl}notificaciones/${notificationId}/aceptar/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al aceptar la notificación");
      }
      alert("Notificación aceptada");
      setNotification({ ...notification!, estado: "leida" }); // Actualizar estado local
    } catch (err) {
      console.error(err);
      alert("Error al aceptar la notificación");
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`${baseUrl}notificaciones/${notificationId}/rechazar/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error al rechazar la notificación");
      }
      alert("Notificación rechazada");
      setNotification({ ...notification!, estado: "eliminada" }); // Actualizar estado local
    } catch (err) {
      console.error(err);
      alert("Error al rechazar la notificación");
    }
  };

  if (loading) {
    return <p>Cargando notificación...</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!notification) {
    return <p className="text-red-500">Notificación no encontrada</p>;
  }

  return (
    <div className="flex flex-col md:flex-row p-4">
      <div className="w-full md:w-1/3">
        <h1 className="text-xl font-bold mb-4">
          Detalle de Notificación: {notification.id}
        </h1>
        <div className="border p-4 rounded shadow">
          <p><strong>Destinatario:</strong> {notification.destinatario}</p>
          <p><strong>Remitente:</strong> {notification.remitente}</p>
          <p><strong>Mensaje:</strong> {notification.mensaje}</p>
          <p><strong>Estado:</strong> {notification.estado}</p>
          <p><strong>Fecha:</strong> {new Date(notification.timestamp).toLocaleString()}</p>
          {notification.escena && (
            <>
              <p><strong>Nombre:</strong> {notification.escena.nombre}</p>
              <p>
                <strong>Link: </strong> 
                <a href={notification.escena.link} className="text-blue-500" target="_blank" rel="noopener noreferrer">
                  {notification.escena.link}
                </a>
              </p>
            </>
          )}
          {notification.objetivo && (
          <>
            <p><strong>Nombre:</strong> {notification.objetivo.nombre}</p>
            <p>
              <strong>Video Explicativo: </strong> 
              <a
                href={notification.objetivo.video_explicativo}
                className="text-blue-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                {notification.objetivo.video_explicativo}
              </a>
            </p>
            {notification.objetivo.descripcion && (
              <p><strong>Descripción:</strong> {notification.objetivo.descripcion}</p>
            )}

            {/* Mostrar las escenas vinculadas */}
            {notification.escenas_vinculadas && notification.escenas_vinculadas.length > 0 && (
              <div>
                <strong>Escenas Vinculadas:</strong>
                <ul className="list-disc list-inside">
                  {notification.escenas_vinculadas.map((escena) => (
                    <li key={escena.id}>
                      <a
                        href={escena.link}
                        className="text-blue-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Escena {escena.id}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mostrar los objetivos previos */}
            {notification.objetivos_previos && notification.objetivos_previos.length > 0 && (
              <div>
                <strong>Objetivos Previos:</strong>
                <ul className="list-disc list-inside">
                  {notification.objetivos_previos.map((previo) => (
                    <li key={previo.id}>{previo.nombre}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Mostrar detalles del formulario */}
        {notification.formulario && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Detalles del Formulario
            </h3>
            <p>
              <strong>Nombre:</strong> {notification.formulario.nombre}
            </p>
            <p>
              <strong>Descripción:</strong> {notification.formulario.descripcion || "Sin descripción"}
            </p>

            {/* Mostrar las preguntas */}
            {notification.preguntas && notification.preguntas.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold">Preguntas</h4>
                <ol className="list-decimal list-inside">
                  {notification.preguntas.map((pregunta) => (
                    <li key={pregunta.id} className="mt-2">
                      <p className="font-medium">{pregunta.texto}</p>
                      <p className="text-sm text-gray-500">
                        <strong>Tipo:</strong> {pregunta.tipo}
                      </p>

                      {/* Mostrar las opciones */}
                      {pregunta.opciones && pregunta.opciones.length > 0 && (
                        <ul className="list-disc list-inside ml-4 mt-1">
                          {pregunta.opciones.map((opcion) => (
                            <li key={opcion.id} className="text-gray-700">
                              {opcion.texto}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        </div>
        {(notification.estado === "pendiente" &&
            <div className="mt-4">
            <button
                className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
                onClick={handleAccept}
            >
                Aprobar
            </button>
            <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={handleReject}
            >
                Eliminar
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
