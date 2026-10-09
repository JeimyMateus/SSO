// Script de verificación automatizada del CRUD y seguridad para la Fase 2
import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

async function runTests() {
  console.log("=================================================");
  console.log("  INICIANDO VALIDACIÓN FASE 2: FIRESTORE + CRUD   ");
  console.log("=================================================");
  console.log(`Proyecto configurado: ${projectId}`);
  console.log(`Auth Emulator: ${authEmulatorHost}`);

  // 1. Verificación de Seguridad: GET sin token
  console.log("\n[1/7] Probando GET /api/usuarios sin autenticación...");
  const resNoAuth = await fetch(`http://localhost:${NEXT_PORT}/api/usuarios`, {
    method: "GET",
  });
  console.log(`-> Status recibido: ${resNoAuth.status} (Esperado: 401)`);
  const noAuthData = await resNoAuth.json();
  console.log("-> Mensaje:", noAuthData.error);
  if (resNoAuth.status !== 401) {
    throw new Error("Fallo de seguridad: la ruta no rechazó la petición sin token");
  }

  // 2. Autenticación con Firebase Auth Client SDK
  console.log("\n[2/7] Autenticando usuario con Firebase Auth Client SDK...");
  let userCredential;
  const testEmail = "usuario.sso.test@mineduc.gob.ec";
  const testPassword = "Password123!";

  try {
    userCredential = await createUserWithEmailAndPassword(clientAuth, testEmail, testPassword);
  } catch (err) {
    userCredential = await signInWithEmailAndPassword(clientAuth, testEmail, testPassword);
  }

  const idToken = await userCredential.user.getIdToken();
  console.log(`-> ID Token obtenido para: ${userCredential.user.email}`);

  // 3. Crear Usuario (POST /api/usuarios)
  console.log("\n[3/7] Creando nuevo usuario en Firestore vía POST /api/usuarios...");
  const nuevoUsuario = {
    nombre: "Lorena Alexandra",
    apellidos: "Paredes Salazar",
    tipoDocumento: "Cédula",
    documentoIdentificacion: "1723456789",
    email: "lorena.paredes@educacion.gob.ec",
    telefono: "0987654321",
    cargo: "Administradora Zonal de Sistemas",
    estado: "Activo",
    sedes: [
      {
        sedeId: "sede-cz9",
        sedeNombre: "Coordinación Zonal 9",
        asignaciones: [
          {
            id: `asig-${Date.now()}`,
            usuarioId: "",
            sedeId: "sede-cz9",
            sedeNombre: "Coordinación Zonal 9",
            rolAplicacionId: "ra-sso-gz",
            aplicacionNombre: "SSO",
            rolNombre: "Gestor Zonal de Usuarios",
            estado: "Activo",
            permisos: [],
          },
        ],
      },
    ],
  };

  const createRes = await fetch(`http://localhost:${NEXT_PORT}/api/usuarios`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(nuevoUsuario),
  });

  console.log(`-> Status creación: ${createRes.status} (Esperado: 201)`);
  const createdData = await createRes.json();
  console.log("-> Usuario creado en Firestore ID:", createdData.id);
  if (createRes.status !== 201 || !createdData.id) {
    throw new Error(`Fallo al crear usuario: ${JSON.stringify(createdData)}`);
  }

  const createdId = createdData.id;

  // 4. Listar Usuarios (GET /api/usuarios)
  console.log("\n[4/7] Listando usuarios vía GET /api/usuarios...");
  const listRes = await fetch(`http://localhost:${NEXT_PORT}/api/usuarios`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  console.log(`-> Status listado: ${listRes.status} (Esperado: 200)`);
  const listData = await listRes.json();
  console.log(`-> Total usuarios recuperados de Firestore: ${listData.length}`);
  const userInList = listData.find((u) => u.id === createdId);
  if (!userInList) {
    throw new Error("El usuario creado no fue encontrado en la lista de Firestore.");
  }
  console.log(`-> Usuario verificado en lista: ${userInList.nombre} ${userInList.apellidos} (${userInList.email})`);

  // 5. Obtener por ID (GET /api/usuarios/[id])
  console.log(`\n[5/7] Obteniendo usuario individual vía GET /api/usuarios/${createdId}...`);
  const getRes = await fetch(`http://localhost:${NEXT_PORT}/api/usuarios/${createdId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  console.log(`-> Status getById: ${getRes.status} (Esperado: 200)`);
  const singleUser = await getRes.json();
  console.log(`-> Datos obtenidos: ${singleUser.nombre} - Cargo: ${singleUser.cargo}`);

  // 6. Actualizar Usuario (PUT /api/usuarios/[id])
  console.log(`\n[6/7] Actualizando usuario vía PUT /api/usuarios/${createdId}...`);
  const updateRes = await fetch(`http://localhost:${NEXT_PORT}/api/usuarios/${createdId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      cargo: "Directora Nacional de Seguridad y Control",
      estado: "Inactivo",
    }),
  });

  console.log(`-> Status actualización: ${updateRes.status} (Esperado: 200)`);
  const updatedData = await updateRes.json();
  console.log(`-> Datos actualizados: Cargo='${updatedData.cargo}', Estado='${updatedData.estado}'`);
  if (updatedData.estado !== "Inactivo" || updatedData.cargo !== "Directora Nacional de Seguridad y Control") {
    throw new Error("Los campos actualizados no coinciden con la respuesta.");
  }

  // 7. Eliminar Usuario (DELETE /api/usuarios/[id])
  console.log(`\n[7/7] Eliminando usuario vía DELETE /api/usuarios/${createdId}...`);
  const deleteRes = await fetch(`http://localhost:${NEXT_PORT}/api/usuarios/${createdId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  console.log(`-> Status eliminación: ${deleteRes.status} (Esperado: 200)`);
  const deleteResult = await deleteRes.json();
  console.log("-> Mensaje:", deleteResult.message);

  // Verificación final de 404 post-delete
  const verifyDeleteRes = await fetch(`http://localhost:${NEXT_PORT}/api/usuarios/${createdId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  console.log(`-> Verificación post-delete status: ${verifyDeleteRes.status} (Esperado: 404)`);
  if (verifyDeleteRes.status !== 404) {
    throw new Error("El usuario no fue eliminado correctamente de Firestore.");
  }

  console.log("\n=================================================");
  console.log("  ¡TODAS LAS PRUEBAS CRUD Y DE SEGURIDAD PASARON! ");
  console.log("=================================================");
}

runTests().catch((err) => {
  console.error("\n❌ ERROR EN PRUEBAS:", err.message);
  process.exit(1);
});
