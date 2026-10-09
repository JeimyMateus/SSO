import "server-only";
import { adminDb } from "@/lib/firebase/admin";
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

export async function createUsuario(data: Omit<UsuarioItem, "id">): Promise<UsuarioItem> {
  const now = Timestamp.now().toMillis();
  const usuarioToSave = {
    ...data,
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

  await docRef.delete();
  return true;
}
