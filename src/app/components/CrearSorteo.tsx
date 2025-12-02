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
  const [sorteoIdToManage, setSorteoIdToManage] = useState('');

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

  const ejecutarSorteoBatch = async () => {
    if (!isAdmin) return;
    try {
      const user = auth.currentUser;
      if (!user) return alert('Debes iniciar sesión como admin');
      const token = await user.getIdToken();

      // Default exclusions from user request
      const exclusions = [
        { from: 'La mera vena', forbid: ['Amado'] },
        { from: 'Sam', forbid: ['Amado'] },
        { from: 'Amado', forbid: ['La mera vena', 'Sam'] }
      ];

      const res = await fetch('/api/sorteo-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          exclusions,
          sorteoId: `navidad-${Date.now()}`,
          nombre: newSorteo.nombre || `Sorteo ${new Date().toLocaleDateString()}`,
          descripcion: newSorteo.descripcion || ''
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const serverMsg = data?.error || res.statusText || 'Error desconocido';
        alert('Error al ejecutar sorteo: ' + serverMsg);
        console.error('sorteo-batch error response', data);
        return;
      }
      console.log('Sorteo result', data);
      const assignments = data?.assignments || [];
      if (assignments.length === 0) {
        alert(`Sorteo creado (id: ${data?.sorteoId || 'unknown'}) pero no se encontraron participantes.`);
      } else {
        alert(`Sorteo ejecutado (id: ${data.sorteoId}). Asignaciones: ${assignments.length}`);
      }
      console.table(assignments);
    } catch (e) {
      console.error('Error executing batch', e);
      alert('Error al ejecutar sorteo: ' + (e.message || e));
    }
  };

  const eliminarSorteo = async () => {
    if (!isAdmin) return;
    if (!sorteoIdToManage) return alert('Ingresa el sorteoId a eliminar');
    try {
      const user = auth.currentUser;
      if (!user) return alert('Debes iniciar sesión como admin');
      const token = await user.getIdToken();
      const res = await fetch('/api/sorteo-manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'delete', sorteoId: sorteoIdToManage })
      });
      const data = await res.json();
      if (!res.ok) {
        alert('Error al eliminar sorteo: ' + (data.error || res.statusText));
        console.error('sorteo-manage error', data);
        return;
      }
      alert('Sorteo eliminado correctamente');
      setSorteoIdToManage('');
    } catch (err) {
      console.error('Error deleting sorteo', err);
      alert('Error al eliminar sorteo: ' + (err.message || err));
    }
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
      <button
        onClick={ejecutarSorteoBatch}
        className="mt-4 ml-3 px-4 py-2 bg-red-500 text-white rounded-md font-bold flex items-center hover:bg-red-600 transition-colors"
      >
        Ejecutar Sorteo Batch
      </button>
      <div className="mt-4">
        <label className="block text-sm text-gray-200 mb-1">SorteoId (para eliminar/modificar)</label>
        <input
          type="text"
          value={sorteoIdToManage}
          onChange={(e) => setSorteoIdToManage(e.target.value)}
          placeholder="Ej: navidad-1700000000000"
          className="mb-2 p-2 w-full rounded-md bg-[#333333] text-white placeholder:text-[#888888] border border-transparent"
        />
        <div className="flex gap-2">
          <button
            onClick={eliminarSorteo}
            className="px-4 py-2 bg-gray-700 text-white rounded-md font-bold hover:bg-gray-600 transition-colors"
          >
            Eliminar Sorteo
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearSorteo;
