import React, { useEffect, useState } from 'react';

interface ComentarioPacienteProps {
  idComentario: number;
}

const ComentarioPaciente: React.FC<ComentarioPacienteProps> = ({ idComentario }) => {
  const [comentario, setComentario] = useState<string | null>(null);
  const [visibilidad, setVisibilidad] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch para obtener el comentario por ID
    const fetchComentario = async () => {
      try {
        const response = await fetch(`/api/comentarios/?idComentario=${idComentario}`);
        const data = await response.json();
        if (response.ok) {
          setComentario(data.texto);
          setVisibilidad(data.visibilidad);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error al obtener el comentario:', error);
      }
    };

    fetchComentario();
  }, [idComentario]);

  if (comentario === null || visibilidad === null) {
    return <div>Cargando comentario...</div>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
      <h3>Comentario</h3>
      <p>{comentario}</p>
    </div>
  );
};

export default ComentarioPaciente;
