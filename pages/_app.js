// pages/_app.js
import { useEffect } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    console.log("MiniApp: _app mounted");

    const sendReady = () => {
      const msg = { type: "miniapp.ready", version: 1 };
      console.log("[miniapp.ready] sending ->", msg);
      window?.parent?.postMessage(msg, "*");
    };

    // Send immediately + retries (timing fix for Base preview)
    sendReady();
    const t1 = setTimeout(sendReady, 500);
    const t2 = setTimeout(sendReady, 1500);

    // When user focuses preview window again
    const handleVisibility = () => {
      if (!document.hidden) sendReady();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return <Component {...pageProps} />;
}