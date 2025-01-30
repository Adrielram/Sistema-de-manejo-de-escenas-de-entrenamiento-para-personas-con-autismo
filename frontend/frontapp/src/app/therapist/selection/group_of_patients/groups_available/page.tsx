"use client";

import React, { useCallback, useEffect, useState } from "react";
import BoxPaginado from "../../../../../components/PaginadoDinamico";
import { useSelector } from 'react-redux';
import { RootState } from "../../../../../../store/store";
import NoGroupsMessage from "../../../../../components/NoGroupsMessage";

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
      const response = await fetch(
        `http://localhost:8000/api/get_groups_per_user_not_in/?username=${encodeURIComponent(username)}&page=${page}`
      );

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
          ) : (
            <BoxPaginado 
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


