//#Imports
import mongoose from 'mongoose';

//#Schema de Sensor
const SensorSchema = new mongoose.Schema({
    //#Referencia al dispositivo al que pertenece el sensor
    deviceId: {
        type: mongoose.Schema.Types.ObjectId, // Referencia al dispositivo
        ref: 'Device', // Modelo referenciado
        required: true // Obligatorio
    },
    //#Nombre del sensor
    name: { type: String, required: true, trim: true }, // Ej: 'Temperatura', 'Humedad'
    unit: { type: String, required: true }, // Ej: 'C', '%', 'V'
    topic: { type: String, required: true, unique: true }, // Tópico MQTT para publicación de datos
    // Para V1.0, solo se implementará el color. Los límites son para V2.0
    color: { type: String, default: '#007bff' } // Color para el widget en el frontend
}, { timestamps: true });

export default mongoose.model('Sensor', SensorSchema);