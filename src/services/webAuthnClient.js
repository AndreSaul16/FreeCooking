/**
 * Cliente WebAuthn para el frontend
 * Maneja la comunicacion con el backend y el navegador para autenticacion con passkeys
 */

import * as backendApi from './backendApi.js';
import {
    prepareRegistrationOptions,
    prepareAuthenticationOptions,
    credentialToJSON,
    assertionToJSON,
    isWebAuthnAvailable,
    isPlatformAuthenticatorAvailable,
} from '../utils/webAuthnHelpers.js';
import Logger from '../utils/Logger.js';

/**
 * Verifica si WebAuthn esta disponible
 */
export async function checkWebAuthnAvailability() {
    const available = isWebAuthnAvailable();
    const platformAvailable = await isPlatformAuthenticatorAvailable();

    return {
        isAvailable: available,
        hasPlatformAuthenticator: platformAvailable,
    };
}

/**
 * Registra un nuevo passkey para el usuario actual
 * El usuario debe estar autenticado en Firebase antes de llamar esto
 */
export async function registerPasskey() {
    try {
        // Verificar disponibilidad
        if (!isWebAuthnAvailable()) {
            throw new Error('WebAuthn no está disponible en este dispositivo');
        }

        Logger.info('🔐 Iniciando registro de passkey...');

        // 1. Obtener opciones del backend (challenge)
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        Logger.info(`🔐 Solicitando challenge a: ${backendUrl}/auth/register-challenge`);
        const options = await backendApi.registerBiometrics();
        Logger.info('✅ Challenge recibido', { challengeLength: options.challenge?.length });

        // 2. Preparar opciones para el navegador
        const publicKeyOptions = prepareRegistrationOptions(options);

        // 3. Llamar a la API del navegador para crear credencial
        Logger.info('📱 Solicitando autenticador al sistema operativo...');
        Logger.info('📋 Opciones enviadas al navegador:', {
            rp: publicKeyOptions.rp,
            user: publicKeyOptions.user.name,
            pubKeyCredParams: publicKeyOptions.pubKeyCredParams
        });

        const credential = await navigator.credentials.create({
            publicKey: publicKeyOptions,
        });

        if (!credential) {
            Logger.error('❌ navigator.credentials.create devolvió null');
            throw new Error('No se pudo crear la credencial');
        }

        Logger.info('✅ Credencial creada localmente');

        // 4. Convertir a JSON y enviar al backend
        const credentialJSON = credentialToJSON(credential);
        const result = await backendApi.verifyRegistration(credentialJSON);

        Logger.info('✅ Passkey registrado exitosamente');
        return result;

    } catch (error) {
        Logger.error('❌ Error registrando passkey:', error);

        // Errores comunes de WebAuthn
        if (error.name === 'NotAllowedError') {
            throw new Error('Operación cancelada o tiempo expirado');
        } else if (error.name === 'InvalidStateError') {
            throw new Error('Ya existe una credencial para este dispositivo');
        } else if (error.name === 'NotSupportedError') {
            throw new Error('Este dispositivo no soporta passkeys');
        }

        throw error;
    }
}

/**
 * Inicia sesion usando passkey
 * @param {string} email - Email del usuario
 * @returns {Promise<string>} Custom token de Firebase
 */
export async function loginWithPasskey(email) {
    try {
        // Verificar disponibilidad
        if (!isWebAuthnAvailable()) {
            throw new Error('WebAuthn no está disponible en este dispositivo');
        }

        Logger.info('🔐 Iniciando login con passkey...');

        // 1. Obtener opciones del backend (challenge + credenciales permitidas)
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        Logger.info(`🔐 Solicitando login challenge a: ${backendUrl}/auth/login-challenge`, { email });

        const { options, userId } = await backendApi.loginBiometricsChallenge(email);
        Logger.info('✅ Login challenge recibido', {
            credentialsCount: options.allowCredentials?.length,
            rpId: options.rpId
        });

        // 2. Preparar opciones para el navegador
        const publicKeyOptions = prepareAuthenticationOptions(options);

        // 3. Llamar a la API del navegador para obtener assertion
        Logger.info('📱 Solicitando autenticación al usuario...');
        const assertion = await navigator.credentials.get({
            publicKey: publicKeyOptions,
        });

        if (!assertion) {
            Logger.error('❌ navigator.credentials.get devolvió null');
            throw new Error('No se pudo verificar la identidad');
        }

        Logger.info('✅ Autenticación local exitosa');

        // 4. Convertir a JSON y verificar con backend
        const assertionJSON = assertionToJSON(assertion);
        const customToken = await backendApi.verifyLogin(userId, assertionJSON);

        Logger.info('✅ Login verificado, token recibido');
        return customToken;

    } catch (error) {
        Logger.error('❌ Error en login con passkey:', error);

        // Errores comunes de WebAuthn
        if (error.name === 'NotAllowedError') {
            throw new Error('Operación cancelada o tiempo expirado');
        } else if (error.name === 'NotFoundError') {
            throw new Error('No se encontró ningún passkey para este usuario');
        }

        throw error;
    }
}

/**
 * Verifica si el usuario tiene passkeys registrados
 * (Esto requeriria un endpoint adicional en el backend)
 * Por ahora, solo verifica disponibilidad del dispositivo
 */
export async function hasPasskeys() {
    const { hasPlatformAuthenticator } = await checkWebAuthnAvailability();
    return hasPlatformAuthenticator;
}
