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
    const onMessage = (ev) => {
      try {
        // optional: filter by known origins if you want
        // if (!ORIGINS.includes(ev.origin) && ev.origin !== 'null') return;
        console.log('[from-parent message]', { origin: ev.origin, data: ev.data });
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
