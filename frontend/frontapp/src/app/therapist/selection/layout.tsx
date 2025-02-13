// app/therapist/layout.tsx
import { Inter } from 'next/font/google';
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import MarginWidthWrapper from "../../../components/MarginWidthWrapper";
import HeaderMobile from "../../../components/MobileHeader";
import PageWrapper from "../../../components/PageWrapper";
import SideNav from "../../../components/SideNav";
import { SIDENAV_ITEMS } from "../../../constants";

const inter = Inter({ subsets: ['latin'] });

export default function TherapistLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className={`flex min-h-screen flex-col bg-white ${inter.className}`}>
        <Header />
        <div className="flex flex-1">
          <SideNav list={SIDENAV_ITEMS} admin={undefined}/>
          <main className="flex-1">
            <MarginWidthWrapper>
              <HeaderMobile lista_items={SIDENAV_ITEMS}/>
              <PageWrapper>{children}</PageWrapper>
            </MarginWidthWrapper>
          </main>
        </div>
        <Footer />
      </div>
    );
  }
