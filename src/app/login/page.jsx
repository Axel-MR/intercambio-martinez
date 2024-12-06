"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Para redirección
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Autenticar usuario con Firebase
      await signInWithEmailAndPassword(auth, email, password);

      // Redirigir al usuario a la página "intercambio"
      router.push("/inicio");
    } catch (err) {
      // Mostrar error en caso de falla
      setError("Error al iniciar sesión: " + err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 gradient-anim mt-3 px-4"> {/* Añadido px-4 */}
      <div className="bg-white shadow-lg rounded-lg w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Intercambio Martínez
        </h1>

        {/* Icono en la parte superior */}
        <div className="flex justify-center mb-4">
          <FontAwesomeIcon icon={faGift} size="3x" className="text-red-500" />
        </div>

        {/* Título */}
        <h4 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Iniciar Sesión
        </h4>

        {/* Mostrar error si existe */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Campo Correo Electrónico */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Correo Electrónico 
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-800" 
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Iniciar Sesión
          </button>
        </form>
        <div className="flex justify-center  items-center mt-4">
        <a href="/register" className="text-blue-500 hover:text-blue-700">
          Regístrate aquí
        </a>
        </div>
      </div>
    </div>
  );
}

