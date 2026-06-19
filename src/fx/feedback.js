/*
 * FEEDBACK LAYER — FX.*
 * Single immersion entry point for sound + haptics.
 *
 *   Web    → reuses the existing WebAudio oscillator SoundManager (works today).
 *   Native → expo-av for sampled SFX + expo-haptics for taptic feedback.
 *
 * Native sound is SILENT until real audio files are dropped into assets/sfx/
 * and registered in the SFX map below (see the commented block). Haptics work
 * immediately. Everything degrades gracefully: if a dependency isn't installed
 * yet the require fails quietly and the app keeps running.
 *
 * Konstantin + Ruben both CALL these. Only Ruben EDITS this file.
 */

import { Platform } from 'react-native';
import { Sound as WebSound } from '../components/SoundManager';

const isWeb = Platform.OS === 'web';

// ── Optional native modules (graceful require) ──────────────────────────────
let Haptics = null;
let Audio = null;
let AsyncStorage = null;

if (!isWeb) {
  try { Haptics = require('expo-haptics'); } catch (_) { /* not installed yet */ }
  try { ({ Audio } = require('expo-av')); } catch (_) { /* not installed yet */ }
}
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (_) { /* not installed yet */ }

// ── Native SFX registry ─────────────────────────────────────────────────────
// Metro requires static paths, so only list files that actually exist —
// uncomment each line as the asset lands in assets/sfx/.
const SFX = {
  // success: require('../../assets/sfx/success-chime.mp3'),
  // error:   require('../../assets/sfx/error-buzz.mp3'),
  // click:   require('../../assets/sfx/glass-clink.mp3'),
  // drip:    require('../../assets/sfx/drip.mp3'),
  // clunk:   require('../../assets/sfx/locker-clunk.mp3'),
  // alarm:   require('../../assets/sfx/alarm-klaxon.mp3'),
  // radio:   require('../../assets/sfx/radio-beep.mp3'),
};

// ── State ───────────────────────────────────────────────────────────────────
const MUTE_KEY = '@chemie/muted';
let muted = false;

// Restore persisted mute preference on first import.
if (AsyncStorage) {
  AsyncStorage.getItem(MUTE_KEY)
    .then((v) => { if (v != null) setMuted(v === '1'); })
    .catch(() => {});
}

function setMuted(value) {
  muted = !!value;
  if (muted) WebSound.mute(); else WebSound.unmute();
  if (AsyncStorage) AsyncStorage.setItem(MUTE_KEY, muted ? '1' : '0').catch(() => {});
  return muted;
}

// ── Native audio ────────────────────────────────────────────────────────────
const players = {};            // key -> Audio.Sound (lazy pool)
let audioModeReady = false;

async function ensureAudioMode() {
  if (audioModeReady || !Audio) return;
  audioModeReady = true;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,        // ring/silent switch shouldn't mute the game
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch (_) { /* ignore */ }
}

async function playNative(key) {
  if (!Audio || !SFX[key]) return;       // no module or no file → silent (no crash)
  try {
    await ensureAudioMode();
    if (!players[key]) {
      const { sound } = await Audio.Sound.createAsync(SFX[key], { volume: 0.9 });
      players[key] = sound;
    }
    await players[key].replayAsync();
  } catch (_) { /* ignore playback errors */ }
}

// ── Haptics ─────────────────────────────────────────────────────────────────
function haptic(kind) {
  if (!Haptics || muted) return;
  try {
    switch (kind) {
      case 'light':   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); break;
      case 'medium':  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); break;
      case 'heavy':   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); break;
      case 'success': Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); break;
      case 'error':   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); break;
      default: break;
    }
  } catch (_) { /* ignore */ }
}

// ── Dispatch ────────────────────────────────────────────────────────────────
// webFn: the matching SoundManager method (web only). key: SFX registry key
// (native). hapticKind: taptic feedback on native.
function fire(key, webFn, hapticKind) {
  if (muted) return;
  if (isWeb) { if (webFn) webFn(); }
  else { playNative(key); haptic(hapticKind); }
}

export const FX = {
  success() { fire('success', WebSound.success, 'success'); },
  error()   { fire('error',   WebSound.error,   'error'); },
  click()   { fire('click',   WebSound.click,   'light'); },
  drip()    { fire('drip',    WebSound.click,   'light'); },
  clunk()   { fire('clunk',   WebSound.alarm,   'medium'); },
  alarm()   { fire('alarm',   WebSound.alarm,   'heavy'); },
  radio()   { fire('radio',   WebSound.click,   'light'); },

  // mute() with no arg toggles; mute(true/false) sets. Returns new state.
  mute(value) { return setMuted(value === undefined ? !muted : value); },
  isMuted() { return muted; },
};

export default FX;
