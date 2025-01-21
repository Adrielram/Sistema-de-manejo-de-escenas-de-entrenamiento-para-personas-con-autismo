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

const GoalsPage: React.FC = () => {
  const [data, setData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const mostrarImagen = true;
  const { username, center } = useSelector((state: RootState) => state.user);

  const fetchGoals = useCallback(async (page: number) => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/get_goals_centroprofesional/?username=${encodeURIComponent(username)}&centername=${encodeURIComponent(center)}&page=${page}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener los objetivos.");
      }

      const goalsData: PaginatedResponse = await response.json();
      setTotalItems(goalsData.count);

      const formattedData: { [key: string]: string } = {};
      goalsData.results.forEach((goal) => {
        formattedData[goal.id] = goal.nombre;
      });

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  }, [username, center]);

  useEffect(() => {
    fetchGoals(currentPage);
  }, [fetchGoals, currentPage]);

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
      fetchGoals(currentPage);
    }
  }, [currentPage, data, fetchGoals]);

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
            img='/icon/diana.png' 
            edit_path="/therapist/selection/goals/"
            showImage={mostrarImagen}
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

export default GoalsPage;





// import React from 'react'

// import Box from '../../../../components/Box'
// import SmallButton from '../../../../components/SmallButton'

// const goals = () => {
//   const goals = [
//     {
//     id: 1234,
//     name: 'Objetivo 1',
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//     link: 'httppblablabla',
//     subgoals: [{title: 'Objetivo 2'}, {title: 'Objetivo 3'}, {title: 'Objetivo 4'}],
//     scenes: [{name: 'Escena 2'}, {name: 'Escena 3'}, {name: 'Escena 4'}],
//     },
//     {
//       id: 5678,
//       name: 'Objetivo 2',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1111,
//       name: 'Objetivo 3',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 2222,
//       name: 'Objetivo 4',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 3333,
//       name: 'Objetivo 5',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 4444,
//       name: 'Objetivo 6',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 5555,
//       name: 'Objetivo 7',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 6666,
//       name: 'Objetivo 8',
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
//         {goals.map((goal, index) => (
//           <li key={index} className='list-none'>
//             <Box 
//               elem={goal} 
//               img='/icon/diana.png' 
//               opciones={opProps}
//               edit_path={`/therapist/goals/${goal.id}`}
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

// export default goals
