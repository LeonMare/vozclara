import { useState } from 'react';
import { useLocale } from '../lib/i18n';
import type { VideoSource } from '../lib/pack';

interface Props {
  source: VideoSource;
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
export function VideoPanel({ source }: Props) {
  const { locale } = useLocale();
  const [expanded, setExpanded] = useState(false);

  const labels = panelLabels(locale);
  const thumb = source.thumbnailUrl ?? `https://i.ytimg.com/vi/${source.videoId}/hqdefault.jpg`;

  return (
    <section className="mt-6 overflow-hidden rounded-card border border-navy/10 bg-white">
      {/* Header row — always visible */}
      <div className="flex items-center justify-between gap-3 border-b border-navy/8 bg-creme/40 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2 font-sans text-[10px] uppercase tracking-widest text-graphit/55">
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

      {/* Expanded state — privacy-friendly nocookie embed, 16:9 responsive */}
      {expanded && (
        <div className="relative aspect-video w-full bg-navy">
          <iframe
            title={labels.iframeTitle}
            src={`https://www.youtube-nocookie.com/embed/${source.videoId}?rel=0&modestbranding=1&playsinline=1`}
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
