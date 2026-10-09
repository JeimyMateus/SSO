# Guía del Emulador Local de Firebase (Firebase Emulator Suite)

Este documento describe la configuración, ejecución y variables del emulador local de Firebase utilizado para el desarrollo y pruebas locales de la aplicación SSO.

---

## 1. Servicios y Puertos del Emulador

El proyecto utiliza el emulador de **Firebase Auth** y **Cloud Firestore** bajo el ID de proyecto `demo-sso` (lo que garantiza que ninguna operación local toque servicios reales en la nube).

| Servicio | Puerto | Descripción |
| :--- | :--- | :--- |
| **Firestore Emulator** | `8080` | Base de datos de documentos local (`usuarios`, `auth_otps`, etc.) |
| **Auth Emulator** | `9099` | Autenticación local con soporte para Email/Password y Google OAuth |
| **Emulator UI** | `4000` | Panel visual web para inspeccionar Firestore y usuarios de Auth |

---

## 2. Variables de Entorno Requeridas (`.env.local`)

```env
# Configuración Local para Firebase Emulators (Proyecto demo-*)
NEXT_PUBLIC_FIREBASE_PROJECT_ID="demo-sso"
NEXT_PUBLIC_FIREBASE_API_KEY="demo-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="demo-sso.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"

# Variables para Firebase Admin SDK en servidor
FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"
FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
```

---

## 3. Comandos de Ejecución

### Iniciar los emuladores:
```bash
npm run emulators
# o directamente:
firebase emulators:start --project demo-sso
```

### Iniciar con persistencia de datos (opcional):
```bash
firebase emulators:start --project demo-sso --import=./emulator-data --export-on-exit
```

---

## 4. Scripts de Inicialización / Seed

En la carpeta `scratch/` se encuentran scripts Node.js para poblar datos de prueba en los emuladores:

- **Crear / Poblar usuario de prueba:**
  ```bash
  node scratch/seed-user.mjs
  ```
- **Inspeccionar usuarios en Firestore:**
  ```bash
  node scratch/check-user.mjs
  ```
- **Probar envío de correos a Mailpit:**
  ```bash
  node scratch/test-email.mjs
  ```

---

## 5. Panel de Control (Emulator UI)

Una vez iniciado el emulador, podés acceder a la interfaz web en:
👉 **http://localhost:4000** para ver colecciones de Firestore, editar documentos y administrar usuarios de Firebase Auth.
