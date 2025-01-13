// app/therapist/layout.js

import { Inter } from 'next/font/google';

import MarginWidthWrapper from "../../../components/MarginWidthWrapper";
import HeaderMobile from "../../../components/MobileHeader";
import PageWrapper from "../../../components/PageWrapper";
import SideNav from "../../../components/SideNav";
import { SIDENAV_ITEMS } from "../../../constants";

const inter = Inter({ subsets: ['latin'] });

export default function PadreLayout2({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className={`min-h-screen bg-white ${inter.className}`}>
        <div className="flex">
          <SideNav list={SIDENAV_ITEMS}/>
          <main className="flex-1">
            <MarginWidthWrapper>
              <HeaderMobile />
              <PageWrapper>{children}</PageWrapper>
            </MarginWidthWrapper>
          </main>
        </div>
      </div>
    );
  }