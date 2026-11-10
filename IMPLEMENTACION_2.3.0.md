# Implementación y validación de Pilario 2.3.0

## 1. Copia segura

1. Conserva la carpeta actual como `Pilates-backup-2.2.1`.
2. Descomprime el ZIP 2.3.0 en una carpeta nueva llamada `Pilates`.
3. Copia desde la carpeta anterior únicamente:
   - `.env.local`
   - `.tools/`
   - `.vscode/`
   - `.git/`
4. No copies `node_modules/`, `dist/` ni archivos `*.tsbuildinfo`.

## 2. Configuración local

En `.env.local` deben existir:

```env
VITE_GOOGLE_CLIENT_ID=TU_CLIENT_ID.apps.googleusercontent.com
VITE_BETA_FORM_URL=https://forms.gle/TU_FORMULARIO
```

Si todavía no existe el formulario, la aplicación abre un correo a `chumix@gmail.com`.

## 3. Instalar y arrancar

```powershell
$env:Path = "$PWD\.tools\node;$env:Path"
npm.cmd install
npm.cmd run dev
```

Abrir `http://localhost:5173/Pilates/`.

## 4. Formulario de solicitud de acceso

Crear en Google Forms `Solicitud de acceso a Pilario` con:

- Nombre.
- Correo de Google que utilizará para entrar.
- Nombre del estudio, opcional.
- Ciudad o país, opcional.
- Motivo para probar Pilario.
- Casilla de consentimiento para gestionar la solicitud.

En Google Forms:

1. Activar la recopilación de correos.
2. Vincular las respuestas a Google Sheets.
3. En `Respuestas > Más opciones`, activar notificaciones por correo de respuestas nuevas.
4. Copiar el enlace público `forms.gle` en `VITE_BETA_FORM_URL`.
5. En GitHub: `Settings > Secrets and variables > Actions`, crear el secret `VITE_BETA_FORM_URL` con el mismo enlace.

Para aprobar una cuenta: `Google Auth Platform > Público > Usuarios de prueba > Agregar usuarios`.

## 5. Migración de datos

La aplicación conserva alumnos, ejercicios, plantillas, clases y asistencias. Añade automáticamente:

- `Feedback`
- `Rooms`
- `Inventory`

La estructura local pasa a `v: 2`. Los datos anteriores se normalizan al cargar.

## 6. Pruebas funcionales

### Móvil

- Abrir con ancho inferior a 600 px.
- Confirmar que la cuenta de Google no tapa Ajustes.
- Confirmar que la desconexión sigue disponible en Ajustes.

### Salas y material

1. Ajustes > Centro > Salas y material.
2. Crear dos salas con capacidades distintas.
3. Crear esterillas, pelotas y rodillos.
4. Marcar alguna unidad fuera de servicio.
5. Editar y eliminar un elemento de prueba.

### Clase y recursos

1. Crear una clase semanal.
2. Seleccionar sala.
3. Añadir material con cantidad total o por alumno.
4. Inscribir más alumnos que unidades disponibles.
5. Abrir la clase y comprobar el aviso de material insuficiente.

### Clase puntual

1. Crear una clase nueva.
2. Seleccionar `Clase puntual`.
3. Elegir fecha y hora.
4. Confirmar que solo aparece en esa semana.

### Seguimiento

1. Abrir una clase desde el calendario.
2. Marcar asistencia.
3. Elegir 🙂 Buena, 😐 Normal o 🙁 Mejorable.
4. Añadir comentario.
5. Recargar y confirmar persistencia.

### Horas y semana ISO

1. Ajustes > Planificación laboral.
2. Introducir 20 horas contratadas.
3. Revisar en Inicio las horas programadas, contratadas y disponibles.
4. Confirmar que el calendario muestra `Semana NN` y comienza el lunes.

### Actualizaciones

El aviso no aparece en 2.3.0 mientras `public/version.json` también sea 2.3.0. Para probarlo localmente, cambiar temporalmente la versión de `public/version.json` a `2.3.1`, recargar y comprobar:

- `Actualizar ahora` limpia la caché y recarga.
- `Recordar más tarde` oculta el aviso.

Deshacer después ese cambio temporal.

## 7. Compilar

```powershell
npm.cmd run build
npm.cmd run preview
```

No continuar si `build` muestra errores.

## 8. Integración Git

Crear una rama antes de sustituir archivos:

```powershell
git switch main
git pull
git switch -c pilario-2.3.0
```

Después de validar:

```powershell
git status
git diff --stat
git add .
git commit -m "Añadir gestión del centro y seguimiento semanal"
git switch main
git pull
git merge pilario-2.3.0
git push origin main
```

Revisar GitHub Actions y la versión publicada. Crear el tag `v2.3.0` solamente después de validar la publicación.
