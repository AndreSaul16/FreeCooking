import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    NONE: 4
};

// Configuración actual (puedes cambiar esto dinámicamente o por variables de entorno)
const CURRENT_LEVEL = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

// Helper to sanitize sensitive data
const sanitize = (args) => {
    return args.map(arg => {
        if (typeof arg === 'object' && arg !== null) {
            const str = JSON.stringify(arg);
            // Redact potential passwords or tokens
            if (str.match(/password|token|credential|secret/i)) {
                return '[REDACTED_SENSITIVE_DATA]';
            }
            return arg;
        }
        return arg;
    });
};

const logToFirestore = async (level, message, args) => {
    try {
        // Only log WARN and ERROR to Firestore to save writes, 
        // or INFO if it's a critical action (you can adjust this)
        if (level < LOG_LEVELS.WARN) return;

        const sanitizedArgs = sanitize(args);
        const logEntry = {
            level: Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key] === level),
            message: message,
            details: sanitizedArgs,
            timestamp: serverTimestamp(),
            platform: Capacitor.getPlatform(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            // We can't easily get user ID here without circular dependency 
            // so we'll rely on the context passing it or just anonymous logs for now.
            // Ideally, pass userId as an argument if available.
        };

        await addDoc(collection(db, 'system_logs'), logEntry);
    } catch (e) {
        // Fallback to console if Firestore fails
        console.error('Failed to send log to Firestore:', e);
    }
};

// Helper para enviar logs al backend
const sendToBackend = async (levelName, message, details) => {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (!backendUrl) return;

        // Evitar bucles infinitos si el error viene de axios
        if (message && message.includes && message.includes('/logs/client')) return;

        // Usar fetch nativo para no depender de axios (circular dependency risk)
        await fetch(`${backendUrl}/logs/client`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                level: levelName.toLowerCase(),
                message: message,
                context: {
                    platform: Capacitor.getPlatform(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    details: details
                }
            })
        });
    } catch (e) {
        // Silenciosamente fallar para no spammear la consola del navegador
        // console.error('Failed to send log to backend', e); 
    }
};

const Logger = {
    debug: (message, ...args) => {
        if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
            console.log(`%c🐛 [DEBUG] ${message}`, 'color: #9ca3af', ...args);
        }
    },
    info: (message, ...args) => {
        if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
            console.log(`%cℹ️ [INFO] ${message}`, 'color: #3b82f6', ...args);
            const sanitizedArgs = sanitize(args);
            sendToBackend('info', message, sanitizedArgs);
        }
    },
    warn: (message, ...args) => {
        if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
            console.warn(`%c⚠️ [WARN] ${message}`, 'color: #eab308', ...args);
            const sanitizedArgs = sanitize(args);
            logToFirestore(LOG_LEVELS.WARN, message, args);
            sendToBackend('warn', message, sanitizedArgs);
        }
    },
    error: (message, ...args) => {
        if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
            console.error(`%c❌ [ERROR] ${message}`, 'color: #ef4444', ...args);
            const sanitizedArgs = sanitize(args);
            logToFirestore(LOG_LEVELS.ERROR, message, args);
            sendToBackend('error', message, sanitizedArgs);
        }
    },
    success: (message, ...args) => {
        if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
            console.log(`%c✅ [SUCCESS] ${message}`, 'color: #22c55e', ...args);
        }
    }
};

export default Logger;
