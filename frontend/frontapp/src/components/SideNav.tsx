'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SideNavItem } from '../types';
import { RiArrowDropDownLine } from "react-icons/ri";

const SideNav = ({list}) => {
  return (
    <div className="md:w-64 bg-white fixed top-[64px] left-0 h-[calc(100vh-64px)] border-r border-zinc-200 overflow-y-auto scrollbar-hidden hidden md:flex z-10">
      {/* Contenedor con scroll interno */}
      <div className="flex flex-col space-y-6 w-full h-full mt-4">

        {/* Menú desplegable */}
        <div className="flex flex-col space-y-2 md:px-4">
          {list.map((item, idx) => (
            <MenuItem key={idx} item={item} depth={0} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideNav;

const MenuItem = ({ item, depth }: { item: SideNavItem; depth: number }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  const toggleSubMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita que el enlace redirija al hacer clic en el botón de despliegue
    setSubMenuOpen(!subMenuOpen);
  };

  const fontSizeClass = depth === 0 ? 'text-lg' : depth === 1 ? 'text-base' : 'text-sm';

  return (
    <div>
      {item.submenu ? (
        <>
          <Link
            href={item.path}
            className={`flex flex-row items-center p-2 rounded-lg w-full justify-between text-black 
              ${pathname.includes(item.path) 
                ? 'bg-[#3EA5FF] text-white hover:bg-[#2E8BFF]' 
                : 'hover:bg-zinc-100 hover:text-black'
            } ${fontSizeClass}`}
          >
            <div className="flex flex-row space-x-4 items-center">
              {item.icon && React.cloneElement(item.icon, { size: 20 })}
              <span className="font-semibold flex">{item.title}</span>
            </div>
            <button
              onClick={toggleSubMenu}
              className={`flex items-center ${
                subMenuOpen ? 'rotate-180' : ''
              }`}
            >
              <RiArrowDropDownLine size={28}/>
            </button>
          </Link>

          {subMenuOpen && (
            <div className="my-2 ml-6 flex flex-col space-y-2 text-black">
              {item.subMenuItems?.map((subItem, idx) => (
                <MenuItem key={idx} item={subItem} depth={depth + 1} />
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.path}
          className={`flex flex-row space-x-4 items-center p-2 rounded-lg  
            ${item.path === pathname 
              ? 'bg-[#3EA5FF] text-white hover:bg-[#2E8BFF]' 
              : 'hover:bg-zinc-200 hover:text-black'
          } ${fontSizeClass}`}
        >
          {item.icon && React.cloneElement(item.icon, { size: 20 })}
          <span className="flex">{item.title}</span>
        </Link>
      )}
    </div>
  );
};
