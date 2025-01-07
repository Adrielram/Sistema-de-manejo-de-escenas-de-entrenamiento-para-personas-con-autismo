const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const create_objetivo = async (nuevoObjetivo) => {
  try {
      const addObjetivoURL = `${baseUrl}create_objetivo/`;    
      console.log(baseUrl);
      const response = await fetch(addObjetivoURL, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              titulo: nuevoObjetivo.titulo,
              descripcion: nuevoObjetivo.descripcion,
              escenaId: nuevoObjetivo.escenaId
          }),
      });

      const data = await response.json();
      
      if (response.status === 201) {
          return { success: true, data };
      } else {
          return { success: false, error: data.error || 'Error desconocido' };
      }
  } catch (error) {
      console.error('Error en la solicitud:', error);
      return { 
          success: false, 
          error: error.message || 'Error desconocido'
      };
  }
};