import { useEffect, useState } from "react";

export default function Countdown({ onFinish }) {
  const [count, setCount] = useState(3);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return;
    if (count === 0) {
      setRunning(false);
      // small delay to show GO
      setTimeout(() => {
        onFinish && onFinish();
      }, 300);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 800);
    return () => clearTimeout(t);
  }, [count, running, onFinish]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999,
      pointerEvents: "none"
    }}>
      <div style={{
        pointerEvents: "auto",
        background: "rgba(0,0,0,0.5)",
        color: "#fff",
        padding: 28,
        borderRadius: 12,
        fontSize: 48,
        fontWeight: 800,
        textAlign: "center",
        minWidth: 160
      }}>
        {count === 0 ? "GO!" : count}
      </div>
    </div>
  );
}
