import React from 'react'

import Box from '../../../../components/Box'
import SmallButton from '../../../../components/SmallButton'

const assesments = () => {
  const assesments = [
    {
    id: 3311,
    name: 'Evaluacion 1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
    link: 'httppblablabla',
    subgoals: [{title: 'Objetivo 2'}, {title: 'Objetivo 3'}, {title: 'Objetivo 4'}],
    scenes: [{name: 'Escena 2'}, {name: 'Escena 3'}, {name: 'Escena 4'}],
    },
    {
      id: 3312,
      name: 'Evaluacion 2',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 3313,
      name: 'Evaluacion 3',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 3314,
      name: 'Evaluacion 4',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 3315,
      name: 'Evaluacion 5',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 3316,
      name: 'Evaluacion 6',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 3317,
      name: 'Evaluacion 7',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 3318,
      name: 'Evaluacion 8',
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
        {assesments.map((assesment, index) => (
          <li key={index} className='list-none'>
            <Box 
              elem={assesment} 
              img='/icon/evaluacion.png' 
              opciones={opProps}
              edit_path= {`/therapist/assesments/${assesment.id}`}
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

export default assesments
