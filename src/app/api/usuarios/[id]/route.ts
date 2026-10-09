import { NextResponse } from "next/server";
import { verifyActiveUser, AuthorizationError } from "@/lib/auth/server-auth";
import {
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
} from "@/modules/gestion-usuarios/services/server-usuarios";
import { UsuarioItem } from "@/modules/gestion-usuarios/types/usuario";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
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
    const { id } = await params;
    const usuario = await getUsuarioById(id);

    if (!usuario) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(usuario, { status: 200 });
  } catch (error: any) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error interno al obtener usuario." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
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
    const { id } = await params;
    const body = await request.json();

    const updateData: Partial<UsuarioItem> = {
      ...(body.nombre !== undefined && { nombre: body.nombre.trim() }),
      ...(body.apellidos !== undefined && { apellidos: body.apellidos.trim() }),
      ...(body.tipoDocumento !== undefined && { tipoDocumento: body.tipoDocumento }),
      ...(body.documentoIdentificacion !== undefined && {
        documentoIdentificacion: body.documentoIdentificacion.trim(),
        identificacion: body.documentoIdentificacion.trim(),
      }),
      ...(body.email !== undefined && {
        email: body.email.trim(),
        correo: body.email.trim(),
      }),
      ...(body.telefono !== undefined && { telefono: body.telefono.trim() }),
      ...(body.cargo !== undefined && { cargo: body.cargo.trim() }),
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.active !== undefined && { active: Boolean(body.active) }),
      ...(body.sedes !== undefined && { sedes: body.sedes }),
      ...(body.avatar !== undefined && { avatar: body.avatar }),
    };

    const updatedUser = await updateUsuario(id, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado para actualizar." },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar usuario." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
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
    const { id } = await params;
    const deleted = await deleteUsuario(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Usuario no encontrado para eliminar." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Usuario eliminado exitosamente." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error interno al eliminar usuario." },
      { status: 500 }
    );
  }
}
