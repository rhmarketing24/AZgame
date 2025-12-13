// pages/_app.js
import { useEffect } from "react";
import "../styles/globals.css";
import { sdk } from "@farcaster/miniapp-sdk";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    async function init() {
      try {
        // 1️⃣ Farcaster Mini App ready
        await sdk.actions.ready();
        console.log("Farcaster ready OK");

        // 2️⃣ Base Mini App ready (REQUIRED)
        window.parent.postMessage(
          { type: "miniapp.ready", version: 1 },
          "*"
        );
        console.log("Base miniapp.ready sent");
      } catch (err) {
        console.error("Mini App init failed", err);
      }
    }

    init();
  }, []);

  return <Component {...pageProps} />;
}
