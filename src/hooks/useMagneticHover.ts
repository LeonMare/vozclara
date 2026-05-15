import { useEffect, useRef } from 'react';

/**
 * Magnetic-hover effect for premium CTAs.
 *
 * Attach the returned ref to a button (or any element); when the user
 * moves the cursor inside its bounding box, the element gently follows
 * the cursor — pulled toward it by a fraction `strength` of the
 * mouse-to-centre delta. Snaps back to origin on mouseleave.
 *
 * The transform is written directly to element.style on every animation
 * frame (no React state) so the follow is smooth even at 120Hz cursors.
 * CSS transition on the element handles the easing in and out — set
 * `transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1)` on the
 * element for the canonical Voz Clara feel.
 *
 * Honoured constraints:
 *   • prefers-reduced-motion → effect disabled, returns inert ref
 *   • hover: none (touch devices) → effect disabled
 *
 * Click targets are still valid; the element only translates by a few
 * pixels at most (strength × half the element's dimensions), so the
 * cursor never falls off the button while moving.
 */
export function useMagneticHover<T extends HTMLElement>(strength = 0.2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === 'undefined') return;

    // Respect user agent + system preferences.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let raf = 0;

    function handleMove(e: MouseEvent) {
      if (!el) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) * strength;
        const dy = (e.clientY - rect.top - rect.height / 2) * strength;
        el.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
      });
    }

    function handleLeave() {
      if (!el) return;
      cancelAnimationFrame(raf);
      el.style.transform = '';
    }

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [strength]);

  return ref;
}
