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
