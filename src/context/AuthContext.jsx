import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCredential,
    signInWithCustomToken
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { NativeBiometric } from 'capacitor-native-biometric';

import Logger from '../utils/Logger';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    async function googleLogin() {
        try {
            if (Capacitor.isNativePlatform()) {
                // Native Flow
                const result = await FirebaseAuthentication.signInWithGoogle();
                const credential = GoogleAuthProvider.credential(result.credential?.idToken);
                return signInWithCredential(auth, credential);
            } else {
                // Web Flow
                const provider = new GoogleAuthProvider();
                return signInWithPopup(auth, provider);
            }
        } catch (error) {
            Logger.error("Google Login Error:", error);
            throw error;
        }
    }

    // ============================================
    // SISTEMA ANTIGUO - NativeBiometric (deprecated)
    // Mantener por compatibilidad durante migración
    // ============================================
    async function checkBiometrics() {
        try {
            const result = await NativeBiometric.isAvailable();
            return result.isAvailable;
        } catch (error) {
            Logger.warn("Biometrics not available:", error);
            return false;
        }
    }

    async function registerBiometrics(email, password) {
        try {
            const isAvailable = await checkBiometrics();
            if (!isAvailable) throw new Error("Biometrics not available");

            await NativeBiometric.setCredentials({
                username: email,
                password: password,
                server: "com.sauldev.freecooking",
            });
            return true;
        } catch (error) {
            Logger.error("Error registering biometrics:", error);
            throw error;
        }
    }

    async function loginWithBiometrics() {
        try {
            const isAvailable = await checkBiometrics();
            if (!isAvailable) throw new Error("Biometrics not available");

            const verified = await NativeBiometric.verifyIdentity({
                reason: "Log in with your biometrics",
                title: "Log in",
                subtitle: "Use your fingerprint or face to log in",
                description: " "
            });

            if (verified) {
                const credentials = await NativeBiometric.getCredentials({
                    server: "com.sauldev.freecooking",
                });

                if (credentials && credentials.username && credentials.password) {
                    return login(credentials.username, credentials.password);
                } else {
                    throw new Error("No credentials stored");
                }
            }
            return false;
        } catch (error) {
            Logger.error("Biometric Login Error:", error);
            throw error;
        }
    }



    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout,
        googleLogin,
        // Sistema antiguo (deprecated, solo para Capacitor)
        checkBiometrics,
        loginWithBiometrics,
        registerBiometrics,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
