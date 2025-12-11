import { useEffect } from 'react';
import Link from 'next/link';

export default function HomeScreen(){

  // 🔥 Base Mini App Console Ready করার জন্য log
  useEffect(() => {
    console.log("Mini App Loaded: HomeScreen is active");
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
