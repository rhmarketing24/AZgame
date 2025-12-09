import { useState } from "react";
import Link from "next/link";

export default function FinishScreen({ time, lettersCompleted, onPlayAgain, highlight }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setMsg("");
    try {
      // try to detect a Base username if available on window (placeholder)
      const player_name = (typeof window !== "undefined" && window.BASE_USERNAME) ? window.BASE_USERNAME : "anonymous";

      const res = await fetch("/api/saveScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          player_name,
          score_seconds: parseFloat(time.toFixed(3)),
          letters_completed: lettersCompleted,
          mode: "normal"
        })
      });
      if (!res.ok) throw new Error("save failed");
      setMsg("Score saved ✅");
    } catch (e) {
      console.error(e);
      setMsg("Save failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.45)", zIndex: 1000, padding: 20
    }}>
      <div style={{
        background: "#0000FF",
        color: "#fff",
        borderRadius: 16,
        padding: 20,
        maxWidth: 420,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
      }}>
        <h2 style={{ margin: 0 }}>Completed</h2>
        <p style={{ fontSize: 20, fontWeight: 800 }}>{time.toFixed(2)} s</p>
        <p style={{ marginTop: 6, opacity: 0.95 }}>{lettersCompleted} letters</p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
          <button onClick={handleSubmit} disabled={loading} style={{
            background: "#fff", color: "#0000FF", padding: "10px 16px", borderRadius: 12, fontWeight: 700, border: "none"
          }}>{loading ? "Saving..." : "Submit Score"}</button>

          <button onClick={onPlayAgain} style={{
            background: "transparent", color: "#fff", padding: "10px 16px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.18)"
          }}>Play Again</button>

          <Link href="/leaderboard"><button style={{
            background: "transparent", color: "#fff", padding: "10px 16px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.18)"
          }}>Leaderboard</button></Link>
        </div>

        {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      </div>
    </div>
  );
}
