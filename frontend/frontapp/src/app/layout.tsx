import type { Metadata } from "next";

import { Inter } from 'next/font/google';
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Asegúrate de importar ReduxProvider desde la ruta correcta
import ReduxProvider from "../../store/provider";

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
        <ReduxProvider>
        <div className="flex flex-col min-h-screen">
        <main className = "mt-14">{children}</main>
        </div>
        </ReduxProvider>
      </body>
    </html>
  );
}