import { auth } from '../config/firebase.js';

/**
 * Middleware to verify Firebase ID Token in the Authorization header.
 * Expects header: "Authorization: Bearer <token>"
 */
export const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        // Verify token with Firebase Admin
        const decodedToken = await auth.verifyIdToken(idToken);

        // Attach user info to request
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ error: 'Unauthorized: Invalid token' });
    }
};
