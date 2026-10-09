// Script de validación automatizada de gestión de contraseñas y flujo de login
import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const NEXT_PORT = 3000;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-sso";
const authEmulatorHost = "http://127.0.0.1:9099";

const firebaseConfig = {
  projectId,
  apiKey: "demo-api-key",
  authDomain: `${projectId}.firebaseapp.com`,
};

const app = initializeApp(firebaseConfig);
const clientAuth = getAuth(app);
connectAuthEmulator(clientAuth, authEmulatorHost, { disableWarnings: true });

async function runTest() {
  console.log("=============================================================");
  console.log("  TEST: GESTIÓN DE CONTRASEÑAS E INICIO DE SESIÓN FIREBASE   ");
  console.log("=============================================================");

  // 1. Admin login
  console.log("\n[1/6] Autenticando Administrador...");
  let adminCred;
  try {
    adminCred = await createUserWithEmailAndPassword(clientAuth, "admin.general@educacion.gob.ec", "AdminPassword123!");
  } catch {
    adminCred = await signInWithEmailAndPassword(clientAuth, "admin.general@educacion.gob.ec", "AdminPassword123!");
  }
  const adminToken = await adminCred.user.getIdToken();
  console.log("-> Admin autenticado exitosamente.");

  // 2. Crear usuario nuevo en Firestore
  console.log("\n[2/6] Creando nuevo usuario en Firestore vía POST /api/usuarios...");
  const testUserEmail = `docente.test.${Date.now()}@educacion.gob.ec`;
  const createRes = await fetch(`http://localhost:${NEXT_PORT}/api/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      nombre: "Esteban",
      apellidos: "Navarro Cárdenas",
      tipoDocumento: "Cédula",
      documentoIdentificacion: "1799887766",
      email: testUserEmail,
      estado: "Activo",
      sedes: [],
    }),
  });

  const createdUser = await createRes.json();
  console.log("-> Usuario creado en Firestore con ID:", createdUser.id);
  const usuarioId = createdUser.id;

  // 3. Admin asigna contraseña temporal con cambio forzado
  console.log("\n[3/6] Asignando contraseña temporal con 'requireResetNextLogin: true' vía POST /api/usuarios/[id]/password...");
  const tempPassword = "TemporalPassword2026!";
  const setPassRes = await fetch(`http://localhost:${NEXT_PORT}/api/usuarios/${usuarioId}/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      password: tempPassword,
      requireResetNextLogin: true,
    }),
  });

  console.log(`-> Status asignación: ${setPassRes.status} (Esperado: 200)`);
  const setPassData = await setPassRes.json();
  console.log("-> Respuesta:", setPassData.message);
  console.log("-> Debe cambiar contraseña:", setPassData.debeCambiarPassword);

  // Desconectar admin
  await signOut(clientAuth);

  // 4. Usuario inicia sesión con la clave temporal
  console.log("\n[4/6] Usuario inicia sesión con clave temporal mediante signInWithEmailAndPassword...");
  const userCred = await signInWithEmailAndPassword(clientAuth, testUserEmail, tempPassword);
  const userToken = await userCred.user.getIdToken();
  console.log("-> Inicio de sesión exitoso. ID Token obtenido.");

  // Consultar perfil GET /api/auth/me
  const meRes = await fetch(`http://localhost:${NEXT_PORT}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });
  const profile = await meRes.json();
  console.log("-> Perfil /api/auth/me:", profile.email);
  console.log("-> ¿Debe cambiar contraseña?:", profile.debeCambiarPassword);

  if (!profile.debeCambiarPassword) {
    throw new Error("Fallo: Se esperaba que debeCambiarPassword fuera true.");
  }

  // 5. Usuario cambia su contraseña obligatoria vía POST /api/auth/change-password
  console.log("\n[5/6] Usuario establece nueva contraseña definitiva vía POST /api/auth/change-password...");
  const definitivePassword = "DefinitivaSegura2026#";
  const changeRes = await fetch(`http://localhost:${NEXT_PORT}/api/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      newPassword: definitivePassword,
    }),
  });
  console.log(`-> Status cambio: ${changeRes.status} (Esperado: 200)`);
  const changeData = await changeRes.json();
  console.log("-> Respuesta:", changeData.message);

  // Re-consultar perfil (obteniendo token refrescado)
  const refreshedUserToken = await userCred.user.getIdToken(true);
  const meRes2 = await fetch(`http://localhost:${NEXT_PORT}/api/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${refreshedUserToken}`,
    },
  });
  console.log(`-> Status meRes2: ${meRes2.status}`);
  const profile2 = await meRes2.json();
  console.log("-> profile2 data:", profile2);
  console.log("-> ¿Debe cambiar contraseña tras actualización?:", profile2.debeCambiarPassword);
  if (profile2.debeCambiarPassword !== false) {
    throw new Error("Fallo: debeCambiarPassword no se desactivó tras cambiar la clave.");
  }

  // Desconectar
  await signOut(clientAuth);

  // 6. Probar inicio de sesión con la clave definitiva
  console.log("\n[6/6] Verificando inicio de sesión con la nueva contraseña definitiva...");
  const finalCred = await signInWithEmailAndPassword(clientAuth, testUserEmail, definitivePassword);
  console.log("-> ¡Inicio de sesión con nueva contraseña 100% exitoso! UID:", finalCred.user.uid);

  console.log("\n=============================================================");
  console.log("  ¡TODO EL FLUJO DE CONTRASEÑAS Y AUTH FUNCIONA PERFECTO!   ");
  console.log("=============================================================");
}

runTest().catch((err) => {
  console.error("\n❌ ERROR EN EL TEST:", err);
  process.exit(1);
});
