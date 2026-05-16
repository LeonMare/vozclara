/**
 * Ask My Knowledge — client wrapper for /api/ask.
 *
 * The client condenses each Knowledge Pack to a compact summary + key
 * ideas list (no transcript, no quiz, no vocabulary — those would blow
 * the LLM context budget without adding answer-quality). The worker
 * runs a single LLM call, returns the answer plus a list of pack ids
 * the LLM cited inline with [pack:<id>] markers.
 *
 * Local-first: nothing leaves the browser except the question and the
 * condensed packs the user explicitly invokes Ask on.
 */

import { activeView, type KnowledgePack } from './pack';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export interface AskCondensedPack {
  id: string;
  title: string;
  summary: { short: string; long: string };
  keyIdeas: Array<{ title: string; body: string }>;
}

export interface AskResult {
  answer: string;
  citations: string[];
  /** Tells the client which retrieval path the worker used. */
  strategy?: 'vector' | 'stuff';
}

export class AskError extends Error {
  constructor(
    public code: 'empty_library' | 'question_too_short' | 'question_too_long' | 'ai_failed' | 'network',
    message: string,
  ) {
    super(message);
    this.name = 'AskError';
  }
}

/**
 * Condense a full KnowledgePack down to the shape /api/ask expects.
 * Reads the active translation so the worker sees the user's view
 * language. Caller can override which translation to use by mutating
 * pack.outputLang before passing — useful if you want to send English
 * content even when the user's UI is in Spanish.
 */
export function condensePack(pack: KnowledgePack): AskCondensedPack {
  const view = activeView(pack);
  return {
    id: pack.id,
    title: pack.title,
    summary: {
      short: view.summary.short,
      long: view.summary.long,
    },
    keyIdeas: view.keyIdeas.map((k) => ({ title: k.title, body: k.body })),
  };
}

export async function askKnowledge(
  question: string,
  packs: AskCondensedPack[],
  locale: string,
  brainId?: string,
): Promise<AskResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, packs, locale, brainId }),
    });
  } catch (err) {
    throw new AskError('network', `network error: ${String(err)}`);
  }

  if (!res.ok) {
    let body: { error?: string; detail?: string } = {};
    try { body = await res.json(); } catch { /* ignore */ }
    const code = body.error;
    if (code === 'empty_library') throw new AskError('empty_library', 'no packs in library');
    if (code === 'question_too_short') throw new AskError('question_too_short', 'question is too short');
    if (code === 'question_too_long') throw new AskError('question_too_long', 'question is too long');
    if (code === 'ai_failed') throw new AskError('ai_failed', body.detail ?? 'LLM call failed');
    throw new AskError('network', `HTTP ${res.status}: ${body.error ?? 'unknown'}`);
  }

  return (await res.json()) as AskResult;
}
