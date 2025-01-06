import React from 'react';

// Definimos el tipo de las props
interface NotificationProps {
  params: {
    notificationId: string;
  };
}

// Página de notificación
export default async function Notification({ params }: NotificationProps) {
  const { notificationId } = params;

  // Fetch de los datos desde el servidor
  const response = await fetch(`https://api.ejemplo.com/notifications/${notificationId}`, {
    cache: 'no-store', // No almacenar en caché para que siempre sea dinámico
  });
  const data = await response.json();

  // Si la notificación no se encuentra
  if (!data) {
    return <div>No se encontró la notificación con ID: {notificationId}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 p-4">
        <h1 className="text-xl font-bold">Detalles de la Notificación</h1>
        <p>ID: {notificationId}</p>
        <p>Descripción: {data.description || 'Sin descripción'}</p>
      </div>
      <div className="w-full md:w-2/3 p-4 flex items-center justify-center">
        <div className="bg-blue-500 w-64 h-64 flex items-center justify-center text-white text-xl font-bold rounded">
          {data.title || 'Sin título'}
        </div>
      </div>
    </div>
  );
}
