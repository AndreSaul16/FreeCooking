import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { db, auth } from '../config/firebase.js'; // Import auth for custom token


// Configuration
// TODO: Move RP_ID to environment variable for Production
const rpID = 'localhost'; // Valid for Android Emulator (10.0.2.2 -> localhost)
const expectedOrigin = ['http://localhost', 'android:apk-key-hash:HASH']; // We will need the Android Hash later

/**
 * Generate Registration Options
 */
export const getRegistrationOptions = async (userId, userEmail) => {
    // Check if user already has credentials to prevent duplicates (optional)
    const userCreds = await getUserCredentials(userId);

    const options = await generateRegistrationOptions({
        rpName: 'FreeCooking',
        rpID,
        userID: userId,
        userName: userEmail,
        attestationType: 'none', // Simple for now
        excludeCredentials: userCreds.map(cred => ({
            id: cred.id,
            transports: cred.transports,
        })),
        authenticatorSelection: {
            residentKey: 'preferred',
            userVerification: 'preferred',
            authenticatorAttachment: 'platform', // Force TouchID/FaceID
        },
    });

    // Save challenge to DB to verify later
    await db.collection('users').doc(userId).update({
        currentChallenge: options.challenge
    });

    return options;
};

/**
 * Verify Registration Response
 */
export const verifyRegistration = async (userId, body) => {
    const userDoc = await db.collection('users').doc(userId).get();
    const currentChallenge = userDoc.data()?.currentChallenge;

    if (!currentChallenge) throw new Error('No challenge found for user');

    const verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: currentChallenge,
        expectedOrigin, // We might need to relax this for capacitor // TODO: Check Capacitor Origin
        expectedRPID: rpID,
        requireUserVerification: true,
    });

    if (verification.verified && verification.registrationInfo) {
        const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;

        // Save new credential
        await db.collection('users').doc(userId).collection('credentials').add({
            id: Buffer.from(credentialID).toString('base64url'),
            publicKey: Buffer.from(credentialPublicKey).toString('base64url'),
            counter,
            transports: body.response.transports || [],
            created: new Date()
        });

        // Clear challenge
        await db.collection('users').doc(userId).update({ currentChallenge: null });

        return true;
    }
    return false;
};


/**
 * Generate Login Options
 */
export const getLoginOptions = async (email) => {
    // 1. Find user by email
    let userRecord;
    try {
        userRecord = await auth.getUserByEmail(email);
    } catch (e) {
        throw new Error('User not found'); // Don't reveal too much in prod
    }

    const userId = userRecord.uid;
    const userCreds = await getUserCredentials(userId);

    if (userCreds.length === 0) {
        throw new Error('No passkeys registered for this user');
    }

    const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: userCreds.map(cred => ({
            id: cred.id,
            transports: cred.transports,
        })),
        userVerification: 'preferred',
    });

    // Save challenge
    await db.collection('users').doc(userId).update({
        currentChallenge: options.challenge
    });

    return { options, userId }; // Return userId so controller knows who is trying to login
};

/**
 * Verify Login Response & Mint Token
 */
export const verifyLogin = async (userId, body) => {
    const userDoc = await db.collection('users').doc(userId).get();
    const currentChallenge = userDoc.data()?.currentChallenge;
    const userCreds = await getUserCredentials(userId);

    if (!currentChallenge) throw new Error('No challenge found');

    // Find the credential used
    const credId = body.id;
    const credential = userCreds.find(c => Buffer.from(c.id).toString('base64url') === credId || c.id.toString('base64url') === credId);
    // Note: checking match logic depending on how getUserCredentials returns Buffer vs String

    if (!credential) throw new Error('Credential not found');

    // Retrieve full credential data including public key from DB
    // Optimization: getUserCredentials could return full object
    const credDocSnapshot = await db.collection('users').doc(userId).collection('credentials').get();
    const matchDoc = credDocSnapshot.docs.find(d => Buffer.from(d.data().id, 'base64url').toString('base64url') === credId);

    if (!matchDoc) throw new Error('Credential DB mismatch');

    const storedPublicKey = Buffer.from(matchDoc.data().publicKey, 'base64url');

    const verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: currentChallenge,
        expectedOrigin,
        expectedRPID: rpID,
        authenticator: {
            credentialID: credential.id,
            credentialPublicKey: storedPublicKey,
            counter: matchDoc.data().counter,
            transports: credential.transports,
        },
        requireUserVerification: true,
    });

    if (verification.verified) {
        const { authenticationInfo } = verification;

        // Update counter
        await matchDoc.ref.update({
            counter: authenticationInfo.newCounter
        });

        // Clear challenge
        await db.collection('users').doc(userId).update({ currentChallenge: null });

        // Mint Custom Token
        const token = await auth.createCustomToken(userId);
        return token;
    }

    return null;
};

// Helper: Get existing credentials for user
const getUserCredentials = async (userId) => {
    const snapshot = await db.collection('users').doc(userId).collection('credentials').get();
    return snapshot.docs.map(doc => ({
        id: Buffer.from(doc.data().id, 'base64url'), // Return as buffer for library
        transports: doc.data().transports,
    }));
};
