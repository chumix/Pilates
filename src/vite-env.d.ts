/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_GOOGLE_CLIENT_ID?: string; readonly VITE_BETA_FORM_URL?: string; }
interface Window {
  google?: any;
  pilatesCloud?: {
    save: (db: unknown) => void;
    syncNow: (db: unknown) => Promise<void>;
    disconnect: () => void;
    sheetUrl: string;
  };
}
