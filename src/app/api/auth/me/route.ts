import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth/server-auth";
import {
  getUsuarioByAuthUid,
  getUsuarioByEmail,
} from "@/modules/gestion-usuarios/services/server-usuarios";

export async function GET(request: Request) {
  let decodedToken;
  try {
    decodedToken = await verifyAuthToken(request);
  } catch (error) {
    return NextResponse.json(
      { error: "No autorizado. Token inválido o ausente." },
      { status: 401 }
    );
  }

  try {
    const email = decodedToken.email || "";
    const authUid = decodedToken.uid;

    let usuario = await getUsuarioByAuthUid(authUid);
    if (!usuario && email) {
      usuario = await getUsuarioByEmail(email);
    }

    const debeCambiarPassword =
      usuario?.debeCambiarPassword !== undefined
        ? Boolean(usuario.debeCambiarPassword)
        : Boolean(decodedToken.debeCambiarPassword);

    return NextResponse.json(
      {
        uid: authUid,
        email,
        debeCambiarPassword,
        usuario,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al obtener perfil del usuario:", error);
    return NextResponse.json(
      { error: "Error al obtener perfil del usuario." },
      { status: 500 }
    );
  }
}
