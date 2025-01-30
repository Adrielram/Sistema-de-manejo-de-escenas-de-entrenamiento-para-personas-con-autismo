'use client'

import React, { useEffect, useState } from 'react'
import AssignedObjectives from '../../../../../../components/AssignedObjectives'

const EditPatient: React.FC<{ params: Promise<{ patient_id: string }> }> = ({ params }) => {
  const [patientId, setPatientId] = useState<string | null>(null);
  
  useEffect(() => {
      const unwrapParams = async () => {
        try {
          const resolvedParams = await params;
          setPatientId(resolvedParams.patient_id);
        } catch (error) {
          console.error("Error resolviendo params:", error);
        }
      };
      unwrapParams();
    }, [params]);
  
  return (
    <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg border border-blue-100">
      <AssignedObjectives patientId={patientId}/>
    </div>
  )
}

export default EditPatient
