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

    const sendAll = (useWildcard = false) => {
      ORIGINS.forEach((o) => {
        try {
          window?.parent?.postMessage(readyMsg, o);
          console.log('[miniapp.ready] sent ->', o);
        } catch (e) {
          console.warn('[miniapp.ready] failed ->', o, e);
        }
      });

      if (useWildcard) {
        try {
          window?.parent?.postMessage(readyMsg, '*');
          console.log('[miniapp.ready] sent -> *');
        } catch (e) {
          console.warn('[miniapp.ready] wildcard failed', e);
        }
      }
    };

    // send immediately + retries
    sendAll();
    const t1 = setTimeout(() => sendAll(), 400);
    const t2 = setTimeout(() => sendAll(true), 1200);

    let tries = 0;
    const interval = setInterval(() => {
      if (tries++ > 6) {
        clearInterval(interval);
        return;
      }
      sendAll();
    }, 2000);

    const onVis = () => {
      if (!document.hidden) sendAll();
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return <Component {...pageProps} />;
}
