//#Imports
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/user.routes.js';
import googleAuthRoutes from './routes/googleAuth.routes.js';
import { convertToAppError } from './utils/customError.js';

//#Config dotenv
dotenv.config({ path: './src/.env' });




const app = express();

//#Middlewares
//#handler global de errores
app.use((err, req, res, next) => {
    const appErr = convertToAppError(err);
    res.status(appErr.httpStatus || 500).json({
        success: false,
        code: appErr.code,
        message: appErr.userMessage,
        devMessage: appErr.devMessage,
        additionalInfo: appErr.additionalInfo || {},
        timestamp: appErr.timestamp
    });
});
app.use(cookieParser());
app.use(express.json());

//#MongoDB Connection
connectDB();

//#Routes
app.get('/', (req, res) => {
    res.send('API de Plataforma IoT en funcionamiento...');
});
// Rutas de autenticación
app.use("/api/auth", authRoutes);      // Rutas tradicionales (register, login, etc.)
app.use("/auth", googleAuthRoutes);    // Rutas de Google OAuth (/auth/google, /auth/google/callback, etc.)

// Export app
export default app;