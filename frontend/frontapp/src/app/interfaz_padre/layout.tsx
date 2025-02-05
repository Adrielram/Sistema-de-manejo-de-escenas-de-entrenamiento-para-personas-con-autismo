// app/therapist/layout.tsx
import { Inter } from 'next/font/google';
import Footer from '../../components/Footer';
import Header from '../../components/Header';

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
          <main className="flex-1 mt-3">        
              {children}        
          </main>
        </div>
        <Footer />
      </div>
    );
  }