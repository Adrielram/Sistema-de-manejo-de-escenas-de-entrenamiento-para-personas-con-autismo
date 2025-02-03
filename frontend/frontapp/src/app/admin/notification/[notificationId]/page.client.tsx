"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Notification {
  id: number;
  destinatario: string;
  remitente: string;
  mensaje: string;
  estado: "pendiente" | "leida" | "eliminada";
  timestamp: Date;
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
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
