// src/utils/emailService.ts
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (to: string, name: string, code: string) => {
    try {
        const { data, error } = await resend.emails.send({
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
    } catch (error) {
        console.error('Error in sendVerificationEmail:', error);
        throw error;
    }
};
