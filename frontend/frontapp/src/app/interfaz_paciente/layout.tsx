// /app/interfaz_paciente/layout.tsx
import "../globals.css";
import HeaderPaciente from "../../components/HeaderPaciente";

export default function InterfacePacienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#f5af76] min-h-screen flex flex-col">
        <HeaderPaciente />
      <main className="mt-14">{children}</main>
    </div>
  );
}
