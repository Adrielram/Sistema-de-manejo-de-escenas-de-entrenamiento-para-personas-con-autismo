// app/therapist/layout.js

import { Inter } from 'next/font/google';

import Footer from "../../components/Footer";
import Header from "../../components/Header";

const inter = Inter({ subsets: ['latin'] });

export default function TherapistLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className={`min-h-screen bg-white ${inter.className}`}>
        <Header /> {/* Asegúrate de que esté fuera del contenedor flex */}
        {children}
        <Footer />
      </div>
    );
  }