import { NextResponse } from "next/server";
import { verifyActiveUser, AuthorizationError } from "@/lib/auth/server-auth";
import { updateOwnPassword } from "@/modules/gestion-usuarios/services/server-usuarios";

export async function POST(request: Request) {
  let decodedToken;
  try {
    const authResult = await verifyActiveUser(request);
    decodedToken = authResult.decodedToken;
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

  try {
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    await updateOwnPassword(decodedToken.uid, newPassword, decodedToken.email);

    return NextResponse.json(
      { message: "Contraseña actualizada exitosamente." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar la contraseña propia:", error);
    return NextResponse.json(
      { error: error.message || "Error al actualizar la contraseña." },
      { status: 500 }
    );
  }
}
