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

export async function changeUserPasswordApi(
  usuarioId: string,
  password: string,
  requireResetNextLogin: boolean = true
): Promise<{ message: string; authUid: string; debeCambiarPassword: boolean }> {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/usuarios/${encodeURIComponent(usuarioId)}/password`, {
    method: "POST",
    headers,
    body: JSON.stringify({ password, requireResetNextLogin }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${response.status}: No se pudo actualizar la contraseña.`);
  }

  return response.json();
}

export interface AuthProfileResponse {
  uid: string;
  email: string;
  debeCambiarPassword: boolean;
  usuario?: UsuarioItem | null;
}

export async function fetchCurrentAuthProfile(): Promise<AuthProfileResponse> {
  const headers = await getAuthHeader();
  const response = await fetch("/api/auth/me", {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "No se pudo obtener el perfil de autenticación.");
  }

  return response.json();
}

export async function updateMyPasswordApi(newPassword: string): Promise<{ message: string }> {
  const headers = await getAuthHeader();
  const response = await fetch("/api/auth/change-password", {
    method: "POST",
    headers,
    body: JSON.stringify({ newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "No se pudo actualizar la contraseña.");
  }

  return response.json();
}
