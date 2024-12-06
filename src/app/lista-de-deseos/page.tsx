'use client';

import Image from 'next/image';
import Link from 'next/link';
import WishList from '../components/WishList';
import listaDeDeseosImg from '../../images/pokevidad.png';

const ListasDeDeseos = () => {
  const listas = [
    { titulo: 'Claudia', id: 'id_Claudia' },
    { titulo: 'Héctor', id: 'id_Hector' },
    { titulo: 'Josué', id: 'id_Josue' },
    { titulo: 'Kevin', id: 'id_Kevin' },
    { titulo: 'Daniel', id: 'id_Daniel' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="gradient-anim text-white p-4 text-center shadow-md">
        <Link href="/inicio" className="text-xl font-semibold hover:underline">
          Inicio
        </Link>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow relative">
        {/* Fondo animado */}
        <div id="background" className="absolute inset-0 z-0"></div>

        {/* Fondo repetido con la imagen de fondo */}
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

        {/* Contenido */}
        <div className="relative z-20">
          {/* Título principal con el logo de la lista de deseos */}
          <div className="text-center pt-16">
            <h1 className="text-3xl font-semibold">Listas de Deseos</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-4 sm:mx-8 md:mx-12 lg:mx-16 mt-8">
            {listas.map((lista) => {
              // Verificamos si cada lista tiene las propiedades necesarias
              if (!lista || !lista.id || !lista.titulo) {
                return <div key={lista.id} className="text-red-500">Error: Datos inválidos para esta lista</div>;
              }
              return <WishList key={lista.id} titulo={lista.titulo} sorteoId={lista.id} />;
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListasDeDeseos;

