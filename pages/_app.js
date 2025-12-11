// pages/_app.js
import { useEffect } from "react";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // ফোকাসেড origins — প্রথমে base.dev, পরে base.build; প্রয়োজন হলে আরো যোগ করো
    const ORIGINS = [
      "https://base.dev",
      "https://base.build",
      "https://preview.base.build" // (optional)
    ];

    const msg = { type: "miniapp.ready", version: 1 };

    // try to send to each origin (prefer explicit)
    const sendAll = (useWildcard = false) => {
      ORIGINS.forEach((o) => {
        try {
          window?.parent?.postMessage(msg, o);
          console.log("[miniapp.ready] sent ->", o, msg);
        } catch (e) {
          console.warn("postMessage ->", o, "failed", e);
        }
      });
      if (useWildcard) {
        try {
          window?.parent?.postMessage(msg, "*");
          console.log("[miniapp.ready] sent -> wildcard", msg);
        } catch (e) { console.warn("wildcard failed", e); }
      }
    };

    // immediate + retries
    sendAll();
    const t1 = setTimeout(() => sendAll(), 400);
    const t2 = setTimeout(() => sendAll(true), 1200); // last try with wildcard

    // also send every 2s for a short period (helps race/timing)
    let cnt = 0;
    const interval = setInterval(() => {
      if (cnt++ > 6) { clearInterval(interval); return; }
      sendAll();
    }, 2000);

    // send again when page becomes visible
    const onVis = () => { if (!document.hidden) sendAll(); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <Component {...pageProps} />;
}