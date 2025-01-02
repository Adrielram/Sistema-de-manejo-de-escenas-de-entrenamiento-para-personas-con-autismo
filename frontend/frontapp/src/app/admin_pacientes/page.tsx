import React from 'react';
import Box_paciente from '../../components/Box_paciente';


// pasarle a Box_paciente la info del paciente, obteniendola del backend. usar props

const pacientes = [
  { id: 1, nombre: "adrielram", dni: "445357637", padreACargo:"marithe"},
  { id: 2, nombre: "rautto", dni: "255350234", padreACargo:"la patriciaaaaaaaaaaa"},
];

const Page = () => {
  return (
    <div className="grid grid-cols-3 gap-1 p-4">
      {pacientes.map((paciente) => (
     <div
          key={paciente.id}
          className="flex flex-col w-full bg-greens-light_green shadow-2xl rounded-lg p-4 mb-4"
        >
                   <Box_paciente paciente = {paciente}/>
    </div>
 ))}

    </div>
  );
};

export default Page;