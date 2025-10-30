//#imports
import mqtt from 'mqtt';
import dotenv from 'dotenv';
import Sensor from '../models/sensor.model.js';
import Control from '../models/control.model.js';

// Obtener el deviceId desde variable de entorno o dejar vacío (para pruebas)
const DEVICE_ID = process.env.MQTT_DEVICE_ID || '';

dotenv.config();

//#Cliente MQTT (variable global interna)
let mqttClient = null;

//#Funcion para conectar al broker MQTT
export function connectMqtt() {
	const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
	const MQTT_CLIENT_ID = process.env.MQTT_CLIENT_ID || `iot_api_${Math.random().toString(16).substr(2, 8)}`;

	mqttClient = mqtt.connect(MQTT_URL, {
		clientId: MQTT_CLIENT_ID,
		clean: true,
		connectTimeout: 4000,
		reconnectPeriod: 1000
	});

	//#Listener de conexión
	mqttClient.on('connect', () => {
		console.log(`[MQTT] Conectado al broker: ${MQTT_URL}`);
		// Suscribirse a un tópico específico por deviceId
		const topic = DEVICE_ID ? `iot/sensor/data/${DEVICE_ID}` : 'iot/sensor/data';
		mqttClient.subscribe(topic, (err) => {
			if (err) {
				console.error(`[MQTT] Error al suscribirse a ${topic}:`, err.message);
			} else {
				console.log(`[MQTT] Suscrito a ${topic}`);
			}
		});
	});

	//#Listener de mensajes entrantes
	mqttClient.on('message', async (topic, message) => {
		// Solo procesa mensajes del tópico propio
		if (DEVICE_ID && topic !== `iot/sensor/data/${DEVICE_ID}`) return;
		try {
			await handleSensorData(message);
		} catch (err) {
			console.error('[MQTT] Error procesando datos de sensor:', err);
		}
	});
}

//#Función interna para procesar datos de sensores recibidos
async function handleSensorData(rawData) {
	try {
		const payload = JSON.parse(rawData.toString());
		const { sensorId, value } = payload;
		if (!sensorId || typeof value === 'undefined') {
			throw new Error('Payload inválido: falta sensorId o value');
		}
		await Sensor.findByIdAndUpdate(sensorId, {
			currentValue: value,
			lastUpdate: new Date()
		});
		console.log(`[MQTT] Sensor propio ${sensorId} actualizado con valor: ${value}`);
	} catch (err) {
		console.error('[MQTT] Error en handleSensorData:', err.message);
	}
}

//#Función para enviar comandos a un control
export async function sendCommand(deviceId, controlId, value) {
	if (!mqttClient || !mqttClient.connected) {
		console.error('[MQTT] Cliente no conectado. No se puede enviar comando.');
		return false;
	}
	try {
		const topic = `iot/control/command/${deviceId}`;
		const payload = JSON.stringify({ controlId, value });
		await new Promise((resolve, reject) => {
			mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
		// Opcional: console.log(`[MQTT] Comando enviado a ${topic}:`, payload);
		return true;
	} catch (err) {
		console.error('[MQTT] Error enviando comando:', err.message);
		return false;
	}
}
