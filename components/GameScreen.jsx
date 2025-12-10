"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';

// detect host username (minikit or farcaster). fallback to rhmarketing24
function detectUser(){
  try{
    const win = typeof window !== 'undefined' ? window : null;
    const maybe = win?.__MINIKIT_USER__ || win?.minikitUser || win?.__minikit_user__ || win?.farcasterUser || win?.Base?.user || null;
    if(maybe){
      if(typeof maybe === 'string') return maybe.startsWith('@')? maybe.slice(1): maybe;
      if(typeof maybe === 'object'){
        return (maybe.username || maybe.handle || maybe.name || maybe.address || maybe.id || 'rhmarketing24').toString().replace(/^@/,'');
      }
    }
  }catch(e){}
  return 'rhmarketing24';
}

const ALPHABET = Array.from({length:26},(_,i)=>String.fromCharCode(65+i));

function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

export default function GameScreen({ autoStart=false, compact=true, onBack }){
  const [user,setUser] = useState(()=>'rhmarketing24');
  useEffect(()=> setUser(detectUser()), []);

  const [grid, setGrid] = useState(()=> shuffle(ALPHABET));
  const [phase, setPhase] = useState('idle'); // idle, counting, playing, finished
  const [count, setCount] = useState(3);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const tRef = useRef(null);

  const [expectedIndex, setExpectedIndex] = useState(0);
  const [tileState, setTileState] = useState(Object.fromEntries(ALPHABET.map(l=>[l,'idle'])));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{
    if(autoStart){
      setTimeout(()=> startCountdown(), 200);
    }
  },[autoStart]);

  useEffect(()=>{
    if(phase==='counting'){
      if(count<=0){
        setPhase('playing');
        const now=Date.now();
        setStartTime(now);
        tRef.current = setInterval(()=> setElapsed((Date.now()-now)/1000), 100);
        return;
      }
      const id = setTimeout(()=> setCount(c=>c-1), 1000);
      return ()=> clearTimeout(id);
    }
  },[phase,count]);

  useEffect(()=> {
    if(phase!=='playing' && tRef.current){ clearInterval(tRef.current); tRef.current=null; }
    return ()=> { if(tRef.current) clearInterval(tRef.current); };
  },[phase]);

  function startCountdown(){
    setGrid(shuffle(ALPHABET));
    setPhase('counting');
    setCount(3);
    setExpectedIndex(0);
    setTileState(Object.fromEntries(ALPHABET.map(l=>[l,'idle'])));
    setElapsed(0);
    setSubmitted(false);
    setSubmitting(false);
  }

  function clickLetter(letter){
    if(phase!=='playing') return;
    const needed = String.fromCharCode(65+expectedIndex);
    if(letter===needed){
      setTileState(s=> ({...s,[letter]:'correct'}));
      setExpectedIndex(i=>{
        const ni=i+1;
        if(ni>=26){
          // finished
          setPhase('finished');
          if(tRef.current){ clearInterval(tRef.current); tRef.current=null; }
          setElapsed(prev=>prev); // keep
        }
        return ni;
      });
    } else {
      setTileState(s=>({...s,[letter]:'wrong'}));
      setTimeout(()=> setTileState(s=> ({...s,[letter]:'idle'})), 400);
    }
  }

  async function handleSubmit(){
    if(submitting || submitted || phase!=='finished') return;
    setSubmitting(true);
    try{
      await fetch('/api/saveScore', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ username: user, time: Number(elapsed.toFixed(3)) })
      });
      setSubmitted(true);
    }catch(e){
      console.error(e);
      alert('Submit failed');
    }finally{
      setSubmitting(false);
    }
  }

  function handlePlayAgain(){
    startCountdown();
  }

  const nextLetter = expectedIndex<26? String.fromCharCode(65+expectedIndex) : '-';

  // grid rows generation: 6 rows x4 + last row 2 + back
  const cells = [...grid];
  while(cells.length<26) cells.push('');
  // render

  return (
    <div style={{minHeight:'100vh', background:'#0000FF', color:'#fff', padding:20, fontFamily:'Arial, sans-serif'}}>
      <div style={{fontSize:26, fontWeight:900}}>Tap A → Z Rush</div>
      <div style={{display:'flex', gap:12, alignItems:'center', justifyContent:'space-between', maxWidth:960, margin:'12px auto'}}>
        <div style={{background:'rgba(255,255,255,0.08)', padding:'8px 12px', borderRadius:10}}>
          <div style={{fontSize:12, opacity:0.9}}>Timer</div>
          <div style={{fontWeight:800}}>{phase==='counting'? `${count}s` : (phase==='playing' || phase==='finished')? `${elapsed.toFixed(3)} s` : '0.000 s'}</div>
        </div>

        <div style={{background:'rgba(255,255,255,0.06)', padding:'8px 12px', borderRadius:10, textAlign:'center', flex:1}}>
          <div style={{fontSize:12, opacity:0.9}}>Playing as</div>
          <div style={{fontWeight:900}}>{user.startsWith('@')? user.slice(1): user}</div>
        </div>

        <div style={{background:'rgba(255,255,255,0.08)', padding:'8px 12px', borderRadius:10, textAlign:'right'}}>
          <div style={{fontSize:12, opacity:0.9}}>Next</div>
          <div style={{fontWeight:800}}>{nextLetter}</div>
        </div>
      </div>

      <div style={{maxWidth:760, margin:'12px auto', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, justifyItems:'center'}}>
        {cells.slice(0,24).map((l,idx)=> {
          const state = tileState[l]||'idle';
          const bg = state==='correct'? '#28a745' : state==='wrong'? '#dc3545' : '#fff';
          const color = state==='correct' || state==='wrong' ? '#fff' : '#0000FF';
          return (
            <button key={'c'+idx} onClick={()=>clickLetter(l)} style={{width:72,height:72,borderRadius:12,fontWeight:900,fontSize:20,background:bg,color, border:'none', cursor: phase==='playing' ? 'pointer' : 'default' }}>
              {l}
            </button>
          );
        })}

        {/* last row: 2 letters, placeholder, back button */}
        {cells.slice(24,26).map((l,idx)=> {
          const state = tileState[l]||'idle';
          const bg = state==='correct'? '#28a745' : state==='wrong'? '#dc3545' : '#fff';
          const color = state==='correct' || state==='wrong' ? '#fff' : '#0000FF';
          return (
            <button key={'last'+idx} onClick={()=>clickLetter(l)} style={{width:72,height:72,borderRadius:12,fontWeight:900,fontSize:20,background:bg,color, border:'none', cursor: phase==='playing' ? 'pointer' : 'default' }}>
              {l}
            </button>
          );
        })}

        <div style={{width:72,height:72}}></div>

        <div style={{width:72,height:72, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <button onClick={()=> onBack ? onBack() : (window.location.href='/')} style={{padding:'8px 10px', borderRadius:8, background:'#fff', color:'#0000FF', fontWeight:800}}>Back</button>
        </div>
      </div>

      <div style={{textAlign:'center', marginTop:18}}>
        {phase==='idle' && <button onClick={startCountdown} style={{padding:'10px 18px', borderRadius:12, background:'#fff', color:'#0000FF', fontWeight:800}}>Play</button>}
        {phase==='counting' && <div style={{fontWeight:900, fontSize:20}}>Starting in {count}...</div>}
        {phase==='finished' && (
          <div>
            <div style={{fontSize:20, fontWeight:900}}>Completed in {elapsed.toFixed(3)}s</div>
            <div style={{marginTop:12, display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap'}}>
              <button onClick={handleSubmit} disabled={submitted} style={{padding:'10px 14px', borderRadius:10, background:'#fff', color:'#0000FF', fontWeight:800}}>
                {submitted ? 'Submitted ✓' : (submitting ? 'Submitting...' : 'Submit Score')}
              </button>
              <a href="/leaderboard" style={{padding:'10px 14px', borderRadius:10, background:'#fff', color:'#000', fontWeight:800, textDecoration:'none'}}>Leaderboard</a>
              <button onClick={handlePlayAgain} style={{padding:'10px 14px', borderRadius:10, background:'#fff', color:'#000', fontWeight:800}}>Play Again</button>
              <button onClick={()=> onBack ? onBack() : (window.location.href = '/')} style={{padding:'10px 14px', borderRadius:10, background:'#fff', color:'#000', fontWeight:800}}>Back</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
