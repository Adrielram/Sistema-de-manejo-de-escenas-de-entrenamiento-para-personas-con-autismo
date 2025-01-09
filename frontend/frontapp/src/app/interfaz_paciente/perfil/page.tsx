"use client";
import React, { useEffect, useState } from "react";

const USERNAME = "juanperez"; // Constante con el username

const UserPage: React.FC = () => {
    const [dni, setDni] = useState("");
    const [nombre, setNombre] = useState("");
    const [fechaNac, setFechaNac] = useState("");
    const [genero, setGenero] = useState("");
    const [role, setRole] = useState("");
    const [direccion, setDireccion] = useState({
        id_dir: 1,
        provincia: "",
        ciudad: "",
        calle: "",
        numero: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch(`http://localhost:8000/api/get-user/?username=${USERNAME}`)
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
                setGenero(data.genero);
                setRole(data.role);
                setDireccion({
                    id_dir: 1,
                    provincia: data.direccion.provincia,
                    ciudad: data.direccion.ciudad,
                    calle: data.direccion.calle,
                    numero: data.direccion.numero.toString(),
                });
                setLoading(false); // Termina la carga una vez obtenidos los datos
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, []);

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
            genero,
            role,
            direccion: {
                provincia: direccion.provincia,
                ciudad: direccion.ciudad,
                calle: direccion.calle,
                numero: parseInt(direccion.numero, 10),
            },
        };

        try {
            const response = await fetch(`http://localhost:8000/api/update-user/${USERNAME}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) {
              const errorResponse = await response.json(); // Captura la respuesta de error
              console.error("Error:", errorResponse);
              throw new Error("Failed to save user data");
          }

            setSuccess("Datos actualizados con éxito");
            setError(null); // Limpia el mensaje de error si hay uno
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Ocurrió un error desconocido");
            }
        }
    };

    if (loading) {
        return <div className="text-gray-500">Cargando...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-md">
            <h1 className="text-xl font-semibold mb-4">Datos del Usuario</h1>
            {success && <div className="text-green-500 mb-4">{success}</div>}
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block font-medium">DNI:</label>
                    <input
                        type="text"
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium">Nombre:</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium">Fecha de Nacimiento:</label>
                    <input
                        type="date"
                        value={fechaNac}
                        onChange={(e) => setFechaNac(e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium">Género:</label>
                    <input
                        type="text"
                        value={genero}
                        onChange={(e) => setGenero(e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium">Provincia:</label>
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
                            <label className="block font-medium">Ciudad:</label>
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
                            <label className="block font-medium">Calle:</label>
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
                            <label className="block font-medium">Número:</label>
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
                    </div>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                >
                    Guardar
                </button>
            </form>
        </div>
    );
};

export default UserPage;
