# device_simulator.py
# Simulador de dispositivo IoT usando Paho-MQTT

import paho.mqtt.client as mqtt
import time
import json
import random

# =============================
# Configuración del Broker MQTT
# =============================
BROKER = 'broker.hivemq.com'
PORT = 1883
CLIENT_ID = f'device-sim-{random.randint(1000,9999)}'

# =============================
# Placeholders de IDs de MongoDB (reemplazar por los reales)
# =============================
DEVICE_ID = "69039687a167f6e832c82529"
SENSOR_ID = "690396b1a167f6e832c8252e"

# =============================
# Tópicos MQTT
# =============================
TOPIC_SENSOR_DATA = 'iot/sensor/data'
TOPIC_CONTROL_COMMAND = f'iot/control/command/{DEVICE_ID}'

# =============================
# Callback: Conexión exitosa
# =============================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"[MQTT] Conectado al broker {BROKER}:{PORT} como {CLIENT_ID}")
        # Suscribirse al tópico de comandos para este dispositivo
        client.subscribe(TOPIC_CONTROL_COMMAND)
        print(f"[MQTT] Suscrito a: {TOPIC_CONTROL_COMMAND}")
    else:
        print(f"[MQTT] Fallo en la conexión, código: {rc}")

# =============================
# Callback: Mensaje recibido (comando de control)
# =============================
def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        control_id = payload.get('controlId')
        value = payload.get('value')
        print(f"[COMANDO] Control: {control_id} cambiado a: {value}")
    except Exception as e:
        print(f"[ERROR] Error procesando comando: {e}")

# =============================
# Publicar datos de sensor
# =============================
def publish_sensor_data(client):
    value = round(random.uniform(20.0, 30.0), 2)  # Temperatura simulada
    payload = {
        "sensorId": SENSOR_ID,
        "value": value
    }
    client.publish(TOPIC_SENSOR_DATA, json.dumps(payload), qos=1)
    print(f"[SENSOR] Publicado: {payload}")

# =============================
# Ejecución principal
# =============================
if __name__ == "__main__":
    client = mqtt.Client(client_id=CLIENT_ID, protocol=mqtt.MQTTv311)
    client.on_connect = on_connect
    client.on_message = on_message

    print("[INFO] Iniciando simulador de dispositivo IoT...")
    client.connect(BROKER, PORT, keepalive=60)
    client.loop_start()

    try:
        while True:
            publish_sensor_data(client)
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n[INFO] Simulador detenido por el usuario.")
        client.loop_stop()
        client.disconnect()
