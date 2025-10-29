//#Imports

import mongoose from "mongoose";



//#Esquema de usuario

const userSchema = new mongoose.Schema({

    username: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, trim: true },

    password: { type: String, required: true },

    role: { type: String, enum: ['admin', 'common',], default: 'common' },



    //#google OAuth

    googleId: { type: String, required: false },

    provider: { type: String, enum: ['local', 'google'], default: 'local' },

    avatar: { type: String, required: false },

    lastLogin: { type: Date, required: false },

    document: { type: String, required: false },

    documentType: { type: String, enum: ['Cédula', 'Cédula de extranjería', 'PPT', 'Pasaporte'], required: false },

    cellphone: { type: String, required: false },

    address: { type: String, required: false },

    active: { type: Boolean, default: true },

    verifiedEmail: { type: Boolean, default: false },

    consentAccepted: { type: Boolean, default: false },



    //#password reset

    resetPasswordToken: { type: String, required: false },

    resetPasswordExpires: { type: Date, required: false },



    //#Email verification

    emailVerificationToken: { type: String, required: false },

    emailVerificationExpires: { type: Date, required: false },




    //#Two-Factor Authentication
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, required: false }, // TOTP secret
    twoFactorBackupCodes: [{ type: String }], // Array of backup codes



    //#Cambio de email

    emailChangeToken: { type: String, required: false },

    emailChangeExpires: { type: Date, required: false },

    pendingEmail: { type: String, required: false }, // New email waiting verification

}, { timestamps: true });



//#Índices únicos pero sparse: permite múltiples documentos sin el campo (null/absente) y garantiza que sean únicos cuando se proporciona

userSchema.index({ document: 1 }, { unique: true, sparse: true });

userSchema.index({ googleId: 1 }, { unique: true, sparse: true });



//#User Model

export default mongoose.model('User', userSchema);