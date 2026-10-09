import { NextResponse } from "next/server";
import { verifyActiveUser, AuthorizationError } from "@/lib/auth/server-auth";
import { getUsuarios, createUsuario } from "@/modules/gestion-usuarios/services/server-usuarios";
import { UsuarioItem } from "@/modules/gestion-usuarios/types/usuario";

export async function GET(request: Request) {
  try {
    await verifyActiveUser(request);
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
    const usuarios = await getUsuarios();
    return NextResponse.json(usuarios, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener usuarios de Firestore:", error);
    return NextResponse.json(
      { error: "Error interno al obtener usuarios." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await verifyActiveUser(request);
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

    // Validación básica de campos requeridos
    if (!body.nombre?.trim() || !body.apellidos?.trim() || !body.email?.trim() || !body.documentoIdentificacion?.trim()) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (nombre, apellidos, email, documentoIdentificacion)." },
        { status: 400 }
      );
    }

    const payload: Omit<UsuarioItem, "id"> = {
      nombre: body.nombre.trim(),
      apellidos: body.apellidos.trim(),
      tipoDocumento: body.tipoDocumento || "Cédula",
      documentoIdentificacion: body.documentoIdentificacion.trim(),
      identificacion: body.documentoIdentificacion.trim(),
      email: body.email.trim(),
      correo: body.email.trim(),
      telefono: body.telefono?.trim() || "",
      cargo: body.cargo?.trim() || "",
      estado: body.estado || "Activo",
      fechaCreacion: body.fechaCreacion || new Date().toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      sedes: Array.isArray(body.sedes) ? body.sedes : [],
      avatar: body.avatar || "",
    };

    const newUser = await createUsuario(payload);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear usuario en Firestore:", error);
    return NextResponse.json(
      { error: "Error al procesar la creación de usuario." },
      { status: 500 }
    );
  }
}
