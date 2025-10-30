import supertest from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js'; // ✔️ Importa la lógica de la app
// Asegúrate de que tus modelos estén en estas rutas
import User from '../src/models/user.model.js'; // ✔️ RUTA CORREGIDA
import Device from '../src/models/device.model.js'; // ✔️ RUTA CORREGIDA
import Sensor from '../src/models/sensor.model.js'; // ✔️ RUTA CORREGIDA
import Control from '../src/models/control.model.js'; // ✔️ RUTA CORREGIDA

// Conectar a la base de datos de PRUEBAS
beforeAll(async () => {
    // Nota: Esto asume que el proceso de Jest establecerá NODE_ENV='test'
    // y que MONGO_URI_TEST está definido en tu .env.
    const url = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/iot_test_db';
    await mongoose.connect(url);
});

// Limpiar la base de datos después de cada prueba
afterEach(async () => {
    await User.deleteMany();
    await Device.deleteMany();
    await Sensor.deleteMany();
    await Control.deleteMany();
});

// Desconectar al final
afterAll(async () => {
    await mongoose.connection.close();
});

// Agente de Supertest
const appRequest = supertest(app);

// ----------------------------------------------------
// MÓDULO IOT: PRUEBAS AUTOMATIZADAS
// ----------------------------------------------------

describe('API de IoT (Dispositivos, Sensores, Controles)', () => {

    let authenticatedRequest; // ✔️ NUEVA VARIABLE: Usaremos este agente para mantener la sesión (cookies)
    let deviceId; // Variable para guardar el ID del dispositivo

    //#hook: se ejecuta antes de cada prueba para asegurar que hay un usuario autenticado
    beforeEach(async () => {
        // 1. Crear usuario de prueba
        const registerRes = await appRequest.post('/api/auth/register').send({
            username: "testuser-jest",
            email: "test-jest@example.com",
            password: "password123",
            firstName: "Test",
            lastName: "User",
            documentType: "Cédula",
            documentNumber: "987654"
        });
        
        expect(registerRes.statusCode).toBe(201); 

        // 2. Usar un agente *nuevo* (authenticatedRequest) para la petición de login.
        // Esto captura y *guarda* automáticamente las cookies para las peticiones subsiguientes.
        authenticatedRequest = supertest.agent(app);

        const loginRes = await authenticatedRequest.post('/api/auth/login').send({
            email: "test-jest@example.com",
            password: "password123"
        });
        
        expect(loginRes.statusCode).toBe(200); 

        // Si la autenticación es por cookie, la cookie se almacena en 'authenticatedRequest'.
        // Ya no necesitamos la variable 'token' explícitamente.
    });

    //#test para crear un dispositivo
    it('Debe crear un nuevo dispositivo (Device) correctamente', async () => {
        // ✔️ Usamos el agente autenticado
        const res = await authenticatedRequest.post('/api/devices') 
            .send({
                name: "Dispositivo Oficina 1 (Jest)",
                deviceId: "oficina-jest-001"
            });

        //#afirmaciones (validaciones)
        expect(res.statusCode).toBe(201);
        expect(res.body.device).toHaveProperty('name', 'Dispositivo Oficina 1 (Jest)');
        expect(res.body.device).toHaveProperty('deviceId', 'oficina-jest-001');

        // Guardar el ID para las pruebas que dependen de él
        deviceId = res.body.device._id;
    });

    //#test para crear un sensor (depende del dispositivo)
    it('Debe crear un nuevo sensor asociado al dispositivo', async () => {
        // Crear un dispositivo dentro de esta prueba para asegurar independencia
        const deviceRes = await authenticatedRequest.post('/api/devices') 
            .send({ name: "Device for Sensor", deviceId: "dev-sensor-01" });
        
        const newDeviceId = deviceRes.body.device._id;

        // ✔️ Usamos el agente autenticado
        const sensorRes = await authenticatedRequest.post('/api/iot/sensors') 
            .send({
                deviceId: newDeviceId,
                name: "Sensor de Temperatura (Jest)",
                unit: "C",
                color: "#FF0000"
            });

        //#afirmaciones
        expect(sensorRes.statusCode).toBe(201);
        expect(sensorRes.body.sensor).toHaveProperty('name', 'Sensor de Temperatura (Jest)');
        expect(sensorRes.body.sensor).toHaveProperty('deviceId', newDeviceId);
        expect(sensorRes.body.sensor.color).toBe('#FF0000');
    });

    //#test para enviar un comando a un control
    it('Debe enviar un comando a un control y actualizar su valor', async () => {
        // 1. Crear Dispositivo (Usando agente autenticado)
        const deviceRes = await authenticatedRequest.post('/api/devices')
            .send({ name: "Device for Control", deviceId: "dev-control-01" });
        const newDeviceId = deviceRes.body.device._id;

        // 2. Crear Control (Usando agente autenticado)
        const controlRes = await authenticatedRequest.post('/api/iot/controls') 
            .send({
                deviceId: newDeviceId,
                name: "Luz (Jest)",
                type: "switch"
            });
        const newControlId = controlRes.body.control._id;

        // 3. Enviar Comando (Prueba principal) (Usando agente autenticado)
        const commandRes = await authenticatedRequest.post(`/api/iot/controls/${newControlId}/command`) 
            .send({ value: 1 }); // Encender

        //#afirmaciones
        expect(commandRes.statusCode).toBe(200);
        expect(commandRes.body).toHaveProperty('message', "Comando '1' enviado a Luz (Jest).");

        // 4. Verificar que el valor se guardó en la BD 
        const updatedControl = await Control.findById(newControlId);
        expect(updatedControl.currentValue).toBe(1);
    });
    
    //#test para eliminar un dispositivo (en cascada)
    it('Debe eliminar un dispositivo y sus componentes (Sensores/Controles) asociados', async () => {
        // 1. Crear Dispositivo (Usando agente autenticado)
        const deviceRes = await authenticatedRequest.post('/api/devices')
            .send({ name: "Device to Delete", deviceId: "dev-delete-01" });
        const deviceIdToDelete = deviceRes.body.device._id;

        // 2. Crear un sensor y control para ese dispositivo (Usando agente autenticado)
        await authenticatedRequest.post('/api/iot/sensors')
            .send({ deviceId: deviceIdToDelete, name: "Sensor A", unit: "L" });
        await authenticatedRequest.post('/api/iot/controls')
            .send({ deviceId: deviceIdToDelete, name: "Control B", type: "switch" });

        // 3. Eliminar Dispositivo (Usando agente autenticado)
        const deleteRes = await authenticatedRequest.delete(`/api/devices/${deviceIdToDelete}`); 

        expect(deleteRes.statusCode).toBe(200);
        expect(deleteRes.body.message).toContain('eliminados con éxito');
        
        // 4. Verificar que los componentes también se eliminaron
        const sensorsAfterDelete = await Sensor.find({ deviceId: deviceIdToDelete });
        const controlsAfterDelete = await Control.find({ deviceId: deviceIdToDelete });

        expect(sensorsAfterDelete.length).toBe(0);
        expect(controlsAfterDelete.length).toBe(0);
    });
});
