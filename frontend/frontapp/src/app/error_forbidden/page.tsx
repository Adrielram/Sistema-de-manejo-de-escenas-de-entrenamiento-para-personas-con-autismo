
export default function ForbiddenPage() {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold text-orange-600">403 - Acceso Denegado</h1>
        <p className="text-gray-600">No tienes permiso para acceder a esta página.</p>
      </div>
    );
  }