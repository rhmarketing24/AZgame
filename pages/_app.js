// pages/_app.js
import '../styles/globals.css';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const ORIGINS = [
      'https://base.dev',
      'https://base.build',
      'https://preview.base.build',
      'https://base.app'
    ];
    const readyMsg = { type: 'miniapp.ready', version: 1 };

    const sendAll = (useWildcard = false) => {
      ORIGINS.forEach(o => {
        try { window.parent.postMessage(readyMsg, o); console.log('[miniapp.ready] ->', o); }
        catch(e){ console.warn('postMessage ->', o, e); }
      });
      if (useWildcard) {
        try { window.parent.postMessage(readyMsg, '*'); console.log('[miniapp.ready] -> wildcard'); }
        catch(e){ console.warn('wildcard postMessage failed', e); }
      }
    };

    // immediate + retries
    sendAll();
    const t1 = setTimeout(() => sendAll(), 400);
    const t2 = setTimeout(() => sendAll(true), 1200);
    let tries = 0;
    const interval = setInterval(() => {
      if (tries++ > 8) { clearInterval(interval); return; }
      sendAll();
    }, 2000);

    const onVis = () => { if (!document.hidden) sendAll(); };
    document.addEventListener('visibilitychange', onVis);

    // ---- verbose listener: log everything and reply back with ACK+echo
    const onMessage = (ev) => {
      try {
        console.log('[from-parent recv]', { origin: ev.origin, data: ev.data });
        // send an explicit ack + echo of received data (helps Base finalize handshake)
        const ack = { type: 'miniapp.client_ack', version: 1, received: ev.data, origin: window.location.origin, ts: Date.now() };
        try {
          window.parent.postMessage(ack, '*');
          console.log('[miniapp.client_ack] sent', ack);
        } catch (err) { console.warn('client_ack failed', err); }
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
