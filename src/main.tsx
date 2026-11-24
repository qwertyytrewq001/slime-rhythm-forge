import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "@fontsource/press-start-2p/400.css";
import "@fontsource/vt323/400.css";
import "@fontsource/fredoka/400.css";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";
import "./index.css";
import { initStage } from "./utils/stage";
import { initPortal, PORTAL } from "./utils/portal";
import { installSafeStorage } from "./utils/safeStorage";

installSafeStorage(); // must run before anything reads saved data
initStage();
void initPortal();
// a long press on a phone must not open the browser's image / copy menu in the middle of the game
document.addEventListener('contextmenu', e => { if (!(e.target as HTMLElement | null)?.closest?.('input, textarea')) e.preventDefault(); });

// If this tab is running an older build than the one on the server, reload once into the new one (a cached page never gets stuck on old code).
// (portal builds are served by the portal, so there is nothing to refresh)
if (PORTAL === 'none') fetch(`${import.meta.env.BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' })
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
