# Módulo de Usuario y Seguridad (Autenticación y Autorización)

## 1. Visión General y Arquitectura

### Propósito
El módulo de Usuario y Seguridad proporciona la gestión completa de usuarios, autenticación (local y social con Google), autorización basada en roles, recuperación y verificación de credenciales, y mecanismos avanzados como autenticación de dos factores (2FA). Es el núcleo de la seguridad de la aplicación, asegurando que solo usuarios autenticados y autorizados puedan acceder a los recursos protegidos.

### Flujo Arquitectónico

- **Rutas** (`routes/user.routes.js`, `routes/googleAuth.routes.js`): Definen los endpoints HTTP y aplican middlewares de validación y autenticación.
- **Controladores** (`controllers/users.controller.js`): Implementan la lógica de negocio para cada endpoint.
- **Modelos** (`models/user.model.js`): Definen la estructura de los datos de usuario en MongoDB usando Mongoose.
- **Middlewares** (`middlewares/validateToken.middleware.js`, `middlewares/validator.middleware.js`): Validan tokens JWT, roles y esquemas de entrada.
- **Librerías** (`libs/jwt.js`): Generación y validación de JWT.
- **Configuración** (`config/googleAuth.js`, `config/email.js`): Integración con Google OAuth y envío de emails.
- **Utilidades** (`utils/customError.js`, `utils/errorCodes.js`): Manejo centralizado de errores y códigos de error.

**Diagrama Simplificado:**

```
[Cliente] → [Rutas] → [Middlewares] → [Controladores] → [Modelo Usuario (DB)]
```

## 2. Estructura del Módulo

| Archivo | Responsabilidad |
|---------|----------------|
| `routes/user.routes.js` | Endpoints REST para registro, login, perfil, 2FA, etc. |
| `routes/googleAuth.routes.js` | Endpoints para autenticación OAuth con Google. |
| `controllers/users.controller.js` | Lógica de negocio de usuario y seguridad. |
| `models/user.model.js` | Esquema de usuario en MongoDB. |
| `middlewares/validateToken.middleware.js` | Validación de JWT y control de acceso. |
| `middlewares/validator.middleware.js` | Validación de datos de entrada con Zod. |
| `schemas/auth.schema.js` | Esquemas de validación para cada endpoint. |
| `libs/jwt.js` | Generación de tokens JWT. |
| `config/googleAuth.js` | Configuración de Google OAuth y helpers de sesión. |
| `config/email.js` | Envío de emails de verificación, reset y cambio de email. |
| `utils/customError.js` | Clase y helpers para manejo de errores personalizados. |
| `utils/errorCodes.js` | Diccionario centralizado de códigos y mensajes de error. |

## 3. Modelos de Datos (Schemas / Interfaces)

### Modelo Principal: User

Ver definición completa en `models/user.model.js`.

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `username` | String, requerido | Nombre de usuario |
| `email` | String, requerido, único | Email del usuario |
| `password` | String, requerido | Hash de la contraseña (bcrypt) |
| `role` | String, enum: `admin`, `common` | Rol de acceso |
| `googleId` | String, opcional | ID de Google OAuth |
| `provider` | String, enum: `local`, `google` | Origen de autenticación |
| `avatar` | String, opcional | URL del avatar |
| `lastLogin` | Date, opcional | Último acceso |
| `document` | String, opcional, único (sparse) | Documento de identidad |
| `documentType` | String, enum | Tipo de documento |
| `cellphone` | String, opcional | Teléfono |
| `address` | String, opcional | Dirección |
| `active` | Boolean, default: true | Estado de la cuenta |
| `verifiedEmail` | Boolean, default: false | Email verificado |
| `consentAccepted` | Boolean, default: false | Consentimiento legal |
| `resetPasswordToken` | String, opcional | Token de recuperación de contraseña |
| `resetPasswordExpires` | Date, opcional | Expiración del token de reset |
| `emailVerificationToken` | String, opcional | Token de verificación de email |
| `emailVerificationExpires` | Date, opcional | Expiración del token de verificación |
| `twoFactorEnabled` | Boolean, default: false | 2FA activado |
| `twoFactorSecret` | String, opcional | Secreto TOTP para 2FA |
| `twoFactorBackupCodes` | [String] | Códigos de respaldo para 2FA |
| `emailChangeToken` | String, opcional | Token para cambio de email |
| `emailChangeExpires` | Date, opcional | Expiración del token de cambio de email |
| `pendingEmail` | String, opcional | Nuevo email pendiente de confirmación |
| `createdAt` / `updatedAt` | Date | Timestamps automáticos |

### Otros Esquemas

- **Esquemas de Validación**: Definidos en `schemas/auth.schema.js` usando Zod para cada endpoint (registro, login, edición, 2FA, etc.).
- **Tokens JWT**: Payload mínimo `{ id: <userId>, [requires2FA: true] }`.

## 4. Documentación Detallada de Funcionalidad

### Registro de Usuario

**Firma:**  
`register(req, res, next)`

**Lógica:**  
- Valida datos con Zod.
- Verifica unicidad de email.
- Hashea la contraseña con bcrypt.
- Crea usuario y guarda en DB.
- Genera JWT y lo envía en cookie HttpOnly.

**Seguridad:**  
- Hash de contraseña (bcrypt).
- Email único y normalizado.
- Cookie segura (SameSite, HttpOnly).

---

### Login

**Firma:**  
`login(req, res, next)`

**Lógica:**  
- Busca usuario por email.
- Verifica estado activo.
- Compara contraseña (bcrypt).
- Si tiene 2FA, genera cookie temporal; si no, genera JWT normal.

**Seguridad:**  
- Comparación segura de hash.
- Prevención de enumeración de usuarios.
- 2FA opcional.

---

### Logout

**Firma:**  
`logout(req, res)`

**Lógica:**  
- Borra la cookie de sesión.

**Seguridad:**  
- Elimina token JWT del cliente.

---

### Perfil

**Firma:**  
`profile(req, res)`

**Lógica:**  
- Devuelve los datos del usuario autenticado.

**Seguridad:**  
- Requiere autenticación (middleware).

---

### Editar Perfil

**Firma:**  
`editUser(req, res, next)`

**Lógica:**  
- Permite editar campos permitidos.
- Valida campos con Zod.
- Actualiza usuario en DB.

**Seguridad:**  
- Solo campos permitidos.
- Validación estricta.

---

### Cambiar Contraseña

**Firma:**  
`changePassword(req, res, next)`

**Lógica:**  
- Verifica contraseña actual.
- Valida que la nueva sea diferente.
- Hashea y actualiza.

**Seguridad:**  
- Hash bcrypt.
- No permite igual a la anterior.

---

### Recuperación de Contraseña

**Solicitar Código:**  
`requestPasswordReset(req, res, next)`

- Genera código de 6 dígitos, lo guarda y envía por email.

**Resetear Contraseña:**  
`resetPassword(req, res, next)`

- Verifica código y expiración.
- Hashea y actualiza contraseña.

**Seguridad:**  
- Código de un solo uso, expira en 15 min.
- Respuesta genérica para evitar enumeración.

---

### Verificación de Email

**Solicitar Código:**  
`requestEmailVerification(req, res, next)`

- Genera código y lo envía por email.

**Verificar:**  
`verifyEmail(req, res, next)`

- Valida código y expira.
- Marca email como verificado.

**Seguridad:**  
- Código de un solo uso, expira en 24h.

---

### Autenticación de Dos Factores (2FA)

**Setup:**  
`setup2FA(req, res, next)`

- Genera secreto TOTP y códigos de respaldo.
- Devuelve QR y backup codes.

**Activar:**  
`verifyAndEnable2FA(req, res, next)`

- Verifica código TOTP y activa 2FA.

**Desactivar:**  
`disable2FA(req, res, next)`

- Verifica contraseña y desactiva 2FA.

**Verificar en Login:**  
`verify2FA(req, res, next)`

- Verifica código TOTP o backup code.
- Si es login, intercambia cookie temporal por JWT normal.

**Seguridad:**  
- Secretos y códigos de respaldo únicos.
- Ventana de tolerancia en TOTP.
- Backup codes de un solo uso.

---

### Cambio de Email

**Solicitar:**  
`requestEmailChange(req, res, next)`

- Verifica contraseña.
- Genera código y lo envía al nuevo email.

**Confirmar:**  
`confirmEmailChange(req, res, next)`

- Valida código y expira.
- Actualiza email y lo marca como verificado.

**Seguridad:**  
- Confirmación por código.
- No permite duplicados.

---

### Eliminar Cuenta

**Firma:**  
`unsubscribe(req, res, next)`

**Lógica:**  
- Verifica contraseña.
- Elimina usuario y borra cookie.

**Seguridad:**  
- Solo con contraseña válida.

---

## Consideraciones de Seguridad Globales

- **Hashing de contraseñas:** Siempre con bcrypt.
- **JWT:** Firmados con secreto robusto, expiración controlada.
- **Validación de entrada:** Zod en todos los endpoints.
- **Roles y permisos:** Campo `role` en usuario, validable para endpoints sensibles.
- **2FA:** Opcional, con TOTP y backup codes.
- **Prevención de enumeración:** Respuestas genéricas en flujos sensibles.
- **Errores centralizados:** Todos los errores pasan por `utils/customError.js` y `utils/errorCodes.js`.

---

## Referencias de Código

- Controladores de Usuario
- Modelo de Usuario
- Rutas de Usuario
- Middlewares de Seguridad
- Esquemas de Validación
- Google OAuth
- Envío de Emails
- Errores Personalizados, Códigos de Error

---

**Esta documentación cubre el diseño y funcionamiento del módulo de usuario y seguridad. Para detalles de implementación, consulte los archivos enlazados.**
