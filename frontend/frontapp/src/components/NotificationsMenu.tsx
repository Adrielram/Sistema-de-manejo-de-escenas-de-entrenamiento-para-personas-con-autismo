"use client";
import { useState } from "react";

export default function NotificationsMenu() {
  const [showNotifications, setShowNotifications] = useState(false);

  // Simulación de notificaciones
  const notifications: { id: number; message: string }[] = [
    { id: 1, message: "Notificación 1" }

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
      {/* Botón de campana */}
      <button
        className="relative bg-teal-100 p-1 rounded-lg hover:bg-teal-200 hover:ring hover:ring-teal-300 hover:ring-offset-2 transition duration-300"
        onClick={() => setShowNotifications(!showNotifications)}
        aria-label="View notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-teal-600 animate-wiggle"
          viewBox="0 0 21 21"
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.585 15.5H5.415A1.65 1.65 0 0 1 4 13a10.526 10.526 0 0 0 1.5-5.415V6.5a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1.085c0 1.907.518 3.78 1.5 5.415a1.65 1.65 0 0 1-1.415 2.5zm1.915-11c-.267-.934-.6-1.6-1-2s-1.066-.733-2-1m-10.912 3c.209-.934.512-1.6.912-2s1.096-.733 2.088-1M13 17c-.667 1-1.5 1.5-2.5 1.5S8.667 18 8 17"
          />
        </svg>

        {/* Número de notificaciones pendientes */}
        {notifications.length > 0 && (
          <div className="px-1 py-0.5 bg-teal-500 min-w-5 rounded-full text-center text-white text-xs absolute -top-2 -right-2 translate-x-1/4 text-nowrap">
            <div className="absolute top-0 left-0 rounded-full -z-10 animate-ping bg-teal-200 w-full h-full"></div>
            {notifications.length}
          </div>
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
