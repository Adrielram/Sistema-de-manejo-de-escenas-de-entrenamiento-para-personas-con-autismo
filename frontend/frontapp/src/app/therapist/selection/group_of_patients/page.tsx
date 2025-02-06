"use client";

import React, { useCallback, useEffect, useState } from "react";
import BoxPaginado from "../../../../components/PaginadoDinamico";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../../store/store";
import NoGroupsMessage from "../../../../components/NoGroupsMessage";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: string;
    nombre: string;
  }>;
}

const GroupsPage: React.FC = () => {
  const [data, setData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const showImage = true;
  const { username } = useSelector((state: RootState) => state.user);

  const fetchGroups = useCallback(async (page: number) => {
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8000/api/get_groups_per_user/?username=${encodeURIComponent(username)}&page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include', // Incluir cookies (para manejar la cookie JWT)
      });

      if (!response.ok) {
        throw new Error("Error al obtener los grupos.");
      }

      const groupsData: PaginatedResponse = await response.json();
      setTotalItems(groupsData.count);

      const formattedData: { [key: string]: string } = {};
      groupsData.results.forEach((group) => {
        formattedData[group.id] = group.nombre;
      });

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchGroups(currentPage);
  }, [fetchGroups, currentPage]);

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
      fetchGroups(currentPage);
    }
  }, [currentPage, data, fetchGroups]);

  const opProps = {
    trashBin: true, 
    editButton: true,
    seePatientsButton: true,
  }

  return (
    <div>
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <div className="container mx-auto p-4">
          {totalItems === 0 ? ( // Check if there are no items
            <NoGroupsMessage /> // Render the NoGroupsMessage component
          ) : (<BoxPaginado 
            data={data} 
            options={opProps}
            img='/icon/silueta_de_multiples_usuarios.png'
            edit_path="/therapist/selection/group_of_patients/"
            patients_list_path="/therapist/selection/group_of_patients/patients/"
            item_type="group"
            showImage={showImage}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            itemsPerPage={8}
            onItemDeleted={handleItemDeleted}
          />
        )}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;

// import React from 'react'

// import Box from '../../../../components/Box'
// import SmallButton from '../../../../components/SmallButton'

// const group_of_patient = () => {
//   const group_of_patients = [
//     {
//     id: 1122,
//     name: 'Grupo 1',
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//     link: 'httppblablabla',
//     subgoals: [{title: 'Objetivo 2'}, {title: 'Objetivo 3'}, {title: 'Objetivo 4'}],
//     scenes: [{name: 'Escena 2'}, {name: 'Escena 3'}, {name: 'Escena 4'}],
//     },
//     {
//       id: 1121,
//       name: 'Grupo 2',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1123,
//       name: 'Grupo 3',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1124,
//       name: 'Grupo 4',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1125,
//       name: 'Grupo 5',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1126,
//       name: 'Grupo 6',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1127,
//       name: 'Grupo 7',
//       description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
//       link: 'httppblablabla',
//       subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
//       scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
//     },
//     {
//       id: 1128,
//       name: 'Grupo 8',
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
//         {group_of_patients.map((group_of_patient, index) => (
//           <li key={index} className='list-none'>
//             <Box 
//               elem={group_of_patient} 
//               img='/icon/silueta_de_multiples_usuarios.png' 
//               opciones={opProps} 
//               edit_path={`/therapist/group_of_patients/${group_of_patient.id}`}
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

// export default group_of_patient
