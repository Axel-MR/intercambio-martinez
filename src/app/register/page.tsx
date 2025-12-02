"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (auth.currentUser) {
      // Si ya hay un usuario autenticado, redirigir a otra página
      router.push("/dashboard"); // O la ruta que desees
    }
  }, [router]); // Añadido 'router' como dependencia
  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Crear usuario con correo y contraseña
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Guardar los datos adicionales del usuario en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        email: user.email,
        username: nickname,
        role: "normal", // Valor por defecto, puede cambiarse más tarde
        status: true, // Usuario activo
        createdAt: serverTimestamp(), // Marca de tiempo del registro
      });
  
      alert("¡Registro exitoso!");
      router.push("/login"); // Redirigir al login
    } catch (err) {
      console.error("Error al registrarse:", err);
      if (err instanceof Error) {
        setError("Error al registrarse: " + err.message);
      } else {
        setError("Error al registrarse: Se produjo un error desconocido");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-3 px-4">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Intercambio Martínez
        </h1>

        <div className="flex justify-center mb-4">
          <FontAwesomeIcon icon={faGift} size="3x" className="text-red-500" />
        </div>

        <h4 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Crear Cuenta
        </h4>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Nombre o Apodo
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ingresa tu nombre o apodo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-900"
            />
          </div>

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
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}
