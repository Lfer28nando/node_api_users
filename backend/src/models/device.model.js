//#Imports
import mongoose from 'mongoose';
//#Schema del modelo Device
const DeviceSchema = new mongoose.Schema({
    //#Referencia al usuario propietario del dispositivo
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Referencia al modelo User (ya implementado)
        required: true
    },
    //#Nombre del dispositivo
    name: {
        type: String,
        required: true,
        trim: true
    },
    //#Tipo de dispositivo: 'sensor', 'actuator', 'controller'
    deviceId: { // Identificador único para el firmware
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    //#
    status: { // Estado de conexión: 'online', 'offline'
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    }
}, { timestamps: true });

export default mongoose.model('Device', DeviceSchema);