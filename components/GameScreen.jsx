"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";

/**
 * GameScreen.jsx
 * - Paste this file as components/GameScreen.jsx (replace existing)
 * - Uses only inline styles so no external stylesheet edits needed
 */

const ALPHABET = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GameScreen() {
  // Try to detect host-provided username (Base / MiniKit style globals)
  const maybeUser =
    (typeof window !== "undefined" &&
      (window.__MINIKIT_USER__ ||
        window.minikitUser ||
        window.__minikit_user__ ||
        (window?.parent && window.parent.__MINIKIT_USER__))) ||
    null;
  const userLabel = maybeUser?.username
    ? `Playing as @${maybeUser.username}`
    : "Playing as @anonymous";

  // Shuffle letters for board layout (random positions)
  const shuffled = useMemo(() => shuffle(ALPHABET), []);

  // game state
  const [phase, setPhase] = useState("idle"); // idle, countdown, playing, finished
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // index we expect next (0 => 'A')
  const [expectedIndex, setExpectedIndex] = useState(0);
  // visual status per letter: 'idle' | 'correct' | 'wrong'
  const [statusMap, setStatusMap] = useState(() =>
    Object.fromEntries(ALPHABET.map((l) => [l, "idle"]))
  );

  // submission status
  const [submitted, setSubmitted] = useState(false);

  // Start countdown then start game
  function startGame() {
    setSubmitted(false);
    setStatusMap(Object.fromEntries(ALPHABET.map((l) => [l, "idle"])));
    setExpectedIndex(0);
    setCountdown(3);
    setPhase("countdown");

    let cd = 3;
    const cdTimer = setInterval(() => {
      cd -= 1;
      setCountdown(cd);
      if (cd <= 0) {
        clearInterval(cdTimer);
        // start playing
        setPhase("playing");
        const now = Date.now();
        setStartTime(now);
        setElapsed(0);
        timerRef.current = setInterval(() => {
          setElapsed((Date.now() - now) / 1000);
        }, 100);
      }
    }, 1000);
  }

  // Stop timer when finished/unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // When game finished
  useEffect(() => {
    if (phase === "finished" && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [phase]);

  function handleLetterClick(letter) {
    if (phase !== "playing") return;
    const expectedLetter = String.fromCharCode(65 + expectedIndex);
    if (letter === expectedLetter) {
      // correct
      setStatusMap((m) => ({ ...m, [letter]: "correct" }));
      const nextIndex = expectedIndex + 1;
      setExpectedIndex(nextIndex);
      if (nextIndex >= 26) {
        // finished
        setPhase("finished");
      }
    } else {
      // wrong
      setStatusMap((m) => ({ ...m, [letter]: "wrong" }));
      // reset wrong color after short
      setTimeout(() => {
        setStatusMap((m) => ({ ...m, [letter]: "idle" }));
      }, 400);
    }
  }

  function handleSubmit() {
    // Example: show submitted
    setSubmitted(true);
    // Here you could POST to /api/saveScore with elapsed and username
  }

  function handleShare() {
    const text = `I completed Tap A→Z Rush in ${elapsed.toFixed(2)}s!`;
    if (navigator.share) {
      navigator
        .share({
          title: "Tap A→Z Rush",
          text,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      // fallback: copy to clipboard
      navigator.clipboard?.writeText(`${text} ${window.location.href}`);
      alert("Score copied to clipboard (fallback).");
    }
  }

  // Build grid of 7 rows x 4 cols = 28 cells.
  // Fill first 26 with shuffled letters, cell 26 -> Back button, cell 27 empty
  const gridCells = [];
  for (let i = 0; i < 28; i++) {
    if (i < 26) {
      gridCells.push({ type: "letter", value: shuffled[i] });
    } else if (i === 26) {
      gridCells.push({ type: "back" });
    } else {
      gridCells.push({ type: "empty" });
    }
  }

  // styles
  const styles = {
    container: {
      minHeight: "100vh",
      background: "#0000FF",
      color: "#fff",
      padding: "24px 18px 80px",
      fontFamily: "Arial, sans-serif",
      textAlign: "center",
    },
    title: { fontSize: 36, fontWeight: 900, margin: "6px 0" },
    playingAs: { opacity: 0.95, marginBottom: 12 },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      margin: "12px auto 24px",
      maxWidth: 920,
      padding: "4px",
      flexWrap: "wrap",
    },
    infoBox: {
      background: "rgba(255,255,255,0.12)",
      padding: "10px 16px",
      borderRadius: 12,
      minWidth: 140,
      fontWeight: 700,
    },
    gridWrap: { maxWidth: 720, margin: "8px auto 16px" },
    nextLabel: { fontSize: 18, fontWeight: 800, margin: "10px 0" },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    box: {
      background: "#fff",
      color: "#0000FF",
      height: 78,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      fontWeight: 900,
      fontSize: 22,
      cursor: "pointer",
      userSelect: "none",
      boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
      transition: "transform .08s ease, background .12s ease, color .08s ease",
    },
    boxCorrect: { background: "#d4f8e0", color: "#007a37", transform: "scale(0.98)" },
    boxWrong: { background: "#ffdfe0", color: "#b30000", transform: "scale(0.98)" },
    backButton: {
      background: "#fff",
      color: "#000",
      padding: "10px 12px",
      borderRadius: 10,
      fontWeight: 800,
      height: 48,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
    },
    footerButtons: { marginTop: 18, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
    actionBtn: {
      padding: "10px 18px",
      borderRadius: 12,
      background: "#fff",
      color: "#0000FF",
      fontWeight: 800,
      border: "none",
      cursor: "pointer",
    },
  };

  const nextLetter = expectedIndex < 26 ? String.fromCharCode(65 + expectedIndex) : "-";

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={styles.title}>Tap A → Z Rush</div>
        <div style={styles.playingAs}>{userLabel}</div>

        {/* TOP LINE: Timer + Next (in one line) and Back */}
        <div style={styles.topRow}>
          <div style={{ ...styles.infoBox, textAlign: "center" }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Timer</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>
              {phase === "countdown"
                ? `Starting in ${countdown}s`
                : (phase === "playing" || phase === "finished")
                ? `${(elapsed || 0).toFixed(2)} s`
                : "0.00 s"}
            </div>
          </div>

          <div style={{ ...styles.infoBox, textAlign: "center" }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Next</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{nextLetter}</div>
          </div>

          {/* Back on the right */}
          <div style={{ marginLeft: "auto" }}>
            <Link href="/">
              <a style={styles.backButton}>Back</a>
            </Link>
          </div>
        </div>

        {/* "Next: X" label */}
        <div style={styles.nextLabel}>Next: {nextLetter}</div>

        {/* Grid */}
        <div style={styles.gridWrap}>
          <div style={styles.grid}>
            {gridCells.map((cell, idx) => {
              if (cell.type === "letter") {
                const letter = cell.value;
                const status = statusMap[letter];
                return (
                  <div
                    key={`c-${idx}-${letter}`}
                    onClick={() => handleLetterClick(letter)}
                    role="button"
                    aria-label={`letter-${letter}`}
                    style={{
                      ...styles.box,
                      ...(status === "correct" ? styles.boxCorrect : {}),
                      ...(status === "wrong" ? styles.boxWrong : {}),
                      opacity: status === "correct" ? 0.9 : 1,
                      pointerEvents: phase === "playing" && status !== "correct" ? "auto" : status === "correct" ? "none" : "auto",
                    }}
                  >
                    {letter}
                  </div>
                );
              } else if (cell.type === "back") {
                return (
                  <div key={`back-${idx}`} style={{ display: "flex", justifyContent: "center" }}>
                    <Link href="/">
                      <a style={styles.backButton}>Back</a>
                    </Link>
                  </div>
                );
              } else {
                return <div key={`empty-${idx}`} />;
              }
            })}
          </div>
        </div>

        {/* Footer area: controls / play / submit / share */}
        <div style={styles.footerButtons}>
          {phase === "idle" && (
            <button onClick={startGame} style={styles.actionBtn}>
              Play
            </button>
          )}

          {phase === "countdown" && <div style={{ ...styles.infoBox }}>Get ready...</div>}

          {phase === "playing" && (
            <div style={{ ...styles.infoBox }}>Playing — tap the letters in order A → Z</div>
          )}

          {phase === "finished" && (
            <>
              <div style={{ width: "100%", textAlign: "center", marginTop: 12 }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>
                  Completed in {(elapsed || 0).toFixed(3)}s
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={handleSubmit} style={styles.actionBtn}>
                    {submitted ? "Submitted ✓" : "Submit Score"}
                  </button>

                  <button
                    onClick={() => {
                      // reset to play again
                      setPhase("idle");
                      setElapsed(0);
                      setStartTime(null);
                      setStatusMap(Object.fromEntries(ALPHABET.map((l) => [l, "idle"])));
                      setExpectedIndex(0);
                    }}
                    style={styles.actionBtn}
                  >
                    Play again
                  </button>

                  <Link href="/leaderboard">
                    <a style={{ ...styles.backButton, display: "inline-flex", alignItems: "center" }}>See Leaderboard</a>
                  </Link>

                  <button onClick={handleShare} style={styles.actionBtn}>
                    Share
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
