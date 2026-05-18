import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';
import {
  getProgressStats,
  syncCardsFromLibrary,
  type CefrLevel,
  type LanguageProgress,
  type ProgressStats,
} from '../lib/srs';

/**
 * /progress — visible retention metric. Streak first (the daily-habit
 * anchor), then total mastered, then per-language CEFR breakdown.
 *
 * CEFR caveat is built into the copy: we only measure vocabulary
 * breadth, not speaking / writing / listening. The estimate is a
 * conservative anchor, not a certification.
 */
export function ProgressPage() {
  const { locale } = useLocale();
  const labels = useMemo(() => progressLabels(locale), [locale]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProgressStats | null>(null);

  usePageHead({
    title: labels.headTitle,
    description: labels.headDescription,
  });

  useEffect(() => {
    let cancel = false;
    (async () => {
      await syncCardsFromLibrary();
      const s = await getProgressStats();
      if (cancel) return;
      setStats(s);
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  if (loading || !stats) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:px-8">
          <p className="font-sans text-sm text-graphit/60">{labels.loading}</p>
        </div>
      </main>
    );
  }

  if (stats.totalCards === 0) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 text-center sm:px-8">
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.eyebrow}
          </p>
          <h1 className="mt-6 font-serif text-3xl text-navy sm:text-4xl">
            {labels.emptyTitle}
          </h1>
          <p className="mt-4 font-sans text-base text-graphit/70">{labels.emptyBody}</p>
          <Link
            to="/new"
            className="mt-8 inline-block rounded-card bg-navy px-5 py-2.5 font-sans text-sm text-creme transition hover:bg-graphit"
          >
            {labels.emptyCTA}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-creme paper">
      <div className="mx-auto max-w-4xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
          {labels.eyebrow}
        </p>
        <h1 className="mt-3 font-serif text-3xl text-navy sm:text-4xl">{labels.title}</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-graphit/65">
          {labels.subtitle}
        </p>

        {/* Hero stat strip — four KPIs on one row. */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label={labels.streakLabel} value={String(stats.streak.current)} hint={labels.streakHint(stats.streak.longest)} accent />
          <KpiCard label={labels.masteredLabel} value={String(stats.totalMastered)} hint={labels.masteredHint(stats.totalSeen)} />
          <KpiCard label={labels.weekLabel} value={String(stats.reviewedThisWeek)} hint={labels.weekHint} />
          <KpiCard label={labels.totalCardsLabel} value={String(stats.totalCards)} hint={labels.totalCardsHint} />
        </div>

        {/* Per-language breakdown — CEFR estimate + counts. */}
        <section className="mt-12">
          <h2 className="font-serif text-xl text-navy sm:text-2xl">{labels.langsTitle}</h2>
          <p className="mt-2 max-w-2xl font-sans text-xs leading-relaxed text-graphit/65">
            {labels.cefrCaveat}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {stats.byLanguage.map((row) => (
              <LanguageRow key={row.sourceLang} row={row} locale={locale} />
            ))}
          </div>
        </section>

        <div className="mt-12 flex gap-3">
          <Link
            to="/review"
            className="rounded-card bg-navy px-5 py-2.5 font-sans text-sm text-creme transition hover:bg-graphit"
          >
            {labels.reviewCTA}
          </Link>
          <Link
            to="/library"
            className="rounded-card border border-navy/15 bg-white px-5 py-2.5 font-sans text-sm text-navy transition hover:border-gold"
          >
            {labels.backToLibrary}
          </Link>
        </div>
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        'rounded-card border bg-white px-4 py-4 ' +
        (accent ? 'border-gold/50' : 'border-navy/15')
      }
    >
      <p className="font-sans text-[10px] uppercase tracking-widest text-graphit/65">
        {label}
      </p>
      <p
        className={
          'mt-2 font-serif text-3xl leading-none ' + (accent ? 'text-gold' : 'text-navy')
        }
      >
        {value}
      </p>
      <p className="mt-1 font-sans text-[11px] text-graphit/65">{hint}</p>
    </div>
  );
}

function LanguageRow({ row, locale }: { row: LanguageProgress; locale: string }) {
  const t = progressLabels(locale);
  const langName = t.langName(row.sourceLang);
  const cefrDescriptor = t.cefrDescriptor(row.cefr);

  // Progress bar = mastered / total, capped at 100%.
  const pct = row.total === 0 ? 0 : Math.min(100, Math.round((row.mastered / row.total) * 100));

  return (
    <div className="rounded-card border border-navy/15 bg-white px-4 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg text-navy">{langName}</h3>
        <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 font-sans text-xs font-medium text-navy">
          {row.cefr}
        </span>
      </div>
      <p className="mt-1 font-sans text-[11px] text-graphit/65">{cefrDescriptor}</p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy/10">
        <div className="h-full bg-gold" style={{ width: `${pct}%` }} aria-hidden />
      </div>

      <div className="mt-3 flex justify-between font-sans text-[11px] text-graphit/65">
        <span>{t.masteredOf(row.mastered, row.total)}</span>
        <span>{t.seen(row.seen)}</span>
      </div>
    </div>
  );
}

/* ─── i18n ────────────────────────────────────────────────────────── */

function progressLabels(locale: string) {
  if (locale.startsWith('es')) return {
    headTitle: 'Progreso — VozClara',
    headDescription: 'Tu progreso en cada idioma — vocabulario dominado, racha y estimación CEFR.',
    eyebrow: 'PROGRESO',
    title: 'Tu progreso, semana a semana.',
    subtitle: 'VozClara lleva un registro local de cada tarjeta que has visto y dominado. Aquí está el resumen — sin enviar nada a ningún servidor.',
    loading: 'Cargando…',
    emptyTitle: 'Aún no hay progreso.',
    emptyBody: 'Guarda tu primer Knowledge Pack con vocabulario para empezar a construir tu racha.',
    emptyCTA: 'Crear un Knowledge Pack',
    streakLabel: 'Racha',
    streakHint: (longest: number) => `Récord: ${longest} ${longest === 1 ? 'día' : 'días'}`,
    masteredLabel: 'Dominadas',
    masteredHint: (seen: number) => `${seen} vistas en total`,
    weekLabel: 'Esta semana',
    weekHint: 'tarjetas repasadas',
    totalCardsLabel: 'Tarjetas',
    totalCardsHint: 'en tu biblioteca',
    langsTitle: 'Idiomas',
    cefrCaveat: 'CEFR estimado solo a partir del vocabulario dominado. No reemplaza una prueba de nivel real — la comprensión auditiva, la expresión oral y la escritura no se miden aquí.',
    reviewCTA: 'Ir a repasar',
    backToLibrary: 'Volver a la biblioteca',
    masteredOf: (m: number, t: number) => `${m} de ${t} dominadas`,
    seen: (s: number) => `${s} vistas`,
    cefrDescriptor: (c: CefrLevel) => cefrDescriptorES[c],
    langName: (code: string) => esLangName(code),
  };
  if (locale.startsWith('pt')) return {
    headTitle: 'Progresso — VozClara',
    headDescription: 'O teu progresso em cada idioma — vocabulário dominado, sequência e estimativa CEFR.',
    eyebrow: 'PROGRESSO',
    title: 'O teu progresso, semana a semana.',
    subtitle: 'A VozClara guarda localmente um registo de cada cartão que viste e dominaste. Eis o resumo — sem enviar nada para servidor algum.',
    loading: 'A carregar…',
    emptyTitle: 'Ainda sem progresso.',
    emptyBody: 'Guarda o teu primeiro Knowledge Pack com vocabulário para começar a construir a tua sequência.',
    emptyCTA: 'Criar um Knowledge Pack',
    streakLabel: 'Sequência',
    streakHint: (longest: number) => `Recorde: ${longest} ${longest === 1 ? 'dia' : 'dias'}`,
    masteredLabel: 'Dominadas',
    masteredHint: (seen: number) => `${seen} vistas no total`,
    weekLabel: 'Esta semana',
    weekHint: 'cartões revistos',
    totalCardsLabel: 'Cartões',
    totalCardsHint: 'na tua biblioteca',
    langsTitle: 'Idiomas',
    cefrCaveat: 'CEFR estimado apenas a partir do vocabulário dominado. Não substitui um teste de nível real — a compreensão auditiva, a expressão oral e a escrita não são medidas aqui.',
    reviewCTA: 'Ir rever',
    backToLibrary: 'Voltar à biblioteca',
    masteredOf: (m: number, t: number) => `${m} de ${t} dominadas`,
    seen: (s: number) => `${s} vistas`,
    cefrDescriptor: (c: CefrLevel) => cefrDescriptorPT[c],
    langName: (code: string) => ptLangName(code),
  };
  if (locale.startsWith('de')) return {
    headTitle: 'Fortschritt — VozClara',
    headDescription: 'Dein Fortschritt pro Sprache — gemeisterter Wortschatz, Streak und CEFR-Schätzung.',
    eyebrow: 'FORTSCHRITT',
    title: 'Dein Fortschritt, Woche für Woche.',
    subtitle: 'VozClara führt lokal Buch über jede Karte, die du gesehen und gemeistert hast. Hier ist die Zusammenfassung — ohne dass irgendetwas an einen Server geht.',
    loading: 'Lädt…',
    emptyTitle: 'Noch kein Fortschritt.',
    emptyBody: 'Speichere deinen ersten Knowledge Pack mit Vokabular um deinen Streak aufzubauen.',
    emptyCTA: 'Knowledge Pack erstellen',
    streakLabel: 'Streak',
    streakHint: (longest: number) => `Rekord: ${longest} ${longest === 1 ? 'Tag' : 'Tage'}`,
    masteredLabel: 'Gemeistert',
    masteredHint: (seen: number) => `${seen} gesehen insgesamt`,
    weekLabel: 'Diese Woche',
    weekHint: 'Karten wiederholt',
    totalCardsLabel: 'Karten',
    totalCardsHint: 'in deiner Bibliothek',
    langsTitle: 'Sprachen',
    cefrCaveat: 'CEFR-Schätzung nur auf Basis des gemeisterten Wortschatzes. Ersetzt keinen echten Einstufungstest — Hörverstehen, Sprechen und Schreiben werden hier nicht erfasst.',
    reviewCTA: 'Zur Wiederholung',
    backToLibrary: 'Zur Bibliothek',
    masteredOf: (m: number, t: number) => `${m} von ${t} gemeistert`,
    seen: (s: number) => `${s} gesehen`,
    cefrDescriptor: (c: CefrLevel) => cefrDescriptorDE[c],
    langName: (code: string) => deLangName(code),
  };
  return {
    headTitle: 'Progress — VozClara',
    headDescription: 'Your progress per language — vocabulary mastered, streak, and CEFR estimate.',
    eyebrow: 'PROGRESS',
    title: 'Your progress, week by week.',
    subtitle: 'VozClara keeps a local record of every card you have seen and mastered. Here is the summary — nothing leaves your device.',
    loading: 'Loading…',
    emptyTitle: 'No progress yet.',
    emptyBody: 'Save your first Knowledge Pack with vocabulary to start building your streak.',
    emptyCTA: 'Create a Knowledge Pack',
    streakLabel: 'Streak',
    streakHint: (longest: number) => `Best: ${longest} ${longest === 1 ? 'day' : 'days'}`,
    masteredLabel: 'Mastered',
    masteredHint: (seen: number) => `${seen} seen in total`,
    weekLabel: 'This week',
    weekHint: 'cards reviewed',
    totalCardsLabel: 'Cards',
    totalCardsHint: 'in your library',
    langsTitle: 'Languages',
    cefrCaveat: 'CEFR estimate based on mastered vocabulary alone. Not a substitute for a real placement test — listening, speaking and writing are not measured here.',
    reviewCTA: 'Start reviewing',
    backToLibrary: 'Back to library',
    masteredOf: (m: number, t: number) => `${m} of ${t} mastered`,
    seen: (s: number) => `${s} seen`,
    cefrDescriptor: (c: CefrLevel) => cefrDescriptorEN[c],
    langName: (code: string) => enLangName(code),
  };
}

/* ─── CEFR descriptors per locale ─────────────────────────────────── */

const cefrDescriptorES: Record<CefrLevel, string> = {
  A0: 'Pre-principiante — primeros pasos',
  A1: 'Principiante — frases básicas',
  A2: 'Elemental — temas conocidos',
  B1: 'Intermedio — vida diaria',
  B2: 'Intermedio alto — temas complejos',
  C1: 'Avanzado — fluidez espontánea',
  C2: 'Maestría — uso casi nativo',
};
const cefrDescriptorPT: Record<CefrLevel, string> = {
  A0: 'Pré-principiante — primeiros passos',
  A1: 'Principiante — frases básicas',
  A2: 'Elementar — temas familiares',
  B1: 'Intermédio — quotidiano',
  B2: 'Intermédio alto — temas complexos',
  C1: 'Avançado — fluência espontânea',
  C2: 'Maestria — uso quase nativo',
};
const cefrDescriptorDE: Record<CefrLevel, string> = {
  A0: 'Vor-Anfänger — erste Schritte',
  A1: 'Anfänger — einfache Sätze',
  A2: 'Grundlegend — vertraute Themen',
  B1: 'Mittelstufe — Alltag',
  B2: 'Obere Mittelstufe — komplexe Themen',
  C1: 'Fortgeschritten — spontane Flüssigkeit',
  C2: 'Beherrschung — nahezu muttersprachlich',
};
const cefrDescriptorEN: Record<CefrLevel, string> = {
  A0: 'Pre-beginner — first steps',
  A1: 'Beginner — basic phrases',
  A2: 'Elementary — familiar topics',
  B1: 'Intermediate — daily life',
  B2: 'Upper-intermediate — complex topics',
  C1: 'Advanced — spontaneous fluency',
  C2: 'Mastery — near-native command',
};

/* ─── Language code → name per locale ─────────────────────────────── */

function esLangName(code: string): string {
  return ({ de: 'Alemán', es: 'Español', pt: 'Portugués', en: 'Inglés', fr: 'Francés' } as Record<string, string>)[code] ?? code.toUpperCase();
}
function ptLangName(code: string): string {
  return ({ de: 'Alemão', es: 'Espanhol', pt: 'Português', en: 'Inglês', fr: 'Francês' } as Record<string, string>)[code] ?? code.toUpperCase();
}
function deLangName(code: string): string {
  return ({ de: 'Deutsch', es: 'Spanisch', pt: 'Portugiesisch', en: 'Englisch', fr: 'Französisch' } as Record<string, string>)[code] ?? code.toUpperCase();
}
function enLangName(code: string): string {
  return ({ de: 'German', es: 'Spanish', pt: 'Portuguese', en: 'English', fr: 'French' } as Record<string, string>)[code] ?? code.toUpperCase();
}
