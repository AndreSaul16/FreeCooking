import * as webAuthnService from '../services/webAuthnService.js';

export const registerChallenge = async (req, res) => {
    try {
        const { uid, email } = req.user; // From verifyFirebaseToken middleware
        const options = await webAuthnService.getRegistrationOptions(uid, email);
        res.json(options);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const registerVerify = async (req, res) => {
    try {
        const { uid } = req.user;
        const verified = await webAuthnService.verifyRegistration(uid, req.body);
        if (verified) {
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, error: 'Verification failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Login Logic
export const loginChallenge = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });

        const { options, userId } = await webAuthnService.getLoginOptions(email);

        // We return userId simply to help client track context, or session cookie
        res.json({ options, userId });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

export const loginVerify = async (req, res) => {
    try {
        const { userId, response } = req.body; // Client sends back userId context + WebAuthn response
        const token = await webAuthnService.verifyLogin(userId, response);

        if (token) {
            res.json({ success: true, token });
        } else {
            res.status(400).json({ success: false, error: 'Verification failed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
