// pages/objetivos.tsx
'use client'

import { useEffect, useState } from 'react';

interface Objetivo {
    id: number;
    titulo: string;
    descripcion: string;
    escena: number; // Asumiendo que el ID de la escena es un número
    resultado_tera?: string;
}

const Objetivos = () => {
    const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
    
    useEffect(() => {
        const fetchObjetivos = async () => {
            const response = await fetch('http://localhost:8000/api/objetivos/'); // Ajusta la URL según sea necesario
            const data = await response.json();
            setObjetivos(data);
        };

        fetchObjetivos();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-black">Lista de Objetivos</h1>
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b text-black">ID</th>
                        <th className="py-2 px-4 border-b text-black">Título</th>
                        <th className="py-2 px-4 border-b text-black">Descripción</th>
                        <th className="py-2 px-4 border-b text-black">Escena</th>
                        <th className="py-2 px-4 border-b text-black">Resultado Tera</th>
                    </tr>
                </thead>
                <tbody>
                    {objetivos.map((objetivo) => (
                        <tr key={objetivo.id}>
                            <td className="py-2 px-4 border-b text-black">{objetivo.id}</td>
                            <td className="py-2 px-4 border-b text-black">{objetivo.titulo}</td>
                            <td className="py-2 px-4 border-b text-black">{objetivo.descripcion || 'N/A'}</td>
                            <td className="py-2 px-4 border-b text-black">{objetivo.escena || 'N/A'}</td>
                            <td className="py-2 px-4 border-b text-black">{objetivo.resultado_tera || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Objetivos;