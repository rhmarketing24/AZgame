// pages/_app.js
import { useEffect } from 'react';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const ORIGINS = [
      'https://base.dev',
      'https://base.build',
      'https://preview.base.build',
      'https://base.app'
    ];

    const readyMsg = { type: 'miniapp.ready', version: 1 };

    const sendTo = (origin) => {
      try {
        window.parent.postMessage(readyMsg, origin);
        console.log('[miniapp.ready] sent ->', origin, readyMsg);
      } catch (e) {
        console.warn('[miniapp.ready] postMessage failed ->', origin, e);
      }
    };

    const sendAll = (useWildcard = false) => {
      ORIGINS.forEach(sendTo);
      if (useWildcard) {
        try {
          window.parent.postMessage(readyMsg, '*');
          console.log('[miniapp.ready] sent -> wildcard', readyMsg);
        } catch (e) { console.warn('wildcard failed', e); }
      }
    };

    // immediate + retries
    sendAll();
    const t1 = setTimeout(() => sendAll(), 500);
    const t2 = setTimeout(() => sendAll(true), 1200);

    // repeated few times for race conditions
    let tries = 0;
    const interval = setInterval(() => {
      if (tries++ > 8) { clearInterval(interval); return; }
      sendAll();
    }, 1500);

    // when page becomes visible, re-send
    const onVis = () => { if (!document.hidden) sendAll(); };
    document.addEventListener('visibilitychange', onVis);

    // listen to parent messages (show everything)
    const onMessage = (ev) => {
      console.log('[from-parent message]', { origin: ev.origin, data: ev.data });
      // Debug: if parent sends an APPLY ready, echo a short ack (optional)
      try {
        const d = ev.data || {};
        // parent uses type "APPLY" in some logs — show it clearly
        if (d && d.type === 'APPLY' && Array.isArray(d.path) && d.path.includes('ready')) {
          console.log('[HANDSHAKE] parent applied ready ->', d);
          // optionally send a confirmation back (not required by Base, but harmless)
          window.parent.postMessage({ type: 'miniapp.ready.ack', version: 1 }, '*');
        }
      } catch (e) { /* ignore */ }
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
