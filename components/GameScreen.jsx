"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

/**
 * GameScreen.jsx
 *
 * Behavior:
 * - If URL has ?start=1 the countdown starts automatically on mount.
 * - Otherwise the player must press the Play button on this screen to start the 3s countdown.
 * - Next letter required is strictly A -> Z order (not random).
 * - Grid shows shuffled letters. Correct click -> green, wrong -> red briefly.
 * - Timer runs while playing. On finish show final screen with Submit / Leaderboard / Play again / Back.
 * - Submit posts to /api/saveScore (expects existing endpoint). Replace as needed.
 */

export default function GameScreen() {
  const router = useRouter();
  const { searchParams } = typeof window !== "undefined" ? new URL(window.location.href) : {};
  const autoStart = searchParams ? searchParams.get("start") === "1" : false;

  // State
  const [shuffled, setShuffled] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // 0 => need 'A'
  const [status, setStatus] = useState("idle"); // idle | counting | playing | finished
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0); // seconds as float
  const [tileStates, setTileStates] = useState({}); // { 'A': 'ok'|'wrong' }
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Try to detect host-provided username (minikit / base / etc), fallback to anonymous
  const getHostUsername = () => {
    try {
      const maybe =
        (typeof window !== "undefined" && (window.__MINIKIT_USER__ || window.minikitUser || window.__minikit_user__)) ||
        (typeof window !== "undefined" && window.Base?.user) ||
        null;
      if (maybe && typeof maybe === "object") {
        // might have .username or .address or .name
        return maybe.username || maybe.handle || maybe.address || maybe.name || "@user";
      } else if (typeof maybe === "string") {
        return maybe;
      }
    } catch (e) {
      // ignore
    }
    return "@anonymous";
  };
  const [username] = useState(getHostUsername());

  // Utility: build base alphabet A..Z
  const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  useEffect(() => {
    // create shuffled tiles
    const arr = [...ALPHABET];
    // simple Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffled(arr);
    // if autoStart param present, start countdown
    if (autoStart) {
      startCountdown();
    }
    // cleanup on unmount
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown effect
  useEffect(() => {
    if (status !== "counting") return;
    if (countdown <= 0) {
      // start game
      setStatus("playing");
      setCountdown(0);
      startGameTimer();
      return;
    }
    const id = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [status, countdown]);

  // Timer updater
  const startGameTimer = () => {
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const diff = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(parseFloat(diff.toFixed(3)));
    }, 100);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    setStatus("counting");
    setCurrentIndex(0);
    setTileStates({});
    setElapsed(0);
    setSubmitted(false);
  };

  const handleClickLetter = (letter) => {
    if (status !== "playing") return;
    const needed = String.fromCharCode(65 + currentIndex); // A + index
    if (letter === needed) {
      // correct
      setTileStates((s) => ({ ...s, [letter]: "ok" }));
      setCurrentIndex((i) => {
        const next = i + 1;
        if (next >= 26) {
          // finished
          stopTimer();
          setStatus("finished");
          setElapsed((Date.now() - startTimeRef.current) / 1000);
        }
        return next;
      });
    } else {
      // wrong flash
      setTileStates((s) => ({ ...s, [letter]: "wrong" }));
      // remove wrong state shortly
      setTimeout(() => {
        setTileStates((s) => {
          const copy = { ...s };
          if (copy[letter] === "wrong") delete copy[letter];
          return copy;
        });
      }, 450);
    }
  };

  const handleSubmit = async () => {
    if (submitted || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/saveScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, time: elapsed }),
      });
      if (!res.ok) {
        console.error("submit failed", await res.text());
        alert("Score submit failed");
      } else {
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
      alert("Network error while submitting");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlayAgain = () => {
    // reshuffle & reset
    const arr = [...ALPHABET];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffled(arr);
    setCurrentIndex(0);
    setTileStates({});
    setElapsed(0);
    setSubmitted(false);
    setStatus("idle");
    // start countdown
    startCountdown();
  };

  const handleBack = () => {
    stopTimer();
    router.push("/");
  };

  // compute grid rows: we need 7 rows: first 6 rows of 4, last row 2
  // We'll take from shuffled array sequentially
  const gridRows = [];
  let used = 0;
  for (let r = 0; r < 6; r++) {
    gridRows.push(shuffled.slice(used, used + 4));
    used += 4;
  }
  // last row 2 letters (remaining)
  gridRows.push(shuffled.slice(used, used + 2));

  // Next letter to be clicked
  const nextLetter = currentIndex < 26 ? String.fromCharCode(65 + currentIndex) : "-";

  // Simple inline style helpers (you can replace with your CSS later)
  const styles = {
    page: { minHeight: "100vh", padding: 16, background: "#0000FF", color: "#fff", fontFamily: "Arial, sans-serif", textAlign: "center" },
    title: { fontSize: 48, fontWeight: 900, marginBottom: 6 },
    small: { opacity: 0.95 },
    topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, maxWidth: 960, margin: "12px auto" },
    box: { background: "rgba(255,255,255,0.06)", padding: "18px 20px", borderRadius: 12, minWidth: 120 },
    timerBig: { fontSize: 20, fontWeight: 800 },
    nextBox: { minWidth: 86, padding: "14px 18px", fontWeight: 800, fontSize: 18 },
    previewBox: { display: "flex", gap: 8, alignItems: "center", justifyContent: "center", padding: "12px", borderRadius: 12 },
    gridWrap: { maxWidth: 720, margin: "8px auto 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 28, justifyItems: "center" },
    tile: { width: 84, height: 84, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", color: "#0000FF", fontWeight: 800, fontSize: 22, borderRadius: 14, cursor: "pointer", userSelect: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" },
    tileSmall: { width: 68, height: 68 },
    bottomButtons: { marginTop: 18, display: "flex", justifyContent: "center", gap: 12 },
    backBtn: { padding: "8px 14px", borderRadius: 8, background: "#fff", color: "#0000FF", border: "none", cursor: "pointer" },
    submitBtn: { padding: "12px 20px", borderRadius: 12, background: "#fff", color: "#0000FF", fontWeight: 700, border: "none", cursor: "pointer" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.title}>Tap A → Z Rush</div>
      <div style={styles.small}>Playing as <strong style={{ color: "#fff" }}>{username}</strong></div>

      {/* Top row: Timer | center username (or empty) | Next */}
      <div style={styles.topRow}>
        <div style={{ ...styles.box, textAlign: "left" }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Timer</div>
          <div style={styles.timerBig}>{(status === "playing" || status === "finished") ? `${elapsed.toFixed(3)} s` : (status === "counting" ? `${countdown} s` : `0.000 s`)}</div>
        </div>

        <div style={{ ...styles.box, flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Player</div>
          <div style={{ fontWeight: 800 }}>{username}</div>
        </div>

        <div style={{ ...styles.box, textAlign: "right" }}>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Next</div>
          <div style={styles.nextBox}>{nextLetter}</div>
        </div>
      </div>

      {/* Preview area (optional) - small tiles of some upcoming letters (we fill with first 6 shuffled) */}
      {/* removed heavy preview requirement from brief; keep small visual */}
      <div style={{ maxWidth: 880, margin: "14px auto" }}>
        {status === "idle" && (
          <div style={{ marginBottom: 8 }}>
            <button style={{ ...styles.submitBtn }} onClick={() => startCountdown()}>Play</button>
            <button onClick={() => router.push("/leaderboard")} style={{ marginLeft: 10, ...styles.backBtn }}>Leaderboard</button>
          </div>
        )}
      </div>

      {/* If counting show big countdown */}
      {status === "counting" && (
        <div style={{ fontSize: 36, fontWeight: 900, margin: "10px 0" }}>Starting in {countdown}...</div>
      )}

      {/* If playing or finished show Next text */}
      {(status === "playing" || status === "finished") && (
        <div style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>Next: {nextLetter}</div>
      )}

      {/* Grid */}
      <div style={{
        maxWidth: 760,
        margin: "18px auto",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 24,
        justifyItems: "center"
      }}>
        {/*
          We'll render gridRows (6 rows of 4 + final row 2) while preserving layout.
          Use placeholders for empty cells in last row.
        */}
        {gridRows.map((row, rowIndex) => {
          // If it's the last row (index 6) we want only 2 letters and then a Back button on the right of that row.
          if (rowIndex < 6) {
            // render 4 tiles (if less than 4 fill blanks)
            return row.map((letter, idx) => {
              const key = `${rowIndex}-${idx}`;
              const state = tileStates[letter];
              const bg = state === "ok" ? "#28a745" : state === "wrong" ? "#dc3545" : "#fff";
              const color = state ? "#fff" : "#0000FF";
              return (
                <div
                  key={key}
                  onClick={() => handleClickLetter(letter)}
                  style={{ ...styles.tile, background: bg, color }}
                >
                  {letter || ""}
                </div>
              );
            });
          } else {
            // last row (2 letters). We'll render 2 tiles, then two placeholders (empty) where one of placeholders we'll show Back button inside.
            const first = row[0] || null;
            const second = row[1] || null;
            // Render first tile
            const cells = [];
            const stateA = tileStates[first];
            const bgA = stateA === "ok" ? "#28a745" : stateA === "wrong" ? "#dc3545" : "#fff";
            const colorA = stateA ? "#fff" : "#0000FF";
            cells.push(
              <div key={`last-0`} onClick={() => first && handleClickLetter(first)} style={{ ...styles.tile, background: bgA, color: colorA }}>
                {first || ""}
              </div>
            );
            // second tile
            const stateB = tileStates[second];
            const bgB = stateB === "ok" ? "#28a745" : stateB === "wrong" ? "#dc3545" : "#fff";
            const colorB = stateB ? "#fff" : "#0000FF";
            cells.push(
              <div key={`last-1`} onClick={() => second && handleClickLetter(second)} style={{ ...styles.tile, background: bgB, color: colorB }}>
                {second || ""}
              </div>
            );
            // third cell placeholder
            cells.push(
              <div key={`last-2`} style={{ width: 84, height: 84 }} />
            );
            // fourth cell -> back button (so it's visually at right of last row)
            cells.push(
              <div key={`last-3`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 84, height: 84 }}>
                <button onClick={handleBack} style={{ padding: "8px 12px", borderRadius: 8, background: "#fff", color: "#0000FF", border: "none", cursor: "pointer" }}>
                  Back
                </button>
              </div>
            );
            return cells;
          }
        })}
      </div>

      {/* finished actions */}
      {status === "finished" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>Completed in {elapsed.toFixed(3)}s</div>
          <div style={styles.bottomButtons}>
            {!submitted ? (
              <button onClick={handleSubmit} style={styles.submitBtn} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Score"}
              </button>
            ) : (
              <button style={{ ...styles.submitBtn, opacity: 0.8 }} disabled>Submitted ✓</button>
            )}

            <button onClick={() => router.push("/leaderboard")} style={styles.backBtn}>See Leaderboard</button>
            <button onClick={handlePlayAgain} style={styles.backBtn}>Play Again</button>
            <button onClick={handleBack} style={styles.backBtn}>Back</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 28, opacity: 0.85, fontSize: 13 }}>
        Tip: Click the tiles in **A → Z** order. Correct ones turn green, wrong ones flash red.
      </div>
    </div>
  );
}
