"use client"
import { useEffect, useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig'; // Asegúrate de importar la configuración de Firebase
import { doc, getDoc } from 'firebase/firestore';
import CrearSorteo from '../components/CrearSorteo'; // Ajusta la ruta si es necesario

const Intercambio = () => {
  const [isAdmin, setIsAdmin] = useState(false); // Estado para el rol del usuario
  const [loading, setLoading] = useState(true); // Estado para manejar el estado de carga

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser; // Obtén el usuario logueado
      if (user) {
        // Obtén el documento del usuario en Firestore
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'admin') {
            setIsAdmin(true); // Si el rol es 'admin', actualiza el estado
          }
        }
      }
      setLoading(false); // Una vez que se ha obtenido el rol, deja de cargar
    };

    fetchUserRole(); // Llamar a la función para obtener el rol
  }, []);

  // Mientras se carga la información del usuario, muestra un mensaje de carga
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 gradient-anim">
      <h1 className="text-2xl font-bold mb-4">Página de Intercambio</h1>

      {/* Condicional para mostrar CrearSorteo solo si es admin */}
      {isAdmin && <CrearSorteo isAdmin={isAdmin} />}
    </div>
  );
};

export default Intercambio;
