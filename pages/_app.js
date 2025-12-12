// pages/_app.js
import { useEffect } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Base preview origins (প্রয়োজনে আর যোগ করো)
    const ORIGINS = [
      'https://base.dev',
      'https://base.build',
      'https://preview.base.build',
      'https://base.app'
    ];

    const readyMsg = { type: 'miniapp.ready', version: 1 };

    const sendAll = (useWildcard = false) => {
      ORIGINS.forEach((o) => {
        try {
          window?.parent?.postMessage(readyMsg, o);
          console.log('[miniapp.ready] sent ->', o, readyMsg);
        } catch (e) {
          console.warn('[miniapp.ready] postMessage failed ->', o, e);
        }
      });

      if (useWildcard) {
        try {
          window?.parent?.postMessage(readyMsg, '*');
          console.log('[miniapp.ready] sent -> wildcard', readyMsg);
        } catch (e) {
          console.warn('[miniapp.ready] wildcard postMessage failed', e);
        }
      }
    };

    // immediate + retries (timing/race পরিস্থিতি কভার করতে)
    sendAll();
    const t1 = setTimeout(() => sendAll(), 400);
    const t2 = setTimeout(() => sendAll(true), 1200);

    let tries = 0;
    const interval = setInterval(() => {
      if (tries++ > 6) { clearInterval(interval); return; }
      sendAll();
    }, 2000);

    // send again when page becomes visible
    const onVis = () => { if (!document.hidden) sendAll(); };
    document.addEventListener('visibilitychange', onVis);

    // ---- Debug: listen to messages from parent and log them so preview shows useful info
   // (pages/_app.js) ... inside useEffect after window.addEventListener('message', onMessage);
const onMessage = (ev) => {
  try {
    console.log('[from-parent message]', { origin: ev.origin, data: ev.data });

    // Simple heuristic: if parent sends APPLY/ready or similar, send ACK back
    const d = ev.data || {};
    const looksLikeReady = (
      (d.type && String(d.type).toLowerCase().includes('ready')) ||
      (Array.isArray(d.path) && d.path.includes('ready')) ||
      (JSON.stringify(d).toLowerCase().includes('"ready"'))
    );

    if (looksLikeReady) {
      // send a small ack back to parent (wildcard); Base may use it to finalize handshake UI
      try {
        window.parent.postMessage({ type: 'miniapp.client_ack', version: 1, time: Date.now() }, '*');
        console.log('[miniapp.client_ack] sent');
      } catch (err) { console.warn('client_ack failed', err); }
    }
  } catch (e) {
    console.warn('message parse error', e);
  }
};
window.addEventListener('message', onMessage);


    return () => {
      clearTimeout(t1); clearTimeout(t2); clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return <Component {...pageProps} />;
}
