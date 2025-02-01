import { BsPeopleFill } from "react-icons/bs"; // <BsPeopleFill /> icono de personas
import { BiSolidSpreadsheet } from "react-icons/bi"; // <BiSolidSpreadsheet /> icono de evaluacio

import { MdContentCopy } from "react-icons/md"; // <MdContentCopy /> icono de contenido
import { ImVideoCamera } from "react-icons/im"; // <ImVideoCamera /> icono de escena
import { GoGoal } from "react-icons/go"; // <GoGoal /> icono de objetivo
//import { BiSolidEdit } from "react-icons/bi"; // <BiSolidEdit /> icono de edicion
import { IoIosAdd } from "react-icons/io"; // <IoIosAdd /> icono de agregar
import { FaPerson } from "react-icons/fa6";
import { FaUserDoctor } from "react-icons/fa6";
import { GiHealthNormal } from "react-icons/gi";
import { FaComments } from "react-icons/fa";

import { SideNavItem } from './types';

export const SIDENAV_ITEMS: SideNavItem[] = [
    {
      title: 'Centros de Salud', // Nuevo título
      path: '/therapist', // Ruta del botón
      icon: <GiHealthNormal />, // Puedes usar otro ícono que prefieras
      submenu: false, // No tiene submenú
    },
    {
      title: 'Contenidos',
      path: '/therapist/selection',
      icon: <MdContentCopy />,
      submenu: true,
      subMenuItems: [
        {
            title: 'Objetivos',
            path: '/therapist/selection/goals',
            icon: <GoGoal />,
            submenu: true,
            subMenuItems: [
                { 
                    title: 'Agregar Objetivo', 
                    path: '/therapist/selection/goals/add_goal' ,
                    icon: <IoIosAdd />,
                },
            ],
        },
        {
            title: 'Escenas',
            path: '/therapist/selection/scenes',
            icon: <ImVideoCamera />,
            submenu: true,
            subMenuItems: [
              { 
                title: 'Agregar Escena', 
                path: '/therapist/selection/scenes/add-scene',
                icon: <IoIosAdd />, 
              },
            ],
        },
        {
            title: 'Evaluaciones',
            path: '/therapist/selection/assesments',
            icon: <BiSolidSpreadsheet />,
            submenu: true,
            subMenuItems: [
              { 
                title: 'Agregar Evaluación', 
                path: '/therapist/selection/assesments/add_assesment',
                icon: <IoIosAdd />, 
              },
            ],
        },
        {
            title: 'Grupo de Pacientes',
            path: '/therapist/selection/group_of_patients',
            icon: <BsPeopleFill />,
            submenu: true,
            subMenuItems: [
              { 
                title: 'Agregar Grupo', 
                path: '/therapist/selection/group_of_patients/add_group',
                icon: <IoIosAdd />, 
              },
            ],
        },
      ],
    },
];

export const SIDENAV_ITEMS_ADMIN: SideNavItem[] = [
  {
    title: 'Funcionalidades',
    path: '/admin',
    icon: <MdContentCopy />,
    submenu: true,
    subMenuItems: [
      {
          title: 'Centros de Salud',
          path: '/admin/health_center',
          icon: <GiHealthNormal  />,
          submenu: true,
          subMenuItems: [
              { 
                  title: 'Crear Centro de Salud', 
                  path: '/admin/health_center/create_center' ,
                  icon: <GiHealthNormal  />,
              },
          ],
      },
      {
          title: 'Administrar Terapeutas',
          path: '/admin/therapists',
          icon: <FaUserDoctor />,
          submenu: false,    
      },
      {
          title: 'Administrar Pacientes',
          path: '/admin/patients',
          icon: <FaPerson />,
          submenu: false,
      },
      {
          title: 'Administrar Grupos',
          path: '/admin/groups',
          icon: <BsPeopleFill />,
          submenu: true,
          subMenuItems: [
            { 
              title: 'Crear Grupo', 
              path: '/admin/groups/create_group',
              icon: <IoIosAdd />, 
            },     
          ],
      },
      {
        title: 'Administrar Comentarios',
        path: '/admin/comments',
        icon: <FaComments />,
        submenu: false,    
    },
    ],
  },
];