import type { GoogleUser } from "../google/types";
const GIS = "https://accounts.google.com/gsi/client";
export const SCOPES = ["openid", "email", "profile", "https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/spreadsheets"].join(" ");
function loadScript(): Promise<void> {
  if (window.google?.accounts) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const old = document.querySelector(`script[src="${GIS}"]`);
    if (old) { old.addEventListener("load", () => resolve()); return; }
    const script = document.createElement("script");
    script.src = GIS; script.async = true; script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Google Identity Services"));
    document.head.appendChild(script);
  });
}
async function profile(token: string): Promise<GoogleUser> {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error("profile");
    return await response.json();
  } catch {
    return { sub: "google-account", name: "Cuenta de Google", email: "Cuenta conectada" };
  }
}
export async function authorize(clientId: string, interactive = true): Promise<{ token: string; user: GoogleUser }> {
  await loadScript();
  const token: string = await new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,
      callback: (response: any) => response.error ? reject(new Error(response.error)) : resolve(response.access_token),
      error_callback: (error: any) => reject(new Error(error?.message || "Autorización cancelada")),
    });
    client.requestAccessToken({ prompt: interactive ? "consent" : "" });
  });
  return { token, user: await profile(token) };
}
