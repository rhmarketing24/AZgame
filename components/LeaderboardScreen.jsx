"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function LeaderboardScreen() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => setScores(d.data || []));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0000FF",
        color: "#fff",
        padding: 20,
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 900 }}>Leaderboard</h1>

      <div style={{ marginTop: 20 }}>
        {scores.map((s, i) => (
          <div
            key={i}
            style={{
              padding: "10px 14px",
              background: "rgba(255,255,255,0.15)",
              borderRadius: 10,
              margin: "8px auto",
              width: "260px",
              fontWeight: 700,
            }}
          >
            {i + 1}. @{s.username} — {s.time}s
          </div>
        ))}

        {scores.length === 0 && <p>No scores yet.</p>}
      </div>

      <Link href="/">
        <button
          style={{
            marginTop: 20,
            padding: "10px 16px",
            borderRadius: 10,
            background: "#fff",
            color: "#0000FF",
            fontWeight: 900,
          }}
        >
          Back
        </button>
      </Link>
    </div>
  );
}
