# Módulo de Gestión de IoT (Dispositivos, Sensores, Controles)

## 1. Visión General y Arquitectura

### Propósito
El módulo de IoT permite la gestión integral de dispositivos físicos, sensores y controles asociados a cada usuario. Facilita la administración, monitoreo y control de hardware IoT desde la plataforma, asegurando la propiedad de los recursos y la integridad de los datos.

### Flujo Arquitectónico

El flujo estándar para las operaciones CRUD sigue el patrón RESTful:

```
[Cliente] → [Rutas/Middlewares] → [Controlador] → [Modelos Mongoose (DB)]
```

- **Propiedad:** Todas las operaciones validan que el usuario autenticado sea propietario de los recursos (device, sensor, control) antes de permitir acciones.
- **Eliminación en cascada:** Al eliminar un dispositivo, se eliminan automáticamente sensores y controles asociados.

## 2. Estructura del Módulo

| Archivo | Responsabilidad |
|---------|----------------|
| `models/device.model.js` | Esquema y modelo de Dispositivo (Device) |
| `models/sensor.model.js` | Esquema y modelo de Sensor (Sensor) |
| `models/control.model.js` | Esquema y modelo de Control (Control) |
| `controllers/iot.controller.js` | Lógica de negocio y controladores CRUD para IoT |
| `routes/device.routes.js` | Rutas RESTful para dispositivos (CRUD, autenticación) |
| `routes/iot.routes.js` | Rutas RESTful para sensores y controles (CRUD, comandos) |
| `schemas/iot.schema.js` | Esquemas de validación Zod para dispositivos, sensores y controles |

## 3. Modelos de Datos (Mongoose Schemas)

### Device
| Campo | Tipo | Descripción |
|-------|------|-------------|
| userId | ObjectId (ref: User) | Propietario del dispositivo |
| name | String | Nombre del dispositivo |
| deviceId | String | Identificador único de firmware |
| status | String (online/offline) | Estado de conexión |
| createdAt/updatedAt | Date | Timestamps automáticos |

### Sensor
| Campo | Tipo | Descripción |
|-------|------|-------------|
| deviceId | ObjectId (ref: Device) | Dispositivo al que pertenece |
| name | String | Nombre del sensor |
| unit | String | Unidad de medida (ej: C, %, V) |
| topic | String | Tópico MQTT (único) |
| color | String | Color para visualización |
| createdAt/updatedAt | Date | Timestamps automáticos |

### Control
| Campo | Tipo | Descripción |
|-------|------|-------------|
| deviceId | ObjectId (ref: Device) | Dispositivo al que pertenece |
| name | String | Nombre del control |
| type | String (enum: switch) | Tipo de control (solo 'switch' en v1) |
| topic | String | Tópico MQTT para comandos |
| currentValue | Number (0/1) | Estado actual (simulado) |
| createdAt/updatedAt | Date | Timestamps automáticos |

## 4. Documentación Detallada de Funcionalidad

### Dispositivos (Device)
- **createDevice:** Crea un nuevo dispositivo asociado al usuario autenticado. Valida unicidad de deviceId y asigna propiedad.
- **updateDevice:** Permite modificar el nombre del dispositivo. Solo el propietario puede editar.
- **deleteDevice:** Elimina el dispositivo y, en cascada, todos los sensores y controles asociados. Garantiza que solo el propietario pueda eliminar.
- **listDevices / getDevice:** Devuelve todos los dispositivos del usuario o uno específico, incluyendo sensores y controles relacionados.

### Sensores (Sensor)
- **createSensor:** Crea un sensor vinculado a un dispositivo del usuario. Valida existencia y propiedad del deviceId.
- **updateSensor:** Permite modificar nombre, unidad y color del sensor. Solo el propietario puede editar.
- **deleteSensor:** Elimina el sensor. Solo el propietario del dispositivo puede eliminar.
- **getSensor:** Devuelve los datos de un sensor específico.

### Controles (Control)
- **createControl:** Crea un control vinculado a un dispositivo del usuario. Valida existencia y propiedad del deviceId.
- **updateControl:** Permite modificar nombre y tipo del control (solo 'switch' en v1). Solo el propietario puede editar.
- **deleteControl:** Elimina el control. Solo el propietario del dispositivo puede eliminar.
- **getControl:** Devuelve los datos de un control específico.

### Envío de Comando a Control
- **sendCommandToControl:** Actualiza el campo `currentValue` del control en la base de datos (simula el cambio de estado). Actualmente no integra MQTT, pero está preparado para extenderse y publicar comandos a dispositivos físicos en el futuro.

## 5. Consideraciones de Seguridad y Propiedad
- Todas las operaciones CRUD validan la propiedad del recurso antes de permitir modificaciones o eliminaciones.
- La eliminación en cascada asegura que no queden sensores ni controles huérfanos.
- Los endpoints están protegidos por autenticación JWT.

---

**Esta documentación cubre el diseño, modelos y flujos principales del módulo de IoT. Para detalles de implementación, consulta los archivos fuente referenciados.**
