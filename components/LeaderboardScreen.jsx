import { useEffect, useState } from 'react';

export default function LeaderboardScreen(){
  const [list, setList] = useState([]);

  useEffect(()=> {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(d => {
        // API returns { data: [...] }
        setList(d.data || []);
      })
      .catch(e => {
        console.error('leaderboard fetch error', e);
        setList([]);
      });
  },[]);

  return (
    <div style={{padding:24, textAlign:'center', color:'#fff'}}>
      <h2>Leaderboard</h2>
      <ol style={{textAlign:'left', display:'inline-block', maxWidth:420}}>
        {list.map((row, i) => {
          const username = row.username ? row.username : '—';
          // Use score_seconds field from DB
          const seconds = typeof row.score_seconds === 'number' ? row.score_seconds.toFixed(3) : '—';
          return <li key={i}>{username} — {seconds} s</li>;
        })}
      </ol>
    </div>
  );
}
