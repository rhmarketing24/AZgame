"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

/**
 * Complete Game screen component for A→Z Rush
 * - shuffle letters each game
 * - shows Next and timer
 * - visual feedback for correct/wrong (adds .correct/.wrong classes)
 * - finish screen with Submit Score (posts to /api/saveScore)
 * - Back button during game (stops timer and returns)
 */

const ALPHABET = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

function shuffleArray(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function GameScreen() {
  const router = useRouter();

  const [letters, setLetters] = useState(() => shuffleArray(ALPHABET));
  const [nextIndex, setNextIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userName, setUserName] = useState(null);
  const timerRef = useRef(null);

  // Try to detect host-provided user (minikit/base) safely
  useEffect(() => {
    const maybe =
      typeof window !== "undefined" &&
      (window.__MINIKIT_USER__ || window.minikitUser || window.__minikit_user__);
    if (maybe) {
      // If it's an object, try pick a username or handle
      if (typeof maybe === "object") {
        setUserName(maybe.username || maybe.name || maybe.handle || "@user");
      } else {
        setUserName(String(maybe));
      }
    } else {
      setUserName("@anonymous");
    }
  }, []);

  // start a new game
  useEffect(() => {
    startNewGame();
    // cleanup on unmount
    return () => {
      clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startNewGame() {
    clearInterval(timerRef.current);
    const shuffled = shuffleArray(ALPHABET);
    setLetters(shuffled);
    setNextIndex(0);
    setElapsed(0);
    setRunning(true);
    setFinished(false);
    setSubmitted(false);

    timerRef.current = setInterval(() => {
      setElapsed((e) => +(e + 0.01).toFixed(3));
    }, 10);
  }

  function stopGame() {
    clearInterval(timerRef.current);
    setRunning(false);
  }

  function markButtonFeedback(el, ok) {
    if (!el) return;
    el.classList.add(ok ? "correct" : "wrong");
    setTimeout(() => {
      el.classList.remove(ok ? "correct" : "wrong");
    }, 350);
  }

  function handleLetterClick(letter, evt) {
    if (!running) return;
    const btn = evt.currentTarget;
    const expected = letters[nextIndex];
    if (letter === expected) {
      // correct
      markButtonFeedback(btn, true);
      const ni = nextIndex + 1;
      if (ni >= letters.length) {
        // finished
        stopGame();
        setFinished(true);
        setNextIndex(ni);
      } else {
        setNextIndex(ni);
      }
    } else {
      // wrong
      markButtonFeedback(btn, false);
      // optional: add time penalty if desired
      // setElapsed(e => +(e + 0.5).toFixed(3));
    }
  }

  async function submitScore() {
    if (submitted) return;
    // Prepare payload
    const payload = {
      player_name: userName || "@anonymous",
      score_seconds: Number(elapsed.toFixed(3)),
      letters_completed: letters.length,
      mode: "normal",
    };

    try {
      const res = await fetch("/api/saveScore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Submit failed", await res.text());
        alert("Score submit failed.");
        return;
      }

      setSubmitted(true);
      alert("Score submitted ✓");
    } catch (err) {
      console.error(err);
      alert("Network error while submitting score.");
    }
  }

  function handleBack() {
    // stop and go back to home
    stopGame();
    router.push("/");
  }

  // small helper for display when finished
  function renderFinish() {
    return (
      <div style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 28, marginBottom: 12 }}>
          Completed in {elapsed.toFixed(3)}s
        </h2>

        {!submitted ? (
          <button
            onClick={submitScore}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              background: "#fff",
              color: "#0000FF",
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            Submit Score
          </button>
        ) : (
          <button
            disabled
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              background: "#eee",
              color: "#333",
              marginBottom: 12,
            }}
          >
            Submitted ✓
          </button>
        )}

        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => {
              startNewGame();
              // push to /game (we're already here) — just restart UI
            }}
            style={{
              marginRight: 8,
              padding: "8px 12px",
              borderRadius: 6,
            }}
          >
            Back
          </button>

          <Link href="/leaderboard">
            <button style={{ padding: "8px 12px", borderRadius: 6 }}>
              See Leaderboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0000FF",
        color: "#fff",
        padding: 16,
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: 44, marginTop: 8, marginBottom: 6 }}>
        Tap A → Z Rush
      </h1>

      <div style={{ fontSize: 12, opacity: 0.95, marginBottom: 14 }}>
        Playing as {userName ?? "@anonymous"}
      </div>

      {!finished ? (
        <>
          <div style={{ fontWeight: 700, marginTop: 8 }}>
            Next: {letters[nextIndex] ?? "-"}
          </div>
          <div style={{ marginTop: 6, fontWeight: 700 }}>
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
            {letters.map((c) => (
              <button
                key={c}
                className="game-button letter"
                onClick={(e) => handleLetterClick(c, e)}
                style={{
                  // you can override short inline styles; main css should handle looks
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => {
                // big Play button / restart
                if (!running) startNewGame();
              }}
              style={{
                padding: "12px 28px",
                borderRadius: 999,
                background: "#fff",
                color: "#0000FF",
                fontWeight: 800,
                fontSize: 18,
                marginBottom: 10,
              }}
            >
              {running ? "Playing..." : "Play"}
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <Link href="/leaderboard">
              <button
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  background: "transparent",
                  color: "#fff",
                  border: "2px solid rgba(255,255,255,0.18)",
                }}
              >
                Leaderboard
              </button>
            </Link>
          </div>

          <div style={{ marginTop: 12, opacity: 0.9 }}>
            <button
              onClick={handleBack}
              style={{
                marginTop: 12,
                padding: "6px 12px",
                borderRadius: 6,
                background: "#ffffff22",
                color: "#fff",
              }}
            >
              Back
            </button>
          </div>
        </>
      ) : (
        renderFinish()
      )}
    </div>
  );
}
