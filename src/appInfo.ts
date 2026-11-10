export const APP_INFO = {
  name: "Pilario",
  tagline: "Gestión sencilla para profesionales de Pilates",
  version: "2.3.3",
  releaseDate: "2026-11-10",
  dataFileName: "Pilario - Datos",
  legacyDataFileName: "Pilates Ángela - Datos",
  developer: { name: "chumix", email: "chumix@gmail.com" },
} as const;

export const DEFAULT_BRANDING = {
  instructorName: "",
  studioName: "Mi estudio de Pilates",
  primaryColor: "#5b8578",
  accentColor: "#dfece6",
  logoDataUrl: "",
} as const;

export const VERSION_HISTORY = [
  {version:"2.3.3",date:"10 de noviembre de 2026",title:"Corrección de formularios en móvil",changes:["Los formularios de salas y material muestran siempre los campos superiores.","El contenido del formulario puede desplazarse completamente.","Cabecera y botones permanecen accesibles en pantallas pequeñas."]},
  {version:"2.3.2",date:"10 de noviembre de 2026",title:"Mejoras visuales de Centro y avisos",changes:["Centro sin botón Volver cuando forma parte del menú principal.","Nuevo icono de edificio para Centro.","Avisos visuales de aforo y material en Agenda de hoy y Calendario."]},
  {version:"2.3.1",date:"10 de noviembre de 2026",title:"Correcciones de centro y aforo",changes:["Centro añadido a la navegación inferior.","Corregido el alta de salas y material.","Resumen semanal visible en Inicio.","Avisos de aforo persistentes.","Formulario de centro reposicionado en pantallas pequeñas.","Material simplificado sin categorías."]},
  {
    version: "2.3.0", date: "10 de noviembre de 2026", title: "Centro y seguimiento semanal",
    changes: ["Aviso de nuevas versiones.","Gestión de salas e inventario.","Material necesario y avisos de disponibilidad.","Valoración y comentario por clase.","Horas contratadas y resumen semanal.","Semana ISO y clases puntuales o semanales.","Mejorada la cabecera móvil."],
  },
  {
    version: "2.2.1",
    date: "9 de noviembre de 2026",
    title: "Corrección de la personalización",
    changes: [
      "Corregida la edición del nombre del instructor y del estudio.",
      "Corregida la selección de colores personalizados.",
      "Corregida la carga y eliminación del logotipo personalizado.",
    ],
  },
  {
    version: "2.2.0",
    date: "9 de noviembre de 2026",
    title: "Pilario y espacios personalizados",
    changes: [
      "Nueva identidad genérica Pilario.",
      "Personalización del instructor, estudio, colores y logotipo.",
      "Saludo personalizado según la cuenta y la configuración.",
      "Controles para sincronizar, abrir la hoja y desconectar Google Drive.",
      "Reconexión automática cuando Google permite recuperar la autorización.",
      "Archivo de datos renombrado a Pilario - Datos conservando la información existente.",
      "Acceso beta restringido mediante usuarios de prueba de Google.",
    ],
  },
  {
    version: "2.1.0",
    date: "9 de noviembre de 2026",
    title: "Integración real con Google Drive",
    changes: [
      "Sustituido el modo local por el estado real de sincronización.",
      "Eliminada la configuración antigua de Google Apps Script.",
      "Añadida información de cuenta, archivo de datos y última sincronización.",
      "Mejorados los textos de acceso y privacidad.",
    ],
  },
  {
    version: "2.0.0",
    date: "8 de noviembre de 2026",
    title: "Migración a React y Google Sheets",
    changes: [
      "Migración del prototipo a Vite, React y TypeScript.",
      "Inicio de sesión con Google Identity Services.",
      "Creación y sincronización del archivo privado en Google Sheets.",
    ],
  },
] as const;
