import React, { useState } from "react";
import GameScreen from "./GameScreen";

export default function HomeScreen() {
  const [inGame, setInGame] = useState(false);
  const [startAuto, setStartAuto] = useState(false);

  function handlePlayFromHome() {
    // show embedded game screen and auto-start countdown
    setInGame(true);
    // small delay to ensure GameScreen mounted
    setTimeout(() => setStartAuto(true), 150);
  }

  function handleBackFromGame() {
    // hide game and go back to home view
    setInGame(false);
    setStartAuto(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0000FF", color: "#fff", padding: 22, fontFamily: "Arial, sans-serif" }}>
      {!inGame ? (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <h1 style={{ fontSize: 34, fontWeight: 900 }}>Tap A → Z Rush</h1>
          <p style={{ opacity: 0.95 }}>Not connected (playing as anonymous)</p>

          <div style={{ marginTop: 20 }}>
            <button onClick={handlePlayFromHome} style={{ padding: "12px 22px", borderRadius: 999, background: "#fff", color: "#0000FF", fontWeight: 800 }}>Play</button>
          </div>

          <div style={{ marginTop: 12 }}>
            <a href="/leaderboard" style={{ display: "inline-block", padding: "8px 14px", borderRadius: 8, border: "2px solid rgba(255,255,255,0.18)", color: "#fff" }}>Leaderboard</a>
          </div>

          <p style={{ marginTop: 14, opacity: 0.9 }}>Tap A→Z as fast as you can!</p>
        </div>
      ) : (
        // embed gamescreen; pass autoStart and onBack
        <GameScreen autoStart={startAuto} compact={true} onBack={handleBackFromGame} />
      )}
    </div>
  );
}
