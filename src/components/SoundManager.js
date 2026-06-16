/*
 * SOUND-EFFEKTE via WebAudio / Expo Audio
 * Erzeugt kurze Pieptoene per Oszillator (keine Audiodateien noetig).
 * Nur auf Web verfuegbar, auf Native stumm (harmlos).
 */

import { Platform } from 'react-native';

let audioCtx = null;

function getCtx() {
  if (Platform.OS !== 'web') return null;
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch { return null; }
  }
  return audioCtx;
}

// Kurzer Piepton
function beep(freq, duration, volume = 0.1) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = freq;
  osc.type = 'square';
  gain.gain.value = volume;
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.stop(ctx.currentTime + duration);
}

let muted = false;

export const Sound = {
  mute: () => { muted = true; },
  unmute: () => { muted = false; },
  isMuted: () => muted,
  toggle: () => { muted = !muted; return muted; },

  // Erfolg: aufsteigende Toene
  success: () => {
    if (muted) return;
    beep(440, 0.1); setTimeout(() => beep(554, 0.1), 100);
    setTimeout(() => beep(659, 0.15), 200);
  },

  // Fehler: tiefer Ton
  error: () => {
    if (muted) return;
    beep(200, 0.25, 0.08);
  },

  // Klick
  click: () => {
    if (muted) return;
    beep(800, 0.05, 0.05);
  },

  // Alarm
  alarm: () => {
    if (muted) return;
    beep(300, 0.15, 0.06); setTimeout(() => beep(250, 0.15, 0.06), 200);
  },
};
