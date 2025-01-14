"use client"
import { useEffect, useState } from 'react';

const NotificacionesComponent = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/notificaciones/');

    socket.onopen = () => {
      console.log("Conectado al servidor de notificaciones.");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Notificación recibida:", data);
      setNotificaciones(prevState => [...prevState, data]);
    };

    socket.onclose = () => {
      console.log("Conexión cerrada.");
    };

    socket.onerror = (error) => {
      console.error("Error en WebSocket:", error);
    };

    return () => {
        console.log("Cerrando WebSocket...");
        socket.close();
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