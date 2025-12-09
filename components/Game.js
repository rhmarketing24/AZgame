"use client";

import { useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

export default function Game() {
  const { user, isFrameReady, setFrameReady } = useMiniKit();

  const [letters] = useState(
    Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const [done, setDone] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  const handlePress = async (letter) => {
    if (done) return;

    if (currentIndex === 0) {
      setStartTime(Date.now());
    }

    if (letter === letters[currentIndex]) {
      const next = currentIndex + 1;

      if (next === letters.length) {
        const time = (Date.now() - startTime) / 1000;
        setElapsed(time);
        setDone(true);

        await fetch("/api/saveScore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: user?.username || "anonymous",
            score_seconds: time,
            letters_completed: 26
          })
        });

        loadLeaderboard();
      }

      setCurrentIndex(next);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      setLeaderboard(json.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>A → Z Tap Game</h1>

      {user ? <p>@{user.username}</p> : <p>Connecting to Base...</p>}

      {!done ? (
        <h2>Tap: {letters[currentIndex]}</h2>
      ) : (
        <h2>Completed in {elapsed.toFixed(2)}s</h2>
      )}

      <div id="board">
        {letters.map((letter, idx) => (
          <button
            key={idx}
            className="game-button"
            onClick={() => handlePress(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      <h2>Leaderboard</h2>
      <div>
        {leaderboard.length === 0 && <p>No scores yet</p>}
        {leaderboard.map((row, i) => (
          <p key={i}>
            {i + 1}. @{row.username} — {parseFloat(row.score_seconds).toFixed(2)}s
          </p>
        ))}
      </div>
    </div>
  );
}
