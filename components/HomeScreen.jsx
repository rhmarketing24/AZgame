import Link from "next/link"; import { useEffect } from "react";

export default function HomeScreen() { useEffect(() => { // Only run in browser environments if (typeof window === "undefined") return;

console.log("HomeScreen mounted, attempting to send miniapp.ready fallback");
const msg = { type: "miniapp.ready", version: 1 };

try {
  // In some sandboxed environments window.parent may be null or equal to window.
  // Guard aggressively before calling postMessage.
  const parent = window.parent;

  if (!parent || parent === window) {
    console.log("HomeScreen: no separate parent window to postMessage to — skipping.");
    return;
  }

  if (typeof parent.postMessage !== "function") {
    console.log("HomeScreen: parent.postMessage is not a function — skipping.");
    return;
  }

  // Try sending to known origins; each call is wrapped so one failing origin doesn't stop others.
  const origins = ["https://base.dev", "https://base.build", "*"];

  for (let i = 0; i < origins.length; i++) {
    const origin = origins[i];
    try {
      parent.postMessage(msg, origin);
      console.log(`HomeScreen: posted miniapp.ready to ${origin}`);
    } catch (err) {
      // Silently continue but log for debugging — cross-origin restrictions can throw here.
      console.warn("HomeScreen: postMessage to origin failed:", origin, err);
    }
  }
} catch (e) {
  // Catch any unexpected errors (defensive).
  console.warn("HomeScreen postMessage unexpected error:", e);
}

}, []);

return ( <main className="home-root" aria-labelledby="app-title"> <div className="card"> <header className="hero"> <div className="logo" aria-hidden> {/* simple SVG mark to make header feel 'app-like' without adding assets */} <svg width="68" height="68" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="0" y="0" width="24" height="24" rx="6" fill="currentColor" opacity="0.12" /> <text x="50%" y="55%" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="700">ABC</text> </svg> </div>

<h1 id="app-title">ABC Rush</h1>
      <p className="subtitle">Fast alphabet reaction — one-minute rounds</p>
    </header>

    <div className="status" aria-live="polite">
      Not connected <span className="muted">(playing as anonymous)</span>
    </div>

    <nav className="actions" aria-label="primary">
      <Link href="/game">
        <a className="btn primary">Play</a>
      </Link>
      <Link href="/leaderboard">
        <a className="btn outline">Leaderboard</a>
      </Link>
    </nav>

    <footer className="foot">Tip: tap <strong>Play</strong> to begin — controls are single-tap.</footer>
  </div>

  <style jsx>{`
    :root{
      --bg: linear-gradient(180deg,#0236ff 0%, #0012b3 100%);
      --card-bg: rgba(255,255,255,0.06);
      --glass: rgba(255,255,255,0.06);
      --accent: #ffffff;
      --muted: rgba(255,255,255,0.8);
    }

    .home-root{
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:28px 20px;
      background: var(--bg);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
      color:var(--accent);
    }

    .card{
      width:100%;
      max-width:420px;
      background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
      border-radius:20px;
      padding:28px 22px;
      box-shadow: 0 8px 30px rgba(1,8,40,0.45);
      text-align:center;
      backdrop-filter: blur(8px) saturate(120%);
    }

    .hero{display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:8px}
    .logo{color:var(--accent);margin-bottom:6px}

    h1{font-size:32px;margin:0;font-weight:700;letter-spacing:0.6px}
    .subtitle{margin:0;font-size:13px;color:var(--muted);}

    .status{margin-top:14px;background: rgba(255,255,255,0.03);padding:8px 12px;border-radius:999px;font-size:13px;display:inline-block}
    .muted{opacity:0.9;margin-left:6px;color:var(--muted);font-weight:600;font-size:12px}

    .actions{display:flex;flex-direction:column;gap:12px;margin-top:18px}
    .btn{
      display:inline-flex;align-items:center;justify-content:center;
      padding:12px 18px;border-radius:999px;font-weight:700;text-decoration:none;border:0;cursor:pointer;font-size:16px
    }

    .btn.primary{background:linear-gradient(90deg,#ffffff 0%, rgba(255,255,255,0.92) 100%);color:#00123a}
    .btn.outline{background:transparent;border:1px solid rgba(255,255,255,0.18);color:var(--accent)}

    .btn:active{transform:translateY(1px)}
    .btn:focus{outline:3px solid rgba(255,255,255,0.14);outline-offset:4px}

    .foot{margin-top:16px;font-size:12px;color:var(--muted)}

    @media (min-width:540px){
      h1{font-size:40px}
      .card{padding:36px}
      .actions{flex-direction:row;justify-content:center}
      .btn{min-width:140px}
    }
  `}</style>
</main>

); }