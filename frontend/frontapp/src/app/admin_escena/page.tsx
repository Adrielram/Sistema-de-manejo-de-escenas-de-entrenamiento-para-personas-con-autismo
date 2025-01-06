import React from 'react';
import Box_Escena from '../../components/Box_Escena';

const escenas = [
    { nombre: 'ES1', id: 1, idioma: "ESP", complejidad: "1", link:"http..."},
    { nombre: 'ES2', id: 2, idioma: "US", complejidad: "2", link:"http..."},
    { nombre: 'ES3', id: 3, idioma: "ESP", complejidad: "3", link:"http..."},
];


const App = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-1 gap-x-1 p-1 sm:p-2 bg-white">
            {escenas.map((escena) => (
                <div
                    key={escena.nombre}
                    className="flex flex-col items-center justify-center w-full">
    
                    <Box_Escena nombreEscena={escena.nombre}/> 
                </div>
                )
            )}
        </div>
    );
};

export default App;
