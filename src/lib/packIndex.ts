/**
 * Pack-indexing client for the Vectorize-backed Ask My Knowledge.
 *
 * Breaks a generated Knowledge Pack into a flat list of text chunks
 * (summary short + long, each key idea, each chapter, each action,
 * each quote, each social angle, each vocab entry, each quiz Q+A)
 * and posts them to the worker's /api/index endpoint, which embeds
 * and upserts into Cloudflare Vectorize.
 *
 * When the worker isn't bound to a Vectorize index (no env.VECTORIZE),
 * it returns 503 and this module silently no-ops — the existing
 * prompt-stuffing /api/ask path keeps working without change.
 */

import { activeView, listPacks, markPackIndexed, type KnowledgePack } from './pack';
import { API_BASE } from './apiBase';

interface IndexChunk {
  kind: string;
  text: string;
  title?: string;
}

interface IndexHealth {
  available: boolean;
  provider: string | null;
  model: string | null;
  dimensions: number | null;
}

let healthCache: IndexHealth | null = null;
let healthPromise: Promise<IndexHealth> | null = null;

export async function checkIndexAvailability(): Promise<IndexHealth> {
  if (healthCache) return healthCache;
  if (healthPromise) return healthPromise;
  healthPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/index/health`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) throw new Error('bad_status');
      const data = (await res.json()) as IndexHealth;
      healthCache = data;
      return data;
    } catch {
      const fallback: IndexHealth = { available: false, provider: null, model: null, dimensions: null };
      healthCache = fallback;
      return fallback;
    }
  })();
  return healthPromise;
}

/**
 * Walk a pack's active translation and produce one chunk per natural
 * unit (summary, idea, chapter, …). Each chunk is small enough that
 * the embedding stays semantically focused — passing the whole pack
 * as one chunk would dilute the embedding into a mean of unrelated
 * topics.
 */
export function packToChunks(pack: KnowledgePack): IndexChunk[] {
  const view = activeView(pack);
  const chunks: IndexChunk[] = [];

  if (view.summary.short) {
    chunks.push({ kind: 'summary', text: view.summary.short, title: pack.title });
  }
  if (view.summary.long) {
    chunks.push({ kind: 'summaryLong', text: view.summary.long, title: pack.title });
  }
  view.keyIdeas.forEach((idea, i) => {
    chunks.push({
      kind: 'idea',
      text: `${idea.title}. ${idea.body}`,
      title: idea.title,
    });
    void i;
  });
  view.chapters.forEach((ch) => {
    chunks.push({
      kind: 'chapter',
      text: `${ch.title}. ${ch.summary}`,
      title: ch.title,
    });
  });
  view.actionPlan.forEach((step) => {
    chunks.push({ kind: 'action', text: step });
  });
  view.keyQuotes.forEach((q) => {
    chunks.push({
      kind: 'quote',
      text: q.speaker ? `"${q.text}" — ${q.speaker}` : `"${q.text}"`,
    });
  });
  view.socialAngles.forEach((a) => {
    chunks.push({ kind: 'angle', text: `${a.hook}. ${a.caption}` });
  });
  view.vocabulary.forEach((v) => {
    chunks.push({
      kind: 'vocab',
      text: `${v.word} → ${v.translation}. ${v.context ?? ''}`,
    });
  });
  view.quiz.forEach((q) => {
    chunks.push({
      kind: 'quiz',
      text: `Q: ${q.question}\nA: ${q.answer}${q.explanation ? '\n' + q.explanation : ''}`,
    });
  });

  // Cap to the worker's max so the post never gets rejected outright.
  return chunks.slice(0, 60);
}

/**
 * Index a pack into the vector store. Fire-and-forget: callers don't
 * need to await — if the worker doesn't have Vectorize bound, the
 * request 503s and we silently move on. Failures here never break
 * pack generation; the ask path still works through the fallback.
 *
 * On success, stamps `indexedAt` on the pack so the library back-fill
 * skips it next time.
 */
export async function indexPack(pack: KnowledgePack): Promise<boolean> {
  const health = await checkIndexAvailability();
  if (!health.available) return false;

  const chunks = packToChunks(pack);
  if (chunks.length === 0) return false;

  try {
    const res = await fetch(`${API_BASE}/api/index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packId: pack.id,
        brainId: pack.brainId,
        packTitle: pack.title,
        lang: pack.outputLang,
        mode: pack.mode,
        chunks,
      }),
    });
    if (!res.ok) return false;
    await markPackIndexed(pack.id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Background back-fill: walk the library and index every pack that
 * doesn't yet have `indexedAt`. Runs after Vectorize becomes available
 * so existing packs become searchable without forcing the user to
 * regenerate anything. No-op when Vectorize is unbound. Throttled to
 * a small concurrency so we don't spike Workers AI neurons.
 */
export async function ensureLibraryIndexed(brainId: string): Promise<void> {
  const health = await checkIndexAvailability();
  if (!health.available) return;

  const packs = await listPacks(brainId);
  const pending = packs.filter((p) => !p.indexedAt && p.brainId !== 'sample');
  if (pending.length === 0) return;

  const CONCURRENCY = 3;
  let cursor = 0;
  async function worker() {
    while (cursor < pending.length) {
      const pack = pending[cursor++];
      await indexPack(pack);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

/**
 * Best-effort cleanup when a pack is deleted. Same fire-and-forget
 * semantics — if the worker can't reach Vectorize, the stale vectors
 * eventually expire from the index when the user re-indexes.
 */
export async function deindexPack(packId: string): Promise<void> {
  const health = await checkIndexAvailability();
  if (!health.available) return;
  try {
    await fetch(`${API_BASE}/api/index?packId=${encodeURIComponent(packId)}`, {
      method: 'DELETE',
    });
  } catch {
    // ignore
  }
}
