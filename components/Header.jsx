export default function Header({ username }) {
  const display = username ? `@${username}` : "Not connected (playing as anonymous)";
  return (
    <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff" }}>
      <div style={{ fontWeight: 800, fontSize: 20 }}>Tap A → Z Rush</div>
      <div style={{ fontSize: 12, opacity: 0.95 }}>{display}</div>
    </div>
  );
}
