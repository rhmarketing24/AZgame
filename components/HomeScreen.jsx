import { useEffect } from 'react';
import Link from 'next/link';

export default function HomeScreen(){

  useEffect(() => {
    console.log("Mini App Loaded: HomeScreen is active");

    // 🔥 Base Preview Console Ready Signal
    if (typeof window !== "undefined") {
      window.parent?.postMessage(
        { type: "miniapp.ready", version: 1 },
        "*"
      );
    }
  }, []);

  return (
    <div className="container center">
      <h1>Tap A → Z Rush</h1>
      <p>Not connected (playing as anonymous)</p>

      <div style={{ marginTop: 12 }}>
        <Link href="/game">
          <button className="btn">Play</button>
        </Link>
      </div>

      <div style={{ marginTop: 12 }}>
        <Link href="/leaderboard">
          <button className="small-btn">Leaderboard</button>
        </Link>
      </div>
    </div>
  );
}