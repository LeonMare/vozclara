import { useEffect, useRef, useState } from 'react';

interface Props {
  to: number;
  durationMs?: number;
  className?: string;
}

/**
 * Tabular-number counter that animates from 0 → `to` once when the
 * component mounts (or when `to` first becomes a positive number).
 *
 * Used in the loading screen to make the "247 sentences identified"
 * line feel substantiated — the count-up implies real work is
 * happening, not a fixed placeholder.
 */
export function CountUp({ to, durationMs = 900, className = '' }: Props) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (to <= 0 || startedRef.current) {
      if (to > 0 && startedRef.current) setValue(to); // jump if reset
      return;
    }
    startedRef.current = true;

    const start = performance.now();
    let rafId = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      // Ease-out cubic for natural slowdown.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [to, durationMs]);

  return <span className={['tabular-nums', className].join(' ')}>{value}</span>;
}
