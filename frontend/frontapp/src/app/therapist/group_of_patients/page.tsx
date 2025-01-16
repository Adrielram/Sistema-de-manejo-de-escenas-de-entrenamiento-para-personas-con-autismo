import React from 'react'

import Box from '../../../components/Box'
import SmallButton from '../../../components/SmallButton'

const group_of_patient = () => {
  const group_of_patients = [
    {
    id: 1122,
    name: 'Grupo 1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
    link: 'httppblablabla',
    subgoals: [{title: 'Objetivo 2'}, {title: 'Objetivo 3'}, {title: 'Objetivo 4'}],
    scenes: [{name: 'Escena 2'}, {name: 'Escena 3'}, {name: 'Escena 4'}],
    },
    {
      id: 1121,
      name: 'Grupo 2',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1123,
      name: 'Grupo 3',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1124,
      name: 'Grupo 4',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1125,
      name: 'Grupo 5',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1126,
      name: 'Grupo 6',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1127,
      name: 'Grupo 7',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1128,
      name: 'Grupo 8',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
  ]

  const opProps = {
    trashBin: true, 
    buttonEdit: true,
  }
  
  return (
    <div>
      <div className="flex flex-row flex-wrap justify-center gap-x-14">
        {group_of_patients.map((group_of_patient, index) => (
          <li key={index}>
            <Box 
              elem={group_of_patient} 
              img='/icon/silueta_de_multiples_usuarios.png' 
              opciones={opProps} 
              edit_path={`/therapist/group_of_patients/${group_of_patient.id}`}
            />
          </li>
        ))}
      </div>
      <div className='flex flex-row justify-between mx-6 sm:mx-16 mt-8'>
        <SmallButton title='Anterior'/>
        <SmallButton title='Siguiente'/>
      </div>
    </div>
  )
}

export default group_of_patient
