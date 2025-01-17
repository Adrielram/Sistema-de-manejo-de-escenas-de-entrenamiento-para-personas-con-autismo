import type { Metadata } from "next";

// import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

// Asegúrate de importar ReduxProvider desde la ruta correcta
import Provider from "../../store/provider";




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
          <Provider>
          <main className = "mt-14">{children}</main>
          </Provider>
        </div>
  );
}

