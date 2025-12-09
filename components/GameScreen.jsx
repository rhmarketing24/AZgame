"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

/**
 * GameScreen.jsx
 *
 * - Paste this file to components/GameScreen.jsx (replace existing)
 * - Designed as a self-contained client component with inline styles
 *
 * Behavior:
 *  - Visit home -> Play -> 3s countdown -> game starts
 *  - Board letters are shuffled and shown as buttons
 *  - Must click letters in A -> Z order. "Next" shows target letter.
 *  - Correct click: green flash. Wrong click: red flash.
 *  - Game UI: Playing as, Timer, Next, shuffled preview, Back
 *  - After finishing: Submit / See Leaderboard / Back / Play again / Share
 */

const ALPHABET = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GameScreen() {
  // user detection (host-provided globals sometimes set by Base/minikit)
  const [userLabel, setUserLabel] = useState("@anonymous");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const maybe =
        window.__MINIKIT_USER__ ||
        window.__minikit_user__ ||
        window.minikitUser ||
        window.__MINIKIT_USER_EAPI__ ||
        null;
      if (maybe && typeof maybe === "object") {
        // try shape with username or displayName
        const name = maybe.username || maybe.name || maybe.displayName;
        if (name) {
          setUserLabel("@" + name);
          return;
        }
      }
      // fallback to global string if set
      if (window.MINIKIT_USERNAME) {
        setUserLabel("@" + window.MINIKIT_USERNAME);
        return;
      }
    }
    setUserLabel("@anonymous");
  }, []);

  // Game UI state
  const [phase, setPhase] = useState("home"); // home | countdown | playing | finished
  const [countdown, setCountdown] = useState(3);
  const [shuffled, setShuffled] = useState(() => shuffleArray(ALPHABET));
  const [targetIndex, setTargetIndex] = useState(0); // 0..25
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // UI feedback per-letter: "normal" | "correct" | "wrong"
  const [feedback, setFeedback] = useState({}); // { "A": "correct" }

  // finished score (seconds)
  const [scoreSeconds, setScoreSeconds] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Reset game helper
  function resetGame() {
    setShuffled(shuffleArray(ALPHABET));
    setTargetIndex(0);
    setStartTime(null);
    setElapsed(0);
    setScoreSeconds(null);
    setSubmitted(false);
    setFeedback({});
    setPhase("home");
    clearInterval(timerRef.current);
    timerRef.current = null;
  }

  // start countdown then game
  function onStartClick() {
    setPhase("countdown");
    setCountdown(3);
    let c = 3;
    const cd = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(cd);
        startPlaying();
      }
    }, 1000);
  }

  function startPlaying() {
    setPhase("playing");
    setStartTime(Date.now());
    // start elapsed timer
    timerRef.current = setInterval(() => {
      setElapsed((Date.now() - (startTime || Date.now())) / 1000);
    }, 100);
    // ensure startTime correctly set
    setStartTime(Date.now());
  }

  // Keep elapsed accurate using effect when startTime changes
  useEffect(() => {
    if (!startTime) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 100);
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [startTime]);

  // Stop timer when finished
  useEffect(() => {
    if (phase === "finished") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [phase]);

  // derived
  const nextLetter = ALPHABET[targetIndex] || null;

  // Handler when user clicks a letter button
  function handleLetterClick(letter) {
    if (phase !== "playing") return;
    if (!nextLetter) return;

    if (letter === nextLetter) {
      // correct
      setFeedback((f) => ({ ...f, [letter]: "correct" }));
      // small delay to show green, then advance
      setTimeout(() => {
        setFeedback((f) => ({ ...f, [letter]: "normal" }));
      }, 350);

      const newIndex = targetIndex + 1;
      if (newIndex >= ALPHABET.length) {
        // finished
        setTargetIndex(newIndex);
        finishGame();
      } else {
        setTargetIndex(newIndex);
      }
    } else {
      // wrong
      setFeedback((f) => ({ ...f, [letter]: "wrong" }));
      setTimeout(() => {
        setFeedback((f) => ({ ...f, [letter]: "normal" }));
      }, 450);
    }
  }

  function finishGame() {
    // stop timer, set score
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const final = (Date.now() - (startTime || Date.now())) / 1000;
    setScoreSeconds(final);
    setElapsed(final);
    setPhase("finished");
  }

  // Submit (example: calls /api/saveScore if exists) - here just simulate
  async function submitScore() {
    if (!scoreSeconds) return;
    try {
      // Optionally: call your /api/saveScore endpoint with fetch
      // const res = await fetch('/api/saveScore', { method:'POST', body: JSON.stringify({ player: userLabel, score_seconds: scoreSeconds }) })
      // if (res.ok) { ... }

      // For now we simulate successful submit
      setSubmitted(true);
    } catch (err) {
      console.error("submit error", err);
      alert("Failed to submit score.");
    }
  }

  // Share: use Web Share API if available, else copy text
  async function onShare() {
    const text = `I completed Tap A→Z Rush in ${scoreSeconds?.toFixed(2)}s — ${userLabel}`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Tap A→Z Rush", text, url });
      } catch (e) {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert("Score text copied to clipboard. Share it!");
      } catch (e) {
        alert("Sharing not available.");
      }
    }
  }

  // Render helpers: inline styles
  const styles = {
    page: {
      minHeight: "100vh",
      background: "#0000FF",
      color: "#FFFFFF",
      fontFamily: "Arial, Helvetica, sans-serif",
      padding: 20,
      boxSizing: "border-box",
      textAlign: "center",
    },
    headerTitle: {
      fontSize: 36,
      fontWeight: 800,
      margin: "10px 0 4px 0",
    },
    smallText: { opacity: 0.95 },
    topRow: {
      display: "flex",
      justifyContent: "center",
      gap: 20,
      alignItems: "center",
      marginBottom: 18,
      marginTop: 8,
    },
    badge: {
      background: "rgba(255,255,255,0.12)",
      padding: "8px 14px",
      borderRadius: 10,
      fontWeight: 700,
      minWidth: 140,
    },
    nextBox: {
      fontWeight: 800,
      fontSize: 18,
      marginTop: 6,
    },
    controls: { marginTop: 18 },
    bigPlay: {
      padding: "14px 28px",
      background: "#fff",
      color: "#0000FF",
      borderRadius: 999,
      border: "none",
      fontWeight: 800,
      fontSize: 18,
      cursor: "pointer",
    },
    secondaryBtn: {
      marginLeft: 10,
      padding: "10px 16px",
      borderRadius: 10,
      background: "transparent",
      color: "#fff",
      border: "2px solid rgba(255,255,255,0.18)",
      cursor: "pointer",
    },
    boardWrap: {
      margin: "20px auto",
      maxWidth: 480,
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 14,
      justifyContent: "center",
    },
    letterBtn: {
      background: "#fff",
      color: "#0000FF",
      height: 72,
      borderRadius: 14,
      border: "none",
      fontSize: 22,
      fontWeight: 800,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 6px 12px rgba(0,0,0,0.12)",
      transition: "transform 0.08s ease, background 0.12s ease",
    },
    backLink: {
      display: "inline-block",
      marginTop: 10,
      padding: "8px 12px",
      borderRadius: 8,
      background: "rgba(255,255,255,0.95)",
      color: "#000",
      textDecoration: "none",
    },
    footerBtns: {
      marginTop: 20,
      display: "flex",
      gap: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    smallGhost: {
      padding: "8px 12px",
      borderRadius: 8,
      background: "#eee",
      color: "#000",
      cursor: "pointer",
    },
    statusGreen: { background: "#3CE08A", color: "#062F1A" },
    statusRed: { background: "#FF6B6B", color: "#3B0A0A" },
  };

  // dynamic style for letter (correct/wrong)
  function letterStyle(letter) {
    const f = feedback[letter] || "normal";
    const base = { ...styles.letterBtn };
    if (f === "correct") {
      return { ...base, background: "#E9FFF3", color: "#0A8C4A", transform: "scale(0.98)" };
    }
    if (f === "wrong") {
      return { ...base, background: "#FFECEC", color: "#A60F0F", transform: "scale(0.98)" };
    }
    return base;
  }

  // show preview small boxes (randomized) — optional small row
  const preview = useMemo(() => shuffleArray(ALPHABET).slice(0, 8), []);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={styles.headerTitle}>Tap A → Z Rush</div>
        <div style={styles.smallText}>Playing as {userLabel}</div>

        {/* top row: timer + next + preview + back */}
        <div style={styles.topRow}>
          <div style={styles.badge}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Timer</div>
            <div style={{ fontSize: 18, marginTop: 4, fontWeight: 900 }}>
              {phase === "playing" || phase === "finished"
                ? `${(elapsed || 0).toFixed(2)} s`
                : phase === "countdown"
                ? `Starting in ${countdown}s`
                : "Ready"}
            </div>
          </div>

          <div style={styles.badge}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Next</div>
            <div style={{ fontSize: 18, marginTop: 4, fontWeight: 900 }}>
              {nextLetter || "-"}
            </div>
          </div>

          <div style={{ ...styles.badge, minWidth: 220 }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Preview</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 6, flexWrap: "wrap" }}>
              {preview.map((p) => (
                <div key={p} style={{ background: "rgba(255,255,255,0.14)", padding: "6px 8px", borderRadius: 8, fontWeight: 800 }}>{p}</div>
              ))}
            </div>
          </div>

          <div>
            <Link href="/">
              <a style={styles.backLink}>Back</a>
            </Link>
          </div>
        </div>

        {/* Main controls area */}
        <div style={styles.controls}>
          {phase === "home" && (
            <>
              <div style={{ marginTop: 8, marginBottom: 12 }}>
                <button style={styles.bigPlay} onClick={onStartClick}>
                  Play
                </button>
              </div>
              <div>
                <button style={styles.secondaryBtn} onClick={() => window.location.href = "/leaderboard"}>
                  Leaderboard
                </button>
              </div>
              <div style={{ marginTop: 14, opacity: 0.9 }}>Tap A→Z as fast as you can!</div>
            </>
          )}

          {phase === "countdown" && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 42, fontWeight: 800 }}>{countdown}</div>
              <div style={{ marginTop: 8 }}>Get ready...</div>
            </div>
          )}

          {(phase === "playing" || phase === "finished") && (
            <>
              <div style={{ marginTop: 10, fontWeight: 700, fontSize: 20 }}>
                {phase === "playing" ? `Next: ${nextLetter}` : `Completed in ${scoreSeconds?.toFixed(3)}s`}
              </div>

              {/* Board */}
              {phase === "playing" && (
                <div style={styles.boardWrap}>
                  {shuffled.map((L) => (
                    <button
                      key={L}
                      onClick={() => handleLetterClick(L)}
                      style={letterStyle(L)}
                      aria-label={`Letter ${L}`}
                    >
                      {L}
                    </button>
                  ))}
                </div>
              )}

              {/* finished controls */}
              {phase === "finished" && (
                <div>
                  <div style={{ marginTop: 18 }}>
                    {!submitted ? (
                      <button
                        onClick={submitScore}
                        style={{ ...styles.bigPlay, background: "#fff", color: "#0000FF" }}
                      >
                        Submit Score
                      </button>
                    ) : (
                      <div style={{ ...styles.bigPlay, background: "#eee", color: "#222" }}>Submitted ✓</div>
                    )}
                  </div>

                  <div style={styles.footerBtns}>
                    <button onClick={() => { resetGame(); }} style={styles.smallGhost}>Back</button>
                    <button onClick={() => { window.location.href = "/leaderboard"; }} style={styles.smallGhost}>See Leaderboard</button>
                    <button onClick={() => { // play again
                      // quick restart: reshuffle and start countdown
                      setShuffled(shuffleArray(ALPHABET));
                      setTargetIndex(0);
                      setScoreSeconds(null);
                      setSubmitted(false);
                      setPhase("countdown");
                      setCountdown(3);
                      let c = 3;
                      const cd = setInterval(() => {
                        c -= 1;
                        setCountdown(c);
                        if (c <= 0) {
                          clearInterval(cd);
                          startPlaying();
                        }
                      }, 1000);
                    }} style={styles.smallGhost}>Play again</button>

                    <button onClick={onShare} style={styles.smallGhost}>Share</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
