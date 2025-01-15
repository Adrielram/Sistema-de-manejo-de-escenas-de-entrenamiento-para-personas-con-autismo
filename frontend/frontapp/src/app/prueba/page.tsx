"use client"
import { useEffect, useState } from 'react';

const NotificacionesComponent = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/notificaciones/');

    const handleMessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Notificación recibida:", data);
        setNotificaciones(prevState => [...prevState, data]);
    };

    const handleClose = () => {
        console.log("Conexión cerrada.");
    };

    const handleError = (error) => {
        console.error("Error en WebSocket:", error);
    };
    
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("close", handleClose);
    socket.addEventListener("error", handleError);

    return () => {        
        if (socket.readyState === WebSocket.OPEN) {
            socket.close();
        }        
        socket.removeEventListener("message", handleMessage);
        socket.removeEventListener("close", handleClose);
        socket.removeEventListener("error", handleError);
    };
}, []);

  return (
    <div>
      <h3>Notificaciones:</h3>
      <ul>
        {notificaciones.map((notif, index) => (
          <li key={index}>
            <strong>{notif.remitente}</strong>: {notif.mensaje} ({notif.timestamp})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificacionesComponent;