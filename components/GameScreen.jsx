import { useEffect, useMemo, useState, useRef } from 'react';
import Countdown from './Countdown';
import FinishScreen from './FinishScreen';
const letters = Array.from({length:26}, (_,i)=>String.fromCharCode(65+i));
function shuffle(arr){ const a = arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
export default function GameScreen(){
  const [playing, setPlaying] = useState(false);
  const [countdown, setCountdown] = useState(false);
  const [grid, setGrid] = useState(() => shuffle(letters));
  const [index, setIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef(null);
  const [preview, setPreview] = useState(() => shuffle(letters).slice(0,6));
  useEffect(()=> {
    if(playing && startTime){ timerRef.current = setInterval(()=> setElapsed((Date.now()-startTime)/1000), 50); }
    else clearInterval(timerRef.current);
    return ()=> clearInterval(timerRef.current);
  }, [playing, startTime]);
  function startGame(){ setGrid(shuffle(letters)); setIndex(0); setElapsed(0); setDone(false); setSubmitted(false); setCountdown(true); }
  function onCountdownEnd(){ setCountdown(false); setPlaying(true); setStartTime(Date.now()); setPreview(shuffle(letters).slice(0,6)); }
  function handleLetterClick(ch){
    if(!playing || done) return;
    const next = letters[index];
    if(ch === next){
      setIndex(i=> i+1);
      setPreview(p => shuffle(letters).slice(0,6));
      if(index+1 >= letters.length){ setDone(true); setPlaying(false); setElapsed((Date.now()-startTime)/1000); }
    } else {
      const el = document.getElementById('L-'+ch);
      if(el){ el.classList.add('wrong'); setTimeout(()=> el.classList.remove('wrong'), 350); }
    }
  }
  async function submitScore(){
    try{
      const username = '@anonymous';
      const time = Number(elapsed);
      await fetch('/api/saveScore', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ username, time }) });
      setSubmitted(true);
    }catch(e){ console.error(e); alert('Submit failed'); }
  }
  function playAgain(){ startGame(); }
  return (
    <div className="container">
      <h1 className="header">Tap A → Z Rush</h1>
      <p className="small">Playing as @anonymous</p>
      {!playing && !countdown && !done && (<div style={{marginTop:12}}><button className="btn" onClick={()=>{ startGame(); }}>Play</button></div>)}
      {countdown && <Countdown start={3} onEnd={onCountdownEnd} />}
      {(playing || done) && (
        <>
          <div className="controls" style={{justifyContent:'space-between', maxWidth:900, margin:'8px auto'}}>
            <div className="timer-box"><div className="small">Timer</div><div style={{fontSize:20,fontWeight:800}}>{elapsed.toFixed(3)} s</div></div>
            <div style={{minWidth:140}}><div className="small">Next</div><div style={{fontSize:18,fontWeight:800}}>{letters[index] || '-'}</div></div>
            <div className="preview">{preview.map((p,i)=>(<div key={i} className="letter" style={{width:44,height:44,fontSize:14}}>{p}</div>))}</div>
            <div><button className="btn btn-outline" onClick={()=>{ setPlaying(false); setCountdown(false); setDone(false); setIndex(0); setElapsed(0); }}>Back</button></div>
          </div>
          {!done && (
            <>
              <h3 style={{marginTop:8}}>Next: {letters[index]}</h3>
              <div className="grid" style={{marginTop:12}}>
                {grid.map((ch)=>(<div key={ch} id={'L-'+ch} className={'letter'} onClick={()=> handleLetterClick(ch)}>{ch}</div>))}
              </div>
              <div style={{marginTop:18}}><button className="btn btn-outline" onClick={()=>{ setPlaying(false); setCountdown(false); setIndex(0); }}>Pause/Back</button></div>
            </>
          )}
          {done && (
            <div style={{marginTop:20}}>
              <FinishScreen time={elapsed} onSubmit={submitScore} onBack={()=>{ setDone(false); setPlaying(false); setIndex(0); setElapsed(0); }} onPlayAgain={playAgain} />
              {submitted && <div style={{marginTop:10, color:'#fff'}}>Submitted ✓</div>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
