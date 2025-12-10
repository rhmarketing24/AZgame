import { useState } from 'react';
import GameScreen from './GameScreen';
import Link from 'next/link';

export default function HomeScreen(){
  const [inGame, setInGame] = useState(false);
  const [auto, setAuto] = useState(false);

  function startFromHome(){
    setInGame(true);
    setTimeout(()=>setAuto(true), 150);
  }

  if(inGame){
    return <GameScreen autoStart={auto} onBack={()=>{ setInGame(false); setAuto(false); }} />;
  }

  return (
    <div style={{minHeight:'100vh', background:'#0000FF', color:'#fff', padding:20, fontFamily:'Arial, sans-serif', textAlign:'center'}}>
      <h1 style={{fontSize:34, fontWeight:900}}>Tap A → Z Rush</h1>
      <p style={{opacity:0.95}}>Play quick A→Z tap game. Sign-in via Base (when available).</p>
      <div style={{marginTop:20}}>
        <button onClick={startFromHome} style={{padding:'12px 22px', borderRadius:999, background:'#fff', color:'#0000FF', fontWeight:800}}>Play</button>
      </div>
      <div style={{marginTop:12}}>
        <Link href="/leaderboard"><a style={{color:'#fff', textDecoration:'underline'}}>Leaderboard</a></Link>
      </div>
      <p style={{marginTop:14, opacity:0.9}}>Tap A→Z as fast as you can!</p>
    </div>
  );
}
