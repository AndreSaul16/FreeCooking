/**
 * Helpers para manejar conversiones de datos en WebAuthn
 * WebAuthn necesita ArrayBuffers/Uint8Array pero el backend envia Base64URL
 */

/**
 * Convierte una cadena Base64URL a Uint8Array
 */
export function base64URLToUint8Array(base64URL) {
    // Convertir Base64URL a Base64 normal
    const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');

    // Decodificar
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

/**
 * Convierte Uint8Array/ArrayBuffer a Base64URL
 */
export function uint8ArrayToBase64URL(uint8Array) {
    // Convertir a string binario
    let binary = '';
    const bytes = new Uint8Array(uint8Array);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    // Convertir a Base64 y luego a Base64URL
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Prepara las opciones del backend para navigator.credentials.create()
 * Convierte strings Base64URL a Uint8Array donde sea necesario
 */
export function prepareRegistrationOptions(options) {
    return {
        ...options,
        challenge: base64URLToUint8Array(options.challenge),
        user: {
            ...options.user,
            id: base64URLToUint8Array(options.user.id),
        },
        excludeCredentials: options.excludeCredentials?.map(cred => ({
            ...cred,
            id: base64URLToUint8Array(cred.id),
        })) || [],
    };
}

/**
 * Prepara las opciones del backend para navigator.credentials.get()
 * Convierte strings Base64URL a Uint8Array donde sea necesario
 */
export function prepareAuthenticationOptions(options) {
    return {
        ...options,
        challenge: base64URLToUint8Array(options.challenge),
        allowCredentials: options.allowCredentials?.map(cred => ({
            ...cred,
            id: base64URLToUint8Array(cred.id),
        })) || [],
    };
}

/**
 * Convierte la respuesta de navigator.credentials.create() a formato JSON
 * para enviar al backend
 */
export function credentialToJSON(credential) {
    return {
        id: credential.id,
        rawId: uint8ArrayToBase64URL(credential.rawId),
        type: credential.type,
        response: {
            clientDataJSON: uint8ArrayToBase64URL(credential.response.clientDataJSON),
            attestationObject: uint8ArrayToBase64URL(credential.response.attestationObject),
            transports: credential.response.getTransports?.() || [],
        },
    };
}

/**
 * Convierte la respuesta de navigator.credentials.get() a formato JSON
 * para enviar al backend (login)
 */
export function assertionToJSON(assertion) {
    return {
        id: assertion.id,
        rawId: uint8ArrayToBase64URL(assertion.rawId),
        type: assertion.type,
        response: {
            clientDataJSON: uint8ArrayToBase64URL(assertion.response.clientDataJSON),
            authenticatorData: uint8ArrayToBase64URL(assertion.response.authenticatorData),
            signature: uint8ArrayToBase64URL(assertion.response.signature),
            userHandle: assertion.response.userHandle ?
                uint8ArrayToBase64URL(assertion.response.userHandle) : null,
        },
    };
}

/**
 * Verifica si WebAuthn esta disponible en el navegador/dispositivo
 */
export function isWebAuthnAvailable() {
    return window?.PublicKeyCredential !== undefined &&
        navigator?.credentials?.create !== undefined;
}

/**
 * Verifica si el dispositivo tiene autenticador de plataforma (TouchID, FaceID, Windows Hello)
 */
export async function isPlatformAuthenticatorAvailable() {
    if (!isWebAuthnAvailable()) return false;

    try {
        return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
        console.error('Error checking platform authenticator:', error);
        return false;
    }
}
