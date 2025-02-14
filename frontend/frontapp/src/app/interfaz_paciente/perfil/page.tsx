"use client";
import React, { useEffect, useState } from "react";

import { useSelector} from "react-redux";
import { RootState } from "../../../../store/store";
import SearchWithFatherRes from '../../../components/SearchWithFatherRes';
import { useRouter } from 'next/navigation';

const UserPage: React.FC = () => {
    const [dni, setDni] = useState("");
    const [nombre, setNombre] = useState("");
    const [fechaNac, setFechaNac] = useState("");
    const [genero, setGenero] = useState("");
    const [role, setRole] = useState("");
    const [direccion, setDireccion] = useState({
        id_dir: "",
        provincia: "",
        ciudad: "",
        calle: "",
        numero: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [padre, setPadre] = useState<string | null>(null);
    const [showSearchFather, setShowSearchFather] = useState(false);
    const [idPadreSeleccionado, setIdPadreSeleccionado] = useState<number | null>(null);
    const router = useRouter();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const { username } = useSelector((state: RootState) => state.user);
    
    const generoMap = {
        "Masculino": "M",
        "Femenino": "F"
    };
    
    const reverseGeneroMap = {
        "M": "Masculino",
        "F": "Femenino"
    };
    
    const handlePadreSeleccionado = (dni: number) => {
        setIdPadreSeleccionado(dni); // Almacena el DNI del padre seleccionado
      };
    useEffect(() => {
        fetch(`${baseUrl}get-user/?username=${username}`,
            { credentials: 'include' }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                setDni(data.dni);
                setNombre(data.nombre);
                setFechaNac(data.fecha_nac);
                if (data.genero) {
                    setGenero(reverseGeneroMap[data.genero]); 
                }
                setRole(data.role);
                setDireccion({
                    id_dir: data.residencia.id_dir,
                    provincia: data.residencia.provincia,
                    ciudad: data.residencia.ciudad,
                    calle: data.residencia.calle,
                    numero: data.residencia.numero.toString(),
                });
                setPadre(data.padreACargo||null);
                setLoading(false); // Termina la carga una vez obtenidos los datos
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, [username]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); // Evita que se recargue la página
    
        // Validaciones simples
        if (!dni || !nombre || !fechaNac || !genero || !role || !direccion.provincia || !direccion.ciudad || !direccion.calle || !direccion.numero) {
            setError("Por favor, completa todos los campos.");
            return;
        }
    
        const updatedUser = {
            dni,
            nombre,
            fecha_nac: fechaNac,
            genero: generoMap[genero],
            role,
            residencia: {
                id_dir: direccion.id_dir,
                provincia: direccion.provincia,
                ciudad: direccion.ciudad,
                calle: direccion.calle,
                numero: parseInt(direccion.numero), // Conversión a número
            },
            padreACargo: idPadreSeleccionado || null,
        };
    
        try {
            console.log("Datos enviados al backend:", updatedUser);
            const response = await fetch(`${baseUrl}update-user/`, {
                method: "PUT",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedUser),
            });
            
            if (!response.ok) {
                const errorResponse = await response.json();
                console.error("Error:", errorResponse);
                throw new Error(errorResponse.detail || "Failed to save user data");
            }
    
            setSuccess("Datos actualizados con éxito");
            setError(null);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Ocurrió un error desconocido");
            }
        }
    };

    const handleVolver = () => {
        router.push("./principal");
    }

    if (loading) {
        return <div className="text-gray-500">Cargando...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-4 bg-sky-700 shadow-md rounded-md">
            <h1 className="text-xl font-semibold mb-4 text-white">Mis Datos</h1>
            {success && <div className="text-green-500 mb-4">{success}</div>}
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block font-medium text-white">DNI:</label>
                    <input
                        type="text"
                        value={dni}
                        readOnly
                        onChange={(e) => setDni(e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium text-white">Nombre:</label>
                    <input
                        type="text"
                        value={nombre}
                        readOnly
                        onChange={(e) => setNombre(e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium text-white">Fecha de Nacimiento:</label>
                    <input
                        type="date"
                        value={fechaNac}
                        onChange={(e) => setFechaNac(e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium text-white">Genero:</label>
                    <select
                        id="genero"
                        value={genero}
                        onChange={(e) => setGenero(e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    >
                        <option value="">Selecciona un género</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                </div>
                <div>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium text-white">Provincia:</label>
                            <input
                                type="text"
                                value={direccion.provincia}
                                onChange={(e) =>
                                    setDireccion({ ...direccion, provincia: e.target.value })
                                }
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-white">Ciudad:</label>
                            <input
                                type="text"
                                value={direccion.ciudad}
                                onChange={(e) =>
                                    setDireccion({ ...direccion, ciudad: e.target.value })
                                }
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-white">Calle:</label>
                            <input
                                type="text"
                                value={direccion.calle}
                                onChange={(e) =>
                                    setDireccion({ ...direccion, calle: e.target.value })
                                }
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-white">Número:</label>
                            <input
                                type="text"
                                value={direccion.numero}
                                onChange={(e) =>
                                    setDireccion({ ...direccion, numero: e.target.value })
                                }
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-white">Padre a cargo:</label>
                            {padre ? (
                                <p className="text-white">{`${padre}`}</p>
                            ) : (
                                <>
                                    {showSearchFather ? (
                                        <SearchWithFatherRes onPadreSeleccionado={handlePadreSeleccionado}/> // Renderiza el componente
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowSearchFather(true)}
                                            className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-950 transition"
                                        >
                                            Agregar Padre
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-left flex space-x-4"> {/* Usar flex y espacio entre botones */}
                    <button
                        type="button"
                        onClick={handleVolver}
                        className="bg-blue-700 text-white p-2 rounded px-6 py-3 hover:bg-blue-800 transition"
                    >
                        Volver
                    </button>
                    <button
                        type="submit"
                        className="bg-orange-700 text-white p-2 rounded px-6 py-3 hover:bg-red-800 transition"
                    >
                        Guardar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserPage;
