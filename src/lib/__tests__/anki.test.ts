import { describe, it, expect } from 'vitest';
import { ankiFilename } from '../anki';
import type { KnowledgePack } from '../pack';

function pack(overrides: Partial<KnowledgePack> = {}): KnowledgePack {
  return {
    id: 'p1',
    brainId: 'b1',
    source: { type: 'youtube', url: 'https://youtu.be/XXXXXXXXXXX', videoId: 'XXXXXXXXXXX' },
    title: 'Tagesschau 20:00 Uhr · 03.05.2026',
    sourceLang: 'de',
    outputLang: 'es',
    outputLanguages: ['es'],
    translations: { es: { summary: { short: '', long: '' }, keyIdeas: [], chapters: [], actionPlan: [], vocabulary: [], keyQuotes: [], socialAngles: [], quiz: [] } },
    mode: 'brief',
    genre: 'news',
    status: 'ready',
    tags: [],
    category: 'general',
    isPublic: false,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('ankiFilename', () => {
  it('slugifies the pack title and adds .apkg', () => {
    expect(ankiFilename(pack())).toBe('tagesschau-2000-uhr-03052026.apkg');
  });

  it('falls back to "vozclara.apkg" when the title is empty', () => {
    expect(ankiFilename(pack({ title: '' }))).toBe('vozclara.apkg');
  });

  it('caps the slug to a sane length (≤ ~70 chars)', () => {
    const longTitle = 'A'.repeat(200);
    const name = ankiFilename(pack({ title: longTitle }));
    expect(name.length).toBeLessThanOrEqual(70);
    expect(name.endsWith('.apkg')).toBe(true);
  });

  it('drops punctuation and collapses spaces', () => {
    expect(ankiFilename(pack({ title: 'Hello, World!! (test)' }))).toBe('hello-world-test.apkg');
  });

  it('handles unicode by stripping non-word characters', () => {
    // "ñ" and "ü" get stripped by /[^\w\s-]/g — the slug picks the
    // remaining ASCII content. Good enough for filenames.
    const name = ankiFilename(pack({ title: 'España · Übung' }));
    expect(name).toMatch(/\.apkg$/);
    expect(name.length).toBeGreaterThan(5);
  });
});
