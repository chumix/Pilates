import React from "react";import ReactDOM from "react-dom/client";import "./styles.css";import {AppShell} from "./AppShell";
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><AppShell/></React.StrictMode>);
