import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const appBase = typeof document === "undefined" ? "/" : new URL("./", document.baseURI).pathname;
const withBase = (path: string) => `${appBase}${path.replace(/^\/+/, "")}`;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const appResources = [
      withBase(""), withBase("index.html"), withBase("manifest.webmanifest"), withBase("icons/quantum-bunny.svg"), withBase("icons/icon-192.png"), withBase("icons/icon-512.png"),
      ...performance.getEntriesByType("resource").map((entry) => entry.name),
    ].filter((url) => new URL(url, window.location.origin).origin === window.location.origin);

    const cacheLoadedResources = async (registration?: ServiceWorkerRegistration) => {
      const readyRegistration = registration ?? await navigator.serviceWorker.ready;
      const worker = readyRegistration.active ?? navigator.serviceWorker.controller;
      worker?.postMessage({ type: "CACHE_URLS", urls: [...new Set(appResources)] });
    };

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "OFFLINE_READY") window.dispatchEvent(new Event("quantum-bunny-offline-ready"));
    });
    navigator.serviceWorker.addEventListener("controllerchange", () => { void cacheLoadedResources(); });
    navigator.serviceWorker.register(withBase("sw.js"), { scope: appBase }).then(async (registration) => {
      void cacheLoadedResources(registration);
      await navigator.serviceWorker.ready;
      void cacheLoadedResources();
      window.setTimeout(() => { void cacheLoadedResources(); }, 800);
      navigator.storage?.persist?.().catch(() => undefined);
    }).catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
