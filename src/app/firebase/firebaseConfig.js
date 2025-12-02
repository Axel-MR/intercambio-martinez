// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importar el módulo de autenticación
import { getFirestore } from "firebase/firestore"; // Importar Firestore

// Your web app's Firebase configuration read from environment variables.
// These are public values and should use the NEXT_PUBLIC_ prefix so they
// are available on the client.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore and export them
export const auth = getAuth(app); // Exportar la instancia de autenticación
export const db = getFirestore(app); // Exportar la instancia de Firestore

export default app;
