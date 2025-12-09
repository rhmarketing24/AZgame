import { useEffect, useMemo, useRef, useState } from "react";
import Countdown from "./Countdown";
import FinishScreen from "./FinishScreen";
import Header from "./Header";

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function GameScreen() {
  const allLetters = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), []);
  const [shuffled, setShuffled] = useState(() => shuffleArray(allLetters));
  const [index, setIndex] = useState(0); // current target index within sequence A→Z progression
  const [started, setStarted] = useState(false);
  const [countdownVisible, setCountdownVisible] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const [finished, setFinished] = useState(false);
  const [wrongMap, setWrongMap] = useState({}); // track wrong taps to show red
  const [best, setBest] = useState(() => {
    if (typeof window !== "undefined") {
      const b = localStorage.getItem("az_best");
      return b ? parseFloat(b) : null;
    }
    return null;
  });

  // show countdown when arriving game page or after play again
  useEffect(() => {
    setCountdownVisible(true);
  }, []);

  useEffect(() => {
    if (started) {
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTime((Date.now() - startRef.current) / 1000);
      }, 50);
    } else {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      clearInterval(timerRef.current);
    };
  }, [started]);

  const handleCountdownFinish = () => {
    setCountdownVisible(false);
    setStarted(true);
  };

  // current target is the letter at position `index` in A→Z order
  const targetLetter = allLetters[index];

  const handleLetterClick = (letter) => {
    if (!started || finished) return;

    // if wrong, mark wrongMap for visual flash (but game continues)
    if (letter !== targetLetter) {
      setWrongMap((m) => ({ ...m, [letter]: true }));
      // clear flash after short time
      setTimeout(() => {
        setWrongMap((m) => {
          const copy = { ...m };
          delete copy[letter];
          return copy;
        });
      }, 300);
      return;
    }

    // correct letter
    setIndex((i) => {
      const next = i + 1;
      if (next >= allLetters.length) {
        // finished
        setStarted(false);
        setFinished(true);
        // stop timer and finalize time
        const final = (Date.now() - startRef.current) / 1000;
        setTime(final);
        // update best
        if (!best || final < best) {
          localStorage.setItem("az_best", final.toFixed(3));
          setBest(final);
        }
      }
      return next;
    });
  };

  const handlePlayAgain = () => {
    setShuffled(shuffleArray(allLetters));
    setIndex(0);
    setFinished(false);
    setTime(0);
    setCountdownVisible(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0000FF", color: "#fff", paddingBottom: 40 }}>
      <Header />
      <div style={{ textAlign: "center", padding: "8px 14px" }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Best: {best ? `${best.toFixed(2)} s` : "--"}</div>
        <div style={{ marginTop: 8, fontSize: 24, fontWeight: 800 }}>{time.toFixed(2)} s</div>
        <div style={{ marginTop: 8, fontSize: 20 }}>Target: <span style={{ background: "#fff", color: "#0000FF", padding: "6px 12px", borderRadius: 10, fontWeight:800 }}>{targetLetter}</span></div>
      </div>

      {/* grid */}
      <div id="board" style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        maxWidth: 420,
        margin: "18px auto",
        padding: "0 12px"
      }}>
        {shuffled.map((c) => {
          const isWrong = !!wrongMap[c];
          return (
            <button key={c}
              onClick={() => handleLetterClick(c)}
              className="letter"
              style={{
                background: isWrong ? "#ff6b6b" : "#fff",
                color: isWrong ? "#fff" : "#0000FF",
                height: 72,
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 22,
                boxShadow: "0 6px 12px rgba(0,0,0,0.18)",
                transition: "transform .08s ease, background .15s ease",
              }}>
              {c}
            </button>
          );
        })}
      </div>

      {/* small footer controls */}
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <button onClick={() => { setShuffled(shuffleArray(allLetters)); setIndex(0); setTime(0); }} style={{
          padding: "8px 12px", borderRadius: 10, background: "transparent", border: "2px solid rgba(255,255,255,0.14)", color: "#fff"
        }}>Retry</button>
      </div>

      {countdownVisible && <Countdown onFinish={handleCountdownFinish} />}

      {finished && <FinishScreen time={time} lettersCompleted={allLetters.length} onPlayAgain={handlePlayAgain} />}

    </div>
  );
}
