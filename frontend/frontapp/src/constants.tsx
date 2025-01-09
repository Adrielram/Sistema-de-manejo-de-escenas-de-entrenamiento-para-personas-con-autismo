import { BsPeopleFill } from "react-icons/bs"; // <BsPeopleFill /> icono de personas
import { BiSolidSpreadsheet } from "react-icons/bi"; // <BiSolidSpreadsheet /> icono de evaluacion
import { MdContentCopy } from "react-icons/md"; // <MdContentCopy /> icono de contenido
import { ImVideoCamera } from "react-icons/im"; // <ImVideoCamera /> icono de escena
import { GoGoal } from "react-icons/go"; // <GoGoal /> icono de objetivo
//import { BiSolidEdit } from "react-icons/bi"; // <BiSolidEdit /> icono de edicion
import { IoIosAdd } from "react-icons/io"; // <IoIosAdd /> icono de agregar

import { SideNavItem } from './types';

export const SIDENAV_ITEMS: SideNavItem[] = [
    {
      title: 'Contenidos',
      path: '/therapist',
      icon: <MdContentCopy />,
      submenu: true,
      subMenuItems: [
        {
            title: 'Objetivos',
            path: '/therapist/goals',
            icon: <GoGoal />,
            submenu: true,
            subMenuItems: [
                { 
                    title: 'Agregar Objetivo', 
                    path: '/therapist/goals/add_goal' ,
                    icon: <IoIosAdd />,
                },
            ],
        },
        {
            title: 'Escenas',
            path: '/therapist/scenes',
            icon: <ImVideoCamera />,
            submenu: true,
            subMenuItems: [
              { 
                title: 'Agregar Escena', 
                path: '/therapist/scenes/add-scene',
                icon: <IoIosAdd />, 
              },
            ],
        },
        {
            title: 'Evaluaciones',
            path: '/therapist/assesments',
            icon: <BiSolidSpreadsheet />,
            submenu: true,
            subMenuItems: [
              { 
                title: 'Agregar Evaluación', 
                path: '/therapist/assesments/add_assesment',
                icon: <IoIosAdd />, 
              },
            ],
        },
        {
            title: 'Grupo de Pacientes',
            path: '/therapist/group_of_patients',
            icon: <BsPeopleFill />,
            submenu: true,
            subMenuItems: [
              { 
                title: 'Agregar Grupo', 
                path: '/therapist/group_of_patients/add_group',
                icon: <IoIosAdd />, 
              },
              { 
                title: 'Agregar Paciente', 
                path: '/therapist/group_of_patients/add_patient',
                icon: <IoIosAdd />, 
              },
            ],
        },
      ],
    },
];