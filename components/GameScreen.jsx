'use client';
import { useEffect, useRef, useState } from 'react';
import Countdown from './Countdown';
import FinishScreen from './FinishScreen';
import Link from 'next/link';

const ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function GameScreen() {
  const [user, setUser] = useState('@anonymous');
  const [nextIndex, setNextIndex] = useState(0);
  const [shuffled, setShuffled] = useState([]);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(false);

  const [clickedLetters, setClickedLetters] = useState([]); // correct clicked
  const [wrongLetters, setWrongLetters] = useState([]); // temporary wrong flash

  const intervalRef = useRef(null);

  useEffect(() => {
    // initial shuffle & reset
    setShuffled(shuffle(ALPH));
    setNextIndex(0);
    setRunning(false);
    setStartTime(null);
    setElapsed(0);
    setFinished(false);
    setSubmitted(false);
    setClickedLetters([]);
    setWrongLetters([]);
  }, []);

  useEffect(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setElapsed((Date.now() - startTime) / 1000);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, startTime]);

  const nextLetter = ALPH[nextIndex] || null;

  function handleStart() {
    setCountdown(true);
  }
  function onCountdownFinish() {
    setCountdown(false);
    setRunning(true);
    setStartTime(Date.now());
    setElapsed(0);
    setNextIndex(0);
    setClickedLetters([]);
    setWrongLetters([]);
    setFinished(false);
    setSubmitted(false);
    setShuffled(shuffle(ALPH));
  }

  function clickLetter(letter) {
    if (!running) return;
    if (finished) return;
    if (!letter) return;
    if (clickedLetters.includes(letter)) return;

    if (letter === nextLetter) {
      setClickedLetters((prev) => [...prev, letter]);
      setNextIndex((i) => {
        const ni = i + 1;
        if (ni >= ALPH.length) {
          setRunning(false);
          setFinished(true);
          setElapsed((Date.now() - startTime) / 1000);
        }
        return ni;
      });
    } else {
      if (!wrongLetters.includes(letter)) {
        setWrongLetters((prev) => [...prev, letter]);
        setTimeout(() => {
          setWrongLetters((prev) => prev.filter((x) => x !== letter));
        }, 450);
      }
    }
  }

  async function submitScore() {
    try {
      const time = elapsed;
      await fetch('/api/saveScore', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: user, time }),
      });
      setSubmitted(true);
    } catch (e) {
      console.error(e);
    }
  }

  function retry() {
    setShuffled(shuffle(ALPH));
    setNextIndex(0);
    setRunning(false);
    setStartTime(null);
    setElapsed(0);
    setFinished(false);
    setSubmitted(false);
    setClickedLetters([]);
    setWrongLetters([]);
    setCountdown(false);
  }

  // build 7x4 rows array (pad to 28)
  function makeRowsFromShuffled(arr) {
    const items = [...arr];
    while (items.length < 28) items.push('');
    const rows = [];
    for (let r = 0; r < 7; r++) rows.push(items.slice(r * 4, r * 4 + 4));
    return rows;
  }

  const initials = (user || '@').split(' ').map((s) => s[0] || '').slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* App name in a box */}
        <header className="pt-6 pb-4">
          <div className="mx-auto w-full max-w-xs bg-white rounded-2xl shadow-md border border-gray-200 px-4 py-3">
            <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-gray-900">WordGrid</h1>
          </div>
        </header>

        {/* top row: timer | avatar+username+play | next */}
        <div className="grid grid-cols-3 gap-3 mb-4 px-1 items-center">
          {/* Timer (slim) */}
          <div className="flex items-center justify-center">
            <div className="w-full bg-white rounded-2xl p-2 py-2 flex flex-col items-start shadow-sm border border-gray-200">
              <div className="text-xs text-gray-500">Timer</div>
              <div className="text-sm font-semibold text-gray-900">
                {running ? elapsed.toFixed(3) + ' s' : finished ? elapsed.toFixed(3) + ' s' : '0.000 s'}
              </div>
            </div>
          </div>

          {/* center: avatar + username + play/leaderboard */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md">
                {initials || '@'}
              </div>
              <div className="mt-2 text-xs text-gray-600">{user}</div>
            </div>

            {/* Play + leaderboard shown when not running/finished */}
            {!running && !finished && !countdown && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <button onClick={handleStart} className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow">
                  Play
                </button>
                <Link href="/leaderboard">
                  <a className="mt-1 px-3 py-1 rounded-md bg-white border border-gray-200 text-sm text-gray-700 shadow-sm">Leaderboard</a>
                </Link>
              </div>
            )}
          </div>

          {/* Next (slim) */}
          <div className="flex items-center justify-center">
            <div className="w-full bg-white rounded-2xl p-2 py-2 flex items-center justify-end shadow-sm border border-gray-200">
              <div className="text-right">
                <div className="text-xs text-gray-500">Next</div>
                <div className="text-lg font-extrabold text-gray-900">{nextLetter || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown */}
        {countdown && (
          <div className="flex justify-center mb-3">
            <Countdown start={3} onFinish={onCountdownFinish} />
          </div>
        )}

        {/* Letter Box (Tailwind layout like MobileAppUI) */}
        <section role="grid" aria-label="Letter box" className="bg-white rounded-2xl p-3 shadow-md">
          <div className="space-y-3">
            {makeRowsFromShuffled(shuffled).map((row, rIdx) => (
              <div key={rIdx} role="row" className="grid grid-cols-4 gap-3">
                {row.map((cell, cIdx) => {
                  const isLastRow = rIdx === 6;
                  const isSecondCellOfBackGroup = isLastRow && cIdx === 2;

                  // If second cell of back group, we skip (back will be rendered at cIdx === 3)
                  if (isSecondCellOfBackGroup) return null;

                  // Render Back as a button occupying two cells on the last row (render when cIdx===3)
                  if (isLastRow && cIdx === 3) {
                    return (
                      <button
                        key={`back-${rIdx}`}
                        onClick={() => (window.location.href = '/')}
                        role="button"
                        aria-label="Back"
                        className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm font-medium text-red-700">Back</span>
                      </button>
                    );
                  }

                  const letter = cell;
                  const isClicked = letter && clickedLetters.includes(letter);
                  const isWrong = letter && wrongLetters.includes(letter);
                  const isDisabled = !letter || isClicked;

                  // classes for states
                  const baseClasses = 'h-14 sm:h-16 flex items-center justify-center rounded-lg border select-none touch-manipulation text-lg sm:text-xl font-semibold';
                  const defaultBg = 'bg-gray-50 border-gray-200 text-gray-900';
                  const clickedBg = 'bg-emerald-500 border-emerald-600 text-white';
                  const wrongBg = 'bg-rose-400 border-rose-500 text-white';
                  const classes = `${baseClasses} ${isClicked ? clickedBg : isWrong ? wrongBg : defaultBg}`;

                  return (
                    <div
                      key={`cell-${rIdx}-${cIdx}`}
                      role="gridcell"
                      id={letter ? `l-${letter}` : `empty-${rIdx}-${cIdx}`}
                      onClick={() => clickLetter(letter)}
                      aria-label={letter ? `Letter ${letter}` : 'Empty letter cell'}
                      aria-disabled={isDisabled}
                      className={classes}
                      style={{ cursor: letter && !isDisabled ? 'pointer' : 'default' }}
                    >
                      {letter || ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* footer helper */}
        <div className="mt-5 text-center text-xs text-gray-500">Tap letters to select. Use Back to undo.</div>

        {/* FinishScreen */}
        {finished && (
          <FinishScreen
            time={elapsed}
            onSubmit={submitScore}
            onRetry={retry}
            onBack={() => (window.location.href = '/')}
            submitted={submitted}
          />
        )}
      </div>
    </div>
  );
}

/* Helpers */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
