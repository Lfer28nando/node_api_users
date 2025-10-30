//#imports
import { Router } from 'express';
import { validateToken } from '../middlewares/validateToken.middleware.js';
import { validate } from '../middlewares/validator.middleware.js'; // Tu middleware de validación Zod
import { 
    // Sensores
    createSensor, getSensor, updateSensor, deleteSensor, 
    // Controles
    createControl, getControl, updateControl, deleteControl, sendCommand 
} from '../controllers/iot.controller.js';
import { 
    createSensorSchema, updateSensorSchema, 
    createControlSchema, updateControlSchema, 
    sendCommandSchema 
} from '../schemas/iot.schema.js';

const router = Router();
// Estas rutas requieren autenticación (validateToken)

// ----------------------------------------------------
// GESTIÓN DE SENSORES
// ----------------------------------------------------

//#ruta para crear sensor
router.post('/sensors', 
    validateToken, 
    validate(createSensorSchema), 
    createSensor
);

//#rutas para un sensor especifico
router.route('/sensors/:sensorId')
    .get(validateToken, getSensor)
    .put(validateToken, validate(updateSensorSchema), updateSensor)
    .delete(validateToken, deleteSensor);

// ----------------------------------------------------
// GESTIÓN DE CONTROLES
// ----------------------------------------------------

//#ruta para crear control
router.post('/controls', 
    validateToken, 
    validate(createControlSchema), 
    createControl
);

//#rutas para un control especifico
router.route('/controls/:controlId')
    .get(validateToken, getControl)
    .put(validateToken, validate(updateControlSchema), updateControl)
    .delete(validateToken, deleteControl);

//#ruta para enviar un comando (Acción de control)
router.post('/controls/:controlId/command', 
    validateToken, 
    validate(sendCommandSchema), 
    sendCommand
);

export default router;