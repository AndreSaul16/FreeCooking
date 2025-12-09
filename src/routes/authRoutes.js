import express from 'express';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Registration Routes (Protected: User must be logged in via Firebase)
router.post('/register-challenge', verifyFirebaseToken, authController.registerChallenge);
router.post('/register-verify', verifyFirebaseToken, authController.registerVerify);

// Login Routes (Public: User sends email to start)
router.post('/login-challenge', authController.loginChallenge);
router.post('/login-verify', authController.loginVerify);

export default router;
