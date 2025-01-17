"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {useSelector} from "react-redux";
import { RootState } from "../../store/store";

export default function NotificationsMenu({token}) {
  console.log("Token: ", token);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificaciones, setNotificaciones] = useState(() => {
      // Recuperar notificaciones desde localStorage al cargar el componente
      const storedNotificaciones = localStorage.getItem("notificaciones");
      return storedNotificaciones ? JSON.parse(storedNotificaciones) : [];
    });
    const {role} = useSelector((state: RootState) => state.user);   

    useEffect(() => {
      // Fetch de notificaciones pendientes
      const fetchNotificaciones = async () => {
        const response = await fetch(`${baseUrl}notificaciones/`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotificaciones(data.notificaciones);
        }
      };
  
      fetchNotificaciones();
  
      const socket = new WebSocket(`ws://localhost:8000/ws/notificaciones/?token=${token}`);
      
      const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Data: "+JSON.stringify(data));
        if (data.type === "notificacion_actualizada") {          
          fetchNotificaciones();
        } else if (data.type === "enviar_notificacion") {
          // Cuando llega una nueva notificación, agregarla al estado actual
          setNotificaciones((prev) => [...prev, data]);
        }
      };
  
      socket.addEventListener("message", handleMessage);
  
      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
        socket.removeEventListener("message", handleMessage);
      };
    }, [token]); 

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
        {notificaciones.length > 0 && (
          <div className="px-1 py-0.5 bg-teal-500 min-w-5 rounded-full text-center text-white text-xs absolute -top-2 -right-2 translate-x-1/4 text-nowrap">
            <div className="absolute top-0 left-0 rounded-full -z-10 animate-ping bg-teal-200 w-full h-full"></div>
            {notificaciones.length}
          </div>
        )}
      </button>


      {/* Menú desplegable de notificaciones */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-72 bg-white text-black shadow-lg rounded-md p-4">
          {notificaciones.length > 0 ? (
            <ul className="space-y-2">
              {notificaciones.map((notification) => (
                
                <li
                  key={notification.id}
                  className="border-b border-gray-300 pb-2 flex items-center justify-between"
                >
                  <span>{notification.mensaje}</span>
                  <div className="flex space-x-2">              
                    
                    {/* Botón de Leer más */}                                 
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      aria-label={`Leer más de la notificación ${notification.id}`}
                    >
                      <Link href={role === "admin" ? `/admin/notification/${notification.id}` : role === "terapeuta" ? `/therapist/notification/${notification.id}` : "#"} className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8"
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
                      </Link>
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
