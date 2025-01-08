
"use client"

import Image from "next/image";
import NotificationMenu from "./NotificationsMenu"; // Importa el componente
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "../../slices/userSlice";


export default function Header() {
  const dispatch = useDispatch();
  const { username, isLoggedIn } = useSelector((state: RootState) => state.user);
  const handleLogout = () => {
    dispatch(clearUser()); // Limpia el estado global
  };

  return (
    <nav className="bg-[#F6512B] fixed top-0 left-0 w-full flex items-center justify-between px-4 py-2 text-white shadow-md">
      {/* Logo Section (Left-aligned) */}
      <div className="flex items-center space-x-2">
        <Image
          width={48}
          height={48}
          src="/images/fotocasabela.png"
          alt="Centro Casabella Logo"
          className="w-10 h-10 sm:w-12 sm:h-12" // Ajuste responsivo del tamaño del logo
          priority
        />
        <p className="font-bold text-sm sm:text-lg whitespace-nowrap">
          Centro Casabella
        </p>
      </div>

      {/* Action Buttons (Right-aligned) */}
      <div className="flex items-center space-x-2 sm:space-x-4 mr-10 md:mr-0">
        {/* Menú de notificaciones */}
        <NotificationMenu />
      </div>
    </nav>
  );
}
