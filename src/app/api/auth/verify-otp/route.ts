import { NextResponse } from "next/server";
import { verifyAuthToken, AuthorizationError } from "@/lib/auth/server-auth";
import { verifyOTP } from "@/lib/auth/otp-service";
import { adminAuth, getAdminAuthForProject } from "@/lib/firebase/admin";

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

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de solicitud inválido." },
      { status: 400 }
    );
  }

  const code = body?.code;
  if (!code || typeof code !== "string" || code.trim().length !== 6) {
    return NextResponse.json(
      { error: "El código de verificación debe contener 6 dígitos." },
      { status: 400 }
    );
  }

  try {
    // 1. Validar el OTP contra Firestore
    const verification = await verifyOTP(email, code);
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || "Código de verificación inválido." },
        { status: 400 }
      );
    }

    // 2. Resolver la instancia de Auth correspondiente al proyecto del token
    const authInstance = decodedToken.aud
      ? getAdminAuthForProject(decodedToken.aud)
      : adminAuth;

    // 3. Marcar correo verificado en Firebase Auth y emitir custom claim `twoFactorVerified: true`
    try {
      await authInstance.updateUser(decodedToken.uid, { emailVerified: true });
    } catch {
      // Ignorar si el emulador no soporta updateUser en esa instancia
    }

    await authInstance.setCustomUserClaims(decodedToken.uid, {
      twoFactorVerified: true,
    });

    return NextResponse.json({
      success: true,
      message: "Código verificado correctamente.",
    });
  } catch (error: any) {
    console.error("Error al verificar OTP:", error);
    return NextResponse.json(
      { error: error.message || "Error interno al verificar el código." },
      { status: 500 }
    );
  }
}
