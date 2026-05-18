/**
 * Public changelog data — read by ChangelogPage and rendered as the
 * editorial /changelog route.
 *
 * Source-of-truth lives in this file, not in a Markdown asset, so:
 *   • tsc catches broken entries at build time
 *   • there's no markdown-renderer dependency in the bundle
 *   • multilocale copy stays type-checked
 *
 * Update flow when something user-facing ships:
 *   1. Prepend a new entry to ENTRIES (newest first).
 *   2. Add the localised lines under each locale's `items` array.
 *   3. Commit + push — Cloudflare Pages rebuilds and the page
 *      renders the new row at the top within ~60 s.
 *
 * Editorial rules for entries:
 *   • User-facing language, not implementation. ("Cross-device sign-in"
 *     not "magic-link KV with brainId attach").
 *   • Three-to-eight items per release. More = noise, less = thin.
 *   • Skip purely internal changes (CI fixes, defensive refactors).
 *   • A release with no user-visible items doesn't need an entry.
 */

export type Locale = 'es' | 'pt' | 'de' | 'en';

export interface ChangelogEntry {
  /** ISO date (YYYY-MM-DD) of the release. Used for sorting + display. */
  date: string;
  /** Optional version label — usually a short Release name, not a semver. */
  versionLabel?: string;
  /** Localised heading + bullets per locale. */
  i18n: Record<Locale, { heading: string; items: string[] }>;
  /** Mark the launch entry so we can style the row a touch louder. */
  kind?: 'launch' | 'feature' | 'fix';
}

/**
 * Newest entries first. The launch row is intentionally short — bigger
 * blocks tend to suggest a 0.1 → 1.0 jump and we'd rather underclaim
 * than ship a doc that promises features the user can't find.
 */
export const ENTRIES: ChangelogEntry[] = [
  {
    date: '2026-05-26',
    versionLabel: 'Launch',
    kind: 'launch',
    i18n: {
      es: {
        heading: 'VozClara está en vivo.',
        items: [
          'Cuatro modos: Aprender (idiomas), Briefing (decisores), Estudio (estudiantes), Creator (creadores)',
          'Valoraciones de la comunidad en cada vídeo — calidad antes que viralidad',
          'Inicio de sesión por enlace mágico — anónimo-primero, sincronización entre dispositivos con Pro',
          'Copia de citas con un clic — texto + hablante + timestamp listos para Notion / Twitter',
          'Founder Deal: los primeros 100 aseguran Pro de por vida por €99',
          'Exportación a Anki, shadowing con puntuación, tutor IA por pack',
        ],
      },
      pt: {
        heading: 'A VozClara está no ar.',
        items: [
          'Quatro modos: Aprender (idiomas), Briefing (decisores), Estudo (estudantes), Creator (criadores)',
          'Avaliações da comunidade em cada vídeo — qualidade antes de viralidade',
          'Início de sessão por link mágico — anónimo-primeiro, sincronização entre dispositivos no Pro',
          'Cópia de citações num clique — texto + falante + timestamp prontos para Notion / Twitter',
          'Founder Deal: os primeiros 100 garantem Pro vitalício por €99',
          'Exportação para Anki, shadowing com pontuação, tutor IA por pack',
        ],
      },
      de: {
        heading: 'VozClara ist live.',
        items: [
          'Vier Modi: Learn (Sprachen), Briefing (Entscheider), Studieren (Studenten), Creator (Content)',
          'Community-Bewertungen für jedes Video — Qualität vor Viralität',
          'Magic-Link-Anmeldung — anonym-first, Cross-Device-Sync ab Pro',
          'Zitat-Copy in einem Klick — Text + Sprecher + Timestamp, fertig für Notion / Twitter',
          'Founder Deal: die ersten 100 sichern Pro auf Lebenszeit für €99',
          'Anki-Export, Shadowing mit Aussprache-Bewertung, KI-Tutor pro Pack',
        ],
      },
      en: {
        heading: 'VozClara is live.',
        items: [
          'Four modes: Learn (language), Briefing (decision-maker), Study (student), Creator (repurpose)',
          'Community ratings on every video — quality before virality',
          'Magic-link sign-in — anonymous-first, cross-device sync with Pro',
          'One-click citation copy — text + speaker + timestamp, ready for Notion / Twitter',
          'Founder Deal: the first 100 lock Pro for life at €99',
          'Anki export, voice shadowing with pronunciation scoring, AI tutor per pack',
        ],
      },
    },
  },
  {
    date: '2026-05-15',
    versionLabel: 'Pre-launch polish',
    i18n: {
      es: {
        heading: 'Pulido antes del lanzamiento.',
        items: [
          'Accesibilidad WCAG 2.1 AA — contraste, etiquetas, áreas tap',
          'Dashboard /me con avatar, streak, actividad reciente',
          'Eliminación de cuenta DSGVO-compatible (Art. 17 — borrado completo en servidor)',
          'Two sample packs nuevos: Veritasium (entropía) en modo Estudio + Lex Fridman × LeCun en modo Briefing',
          'Página /discover con clasificación por puntuación Wilson',
        ],
      },
      pt: {
        heading: 'Polimento antes do lançamento.',
        items: [
          'Acessibilidade WCAG 2.1 AA — contraste, labels, áreas tap',
          'Dashboard /me com avatar, streak, atividade recente',
          'Eliminação de conta conforme RGPD (Art. 17 — apagamento total no servidor)',
          'Dois novos sample packs: Veritasium (entropia) em modo Estudo + Lex Fridman × LeCun em modo Briefing',
          'Página /discover com classificação por pontuação Wilson',
        ],
      },
      de: {
        heading: 'Vor-Launch-Politur.',
        items: [
          'WCAG 2.1 AA Barrierefreiheit — Kontraste, Labels, Tap-Bereiche',
          'Dashboard /me mit Avatar, Streak, jüngste Aktivität',
          'DSGVO-konformes Konto-Löschen (Art. 17 — vollständige Server-Erasure)',
          'Zwei neue Sample-Packs: Veritasium (Entropie) im Studieren-Modus + Lex Fridman × LeCun im Briefing-Modus',
          '/discover Seite mit Wilson-Score-Ranking',
        ],
      },
      en: {
        heading: 'Pre-launch polish.',
        items: [
          'WCAG 2.1 AA accessibility pass — contrast, labels, tap targets',
          '/me dashboard with avatar, streak, recent activity',
          'DSGVO-compliant account deletion (Art. 17 — full server-side erasure)',
          'Two new sample packs: Veritasium (entropy) in Study mode + Lex Fridman × LeCun in Briefing mode',
          '/discover page ranked by Wilson lower-bound score',
        ],
      },
    },
  },
  {
    date: '2026-04-20',
    versionLabel: 'Build-in-public foundations',
    i18n: {
      es: {
        heading: 'Cimientos en público.',
        items: [
          'Cuatro idiomas: español, portugués, alemán, inglés — interfaz completa + voz editorial coherente',
          'PWA instalable con splash screens de iOS, soporte offline-shell',
          'Sentry para errores con hosting en la UE (Frankfurt) — sin PII',
          'Cloudflare Web Analytics — privacidad-amigable, sin cookies',
          'Repetición espaciada (SRS) con racha diaria y revisión por nivel',
        ],
      },
      pt: {
        heading: 'Fundações em público.',
        items: [
          'Quatro idiomas: espanhol, português, alemão, inglês — interface completa + voz editorial coerente',
          'PWA instalável com splash screens iOS, suporte offline-shell',
          'Sentry para erros com alojamento na UE (Frankfurt) — sem PII',
          'Cloudflare Web Analytics — amigável à privacidade, sem cookies',
          'Repetição espaçada (SRS) com sequência diária e revisão por nível',
        ],
      },
      de: {
        heading: 'Fundament in public.',
        items: [
          'Vier Sprachen: Spanisch, Portugiesisch, Deutsch, Englisch — komplette UI + konsistente editoriale Stimme',
          'Installierbare PWA mit iOS-Splash-Screens, Offline-Shell-Support',
          'Sentry-Fehler-Tracking in EU-Region (Frankfurt) — keine PII',
          'Cloudflare Web Analytics — privacy-friendly, ohne Cookies',
          'Spaced Repetition (SRS) mit Tages-Streak und Niveau-basierter Wiederholung',
        ],
      },
      en: {
        heading: 'Building in public.',
        items: [
          'Four languages: Spanish, Portuguese, German, English — full UI + consistent editorial voice',
          'Installable PWA with iOS splash screens, offline-shell support',
          'Sentry error tracking in the EU region (Frankfurt) — no PII',
          'Cloudflare Web Analytics — privacy-friendly, no cookies',
          'Spaced repetition (SRS) with daily streak and level-aware review',
        ],
      },
    },
  },
];

/**
 * Coming-soon list. Lives separately from ENTRIES so it doesn't get
 * confused with shipped features. Conservative on purpose — we'd
 * rather under-promise and over-deliver than the reverse. Don't list
 * anything that isn't already in the worker as an unfinished branch
 * or a clearly-named lib file.
 */
export const COMING_SOON: Record<Locale, string[]> = {
  es: [
    'Watch Mode — transcripción sincronizada con el reproductor',
    'Extensión de Chrome para guardar paquetes desde YouTube',
    'Síntesis entre paquetes — preguntá a tu biblioteca completa',
    'Exportación a Notion y Obsidian',
    'Subidas de MP3 / MP4 (pipeline Whisper)',
  ],
  pt: [
    'Watch Mode — transcrição sincronizada com o leitor',
    'Extensão do Chrome para guardar packs a partir do YouTube',
    'Síntese entre packs — pergunta à tua biblioteca inteira',
    'Exportação para Notion e Obsidian',
    'Uploads de MP3 / MP4 (pipeline Whisper)',
  ],
  de: [
    'Watch Mode — synchronisiertes Transkript mit dem Player',
    'Chrome-Extension zum Speichern von Packs aus YouTube',
    'Cross-Pack-Synthese — frag deine gesamte Bibliothek',
    'Export nach Notion und Obsidian',
    'MP3 / MP4 Uploads (Whisper-Pipeline)',
  ],
  en: [
    'Watch Mode — synced transcript alongside the player',
    'Chrome extension to save packs straight from YouTube',
    'Cross-pack synthesis — ask your whole library',
    'Notion and Obsidian export',
    'MP3 / MP4 uploads (Whisper pipeline)',
  ],
};

/**
 * Format an ISO date for display. Discreet — month + year, locale-
 * aware. Falls back to the raw string if Intl can't parse the locale.
 */
export function formatEntryDate(date: string, locale: string): string {
  try {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return date;
  }
}

export function localeKey(locale: string): Locale {
  if (locale.startsWith('es')) return 'es';
  if (locale.startsWith('pt')) return 'pt';
  if (locale.startsWith('de')) return 'de';
  return 'en';
}
