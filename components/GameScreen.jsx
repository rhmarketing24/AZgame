'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import Countdown from './Countdown';
import FinishScreen from './FinishScreen';
import Link from 'next/link';

const ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GameScreen(){
  const [user, setUser] = useState('@anonymous');
  const [preview, setPreview] = useState([]);
  const [nextIndex, setNextIndex] = useState(0); // 0 => 'A'
  const [shuffled, setShuffled] = useState([]);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(false);

  useEffect(()=> {
    // create preview & shuffle
    setPreview(sample(ALPH, 6));
    setShuffled(shuffle(ALPH));
  },[]);

  useEffect(()=> {
    let id;
    if(running){
      id = setInterval(()=> {
        setElapsed((Date.now() - startTime)/1000);
      }, 100);
    } else {
      clearInterval(id);
    }
    return ()=> clearInterval(id);
  },[running,startTime]);

  const nextLetter = ALPH[nextIndex] || null;

  function handleStart() {
    setCountdown(true);
  }
  function onCountdownFinish(){
    setCountdown(false);
    setRunning(true);
    setStartTime(Date.now());
  }

  function clickLetter(letter){
    if(!running) return;
    if(finished) return;
    if(letter === nextLetter){
      // correct
      setNextIndex(i => i+1);
      // mark letter visually by regenerating shuffled with class - handled via state
      setShuffled(s => s.filter(x => x!==letter));
      if(nextIndex+1 >= ALPH.length){
        // finished
        setRunning(false);
        setFinished(true);
        setElapsed((Date.now() - startTime)/1000);
      }
    } else {
      // wrong feedback: briefly mark wrong (managed via temp state)
      const el = document.getElementById('l-'+letter);
      if(el){ el.classList.add('wrong'); setTimeout(()=>el.classList.remove('wrong'),500); }
    }
  }

  async function submitScore(){
    try{
      const time = elapsed;
      await fetch('/api/saveScore', {
        method:'POST', headers:{'content-type':'application/json'},
        body: JSON.stringify({ username: user, time })
      });
      setSubmitted(true);
    }catch(e){
      console.error(e);
    }
  }

  function retry(){
    // reset
    setPreview(sample(ALPH,6));
    setShuffled(shuffle(ALPH));
    setNextIndex(0);
    setRunning(false);
    setStartTime(null);
    setElapsed(0);
    setFinished(false);
    setSubmitted(false);
  }

  return (
    <div className="container">
      <div style={{maxWidth:900,width:'100%'}}>
        <div className="top-row">
          <div className="card"><strong>Playing as</strong><div>{user}</div></div>
          <div className="card"><strong>Timer</strong><div style={{fontSize:20}}>{running ? elapsed.toFixed(3)+' s' : '0.000 s'}</div></div>
          <div className="card"><strong>Next</strong><div style={{fontSize:20}}>{nextLetter||'-'}</div></div>
          <div className="preview" style={{marginLeft:12}}>
            {preview.map(p=> <div key={p} style={{padding:8, borderRadius:8, background:'rgba(255,255,255,0.06)'}}>{p}</div>)}
          </div>
          <div style={{marginLeft:12}}><Link href="/"><button className="small-btn">Back</button></Link></div>
        </div>

        {countdown && <div style={{display:'flex',justifyContent:'center',marginTop:12}}><Countdown start={3} onFinish={onCountdownFinish} /></div>}

        {!running && !finished && !countdown && (
          <div style={{textAlign:'center', marginTop:18}}>
            <button className="btn" onClick={handleStart}>Play</button>
            <div style={{marginTop:8}}><Link href="/leaderboard"><button className="small-btn">Leaderboard</button></Link></div>
          </div>
        )}

        <div style={{textAlign:'center', marginTop:18}}>
          <h3>Next: {nextLetter||'—'}</h3>
        </div>

        <div className="board" style={{marginTop:10}}>
          {shuffled.map(letter=> (
            <div id={'l-'+letter} key={letter} className={'letter'} onClick={()=>clickLetter(letter)}>{letter}</div>
          ))}
        </div>

        {finished && <FinishScreen time={elapsed} onSubmit={submitScore} onRetry={retry} onBack={()=>{location.href='/'}} submitted={submitted} />}
      </div>
    </div>
  );
}

// small helpers
function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function sample(arr,n){
  const s = shuffle(arr);
  return s.slice(0,n);
}
