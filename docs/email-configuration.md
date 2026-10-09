# Configuración del Servicio de Correo Electrónico (2FA / OTP)

Este documento detalla la arquitectura y variables de entorno para el envío de correos electrónicos y códigos de verificación OTP en los entornos de desarrollo local y producción.

---

## 1. Entorno de Desarrollo Local (Mailpit)

En local utilizamos **Mailpit** para interceptar todos los correos enviados por `nodemailer` sin enviar tráfico a internet.

### Variables en `.env.local`
```env
SMTP_HOST="127.0.0.1"
SMTP_PORT="1025"
SMTP_SECURE="false"
EMAIL_FROM="Conecta MINEDUC <no-reply@mineduc.gob.gt>"
```

### Ejecución
1. Levantar Mailpit en una terminal: `mailpit`
2. La interfaz gráfica para ver correos recibidos está disponible en: `http://localhost:8025`

---

## 2. Entorno de Producción (Cloud Run / GCP Secret Manager)

En producción, el backend utiliza el mismo `EmailService` (`src/lib/email/email-service.ts`), pero las credenciales se inyectan a través de variables de entorno seguras gestionadas por **GCP Secret Manager** en el servicio de **Cloud Run**.

### Variables de Entorno de Producción

| Variable | Descripción | Ejemplo / Proveedor |
| :--- | :--- | :--- |
| `SMTP_HOST` | Host del servidor SMTP | `smtp.gmail.com` / `smtp.resend.com` / `smtp.sendgrid.net` |
| `SMTP_PORT` | Puerto SMTP | `465` (SSL) o `587` (TLS) |
| `SMTP_SECURE` | Conexión SSL/TLS | `true` (para puerto 465) o `false` (para 587) |
| `SMTP_USER` | Usuario o API Key | `apikey` o cuenta de servicio |
| `SMTP_PASS` | Contraseña o secreto del relay | Secreto desde Secret Manager |
| `EMAIL_FROM` | Remitente verificado | `Conecta MINEDUC <no-reply@mineduc.gob.gt>` |

---

## 3. Flujo de Seguridad y 2FA

1. **Discriminación de Proveedor:**
   - Usuarios con `google.com` (SSO Google Workspace): el backend omite el 2FA local ya que Google gestiona el MFA a nivel corporativo.
   - Usuarios con `password`: se exige obligatoriamente el Custom Claim `twoFactorVerified: true` en cada request autenticado (`verifyActiveUser`).
2. **Generación de OTP:**
   - 6 dígitos numéricos aleatorios (`crypto.randomInt`).
   - Almacenado como hash SHA-256 en la colección `auth_otps` de Firestore.
   - TTL de 5 minutos.
   - Límite de 5 intentos fallidos antes de invalidar el código.
3. **Elevación de Sesión:**
   - Al verificar el código en `POST /api/auth/verify-otp`, Firebase Admin emite el custom claim `twoFactorVerified: true`.
   - El cliente refresca su ID Token mediante `auth.currentUser.getIdToken(true)` y obtiene acceso a las rutas protegidas.
