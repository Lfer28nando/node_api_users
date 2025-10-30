//#Imports
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { connectMqtt } from './mqtt/mqtt.client.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/user.routes.js';
import googleAuthRoutes from './routes/googleAuth.routes.js';
import { convertToAppError } from './utils/customError.js';
import iotRoutes from './routes/iot.routes.js';
import deviceRoutes from './routes/device.routes.js';

//#Config dotenv
dotenv.config({ path: './src/.env' });


const app = express();

//#Middlewares
app.use(cookieParser());
app.use(express.json());


//#MongoDB Connection
connectDB();

//#MQTT Connection
connectMqtt();

//#Routes
app.get('/', (req, res) => {
    res.send('API de Plataforma IoT en funcionamiento...');
});
// Rutas de autenticación
app.use("/api/auth", authRoutes);      // Rutas tradicionales (register, login, etc.)
app.use("/auth", googleAuthRoutes);    // Rutas de Google OAuth (/auth/google, /auth/google/callback, etc.)

//#rutas de iot, datos, etc. se agregarán aquí más adelante
app.use("/api/iot", iotRoutes);
app.use("/api/devices", deviceRoutes);

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

// Export app
export default app;