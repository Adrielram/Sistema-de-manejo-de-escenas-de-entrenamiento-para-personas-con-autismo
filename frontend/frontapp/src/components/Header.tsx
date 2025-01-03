import Image from "next/image";
import Link from "next/link";
import NotificationMenu from "./NotificacionsMenu"; // Importa el componente
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "../../slices/userSlice";

export default function Header() {
  return (
    <nav className="bg-[#F6512B] fixed  top-0 left-0 w-full flex items-center justify-between px-4 py-2 text-white shadow-md">
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
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Link
          href="/auth/login"
          className="rounded border-2 border-black bg-white px-2 py-1 text-xs font-bold text-black transition duration-100 hover:bg-green-500 hover:text-black sm:px-3 sm:py-1 sm:text-base"
          aria-label="Log in to your account"
        >
          Log In
        </Link>
        <Link
          href="/register"
          className="rounded border-2 border-black bg-black px-2 py-1 text-xs font-bold text-white transition duration-100 hover:bg-[#44eefa] hover:text-black sm:px-3 sm:py-1 sm:text-base"
          aria-label="Register a new account"
        >
          Register
        </Link>

        {/* Menú de notificaciones */}
        <NotificationMenu />
      </div>
    </nav>
  );
}