import { useEffect, useState } from 'react';
export default function Countdown({start=3, onFinish}) {
  const [n, setN] = useState(start);
  useEffect(()=> {
    if(n<=0){ onFinish?.(); return; }
    const t = setTimeout(()=> setN(n-1), 1000);
    return ()=> clearTimeout(t);
  },[n]);
  if(n<=0) return null;
  return <div className="card" style={{fontSize:28}}>{n}</div>
}
