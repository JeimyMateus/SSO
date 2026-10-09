import { NextResponse } from "next/server";
import { verifyAuthToken, AuthorizationError } from "@/lib/auth/server-auth";
import { createAndSaveOTP } from "@/lib/auth/otp-service";
import { sendOTPEmail } from "@/lib/email/email-service";

export async function POST(request: Request) {
  let decodedToken;
  try {
    decodedToken = await verifyAuthToken(request);
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "No autorizado. Token inválido o ausente." },
      { status: 401 }
    );
  }

  const email = decodedToken.email;
  if (!email || typeof email !== "string" || !email.trim()) {
    return NextResponse.json(
      { error: "No se encontró un correo electrónico válido en la sesión." },
      { status: 400 }
    );
  }

  try {
    // 1. Generar y guardar el OTP en Firestore
    const { otp } = await createAndSaveOTP(email);

    // 2. Enviar el correo con la plantilla institucional
    await sendOTPEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: "Código de verificación enviado correctamente.",
    });
  } catch (error: any) {
    console.error("Error al enviar OTP:", error);
    return NextResponse.json(
      { error: "Error al generar o enviar el código de verificación." },
      { status: 500 }
    );
  }
}
