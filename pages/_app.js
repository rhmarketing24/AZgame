// pages/_app.js
import { useEffect } from "react";
import "../styles/globals.css";
import { sdk } from "@farcaster/miniapp-sdk";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // ✅ Official & required ready call
        await sdk.actions.ready();
        if (!cancelled) {
          console.log("[Farcaster MiniApp] ready called successfully");
        }
      } catch (err) {
        console.error("[Farcaster MiniApp] ready failed", err);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return <Component {...pageProps} />;
}
