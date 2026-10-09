import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth/server-auth";
import { setUserPassword } from "@/modules/gestion-usuarios/services/server-usuarios";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    await verifyAuthToken(request);
  } catch (error) {
    return NextResponse.json(
      { error: "No autorizado. Token inválido o ausente." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const { password, requireResetNextLogin = true } = body;

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 }
      );
    }

    const result = await setUserPassword(id, password, requireResetNextLogin);

    return NextResponse.json(
      {
        message: "Contraseña asignada exitosamente en Firebase Authentication.",
        usuarioId: result.usuario.id,
        authUid: result.authUid,
        debeCambiarPassword: result.usuario.debeCambiarPassword,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al asignar contraseña:", error);
    return NextResponse.json(
      { error: error.message || "Error al asignar contraseña en Firebase Auth." },
      { status: 500 }
    );
  }
}
