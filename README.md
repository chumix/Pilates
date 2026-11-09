# Pilario

**Gestión sencilla para profesionales de Pilates**

Pilario es una aplicación web para organizar alumnos, ejercicios, clases, calendario y asistencia. Cada profesional puede personalizar el nombre del estudio, el nombre del instructor, los colores y el logotipo. Los datos se guardan en una hoja privada de Google Sheets dentro del Google Drive de cada usuario.

> Estado actual: **Beta privada**  
> Versión: **2.2.1**  
> Aplicación: https://chumix.github.io/Pilates/

## Funcionalidades

- Gestión de alumnos y fichas de seguimiento.
- Catálogo de ejercicios.
- Plantillas y planificación de clases.
- Calendario semanal.
- Registro de asistencia.
- Personalización del estudio:
  - nombre del instructor o instructora;
  - nombre del estudio;
  - colores principales;
  - logotipo personalizado.
- Inicio de sesión con Google.
- Sincronización con Google Drive y Google Sheets.
- Sincronización manual desde Ajustes.
- Acceso directo a la hoja de datos.
- Histórico de versiones dentro de la aplicación.

## Acceso a la beta

Pilario está configurada actualmente como una beta privada mediante Google Auth Platform.

Solo pueden acceder las cuentas incluidas en:

`Google Auth Platform > Audience > Test users`

El botón **Solicitar acceso** puede dirigir a un Google Form. El enlace se configura mediante `VITE_BETA_FORM_URL`.

## Tecnologías

- Vite
- React
- TypeScript
- Google Identity Services
- Google Drive API
- Google Sheets API
- GitHub Actions
- GitHub Pages

## Estructura principal

- `src/AppShell.tsx`: acceso con Google, conexión, desconexión y sincronización.
- `src/legacy/LegacyApp.tsx`: interfaz y funcionalidades principales.
- `src/google/sheetsRepository.ts`: lectura y escritura en Google Drive y Google Sheets.
- `src/auth/googleIdentity.ts`: autorización mediante Google Identity Services.
- `src/appInfo.ts`: versión, marca e histórico de cambios.
- `src/styles.css`: estilos visuales.
- `public/`: logotipo, manifest y service worker.
- `.github/workflows/deploy.yml`: compilación y publicación automática en GitHub Pages.

## Requisitos de desarrollo

- Node.js 20 LTS o posterior.
- npm.
- Un proyecto de Google Cloud.
- Google Drive API habilitada.
- Google Sheets API habilitada.
- Un OAuth 2.0 Client ID de tipo **Web application**.

## Configuración local

1. Clona el repositorio.
2. Crea `.env.local` a partir de `.env.example`.
3. Añade el OAuth Client ID y, opcionalmente, el enlace al formulario de acceso.

Contenido esperado de `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=TU_CLIENT_ID.apps.googleusercontent.com
VITE_BETA_FORM_URL=https://forms.gle/TU_FORMULARIO
```

No añadas un Client Secret, access token, refresh token ni credenciales de cuenta de servicio al frontend.

## Ejecutar en desarrollo

En Windows PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

Abre:

`http://localhost:5173/Pilates/`

Si se utiliza el Node.js portátil incluido únicamente en el entorno local:

```powershell
$env:Path = "$PWD\.tools\node;$env:Path"
npm.cmd run dev
```

La carpeta `.tools` no debe formar parte del repositorio.

## Compilar y comprobar

```powershell
npm.cmd run build
npm.cmd run preview
```

- `npm.cmd run build` comprueba TypeScript y genera la versión final en `dist/`.
- `npm.cmd run preview` permite revisar localmente la versión compilada.
- `dist/` es un resultado generado y no debe editarse ni subirse manualmente.

## Configuración de Google Cloud

En Google Auth Platform:

1. Configura Branding, Audience y Data Access.
2. Mantén la aplicación en estado **Testing** durante la beta.
3. Añade las cuentas autorizadas en **Test users**.
4. Crea un cliente OAuth de tipo **Web application**.
5. Añade estos orígenes JavaScript autorizados:
   - `http://localhost:5173`
   - `https://chumix.github.io`

Permisos utilizados:

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/spreadsheets`

## Datos y sincronización

Pilario localiza el archivo mediante una propiedad interna de Google Drive. El archivo se llama:

`Pilario - Datos`

Si encuentra un archivo anterior de la aplicación, lo renombra sin eliminar sus datos.

Las pestañas principales son:

- `Config`
- `Students`
- `Exercises`
- `Templates`
- `Slots`
- `Attendance`

La pestaña `Config` también guarda la personalización del estudio.

La aplicación conserva una copia local para mejorar la disponibilidad. Google Sheets sigue siendo la fuente persistente de datos del usuario.

## Publicación

Los cambios enviados a la rama `main` activan `.github/workflows/deploy.yml`.

El proceso de GitHub Actions:

1. instala las dependencias;
2. comprueba TypeScript;
3. compila con Vite;
4. publica `dist/` en GitHub Pages.

Aplicación publicada:

https://chumix.github.io/Pilates/

## Versionado

Pilario utiliza versionado semántico:

- `MAJOR`: cambios incompatibles.
- `MINOR`: funcionalidades nuevas compatibles.
- `PATCH`: correcciones compatibles.

La versión actual es `2.2.1`.

La información de versión se mantiene en:

- `src/appInfo.ts`
- `CHANGELOG.md`
- `RELEASE_NOTES_*.md`

Ejemplo para crear un tag validado:

```powershell
git tag -a v2.2.1 -m "Pilario 2.2.1 Beta"
git push origin v2.2.1
```

## Privacidad y alcance de la beta

Pilario puede almacenar información personal y datos relacionados con la salud. Antes de utilizarla con datos reales o ampliar el acceso, deben revisarse como mínimo:

- información y política de privacidad;
- base jurídica y consentimiento aplicable;
- procedimiento de acceso, exportación y eliminación;
- conservación y copia de seguridad;
- control de usuarios autorizados;
- registro de cambios y accesos;
- cumplimiento del RGPD y normativa aplicable.

Google Sheets es adecuado para una beta con pocos usuarios independientes. Una etapa posterior con varios instructores, permisos compartidos o concurrencia intensiva debería valorar un backend con Firebase Authentication, Firestore o una base de datos equivalente.

## Limitaciones conocidas

- Google puede volver a pedir autorización después de recargar o cuando expire el token.
- La reconexión automática depende del navegador y de la sesión activa de Google.
- La beta no incluye todavía un panel administrativo de altas y aprobaciones.
- Cada usuario trabaja con su propio archivo de Google Drive.
- No existe todavía resolución avanzada de conflictos entre varios dispositivos.

## Seguridad del repositorio

No deben subirse:

- `.env.local`
- `.tools/`
- `node_modules/`
- `dist/`
- archivos `client_secret_*.json`
- cuentas de servicio
- access tokens o refresh tokens
- exportaciones con datos reales

## Autor

Desarrollado por **chumix**.

Contacto: [chumix@gmail.com](mailto:chumix@gmail.com)

## Licencia

Este repositorio no incluye todavía una licencia de código abierto. Mientras no se añada un archivo `LICENSE`, el código conserva todos los derechos y no se concede permiso general para copiarlo, modificarlo o redistribuirlo.
