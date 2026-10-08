import { adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

export interface UsuarioDummy {
  id?: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  createdAt?: number;
}

const COLLECTION_NAME = "usuarios_dummy";

export async function getUsuarios(): Promise<UsuarioDummy[]> {
  const snapshot = await adminDb.collection(COLLECTION_NAME).orderBy("createdAt", "desc").get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as UsuarioDummy));
}

export async function createUsuario(data: Omit<UsuarioDummy, "id">): Promise<UsuarioDummy> {
  const docRef = await adminDb.collection(COLLECTION_NAME).add({
    ...data,
    createdAt: Timestamp.now().toMillis()
  });

  return { id: docRef.id, ...data };
}

export async function updateUsuario(id: string, data: Partial<UsuarioDummy>): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(id).update(data);
}

export async function deleteUsuario(id: string): Promise<void> {
  await adminDb.collection(COLLECTION_NAME).doc(id).delete();
}
