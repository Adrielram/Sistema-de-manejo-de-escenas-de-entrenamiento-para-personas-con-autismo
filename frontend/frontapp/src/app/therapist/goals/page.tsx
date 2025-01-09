import React from 'react'

import Box from '../../../components/Box'

const goals = () => {
  const goals = [
    {
    id: 1234,
    name: 'Objetivo 1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
    link: 'httppblablabla',
    subgoals: [{title: 'Objetivo 2'}, {title: 'Objetivo 3'}, {title: 'Objetivo 4'}],
    scenes: [{name: 'Escena 2'}, {name: 'Escena 3'}, {name: 'Escena 4'}],
    },
    {
      id: 5678,
      name: 'Objetivo 2',
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
      {goals.map(goal => 
        <Box elem={goal} img='/icon/objetivo.png' opciones={opProps}/>
      },
    </div>
  )
}

export default goals