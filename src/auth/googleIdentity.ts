import type { GoogleUser } from "../google/types";

const GIS = "https://accounts.google.com/gsi/client";

export const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ");

function loadScript(): Promise<void> {
  if (window.google?.accounts) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${GIS}"]`,
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => {
        reject(
          new Error(
            "No se pudo cargar Google Identity Services.",
          ),
        );
      });
      return;
    }

    const script = document.createElement("script");
    script.src = GIS;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      reject(
        new Error(
          "No se pudo cargar Google Identity Services.",
        ),
      );
    };

    document.head.appendChild(script);
  });
}

async function requestAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SCOPES,

      callback: (response: {
        access_token?: string;
        error?: string;
        error_description?: string;
      }) => {
        if (response.error) {
          reject(
            new Error(
              response.error_description ||
                `Google OAuth: ${response.error}`,
            ),
          );
          return;
        }

        if (!response.access_token) {
          reject(
            new Error(
              "Google no devolvió un token de acceso.",
            ),
          );
          return;
        }

        resolve(response.access_token);
      },

      error_callback: (response: { message?: string }) => {
        reject(
          new Error(
            response?.message ||
              "La autorización de Google se canceló.",
          ),
        );
      },
    });

    tokenClient.requestAccessToken({
      prompt: "",
    });
  });
}

async function getGoogleUser(token: string): Promise<GoogleUser> {
  try {
    /*
     * Utilizamos googleapis.com porque algunas redes corporativas
     * bloquean openidconnect.googleapis.com.
     */
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Perfil de Google: ${response.status}`);
    }

    const profile = await response.json();

    return {
      sub: profile.sub || profile.email || "google-account",
      name: profile.name || "Cuenta de Google",
      email: profile.email || "Cuenta conectada",
      picture: profile.picture,
    };
  } catch (error) {
    /*
     * El perfil es solo informativo.
     * Si una red corporativa bloquea esta petición,
     * la aplicación puede seguir usando Drive y Sheets.
     */
    console.warn(
      "No se pudo consultar el perfil de Google. " +
        "Se continuará con la autorización de Drive.",
      error,
    );

    return {
      sub: "google-account",
      name: "Cuenta de Google",
      email: "Cuenta conectada",
    };
  }
}

export async function authorize(
  clientId: string,
): Promise<{ token: string; user: GoogleUser }> {
  await loadScript();

  const token = await requestAccessToken(clientId);
  const user = await getGoogleUser(token);

  return {
    token,
    user,
  };
}