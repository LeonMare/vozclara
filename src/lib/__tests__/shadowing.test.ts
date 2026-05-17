import { describe, it, expect } from 'vitest';
import { scoreMatch } from '../shadowing';

/**
 * Shadowing similarity scorer. The verdict thresholds (great ≥ 0.85,
 * good ≥ 0.6, else try_again) are visible to the user as colour-coded
 * panels, so regressions here directly change the felt difficulty of
 * the pronunciation drill.
 */
describe('scoreMatch', () => {
  it('returns 1.0 / great for identical strings', () => {
    const r = scoreMatch('Die schwarz-rote Koalition.', 'Die schwarz-rote Koalition.');
    expect(r.score).toBe(1);
    expect(r.verdict).toBe('great');
  });

  it('ignores case and punctuation when matching', () => {
    const r = scoreMatch('Die schwarz-rote Koalition.', 'die SCHWARZ rote koalition');
    expect(r.score).toBeGreaterThanOrEqual(0.85);
    expect(r.verdict).toBe('great');
  });

  it('returns good (0.6-0.85) when one content word is missing', () => {
    const r = scoreMatch('Die schwarz-rote Koalition.', 'Die rote Koalition.');
    expect(r.score).toBeGreaterThanOrEqual(0.6);
    expect(r.score).toBeLessThan(0.85);
    expect(r.verdict).toBe('good');
  });

  it('returns try_again for unrelated text', () => {
    const r = scoreMatch('Die Koalition wollte einen Aufbruch.', 'Heute ist ein schöner Tag.');
    expect(r.score).toBeLessThan(0.4);
    expect(r.verdict).toBe('try_again');
  });

  it('handles empty input safely', () => {
    expect(scoreMatch('', 'something').verdict).toBe('try_again');
    expect(scoreMatch('something', '').verdict).toBe('try_again');
    expect(scoreMatch('', '').verdict).toBe('try_again');
  });

  it('normalises smart quotes and dashes', () => {
    const r = scoreMatch('he said "hi"—loudly', 'he said hi loudly');
    expect(r.score).toBeGreaterThanOrEqual(0.85);
  });
});
