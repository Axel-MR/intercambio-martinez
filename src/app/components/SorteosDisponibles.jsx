
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faSleigh, faGifts } from '@fortawesome/free-solid-svg-icons';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import Modal from './Modal';
import {motion} from 'framer-motion';

const NotificationModal = ({ show, onClose, message }) => {
  if (!show) return null;

  return (
    <Modal onClose={onClose}>
      <div className="p-4">
        <p className="text-black">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-[#c22451] text-white rounded-md font-bold hover:bg-[#ee3f3f] transition-colors"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};

const SorteosDisponibles = () => {
  const [sorteos, setSorteos] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [participaciones, setParticipaciones] = useState({});
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      console.log('Current user:', currentUser?.email);
      setUser(currentUser);
      if (currentUser) {
        checkParticipaciones(currentUser.uid);
        try {
          const usuariosRef = collection(db, 'usuarios');
          const q = query(usuariosRef, where('email', '==', currentUser.email));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            const isUserAdmin = userData.role === 'admin';
            console.log('User role:', userData.role);
            console.log('Is admin:', isUserAdmin);
            setIsAdmin(isUserAdmin);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const sorteosRef = collection(db, 'sorteos');
    const unsubscribe = onSnapshot(sorteosRef, (snapshot) => {
      const sorteosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSorteos(sorteosData);
    });

    return () => unsubscribe();
  }, []);

  const checkParticipaciones = async (userId) => {
    try {
      const participantesRef = collection(db, 'participantes');
      const q = query(participantesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const participacionesData = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        participacionesData[data.sorteoId] = {
          id: doc.id,
          ...data
        };
      });
      setParticipaciones(participacionesData);
    } catch (error) {
      console.error('Error al verificar participaciones:', error);
    }
  };

  const cambiarEstadoSorteo = async (sorteoId, nuevoEstado) => {
    try {
      const sorteoRef = doc(db, 'sorteos', sorteoId);
      await updateDoc(sorteoRef, {
        estado: nuevoEstado
      });
      setModalMessage(`Estado del sorteo cambiado a: ${nuevoEstado}`);
      setShowModal(true);
    } catch (error) {
      console.error('Error al cambiar el estado del sorteo:', error);
      setModalMessage('Error al cambiar el estado del sorteo');
      setShowModal(true);
    }
  };

  const verAmigoSecreto = async (amigoSecretoId) => {
    if (!amigoSecretoId) {
      setModalMessage("Aún no tienes un amigo secreto asignado.");
      setShowModal(true);
      return;
    }

    try {
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('__name__', '==', amigoSecretoId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const amigoSecreto = snapshot.docs[0].data();
        setModalMessage(`Tu amigo secreto es: ${amigoSecreto.username || 'Usuario sin nombre'}`);
      } else {
        setModalMessage('No se encontró la información del amigo secreto.');
      }
      setShowModal(true);
    } catch (error) {
      console.error('Error al obtener amigo secreto:', error);
      setModalMessage('Error al obtener la información del amigo secreto');
      setShowModal(true);
    }
  };

  const unirseASorteo = async (sorteoId) => {
    if (!user) {
      setModalMessage('Inicia sesión para unirte al sorteo');
      setShowModal(true);
      return;
    }
  
    const sorteo = sorteos.find((sorteo) => sorteo.id === sorteoId);
    
    if (sorteo.estado !== 'Disponible') {
      setModalMessage('Este sorteo no está disponible para inscripciones');
      setShowModal(true);
      return;
    }

    try {
      if (participaciones[sorteoId]) {
        setModalMessage('Ya estás inscrito en este sorteo');
        setShowModal(true);
        return;
      }

      const usuariosRef = collection(db, 'usuarios');
      const usuarioQuery = query(usuariosRef, where('email', '==', user.email));
      const usuarioSnapshot = await getDocs(usuarioQuery);

      let nombreInscrito = 'Usuario sin nombre';
      let username = '';

      if (!usuarioSnapshot.empty) {
        const usuarioData = usuarioSnapshot.docs[0].data();
        username = usuarioData.username || 'Usuario sin nombre';
        nombreInscrito = username;
      }

      const participante = {
        amigoSecretoId: null,
        asignedDate: null,
        disponible: true,
        inscripcionDate: new Date(),
        participacionConfirmado: true,
        sorteoId,
        userId: user.uid,
        nombreInscrito,
        username
      };

      await addDoc(collection(db, 'participantes'), participante);
      checkParticipaciones(user.uid);
      setModalMessage('¡Te has unido al sorteo exitosamente!');
      setShowModal(true);
    } catch (error) {
      console.error('Error al unirse al sorteo:', error);
      setModalMessage('Hubo un error al unirte al sorteo. Por favor, intenta de nuevo.');
      setShowModal(true);
    }
  };

  const asignarAmigoSecreto = async (sorteoId) => {
    if (!user) {
      setModalMessage('Inicia sesión para obtener tu amigo secreto');
      setShowModal(true);
      return;
    }
  
    const sorteo = sorteos.find((s) => s.id === sorteoId);
    if (sorteo.estado !== 'Listo') {
      setModalMessage('El sorteo aún no está listo para asignar amigos secretos');
      setShowModal(true);
      return;
    }
  
    try {
      const participantesRef = collection(db, 'participantes');
      const q = query(participantesRef, where('sorteoId', '==', sorteoId), where('disponible', '==', true));
      const snapshot = await getDocs(q);
  
      const participantesDisponibles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  
      if (participantesDisponibles.length === 0) {
        setModalMessage('No hay participantes disponibles para asignar como amigo secreto.');
        setShowModal(true);
        return;
      }
  
      const participanteActual = participaciones[sorteoId];
      if (!participanteActual) {
        setModalMessage('No estás inscrito en este sorteo.');
        setShowModal(true);
        return;
      }
  
      if (participanteActual.amigoSecretoId) {
        setModalMessage('Ya tienes un amigo secreto asignado.');
        setShowModal(true);
        return;
      }
  
      const participantesDisponiblesSinUsuarioActual = participantesDisponibles.filter(p => p.userId !== user.uid);
      const randomIndex = Math.floor(Math.random() * participantesDisponiblesSinUsuarioActual.length);
      const amigoSecreto = participantesDisponiblesSinUsuarioActual[randomIndex];
  
      const participanteDocRef = doc(db, 'participantes', participanteActual.id);
      await updateDoc(participanteDocRef, {
        amigoSecretoId: amigoSecreto.userId,
        asignedDate: new Date()
      });
  
      const amigoSecretoDocRef = doc(db, 'participantes', amigoSecreto.id);
      await updateDoc(amigoSecretoDocRef, {
        disponible: false
      });
  
      checkParticipaciones(user.uid);
      setModalMessage('¡Has obtenido a tu amigo ¿Quién será?!');
      setShowModal(true);
    } catch (error) {
      console.error('Error al asignar amigo secreto:', error);
      setModalMessage('Error al asignar el amigo secreto');
      setShowModal(true);
    }
  };
  
  const ListaParticipantes = ({ sorteoId }) => {
    const [participantes, setParticipantes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchParticipantes = async () => {
        try {
          const participantesRef = collection(db, 'participantes');
          const q = query(participantesRef, where('sorteoId', '==', sorteoId));
          const snapshot = await getDocs(q);
          const participantesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setParticipantes(participantesData);
        } catch (error) {
          console.error('Error al obtener participantes:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchParticipantes();
    }, [sorteoId]);

    if (loading) return <p className="text-black">Cargando participantes...</p>;

    return (
      <ul className="list-disc ml-6">
        {participantes.length === 0 ? (
          <li className="text-black">No hay participantes inscritos.</li>
        ) : (
          participantes.map((participante) => (
            <li key={participante.id} className="text-black">
              {participante.nombreInscrito}
            </li>
          ))
        )}
      </ul>
    );
  };

  const renderUserButton = (sorteo, participacion) => {
    if (sorteo.estado === 'Disponible') {
      return (
        <button
          onClick={() => participacion.id ? setModalMessage("Ya estás inscrito") : unirseASorteo(sorteo.id)}
          className="mt-4 px-4 py-2 bg-[#c22451] text-white rounded-md font-bold hover:bg-[#ee3f3f] transition-colors flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faSleigh} />
          Inscríbete
        </button>
      );
    } else if (sorteo.estado === 'Listo' && participacion.id) {
      return (
        <button
          onClick={() => asignarAmigoSecreto(sorteo.id)}
          className="mt-4 px-4 py-2 bg-[#c22451] text-white rounded-md font-bold hover:bg-[#ee3f3f] transition-colors"
        >
          Obtener amigo secreto
        </button>
      );
    }
    return null;
  };

  const renderAdminButtons = (sorteo) => {
    if (!isAdmin) return null;

    return (
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => cambiarEstadoSorteo(sorteo.id, 'Disponible')}
          className={`px-4 py-2 text-white rounded-md font-bold transition-colors ${
            sorteo.estado === 'Disponible' 
              ? 'bg-blue-800 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={sorteo.estado === 'Disponible'}
        >
          Marcar Disponible
        </button>
        <button
          onClick={() => cambiarEstadoSorteo(sorteo.id, 'Listo')}
          className={`px-4 py-2 text-white rounded-md font-bold transition-colors ${
            sorteo.estado === 'Listo'
              ? 'bg-green-800 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
          disabled={sorteo.estado === 'Listo'}
        >
          Marcar Listo
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
     <motion.div
  initial={{ opacity: 0, x: -50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5 }}
  className="flex items-center gap-2 justify-center"
>
  <FontAwesomeIcon icon={faGifts} className="text-[#222222] text-xl" /> {/* Ícono antes del texto */}
  <h2 className="font-markazi text-3xl text-[#222222] text-center">
    Amigo Secreto
  </h2>
  <FontAwesomeIcon icon={faGifts} className="text-[#222222] text-xl transform scale-x-[-1]" /> {/* Ícono a la derecha en modo espejo */}
</motion.div>

      {sorteos.map((sorteo, index) => {
        const participacion = participaciones[sorteo.id] || {};
        return (
          <motion.div 
            key={sorteo.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.1 * (index + 1) 
            }}
            className="bg-gray-100 p-6 rounded-lg shadow-md text-black"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">{sorteo.nombre}</h3>
            </div>
            
            <p className="mb-2">Descripción: {sorteo.descripcion}</p>
            <p className="mb-2">
              Fecha de creación: {sorteo.createdAt && new Date(sorteo.createdAt.toDate()).toLocaleDateString()}
            </p>
            <p className="mb-2">Estado: {sorteo.estado || 'Disponible'}</p>
            <p className="mb-4">Participantes:</p>
            <ListaParticipantes sorteoId={sorteo.id} />
            
            {renderUserButton(sorteo, participacion)}
            {renderAdminButtons(sorteo)}

            {participacion.amigoSecretoId && (
              <div className="flex gap-2 items-center mt-4">
                <button
                  onClick={() => verAmigoSecreto(participacion.amigoSecretoId)}
                  className="px-4 py-2 bg-[#3cb1df] text-white rounded-md font-bold hover:bg-[#ee3f3f] transition-colors"
                >
                  Ver amigo secreto
                </button>
                <FontAwesomeIcon icon={faCircleCheck} className="text-[#1DB954]" size="lg" />
              </div>
            )}
          </motion.div>
        );
      })}
      
      <NotificationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
      />
    </div>
  );
};

export default SorteosDisponibles;