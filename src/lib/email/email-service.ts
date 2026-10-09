import "server-only";
import nodemailer from "nodemailer";
import { renderOTPEmailTemplate } from "./templates/otp-email";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const host = process.env.SMTP_HOST || "127.0.0.1";
const port = parseInt(process.env.SMTP_PORT || "1025", 10);
const secure = process.env.SMTP_SECURE === "true";
const defaultFrom = process.env.EMAIL_FROM || "Conecta MINEDUC <no-reply@mineduc.gob.gt>";

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  // Para servidores locales como Mailpit no se requieren credenciales auth
  ...(process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }
    : {}),
});

export async function sendEmail({ to, subject, html, text }: SendMailOptions) {
  const info = await transporter.sendMail({
    from: defaultFrom,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>?/gm, ""),
  });

  return {
    messageId: info.messageId,
    accepted: info.accepted,
    response: info.response,
  };
}

/**
 * Genera y envía el correo con la plantilla institucional de OTP.
 */
export async function sendOTPEmail(email: string, otp: string) {
  const html = renderOTPEmailTemplate(otp);
  const text = `Conecta MINEDUC - Código de verificación: ${otp}. Válido por 5 minutos.`;

  return sendEmail({
    to: email,
    subject: "Código de Verificación - Conecta MINEDUC",
    html,
    text,
  });
}
