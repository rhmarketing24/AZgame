import { useEffect, useState } from 'react';

export default function LeaderboardScreen(){
  const [scores,setScores] = useState([]);
  useEffect(()=>{
    fetch('/api/leaderboard').then(r=>r.json()).then(d=>{
      setScores(d.data||[]);
    }).catch(()=>setScores([]));
  },[]);
  return (
    <div style={{minHeight:'100vh', background:'#0000FF', color:'#fff', padding:20, fontFamily:'Arial, sans-serif'}}>
      <h2 style={{fontSize:28, fontWeight:900}}>Leaderboard</h2>
      <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:8, alignItems:'center'}}>
        {scores.length===0 && <div style={{opacity:0.9}}>No scores yet.</div>}
        {scores.map((s,i)=>(
          <div key={i} style={{background:'rgba(255,255,255,0.12)', padding:'8px 14px', borderRadius:10, width:280, fontWeight:800, display:'flex', justifyContent:'space-between'}}>
            <div>{i+1}. @{s.username}</div>
            <div>{Number(s.time).toFixed(3)} s</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:18}}>
        <a href="/" style={{padding:'8px 12px', borderRadius:8, background:'#fff', color:'#000', fontWeight:800, textDecoration:'none'}}>Back</a>
      </div>
    </div>
  );
}
