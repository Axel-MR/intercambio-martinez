"use client";

import { signOut } from "firebase/auth"; // Si usas Firebase Authentication
import { getAuth } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import WishList from "../components/WishList"; // Usa este componente directamente
import listaDeDeseosImg from "../../images/pokevidad.png";
import { motion } from "framer-motion";

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

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="gradient-anim text-white p-4 text-center shadow-md">
        <Link href="/inicio" className="text-xl font-semibold hover:underline">
          Inicio
        </Link>
      </header>

      <main className="flex-grow relative">
        <div id="background" className="absolute inset-0 z-0"></div>
        <div className="absolute inset-0 z-10">
          <Image
            src={listaDeDeseosImg}
            alt="Lista de Deseos"
            layout="fill"
            objectFit="cover"
            objectPosition="center"
            className="opacity-50"
          />
        </div>

        <div className="relative z-20">
          <div className="text-center pt-16">
            <h1 className="text-3xl font-semibold text-black">
              Listas de Deseos
            </h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-4 sm:mx-8 md:mx-12 lg:mx-16 mt-8">
            {listas.map((lista) => (
              <motion.div
                key={lista.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <WishList
                  titulo={lista.titulo} // Texto puro, sin JSX
                  sorteoId={lista.id}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer className="gradient-anim text-white p-4 text-center shadow-md mt-auto">
        <button
          onClick={handleSignOut}
          className="text-xl font-semibold hover:underline"
        >
          Cerrar sesión
        </button>
      </footer>
    </div>
  );
};

export default ListasDeDeseos;
