"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CrearSorteo from "../components/CrearSorteo";
import SorteosDisponibles from "../components/SorteosDisponibles";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import GlowButton from "../components/GlowButtons";

const db = getFirestore(); // Inicializa Firestore

export default function Inicio() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "usuarios", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
          } else {
            console.error("El documento del usuario no existe.");
          }
        } catch (error) {
          console.error("Error al obtener los datos del usuario:", error);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fondo con animación */}
      <div className="absolute inset-0 gradient-anim opacity-30"></div>

      {/* Contenido principal */}
      <div className="relative z-10 flex justify-center items-center w-full h-full p-6">
        <div className="flex flex-col space-y-6 max-w-4xl w-full h-full overflow-auto bg-gray-200 rounded-lg p-4 shadow-md">
          {/* Componente de sorteos */}
          <div className="flex-grow">
            <SorteosDisponibles />
          </div>

          {/* Reglas */}
          <motion.div
            className="bg-gray-100 text-gray-700 p-4 rounded-md shadow"
            initial={{ opacity: 0, x: -100 }} // Comienza desde la izquierda
            animate={{ opacity: 1, x: 0 }} // Se mueve a su posición original
            transition={{ duration: 1, delay: 0.8 }} // Aparece a los 0.8 segundos
          >
            <h2 className="text-lg font-semibold mb-2 ">REGLAS:</h2>
            <p className="mb-2 ">
              Edita tu lista de deseos con mínimo 2 opciones con enlace de
              compra o explicación de dónde conseguir el regalo.
            </p>
            <p className="mb-2">
              El precio tiene que ser de 500 pesos aproximadamente.
            </p>
            <p>
              Cuando el Sorteo esté en{" "}
              <span className="font-semibold">&quot;Disponible&quot;</span>, solo puedes
              inscribirte, y cuando esté en{" "}
              <span className="font-semibold">&quot;Listo&quot;</span> podrás obtener a tu
              amigo secreto.
            </p>
          </motion.div>

          {/* Botón */}

          <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4 text-gray-700">Lista de Deseos</h1>
            <GlowButton />
          </div>

          {/* Crear Sorteo (solo para admin) */}
          {userRole === "admin" && (
            <div className="flex-grow">
              <CrearSorteo isAdmin={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
