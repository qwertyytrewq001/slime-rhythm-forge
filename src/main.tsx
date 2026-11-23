import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

// If this tab is running an older build than the one on the server, reload once into the new one (a cached page never gets stuck on old code).
fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' })
  .then(r => r.json())
  .then((v: { id?: string }) => {
    if (v.id && v.id !== __BUILD_ID__ && !sessionStorage.getItem(`rs_updated_${v.id}`)) {
      sessionStorage.setItem(`rs_updated_${v.id}`, '1');
      window.location.replace(`${window.location.pathname}?v=${v.id}`);
    }
  })
  .catch(() => { /* offline or running in development: nothing to check */ });

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
