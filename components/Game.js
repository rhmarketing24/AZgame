"use client";

import { useEffect, useState } from "react";

export default function Game() {
  // local user state (try to detect host-provided user safely)
  const [userObj, setUserObj] = useState(null);

  const [letters] = useState(
    Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const [done, setDone] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  // Try to read host-provided user info on client
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Common possible globals (hosts vary)
    const maybe =
      window.__MINIKIT_USER__ ||
      window.minikitUser ||
      window.__minikit_user ||
      null;

    if (maybe) {
      setUserObj(maybe);
      return;
    }

    // If host posts a message later, listen for it
    const handler = (e) => {
      try {
        const d = e && e.data;
        if (!d) return;
        if (d && d.type === "MINIKIT_USER" && d.user) {
          setUserObj(d.user);
        }
      } catch (err) {
        // ignore parse errors
      }
    };

    window.addEventListener("message", handler, false);

    // cleanup
    return () => window.removeEventListener("message", handler);
  }, []);

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

        // submit score (username from host if available)
        const username = userObj?.username || "anonymous";

        try {
          await fetch("/api/saveScore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username,
              score_seconds: time,
              letters_completed: 26
            })
          });
        } catch (e) {
          console.error("saveScore failed", e);
        }

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
      <h1 style={{ margin: "8px 0" }}>Tap A → Z Rush</h1>

      <div style={{ marginBottom: 8 }}>
        {userObj ? (
          <div>
            <strong>@{userObj.username}</strong>
          </div>
        ) : (
          <div style={{ opacity: 0.9 }}>Not connected (playing as anonymous)</div>
        )}
      </div>

      {!done ? (
        <h2 style={{ margin: "6px 0" }}>Tap: {letters[currentIndex]}</h2>
      ) : (
        <h2 style={{ margin: "6px 0" }}>Completed in {elapsed.toFixed(2)}s</h2>
      )}

      <div id="board" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 350, margin: "16px auto" }}>
        {letters.map((letter, idx) => (
          <button
            key={idx}
            className="game-button"
            onClick={() => handlePress(letter)}
            aria-label={`Letter ${letter}`}
          >
            {letter}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ marginBottom: 8 }}>Leaderboard</h3>
        <div>
          {leaderboard.length === 0 && <p style={{ opacity: 0.9 }}>No scores yet</p>}
          {leaderboard.map((row, i) => (
            <p key={i} style={{ margin: "6px 0" }}>
              {i + 1}. @{row.username} — {parseFloat(row.score_seconds).toFixed(2)}s
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
