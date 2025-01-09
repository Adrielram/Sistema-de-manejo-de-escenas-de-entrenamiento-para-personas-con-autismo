'use client';

import { useState } from "react";
import { Input } from '@headlessui/react';
import Header from "../../components/Header";
const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [gender, setGender] = useState("");
    const [role, setRole] = useState("");

    const handleRegister = async () => {
        //e.preventDefault();

        const response = await fetch("http://localhost:8000/api/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Usuario registrado con éxito");
        } else {
            alert(data.error || "Registro fallido");
        }
    };

    return (
        <div className="bg-[#EDEDED] h-screen flex items-center justify-center"> 
            <Header/>
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg flex flex-col gap-4 items-center"> 
                <form onSubmit={handleRegister}>
                    <h1>Register</h1>
                    <Input
                        type="text"
                        placeholder="Nombre de usuario"
                        className="p-4 w-64 border-none border-b border-b-[#a7bcff] placeholder:text-gray-400 focus:outline-none"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        type="date"
                        placeholder="Fecha de Nacimiento"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                        required
                    />
                    <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                        <option value="">Género</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="otro">Otro</option>
                    </select>
                    <select value={role} onChange={(e) => setRole(e.target.value)} required>
                        <option value="">Rol</option>
                        <option value="Admin">Admin</option>
                        <option value="female">Terapeuta</option>
                        <option value="other">Paciente</option>
                        <option value="other">Padre</option>
                    </select>
                    <Input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Register</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
