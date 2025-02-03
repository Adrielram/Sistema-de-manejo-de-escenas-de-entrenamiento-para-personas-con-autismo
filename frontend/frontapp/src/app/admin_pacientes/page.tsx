import React from 'react';
import Box_paciente from '../../components/Box';


// pasarle a Box_paciente la info del paciente, obteniendola del backend. usar props

const pacientes = [
  { id: 1, nombre: "Adriel Ram Ferrero", dni: "445357637", padreACargo:"marithe"},
  { id: 2, nombre: "Braian Rautto", dni: "255350234", padreACargo:"la patriciaaaaaaaaaaa"},
  {id:3,nombre:"Hector Omar Miño",dni:"123456789",padreACargo:"nomeacuerdo"},
  {id:4,nombre:"Mateo Romero",dni:"123456789",padreACargo:"nomeacuerdo"},
  {id:5,nombre:"Tomas Guerrero",dni:"123456789",padreACargo:"nomeacuerdo"},
  {id:6,nombre:"Juan Ladux",dni:"123456789",padreACargo:""},
  {id:7,nombre:"Tomas Rodriguez",dni:"123456",padreACargo:"idk"},
  {id:8,nombre:"Bonelli del Hoyo", dni:"1234",padreACargo:"idk"},
];

const Page = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-1 p-1 sm:p-2 bg-white">
      {pacientes.map((paciente) => (
     <div
          key={paciente.id}
          className="flex flex-col items-center justify-center w-full"
        >
                   <Box_paciente paciente = {paciente}  opciones={{
    personalInfo: false,
    buttonVer: false,
    buttonEdit: true,
    buttonSeguimiento: true,
    buttonComments: true,
    trashBin: true,
  }}/>
    </div>
 ))}

    </div>
  );
};

export default Page;