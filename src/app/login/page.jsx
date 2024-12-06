"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // No es necesario especificar el tipo de error
  const [showPassword, setShowPassword] = useState(false);
 

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado del formulario
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar el estado del usuario en la base de datos
      const userDoc = await getDoc(doc(db, "usuarios", user.uid));
      if (userDoc.exists()) {
      } else {
        setError("Usuario no encontrado en la base de datos.");
      }
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(err instanceof Error ? "Error al iniciar sesión: " + err.message : "Error desconocido");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 gradient-anim mt-3 px-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Intercambio Martínez
        </h1>

        <div className="flex justify-center mb-4">
          <FontAwesomeIcon icon={faGift} size="3x" className="text-red-500" />
        </div>

        <h4 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Iniciar Sesión
        </h4>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-900"
            />
          </div>

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute top-1/2 right-3 transform -translate-y-.5"
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="text-gray-600"
              />
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Iniciar Sesión
          </button>
          <p className="text-center text-sm text-gray-600 mt-4">
  ¿No tienes cuenta?{" "}
  <a href="/register" className="text-red-500 hover:underline">
    Regístrate aquí
  </a>
</p>

        </form>
      </div>
    </div>
  );
}
