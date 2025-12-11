// pages/_app.js
import { useEffect } from "react";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    console.log("MiniApp: _app mounted");

    const BASE_ORIGIN = "https://base.build"; // <-- prefer this (Base production)
    // alternatively try "https://base.dev" if preview uses that domain

    const sendReady = (origin = BASE_ORIGIN) => {
      const msg = { type: "miniapp.ready", version: 1 };
      try {
        console.log("[miniapp.ready] sending ->", msg, "to", origin);
        window?.parent?.postMessage(msg, origin);
      } catch (e) {
        console.warn("postMessage failed", e);
        // fallback: try wildcard (only if needed)
        try { window?.parent?.postMessage(msg, "*"); } catch (e2) { /* ignore */ }
      }
    };

    // send immediately + a couple retries (fix race/timing)
    sendReady();
    const t1 = setTimeout(() => sendReady(), 500);
    const t2 = setTimeout(() => sendReady(), 1500);

    // also send again when tab becomes visible (user focused preview)
    const handleVisibility = () => { if (!document.hidden) sendReady(); };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <Component {...pageProps} />;
}