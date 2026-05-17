/**
 * Per-pack AI conversation — client wrapper for /api/chat plus IDB
 * history. Each pack carries its own chat under chat:v1:<packId>;
 * deleting a pack also deletes the chat (see PackPage handleDelete
 * → deleteChat path, called there).
 *
 * Local-first: history lives in IndexedDB. Only the bounded last-N
 * window plus the new user message ever travel to the worker.
 */

import { get, set, del } from 'idb-keyval';
import { activeView, type KnowledgePack } from './pack';
import { API_BASE } from './apiBase';

const SCHEMA = 'chat:v1';
const chatKey = (packId: string) => `${SCHEMA}:${packId}`;
const HISTORY_LIMIT = 40;     // cap stored locally
const CONTEXT_LIMIT = 10;     // cap sent to worker

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  ts: number;
}

interface ChatStore {
  packId: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export class ChatError extends Error {
  constructor(
    public code: 'empty' | 'too_long' | 'ai_failed' | 'network',
    message: string,
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

/* ─── Local history ───────────────────────────────────────────────── */

export async function loadChat(packId: string): Promise<ChatMessage[]> {
  const raw = await get<ChatStore>(chatKey(packId));
  if (!raw || !Array.isArray(raw.messages)) return [];
  return raw.messages.slice(-HISTORY_LIMIT);
}

async function appendMessage(packId: string, msg: ChatMessage): Promise<ChatMessage[]> {
  const existing = (await get<ChatStore>(chatKey(packId)))?.messages ?? [];
  const next = [...existing, msg].slice(-HISTORY_LIMIT);
  await set(chatKey(packId), {
    packId,
    messages: next,
    updatedAt: Date.now(),
  });
  return next;
}

export async function clearChat(packId: string): Promise<void> {
  await del(chatKey(packId));
}

/* ─── Send a turn ─────────────────────────────────────────────────── */

/**
 * Append the user's message locally, hit /api/chat with a bounded
 * history window, append the assistant reply, return updated list.
 * Throws ChatError for empty/too-long/network/ai_failed cases.
 */
export async function sendChatMessage(
  pack: KnowledgePack,
  message: string,
): Promise<ChatMessage[]> {
  const trimmed = message.trim();
  if (trimmed.length === 0) throw new ChatError('empty', 'message empty');
  if (trimmed.length > 1000) throw new ChatError('too_long', 'message too long');

  const userMsg: ChatMessage = { role: 'user', content: trimmed, ts: Date.now() };
  const localWithUser = await appendMessage(pack.id, userMsg);

  const view = activeView(pack);
  const condensed = {
    title: pack.title,
    outputLang: pack.outputLang,
    sourceLang: pack.sourceLang,
    mode: pack.mode,
    summary: view.summary,
    keyIdeas: view.keyIdeas.map((k) => ({ title: k.title, body: k.body })),
    vocabulary: view.vocabulary.map((v) => ({
      word: v.word,
      translation: v.translation,
      context: v.context,
    })),
    keyQuotes: view.keyQuotes.map((q) => ({ text: q.text, speaker: q.speaker })),
  };

  const historyForWorker = localWithUser
    .slice(0, -1)                         // exclude the just-appended user message
    .slice(-CONTEXT_LIMIT)                // bound the context
    .map((m) => ({ role: m.role, content: m.content }));

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack: condensed, history: historyForWorker, message: trimmed }),
    });
  } catch (err) {
    throw new ChatError('network', `network error: ${String(err)}`);
  }

  if (!res.ok) {
    let body: { error?: string; detail?: string } = {};
    try { body = await res.json(); } catch { /* ignore */ }
    if (body.error === 'message_empty') throw new ChatError('empty', 'message empty');
    if (body.error === 'message_too_long') throw new ChatError('too_long', 'too long');
    if (body.error === 'ai_failed') throw new ChatError('ai_failed', body.detail ?? 'LLM failed');
    throw new ChatError('network', `HTTP ${res.status}`);
  }

  const data = (await res.json()) as { reply?: string };
  const reply = (data.reply ?? '').trim();
  if (!reply) throw new ChatError('ai_failed', 'empty reply');

  const assistantMsg: ChatMessage = { role: 'assistant', content: reply, ts: Date.now() };
  return appendMessage(pack.id, assistantMsg);
}
