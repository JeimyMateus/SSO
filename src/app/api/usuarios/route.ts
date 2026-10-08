import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getUsuarios, createUsuario } from "@/modules/gestion-usuarios/services/server-usuarios";

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }
  const token = authHeader.split("Bearer ")[1];
  return await adminAuth.verifyIdToken(token);
}

export async function GET(request: Request) {
  try {
    await verifyAuth(request);
    const usuarios = await getUsuarios();
    return NextResponse.json(usuarios);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAuth(request);
    const body = await request.json();
    const newUser = await createUsuario(body);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized or Bad Request" }, { status: 401 });
  }
}
