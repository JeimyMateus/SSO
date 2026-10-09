/**
 * Genera el template HTML institucional para el correo de código de verificación.
 */
export function renderOTPEmailTemplate(otp: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de verificación - Conecta MINEDUC</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #002e5f; padding: 28px 32px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">
                Conecta MINEDUC
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 600;">
                Código de verificación de inicio de sesión
              </h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Has solicitado ingresar al sistema de autenticación centralizada (SSO). Utiliza el siguiente código de 6 dígitos para completar tu verificación en dos pasos:
              </p>

              <!-- OTP Code Display -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="background-color: #f1f5f9; border-radius: 8px; border: 1px dashed #cbd5e1; padding: 20px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #002e5f; display: inline-block;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                ⏱️ <strong>Importante:</strong> Este código es válido por <strong>5 minutos</strong> y solo puede utilizarse una vez.
              </p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                Si no intentaste iniciar sesión en Conecta MINEDUC, te recomendamos cambiar tu contraseña inmediatamente o contactar a soporte técnico institucional.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © Ministerio de Educación. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
