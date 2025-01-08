// pages/auth/login.js
import LoginForm from '../../../components/forms/LoginForm';
import Image from 'next/image';

import Header from "../../../components/Header";

export default function LoginPage() {
  return (
    <div
      className="flex justify-center items-center min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/imagenFondoLogin.jpg')",
      }}
    >
      <Header/>
      <div className="w-full max-w-md p-8 bg-white border-2 border-black border-solid rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
        <div className="border-2 border-black rounded-full p-1">
            <Image
              src="/images/logoCasabella.png" 
              alt="Logo Casa Bella"
              width={120} 
              height={120} 
              className="rounded-full"
            />
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}