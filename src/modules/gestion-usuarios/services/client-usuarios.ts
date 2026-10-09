import { auth } from "@/lib/firebase/client";
import { UsuarioItem } from "../types/usuario";

async function getAuthHeader(): Promise<HeadersInit> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No hay un usuario autenticado en la sesión.");
  }
  const token = await currentUser.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchUsuarios(): Promise<UsuarioItem[]> {
  const headers = await getAuthHeader();
  const response = await fetch("/api/usuarios", {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: No se pudieron obtener los usuarios.`);
  }

  return response.json();
}

export async function fetchUsuarioById(id: string): Promise<UsuarioItem> {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/usuarios/${encodeURIComponent(id)}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: No se pudo obtener el usuario.`);
  }

  return response.json();
}

export async function createUsuarioApi(data: Omit<UsuarioItem, "id">): Promise<UsuarioItem> {
  const headers = await getAuthHeader();
  const response = await fetch("/api/usuarios", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: No se pudo crear el usuario.`);
  }

  return response.json();
}

export async function updateUsuarioApi(id: string, data: Partial<UsuarioItem>): Promise<UsuarioItem> {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/usuarios/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: No se pudo actualizar el usuario.`);
  }

  return response.json();
}

export async function deleteUsuarioApi(id: string): Promise<void> {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/usuarios/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: No se pudo eliminar el usuario.`);
  }
}
