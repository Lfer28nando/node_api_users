//#imports
import { Router } from 'express';
import { validateToken } from '../middlewares/validateToken.middleware.js'; 
import { validate } from '../middlewares/validator.middleware.js'; // Tu middleware de validación Zod
import { createDevice, listDevices, getDevice, updateDevice, deleteDevice } from '../controllers/iot.controller.js'; // Importa desde el controlador IoT
import { createDeviceSchema, updateDeviceSchema } from '../schemas/iot.schema.js'; 

const router = Router();

// Todas las rutas de Dispositivos requieren autenticación (validateToken)

//#ruta para crear dispositivo
router.post('/', 
    validateToken, 
    validate(createDeviceSchema), 
    createDevice
);

//#ruta para listar dispositivos del usuario
router.get('/', 
    validateToken, 
    listDevices
);

//#rutas para un dispositivo especifico
router.route('/:deviceId')
    .get(validateToken, getDevice)       // Obtener dispositivo y sus componentes
    .put(validateToken, validate(updateDeviceSchema), updateDevice) // Actualizar nombre
    .delete(validateToken, deleteDevice); // Eliminar en cascada

export default router;