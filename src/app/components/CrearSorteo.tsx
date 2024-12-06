import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebaseConfig';

// Definir el tipo de las props para incluir isAdmin como un booleano
interface CrearSorteoProps {
  isAdmin: boolean; // Recibimos isAdmin como prop
}

const CrearSorteo: React.FC<CrearSorteoProps> = ({ isAdmin }) => {
  const [newSorteo, setNewSorteo] = useState({
    nombre: '',
    descripcion: '',
    maxParticipantes: 0,
    estado: 'En Espera',
    fechaInicio: new Date(),
    fechaFin: new Date(),
  });

  // Definir el tipo para el parámetro e como un evento de cambio
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSorteo((prev) => ({ ...prev, [name]: value }));
  };

  const crearSorteo = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert('Debes estar logueado para crear sorteos');
      return;
    }

    await addDoc(collection(db, 'sorteos'), {
      ...newSorteo,
      creadorId: user.uid,
      createdAt: new Date(),
    });

    alert('Sorteo creado exitosamente');
    setNewSorteo({
      nombre: '',
      descripcion: '',
      maxParticipantes: 0,
      estado: 'En Espera',
      fechaInicio: new Date(),
      fechaFin: new Date(),
    });
  };

  // Renderizar el componente solo si el usuario es admin
  if (!isAdmin) return null;

  return (
    <div className="bg-[#222222] p-6 rounded-xl mb-6 shadow-lg">
      <h3 className="font-markazi text-2xl text-white mb-4">Crear nuevo sorteo</h3>
      <input
        type="text"
        name="nombre"
        value={newSorteo.nombre}
        onChange={handleInputChange}
        placeholder="Nombre del sorteo"
        className="mb-4 p-3 w-full rounded-md bg-[#333333] text-white placeholder:text-[#888888] border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        name="descripcion"
        value={newSorteo.descripcion}
        onChange={handleInputChange}
        placeholder="Descripción"
        className="mb-4 p-3 w-full rounded-md bg-[#333333] text-white placeholder:text-[#888888] border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="number"
        name="maxParticipantes"
        value={newSorteo.maxParticipantes}
        onChange={handleInputChange}
        placeholder="Máximo de participantes"
        className="mb-4 p-3 w-full rounded-md bg-[#333333] text-white placeholder:text-[#888888] border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={crearSorteo}
        className="mt-4 px-4 py-2 bg-white text-[#7c2e1b] rounded-md font-bold flex items-center hover:bg-gray-200 transition-colors"
            >
        Crear Sorteo
      </button>
    </div>
  );
};

export default CrearSorteo;
