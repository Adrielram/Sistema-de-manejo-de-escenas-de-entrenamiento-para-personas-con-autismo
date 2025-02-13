import React from 'react'
import SideNav from '../../components/SideNav'
import Header from '../../components/Header' // Importamos el Header
import { SIDENAV_ITEMS_ADMIN } from '../../constants'
import { Inter } from 'next/font/google';
import Footer from "../../components/Footer";
import MarginWidthWrapper from "../../components/MarginWidthWrapper";
import HeaderMobile from "../../components/MobileHeader";
import PageWrapper from "../../components/PageWrapper";
import { getTokenFromCookies } from '../../utils/cookies';


const inter = Inter({ subsets: ['latin'] });

export default async function AdminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const token = await getTokenFromCookies();
    return (
      <div className={`flex min-h-screen flex-col bg-white ${inter.className}`}>
        <Header token={token}/> {/* Asegúrate de que esté fuera del contenedor flex */}
        <div className="flex flex-1">
          <SideNav list={SIDENAV_ITEMS_ADMIN} admin={true}/>
          <main className="flex-1 ">
            <MarginWidthWrapper>
              <HeaderMobile lista_items={SIDENAV_ITEMS_ADMIN}/>
              <PageWrapper>{children}</PageWrapper>
            </MarginWidthWrapper>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  