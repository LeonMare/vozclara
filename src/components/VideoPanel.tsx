import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../lib/i18n';
import type { VideoSource } from '../lib/pack';

interface Props {
  source: VideoSource;
  /**
   * Seek-request token from the parent. The `sec` field is the YouTube
   * `start` parameter. The `nonce` lets consecutive clicks on the
   * SAME timestamp still re-trigger a remount + seek — without it
   * React would treat the prop as unchanged and the second click
   * would be silent. The PackPage's transcript and chapters tabs
   * drive this.
   */
  seek?: { sec: number; nonce: number };
}

/**
 * Collapsible YouTube source panel for the Pack view.
 *
 * VozClara's pitch is "save the knowledge, not just the video" — so we
 * don't auto-expand the video. The default state is a thumbnail card
 * with a play affordance; clicking it expands an inline 16:9 iframe
 * underneath. The "open on YouTube" link is always visible so the user
 * never feels trapped if the embed fails to load (some videos disable
 * embedding via the channel's settings — we don't get a callback for
 * that, so the link is the universal fallback).
 *
 * Privacy:
 *   • Uses youtube-nocookie.com (YouTube's no-tracking domain)
 *   • Only loads the iframe AFTER the user clicks expand — zero
 *     YouTube traffic on page-load
 *   • rel=0 disables related-video tracking inside the embed
 *
 * Localised toggles fall back to Spanish for unknown locales.
 */
export function VideoPanel({ source, seek }: Props) {
  const { locale } = useLocale();
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // External seek trigger: when the transcript tab or chapters tab asks
  // the video to jump to a specific second, auto-expand the iframe (if
  // collapsed) and scroll the panel back into view so the user can
  // actually see what they just triggered. The effect depends on
  // `seek` as an object identity so consecutive clicks on the same
  // second still fire.
  useEffect(() => {
    if (!seek) return;
    setExpanded(true);
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [seek]);

  const labels = panelLabels(locale);
  const thumb = source.thumbnailUrl ?? `https://i.ytimg.com/vi/${source.videoId}/hqdefault.jpg`;

  return (
    <section ref={sectionRef} className="mt-6 overflow-hidden rounded-card border border-navy/10 bg-white">
      {/* Header row — always visible */}
      <div className="flex items-center justify-between gap-3 border-b border-navy/8 bg-creme/40 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-graphit/65">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
          {labels.eyebrow}
        </div>
        <div className="flex items-center gap-3 font-sans text-[11px]">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-graphit/65 underline-offset-4 transition hover:text-navy hover:underline"
          >
            {labels.openOnYoutube} ↗
          </a>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="rounded-card border border-navy/15 px-2 py-1 text-graphit/65 transition hover:border-gold hover:text-navy"
          >
            {expanded ? labels.collapse : labels.watchHere}
          </button>
        </div>
      </div>

      {/* Collapsed state — thumbnail with play overlay; click expands. */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={labels.watchHere}
          className="group relative block w-full overflow-hidden bg-navy text-left"
        >
          <img
            src={thumb}
            alt=""
            loading="lazy"
            className="aspect-video w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          {/* Soft top-down vignette for play-button legibility */}
          <span
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(10,26,58,0.05) 0%, rgba(10,26,58,0.35) 100%)' }}
            aria-hidden
          />
          {/* Play affordance — gold disc with navy triangle */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/95 shadow-lg transition-transform duration-200 group-hover:scale-105 sm:h-16 sm:w-16">
              <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden>
                <path d="M3 2l11 6-11 6V2z" fill="#0A1A3A" />
              </svg>
            </span>
          </span>
          {/* Caption — channel and watch-here hint */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-3 sm:px-5 sm:pb-4">
            <span className="font-sans text-[11px] uppercase tracking-widest text-creme/85">
              {source.channel ?? 'YouTube'}
            </span>
            <span className="font-serif text-xs italic text-creme/75 sm:text-sm">
              {labels.watchInline}
            </span>
          </span>
        </button>
      )}

      {/* Expanded state — privacy-friendly nocookie embed, 16:9 responsive.
          When a seek prop was provided, the iframe loads with YouTube's
          `start` parameter and auto-plays from there. The key bound to
          seek.nonce forces a remount on every new seek request so even
          consecutive clicks on the same second always advance the
          player. */}
      {expanded && (
        <div className="relative aspect-video w-full bg-navy">
          <iframe
            key={seek?.nonce ?? 'static'}
            title={labels.iframeTitle}
            src={iframeSrc(source.videoId, seek?.sec)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
            loading="lazy"
          />
        </div>
      )}
    </section>
  );
}

function iframeSrc(videoId: string, startSec: number | undefined): string {
  const base = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
  if (startSec === undefined || startSec <= 0) return base;
  const seconds = Math.max(0, Math.floor(startSec));
  return `${base}&start=${seconds}&autoplay=1`;
}

function panelLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'Vídeo original',
    openOnYoutube: 'Abrir en YouTube',
    watchHere: 'Ver aquí',
    watchInline: 'Pulsa para reproducir en línea',
    collapse: 'Ocultar',
    iframeTitle: 'Reproductor de YouTube',
  };
  if (locale.startsWith('pt')) return {
    eyebrow: 'Vídeo original',
    openOnYoutube: 'Abrir no YouTube',
    watchHere: 'Ver aqui',
    watchInline: 'Toque para reproduzir',
    collapse: 'Ocultar',
    iframeTitle: 'Reprodutor do YouTube',
  };
  if (locale.startsWith('de')) return {
    eyebrow: 'Originalvideo',
    openOnYoutube: 'Auf YouTube öffnen',
    watchHere: 'Hier ansehen',
    watchInline: 'Zum Abspielen klicken',
    collapse: 'Ausblenden',
    iframeTitle: 'YouTube-Player',
  };
  return {
    eyebrow: 'Original video',
    openOnYoutube: 'Open on YouTube',
    watchHere: 'Watch here',
    watchInline: 'Tap to play inline',
    collapse: 'Hide',
    iframeTitle: 'YouTube player',
  };
}
