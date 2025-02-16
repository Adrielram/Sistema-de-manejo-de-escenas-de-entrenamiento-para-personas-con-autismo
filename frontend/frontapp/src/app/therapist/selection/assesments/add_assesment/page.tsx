"use client";
import Formulario from '../../../../../components/Formulario';
//import ResponderForm from '../../../../../components/ResponderForm';
import { enviarFormulario } from '../../../../../utils/api';
import { useRouter } from 'next/navigation';

const CreateAssesment: React.FC = () => { 
  const router = useRouter();

  const manejarEnvio = async (formulario) => {
    const resultado = await enviarFormulario(formulario);
    
    if (!resultado.success){
      alert("No se pudo crear el formulario.")
    }else{
      alert("Formulario creado exitosamente");
      console.log('Formulario creado:', resultado);
      router.push('/therapist/selection/assesments');

    }      
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#3EA5FF] mb-8 text-center">
          Crear Evaluacion
        </h1>
        <Formulario onSubmit={manejarEnvio} />
        {/*<ResponderForm />*/}
    </div>
    </div>

  )
}

export default CreateAssesment