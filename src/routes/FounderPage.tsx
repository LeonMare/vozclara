import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { BrandMark } from '../components/BrandMark';
import { usePageHead } from '../hooks/usePageHead';
import {
  fetchFounderStatus,
  founderCheckoutAvailable,
  openFounderCheckout,
  FOUNDER_DISCORD_INVITE,
  type FounderStatus,
} from '../lib/founder';

/**
 * /founder — the launch-cashflow page.
 *
 * Pitch: €99 one-time, capped at 100 founding members, all Pro
 * features for life. The page sits between marketing-y (urgency
 * counter) and editorial (the rest of the site's voice). The
 * counter is the only loud element; everything else stays calm.
 *
 * Anonymous-first: a visitor can buy without signing up first.
 * Paddle's overlay collects email at checkout; Christian's manual
 * flow then attaches Pro to that email until the Paddle webhook
 * activation tooling lands post-launch.
 */
export function FounderPage() {
  const { locale } = useLocale();
  const labels = founderLabels(locale);
  const [status, setStatus] = useState<FounderStatus | null>(null);
  const checkoutAvailable = founderCheckoutAvailable();
  // Map the i18n locale to Paddle's narrow language enum. Paddle expects
  // a 2-letter code; ours can be `de-DE`-shaped down the line, so we
  // strip to the language sub-tag before forwarding.
  const paddleLocale = (locale.slice(0, 2) as 'en' | 'es' | 'pt' | 'de');

  const handleCheckout = (): void => {
    // Fire-and-forget — the helper resolves once the overlay is
    // visible, but the UI doesn't need to wait. Errors land in
    // console + Paddle's own error overlay if domain approval is
    // misconfigured. We deliberately do not surface a generic toast
    // because the failure modes are infrastructure-side, not
    // user-input-side.
    void openFounderCheckout({ locale: paddleLocale });
  };

  usePageHead({ title: labels.headTitle, description: labels.headDescription });

  useEffect(() => {
    let cancelled = false;
    void fetchFounderStatus().then((s) => {
      if (!cancelled) setStatus(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const claimed = status?.claimed ?? null;
  const max = status?.max ?? 100;
  const remaining = claimed === null ? null : Math.max(0, max - claimed);
  const soldOut = status ? !status.available : false;

  /* Paddle successUrl is wired to /founder?welcome=1 — when present
     we surface a prominent "welcome, founder" banner with the Discord
     invite, sitting above the regular page so the buyer's next step
     is unmissable. The query param survives a refresh too, so a buyer
     who closes the tab and reopens from history still sees it. */
  const [searchParams] = useSearchParams();
  const isWelcome = searchParams.get('welcome') === '1';

  return (
    <main id="main" className="bg-creme paper">
      <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-8 sm:pt-8">
        <Link
          to="/"
          className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline"
        >
          ← {labels.backHome}
        </Link>
      </div>

      {/* Welcome banner — only after a successful Stripe checkout. The
          founder lands here with ?welcome=1 set by the Stripe success
          URL. Big, gold, unmissable: their next step is the Discord. */}
      {isWelcome && (
        <section className="mx-auto mt-6 max-w-3xl px-5 sm:px-8">
          <div className="rounded-card border border-gold bg-gold/10 px-6 py-7 text-center sm:px-8 sm:py-8">
            <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
              § {labels.welcomeEyebrow}
            </div>
            <h2 className="mt-3 font-serif text-3xl leading-tight text-navy sm:text-4xl">
              {labels.welcomeHeading}
            </h2>
            <div className="mx-auto mt-5 h-px w-12 bg-gold" aria-hidden />
            <p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
              {labels.welcomeBody}
            </p>
            <a
              href={FOUNDER_DISCORD_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-block rounded-card bg-navy px-6 py-3 font-sans text-base font-medium text-creme transition hover:bg-navy/90"
            >
              {labels.welcomeDiscordCta} →
            </a>
            <p className="mt-4 font-sans text-[12px] italic leading-relaxed text-graphit/65">
              {labels.welcomeRoleNote}
            </p>
          </div>
        </section>
      )}

      {/* Hero — counter is the loudest element */}
      <section className="mx-auto max-w-3xl px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
        <div className="text-center">
          <BrandMark variant="monogram" size="lg" tone="gold" decorative />
          <div className="mt-6 font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § {labels.eyebrow}
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
            {labels.heroTitle}
          </h1>
          <div className="mx-auto mt-6 h-px w-16 bg-gold" aria-hidden />
          <p className="mx-auto mt-6 max-w-2xl font-serif text-xl leading-relaxed text-graphit/85 sm:text-2xl">
            {labels.heroLead}
          </p>
        </div>

        {/* Counter card — large numerals, gold accents */}
        <div className="mt-10 rounded-card border border-gold/40 bg-white p-6 text-center sm:p-8">
          <FounderCounter claimed={claimed} max={max} remaining={remaining} labels={labels} />

          {/* Price + CTA */}
          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-serif text-5xl text-navy">€99</span>
              <span className="font-sans text-sm text-graphit/65">{labels.priceQualifier}</span>
            </div>

            {soldOut ? (
              <div className="mt-2 rounded-card bg-graphit/10 px-5 py-3 font-sans text-sm text-graphit/70">
                {labels.soldOut}
              </div>
            ) : checkoutAvailable ? (
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-2 rounded-card bg-navy px-7 py-3.5 font-sans text-base font-medium text-creme transition hover:bg-navy/90"
              >
                {labels.cta} →
              </button>
            ) : (
              <div className="mt-2 rounded-card border border-navy/15 bg-creme px-5 py-3 font-sans text-sm italic text-graphit/65">
                {labels.comingSoon}
              </div>
            )}
            <p className="mt-1 font-sans text-[11px] text-graphit/65">{labels.checkoutNote}</p>
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="bg-white/70 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § {labels.includedSection}
          </div>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-navy sm:text-4xl">
            {labels.includedHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />

          <ul className="mt-8 space-y-5">
            {labels.includedItems.map((item, i) => (
              <li key={i} className="flex items-baseline gap-4">
                <span className="font-serif text-lg text-gold tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="font-serif text-lg text-navy sm:text-xl">{item.title}</div>
                  <p className="mt-1 font-sans text-sm leading-relaxed text-graphit/75 sm:text-base">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The honest case */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § {labels.caseSection}
          </div>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-navy sm:text-4xl">
            {labels.caseHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <div className="mt-6 space-y-5 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            {labels.caseBody.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Closing — second CTA + signature */}
      <section className="border-t border-navy/10 bg-creme py-14 text-center sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="mx-auto max-w-2xl font-serif text-lg italic leading-relaxed text-graphit/75 sm:text-xl">
            {labels.closingBody}
          </p>
          <p className="mt-5 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
            — Christian Leon · LEON MARÉ · Frankfurt
          </p>

          {!soldOut && checkoutAvailable && (
            <div className="mt-10">
              <button
                type="button"
                onClick={handleCheckout}
                className="rounded-card bg-navy px-6 py-3 font-sans text-base font-medium text-creme transition hover:bg-navy/90"
              >
                {labels.cta} → €99
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function FounderCounter({
  claimed,
  max,
  remaining,
  labels,
}: {
  claimed: number | null;
  max: number;
  remaining: number | null;
  labels: ReturnType<typeof founderLabels>;
}) {
  // Three rendering modes:
  //   - loading           dashes while we wait for /api/founder/status
  //   - unknown           KV not bound → don't fake a number
  //   - normal            real counter with progress strip
  const ratio = claimed === null ? 0 : Math.min(claimed / max, 1);
  const isLoading = claimed === null && remaining === null;

  return (
    <div>
      <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
        {labels.counterLabel}
      </div>
      <div className="mt-3 flex items-baseline justify-center gap-3">
        {isLoading ? (
          <span className="font-serif text-5xl text-navy tabular-nums opacity-30">— / {max}</span>
        ) : (
          <>
            <span className="font-serif text-5xl text-navy tabular-nums sm:text-6xl">
              {claimed}
            </span>
            <span className="font-serif text-2xl text-graphit/65 tabular-nums sm:text-3xl">
              / {max}
            </span>
          </>
        )}
      </div>
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-navy/8">
        <div
          className="h-full bg-gold transition-all duration-500"
          style={{ width: `${Math.round(ratio * 100)}%` }}
          aria-hidden
        />
      </div>
      {remaining !== null && remaining > 0 && (
        <p className="mt-3 font-serif italic text-graphit/70">
          {remaining === 1
            ? labels.remainingSingular
            : labels.remainingPlural(remaining)}
        </p>
      )}
    </div>
  );
}

/* ─── Localised copy ─────────────────────────────────────────────── */

function founderLabels(locale: string) {
  if (locale.startsWith('es')) return {
    headTitle: 'Founders · VozClara',
    headDescription: 'Cien fundadores. €99 una vez. VozClara Pro para siempre.',
    backHome: 'Volver',
    eyebrow: 'Founder Deal',
    heroTitle: 'Cien fundadores. Para siempre.',
    heroLead: 'VozClara está en lanzamiento. Las primeras cien personas que entren aseguran Pro de por vida por €99 — y ayudan a que esto exista sin VC.',
    counterLabel: 'Plazas reclamadas',
    remainingSingular: 'Última plaza disponible.',
    remainingPlural: (n: number) => `${n} plazas disponibles.`,
    priceQualifier: 'pago único · sin renovación',
    cta: 'Asegurar mi plaza',
    soldOut: 'Plazas agotadas. Gracias a los cien que lo hicieron posible.',
    comingSoon: 'Disponible en horas. Stripe está terminando la verificación de la cuenta.',
    checkoutNote: 'Pago seguro vía Paddle · sin tarjeta guardada · sin renovación automática · IVA incluido',
    welcomeEyebrow: 'Bienvenido, fundador',
    welcomeHeading: 'Listo. Eres parte de los cien.',
    welcomeBody: 'Tu siguiente paso es entrar al Discord — ahí pasa la conversación con los demás founders. Cuando entres, mándame un mensaje y te añado al canal #founders-only.',
    welcomeDiscordCta: 'Unirme al Discord',
    welcomeRoleNote: 'Tras entrar al Discord, te asigno la insignia "Founder" manualmente — suele ser en menos de 24 h.',

    includedSection: 'Qué incluye',
    includedHeading: 'Pro de por vida — más cosas que los demás no tienen.',
    includedItems: [
      { title: 'Todas las funciones Pro, para siempre', body: 'Packs ilimitados, vídeos hasta 3 h, KI Premium (Claude Sonnet 4.5 o GPT-5), cross-pack-síntesis, generador de artículos, Watch Mode, suscripciones a canales, exportación a Notion y Obsidian.' },
      { title: 'Insignia "Founding Member"', body: 'En tu perfil y junto a tus reseñas. Una marca discreta que distingue a quienes ayudaron a empezar.' },
      { title: 'Acceso directo en Discord', body: 'Un canal cerrado para los cien fundadores con acceso directo a mí. Sugerencias, beta-acceso, feedback que sí se escucha.' },
      { title: 'Voto en la roadmap', body: 'Cada mes presento las próximas tres prioridades. Los fundadores votan cuál sale primero.' },
      { title: 'Acceso anticipado a betas', body: 'Watch Mode, extensión Chrome, sync entre dispositivos — todo llega a Founders semanas antes.' },
    ],

    caseSection: 'Por qué este precio',
    caseHeading: 'Es un trato honesto, no un truco de urgencia.',
    caseBody: [
      'VozClara existe porque mi compañera no podía acceder al conocimiento alemán en su idioma. Lo construí en una semana, lo abro al público porque hay miles de personas con la misma frustración.',
      '€99 una vez es la mitad del precio anual de Pro a futuro. Necesito €5.000-10.000 de cashflow inicial para no depender de inversores externos durante los primeros meses — y a cambio, los primeros cien tienen un trato que nadie más tendrá.',
      'Si en tres meses VozClara desaparece, te devuelvo el dinero sin preguntas. Si en tres años VozClara es lo que esperamos que sea, tú tendrás Pro por una décima parte de lo que pagarían los demás. Sencillo.',
    ],

    closingBody: 'Si te resuena, asegura tu plaza. Si no, no pasa nada — VozClara Free seguirá funcionando para ti como hasta ahora. Solo que esto se hace una vez.',
  };

  if (locale.startsWith('pt')) return {
    headTitle: 'Founders · VozClara',
    headDescription: 'Cem fundadores. €99 uma vez. VozClara Pro para sempre.',
    backHome: 'Voltar',
    eyebrow: 'Founder Deal',
    heroTitle: 'Cem fundadores. Para sempre.',
    heroLead: 'A VozClara está em lançamento. As primeiras cem pessoas garantem o Pro vitalício por €99 — e ajudam a que isto exista sem VC.',
    counterLabel: 'Lugares reclamados',
    remainingSingular: 'Último lugar disponível.',
    remainingPlural: (n: number) => `${n} lugares disponíveis.`,
    priceQualifier: 'pagamento único · sem renovação',
    cta: 'Garantir o meu lugar',
    soldOut: 'Lugares esgotados. Obrigado aos cem que tornaram isto possível.',
    comingSoon: 'Disponível em horas. O Stripe está a terminar a verificação da conta.',
    checkoutNote: 'Pagamento seguro via Paddle · sem cartão guardado · sem renovação automática · IVA incluído',
    welcomeEyebrow: 'Bem-vindo, founder',
    welcomeHeading: 'Pronto. És um dos cem.',
    welcomeBody: 'O teu próximo passo é entrar no Discord — é lá que a conversa acontece. Quando entrares, manda-me uma mensagem e adiciono-te ao canal #founders-only.',
    welcomeDiscordCta: 'Entrar no Discord',
    welcomeRoleNote: 'Depois de entrares no Discord, atribuo-te o emblema "Founder" manualmente — costuma demorar menos de 24 h.',

    includedSection: 'O que inclui',
    includedHeading: 'Pro vitalício — e mais coisas que outros não têm.',
    includedItems: [
      { title: 'Todas as funções Pro, para sempre', body: 'Packs ilimitados, vídeos até 3 h, IA Premium (Claude Sonnet 4.5 ou GPT-5), síntese cross-pack, gerador de artigos, Watch Mode, subscrições a canais, exportação para Notion e Obsidian.' },
      { title: 'Distintivo "Founding Member"', body: 'No teu perfil e nas tuas avaliações. Uma marca discreta para quem ajudou a começar.' },
      { title: 'Acesso directo no Discord', body: 'Um canal fechado para os cem fundadores com acesso directo a mim. Sugestões, beta-acesso, feedback que é escutado.' },
      { title: 'Voto no roadmap', body: 'Cada mês apresento as próximas três prioridades. Os fundadores votam qual sai primeiro.' },
      { title: 'Acesso antecipado às betas', body: 'Watch Mode, extensão Chrome, sync entre dispositivos — tudo chega aos Founders semanas antes.' },
    ],

    caseSection: 'Porquê este preço',
    caseHeading: 'É uma proposta honesta, não um truque de urgência.',
    caseBody: [
      'A VozClara existe porque a minha companheira não conseguia aceder ao conhecimento alemão na língua dela. Construí-a numa semana e abro-a porque há milhares de pessoas com a mesma frustração.',
      '€99 uma vez é metade do preço anual do Pro futuro. Preciso de €5.000-10.000 de cashflow inicial para não depender de investidores externos durante os primeiros meses — em troca, os primeiros cem têm um acordo que mais ninguém terá.',
      'Se em três meses a VozClara desaparecer, devolvo o dinheiro sem perguntas. Se em três anos a VozClara for o que esperamos que seja, terás Pro por uma décima parte do que pagariam os outros. Simples.',
    ],

    closingBody: 'Se te ressoa, garante o teu lugar. Se não, sem problema — a VozClara Free continuará a funcionar como até agora. Mas isto faz-se uma só vez.',
  };

  if (locale.startsWith('de')) return {
    headTitle: 'Founders · VozClara',
    headDescription: 'Hundert Gründungsmitglieder. €99 einmalig. VozClara Pro für immer.',
    backHome: 'Zurück',
    eyebrow: 'Founder Deal',
    heroTitle: 'Hundert Gründungsmitglieder. Für immer.',
    heroLead: 'VozClara geht live. Die ersten hundert Personen sichern sich Pro lebenslang für €99 — und helfen, dass das hier ohne VC entstehen kann.',
    counterLabel: 'Plätze vergeben',
    remainingSingular: 'Letzter Platz verfügbar.',
    remainingPlural: (n: number) => `${n} Plätze verfügbar.`,
    priceQualifier: 'einmalig · keine Verlängerung',
    cta: 'Meinen Platz sichern',
    soldOut: 'Plätze ausverkauft. Danke an die Hundert, die das möglich gemacht haben.',
    comingSoon: 'Verfügbar in Stunden. Stripe schließt gerade die Account-Verifizierung ab.',
    checkoutNote: 'Sichere Zahlung über Paddle · keine gespeicherte Karte · keine Auto-Verlängerung · inkl. MwSt.',
    welcomeEyebrow: 'Willkommen, Founder',
    welcomeHeading: 'Erledigt. Du bist einer der Hundert.',
    welcomeBody: 'Dein nächster Schritt ist der Discord — dort findet die Conversation statt. Schreib mir kurz wenn du drin bist, dann füge ich dich dem #founders-only Kanal hinzu.',
    welcomeDiscordCta: 'Zum Discord',
    welcomeRoleNote: 'Sobald du im Discord bist, weise ich dir das „Founder"-Abzeichen manuell zu — meist in unter 24 h.',

    includedSection: 'Was enthalten ist',
    includedHeading: 'Pro auf Lebenszeit — plus Sachen die andere nicht bekommen.',
    includedItems: [
      { title: 'Alle Pro-Features, für immer', body: 'Unbegrenzte Packs, Videos bis 3 h, Premium-KI (Claude Sonnet 4.5 oder GPT-5), Cross-Pack-Synthese, Long-Form-Article-Generator, Watch Mode, Channel-Subscriptions, Export nach Notion und Obsidian.' },
      { title: 'Abzeichen "Founding Member"', body: 'Im Profil und neben deinen Bewertungen. Eine diskrete Marke für die, die mit am Anfang dabei waren.' },
      { title: 'Direkter Discord-Zugang', body: 'Ein geschlossener Kanal für die Hundert mit direktem Draht zu mir. Vorschläge, Beta-Zugang, Feedback das wirklich gelesen wird.' },
      { title: 'Stimmrecht in der Roadmap', body: 'Jeden Monat stelle ich die nächsten drei Prioritäten vor. Die Founders stimmen ab welche zuerst kommt.' },
      { title: 'Früher Beta-Zugang', body: 'Watch Mode, Chrome-Extension, Cross-Device-Sync — alles kommt zu Founders Wochen vor dem öffentlichen Release.' },
    ],

    caseSection: 'Warum dieser Preis',
    caseHeading: 'Ein ehrlicher Deal, kein Urgency-Trick.',
    caseBody: [
      'VozClara existiert weil meine Partnerin nicht auf deutsches Wissen in ihrer Sprache zugreifen konnte. Ich habe es in einer Woche gebaut und öffne es jetzt, weil tausende Menschen die gleiche Frustration haben.',
      '€99 einmalig sind die Hälfte des künftigen jährlichen Pro-Preises. Ich brauche €5.000-10.000 Anfangs-Cashflow um die ersten Monate unabhängig von externen Investoren bauen zu können — im Tausch bekommen die ersten Hundert einen Deal den danach niemand mehr bekommt.',
      'Wenn VozClara in drei Monaten verschwindet, kriegst du dein Geld zurück ohne Diskussion. Wenn VozClara in drei Jahren das wird was wir hoffen, hast du Pro für ein Zehntel von dem was andere zahlen werden. Einfach.',
    ],

    closingBody: 'Wenn es bei dir ankommt — sichere dir deinen Platz. Wenn nicht, kein Problem: VozClara Free läuft für dich weiter wie bisher. Aber das hier gibt es nur einmal.',
  };

  return {
    headTitle: 'Founders · VozClara',
    headDescription: 'A hundred founding members. €99 once. VozClara Pro forever.',
    backHome: 'Back',
    eyebrow: 'Founder Deal',
    heroTitle: 'A hundred founding members. Forever.',
    heroLead: 'VozClara is launching. The first hundred people to step in lock Pro for life at €99 — and help this exist without VC.',
    counterLabel: 'Seats claimed',
    remainingSingular: 'Last seat available.',
    remainingPlural: (n: number) => `${n} seats available.`,
    priceQualifier: 'one-time · no renewals',
    cta: 'Claim my seat',
    soldOut: 'All seats taken. Thanks to the hundred who made this possible.',
    comingSoon: 'Live in hours. Stripe is finishing account verification.',
    checkoutNote: 'Secure Paddle checkout · no stored card · no auto-renewal · tax-inclusive',
    welcomeEyebrow: 'Welcome, founder',
    welcomeHeading: "You're one of the hundred.",
    welcomeBody: "Your next step is Discord — that's where the conversation lives. Send me a quick message when you're in and I'll add you to the #founders-only channel.",
    welcomeDiscordCta: 'Join the Discord',
    welcomeRoleNote: "Once you're in Discord, I'll assign your Founder badge manually — usually within 24 h.",

    includedSection: "What's included",
    includedHeading: 'Pro for life — plus things others never get.',
    includedItems: [
      { title: 'All Pro features, forever', body: 'Unlimited Packs, videos up to 3 h, Premium AI (Claude Sonnet 4.5 or GPT-5), cross-pack synthesis, long-form article generator, Watch Mode, channel subscriptions, Notion / Obsidian export.' },
      { title: '"Founding Member" badge', body: 'On your profile and alongside your reviews. A quiet mark on the people who showed up at the start.' },
      { title: 'Direct Discord access', body: 'A closed channel for the hundred founders with a direct line to me. Suggestions, beta access, feedback that actually gets read.' },
      { title: 'Roadmap voting', body: "Every month I present the next three priorities. Founders vote on which one ships first." },
      { title: 'Early beta access', body: 'Watch Mode, Chrome extension, cross-device sync — Founders get them weeks before public release.' },
    ],

    caseSection: 'Why this price',
    caseHeading: "An honest deal, not an urgency trick.",
    caseBody: [
      "VozClara exists because my partner couldn't access German knowledge in her own language. I built the first version in a week, and I'm opening it now because thousands of people share that frustration.",
      "€99 once is half of next year's Pro annual price. I need €5,000-10,000 of starting cashflow to build the first months independent of outside investors — in return, the first hundred get a deal nobody else will.",
      "If VozClara is gone in three months, you get your money back, no questions. If VozClara becomes what we hope in three years, you'll have Pro at a tenth of what others pay. Simple.",
    ],

    closingBody: "If this resonates, claim your seat. If not, no pressure — VozClara Free keeps working for you the same way. This only happens once though.",
  };
}
