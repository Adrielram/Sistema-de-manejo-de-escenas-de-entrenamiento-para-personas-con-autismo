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
  const { center } = useSelector((state: RootState) => state.user);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const fetchAssesments = useCallback(async (page: number) => {
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}forms_per_user/?username=${encodeURIComponent(username)}&centername=${center}&page=${page}`, {
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
    buttonVer: true,
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
            ver_path="/therapist/selection/assesments/ver_assesment?form_id="
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

