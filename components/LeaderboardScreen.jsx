
import { useEffect,useState } from "react";

export default function LeaderboardScreen(){
  const [data,setData]=useState([]);

  useEffect(()=>{
    fetch("/api/leaderboard").then(r=>r.json()).then(d=>setData(d.data||[]));
  },[]);

  return (
    <div style={{color:'white',padding:20}}>
      <h2>Leaderboard</h2>
      {data.map((x,i)=>(
        <div key={i}>{i+1}. {x.username} — {x.time}s</div>
      ))}
    </div>
  )
}
