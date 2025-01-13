import type { Metadata } from "next";

import { Inter } from 'next/font/google';
// import { Geist, Geist_Mono } from "next/font/google";

import Footer from "../../components/Footer";
import Header from "../../components/Header";


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {

  title: "Centro Casabella",
  description: "Entorno de entrenamiento para personas con autismo",

};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}){
  return (
    <html lang="en">
      <body className={`min-h-screen bg-white ${inter.className}`}>
        <div>
        <Header /> {/* Asegúrate de que esté fuera del contenedor flex */}
          <main className = "mt-14 p-5">{children}</main>
        <Footer />
        </div>
      </body>
    </html>
  );
}
