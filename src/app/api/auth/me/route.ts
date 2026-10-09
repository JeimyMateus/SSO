import { NextResponse } from "next/server";
import { verifyActiveUser, AuthorizationError } from "@/lib/auth/server-auth";

export async function GET(request: Request) {
  try {
    const { decodedToken, usuario } = await verifyActiveUser(request);

    const debeCambiarPassword =
      usuario.debeCambiarPassword !== undefined
        ? Boolean(usuario.debeCambiarPassword)
        : Boolean(decodedToken.debeCambiarPassword);

    return NextResponse.json(
      {
        uid: decodedToken.uid,
        email: decodedToken.email,
        debeCambiarPassword,
        usuario,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    console.error("Error al obtener perfil del usuario:", error);
    return NextResponse.json(
      { error: "Error interno al verificar la sesión del usuario." },
      { status: 500 }
    );
  }
}
