"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";

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

/**
 * Props:
 *  - autoStart (bool): যদি true হয়, mount হওয়ার পরে startGame() auto চালাবে (ব্যবহার Home থেকে)
 *  - compact (bool): ছোট বক্স চাইলে true
 *  - onBack (fn): back চাপলে কল হবে (optional)
 */
export default function GameScreen({ autoStart = false, compact = true, onBack }) {
  // host-provided user detection (best-effort)
  const maybeUser =
    (typeof window !== "undefined" &&
      (window.__MINIKIT_USER__ ||
        window.minikitUser ||
        window.__minikit_user__ ||
        (window?.parent && window.parent.__MINIKIT_USER__))) ||
    null;
  const userLabel = maybeUser?.username
    ? `@${maybeUser.username}`
    : "@anonymous";

  // shuffled layout
  const shuffled = useMemo(() => shuffle(ALPHABET), []);

  const [phase, setPhase] = useState("idle"); // idle, countdown, playing, finished
  const [countdown, setCountdown] = useState(3);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  const [expectedIndex, setExpectedIndex] = useState(0);
  const [statusMap, setStatusMap] = useState(() =>
    Object.fromEntries(ALPHABET.map((l) => [l, "idle"]))
  );

  const [submitted, setSubmitted] = useState(false);

  // Start sequence
  function startGame() {
    if (phase === "playing") return;
    setSubmitted(false);
    setStatusMap(Object.fromEntries(ALPHABET.map((l) => [l, "idle"])));
    setExpectedIndex(0);
    setCountdown(3);
    setPhase("countdown");

    let cd = 3;
    setCountdown(cd);
    const cdTimer = setInterval(() => {
      cd -= 1;
      setCountdown(cd);
      if (cd <= 0) {
        clearInterval(cdTimer);
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

  useEffect(() => {
    if (autoStart) {
      // small delay to ensure mount
      const t = setTimeout(() => startGame(), 200);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
      setStatusMap((m) => ({ ...m, [letter]: "correct" }));
      const nextIndex = expectedIndex + 1;
      setExpectedIndex(nextIndex);
      if (nextIndex >= 26) {
        setPhase("finished");
      }
    } else {
      setStatusMap((m) => ({ ...m, [letter]: "wrong" }));
      setTimeout(() => {
        setStatusMap((m) => ({ ...m, [letter]: "idle" }));
      }, 350);
    }
  }

  function handleSubmit() {
    setSubmitted(true);
    // TODO: POST to /api/saveScore (supabase) if desired
  }

  function handleShare() {
    const text = `I completed Tap A→Z Rush in ${elapsed.toFixed(2)}s!`;
    if (navigator.share) {
      navigator.share({ title: "Tap A→Z Rush", text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${text} ${window.location.href}`);
      alert("Score copied to clipboard.");
    }
  }

  // grid: 7 rows x 4 cols => 28 cells. first 26 letters, 27th cell = Back button, last empty
  const gridCells = [];
  for (let i = 0; i < 28; i++) {
    if (i < 26) gridCells.push({ type: "letter", value: shuffled[i] });
    else if (i === 26) gridCells.push({ type: "back" });
    else gridCells.push({ type: "empty" });
  }

  // styles (compact vs normal)
  const boxSize = compact ? 64 : 82;
  const boxFont = compact ? 20 : 24;

  const styles = {
    container: { minHeight: "100vh", background: "#0000FF", color: "#fff", padding: 20, fontFamily: "Arial, sans-serif", textAlign: "center" },
    title: { fontSize: 34, fontWeight: 900, margin: "8px 0" },
    topRowWrap: { maxWidth: 960, margin: "6px auto 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
    leftBox: { flex: "1 1 180px", textAlign: "left" },
    centerBox: { flex: "1 1 220px", textAlign: "center" },
    rightBox: { flex: "1 1 180px", textAlign: "right" },
    infoCard: { display: "inline-block", background: "rgba(255,255,255,0.12)", padding: "8px 14px", borderRadius: 10, fontWeight: 800, minWidth: 110 },
    nextLabel: { marginTop: 8, fontWeight: 800 },
    gridWrap: { maxWidth: 720, margin: "6px auto 12px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, justifyItems: "center" },
    box: { width: boxSize, height: boxSize, background: "#fff", color: "#0000FF", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: boxFont, cursor: "pointer", boxShadow: "0 6px 14px rgba(0,0,0,0.12)", transition: "all .08s ease" },
    boxCorrect: { background: "#d4f8e0", color: "#007a37", transform: "scale(0.98)" },
    boxWrong: { background: "#ffdfe0", color: "#b30000", transform: "scale(0.98)" },
    backBtn: { display: "inline-block", padding: "10px 12px", background: "#fff", color: "#000", borderRadius: 10, fontWeight: 800, boxShadow: "0 6px 12px rgba(0,0,0,0.12)" },
    actionsRow: { marginTop: 18, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" },
    actionBtn: { padding: "10px 16px", borderRadius: 12, background: "#fff", color: "#0000FF", fontWeight: 800, cursor: "pointer" },
  };

  const nextLetter = expectedIndex < 26 ? String.fromCharCode(65 + expectedIndex) : "-";

  return (
    <div style={styles.container}>
      <div style={styles.title}>Tap A → Z Rush</div>

      {/* top row: left = Timer, center = username, right = Next */}
      <div style={styles.topRowWrap}>
        <div style={styles.leftBox}>
          <div style={styles.infoCard}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Timer</div>
            <div style={{ fontSize: 16 }}>
              {phase === "countdown" ? `Starting in ${countdown}s` : (phase === "playing" || phase === "finished") ? `${(elapsed || 0).toFixed(2)} s` : "0.00 s"}
            </div>
          </div>
        </div>

        <div style={styles.centerBox}>
          <div style={{ fontSize: 14, opacity: 0.95 }}>Playing as</div>
          <div style={{ fontWeight: 900 }}>{userLabel}</div>
        </div>

        <div style={styles.rightBox}>
          <div style={styles.infoCard}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Next</div>
            <div style={{ fontSize: 16 }}>{nextLetter}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 6, fontWeight: 800 }}>Next: {nextLetter}</div>

      {/* grid */}
      <div style={styles.gridWrap}>
        <div style={styles.grid}>
          {gridCells.map((cell, idx) => {
            if (cell.type === "letter") {
              const letter = cell.value;
              const status = statusMap[letter];
              return (
                <div
                  key={`cell-${idx}-${letter}`}
                  onClick={() => handleLetterClick(letter)}
                  style={{
                    ...styles.box,
                    ...(status === "correct" ? styles.boxCorrect : {}),
                    ...(status === "wrong" ? styles.boxWrong : {}),
                    pointerEvents: status === "correct" ? "none" : "auto",
                    opacity: status === "correct" ? 0.95 : 1,
                  }}
                >
                  {letter}
                </div>
              );
            } else if (cell.type === "back") {
              return (
                <div key={`back-${idx}`} style={{ display: "flex", justifyContent: "center" }}>
                  {onBack ? (
                    <button onClick={onBack} style={styles.backBtn}>Back</button>
                  ) : (
                    <Link href="/">
                      <a style={styles.backBtn}>Back</a>
                    </Link>
                  )}
                </div>
              );
            } else {
              return <div key={`empty-${idx}`} />;
            }
          })}
        </div>
      </div>

      {/* bottom actions */}
      <div style={styles.actionsRow}>
        {phase === "idle" && <button onClick={startGame} style={styles.actionBtn}>Play</button>}
        {phase === "countdown" && <div style={styles.infoCard}>Get ready...</div>}
        {phase === "playing" && <div style={styles.infoCard}>Playing — click letters A → Z</div>}

        {phase === "finished" && (
          <>
            <div style={{ width: "100%", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Completed in {(elapsed || 0).toFixed(3)}s</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={handleSubmit} style={styles.actionBtn}>{submitted ? "Submitted ✓" : "Submit Score"}</button>
                <button onClick={() => { setPhase("idle"); setElapsed(0); setStartTime(null); setStatusMap(Object.fromEntries(ALPHABET.map((l) => [l, "idle"]))); setExpectedIndex(0); }} style={styles.actionBtn}>Play again</button>
                <Link href="/leaderboard"><a style={styles.backBtn}>See Leaderboard</a></Link>
                <button onClick={handleShare} style={styles.actionBtn}>Share</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
