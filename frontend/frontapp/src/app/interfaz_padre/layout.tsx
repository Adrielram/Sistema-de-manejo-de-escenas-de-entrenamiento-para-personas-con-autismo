// app/therapist/layout.js

import { Inter } from 'next/font/google';


import Header from "../../components/Header";

const inter = Inter({ subsets: ['latin'] });

export default function PadreLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className={`min-h-screen bg-white ${inter.className}`}>
        <Header /> 
        <main className = "mt-14">{children}</main>
      </div>
    );
  }