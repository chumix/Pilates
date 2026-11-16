# Implementación y pruebas de Pilario 2.4.0

## Instalación

1. Crear una rama desde `main` actualizada.
2. Sustituir los archivos por los de este paquete conservando `.git`, `.env.local`, `.tools` y `.vscode`.
3. Ejecutar `npm.cmd install` y `npm.cmd run dev`.

## Pruebas prioritarias

### Preparación de ejercicios
- Comprobar el cuarto filtro **Preparación** junto a Aparato, Nivel y Enfoque.
- Crear un ejercicio con `Caja larga`.
- Filtrar por `Caja larga` y comprobar que aparece.
- Editar el ejercicio y cambiar su preparación.

### Catálogos editables
- Abrir `Ajustes > Catálogos de ejercicios`.
- Añadir una preparación nueva.
- Renombrar un enfoque y comprobar que se actualizan los ejercicios existentes.
- Intentar eliminar un nivel utilizado y elegir un sustituto.

### Histórico del alumno
- Abrir un alumno con asistencias.
- Entrar en Histórico.
- Pulsar una asistencia y comprobar que abre la clase de esa fecha con valoración y comentario.

### Estadísticas semanales
- Pulsar el resumen semanal desde Inicio.
- Navegar por semana anterior y siguiente.
- Comprobar horas, clases, asistencia, valoraciones, comentarios e incidencias.
- Revisar el gráfico de las últimas ocho semanas.

### Restablecimiento seguro
Esta prueba modifica el archivo de Drive. Hazla solo con datos de prueba:
- Abrir Ajustes y pulsar dos veces `Restablecer datos de ejemplo`.
- Comprobar en Drive que el archivo anterior se llama `Pilario - Copia antes de restablecer - FECHA_HORA`.
- Comprobar que existe un nuevo `Pilario - Datos`.
- Confirmar que la copia archivada conserva la información anterior.
- Confirmar que la aplicación utiliza el archivo nuevo.

## Compilación

```powershell
npm.cmd run build
```

## Git

```powershell
git switch main
git pull origin main
git switch -c pilario-2.4.0
git add .
git commit -m "Añadir preparaciones, catálogos y estadísticas semanales"
git push -u origin pilario-2.4.0
```

Después de validar:

```powershell
git switch main
git pull origin main
git merge pilario-2.4.0
git push origin main
```
