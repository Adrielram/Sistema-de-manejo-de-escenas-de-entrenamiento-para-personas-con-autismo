"use client"
import React from 'react'
import SearchBar from '../../../components/Buscador';
import Box from '../../../components/Box';

const page = () => {
  const grupos = [
    { id: 1, nombre: "Grupo 1" },
    { id: 2, nombre: "Grupo 2" },
    { id: 3, nombre: "Grupo 3" },
    { id: 4, nombre: "Grupo 4" },
    { id: 5, nombre: "Grupo 5" },
    { id: 6, nombre: "Grupo 6" },
    { id: 7, nombre: "Grupo 7" },
    { id: 8, nombre: "Grupo 8" },
    { id: 9, nombre: "Grupo 9" },
    { id: 10, nombre: "Grupo 10" }
  ];


  const handleSearch = (query: string) => {
    console.log("Búsqueda:", query);
  };
  

  return (
    <>
      <SearchBar onSearch={handleSearch} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-1 p-1 sm:p-2 bg-white mt-5">
        {grupos.map((grupo) => (
          <div
            key={grupo.id}
            className="flex flex-col items-center justify-center w-full"
          >
            <Box
              elem={grupo}
              opciones={{
                personalInfo: false,
                buttonVer: false,
                buttonEdit: true,
                buttonSeguimiento: false,
                buttonComments: false,
                trashBin: true,
              }}
              img = "/icon/grupo.png"
            />
          </div>
        ))}
      </div> 
    </>

  )
}

export default page