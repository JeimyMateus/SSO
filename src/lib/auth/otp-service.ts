import "server-only";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export interface OTPRecord {
  email: string;
  codeHash: string;
  expiresAt: Date | Timestamp;
  attempts: number;
  maxAttempts: number;
  createdAt: Date | Timestamp;
  verified: boolean;
}

export interface OTPVerificationResult {
  success: boolean;
  error?: string;
}

const OTP_COLLECTION = "auth_otps";
const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

/**
 * Genera un código OTP numérico criptográficamente seguro de 6 dígitos.
 */
export function generateOTP(): string {
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Calcula el hash SHA-256 de un código OTP para almacenamiento seguro.
 */
export function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp.trim()).digest("hex");
}

/**
 * Genera, hashea y persiste un OTP con TTL de 5 minutos en Firestore.
 */
export async function createAndSaveOTP(
  email: string
): Promise<{ otp: string; expiresAt: Date }> {
  const normalizedEmail = email.trim().toLowerCase();
  const otp = generateOTP();
  const codeHash = hashOTP(otp);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_TTL_MINUTES * 60 * 1000);

  const otpRecord = {
    email: normalizedEmail,
    codeHash,
    expiresAt,
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    createdAt: now,
    verified: false,
  };

  await adminDb.collection(OTP_COLLECTION).doc(normalizedEmail).set(otpRecord);

  return { otp, expiresAt };
}

/**
 * Valida un código OTP contra el registro en Firestore.
 */
export async function verifyOTP(
  email: string,
  candidateOtp: string
): Promise<OTPVerificationResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const docRef = adminDb.collection(OTP_COLLECTION).doc(normalizedEmail);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return {
      success: false,
      error: "No se encontró ningún código de verificación activo para este correo.",
    };
  }

  const data = docSnap.data() as OTPRecord;

  if (data.verified) {
    return {
      success: false,
      error: "Este código ya ha sido utilizado. Solicita uno nuevo.",
    };
  }

  // Comprobar expiración
  let expiresAtMs: number;
  if (typeof (data.expiresAt as any)?.toMillis === "function") {
    expiresAtMs = (data.expiresAt as any).toMillis();
  } else if (typeof (data.expiresAt as any)?.toDate === "function") {
    expiresAtMs = (data.expiresAt as any).toDate().getTime();
  } else if (typeof (data.expiresAt as any)?._seconds === "number") {
    expiresAtMs = (data.expiresAt as any)._seconds * 1000;
  } else {
    expiresAtMs = new Date(data.expiresAt as any).getTime();
  }

  if (isNaN(expiresAtMs) || Date.now() > expiresAtMs) {
    return {
      success: false,
      error: "El código de verificación ha expirado. Solicita uno nuevo.",
    };
  }

  // Comprobar intentos máximos
  if (data.attempts >= (data.maxAttempts || MAX_ATTEMPTS)) {
    return {
      success: false,
      error: "Demasiados intentos fallidos. Solicita un nuevo código.",
    };
  }

  const candidateHash = hashOTP(candidateOtp);
  if (candidateHash !== data.codeHash) {
    await docRef.update({
      attempts: (data.attempts || 0) + 1,
    });
    return {
      success: false,
      error: "Código incorrecto. Por favor, verifica el código ingresado.",
    };
  }

  // Éxito: marcar como verificado
  await docRef.update({
    verified: true,
  });

  return {
    success: true,
  };
}
