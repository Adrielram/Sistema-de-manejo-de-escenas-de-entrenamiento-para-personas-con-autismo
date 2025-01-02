import React from 'react';
import Box_paciente from '../../components/Box_paciente';


// pasarle a Box_paciente la info del paciente, obteniendola del backend. usar props

const pacientes = [
  { id: 1, nombre: "adrielram", dni: "445357637", padreACargo:"marithe"},
  { id: 2, nombre: "rautto", dni: "255350234", padreACargo:"la patriciaaaaaaaaaaa"},
  {id:3,nombre:"omar",dni:"123456789",padreACargo:"nomeacuerdo"},
  {id:4,nombre:"mate",dni:"123456789",padreACargo:"nomeacuerdo"},
  {id:5,nombre:"tomi",dni:"123456789",padreACargo:"nomeacuerdo"},
  {id:6,nombre:"ladux",dni:"123456789",padreACargo:""},
];

const Page = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-1 p-1 sm:p-2 bg-white">
      {pacientes.map((paciente) => (
     <div
          key={paciente.id}
          className="flex flex-col items-center justify-center w-full"
        >
                   <Box_paciente paciente = {paciente}/>
    </div>
 ))}

    </div>
  );
};

export default Page;