'use client'

import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from "react";
import BoxPaginado from "../../../../../components/PaginadoDinamico";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    dni: string;
    nombre: string;
  }>;
}

const PatientsOfGroupPage: React.FC = () => {
  const [data, setData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const showImage = true;

  const searchParams = useSearchParams()
  const group_id = searchParams.get('group_id')

  const fetchPatients = useCallback(async (page: number) => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/get_patients_per_group/?group_id=${encodeURIComponent(group_id)}&page=${page}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener los pacientes.");
      }

      const patientsData: PaginatedResponse = await response.json();
      setTotalItems(patientsData.count);

      const formattedData: { [key: string]: string } = {};
      patientsData.results.forEach((patient) => {
        formattedData[patient.dni] = patient.nombre;
      });

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }, [group_id]);

  useEffect(() => {
    fetchPatients(currentPage);
  }, [fetchPatients, currentPage]);

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
      fetchPatients(currentPage);
    }
  }, [currentPage, data, fetchPatients]);

  const opProps = {
    editButton: true,
    //commentsButton: true,
    supervisionButton: true,
    formsButton: true,
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
            img='/icon/persona_silueta.png'
            edit_path="/therapist/selection/group_of_patients/patients/"
            supervision_path='/therapist/selection/group_of_patients/patients/follow_patient/'
            //comments_path='/therapist/selection/group_of_patients/patients/patient_comments/'
            forms_path='/therapist/selection/group_of_patients/patients/forms/'
            item_type="patient"
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

export default PatientsOfGroupPage;