import "server-only";
import { adminDb, adminAuth } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";
import { UsuarioItem } from "../types/usuario";

const COLLECTION_NAME = "usuarios";

export async function getUsuarios(): Promise<UsuarioItem[]> {
  const snapshot = await adminDb.collection(COLLECTION_NAME).get();
  
  const usuarios = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    } as UsuarioItem;
  });

  // Ordenar por fecha de creación o timestamp descendente
  return usuarios.sort((a, b) => {
    const timeA = a.createdAt || 0;
    const timeB = b.createdAt || 0;
    return timeB - timeA;
  });
}

export async function getUsuarioById(id: string): Promise<UsuarioItem | null> {
  const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as UsuarioItem;
}

export async function getUsuarioByEmail(email: string): Promise<UsuarioItem | null> {
  const querySnap = await adminDb
    .collection(COLLECTION_NAME)
    .where("email", "==", email.trim().toLowerCase())
    .limit(1)
    .get();

  if (querySnap.empty) {
    // Probar búsqueda por identificador exacto si no vino en minúscula
    const fallbackSnap = await adminDb
      .collection(COLLECTION_NAME)
      .where("email", "==", email.trim())
      .limit(1)
      .get();
    if (fallbackSnap.empty) return null;
    return { id: fallbackSnap.docs[0].id, ...fallbackSnap.docs[0].data() } as UsuarioItem;
  }

  return {
    id: querySnap.docs[0].id,
    ...querySnap.docs[0].data(),
  } as UsuarioItem;
}

export async function getUsuarioByAuthUid(authUid: string): Promise<UsuarioItem | null> {
  const querySnap = await adminDb
    .collection(COLLECTION_NAME)
    .where("authUid", "==", authUid)
    .limit(1)
    .get();

  if (querySnap.empty) {
    return null;
  }

  return {
    id: querySnap.docs[0].id,
    ...querySnap.docs[0].data(),
  } as UsuarioItem;
}

export async function createUsuario(data: Omit<UsuarioItem, "id">): Promise<UsuarioItem> {
  const now = Timestamp.now().toMillis();
  const usuarioToSave = {
    ...data,
    email: data.email.trim().toLowerCase(),
    correo: data.email.trim().toLowerCase(),
    createdAt: data.createdAt || now,
    updatedAt: now,
  };

  const docRef = await adminDb.collection(COLLECTION_NAME).add(usuarioToSave);

  return {
    id: docRef.id,
    ...usuarioToSave,
  };
}

export async function updateUsuario(id: string, data: Partial<UsuarioItem>): Promise<UsuarioItem | null> {
  const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return null;
  }

  const updateData = {
    ...data,
    ...(data.email && {
      email: data.email.trim().toLowerCase(),
      correo: data.email.trim().toLowerCase(),
    }),
    updatedAt: Timestamp.now().toMillis(),
  };

  // Evitar sobreescribir el ID dentro del data si viene presente
  delete (updateData as any).id;

  await docRef.update(updateData);

  const updatedSnap = await docRef.get();
  return {
    id: updatedSnap.id,
    ...updatedSnap.data(),
  } as UsuarioItem;
}

export async function deleteUsuario(id: string): Promise<boolean> {
  const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    return false;
  }

  const userData = docSnap.data() as UsuarioItem;
  if (userData.authUid) {
    try {
      await adminAuth.deleteUser(userData.authUid);
    } catch {
      // Ignorar si el usuario ya no existía en Auth
    }
  }

  await docRef.delete();
  return true;
}

/**
 * Asigna o actualiza la contraseña de un usuario en Firebase Authentication
 * y actualiza el documento de Firestore con el UID y la bandera de forzar cambio de contraseña.
 */
export async function setUserPassword(
  usuarioId: string,
  newPassword: string,
  requireResetNextLogin: boolean = true
): Promise<{ authUid: string; usuario: UsuarioItem }> {
  const usuario = await getUsuarioById(usuarioId);
  if (!usuario) {
    throw new Error("Usuario no encontrado en Firestore.");
  }

  let authUid = usuario.authUid;

  if (authUid) {
    try {
      await adminAuth.updateUser(authUid, {
        password: newPassword,
        email: usuario.email,
        displayName: `${usuario.nombre} ${usuario.apellidos}`.trim(),
      });
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        authUid = undefined;
      } else {
        throw err;
      }
    }
  }

  if (!authUid) {
    try {
      // Verificar si ya existe por email en Auth
      const existingUser = await adminAuth.getUserByEmail(usuario.email);
      authUid = existingUser.uid;
      await adminAuth.updateUser(authUid, {
        password: newPassword,
        displayName: `${usuario.nombre} ${usuario.apellidos}`.trim(),
      });
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        // Crear usuario nuevo en Auth
        const createdUser = await adminAuth.createUser({
          email: usuario.email,
          password: newPassword,
          displayName: `${usuario.nombre} ${usuario.apellidos}`.trim(),
        });
        authUid = createdUser.uid;
      } else {
        throw err;
      }
    }
  }

  // Configurar Custom Claims en el token de Auth
  await adminAuth.setCustomUserClaims(authUid, {
    debeCambiarPassword: requireResetNextLogin,
  });

  // Actualizar estado en Firestore
  const updatedUser = await updateUsuario(usuarioId, {
    authUid,
    debeCambiarPassword: requireResetNextLogin,
  });

  return {
    authUid,
    usuario: updatedUser!,
  };
}

/**
 * Actualiza la contraseña del usuario actualmente autenticado y marca debeCambiarPassword = false
 */
export async function updateOwnPassword(
  authUid: string,
  newPassword: string,
  email?: string
): Promise<void> {
  await adminAuth.updateUser(authUid, { password: newPassword });
  await adminAuth.setCustomUserClaims(authUid, { debeCambiarPassword: false });

  // Actualizar Firestore si existe el documento vinculado
  let user = await getUsuarioByAuthUid(authUid);
  if (!user && email) {
    user = await getUsuarioByEmail(email);
  }
  if (user) {
    await updateUsuario(user.id, { authUid, debeCambiarPassword: false });
  }
}
