'use client'; 

export default function Homepage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-orange-700">Bienvenido a la página principal</h1>
      <p className="text-lg text-gray-700 mt-4">Aquí puedes ver tu información como usuario.</p>
    </div>
  );
}