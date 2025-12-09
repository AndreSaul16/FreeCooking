import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Helper to read firebase config from src/services/firebase.js is hard because it exports 'db' etc.
// We will just read the google-services.json or ask user to provide config?
// Actually, for a script, we can just hardcode the config or read it from a separate file.
// But wait, the user has google-services.json. We can parse that!
// android/app/google-services.json

const googleServicesPath = path.resolve(process.cwd(), 'android/app/google-services.json');
let firebaseConfig = {};

try {
    const googleServices = JSON.parse(fs.readFileSync(googleServicesPath, 'utf8'));
    const client = googleServices.client[0];
    firebaseConfig = {
        apiKey: client.api_key[0].current_key,
        authDomain: `${googleServices.project_info.project_id}.firebaseapp.com`,
        projectId: googleServices.project_info.project_id,
        storageBucket: googleServices.project_info.storage_bucket,
        messagingSenderId: googleServices.project_info.project_number,
        appId: client.client_info.mobilesdk_app_id
    };
} catch (e) {
    console.error("Could not parse google-services.json. Make sure it exists.");
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function fetchLogs() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("❌ Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env file");
        process.exit(1);
    }

    try {
        console.log(`🔐 Authenticating as ${email}...`);
        await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Authenticated!");

        console.log("📥 Fetching last 20 logs...");
        const q = query(collection(db, 'system_logs'), orderBy('timestamp', 'desc'), limit(20));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("📭 No logs found.");
            return;
        }

        console.log("\n================ SYSTEM LOGS ================\n");
        snapshot.docs.reverse().forEach(doc => {
            const data = doc.data();
            const date = data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000).toLocaleString() : 'N/A';
            const color = data.level === 'ERROR' ? '\x1b[31m' : (data.level === 'WARN' ? '\x1b[33m' : '\x1b[36m');
            const reset = '\x1b[0m';

            console.log(`${color}[${data.level}]${reset} [${date}] [${data.platform || 'Unknown'}]`);
            console.log(`Message: ${data.message}`);
            if (data.details && data.details.length > 0) {
                console.log(`Details: ${JSON.stringify(data.details)}`);
            }
            console.log("---------------------------------------------");
        });
        console.log("\n=============================================\n");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        process.exit(0);
    }
}

fetchLogs();
