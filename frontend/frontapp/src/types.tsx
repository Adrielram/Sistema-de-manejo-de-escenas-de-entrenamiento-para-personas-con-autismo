import { JSX } from "react";

export type SideNavItem = {
    title: string;
    path: string;
    icon?: JSX.Element;
    submenu?: boolean;
    subMenuItems?: SideNavItem[];
    other_page?: boolean;
  };

export type MenuItemWithSubMenuProps = {
    item: SideNavItem;
    toggleOpen: () => void;
}

export type OptionsProps = {
  personalInfo?: boolean;
  buttonVer?: boolean;
  trashBin?: boolean;
  commentsButton?: boolean;
  editButton?: boolean;
  supervisionButton?: boolean;
  seePatientsButton?: boolean;
  revisionButton?: boolean;
  scenesCommentsButton?: boolean;
  formsButton?: boolean;
  manageGroupsButton?: boolean;
};

export interface SceneWithOrder {
  id: number;
  nombre: string;
  order: number;
}