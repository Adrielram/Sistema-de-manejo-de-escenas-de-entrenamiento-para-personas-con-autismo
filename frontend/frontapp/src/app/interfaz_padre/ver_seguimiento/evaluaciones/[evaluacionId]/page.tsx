"use client";
import RevisionFormulario from "../../../../../components/RevisionFormulario";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../../store/store";
import { useParams } from "next/navigation"; // Importa useParams

const Evaluacion = () => {
  const { evaluacionId } = useParams(); // Obtén los parámetros directamente 
  const { userId } = useSelector((state: RootState) => state.user); // Obtén el userId desde Redux

  return (
    <>      
      <RevisionFormulario
        formularioId={Number(evaluacionId)}
        pacienteDni={userId}
        rolUsuario="persona"
      />
    </>
  );
};

export default Evaluacion;
