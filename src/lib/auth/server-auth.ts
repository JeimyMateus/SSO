import "server-only";
import { adminAuth, getAdminAuthForProject } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export async function verifyAuthToken(request: Request): Promise<DecodedIdToken> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) {
    throw new Error("Missing token");
  }

  try {
    return await adminAuth.verifyIdToken(token);
  } catch (err: any) {
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
    throw err;
  }
}
