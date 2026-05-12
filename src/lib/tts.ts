/**
 * Multilingual TTS via Web Speech API. Free, browser-native, no API key.
 *
 * Voice selection ranking prefers premium / enhanced / brand-name voices
 * (Mónica on iOS, Microsoft Helena on Windows) over robotic defaults.
 * iOS requires the first utterance to come from a user gesture — call
 * unlockTTS() inside a click handler before any programmatic speak.
 */

import type { Locale } from './i18n';

let unlocked = false;

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function unlockTTS(): void {
  if (!ttsAvailable() || unlocked) return;
  const u = new SpeechSynthesisUtterance(' ');
  u.lang = 'es-ES';
  u.volume = 1.0;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
  unlocked = true;
}

export function isUnlocked(): boolean {
  return unlocked;
}

const LANG_TAG: Record<Locale, string> = {
  es: 'es-ES',
  pt: 'pt-PT',
  de: 'de-DE',
  en: 'en-US',
};

function voiceQuality(v: SpeechSynthesisVoice, wantTag: string): number {
  const n = v.name.toLowerCase();
  let s = 0;

  // Brand-name premium voices on iOS/macOS.
  if (/(monica|paulina|jorge|juan|diego|helena|luciana|joana|samantha|aaron|nicky)/.test(n)) s += 60;
  // Quality markers.
  if (n.includes('premium')) s += 50;
  if (n.includes('enhanced')) s += 40;
  if (n.includes('neural')) s += 35;
  if (n.includes('natural')) s += 25;
  // Penalise known compact / low-quality voices.
  if (n.includes('compact')) s -= 25;
  if (n.includes('eloquence')) s -= 35;

  // Exact locale match wins.
  if (v.lang === wantTag) s += 30;
  else if (v.lang.startsWith(wantTag.slice(0, 2))) s += 15;

  // Slight preference for local (offline) voices.
  if (v.localService) s += 5;

  return s;
}

let voiceCache: SpeechSynthesisVoice[] | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  if (!ttsAvailable()) return [];
  return window.speechSynthesis.getVoices();
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { voiceCache = loadVoices(); };
}

export function listVoicesFor(locale: Locale): SpeechSynthesisVoice[] {
  const tag = LANG_TAG[locale];
  const voices = voiceCache ?? loadVoices();
  return voices
    .filter((v) => v.lang.toLowerCase().startsWith(tag.slice(0, 2)))
    .sort((a, b) => voiceQuality(b, tag) - voiceQuality(a, tag));
}

export function pickVoice(locale: Locale, override?: string): SpeechSynthesisVoice | null {
  const candidates = listVoicesFor(locale);
  if (candidates.length === 0) return null;
  if (override) {
    const found = candidates.find((v) => v.name === override);
    if (found) return found;
  }
  return candidates[0];
}

export interface SpeakOptions {
  text: string;
  locale: Locale;
  voice?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: SpeechSynthesisErrorEvent) => void;
}

export function speak({
  text,
  locale,
  voice,
  rate = 1.0,
  pitch = 1.0,
  onStart,
  onEnd,
  onError,
}: SpeakOptions): SpeechSynthesisUtterance | null {
  if (!ttsAvailable()) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  const u = new SpeechSynthesisUtterance(trimmed);
  u.lang = LANG_TAG[locale];
  u.volume = 1.0;
  u.rate = rate;
  u.pitch = pitch;

  const v = pickVoice(locale, voice);
  if (v) u.voice = v;

  if (onStart) u.onstart = onStart;
  if (onEnd) u.onend = onEnd;
  if (onError) u.onerror = onError;

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    setTimeout(() => window.speechSynthesis.speak(u), 60);
  } else {
    window.speechSynthesis.speak(u);
  }
  return u;
}

export function stopSpeaking(): void {
  if (!ttsAvailable()) return;
  window.speechSynthesis.cancel();
}

export function pauseSpeaking(): void {
  if (!ttsAvailable()) return;
  window.speechSynthesis.pause();
}

export function resumeSpeaking(): void {
  if (!ttsAvailable()) return;
  window.speechSynthesis.resume();
}
