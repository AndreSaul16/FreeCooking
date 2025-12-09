import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};



console.log('Firebase Config Check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    projectId: firebaseConfig.projectId
});

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Log de inicialización en desarrollo
if (import.meta.env.DEV) {
    console.log('🔥 Firebase inicializado con Project ID:', firebaseConfig.projectId);

    const missingVars = Object.entries(firebaseConfig)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missingVars.length > 0) {
        console.error('❌ Faltan variables de entorno de Firebase:', missingVars.join(', '));
    } else {
        console.log('✅ Todas las variables de Firebase están definidas');
    }
}

// Servicios
export const auth = getAuth(app);
export const db = getFirestore(app);

// CRÍTICO: Habilitar persistencia offline de Firestore
// Esto permite que la app funcione sin conexión
enableIndexedDbPersistence(db)
    .then(() => {
        console.log('✅ Persistencia offline habilitada');
    })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('⚠️ Múltiples tabs abiertas, persistencia offline deshabilitada');
        } else if (err.code === 'unimplemented') {
            console.warn('⚠️ Navegador no soporta persistencia offline');
        } else {
            console.error('❌ Error al habilitar persistencia:', err);
        }
    });

export default app;
