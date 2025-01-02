"use client"
import { useState } from "react";

export default function NotificationMenu() {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications: { id: number; message: string }[] = [
    { id: 1, message: "Notificación 1" },
    { id: 2, message: "Notificación 2" },
  ];

  // Funciones de manejo de botones
  const handleAccept = (id: number) => {
    console.log(`Notificación ${id} aceptada`);
    // Aquí puedes agregar la lógica para aceptar la notificación
  };

  const handleReject = (id: number) => {
    console.log(`Notificación ${id} rechazada`);
    // Aquí puedes agregar la lógica para rechazar la notificación
  };

  const handleReadMore = (id: number) => {
    console.log(`Leyendo más sobre la notificación ${id}`);
    // Aquí puedes agregar la lógica para ver más detalles de la notificación
  };

  return (
    <div className="relative">
      {/* Botón de campanita */}
      <button
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="View notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Animación de titileo solo si hay notificaciones */}
        {notifications.length > 0 && (
          <span className="animate-ping absolute top-1 right-0.5 block h-1 w-1 rounded-full ring-2 ring-green-400 bg-green-600"></span>
        )}
      </button>

      {/* Menú desplegable de notificaciones */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-72 bg-white text-black shadow-lg rounded-md p-4">
          {notifications.length > 0 ? (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="border-b border-gray-300 pb-2 flex items-center justify-between"
                >
                  <span>{notification.message}</span>
                  <div className="flex space-x-2">
                    {/* Botón de Aceptar */}
                    <button
                      onClick={() => handleAccept(notification.id)}
                      className="text-green-500 hover:text-green-700"
                      aria-label={`Aceptar notificación ${notification.id}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>

                    {/* Botón de Rechazar */}
                    <button
                      onClick={() => handleReject(notification.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Rechazar notificación ${notification.id}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    {/* Botón de Leer más */}
                    <button
                      onClick={() => handleReadMore(notification.id)}
                      className="text-blue-500 hover:text-blue-700"
                      aria-label={`Leer más de la notificación ${notification.id}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12H9m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center">No existen notificaciones</p>
          )}
        </div>
      )}
    </div>
  );
}
