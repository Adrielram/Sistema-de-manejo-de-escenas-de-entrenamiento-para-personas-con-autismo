// app/vista-evaluacion/page.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import VistaEvaluacion from '../../../../../components/VistaEvaluacion'

const VistaEvaluacionPage = () => {
  const searchParams = useSearchParams()
  const formId = searchParams.get('form_id')

  if (!formId) return <div className="text-red-500 text-center mt-8">ID de formulario no proporcionado</div>

  return (
    <div className="p-4">
      <VistaEvaluacion formularioId={Number(formId)} />
    </div>
  )
}

export default VistaEvaluacionPage