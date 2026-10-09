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

async function handleApiResponse<T>(response: Response, defaultError: string): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error || `${defaultError} (HTTP ${response.status})`;
    
    // Si la petición es rechazada por inactividad o token inválido, cerrar la sesión local
    if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
      try {
        const { signOut } = await import("firebase/auth");
        await signOut(auth).catch(() => {});
      } catch {
        // Ignorar
      }
    }

    throw new Error(message);
  }
  return response.json();
}

export async function fetchUsuarios(): Promise<UsuarioItem[]> {
  const headers = await getAuthHeader();
  const response = await fetch("/api/usuarios", {
    method: "GET",
    headers,
  });

  return handleApiResponse<UsuarioItem[]>(response, "No se pudieron obtener los usuarios.");
}

export async function fetchUsuarioById(id: string): Promise<UsuarioItem> {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/usuarios/${encodeURIComponent(id)}`, {
    method: "GET",
    headers,
  });

  return handleApiResponse<UsuarioItem>(response, "No se pudo obtener el usuario.");
}

export async function createUsuarioApi(data: Omit<UsuarioItem, "id">): Promise<UsuarioItem> {
  const headers = await getAuthHeader();
  const response = await fetch("/api/usuarios", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  return handleApiResponse<UsuarioItem>(response, "No se pudo crear el usuario.");
}

export async function updateUsuarioApi(id: string, data: Partial<UsuarioItem>): Promise<UsuarioItem> {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/usuarios/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  return handleApiResponse<UsuarioItem>(response, "No se pudo actualizar el usuario.");
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

  return handleApiResponse<{ message: string; authUid: string; debeCambiarPassword: boolean }>(
    response,
    "No se pudo actualizar la contraseña."
  );
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

  return handleApiResponse<{ message: string }>(response, "No se pudo actualizar la contraseña.");
}
