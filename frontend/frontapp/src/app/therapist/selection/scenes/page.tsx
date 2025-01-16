import React from 'react'

import Box from '../../../../components/Box'
import SmallButton from '../../../../components/SmallButton'

const scenes = () => {
  const scenes = [
    {
    id: 1221,
    name: 'Escena 1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
    link: 'httppblablabla',
    subgoals: [{title: 'Objetivo 2'}, {title: 'Objetivo 3'}, {title: 'Objetivo 4'}],
    scenes: [{name: 'Escena 2'}, {name: 'Escena 3'}, {name: 'Escena 4'}],
    },
    {
      id: 1222,
      name: 'Escena 2',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1223,
      name: 'Escena 3',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1224,
      name: 'Escena 4',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1225,
      name: 'Escena 5',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1226,
      name: 'Escena 6',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1227,
      name: 'Escena 7',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque. Duis vulputate commodo lectus, ac blandit elit tincidunt id. Sed rhoncus, tortor sed eleifend tristique, tortor',
      link: 'httppblablabla',
      subgoals: [{title: 'Objetivo 5'}, {title: 'Objetivo 6'}, {title: 'Objetivo 7'}],
      scenes: [{name: 'Escena 5'}, {name: 'Escena 6'}, {name: 'Escena 7'}],
    },
    {
      id: 1228,
      name: 'Escena 8',
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
        {scenes.map((scene, index) => (
          <li key={index}>
            <Box 
              elem={scene} 
              img='/icon/pelicula.png' 
              opciones={opProps}
              edit_path={`/therapist/scenes/${scene.id}`}
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

export default scenes
