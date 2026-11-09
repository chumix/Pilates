# Pilates Ángela

Migración del prototipo original a Vite + React + TypeScript, conservando la interfaz y funcionamiento. Añade autenticación Google y persistencia en una hoja de cálculo privada del Drive de cada usuario.

## Requisitos
- Node.js 20 LTS o posterior
- Proyecto de Google Cloud
- Google Drive API y Google Sheets API activadas
- OAuth 2.0 Client ID de tipo Web application

## Google Cloud
1. En Google Auth Platform configura Branding, Audience y Data Access.
2. Durante pruebas añade las cuentas en Test users.
3. Crea un cliente OAuth de tipo Web application.
4. Añade `http://localhost:5173` en Authorized JavaScript origins.
5. Para producción añade el origen real, por ejemplo `https://usuario.github.io` o tu dominio.
6. No pongas el Client Secret en este repositorio.

Scopes usados:
- `openid email profile`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/spreadsheets`

## Desarrollo
```bash
cp .env.example .env.local
# Edita .env.local y asigna VITE_GOOGLE_CLIENT_ID
npm install
npm run dev
```

## Producción
```bash
npm run build
npm run preview
```
El resultado queda en `dist/`. `base: "./"` permite publicarlo en GitHub Pages. Para datos de salud se recomienda Firebase Hosting o Cloudflare Pages con dominio propio, política de privacidad, control de acceso y revisión RGPD.

## Datos
La app busca en Drive un archivo con `appProperties.appId = pilates-angela`. Si no existe, crea `Pilates Ángela - Datos` con pestañas Config, Students, Exercises, Templates, Slots y Attendance. Los cambios se agrupan durante 1,2 segundos antes de sincronizarse.

## Limitaciones importantes
- Google Sheets sirve para una primera versión con un único propietario, no para concurrencia multiusuario intensiva.
- El token OAuth vive solo en memoria y se pierde al recargar, por lo que se vuelve a pedir autorización.
- Antes de producción añade pruebas, política de privacidad, exportación/borrado, auditoría y una estrategia de conflictos/offline.

## Versionado
La versión visible en la aplicación y el histórico se mantienen en `src/appInfo.ts`. El historial público está en `CHANGELOG.md`. La versión de esta entrega es `2.1.0` y el tag recomendado es `v2.1.0`.

## Pilario 2.2.0 y acceso beta
Configura `VITE_BETA_FORM_URL` con el enlace público de un Google Form. Mantén Google Auth Platform en estado Testing y añade manualmente en Audience > Test users los correos aprobados. Si no se configura el formulario, el botón Solicitar acceso abre un correo para chumix@gmail.com.

La aplicación intenta reconectar después de una recarga. Por las restricciones de OAuth en aplicaciones estáticas, Google puede volver a pedir interacción en algunos navegadores o cuando el token haya expirado.
