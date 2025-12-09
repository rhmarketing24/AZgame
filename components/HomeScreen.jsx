import Link from "next/link";

export default function HomeScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0000FF",
        color: "#fff",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 800 }}>Tap A → Z Rush</h1>

      <p style={{ marginTop: 8, opacity: 0.9 }}>
        Not connected (playing as anonymous)
      </p>

      <Link href="/game">
        <button
          style={{
            marginTop: 30,
            padding: "16px 40px",
            borderRadius: 50,
            background: "#fff",
            color: "#0000FF",
            fontWeight: 700,
            border: "none",
            fontSize: 20,
          }}
        >
          Play
        </button>
      </Link>

      <Link href="/leaderboard">
        <button
          style={{
            marginTop: 16,
            padding: "10px 20px",
            borderRadius: 8,
            background: "transparent",
            color: "#fff",
            border: "2px solid rgba(255,255,255,0.3)",
            fontWeight: 600,
          }}
        >
          Leaderboard
        </button>
      </Link>

      <p style={{ marginTop: 12, fontSize: 14, opacity: 0.7 }}>
        Tap A → Z as fast as you can!
      </p>
    </div>
  );
}
