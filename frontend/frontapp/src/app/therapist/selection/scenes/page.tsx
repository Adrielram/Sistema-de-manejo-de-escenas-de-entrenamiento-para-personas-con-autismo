"use client";

import React, { useCallback, useEffect, useState } from "react";
import BoxPaginado from "../../../../components/PaginadoDinamico";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: string;
    nombre: string;
  }>;
}

const ScenesPage: React.FC = () => {
  const [data, setData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const showImage = true;

  const fetchscenes = useCallback(async (page: number) => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/get_scenes/?page=${page}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener Las escenas.");
      }

      const scenesData: PaginatedResponse = await response.json();
      setTotalItems(scenesData.count);

      const formattedData: { [key: string]: string } = {};
      scenesData.results.forEach((scene) => {
        formattedData[scene.id] = scene.nombre;
      });

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching scenes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchscenes(currentPage);
  }, [fetchscenes, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleItemDeleted = useCallback((deletedId: string) => {
    // Actualizar el estado local
    setData(prevData => {
      const newData = { ...prevData };
      delete newData[deletedId];
      return newData;
    });

    // Actualizar el total de items
    setTotalItems(prev => prev - 1);

    // Si la página actual quedaría vacía después de la eliminación
    const itemsInCurrentPage = Object.keys(data).length;
    if (itemsInCurrentPage <= 1 && currentPage > 1) {
      // Volver a la página anterior
      setCurrentPage(prev => prev - 1);
    } else {
      // Recargar la página actual
      fetchscenes(currentPage);
    }
  }, [currentPage, data, fetchscenes]);

  const opProps = {
    trashBin: true, 
    buttonEdit: true,
  }

  return (
    <div>
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <div className="container mx-auto p-4">
          <BoxPaginado 
            data={data} 
            options={opProps}
            img='/icon/pelicula.png'
            edit_path="/therapist/selection/scenes/"
            item_type="scene"
            showImage={showImage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            itemsPerPage={4}
            onItemDeleted={handleItemDeleted}
          />
        </div>
      )}
    </div>
  );
};

export default ScenesPage;

// import React from 'react'

// import Box from '../../../../components/Box'
// import SmallButton from '../../../../components/SmallButton'

// const scenes = () => {
//   const scenes = [
//     {
//     id: 1221,
//     name: 'Escena 1',
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//     link: 'httppblablabla',
//     subscenes: [{title: 'Objetivo 2'}, {title: 'Objetivo 3'}, {title: 'Objetivo 4'}],
//     scenes: [{name: 'Escena 2'}, {name: 'Escena 3'}, {name: 'Escena 4'}],
//     },
//     {
//       id: 1222,
//       name: 'Escena 2',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subscenes: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1223,
//       name: 'Escena 3',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subscenes: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1224,
//       name: 'Escena 4',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subscenes: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1225,
//       name: 'Escena 5',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subscenes: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1226,
//       name: 'Escena 6',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subscenes: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1227,
//       name: 'Escena 7',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subscenes: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1228,
//       name: 'Escena 8',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subscenes: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//   ]

//   const opProps = {
//     trashBin: true, 
//     buttonEdit: true,
//   }
  
//   return (
//     <div>
//       <div className="flex flex-row flex-wrap justify-center gap-x-14">
//         {scenes.map((scene, index) => (
//           <li key={index} className='list-none'>
//             <Box 
//               elem={scene} 
//               img='/icon/pelicula.png' 
//               opciones={opProps}
//               edit_path={`/therapist/scenes/${scene.id}`}
//             />
//           </li>
//         ))}
//       </div>
//       <div className='flex flex-row justify-between mx-6 sm:mx-16 mt-8'>
//         <SmallButton title='Anterior'/>
//         <SmallButton title='Siguiente'/>
//       </div>
//     </div>
//   )
// }

// export default scenes
