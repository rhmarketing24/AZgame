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

    const sendTo = (target) => {
      try {
        window.parent.postMessage(readyMsg, target);
        console.log('[miniapp.ready] sent ->', target, readyMsg);
      } catch (e) {
        console.warn('[miniapp.ready] postMessage failed ->', target, e);
      }
    };

    // try direct using document.referrer origin (if present)
    let refOrigin = null;
    try {
      if (document.referrer) {
        const u = new URL(document.referrer);
        refOrigin = u.origin;
      }
    } catch (e) {
      refOrigin = null;
    }

    // send explicitly to referrer origin first (best)
    if (refOrigin) sendTo(refOrigin);

    // then try our known origins
    ORIGINS.forEach(o => sendTo(o));

    // then wildcard fallback after a bit
    setTimeout(() => sendTo('*'), 800);

    // repeated sends (timing / race)
    let tries = 0;
    const interval = setInterval(() => {
      if (tries++ > 8) { clearInterval(interval); return; }
      if (refOrigin) sendTo(refOrigin);
      ORIGINS.forEach(o => sendTo(o));
    }, 1000);

    // listen for parent messages (debug)
    const onMessage = (ev) => {
      console.log('[from-parent]', { origin: ev.origin, data: ev.data });
    };
    window.addEventListener('message', onMessage);

    const onVis = () => { if (!document.hidden) {
      if (refOrigin) sendTo(refOrigin);
      ORIGINS.forEach(o => sendTo(o));
    }};
    document.addEventListener('visibilitychange', onVis);

    return () => {
      clearInterval(interval);
      window.removeEventListener('message', onMessage);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <Component {...pageProps} />;
}
