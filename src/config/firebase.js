// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuração Firebase - MyImoMate 3.0
const firebaseConfig = {
  apiKey: "AIzaSyDczFgGCwPPnLcvYSkWn0trshH9BMqVoiA",
  authDomain: "myimomate3-0.firebaseapp.com",
  projectId: "myimomate3-0",
  storageBucket: "myimomate3-0.firebasestorage.app",
  messagingSenderId: "971739318329",
  appId: "1:971739318329:web:7d59f6602c259a940325e8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar services
export const db = getFirestore(app);
export const auth = getAuth(app);

console.log('🔥 Firebase inicializado:', app.name);

export default app;