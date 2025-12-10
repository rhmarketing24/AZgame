import { useEffect, useState } from 'react';
export default function LeaderboardScreen(){
  const [rows, setRows] = useState([]);
  useEffect(()=> { fetch('/api/leaderboard').then(r=>r.json()).then(d=>setRows(d.data||[])); },[]);
  return (
    <div className="container">
      <h1 className="header">Leaderboard</h1>
      <ol style={{textAlign:'left', maxWidth:600, margin:'18px auto'}}>
        {rows.map((r,i)=>(<li key={i}><strong>{r.username}</strong> — {r.time}s</li>))}
        {rows.length===0 && <p>No scores yet</p>}
      </ol>
    </div>
  );
}
