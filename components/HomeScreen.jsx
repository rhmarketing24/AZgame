// components/HomeScreen.jsx
'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function HomeScreen(){
  const [sentCount, setSentCount] = useState(0);
  const [lastSentAt, setLastSentAt] = useState(null);
  const [messages, setMessages] = useState([]); // messages from parent
  const [isReadyDetected, setIsReadyDetected] = useState(false);
  const originsRef = useRef([
    'https://base.dev',
    'https://base.build',
    'https://preview.base.build',
    'https://base.app'
  ]);

  useEffect(() => {
    const ORIGINS = originsRef.current;
    const msg = { type: 'miniapp.ready', version: 1 };

    const sendToAll = (useWildcard = false) => {
      ORIGINS.forEach(o => {
        try {
          window?.parent?.postMessage(msg, o);
          setSentCount(c => c + 1);
          setLastSentAt(new Date().toLocaleTimeString());
          console.log('[miniapp.ready] ->', o, msg);
        } catch (e) {
          console.warn('postMessage failed ->', o, e);
        }
      });
      if (useWildcard) {
        try {
          window?.parent?.postMessage(msg, '*');
          setSentCount(c => c + 1);
          setLastSentAt(new Date().toLocaleTimeString());
          console.log('[miniapp.ready] -> wildcard', msg);
        } catch (e) {
          console.warn('postMessage wildcard failed', e);
        }
      }
    };

    // initial + retries
    sendToAll();
    const t1 = setTimeout(() => sendToAll(), 400);
    const t2 = setTimeout(() => sendToAll(true), 1200);

    let tries = 0;
    const interval = setInterval(() => {
      if (tries++ > 8) { clearInterval(interval); return; }
      sendToAll();
    }, 2000);

    // listen for messages from parent and keep in state
    const onMessage = (ev) => {
      const origin = ev.origin || 'unknown';
      const data = ev.data;
      console.log('[from-parent]', origin, data);
      setMessages(prev => [{ time: new Date().toLocaleTimeString(), origin, data }, ...prev].slice(0, 50));

      // heuristics to detect Base "ready" acknowledgement:
      try {
        // 1) data.type might be 'ready' or 'apply' or something containing "ready"
        if (data && (data.type === 'ready' || String(data.type).toLowerCase().includes('ready'))) {
          setIsReadyDetected(true);
        }
        // 2) data.path contains ['ready'] (we saw APPLY messages with path: ["ready"])
        if (data && Array.isArray(data.path) && data.path.includes('ready')) {
          setIsReadyDetected(true);
        }
        // 3) some parent messages may be objects with nested shapes; check simple string match
        if (JSON.stringify(data).toLowerCase().includes('"ready"')) {
          setIsReadyDetected(true);
        }
      } catch(e){ console.warn('ready-detect error', e); }
    };
    window.addEventListener('message', onMessage);

    // also send again when page visible
    const onVis = () => { if (!document.hidden) sendToAll(); };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearInterval(interval);
      window.removeEventListener('message', onMessage);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div style={{padding:20, fontFamily:'Inter, sans-serif'}}>
      <h1>ABC Rush — Debug Home</h1>
      <p>এই পেজটা Base preview-এর সাথে handshake দেখাতে এবং debug করতে বানানো।</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
        <div style={{padding:12, border:'1px solid #ddd', borderRadius:8}}>
          <h3>Status</h3>
          <p><strong>miniapp.ready messages sent:</strong> {sentCount}</p>
          <p><strong>Last sent at:</strong> {lastSentAt || '—'}</p>
          <p><strong>Ready detected from parent:</strong> <span style={{color: isReadyDetected ? 'green' : 'crimson', fontWeight:700}}>{isReadyDetected ? 'YES' : 'NO'}</span></p>
          <div style={{marginTop:8}}>
            <Link href="/game"><button style={{padding:'8px 10px'}}>Open Game</button></Link>
            <span style={{marginLeft:8}}><Link href="/leaderboard"><button style={{padding:'8px 10px'}}>Leaderboard</button></Link></span>
          </div>
        </div>

        <div style={{padding:12, border:'1px solid #ddd', borderRadius:8}}>
          <h3>Notes / Next steps</h3>
          <ol>
            <li>ওয়েল-নন জানচ করো: <code>https://YOUR_APP/.well-known/farcaster.json</code> সার্ভ হচ্ছে কী না — তুমি আগেই সেটে চেক করেছো, ঠিক আছে।</li>
            <li>Base preview এ পড়া logs দেখো — যদি এখানে messages আসছে কিন্তু Ready না দেখায়, তখন screenshot পাঠাও আমি বিশ্লেষণ করব।</li>
            <li>নতুন পরিবর্তন deploy করার পরে Vercel cache-র কারণে একটু সময় লাগতে পারে — কিন্তু আমাদের log এখানে আসা শুরু হলে সমস্যা অনেকটাই সমাধান।</li>
          </ol>
        </div>
      </div>

      <div style={{marginTop:18, padding:12, border:'1px solid #eee', borderRadius:8, maxHeight:340, overflow:'auto', background:'#fafafa'}}>
        <h3 style={{marginTop:0}}>Messages received from parent (latest first)</h3>
        {messages.length === 0 ? <p style={{color:'#666'}}>No messages yet.</p> : (
          <ul style={{paddingLeft:16}}>
            {messages.map((m,i) => (
              <li key={i} style={{marginBottom:8}}>
                <div style={{fontSize:12,color:'#666'}}>{m.time} — {m.origin}</div>
                <pre style={{margin:0, whiteSpace:'pre-wrap', fontSize:13}}>{typeof m.data === 'string' ? m.data : JSON.stringify(m.data, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
