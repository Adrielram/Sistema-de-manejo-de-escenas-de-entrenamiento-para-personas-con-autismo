'use client'

import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from "react";
import BoxPaginado from "../../../../../../components/PaginadoDinamico";

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    dni: string;
    nombre: string;
  }>;
}

const PatientForms: React.FC = () => {
  const [data, setData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const showImage = true;

  const searchParams = useSearchParams()
  const patient_dni = searchParams.get('patient_dni')
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchPatientForms = useCallback(async (page: number) => {
    setLoading(true);

    try {
      const response = await fetch(
        `${baseUrl}get_patient_forms/?user_dni=${encodeURIComponent(patient_dni)}&page=${page}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error("Error al obtener los formularios del paciente.");
      }

      const formsData: PaginatedResponse = await response.json();
      setTotalItems(formsData.count);

      const formattedData: { [key: string]: string } = {};
      formsData.results.forEach((form) => {
        formattedData[form.id] = form.nombre;
      });

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }, [patient_dni]);

  useEffect(() => {
    fetchPatientForms(currentPage);
  }, [fetchPatientForms, currentPage]);

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
      fetchPatientForms(currentPage);
    }
  }, [currentPage, data, fetchPatientForms]);

  const opProps = {
    revisionButton: true,
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
            revision_path="/therapist/selection/group_of_patients/patients/forms/revision/" 
            item_type="patient"
            user_dni={patient_dni}
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

export default PatientForms;
