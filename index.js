import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import { verifyFirebaseToken } from './src/middleware/authMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Configures Firebase via imports
import './src/config/firebase.js';

// Health Check
app.get('/', (req, res) => {
    res.send('FreeCooking Backend is Living! 👨‍🍳');
});

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
