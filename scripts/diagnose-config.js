import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

console.log('🔍 Iniciando diagnóstico de configuración...\n');

// 0. Debuggear archivo .env
const envPath = path.resolve(process.cwd(), '.env');
console.log(`0️⃣  Buscando archivo .env en: ${envPath}`);

if (fs.existsSync(envPath)) {
    console.log('   ✅ Archivo .env encontrado.');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    console.log('   ℹ️  Contenido crudo (primeros 50 chars):', envContent.slice(0, 50).replace(/\n/g, '\\n'));

    // Parseo manual simple para verificar
    const lines = envContent.split('\n');
    console.log('   ℹ️  Claves encontradas en el archivo:');
    lines.forEach(line => {
        const match = line.match(/^([^=]+)=/);
        if (match) console.log(`      - ${match[1]}`);
    });
} else {
    console.error('   ❌ Archivo .env NO encontrado en la ruta especificada.');
}

// 1. Verificar Variables de Entorno (Cargadas por dotenv)
console.log('\n1️⃣  Verificando Variables de Entorno (process.env):');
const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'OPENAI_API_KEY'
];

let missingVars = 0;
requiredVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`   ✅ ${varName} está definida (${process.env[varName].slice(0, 5)}...)`);
    } else {
        console.log(`   ❌ ${varName} NO está definida`);
        missingVars++;
    }
});

if (missingVars > 0) {
    console.error('\n❌ Faltan variables de entorno críticas. Revisa tu archivo .env');
    process.exit(1);
}

// 2. Probar Conexión OpenAI
console.log('\n2️⃣  Probando conexión con OpenAI...');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

try {
    const models = await openai.models.list();
    console.log('   ✅ Conexión con OpenAI exitosa');
    console.log(`   ℹ️  Modelo gpt-4o-mini disponible: ${models.data.some(m => m.id === 'gpt-4o-mini') ? 'Sí' : 'No'}`);
} catch (error) {
    console.error('   ❌ Error conectando con OpenAI:', error.message);
}

// 3. Probar Conexión Firebase (Firestore)
console.log('\n3️⃣  Probando conexión con Firebase Firestore...');
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('   ✅ Firebase App inicializada');

    // Intentar escribir y borrar un documento de prueba
    const testCol = collection(db, '_diagnostics_test');
    const docRef = await addDoc(testCol, {
        timestamp: new Date(),
        test: 'connection_check'
    });
    console.log('   ✅ Escritura en Firestore exitosa (ID:', docRef.id, ')');

    await deleteDoc(doc(db, '_diagnostics_test', docRef.id));
    console.log('   ✅ Borrado en Firestore exitoso');

} catch (error) {
    console.error('   ❌ Error conectando con Firebase:', error.message);
    if (error.code === 'permission-denied') {
        console.log('   ⚠️  Nota: "permission-denied" puede ser normal si las reglas de seguridad bloquean escrituras no autenticadas.');
    }
}

console.log('\n🏁 Diagnóstico finalizado.');
