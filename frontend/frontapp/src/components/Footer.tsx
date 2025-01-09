import React from "react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-auto bottom-0 bg-[#F6512B] text-white py-6 relative z-20">
      <div className=" flex flex-col justify-center text-center md:flex-row md:space-y-0 md:space-x-12 md:items-center">
        {/* Address Section */}
        <div className="flex items-center justify-center ">
          <Image
            width={24}
            height={24}
            src="/icon/mapa.png"
            alt="Location Icon"
            className="w-6 h-6"
          />
          <p className="text-sm md:text-base ">
            Moreto 732, Ciudad de Buenos Aires, ARGENTINA
          </p>
        </div>

        {/* Email */}
        <div className="flex items-center justify-center">
          <Image
            width={24}
            height={24}
            src="/icon/correo.png"
            alt="Email Icon"
            className="w-6 h-6"
          />
          <p className="text-sm md:text-base">
            <a href="mailto:info@centrocasabella.com.ar" className="hover:underline">
              info@centrocasabella.com.ar
            </a>
          </p>
        </div>

        {/* Phone */}
        <div className="flex items-center justify-center">
          <Image
            width={24}
            height={24}
            src="/icon/llamada.png"
            alt="Phone Icon"
            className="w-6 h-6"
          />
          <p className="text-sm md:text-base">
            <a href="tel:1146723643" className="hover:underline">
              Tel: 11 4672-3643
            </a>{" "}
            |{" "}
            <a href="tel:1121832018" className="hover:underline">
              11 2183-2018
            </a>
          </p>
        </div>
      </div>

      {/* Divider and Credits */}
      <div className="mt-6 border-t border-white opacity-50 pt-4 text-sm text-gray-200 text-center">
        © 2025 Centro Casabella. Todos los derechos reservados.
      </div>
    </footer>
  );
}
