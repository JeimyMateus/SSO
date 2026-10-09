import "server-only";
import { adminAuth, getAdminAuthForProject } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getUsuarioByEmail } from "@/modules/gestion-usuarios/services/server-usuarios";
import type { UsuarioItem } from "@/modules/gestion-usuarios/types/usuario";

export class AuthorizationError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number = 403, code?: string) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export interface ActiveUserAuthResult {
  decodedToken: DecodedIdToken;
  usuario: UsuarioItem;
}

export async function verifyAuthToken(request: Request): Promise<DecodedIdToken> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthorizationError("No autorizado. Token inválido o ausente.", 401, "MISSING_TOKEN");
  }

  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) {
    throw new AuthorizationError("No autorizado. Token inválido o ausente.", 401, "MISSING_TOKEN");
  }

  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    // Fallback de audiencia en entorno de emulador local
    try {
      const parts = token.split(".");
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (payload.aud && typeof payload.aud === "string") {
          const projectAuth = getAdminAuthForProject(payload.aud);
          return await projectAuth.verifyIdToken(token);
        }
      }
    } catch {
      // Ignorar fallback si falla el parsing
    }
    throw new AuthorizationError("No autorizado. Token inválido o expirado.", 401, "INVALID_TOKEN");
  }
}

/**
 * Valida que la petición contenga un Firebase ID Token válido, correo verificado,
 * que el usuario exista en la colección `usuarios` de Firestore y que tenga `active === true`.
 */
export async function verifyActiveUser(request: Request): Promise<ActiveUserAuthResult> {
  const decodedToken = await verifyAuthToken(request);

  const email = decodedToken.email;
  if (!email || typeof email !== "string" || !email.trim()) {
    throw new AuthorizationError("El token no contiene un correo electrónico.", 403, "NO_EMAIL");
  }

  // En proveedores OAuth como Google se requiere que el correo esté verificado por el proveedor
  const signInProvider = decodedToken.firebase?.sign_in_provider;
  if (signInProvider === "google.com" && decodedToken.email_verified === false) {
    throw new AuthorizationError("El correo no está verificado en el proveedor de autenticación.", 403, "EMAIL_NOT_VERIFIED");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const usuario = await getUsuarioByEmail(normalizedEmail);

  if (!usuario) {
    throw new AuthorizationError("Tu usuario no está registrado en el sistema.", 403, "USER_NOT_REGISTERED");
  }

  const isActive =
    usuario.active === true ||
    (usuario.active === undefined &&
      typeof usuario.estado === "string" &&
      usuario.estado.trim().toLowerCase() === "activo");

  if (!isActive) {
    throw new AuthorizationError("Tu usuario está inactivo. Contacta con el administrador.", 403, "USER_INACTIVE");
  }

  // Verificación de doble factor para autenticación con usuario y contraseña
  if (signInProvider === "password" && !decodedToken.twoFactorVerified) {
    throw new AuthorizationError(
      "Se requiere completar la verificación en dos pasos.",
      403,
      "MFA_REQUIRED"
    );
  }

  return {
    decodedToken,
    usuario,
  };
}
