"use client";
import Image from "next/image";
import Link from "next/link";
import WishList from "../components/WishList";
import listaDeDeseosImg from "../../images/pokevidad.png";
import { motion } from "framer-motion";
import { Home, Gift, Sparkles } from "lucide-react";

const ListasDeDeseos = () => {
  const listas = [
    { titulo: "Claudia", id: "id_Claudia" },
    { titulo: "Héctor", id: "id_Hector" },
    { titulo: "Josué", id: "id_Josue" },
    { titulo: "Sam", id: "id_Sam" },
    { titulo: "Kevin", id: "id_Kevin" },
    { titulo: "Daniel", id: "id_Daniel" },
    { titulo: "Amado", id: "id_Amado" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-amber-50 to-green-50">
      {/* Header moderno */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b-2 border-red-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            href="/inicio" 
            className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Home className="w-5 h-5" />
            <span>Inicio</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow relative">
        {/* Background con imagen */}
        <div className="absolute inset-0 z-0">
          <Image
            src={listaDeDeseosImg}
            alt="Lista de Deseos"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            className="opacity-10"
          />
        </div>

        {/* Overlay con gradiente */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>

        <div className="relative z-20 py-8 px-4">
          {/* Título principal con decoración */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <Gift className="w-8 h-8 text-red-600 animate-pulse" />
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-clip-text text-transparent">
                Listas de Deseos
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-gray-600 font-medium italic">
              Descubre lo que cada amigo desea esta Navidad
            </p>
            
            {/* Línea decorativa */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="h-1 w-20 bg-gradient-to-r from-transparent via-green-500 to-transparent rounded-full"></div>
            </div>
          </motion.div>

          {/* Grid de listas - Optimizado para móvil */}
          <div className="max-w-7xl mx-auto">
            <div className="space-y-8">
              {listas.map((lista, index) => (
                <motion.div
                  key={lista.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1 
                  }}
                  className="w-full"
                >
                  <WishList
                    titulo={lista.titulo}
                    sorteoId={lista.id}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="relative z-30 bg-gradient-to-r from-red-100 via-white to-green-100 border-t-2 border-red-200/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm font-medium">
            Amigo Secreto 2025
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </footer>

      {/* Decoración flotante sutil */}
      <div className="fixed top-1/4 left-8 text-6xl opacity-5 animate-pulse pointer-events-none hidden lg:block">
        ★
      </div>
      <div className="fixed bottom-1/3 right-12 text-5xl opacity-5 animate-pulse pointer-events-none hidden lg:block" style={{ animationDelay: '1.5s' }}>
        ♦
      </div>
    </div>
  );
};

export default ListasDeDeseos;