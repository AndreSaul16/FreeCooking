import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let serviceAccount;

// Support both Env Var (Render) and File (Local)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log("🔑 Using FIREBASE_SERVICE_ACCOUNT from Env Var");
    } catch (error) {
        console.error("❌ Error parsing FIREBASE_SERVICE_ACCOUNT env var:", error);
    }
} else {
    try {
        serviceAccount = require('../../FIREBASE-PRIVATE-KEY.json');
        console.log("📂 Using local FIREBASE-PRIVATE-KEY.json");
    } catch (error) {
        console.error("⚠️ No credentials found!");
    }
}

// Prevent multiple initializations
if (getApps().length === 0 && serviceAccount) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

export const db = getFirestore();
export const auth = getAuth();
console.log("🔥 Firebase Admin Configured!");
