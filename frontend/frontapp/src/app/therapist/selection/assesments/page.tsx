"use client";

import React, { useCallback, useEffect, useState } from "react";
import BoxPaginado from "../../../../components/PaginadoDinamico";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../../store/store";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: string;
    nombre: string;
  }>;
}

const AssesmentsPage: React.FC = () => {
  const [data, setData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const showImage = true;
  const { username } = useSelector((state: RootState) => state.user);

  const fetchAssesments = useCallback(async (page: number) => {
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/forms_per_user/?username=${encodeURIComponent(username)}&page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Incluir cookies (para manejar la cookie JWT)
      });

      if (!response.ok) {
        throw new Error("Error al obtener los formularios.");
      }

      const assesmentsData: PaginatedResponse = await response.json();
      setTotalItems(assesmentsData.count);

      const formattedData: { [key: string]: string } = {};
      assesmentsData.results.forEach((assesment) => {
        formattedData[assesment.id] = assesment.nombre;
      });

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching assesments:", error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchAssesments(currentPage);
  }, [fetchAssesments, currentPage]);

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
      fetchAssesments(currentPage);
    }
  }, [currentPage, data, fetchAssesments]);

  const opProps = {
    trashBin: true, 
    editButton: true,
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
            img='/icon/evaluacion.png'
            edit_path="/therapist/selection/assesments/"
            item_type="assesment"
            showImage={showImage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            itemsPerPage={8}
            onItemDeleted={handleItemDeleted}
          />
        </div>
      )}
    </div>
  );
};

export default AssesmentsPage;

// import React from 'react'

// import Box from '../../../../components/Box'
// import SmallButton from '../../../../components/SmallButton'

// const assesments = () => {
//   const assesments = [
//     {
//     id: 3311,
//     name: 'Evaluacion 1',
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//     link: 'httppblablabla',
//     subgoals: [{title: 'Objetivo 2'}, {title: 'Objetivo 3'}, {title: 'Objetivo 4'}],
//     scenes: [{name: 'Escena 2'}, {name: 'Escena 3'}, {name: 'Escena 4'}],
//     },
//     {
//       id: 3312,
//       name: 'Evaluacion 2',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 3313,
//       name: 'Evaluacion 3',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 3314,
//       name: 'Evaluacion 4',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 3315,
//       name: 'Evaluacion 5',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 3316,
//       name: 'Evaluacion 6',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 3317,
//       name: 'Evaluacion 7',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 3318,
//       name: 'Evaluacion 8',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
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
//         {assesments.map((assesment, index) => (
//           <li key={index} className='list-none'>
//             <Box 
//               elem={assesment} 
//               img='/icon/evaluacion.png' 
//               opciones={opProps}
//               edit_path= {`/therapist/assesments/${assesment.id}`}
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

// export default assesments
