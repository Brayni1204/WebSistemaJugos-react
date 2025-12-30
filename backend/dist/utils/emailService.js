"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
// src/utils/emailService.ts
const resend_1 = require("resend");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const sendVerificationEmail = (to, name, code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data, error } = yield resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: [to],
            subject: 'Verifica tu cuenta',
            html: `
                <h1>Hola, ${name}!</h1>
                <p>Gracias por registrarte. Por favor, verifica tu dirección de email usando el siguiente código:</p>
                <h2>${code}</h2>
                <p>Este código expirará en 10 minutos.</p>
                <p>Si no te registraste en nuestro servicio, puedes ignorar este correo.</p>
            `,
        });
        if (error) {
            console.error('Error sending verification email:', error);
            throw new Error(error.message);
        }
        console.log('Verification email sent:', data);
        return data;
    }
    catch (error) {
        console.error('Error in sendVerificationEmail:', error);
        throw error;
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
