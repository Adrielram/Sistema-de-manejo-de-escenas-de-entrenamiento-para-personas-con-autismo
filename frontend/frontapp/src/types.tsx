import { JSX } from "react";

export type SideNavItem = {
    title: string;
    path: string;
    icon?: JSX.Element;
    submenu?: boolean;
    subMenuItems?: SideNavItem[];
  };

export type MenuItemWithSubMenuProps = {
    item: SideNavItem;
    toggleOpen: () => void;
}

export type OptionsProps = {
  // name se muestra siempre
  personalInfo?: boolean; // DNI y padre a cargo
  buttonVer?: boolean; // Muestra botón de "Ver"
  trashBin?: boolean; // Muestra icono de tacho de basura
  buttonComments?: boolean; // Muestra botón de "Comentarios"
  buttonEdit?: boolean; // Muestra botón de "Editar"
  buttonSeguimiento?: boolean; // Muestra botón de "Seguimiento"
};