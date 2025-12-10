
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function GameScreen(){
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const [letters,setLetters]=useState([]);
  const [nextIdx,setNextIdx]=useState(0);
  const [timer,setTimer]=useState(0);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);

  useEffect(()=>{ 
    setLetters(alphabet.sort(()=>Math.random()-0.5));
    let c=3;
    const cd=setInterval(()=>{ c--; if(c===0){clearInterval(cd); setRunning(true);} },1000);
  },[]);

  useEffect(()=>{
    if(!running) return;
    const t=setInterval(()=>setTimer(t=>t+0.01),10);
    return ()=>clearInterval(t);
  },[running]);

  function clickLetter(l){
    if(done) return;
    if(l===alphabet[nextIdx]){
      setNextIdx(n=>n+1);
      if(nextIdx===25){ setDone(true); setRunning(false); }
    }
  }

  async function submitScore(){
    await fetch("/api/saveScore",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ username:"rhmarketing24", time:timer })
    })
  }

  return (
    <div style={{color:"white", padding:20}}>
      <h2>Playing as: rhmarketing24</h2>
      <div>Timer: {timer.toFixed(2)} | Next: {alphabet[nextIdx]}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,60px)",gap:"10px",marginTop:"20px"}}>
        {letters.map(l=>(
          <button key={l} onClick={()=>clickLetter(l)}>{l}</button>
        ))}
      </div>

      {done && (
        <div style={{marginTop:30}}>
          <h3>Game Over!</h3>
          <button onClick={submitScore}>Submit Score</button>
        </div>
      )}
    </div>
  );
}
