export const ERROR_CODES = {
    //#errores de autenticación (AUTH_xxx) - Usados en flujos de login/tokens
    AUTH_USER_NOT_FOUND: {
        code: 'AUTH_001',
        userMessage: 'Usuario no encontrado.',
        devMessage: 'User not found in database.',
        httpStatus: 404
    },
    AUTH_INVALID_CREDENTIALS: {
        code: 'AUTH_002',
        userMessage: 'Credenciales inválidas.',
        devMessage: 'Password or email/username does not match.',
        httpStatus: 401
    },
    AUTH_USER_INACTIVE: {
        code: 'AUTH_003',
        userMessage: 'Tu cuenta está desactivada.',
        devMessage: 'User "active" field is false.',
        httpStatus: 403
    },
    AUTH_TOKEN_INVALID: {
        code: 'AUTH_004',
        userMessage: 'Sesión inválida. Inicia sesión nuevamente.',
        devMessage: 'JWT token is invalid or malformed.',
        httpStatus: 401
    },
    AUTH_INSUFFICIENT_PERMISSIONS: {
        code: 'AUTH_005',
        userMessage: 'No tienes permisos para realizar esta acción.',
        devMessage: 'User role does not have required permissions.',
        httpStatus: 403
    },
    AUTH_PROVIDER_MISMATCH: {
        code: 'AUTH_006',
        userMessage: 'Ya existe una cuenta con este email usando otro método de login.',
        devMessage: 'User trying to authenticate with a different provider (e.g., local tried Google, or vice versa).',
        httpStatus: 400
    },
    AUTH_OAUTH_USER: {
        code: 'AUTH_017',
        userMessage: 'Esta operación requiere una contraseña, pero tu cuenta usa login social.',
        devMessage: 'User authenticated via OAuth (Google) and does not have a password.',
        httpStatus: 400
    },

    //#Errores de Validacion (VAL_xxx) - Basados en "required: true" y "unique: true"
    VAL_USERNAME_REQUIRED: {
        code: 'VAL_001',
        userMessage: 'El nombre de usuario es obligatorio.',
        devMessage: 'Username field is required.',
        httpStatus: 400
    },
    VAL_EMAIL_REQUIRED: {
        code: 'VAL_002',
        userMessage: 'El email es obligatorio.',
        devMessage: 'Email field is required.',
        httpStatus: 400
    },
    VAL_EMAIL_INVALID: {
        code: 'VAL_003',
        userMessage: 'El formato del email es inválido.',
        devMessage: 'Email format is invalid.',
        httpStatus: 400
    },
    VAL_EMAIL_ALREADY_EXISTS: {
        code: 'VAL_004',
        userMessage: 'Ya existe una cuenta con este email.',
        devMessage: 'Email address is already registered (unique index violation).',
        httpStatus: 409
    },
    VAL_PASSWORD_REQUIRED: {
        code: 'VAL_005',
        userMessage: 'La contraseña es obligatoria.',
        devMessage: 'Password field is required.',
        httpStatus: 400
    },
    VAL_ROLE_INVALID: {
        code: 'VAL_006',
        userMessage: 'El rol de usuario proporcionado no es válido.',
        devMessage: 'Role value is not one of the allowed enum values (admin, common).',
        httpStatus: 400
    },
    VAL_DOCUMENT_ALREADY_EXISTS: {
        code: 'VAL_007',
        userMessage: 'Ya existe un usuario con este número de documento.',
        devMessage: 'Document number is already in use (sparse unique index violation).',
        httpStatus: 409
    },
    VAL_DOCUMENT_TYPE_INVALID: {
        code: 'VAL_008',
        userMessage: 'El tipo de documento proporcionado no es válido.',
        devMessage: 'documentType value is not one of the allowed enum values.',
        httpStatus: 400
    },
    VAL_CONSENT_REQUIRED: {
        code: 'VAL_009',
        userMessage: 'Debe aceptar los términos y condiciones para continuar.',
        devMessage: '"consentAccepted" must be true for registration.',
        httpStatus: 400
    },

    //#Errores especificos de usuario/validacion (USER_xxx)
    USER_EMAIL_ALREADY_VERIFIED: {
        code: 'USER_001',
        userMessage: 'Tu email ya está verificado.',
        devMessage: '"verifiedEmail" is already true.',
        httpStatus: 400
    },
    USER_INVALID_VERIFICATION_CODE: {
        code: 'USER_002',
        userMessage: 'Código de verificación inválido o expirado.',
        devMessage: 'emailVerificationToken is invalid or expired.',
        httpStatus: 400
    },
    USER_INVALID_RESET_CODE: {
        code: 'USER_003',
        userMessage: 'Código de recuperación de contraseña inválido o expirado.',
        devMessage: 'resetPasswordToken is invalid or expired.',
        httpStatus: 400
    },
    USER_2FA_ALREADY_ENABLED: {
        code: 'USER_004',
        userMessage: 'La autenticación de dos factores ya está activada.',
        devMessage: '"twoFactorEnabled" is already true.',
        httpStatus: 400
    },
    USER_2FA_NOT_SETUP: {
        code: 'USER_005',
        userMessage: 'Primero debes configurar la autenticación de dos factores.',
        devMessage: '"twoFactorSecret" is missing.',
        httpStatus: 400
    },
    USER_INVALID_2FA_CODE: {
        code: 'USER_006',
        userMessage: 'Código 2FA inválido.',
        devMessage: 'Two-factor authentication code verification failed.',
        httpStatus: 400
    },
    USER_EMAIL_CHANGE_INVALID_CODE: {
        code: 'USER_007',
        userMessage: 'Código de cambio de email inválido o expirado.',
        devMessage: 'emailChangeToken is invalid or expired.',
        httpStatus: 400
    },
    USER_EMAIL_CHANGE_NO_PENDING: {
        code: 'USER_008',
        userMessage: 'No hay un cambio de email pendiente de verificación.',
        devMessage: '"pendingEmail" field is empty.',
        httpStatus: 400
    },
    USER_BACKUP_CODE_USED: {
        code: 'USER_009',
        userMessage: 'Código de respaldo 2FA inválido o ya utilizado.',
        devMessage: '2FA backup code not found or already consumed.',
        httpStatus: 400
    },

    // === Códigos agregados para compatibilidad con controladores ===
    AUTH_INVALID_PASSWORD: {
        code: 'AUTH_007',
        userMessage: 'Contraseña incorrecta.',
        devMessage: 'Password does not match stored hash.',
        httpStatus: 401
    },
    AUTH_INVALID_RESET_CODE: {
        code: 'AUTH_008',
        userMessage: 'Código de recuperación inválido o expirado.',
        devMessage: 'Password reset code is invalid or expired.',
        httpStatus: 400
    },
    AUTH_EMAIL_ALREADY_VERIFIED: {
        code: 'AUTH_009',
        userMessage: 'Tu email ya está verificado.',
        devMessage: 'User email is already verified.',
        httpStatus: 400
    },
    AUTH_2FA_ALREADY_ENABLED: {
        code: 'AUTH_010',
        userMessage: 'La autenticación de dos factores ya está activada.',
        devMessage: 'Two-factor authentication is already enabled.',
        httpStatus: 400
    },
    AUTH_2FA_NOT_SETUP: {
        code: 'AUTH_011',
        userMessage: 'Primero debes configurar la autenticación de dos factores.',
        devMessage: 'Two-factor authentication setup not completed.',
        httpStatus: 400
    },
    AUTH_INVALID_2FA_CODE: {
        code: 'AUTH_012',
        userMessage: 'Código 2FA inválido. Verifica e intenta nuevamente.',
        devMessage: 'Two-factor authentication code is invalid.',
        httpStatus: 400
    },
    AUTH_2FA_NOT_ENABLED: {
        code: 'AUTH_013',
        userMessage: 'La autenticación de dos factores no está activada.',
        devMessage: 'Two-factor authentication is not enabled.',
        httpStatus: 400
    },
    AUTH_INVALID_EMAIL_CHANGE_CODE: {
        code: 'AUTH_014',
        userMessage: 'Código de cambio de email inválido o expirado.',
        devMessage: 'Email change confirmation code is invalid or expired.',
        httpStatus: 400
    },
    AUTH_PASSWORD_SAME_AS_CURRENT: {
        code: 'AUTH_015',
        userMessage: 'La nueva contraseña debe ser diferente a la actual.',
        devMessage: 'New password is the same as current password.',
        httpStatus: 400
    },
    AUTH_EMAIL_NOT_VERIFIED: {
        code: 'AUTH_016',
        userMessage: 'Debes verificar tu email antes de activar 2FA.',
        devMessage: 'Email must be verified before enabling 2FA.',
        httpStatus: 400
    },
    VAL_NO_FIELDS_TO_UPDATE: {
        code: 'VAL_010',
        userMessage: 'No se proporcionaron campos válidos para actualizar.',
        devMessage: 'No valid fields provided for update.',
        httpStatus: 400
    },
    VAL_MISSING_PASSWORD: {
        code: 'VAL_011',
        userMessage: 'La contraseña es obligatoria.',
        devMessage: 'Password is required for this operation.',
        httpStatus: 400
    },
    SRV_EMAIL_SEND_FAILED: {
        code: 'SRV_001',
        userMessage: 'No pudimos enviar el email. Intenta más tarde.',
        devMessage: 'Email service failed to send message.',
        httpStatus: 500
    },
    SRV_INTERNAL_ERROR: {
        code: 'SRV_999',
        userMessage: 'Error interno del servidor.',
        devMessage: 'Unhandled internal server error.',
        httpStatus: 500
    },
    SRV_DATABASE_ERROR: {
        code: 'SRV_002',
        userMessage: 'Error temporal del servidor. Intenta más tarde.',
        devMessage: 'Database operation failed.',
        httpStatus: 500
    },
    VAL_INVALID_OBJECT_ID: {
        code: 'VAL_012',
        userMessage: 'ID inválido.',
        devMessage: 'Invalid MongoDB ObjectId format.',
        httpStatus: 400
    }
};