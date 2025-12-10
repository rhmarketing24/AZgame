import { useEffect, useState } from 'react';
export default function LeaderboardScreen(){
  const [list, setList] = useState([]);
  useEffect(()=> {
    fetch('/api/leaderboard').then(r=>r.json()).then(d=> setList(d.data || []));
  },[]);
  return (
    <div className="container center">
      <h2>Leaderboard</h2>
      <ol style={{textAlign:'left',maxWidth:400}}>
        {list.map((row, i)=> <li key={i}>{row.username} — {row.time}s</li>)}
      </ol>
    </div>
  );
}
