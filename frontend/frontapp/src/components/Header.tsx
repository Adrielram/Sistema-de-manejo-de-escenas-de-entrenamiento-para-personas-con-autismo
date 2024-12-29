export default function Header() {
  return (
    <nav className="bg-[#F6512B] flex flex-col md:flex-row justify-between items-center p-4 text-white">
      {/* Logo Section */}
      <div className="flex items-center space-x-2 mb-4 md:mb-0">
        <img
          src="../../image/fotocasabela.png"
          alt="Centro Casabella Logo"
          className="w-12 h-12"
        />
        <p className="font-bold">Centro Casabella</p>
      </div>

      {/* Address Section */}
      <div className="flex items-center space-x-2 mb-4 md:mb-0">
        <img
          src="../../icon/mapa.png"
          alt="Centro Casabella Logo"
          className="w-8 h-8"
        />
        <p className="text-center md:text-left">Moreto 732 Ciudad de Buenos Aires, ARGENTINA</p>
      </div>

      {/* Contact Section */}
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        {/* Email */}
        <div className="flex items-center space-x-1">
          <img
            src="../../icon/correo.png"
            alt="Centro Casabella Logo"
            className="w-8 h-8"
          />
          <p>info@centrocasabella.com.ar</p>
        </div>

        {/* Phone */}
        <div className="flex items-center space-x-1">
          <img
            src="../../icon/llamada.png"
            alt="Centro Casabella Logo"
            className="w-8 h-8"
          />
          <p>Tel: 11 4672-3643 / 11 2183-2018</p>
        </div>
      </div>
    </nav>
  );
}
