"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CrearSorteo from "../components/CrearSorteo";
import SorteosDisponibles from "../components/SorteosDisponibles";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import GlowButton from "../components/GlowButtons";
import { Gift, AlertCircle, Sparkles } from "lucide-react";

const db = getFirestore();

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
      <div className="w-full h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-50 via-white to-green-50">
        <div className="relative">
          <Gift className="w-16 h-16 text-red-600 animate-pulse" />
          <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-2 -right-2 animate-ping" />
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-700">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-green-50">
      {/* Decoración de fondo sutil */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 text-8xl">★</div>
        <div className="absolute top-40 right-20 text-6xl">♦</div>
        <div className="absolute bottom-40 left-1/4 text-7xl">★</div>
        <div className="absolute bottom-20 right-1/3 text-5xl">♦</div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Sección de sorteos disponibles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SorteosDisponibles />
        </motion.div>

        {/* Card de reglas - Diseño moderno */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden"
        >
          {/* Borde decorativo superior */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-green-500 to-red-500"></div>
          
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  Reglas del Intercambio
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </h2>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Edita tu lista de deseos con <span className="font-semibold text-red-600">mínimo 2 opciones</span> con enlace de compra o explicación de dónde conseguir el regalo.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      El precio tiene que ser de <span className="font-semibold text-green-600">$500 pesos</span> aproximadamente.
                    </p>
                  </div>
                </div>

                {/* Línea decorativa */}
                <div className="flex items-center gap-2 mt-6">
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-green-300 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Botón de Lista de Deseos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center justify-center py-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <Gift className="w-8 h-8 text-red-600" />
            Lista de Deseos
          </h2>
          <GlowButton />
        </motion.div>

        {/* Crear Sorteo (solo para admin) */}
        {userRole === "admin" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden"
          >
            {/* Badge de Admin */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              ADMIN
            </div>
            
            <div className="p-6">
              <CrearSorteo isAdmin={true} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer decorativo */}
      <div className="relative z-10 mt-16 pb-8">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  );
}