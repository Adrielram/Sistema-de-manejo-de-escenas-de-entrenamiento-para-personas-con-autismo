import React from "react";

// Simulación de notificaciones
interface Notification {
  id: number;
  destinatario: string;
  remitente: string;
  message: string;
  estado: "pendiente" | "leida" | "eliminada";
  timestamp: Date;
}

const notifications: Notification[] = [
  {
    id: 1,
    destinatario: "Admin",
    remitente: "Terapeuta1",
    message: "Nueva evaluación pendiente de aprobación.",
    estado: "pendiente",
    timestamp: new Date(),
  },
  {
    id: 2,
    destinatario: "Terapeuta1",
    remitente: "Admin",
    message: "Tu evaluación fue aprobada.",
    estado: "leida",
    timestamp: new Date("2025-01-01T10:00:00"),
  },
  {
    id: 3,
    destinatario: "Admin",
    remitente: "Terapeuta2",
    message: "Nuevo objetivo agregado para el paciente.",
    estado: "pendiente",
    timestamp: new Date(),
  },
];

// Página de notificación
interface NotificationProps {
  params: {
    notificationId: string;
  };
}

const Notification: React.FC<NotificationProps> = ({ params }) => {
  const { notificationId } = params;

  // Convertir el `notificationId` a número para buscar en el array
  const notification = notifications.find(
    (notif) => notif.id === Number(notificationId)
  );

  return (
    <div className="flex flex-col md:flex-row p-4">
      <div className="w-full md:w-1/3">
        <h1 className="text-xl font-bold mb-4">
          Detalle de Notificación: {notificationId}
        </h1>
        {notification ? (
          <div className="border p-4 rounded shadow">
            <p><strong>Destinatario:</strong> {notification.destinatario}</p>
            <p><strong>Remitente:</strong> {notification.remitente}</p>
            <p><strong>Mensaje:</strong> {notification.message}</p>
            <p><strong>Estado:</strong> {notification.estado}</p>
            <p><strong>Fecha:</strong> {notification.timestamp.toLocaleString()}</p>
          </div>
        ) : (
          <p className="text-red-500">Notificación no encontrada</p>
        )}
      </div>
    </div>
  );
};

export default Notification;
