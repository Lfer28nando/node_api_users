//#Imports
import mongoose from 'mongoose';


//#Control Schema
const ControlSchema = new mongoose.Schema({
    //# Referencia al dispositivo asociado
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    //# Nombre del control
    name: { type: String, required: true, trim: true },
    //# Tipo de control
    type: { type: String, enum: ['switch'], default: 'switch' }, // V1.0 solo switch
    //# Tópico MQTT para comandos
    topic: { type: String, required: true, unique: true },
    //# Valor actual
    currentValue: { type: Number, enum: [0, 1], default: 0 } // 0=APAGADO, 1=ENCENDIDO
}, { timestamps: true });

export default mongoose.model('Control', ControlSchema);