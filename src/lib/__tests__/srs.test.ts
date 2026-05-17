import { describe, it, expect } from 'vitest';
import { applySm2, cefrFromMastered, type ReviewCard } from '../srs';

const NOW = Date.UTC(2026, 4, 17, 12, 0);

function freshCard(overrides: Partial<ReviewCard> = {}): ReviewCard {
  return {
    id: 'test',
    packId: 'pack-1',
    packTitle: 'Test Pack',
    word: 'Koalition',
    translation: 'coalition',
    context: '',
    sourceLang: 'de',
    outputLang: 'es',
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    due: NOW,
    lastReviewedAt: null,
    createdAt: NOW,
    ...overrides,
  };
}

describe('applySm2', () => {
  it('"good" on a fresh card sets interval to 1 day, keeps ease', () => {
    const next = applySm2(freshCard(), 'good', NOW);
    expect(next.reps).toBe(1);
    expect(next.interval).toBe(1);
    expect(next.ease).toBe(2.5);
    expect(next.due).toBe(NOW + 86_400_000);
  });

  it('"good" on second pass sets interval to 6 days', () => {
    const next = applySm2(freshCard({ reps: 1, interval: 1, lastReviewedAt: NOW - 86_400_000 }), 'good', NOW);
    expect(next.interval).toBe(6);
    expect(next.reps).toBe(2);
  });

  it('"easy" on second pass jumps to 10 days', () => {
    const next = applySm2(freshCard({ reps: 1, interval: 1 }), 'easy', NOW);
    expect(next.interval).toBe(10);
    expect(next.ease).toBeCloseTo(2.65, 2);
  });

  it('"again" lapses: reps reset, ease drops, interval = 1', () => {
    const next = applySm2(freshCard({ reps: 4, interval: 30, ease: 2.5 }), 'again', NOW);
    expect(next.reps).toBe(0);
    expect(next.lapses).toBe(1);
    expect(next.interval).toBe(1);
    expect(next.ease).toBeCloseTo(2.3, 2);
  });

  it('ease never falls below 1.3', () => {
    let card = freshCard({ ease: 1.4, reps: 5 });
    card = applySm2(card, 'again', NOW);
    expect(card.ease).toBe(1.3);
    card = applySm2(card, 'again', NOW);
    expect(card.ease).toBe(1.3);
  });

  it('multiple "good" reviews grow the interval roughly geometrically', () => {
    let card = freshCard();
    card = applySm2(card, 'good', NOW);          // interval 1
    card = applySm2(card, 'good', NOW);          // interval 6
    card = applySm2(card, 'good', NOW);          // interval 15 (= 6 * 2.5)
    card = applySm2(card, 'good', NOW);          // interval 38 (= 15 * 2.5)
    expect(card.interval).toBeGreaterThan(35);
    expect(card.interval).toBeLessThan(45);
  });
});

describe('cefrFromMastered', () => {
  it.each([
    [0, 'A0'],
    [49, 'A0'],
    [50, 'A1'],
    [249, 'A1'],
    [250, 'A2'],
    [799, 'A2'],
    [800, 'B1'],
    [1999, 'B1'],
    [2000, 'B2'],
    [3999, 'B2'],
    [4000, 'C1'],
    [7999, 'C1'],
    [8000, 'C2'],
    [50000, 'C2'],
  ])('%d mastered → %s', (mastered, level) => {
    expect(cefrFromMastered(mastered)).toBe(level);
  });
});
