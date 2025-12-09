import axios from 'axios';
import { auth } from './firebase'; // To get ID Token

// Use localhost for dev, but for Android Emulator use 10.0.2.2 or your machine IP
// TODO: User needs to update this for real device (e.g. computer IP)
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Firebase ID Token to every request
api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- API Methods ---

// 1. Register Biometrics
export const registerBiometrics = async (userId) => {
    // 1. Get Challenge
    const { data: options } = await api.post('/auth/register-challenge');

    // 2. Sign with WebAuthn (Passed from component)
    return options; // Component will handle the signing
};

export const verifyRegistration = async (response) => {
    const { data } = await api.post('/auth/register-verify', response);
    return data;
};

// 2. Login Biometrics
export const loginBiometricsChallenge = async (email) => {
    const { data } = await api.post('/auth/login-challenge', { email });
    return data;
};

export const verifyLogin = async (userId, response) => {
    const { data } = await api.post('/auth/login-verify', { userId, response });
    return data.token; // Custom Token
};

export default api;
