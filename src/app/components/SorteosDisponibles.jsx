
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSleigh, faGifts } from '@fortawesome/free-solid-svg-icons';
import { Gift, Check, Sparkles, Users } from 'lucide-react';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, onSnapshot, getDoc } from 'firebase/firestore';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAdmin, setIsAdmin] = useState(false);
  const [participaciones, setParticipaciones] = useState({});
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [assignedMap, setAssignedMap] = useState({});

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

  // When the user and sorteos are available, check assignment docs for this user
  useEffect(() => {
    if (!user || !sorteos || sorteos.length === 0) return;
    const fetchAssignments = async () => {
      try {
        const newMap = { ...assignedMap };
        for (const s of sorteos) {
          // Only check if we don't already have an assignment recorded
          if (newMap[s.id]) continue;
          const assignRef = doc(db, 'sorteos', s.id, 'assignments', user.uid);
          const snap = await getDoc(assignRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data && data.assignedToUid) {
              newMap[s.id] = data.assignedToUid;
            }
          }
        }
        setAssignedMap(newMap);
      } catch (err) {
        console.error('Error fetching assignment docs for user:', err);
      }
    };
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sorteos]);

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

  // eliminar función cambiarEstadoSorteo porque no se usa actualmente (se removieron botones/admin)
  const verAmigoSecreto = async (amigoSecretoId) => {
    if (!amigoSecretoId) {
      setModalMessage("Aún no tienes un amigo secreto asignado.");
      setShowModal(true);
      return;
    }

    try {
      const usuarioDocRef = doc(db, 'usuarios', amigoSecretoId);
      const usuarioSnap = await getDoc(usuarioDocRef);

      if (usuarioSnap.exists()) {
        const amigoSecreto = usuarioSnap.data();
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

      if (participantesDisponiblesSinUsuarioActual.length === 0) {
        setModalMessage('No hay otros participantes disponibles para asignarte un amigo secreto en este momento.');
        setShowModal(true);
        return;
      }

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

  // Admin buttons and user button render helpers were inlined earlier; removed unused helpers to satisfy lint.

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
        const hasParticipacion = Boolean(participacion.id || assignedMap[sorteo.id] || (sorteo.participants && Array.isArray(sorteo.participants) && sorteo.participants.length > 0));
        return (
          <motion.div
            key={sorteo.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-red-100"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-green-500 to-red-500"></div>
            <div className="absolute top-2 right-2 text-6xl opacity-5">🎄</div>

            <div className="relative p-5 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    {sorteo.nombre}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3">{sorteo.descripcion}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="font-semibold text-gray-700">Participantes:</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <ListaParticipantes sorteoId={sorteo.id} />
                </div>
              </div>

              {/* Admin state buttons removed per request */}

              {sorteo.estado === 'Disponible' && (
                <div className="mt-2">
                  {!participacion.id ? (
                    <button
                      onClick={() => unirseASorteo(sorteo.id)}
                      className="mt-2 px-4 py-2 bg-[#c22451] text-white rounded-md font-bold hover:bg-[#ee3f3f] transition-colors flex items-center gap-2"
                    >
                      <FontAwesomeIcon icon={faSleigh} />
                      Inscríbete
                    </button>
                  ) : (
                    <p className="text-sm text-gray-600">Ya estás inscrito</p>
                  )}
                </div>
              )}

              {sorteo.estado === 'Listo' && !hasParticipacion && participacion.id && !assignedMap[sorteo.id] && (
                <div>
                  <button
                    onClick={() => asignarAmigoSecreto(sorteo.id)}
                    className="mt-4 px-4 py-2 bg-[#c22451] text-white rounded-md font-bold hover:bg-[#ee3f3f] transition-colors"
                  >
                    Obtener amigo secreto
                  </button>
                </div>
              )}

              {hasParticipacion && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <button
                    onClick={() => verAmigoSecreto(participacion.amigoSecretoId || assignedMap[sorteo.id])}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Gift className="w-5 h-5" />
                    <span className="text-sm sm:text-base">Ver amigo secreto</span>
                  </button>
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-2 left-2 text-2xl opacity-5">✨</div>
            <div className="absolute bottom-2 right-2 text-2xl opacity-5">⭐</div>
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