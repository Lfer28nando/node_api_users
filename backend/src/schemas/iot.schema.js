//#imports
import { z } from 'zod';

// Esquema base para validar ObjectIds de MongoDB (24 caracteres hexadecimales)
// NOTA: La existencia y unicidad del ID debe validarse en la lógica de negocio o en la base de datos.
const mongoIdSchema = z.string()
    .length(24, { message: 'ID de MongoDB inválido. Debe tener 24 caracteres.' })
    .regex(/^[0-9a-fA-F]{24}$/, { message: 'El ID debe ser un valor hexadecimal válido.' });


// ----------------------------------------------------
// 1. ESQUEMAS PARA DISPOSITIVOS (DEVICES)
// ----------------------------------------------------

//#esquema para la creacion de dispositivo
export const createDeviceSchema = z.object({
    name: z.string({
        required_error: "El nombre del dispositivo es requerido."
    })
        //#validaciones para el nombre del dispositivo
        .min(3, 'El nombre debe tener al menos 3 caracteres.')
        .max(50, 'El nombre no puede exceder los 50 caracteres.'),
    
    deviceId: z.string({
        required_error: "El ID único del dispositivo es requerido."
    })
        //#validaciones para el deviceId
        .min(5, 'El ID del dispositivo debe tener al menos 5 caracteres.')
        .max(30, 'El ID no puede exceder los 30 caracteres.')
        .regex(/^[a-zA-Z0-9_-]+$/, { message: 'El ID solo puede contener letras, números, guiones (-) y guiones bajos (_).' }),
});

//#esquema para la actualizacion de dispositivo
export const updateDeviceSchema = z.object({
    name: z.string()
        //#validaciones para la actualizacion del nombre
        .min(3, 'El nombre debe tener al menos 3 caracteres.')
        .max(50, 'El nombre no puede exceder los 50 caracteres.')
        .optional(),
});


// ----------------------------------------------------
// 2. ESQUEMAS PARA SENSORES (SENSORS)
// ----------------------------------------------------

//#esquema para la creacion de sensor
export const createSensorSchema = z.object({
    deviceId: mongoIdSchema, // La existencia y unicidad se valida en la lógica de negocio

    name: z.string()
        //#validaciones para el nombre del sensor
        .min(3, 'El nombre debe tener al menos 3 caracteres.'),
    
    unit: z.string()
        //#validaciones para la unidad de medida
        .min(1, 'La unidad de medida es requerida (ej: C, %, Lux).'),
    
    color: z.string()
        //#validaciones para el codigo de color
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Formato de color hexadecimal inválido (ej: #FF0000).' })
        .optional(),
});

//#esquema para la actualizacion de sensor
export const updateSensorSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.').optional(),
    unit: z.string().min(1, 'La unidad de medida es requerida.').optional(),
    color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'Formato de color hexadecimal inválido.' }).optional(),
});


// ----------------------------------------------------
// 3. ESQUEMAS PARA CONTROLES (CONTROLS)
// ----------------------------------------------------

//#esquema para la creacion de control
export const createControlSchema = z.object({
    deviceId: mongoIdSchema, // La existencia y unicidad se valida en la lógica de negocio
    
    name: z.string()
        //#validaciones para el nombre del control
        .min(3, 'El nombre debe tener al menos 3 caracteres.'),
    
    type: z.enum(['switch'], {
        //#validaciones para el tipo de control (solo switch en V1.0)
        required_error: "El tipo de control es requerido.",
        invalid_type_error: "El tipo de control debe ser 'switch'."
    }),
});

//#esquema para la actualizacion de control
export const updateControlSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.').optional(),
    type: z.enum(['switch'], {
        invalid_type_error: "El tipo de control debe ser 'switch'."
    }).optional(),
});

//#esquema para el envio de comando (ej: desde un botón)
export const sendCommandSchema = z.object({
    value: z.number({ required_error: "El valor de comando (0 o 1) es requerido." })
        //#validaciones para el valor binario
        .min(0, 'El valor mínimo es 0.')
        .max(1, 'El valor máximo es 1.')
        .int('El valor debe ser un número entero (0 o 1).')
});