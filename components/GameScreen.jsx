// components/GameScreen.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export default function GameScreen() {
  // UI / game states
  const [userLabel, setUserLabel] = useState("@anonymous");
  const [countdown, setCountdown] = useState(3); // 3..2..1 then start
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // letters: shuffled board for display
  const letters = useMemo(() => {
    const arr = Array.from({ length: 26 }, (_, i) =>
      String.fromCharCode(65 + i)
    );
    // shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []); // one-time per mount

  // track progress (next expected char index 0=A, 1=B, ...)
  const [nextIndex, setNextIndex] = useState(0);

  // per-button mark state: 'idle' | 'correct' | 'wrong'
  const [marks, setMarks] = useState(() =>
    Object.fromEntries(letters.map((l) => [l, "idle"]))
  );

  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // derive next letter
  const nextLetter = String.fromCharCode(65 + nextIndex);

  // preview: show some of the shuffled letters as small boxes (pick first 7)
  const preview = letters.slice(0, 7);

  // detect host-provided user
  useEffect(() => {
    try {
      const maybe =
        (typeof window !== "undefined" &&
          (window.__MINIKIT_USER__ ||
            window.minikitUser ||
            window.__minikit_user__ ||
            window.__FARCASTER_USER__ ||
            window.farcasterUser)) ||
        null;

      if (maybe && typeof maybe === "object") {
        // if object, try username property
        const name =
          maybe.username || maybe.handle || maybe.displayName || maybe.name;
        if (name) return setUserLabel(name.startsWith("@") ? name : `@${name}`);
      } else if (typeof maybe === "string" && maybe.length) {
        return setUserLabel(maybe.startsWith("@") ? maybe : `@${maybe}`);
      }
    } catch (e) {
      /* ignore */
    }
    // default stays @anonymous
  }, []);

  // countdown effect
  useEffect(() => {
    if (started) return;
    if (countdown <= 0) {
      // start
      setStarted(true);
      setStartTime(Date.now());
      setCountdown(null);
      return;
    }

    const id = setTimeout(() => {
      setCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);

    return () => clearTimeout(id);
  }, [countdown, started]);

  // elapsed timer while started and not finished
  useEffect(() => {
    if (!started || finished) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 50);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [started, finished, startTime]);

  // handle letter click
  function handleLetterClick(letter) {
    if (!started || finished) return;
    // if letter already marked correct, ignore
    if (marks[letter] === "correct") return;

    const expected = String.fromCharCode(65 + nextIndex);
    if (letter === expected) {
      // mark correct
      setMarks((m) => ({ ...m, [letter]: "correct" }));
      // advance nextIndex
      const newIndex = nextIndex + 1;
      setNextIndex(newIndex);
      // if finished all
      if (newIndex >= 26) {
        // finish
        setFinished(true);
        setElapsed((Date.now() - startTime) / 1000);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    } else {
      // mark wrong briefly
      setMarks((m) => ({ ...m, [letter]: "wrong" }));
      setTimeout(() => {
        setMarks((m) => ({ ...m, [letter]: "idle" }));
      }, 400);
    }
  }

  // submit score to /api/saveScore
  async function handleSubmit() {
    if (submitted) return;
    setSubmitted(true);

    const payload = {
      username: userLabel.replace(/^@/, ""),
      time: Number(elapsed.toFixed(3)),
    };

    try {
      const res = await fetch("/api/saveScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // optional: check response
      // const data = await res.json();
    } catch (err) {
      console.error("submit error", err);
    }
  }

  // restart game (play again) -> simply reload component states
  function handlePlayAgain() {
    // simple approach: reload page to reset memoized letters
    if (typeof window !== "undefined") window.location.href = "/game";
  }

  // Back goes home
  // UI helpers
  const formatTime = (t) => `${t.toFixed(3)} s`;

  // layout style small helper
  const btnStyle = {
    padding: "12px 22px",
    borderRadius: 999,
    background: "#fff",
    color: "#0000FF",
    fontWeight: 800,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0000FF",
        color: "#fff",
        padding: 20,
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
      }}
    >
      {/* Header */}
      <h1 style={{ fontSize: 40, fontWeight: 900, margin: 12 }}>
        Tap A → Z Rush
      </h1>
      <div style={{ fontSize: 14, opacity: 0.95, marginBottom: 12 }}>
        Playing as <strong style={{ color: "#fff" }}>{userLabel}</strong>
      </div>

      {/* Timer / Next / Preview / Back line */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        {/* Timer */}
        <div
          style={{
            minWidth: 140,
            padding: "12px 18px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.08)",
            fontWeight: 800,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.9 }}>Timer</div>
          <div style={{ fontSize: 18, marginTop: 6 }}>
            {!started && countdown !== null ? `${countdown} s` : formatTime(elapsed || 0)}
          </div>
        </div>

        {/* Next */}
        <div
          style={{
            minWidth: 120,
            padding: "12px 18px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.08)",
            fontWeight: 800,
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.9 }}>Next</div>
          <div style={{ fontSize: 18, marginTop: 6 }}>{nextLetter}</div>
        </div>

        {/* Preview boxes */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "8px 12px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.06)",
            alignItems: "center",
          }}
        >
          {preview.map((p) => (
            <div
              key={p}
              style={{
                minWidth: 28,
                minHeight: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 14,
                padding: "6px 8px",
              }}
            >
              {p}
            </div>
          ))}
        </div>

        {/* Back */}
        <div style={{ marginLeft: 8 }}>
          <Link href="/">
            <button
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "#fff",
                color: "#0000FF",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Back
            </button>
          </Link>
        </div>
      </div>

      {/* Large Next label */}
      {!finished && (
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Next: {nextLetter}</div>
      )}

      {/* Countdown overlay if not started */}
      {!started && countdown !== null && (
        <div style={{ marginBottom: 12, fontSize: 18, fontWeight: 800 }}>
          Starting in {countdown}...
        </div>
      )}

      {/* Board */}
      <div
        id="board"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
          maxWidth: 520,
          margin: "12px auto 30px",
        }}
      >
        {letters.map((l, idx) => {
          const state = marks[l] || "idle";
          const bg =
            state === "correct" ? "#00C853" : state === "wrong" ? "#FF5252" : "#fff";
          const color = state === "correct" ? "#fff" : "#0000FF";
          const opacity = state === "idle" ? 1 : 1;

          // make last row only 2 letters — but layout uses grid; for exact placement we keep grid and let blanks be present
          return (
            <button
              key={l}
              onClick={() => handleLetterClick(l)}
              className="letter"
              style={{
                height: 72,
                borderRadius: 14,
                fontSize: 22,
                fontWeight: 900,
                background: bg,
                color,
                border: "none",
                cursor: started && !finished ? "pointer" : "default",
                boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
                transition: "transform .08s ease, background .12s ease",
                transform: state === "wrong" ? "translateY(0)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>

      {/* Footer area: when finished show results and actions */}
      {finished ? (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 900, fontSize: 26, marginBottom: 12 }}>
            Completed in {formatTime(elapsed)}
          </div>

          <div style={{ marginBottom: 12 }}>
            <button
              onClick={handleSubmit}
              style={{
                ...btnStyle,
                background: submitted ? "rgba(255,255,255,0.85)" : "#fff",
                color: "#0000FF",
                padding: "10px 18px",
              }}
            >
              {submitted ? "Submitted ✓" : "Submit Score"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => (window.location.href = "/")}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: "#fff",
                color: "#000",
                border: "2px solid rgba(0,0,0,0.2)",
                fontWeight: 700,
              }}
            >
              Back
            </button>

            <Link href="/leaderboard">
              <button
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.95)",
                  color: "#000",
                  border: "2px solid rgba(0,0,0,0.15)",
                  fontWeight: 700,
                }}
              >
                See Leaderboard
              </button>
            </Link>

            <button
              onClick={handlePlayAgain}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: "#fff",
                color: "#000",
                border: "2px solid rgba(0,0,0,0.15)",
                fontWeight: 700,
              }}
            >
              Play again
            </button>
          </div>
        </div>
      ) : (
        // while playing show small controls (Back + maybe nothing)
        <div style={{ marginTop: 8, marginBottom: 30 }}>
          <Link href="/">
            <button
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: "#fff",
                color: "#000",
                border: "2px solid rgba(0,0,0,0.15)",
                fontWeight: 700,
              }}
            >
              Back
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
