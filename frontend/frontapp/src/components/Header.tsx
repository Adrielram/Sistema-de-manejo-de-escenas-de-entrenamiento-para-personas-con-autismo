import Image from 'next/image';

export default function Header() {
  return (
    <nav className="bg-[#F6512B] flex flex-col md:flex-row justify-between items-center p-4 text-white">

      {/* Contact Section */}
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-12">

        {/* Logo Section */}
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Image
            width={180}
            height={38}
            //src="../../images/fotocasabela.png"
            src="/images/fotocasabela.png"
            alt="Centro Casabella Logo"
            className="w-12 h-12"
          />
          <p className="font-bold">Centro Casabella</p>
        </div>
        
        {/* Address Section */}
        <div className="flex items-center space-x-1 mb-4 md:mb-0">
          <Image
            width={180}
            height={38}
            //src="../../icon/mapa.png"
            src="/icon/mapa.png"
            alt="Centro Casabella Logo"
            className="w-8 h-8"
          />
          <p className="text-center md:text-left">Moreto 732 Ciudad de Buenos Aires, ARGENTINA</p> { /* arreglar esta cajita, espacio a los costados muy grande, se despega del logo de ubicacion */ }
        </div>

        {/* Email */}
        <div className="flex items-center space-x-1">
          <Image
            width={180}
            height={38}
            //src="../../icon/correo.png"
            src="/icon/correo.png"
            alt="Centro Casabella Logo"
            className="w-8 h-8"
          />
          <p>info@centrocasabella.com.ar</p>
        </div>

        {/* Phone */}
        <div className="flex items-center space-x-1">
          <Image
            width={180}
            height={38}
            //src="../../icon/llamada.png"
            src="/icon/llamada.png"
            alt="Centro Casabella Logo"
            className="w-8 h-8"
          />
          <p>Tel: 11 4672-3643 / 11 2183-2018</p>
        </div>
      </div>
    </nav>
  );
}
