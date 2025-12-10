'use client';
import { useEffect, useState, useRef } from 'react';
import Countdown from './Countdown';
import FinishScreen from './FinishScreen';
import Link from 'next/link';
// import { supabase } from '../lib/supabase'; // optional: uncomment if you use supabase elsewhere

const ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GameScreen(){
  const [user, setUser] = useState('@anonymous');
  const [nextIndex, setNextIndex] = useState(0); // 0 => 'A'
  const [shuffled, setShuffled] = useState([]);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(false);

  // UI state for marking clicked/disabled letters and wrong flashes
  const [clickedLetters, setClickedLetters] = useState([]); // letters that were clicked correctly
  const [wrongLetters, setWrongLetters] = useState([]); // letters currently showing wrong flash

  const intervalRef = useRef(null);

  // initialize board on mount (shuffle alphabet)
  useEffect(()=> {
    setShuffled(shuffle(ALPH));
    // reset other states in case of hot-reload
    setNextIndex(0);
    setRunning(false);
    setStartTime(null);
    setElapsed(0);
    setFinished(false);
    setSubmitted(false);
    setClickedLetters([]);
    setWrongLetters([]);
  },[]);

  // timer effect
  useEffect(()=> {
    if(running){
      if(intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(()=> {
        setElapsed((Date.now() - startTime)/1000);
      }, 100);
    } else {
      if(intervalRef.current){ clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return ()=> {
      if(intervalRef.current){ clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  },[running,startTime]);

  const nextLetter = ALPH[nextIndex] || null;

  function handleStart(){
    // start countdown UI
    setCountdown(true);
  }
  function onCountdownFinish(){
    setCountdown(false);
    // begin game
    setRunning(true);
    setStartTime(Date.now());
    setElapsed(0);
    setNextIndex(0);
    setClickedLetters([]);
    setWrongLetters([]);
    setFinished(false);
    setSubmitted(false);
    // shuffle letters for fresh start
    setShuffled(shuffle(ALPH));
  }

  function clickLetter(letter){
    if(!running) return;
    if(finished) return;
    if(!letter) return; // empty slot
    // prevent re-clicking already-correct-letter
    if(clickedLetters.includes(letter)) return;

    if(letter === nextLetter){
      // correct click
      setClickedLetters(prev => [...prev, letter]);
      setNextIndex(i => {
        const ni = i + 1;
        // check finish condition
        if(ni >= ALPH.length){
          // finished
          setRunning(false);
          setFinished(true);
          setElapsed((Date.now() - startTime)/1000);
        }
        return ni;
      });
    } else {
      // wrong click: mark temporarily
      setWrongLetters(prev => {
        if(prev.includes(letter)) return prev;
        return [...prev, letter];
      });
      setTimeout(()=> {
        setWrongLetters(prev => prev.filter(x => x !== letter));
      }, 500);
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
    setShuffled(shuffle(ALPH));
    setNextIndex(0);
    setRunning(false);
    setStartTime(null);
    setElapsed(0);
    setFinished(false);
    setSubmitted(false);
    setClickedLetters([]);
    setWrongLetters([]);
    setCountdown(false);
  }

  // Build 7x4 grid from shuffled letters (first 26 letters fill first 26 slots, rest empty)
  function makeGridFromShuffled(arr){
    const items = [...arr];
    while(items.length < 28) items.push(''); // pad to 28
    const rows = [];
    for(let i=0;i<7;i++){
      rows.push(items.slice(i*4, i*4 + 4));
    }
    return rows;
  }

  // helper to get user initials
  const initials = (user || '@').split(' ').map(s=>s[0]||'').slice(0,2).join('').toUpperCase();

  return (
    <div className="container" style={{padding:16, display:'flex', justifyContent:'center'}}>
      <div style={{width:'100%', maxWidth:420}}>
        {/* App name box */}
        <div style={{
          margin:'12px auto',
          maxWidth:320,
          background:'#fff',
          borderRadius:16,
          padding:12,
          boxShadow:'0 4px 12px rgba(0,0,0,0.06)',
          border:'1px solid #e6e6e6',
          textAlign:'center'
        }}>
          <h1 style={{margin:0, fontSize:22, fontWeight:800, color:'#111827'}}>WordGrid</h1>
        </div>

        {/* Top row: Timer | Avatar+username | Back */}
        <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:12, alignItems:'center', marginBottom:12}}>
          {/* Timer (left slim) */}
          <div style={{display:'flex', justifyContent:'flex-start'}}>
            <div style={{
              minWidth:92,
              background:'#fff',
              borderRadius:12,
              padding:'8px 10px',
              border:'1px solid #e5e7eb',
              boxShadow:'0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{fontSize:11, color:'#6b7280'}}>Timer</div>
              <div style={{fontSize:16, fontWeight:700}}>{running ? elapsed.toFixed(3)+' s' : (finished ? elapsed.toFixed(3)+' s' : '0.000 s')}</div>
            </div>
          </div>

          {/* Avatar center */}
          <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <div style={{
              height:64, width:64, borderRadius:999, background:'#4f46e5',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', fontWeight:800, fontSize:18, boxShadow:'0 6px 18px rgba(79,70,229,0.14)'
            }}>
              {initials}
            </div>
            <div style={{marginTop:6, fontSize:12, color:'#374151'}}>{user}</div>
          </div>

          {/* Back (right slim) */}
          <div style={{display:'flex', justifyContent:'flex-end'}}>
            <div style={{
              minWidth:92,
              display:'flex', justifyContent:'flex-end',
              background:'#fff', borderRadius:12, padding:'8px 10px',
              border:'1px solid #e5e7eb', boxShadow:'0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <Link href="/">
                <button style={{
                  background:'#ef4444', color:'#fff', border:'none', padding:'6px 10px',
                  borderRadius:8, fontWeight:700, cursor:'pointer'
                }}>
                  Back
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Countdown */}
        {countdown && (
          <div style={{display:'flex', justifyContent:'center', marginTop:8}}>
            <Countdown start={3} onFinish={onCountdownFinish} />
          </div>
        )}

        {/* Play / Leaderboard area (shown when not running and not finished and not in countdown) */}
        {!running && !finished && !countdown && (
          <div style={{textAlign:'center', marginTop:8}}>
            <button onClick={handleStart} style={{
              background:'#4f46e5', color:'#fff', border:'none', padding:'10px 18px',
              borderRadius:10, fontWeight:800, fontSize:16, cursor:'pointer'
            }}>
              Play
            </button>
            <div style={{marginTop:10}}>
              <Link href="/leaderboard"><button style={{
                background:'#fff', border:'1px solid #e5e7eb', padding:'8px 12px', borderRadius:8, cursor:'pointer'
              }}>Leaderboard</button></Link>
            </div>
          </div>
        )}

        {/* Current Next indicator */}
        <div style={{textAlign:'center', marginTop:12}}>
          <h3 style={{margin:0, fontSize:16}}>Next: <span style={{fontWeight:800}}>{nextLetter || '—'}</span></h3>
        </div>

        {/* Board: 7 rows x 4 cols */}
        <div style={{marginTop:12}}>
          { makeGridFromShuffled(shuffled).map((row, rIdx) => (
            <div key={rIdx} style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:10}}>
              {row.map((cell, cIdx) => {
                const isLastRow = rIdx === 6;
                // last row: cells 0 & 1 normal, cells 2+3 -> Back button spanning 2 cols (we render at cIdx===3)
                if(isLastRow && cIdx === 2) return null;
                if(isLastRow && cIdx === 3){
                  return (
                    <div key={'back-'+rIdx} style={{gridColumn:'span 2', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <Link href="/"><button style={{
                        padding:'12px 10px',
                        borderRadius:12,
                        background:'#fee2e2',
                        border:'1px solid #fecaca',
                        width:'100%',
                        fontWeight:700,
                        color:'#b91c1c'
                      }}>← Back</button></Link>
                    </div>
                  );
                }

                const letter = cell;
                const isClicked = letter && clickedLetters.includes(letter);
                const isWrong = letter && wrongLetters.includes(letter);
                const isDisabled = !letter || isClicked;

                const baseStyle = {
                  height:56,
                  borderRadius:12,
                  border:'1px solid #e5e7eb',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  fontSize:18,
                  fontWeight:800,
                  userSelect:'none',
                  cursor: letter && !isDisabled ? 'pointer' : 'default',
                  transition:'background 180ms, transform 120ms',
                  background: '#f8fafc',
                  color:'#111827'
                };

                if(isClicked){
                  baseStyle.background = '#d1fae5'; // light green
                } else if(isWrong){
                  baseStyle.background = '#fee2e2'; // light red flash
                }

                return (
                  <div
                    key={cIdx}
                    id={letter ? 'l-'+letter : `empty-${rIdx}-${cIdx}`}
                    onClick={()=> clickLetter(letter)}
                    style={baseStyle}
                    aria-disabled={isDisabled}
                  >
                    {letter || ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Finish screen */}
        {finished && (
          <FinishScreen
            time={elapsed}
            onSubmit={submitScore}
            onRetry={retry}
            onBack={()=> { location.href = '/'; }}
            submitted={submitted}
          />
        )}

      </div>
    </div>
  );
}

/* Helpers: shuffle */
function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
