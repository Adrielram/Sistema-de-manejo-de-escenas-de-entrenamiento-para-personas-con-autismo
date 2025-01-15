import type { Metadata } from "next";

import { Inter } from 'next/font/google';
// import { Geist, Geist_Mono } from "next/font/google";

import Footer from "../../components/Footer";
import Header from "../../components/Header";




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
    <div>
    <Header /> {/* Asegúrate de que esté fuera del contenedor flex */}
      <main className = "mt-14 p-5">{children}</main>
    <Footer />
    </div>
  );
}
