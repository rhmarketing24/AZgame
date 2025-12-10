import { useEffect, useState } from 'react';
export default function Countdown({ start=3, onEnd }) {
  const [n, setN] = useState(start);
  useEffect(() => {
    if (n <= 0) { onEnd(); return; }
    const t = setTimeout(()=> setN(n-1), 1000);
    return ()=> clearTimeout(t);
  }, [n]);
  return (<div style={{fontSize:36,fontWeight:800,margin:20}}>{n > 0 ? n : 'Go!'}</div>);
}
