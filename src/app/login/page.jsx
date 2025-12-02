"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift } from "@fortawesome/free-solid-svg-icons";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function Login() {
  const [error, setError] = useState(null);
  const [tokenLogin, setTokenLogin] = useState("");
  // token-only login
  const router = useRouter();


  const handleTokenLogin = async (e) => {
    e.preventDefault();
    try {
      if (!tokenLogin) {
        setError("Ingresa un token");
        return;
      }

      const res = await fetch("/api/token-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenLogin }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error iniciando con token");
        return;
      }

      const customToken = data.customToken;
      await signInWithCustomToken(auth, customToken);
      router.push("/inicio");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen mt-3 px-4">
      <div className="bg-white/90 shadow-lg rounded-lg w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Intercambio Martínez</h1>

        <div className="flex justify-center mb-4">
          <FontAwesomeIcon icon={faGift} size="3x" className="text-red-500" />
        </div>

        <h4 className="text-2xl font-bold text-center text-gray-700 mb-6">Iniciar Sesión</h4>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <div className="space-y-4">
          <form onSubmit={handleTokenLogin} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-600 mb-1">Token</label>
              <input
                id="token"
                value={tokenLogin}
                onChange={(e) => setTokenLogin(e.target.value)}
                placeholder="Ingresa tu token de acceso"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none text-gray-900"
              />
            </div>
            <button type="submit" className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
              Iniciar con Token
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}