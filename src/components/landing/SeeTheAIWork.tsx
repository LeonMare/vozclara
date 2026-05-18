import { useLocale } from '../../lib/i18n';

/**
 * Show, don't tell — the AI proof section.
 *
 * Left column: three raw sentences of a German transcript, presented
 * as a typewriter-style block with mild stagger entrance.
 * Right column: the editorial key idea Cormorant Garamond extracted
 * from those sentences, in the user's locale.
 *
 * The arrow between them is the entire point. Side-by-side rendering
 * proves the value the rest of the landing only describes.
 */
export function SeeTheAIWork() {
  const { locale } = useLocale();

  // One real example per locale. Source is German for all (target lang
  // pair is the brand-foundation primary axis).
  const examples: Record<typeof locale, { from: string[]; to: { title: string; body: string } }> = {
    es: {
      from: [
        'Politisch steht Merz ein Jahr nach Amtsantritt unter Druck.',
        'Die Unzufriedenheit mit seiner Regierung ist hoch, vor allem im Osten Deutschlands.',
        'Innerhalb der Union mehren sich Stimmen die ein härteres Vorgehen gegen die Migration fordern.',
      ],
      to: {
        title: 'La política migratoria como línea de ruptura',
        body: 'Voces internas piden un giro más restrictivo, lo que abriría un frente con el SPD y con los socios europeos. La decisión definirá la identidad del gobierno en su segunda mitad de mandato.',
      },
    },
    pt: {
      from: [
        'Politisch steht Merz ein Jahr nach Amtsantritt unter Druck.',
        'Die Unzufriedenheit mit seiner Regierung ist hoch, vor allem im Osten Deutschlands.',
        'Innerhalb der Union mehren sich Stimmen die ein härteres Vorgehen gegen die Migration fordern.',
      ],
      to: {
        title: 'A política migratória como linha de ruptura',
        body: 'Vozes internas pedem uma virada mais restritiva, o que abriria uma frente com o SPD e com os parceiros europeus. A decisão definirá a identidade do governo na sua segunda metade de mandato.',
      },
    },
    de: {
      from: [
        'Politisch steht Merz ein Jahr nach Amtsantritt unter Druck.',
        'Die Unzufriedenheit mit seiner Regierung ist hoch, vor allem im Osten Deutschlands.',
        'Innerhalb der Union mehren sich Stimmen die ein härteres Vorgehen gegen die Migration fordern.',
      ],
      to: {
        title: 'Migrationspolitik als Bruchlinie',
        body: 'Stimmen innerhalb der Union fordern einen restriktiveren Kurs. Das würde eine Front gegen SPD und europäische Partner öffnen. Die Entscheidung wird die Identität der Regierung in ihrer zweiten Amtshälfte prägen.',
      },
    },
    en: {
      from: [
        'Politisch steht Merz ein Jahr nach Amtsantritt unter Druck.',
        'Die Unzufriedenheit mit seiner Regierung ist hoch, vor allem im Osten Deutschlands.',
        'Innerhalb der Union mehren sich Stimmen die ein härteres Vorgehen gegen die Migration fordern.',
      ],
      to: {
        title: 'Migration as the coalition’s fault line',
        body: 'Voices inside the Union are calling for a more restrictive turn — which would open a front with the SPD and with European partners. The decision will define the identity of the government in its second half-term.',
      },
    },
  };

  const ex = examples[locale];

  const heading: Record<typeof locale, string> = {
    es: 'De transcripción a idea editorial.',
    pt: 'De transcrição a ideia editorial.',
    de: 'Von Transkript zu redaktioneller Idee.',
    en: 'From transcript to editorial idea.',
  };

  const sub: Record<typeof locale, string> = {
    es: 'El mismo vídeo. Tres frases sueltas. Una idea con sustancia.',
    pt: 'O mesmo vídeo. Três frases soltas. Uma ideia com substância.',
    de: 'Dasselbe Video. Drei lose Sätze. Eine Idee mit Substanz.',
    en: 'Same video. Three loose sentences. One idea with substance.',
  };

  const leftLabel: Record<typeof locale, string> = {
    es: 'TRANSCRIPCIÓN', pt: 'TRANSCRIÇÃO', de: 'TRANSKRIPT', en: 'TRANSCRIPT',
  };
  const rightLabel: Record<typeof locale, string> = {
    es: 'IDEA CLAVE', pt: 'IDEIA-CHAVE', de: 'KERNIDEE', en: 'KEY IDEA',
  };

  return (
    <section className="bg-creme paper py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <header className="mb-12 sm:mb-16">
          <div className="mb-3 font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § 04½
          </div>
          <h2 className="font-serif text-3xl leading-tight text-navy sm:text-4xl">
            {heading[locale]}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-4 max-w-2xl font-serif italic text-graphit/70 sm:text-lg">
            {sub[locale]}
          </p>
        </header>

        <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          {/* Left — raw transcript */}
          <div className="rounded-card border border-navy/10 bg-white p-6 sm:p-8">
            <div className="mb-3 font-sans text-[10px] uppercase tracking-[0.4em] text-graphit/65">
              {leftLabel[locale]} · DE
            </div>
            <div className="space-y-3">
              {ex.from.map((line, i) => (
                <p
                  key={i}
                  className="scroll-fade font-sans text-[14px] leading-relaxed text-graphit/75 sm:text-[15px]"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="mr-2 font-mono text-[10px] text-graphit/35 tabular-nums">
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* Arrow — desktop horizontal, mobile vertical */}
          <div className="flex items-center justify-center py-2 lg:py-0">
            <ArrowOrnament />
          </div>

          {/* Right — editorial key idea */}
          <div className="rounded-card border-l-4 border-gold bg-white p-6 shadow-card sm:p-8">
            <div className="mb-3 font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
              {rightLabel[locale]} · {locale.toUpperCase()}
            </div>
            <h3 className="font-serif text-2xl leading-tight text-navy sm:text-3xl">
              {ex.to.title}
            </h3>
            <div className="my-4 h-px w-8 bg-gold/60" aria-hidden />
            <p className="font-sans text-[15px] leading-relaxed text-graphit/85 sm:text-base">
              {ex.to.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowOrnament() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      className="text-gold lg:rotate-0"
      aria-hidden
    >
      {/* Vertical arrow on mobile (rotated), horizontal on desktop */}
      <g className="hidden lg:inline">
        <line x1="6" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="32" y1="18" x2="40" y2="24" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="32" y1="30" x2="40" y2="24" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </g>
      <g className="lg:hidden">
        <line x1="24" y1="6" x2="24" y2="38" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="18" y1="32" x2="24" y2="40" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <line x1="30" y1="32" x2="24" y2="40" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </g>
    </svg>
  );
}
