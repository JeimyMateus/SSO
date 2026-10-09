import "server-only";
import { getApps, initializeApp, getApp, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
}

if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
}

const defaultProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-sso";

const globalForFirebase = globalThis as unknown as {
  firebaseAdminApp?: App;
  adminDb?: Firestore;
  adminAuth?: Auth;
};

export function getAdminAppForProject(projectId: string = defaultProjectId): App {
  const existingApp = getApps().find(
    (a) => a.name === projectId || (projectId === defaultProjectId && a.name === "[DEFAULT]")
  );
  if (existingApp) return existingApp;

  return initializeApp(
    { projectId },
    getApps().length === 0 ? undefined : projectId
  );
}

export function getAdminAuthForProject(projectId?: string): Auth {
  const app = getAdminAppForProject(projectId);
  return getAuth(app);
}

const app = globalForFirebase.firebaseAdminApp || getAdminAppForProject(defaultProjectId);
if (!globalForFirebase.firebaseAdminApp) {
  globalForFirebase.firebaseAdminApp = app;
}

if (!globalForFirebase.adminDb) {
  const db = getFirestore(app);
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // Evitar errores en recargas HMR
  }
  globalForFirebase.adminDb = db;
}

if (!globalForFirebase.adminAuth) {
  globalForFirebase.adminAuth = getAuth(app);
}

export const adminDb = globalForFirebase.adminDb;
export const adminAuth = globalForFirebase.adminAuth;
