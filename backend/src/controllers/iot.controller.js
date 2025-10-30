//#imports
import mongoose from 'mongoose';
import Device from '../models/device.model.js'; // Asumo que el modelo usa 'export default'
import Sensor from '../models/sensor.model.js';
import Control from '../models/control.model.js';
// import SensorData from '../models/sensorData.model.js'; // Necesario para la eliminación en cascada de datos históricos
import { AppError as CustomError } from '../utils/customError.js'; // Clase de manejo de errores
import { sendCommand as sendMqttCommand } from '../mqtt/mqtt.client.js';

/* -------------------------------------------------------------------------------------- */
/* UTILERÍAS DE PROPIEDAD Y SEGURIDAD */
/* -------------------------------------------------------------------------------------- */

//#utilidad para verificar propiedad del dispositivo
const checkDeviceOwnership = async (deviceId, userId) => {
    const device = await Device.findOne({ _id: deviceId, userId });
    if (!device) {
        // Lanza un error personalizado que tu middleware de errores podrá capturar
        throw new CustomError('Dispositivo no encontrado o no autorizado.', 404); 
    }
    return device;
};


/* -------------------------------------------------------------------------------------- */
/* GESTIÓN DE DISPOSITIVOS (CRUD COMPLETO) */
/* -------------------------------------------------------------------------------------- */

//#controlador para crear un dispositivo
export const createDevice = async (req, res, next) => {
    try {
        const { name, deviceId } = req.body;
        const userId = req.user.id; 

        //#logica de topicos mqtt
        // Tópico base: [userId]/[deviceId]
        const topicBase = `${userId}/${deviceId}`;

        const newDevice = new Device({
            userId,
            name,
            deviceId,
            status: 'offline' 
        });

        await newDevice.save();
        
        res.status(201).json({ 
            message: 'Dispositivo registrado con éxito.', 
            device: newDevice,
            baseTopic: topicBase // Útil para la configuración inicial del hardware
        });
    } catch (error) {
        //#manejo de error de duplicado (deviceId)
        if (error.code === 11000) {
            return next(new CustomError('El ID del dispositivo ya está en uso (deviceId).', 400));
        }
        next(error);
    }
};

//#controlador para listar dispositivos
export const listDevices = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const devices = await Device.find({ userId }).select('-__v'); 
        
        res.status(200).json(devices);
    } catch (error) {
        next(error);
    }
};

//#controlador para obtener un dispositivo
export const getDevice = async (req, res, next) => {
    try {
        const { deviceId } = req.params;
        const userId = req.user.id;

        const device = await checkDeviceOwnership(deviceId, userId);
        
        // Incluir sus componentes para la vista de detalle
        const sensors = await Sensor.find({ deviceId });
        const controls = await Control.find({ deviceId });

        res.status(200).json({ device, sensors, controls });
    } catch (error) {
        next(error);
    }
};

//#controlador para actualizar un dispositivo
export const updateDevice = async (req, res, next) => {
    try {
        const { deviceId } = req.params;
        const userId = req.user.id;
        const { name } = req.body; 

        const device = await checkDeviceOwnership(deviceId, userId);

        //#solo permitimos actualizar el nombre
        device.name = name;
        await device.save();

        res.status(200).json({ message: 'Dispositivo actualizado con éxito.', device });
    } catch (error) {
        next(error);
    }
};

//#controlador para eliminar un dispositivo (en cascada)
export const deleteDevice = async (req, res, next) => {
    try {
        const { deviceId } = req.params;
        const userId = req.user.id;

        const device = await checkDeviceOwnership(deviceId, userId);

        //#eliminacion en cascada (PROFESIONAL)
        await Sensor.deleteMany({ deviceId });
        await Control.deleteMany({ deviceId });
        // await SensorData.deleteMany({ deviceId }); // Eliminar los datos históricos
        
        await device.deleteOne(); 

        res.status(200).json({ message: 'Dispositivo y todos sus componentes eliminados con éxito.' });
    } catch (error) {
        next(error);
    }
};


/* -------------------------------------------------------------------------------------- */
/* GESTIÓN DE SENSORES (CRUD COMPLETO) */
/* -------------------------------------------------------------------------------------- */

//#controlador para crear sensor
export const createSensor = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, unit, deviceId, color } = req.body;
        
        const device = await checkDeviceOwnership(deviceId, userId);

        //#generacion de topico mqtt de sensor
        // Tópico sugerido: data/[deviceId]/[unidad_sensor]/[id_corto_mongo]
        const sensorIdShort = new mongoose.Types.ObjectId().toHexString().slice(-6);
        const topic = `data/${device.deviceId}/${unit.toLowerCase()}/${sensorIdShort}`;
        
        const newSensor = new Sensor({
            deviceId,
            name,
            unit,
            color,
            topic
        });

        await newSensor.save();
        res.status(201).json({ message: 'Sensor creado con éxito.', sensor: newSensor });
    } catch (error) {
        if (error.code === 11000) {
            return next(new CustomError('Ya existe un componente con un tópico similar. Intente de nuevo.', 400));
        }
        next(error);
    }
};

//#controlador para obtener un sensor
export const getSensor = async (req, res, next) => {
    try {
        const { sensorId } = req.params;

        const sensor = await Sensor.findById(sensorId).populate({
            path: 'deviceId', 
            select: 'userId name deviceId' // Obtenemos el dueño y el deviceId para el contexto
        });
        
        if (!sensor) {
            return next(new CustomError('Sensor no encontrado.', 404));
        }
        
        //#verificacion de autorizacion
        if (sensor.deviceId.userId.toString() !== req.user.id) {
            return next(new CustomError('No autorizado para ver este recurso.', 403));
        }

        res.status(200).json(sensor);
    } catch (error) {
        next(error);
    }
};

//#controlador para actualizar un sensor
export const updateSensor = async (req, res, next) => {
    try {
        const { sensorId } = req.params;
        const updates = req.body;

        const sensor = await Sensor.findById(sensorId).populate({ path: 'deviceId', select: 'userId' });
        
        if (!sensor || sensor.deviceId.userId.toString() !== req.user.id) {
            return next(new CustomError('Sensor no encontrado o no autorizado.', 404));
        }

        //#aplicar actualizaciones (Mongoose valida automáticamente con el esquema)
        sensor.set(updates); 
        await sensor.save();

        res.status(200).json({ message: 'Sensor actualizado con éxito.', sensor });

    } catch (error) {
        next(error);
    }
};

//#controlador para eliminar un sensor (en cascada)
export const deleteSensor = async (req, res, next) => {
    try {
        const { sensorId } = req.params;

        const sensor = await Sensor.findById(sensorId).populate({ path: 'deviceId', select: 'userId' });

        if (!sensor || sensor.deviceId.userId.toString() !== req.user.id) {
            return next(new CustomError('Sensor no encontrado o no autorizado.', 404));
        }

        //#eliminacion en cascada
        // await SensorData.deleteMany({ sensorId: sensor._id }); // Eliminar los datos históricos
        
        await sensor.deleteOne();
        res.status(200).json({ message: 'Sensor y sus datos históricos eliminados con éxito.' });
    } catch (error) {
        next(error);
    }
};


/* -------------------------------------------------------------------------------------- */
/* GESTIÓN DE CONTROLES (CRUD COMPLETO Y COMANDO) */
/* -------------------------------------------------------------------------------------- */

//#controlador para crear control
export const createControl = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, deviceId, type } = req.body;
        
        const device = await checkDeviceOwnership(deviceId, userId);

        //#generacion de topico mqtt de comando
        const controlIdShort = new mongoose.Types.ObjectId().toHexString().slice(-6);
        // Tópico sugerido: cmd/[deviceId]/[tipo_control]/[id_corto_mongo]
        const topic = `cmd/${device.deviceId}/${type}/${controlIdShort}`; 

        const newControl = new Control({
            deviceId,
            name,
            type,
            topic,
            currentValue: 0 // Inicia apagado
        });

        await newControl.save();
        res.status(201).json({ message: 'Control creado con éxito.', control: newControl });
    } catch (error) {
        if (error.code === 11000) {
            return next(new CustomError('Ya existe un componente con un tópico similar. Intente de nuevo.', 400));
        }
        next(error);
    }
};

//#controlador para obtener un control
export const getControl = async (req, res, next) => {
    try {
        const { controlId } = req.params;

        const control = await Control.findById(controlId).populate({
            path: 'deviceId', 
            select: 'userId name deviceId'
        });
        
        if (!control) {
            return next(new CustomError('Control no encontrado.', 404));
        }
        
        //#verificacion de autorizacion
        if (control.deviceId.userId.toString() !== req.user.id) {
            return next(new CustomError('No autorizado para ver este recurso.', 403));
        }

        res.status(200).json(control);
    } catch (error) {
        next(error);
    }
};

//#controlador para actualizar un control
export const updateControl = async (req, res, next) => {
    try {
        const { controlId } = req.params;
        const updates = req.body;

        const control = await Control.findById(controlId).populate({ path: 'deviceId', select: 'userId' });
        
        if (!control || control.deviceId.userId.toString() !== req.user.id) {
            return next(new CustomError('Control no encontrado o no autorizado.', 404));
        }

        control.set(updates); // Solo name y type
        await control.save();

        res.status(200).json({ message: 'Control actualizado con éxito.', control });
    } catch (error) {
        next(error);
    }
};

//#controlador para eliminar un control
export const deleteControl = async (req, res, next) => {
    try {
        const { controlId } = req.params;

        const control = await Control.findById(controlId).populate({ path: 'deviceId', select: 'userId' });

        if (!control || control.deviceId.userId.toString() !== req.user.id) {
            return next(new CustomError('Control no encontrado o no autorizado.', 404));
        }
        
        await control.deleteOne();
        res.status(200).json({ message: 'Control eliminado con éxito.' });
    } catch (error) {
        next(error);
    }
};



//#controlador para enviar comando a control (publicador MQTT real)
export const sendCommand = async (req, res, next) => {
    try {
        const { controlId } = req.params;
        const { value } = req.body; // Valor: 0 o 1

        const control = await Control.findById(controlId).populate('deviceId');
        if (!control || control.deviceId.userId.toString() !== req.user.id) {
            return next(new CustomError('Control no encontrado o no autorizado.', 404));
        }

        const deviceId = control.deviceId._id.toString();

        // 1. PUBLICAR el mensaje en el Broker MQTT
        const published = await sendMqttCommand(deviceId, controlId, value);
        if (!published) {
            return res.status(500).json({
                message: 'No se pudo enviar el comando al dispositivo vía MQTT.',
                topic: control.topic
            });
        }

        // 2. ACTUALIZAR el estado en la base de datos
        control.currentValue = value;
        await control.save();

        res.status(200).json({
            message: `Comando '${value}' enviado a ${control.name}.`,
            topic: control.topic
        });
    } catch (error) {
        next(error);
    }
};