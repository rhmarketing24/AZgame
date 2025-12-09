"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";

/*
  GameScreen.jsx
  - Play button -> 3s countdown -> game starts
  - Timer runs while user clicks letters A->Z in order
  - Wrong click flashes red briefly
  - On complete, show finished UI + Submit to /api/saveScore
  - Uses window host-provided username if available (common hosts expose something like __MINIKIT_USER__ etc)
*/

export default function GameScreen() {
  // try to read host-provided user info safely on client
  const [userObj, setUserObj] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    // common globals different hosts use; try a few
    const maybe =
      window.__MINIKIT_USER__ ||
      window.minikitUser ||
      window.__minikit_user__ ||
      null;
    if (maybe) setUserObj(maybe);
  }, []);

  const playerName = userObj?.username || userObj?.name || "@anonymous";

  // letters A-Z
  const letters = useMemo(
    () => Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
    []
  );

  // game state
  const [stage, setStage] = useState("ready"); // ready | countdown | playing | done
  const [countdown, setCountdown] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState([]); // array of letters done
  const [wrongFlash, setWrongFlash] = useState(null); // letter that flashed wrong
  const startRef = useRef(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const tickRef = useRef(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // start countdown -> playing
  function handlePlay() {
    setStage("countdown");
    setCountdown(3);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          startGame();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  function startGame() {
    setStage("playing");
    setCurrentIndex(0);
    setCompleted([]);
    setWrongFlash(null);
    const now = Date.now();
    setStartTime(now);
    setElapsed(0);
    // ticking elapsed
    tickRef.current = setInterval(() => {
      setElapsed((Date.now() - now) / 1000);
    }, 50);
  }

  // stop timer when done
  useEffect(() => {
    if (stage === "done") {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }
  }, [stage]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (startRef.current) clearInterval(startRef.current);
    };
  }, []);

  function handleLetterClick(letter, idx) {
    if (stage !== "playing") return;
    const expected = letters[currentIndex];
    if (letter === expected) {
      // correct
      setCompleted((s) => [...s, letter]);
      setCurrentIndex((i) => i + 1);
      // if finished
      if (currentIndex + 1 >= letters.length) {
        // done -> stop
        setElapsed((Date.now() - startTime) / 1000);
        setStage("done");
      }
    } else {
      // wrong: flash
      setWrongFlash(letter);
      setTimeout(() => setWrongFlash(null), 350);
    }
  }

  // submit to /api/saveScore
  async function handleSubmit() {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        player_name: playerName || "anonymous",
        score_seconds: Number((elapsed || 0).toFixed(3)),
        letters_completed: completed.length,
        mode: "normal",
      };
      const resp = await fetch("/api/saveScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      setSubmitted(true);
      // optionally you may refresh scoreboard or navigate
    } catch (e) {
      console.error("submit error", e);
      setErrorMsg("Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // small helper for letter styles
  function getLetterStyle(idx, letter) {
    const size = 72;
    const base = {
      width: size,
      height: size,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      fontWeight: 800,
      fontSize: 22,
      cursor: "pointer",
      userSelect: "none",
      transition: "all 0.12s",
      boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
    };
    // done
    if (completed.includes(letter)) {
      return { ...base, background: "#e6f7ee", color: "#006400", cursor: "default" };
    }
    // wrong flash
    if (wrongFlash === letter) {
      return { ...base, background: "#ffdddd", color: "#d00" };
    }
    // next expected
    if (idx === currentIndex && stage === "playing") {
      return { ...base, background: "#fff", color: "#0000FF", transform: "scale(1.02)" };
    }
    // normal
    return { ...base, background: "#fff", color: "#0000FF" };
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0000FF", color: "#fff", padding: 18 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Tap A → Z Rush</h1>
        <div style={{ marginTop: 8, opacity: 0.95 }}>
          <small>
            {playerName ? `Playing as ${playerName}` : "Not connected (playing as anonymous)"}
          </small>
        </div>

        {/* countdown or play area */}
        {stage === "ready" && (
          <div style={{ marginTop: 28 }}>
            <button
              onClick={handlePlay}
              style={{
                padding: "14px 36px",
                borderRadius: 999,
                background: "#fff",
                color: "#0000FF",
                fontWeight: 700,
                fontSize: 18,
                border: "none",
              }}
            >
              Play
            </button>

            <div style={{ marginTop: 12 }}>
              <Link href="/leaderboard">
                <button
                  style={{
                    marginTop: 12,
                    padding: "10px 18px",
                    borderRadius: 8,
                    background: "transparent",
                    color: "#fff",
                    border: "2px solid rgba(255,255,255,0.18)",
                    fontWeight: 600,
                    marginLeft: 12,
                  }}
                >
                  Leaderboard
                </button>
              </Link>
            </div>

            <p style={{ marginTop: 16, opacity: 0.85 }}>Tap A→Z as fast as you can!</p>
          </div>
        )}

        {stage === "countdown" && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 56, fontWeight: 800 }}>{countdown}</div>
            <div style={{ marginTop: 8, opacity: 0.9 }}>Get ready...</div>
          </div>
        )}

        {/* playing UI */}
        {stage === "playing" && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Next: <span style={{ fontSize: 18 }}>{letters[currentIndex]}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              Time: {elapsed.toFixed(3)} s
            </div>

            <div
              id="board"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                maxWidth: 420,
                margin: "20px auto",
                justifyItems: "center",
              }}
            >
              {letters.map((c, i) => (
                <div
                  key={c}
                  onClick={() => handleLetterClick(c, i)}
                  style={getLetterStyle(i, c)}
                >
                  {c}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* done UI */}
        {stage === "done" && (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              Completed in {Number(elapsed || 0).toFixed(3)}s
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                onClick={handleSubmit}
                disabled={submitting || submitted}
                style={{
                  padding: "12px 28px",
                  borderRadius: 10,
                  background: submitted ? "#e6e6e6" : "#fff",
                  color: submitted ? "#666" : "#0000FF",
                  border: "none",
                  fontWeight: 700,
                }}
              >
                {submitted ? "Submitted ✓" : submitting ? "Submitting..." : "Submit Score"}
              </button>
            </div>

            {errorMsg && <div style={{ color: "#ffdddd", marginTop: 12 }}>{errorMsg}</div>}

            <div style={{ marginTop: 18 }}>
              <Link href="/">
                <button style={{ padding: "8px 16px", borderRadius: 8 }}>Back</button>
              </Link>
              <Link href="/leaderboard">
                <button style={{ marginLeft: 12, padding: "8px 16px", borderRadius: 8 }}>
                  See Leaderboard
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
