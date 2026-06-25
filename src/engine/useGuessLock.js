/*
 * useGuessLock — escalating lockout to deter brute-forcing a puzzle answer.
 * 1st wrong guess is free; then 2 s, 4 s, 8 s, 16 s, capped at 20 s. A correct
 * move calls reset() so genuine progress is never penalised.
 *
 *   const lock = useGuessLock();
 *   const tap = (i) => {
 *     if (lock.locked) { FX.error(); return; }   // ignore taps while cooling down
 *     if (correct) { lock.reset(); ... } else { lock.registerWrong(); ... }
 *   };
 *   // show lock.remainS while lock.locked
 */
import { useState, useRef, useEffect } from 'react';

export function useGuessLock(cap = 20) {
  const wrongRef = useRef(0);
  const [lockUntil, setLockUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  // Tick only while a lock is active; self-clears when it expires.
  useEffect(() => {
    if (Date.now() >= lockUntil) return;
    const id = setInterval(() => {
      if (Date.now() >= lockUntil) clearInterval(id);
      setNow(Date.now());
    }, 200);
    return () => clearInterval(id);
  }, [lockUntil]);

  const locked = now < lockUntil;
  const remainS = Math.max(0, Math.ceil((lockUntil - now) / 1000));

  const registerWrong = () => {
    wrongRef.current += 1;
    const secs = wrongRef.current < 2 ? 0 : Math.min(2 ** (wrongRef.current - 1), cap);
    if (secs > 0) setLockUntil(Date.now() + secs * 1000);
  };
  const reset = () => { wrongRef.current = 0; setLockUntil(0); setNow(Date.now()); };

  return { locked, remainS, registerWrong, reset };
}
