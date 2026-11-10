import { useCallback, useEffect, useRef, useState } from "react";
import { LegacyApp } from "./legacy/LegacyApp";
import { authorize } from "./auth/googleIdentity";
import { SheetsRepository } from "./google/sheetsRepository";
import type { GoogleUser, SyncState } from "./google/types";
import { APP_INFO } from "./appInfo";
const KEY = "pilates-angela-v1";
const CONNECTED_KEY = "pilario-google-connected";

export function AppShell() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const betaFormUrl = import.meta.env.VITE_BETA_FORM_URL as string | undefined;
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(localStorage.getItem(CONNECTED_KEY) === "1");
  const [error, setError] = useState("");
  const [sync, setSync] = useState<SyncState>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [updateInfo, setUpdateInfo] = useState<{version:string;title?:string;changes?:string[]}|null>(null);
  const repo = useRef<SheetsRepository | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const disconnect = useCallback(() => {
    delete window.pilatesCloud;
    repo.current = null;
    localStorage.removeItem(CONNECTED_KEY);
    setUser(null); setReady(false); setSync("idle"); setLastSyncedAt(null);
  }, []);

  const connect = useCallback(async (interactive = true) => {
    if (!clientId) { setError("La conexión con Google no está configurada."); setRestoring(false); return; }
    setBusy(true); setError("");
    try {
      const authorization = await authorize(clientId, interactive);
      setUser(authorization.user); setSync("loading");
      const repository = new SheetsRepository(authorization.token);
      repo.current = repository;
      await repository.init();
      const cloudData = await repository.load();
      if (cloudData) localStorage.setItem(KEY, JSON.stringify(cloudData));
      else { const localData = localStorage.getItem(KEY); if (localData) await repository.save(JSON.parse(localData)); }
      const markSynced = () => { setSync("synced"); setLastSyncedAt(new Date().toISOString()); };
      const syncNow = async (db: unknown) => { setSync("saving"); try { await repository.save(db); markSynced(); } catch (e) { setSync("error"); throw e; } };
      window.pilatesCloud = {
        save: (db) => { setSync("saving"); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => syncNow(db).catch(e => setError(e instanceof Error ? e.message : "Error de sincronización")), 1200); },
        syncNow,
        disconnect,
        sheetUrl: repository.sheetUrl,
      };
      localStorage.setItem(CONNECTED_KEY, "1"); markSynced(); setReady(true);
    } catch (e) {
      if (interactive) setError(e instanceof Error ? e.message : "No se pudo iniciar sesión");
      localStorage.removeItem(CONNECTED_KEY);
      setSync("idle"); setReady(false);
    } finally { setBusy(false); setRestoring(false); }
  }, [clientId, disconnect]);

  useEffect(() => { if (localStorage.getItem(CONNECTED_KEY) === "1") connect(false); return () => { delete window.pilatesCloud; }; }, [connect]);
  useEffect(() => {
    fetch(`./version.json?t=${Date.now()}`, {cache:"no-store"}).then(r=>r.ok?r.json():null).then(info=>{
      if(info?.version && info.version!==APP_INFO.version && localStorage.getItem(`pilario-update-later-${info.version}`)!=="1") setUpdateInfo(info);
    }).catch(()=>{});
  }, []);
  async function applyUpdate(){
    const regs=await navigator.serviceWorker?.getRegistrations?.();
    await Promise.all((regs||[]).map(r=>r.update()));
    const keys=await caches?.keys?.();
    await Promise.all((keys||[]).map(k=>caches.delete(k)));
    window.location.reload();
  }

  if (!ready) return <main className="auth-shell"><section className="auth-card">
    <img className="brand-logo" src="./pilario-logo.png" alt="" />
    <div className="auth-heading"><h1>{APP_INFO.name}</h1><p className="auth-tagline">{APP_INFO.tagline}</p></div>
    {error && <div className="auth-error">{error}</div>}
    <button className="btn-primary" onClick={() => connect(true)} disabled={busy}>{restoring ? "Reconectando con Google…" : busy ? "Conectando…" : "Continuar con Google"}</button>
    <p className="auth-meta">Tus datos se guardan de forma privada en tu Google Drive.</p>
    <div className="beta-access"><strong>Acceso limitado</strong><span>Solicita acceso para utilizar Pilario.</span><a href={betaFormUrl || `mailto:${APP_INFO.developer.email}?subject=Solicitud%20de%20acceso%20a%20Pilario`} target={betaFormUrl ? "_blank" : undefined} rel="noreferrer">Solicitar acceso</a></div>
  </section></main>;

  return <>{updateInfo&&<div className="update-ov"><section className="update-card"><span className="version-number">Nueva versión {updateInfo.version}</span><h2>{updateInfo.title||"Actualización disponible"}</h2>{updateInfo.changes?.length&&<ul>{updateInfo.changes.map(x=><li key={x}>{x}</li>)}</ul>}<div className="update-actions"><button className="btn-soft" onClick={()=>{localStorage.setItem(`pilario-update-later-${updateInfo.version}`,"1");setUpdateInfo(null)}}>Recordar más tarde</button><button className="btn-primary" onClick={applyUpdate}>Actualizar ahora</button></div></section></div>}<div className="account-badge">{user?.picture && <img src={user.picture} alt="" referrerPolicy="no-referrer"/>}<span>{user?.email}</span><button onClick={disconnect}>Salir</button></div><LegacyApp user={user} sync={sync} lastSyncedAt={lastSyncedAt}/></>;
}
