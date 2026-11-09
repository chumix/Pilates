export const APP_INFO = {
  name: "Pilario",
  tagline: "Gestión sencilla para profesionales de Pilates",
  version: "2.2.1",
  releaseDate: "2026-11-09",
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
