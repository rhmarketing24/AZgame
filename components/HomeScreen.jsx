// components/HomeScreen.jsx
import Link from "next/link";
import { useEffect } from "react";

export default function HomeScreen(){
  useEffect(() => {
    console.log("HomeScreen mounted, sending miniapp.ready fallback");
    const msg = { type: "miniapp.ready", version: 1 };
    try {
      window?.parent?.postMessage(msg, "https://base.dev");
      window?.parent?.postMessage(msg, "https://base.build");
      // wildcard fallback
      window?.parent?.postMessage(msg, "*");
    } catch (e) {
      console.warn("HomeScreen postMessage failed", e);
    }
  }, []);

  return (
    <div className="container center">
      <h1>Tap A → Z Rush</h1>
      <p>Not connected (playing as anonymous)</p>
      <div style={{marginTop:12}}>
        <Link href="/game"><button className="btn">Play</button></Link>
      </div>
      <div style={{marginTop:12}}>
        <Link href="/leaderboard"><button className="small-btn">Leaderboard</button></Link>
      </div>
    </div>
  );
}