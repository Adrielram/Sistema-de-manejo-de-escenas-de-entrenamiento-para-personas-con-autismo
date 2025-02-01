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
          credentials: 'include'
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

export const create_scene = async (nuevaEscena) => {
    try {
        const addSceneURL = `${baseUrl}crear-escena/`;    
        console.log(baseUrl);
        const response = await fetch(addSceneURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: nuevaEscena.nombre,
                idioma: nuevaEscena.idioma,
                acento: nuevaEscena.acento,
                condiciones: nuevaEscena.condiciones ?? null, // Si no está definido, asigna null
                complejidad:nuevaEscena.complejidad,
                link: nuevaEscena.link
            }),
            credentials: 'include'
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

  export const enviarFormulario = async (formulario) => {
    try {
      const respuesta = await fetch(`${baseUrl}formularios/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formulario),
      }); 
      const data = await respuesta.json();
      if (respuesta.status === 201) {
          return { success: true, data };
      } else {
          return { success: false, error: data.error || 'No se pudo crear el formulario' };
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };
  

  export const create_group = async (nuevoGrupo) => {
    try {
        const addGroupUrl = `${baseUrl}create_patient_group/`;    
        console.log(baseUrl);
        const response = await fetch(addGroupUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre_grupo: nuevoGrupo.nombre_grupo,
                nombre_centro: nuevoGrupo.nombre_centro,
            }),
            credentials: 'include'
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
 