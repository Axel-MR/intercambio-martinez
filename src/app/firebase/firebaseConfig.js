// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importar el módulo de autenticación
import { getFirestore } from "firebase/firestore"; // Importar Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlFvZjx32RMTCpM0LnQruEtyPC0HvhWQ8",
  authDomain: "navidad-mtz.firebaseapp.com",
  projectId: "navidad-mtz",
  storageBucket: "navidad-mtz.firebasestorage.app",
  messagingSenderId: "232014688705",
  appId: "1:232014688705:web:6129b5fd5418683c967f40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore and export them
export const auth = getAuth(app); // Exportar la instancia de autenticación
export const db = getFirestore(app); // Exportar la instancia de Firestore

export default app;
