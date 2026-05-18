import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';

/**
 * /terms — Terms of use.
 *
 * The realistic legal posture for Voz Clara today:
 *   • Free product, no monetary contract.
 *   • Users are responsible for the YouTube URLs they paste — we won't
 *     police copyright but we ask them to respect it.
 *   • AI-generated outputs (summaries, vocab, quiz) can be wrong. The
 *     user must not treat them as medical, legal, financial or
 *     professional advice.
 *   • Service may be paused, the worker free tier may be exhausted —
 *     no SLA, no warranty.
 *   • LEON MARÉ (the umbrella brand) is the operator; jurisdiction is
 *     Germany / EU consumer law since the operator is in Frankfurt.
 *
 * Same editorial layout as PrivacyPage — § eyebrow, gold rule, serif
 * body, alternating white/creme bands.
 */
export function TermsPage() {
  const { locale } = useLocale();
  const labels = termsLabels(locale);

  usePageHead({
    title: labels.headTitle,
    description: labels.headDescription,
  });

  return (
    <main id="main" className="bg-creme paper">
      <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-8 sm:pt-8">
        <Link to="/" className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline">
          ← {labels.backHome}
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-14">
        <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
          § {labels.sectionLabel}
        </div>
        <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
          {labels.heroTitle}
        </h1>
        <div className="mt-6 h-px w-16 bg-gold" aria-hidden />
        <p className="mt-6 font-serif text-xl leading-relaxed text-graphit/85 sm:text-2xl">
          {labels.heroLead}
        </p>
        <p className="mt-5 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
          {labels.lastUpdatedLabel} {labels.lastUpdated}
        </p>
      </section>

      {/* Sections */}
      {labels.sections.map((s, i) => (
        <section key={i} className={i % 2 === 0 ? 'bg-white/70 py-12 sm:py-16' : 'py-12 sm:py-16'}>
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
              · {String(i + 1).padStart(2, '0')}
            </div>
            <h2 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
              {s.heading}
            </h2>
            <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
            <div className="mt-6 space-y-4 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
              {s.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Operator block (Impressum-style — required under German law) */}
      <section className="border-t border-navy/10 bg-creme py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § {labels.operatorLabel}
          </div>
          <h2 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.operatorHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-6 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            <span className="font-medium text-navy">LEON MARÉ</span><br />
            Christian Leon<br />
            Frankfurt am Main, Germany
          </p>
          <p className="mt-5 font-sans text-sm italic text-graphit/65">
            {labels.operatorNote}
          </p>
        </div>
      </section>
    </main>
  );
}

function termsLabels(locale: string) {
  const lastUpdated = locale.startsWith('es')
    ? 'mayo 2026'
    : locale.startsWith('pt')
      ? 'maio 2026'
      : locale.startsWith('de')
        ? 'Mai 2026'
        : 'May 2026';

  if (locale.startsWith('es')) return {
    headTitle: 'Términos de uso — Voz Clara',
    headDescription:
      'Reglas básicas para usar Voz Clara — un proyecto pequeño, gratuito, sin garantías.',
    backHome: 'Volver a la página principal',
    sectionLabel: 'Términos',
    heroTitle: 'Reglas básicas. Sin letra pequeña.',
    heroLead:
      'Voz Clara es gratuito y se ofrece tal cual. Estas son las condiciones honestas de uso, no un contrato corporativo de 40 páginas.',
    lastUpdatedLabel: 'Actualizado',
    lastUpdated,
    sections: [
      {
        heading: 'Servicio gratuito, sin garantías',
        body: [
          'Voz Clara se ofrece sin coste y sin SLA. Operamos sobre la capa gratuita de Cloudflare Workers; si los límites mensuales se agotan o un servicio cae, no hay compensación. Te avisaríamos en la página principal si pasa.',
          'No prometemos disponibilidad, exactitud absoluta de las transcripciones, ni continuidad indefinida del proyecto.',
        ],
      },
      {
        heading: 'Lo que generas con la IA',
        body: [
          'Los resúmenes, vocabulario, preguntas de quiz y demás contenido son producidos por modelos de lenguaje grandes (Llama 3.3 70B). Pueden alucinar, omitir matices, malinterpretar el contexto o equivocarse de fechas, cifras y atribuciones.',
          'No uses estos resultados como asesoramiento médico, legal, financiero ni profesional. Trátalos como un buen primer borrador, no como una fuente verificada. La verificación final es responsabilidad tuya.',
        ],
      },
      {
        heading: 'Tu uso de YouTube y copyright',
        body: [
          'Solo accedemos a transcripciones que YouTube ya publica como subtítulos accesibles. No descargamos vídeos, no almacenamos el audio ni circunvalamos restricciones.',
          'Eres tú quien decide qué URL pegar. Si generas un Pack desde contenido protegido y lo compartes públicamente, eres responsable del cumplimiento del copyright en tu jurisdicción.',
        ],
      },
      {
        heading: 'Uso aceptable',
        body: [
          'No uses Voz Clara para procesar contenido ilegal en tu jurisdicción (discurso de odio, material de abuso, etc.). No intentes inyectar prompts adversarios para extraer comportamientos no deseados del modelo. No automatices llamadas masivas a la API más allá del uso humano razonable; si necesitas volumen, contáctanos.',
          'Nos reservamos el derecho de bloquear IPs que abusen del servicio.',
        ],
      },
      {
        heading: 'Cambios en estos términos',
        body: [
          'Cuando cambien estos términos, actualizamos la fecha al inicio de la página. No enviamos avisos por email porque no tenemos tu email. Si los cambios son materiales, los anunciaríamos en la página principal durante al menos dos semanas.',
        ],
      },
      {
        heading: 'Jurisdicción',
        body: [
          'Voz Clara está operado desde Frankfurt am Main, Alemania. Para consumidores en la UE se aplica la legislación de consumo correspondiente. Para todo lo demás aplica la ley alemana.',
        ],
      },
    ],
    operatorLabel: 'Operador',
    operatorHeading: 'Quién está detrás.',
    operatorNote:
      'Voz Clara es un proyecto digital independiente bajo la marca LEON MARÉ. No tenemos sociedad mercantil registrada para este producto; opera como actividad profesional individual.',
  };

  if (locale.startsWith('pt')) return {
    headTitle: 'Termos de uso — Voz Clara',
    headDescription:
      'Regras básicas para usar a Voz Clara — um projeto pequeno, gratuito, sem garantias.',
    backHome: 'Voltar à página principal',
    sectionLabel: 'Termos',
    heroTitle: 'Regras básicas. Sem letra pequena.',
    heroLead:
      'A Voz Clara é gratuita e oferecida tal-qual. Estas são as condições honestas de uso, não um contrato corporativo de 40 páginas.',
    lastUpdatedLabel: 'Atualizado',
    lastUpdated,
    sections: [
      {
        heading: 'Serviço gratuito, sem garantias',
        body: [
          'A Voz Clara é oferecida sem custo e sem SLA. Operamos sobre o plano gratuito da Cloudflare Workers; se os limites mensais se esgotarem ou um serviço cair, não há compensação. Avisaríamos na página principal se acontecesse.',
          'Não prometemos disponibilidade, exatidão absoluta das transcrições, nem continuidade indefinida do projeto.',
        ],
      },
      {
        heading: 'O que geras com a IA',
        body: [
          'Os resumos, vocabulário, perguntas de quiz e demais conteúdo são produzidos por modelos de linguagem grandes (Llama 3.3 70B). Podem alucinar, omitir nuances, interpretar mal o contexto ou enganar-se em datas, números e atribuições.',
          'Não uses estes resultados como aconselhamento médico, jurídico, financeiro ou profissional. Trata-os como um bom primeiro rascunho, não como uma fonte verificada. A verificação final é responsabilidade tua.',
        ],
      },
      {
        heading: 'O teu uso do YouTube e direitos de autor',
        body: [
          'Só acedemos a transcrições que o YouTube já publica como legendas acessíveis. Não descarregamos vídeos, não armazenamos o áudio nem contornamos restrições.',
          'És tu que decides que URL colar. Se gerares um Pack a partir de conteúdo protegido e o partilhares publicamente, és responsável pelo cumprimento de direitos de autor na tua jurisdição.',
        ],
      },
      {
        heading: 'Uso aceitável',
        body: [
          'Não uses a Voz Clara para processar conteúdo ilegal na tua jurisdição (discurso de ódio, material de abuso, etc.). Não tentes injetar prompts adversários para extrair comportamentos indesejados do modelo. Não automatizes chamadas em massa à API além do uso humano razoável; se precisas de volume, contacta-nos.',
          'Reservamos o direito de bloquear IPs que abusem do serviço.',
        ],
      },
      {
        heading: 'Alterações destes termos',
        body: [
          'Quando estes termos mudarem, atualizamos a data no início da página. Não enviamos avisos por email porque não temos o teu email. Se as alterações forem substanciais, anunciá-las-íamos na página principal durante pelo menos duas semanas.',
        ],
      },
      {
        heading: 'Jurisdição',
        body: [
          'A Voz Clara é operada a partir de Frankfurt am Main, Alemanha. Para consumidores na UE aplica-se a legislação de consumo correspondente. Para tudo o resto aplica-se a lei alemã.',
        ],
      },
    ],
    operatorLabel: 'Operador',
    operatorHeading: 'Quem está por trás.',
    operatorNote:
      'A Voz Clara é um projeto digital independente sob a marca LEON MARÉ. Não temos sociedade comercial registada para este produto; opera como atividade profissional individual.',
  };

  if (locale.startsWith('de')) return {
    headTitle: 'Nutzungsbedingungen — Voz Clara',
    headDescription:
      'Grundregeln für die Nutzung von Voz Clara — ein kleines, kostenloses Projekt, ohne Garantien.',
    backHome: 'Zurück zur Startseite',
    sectionLabel: 'Bedingungen',
    heroTitle: 'Grundregeln. Kein Kleingedrucktes.',
    heroLead:
      'Voz Clara ist kostenlos und wird so wie es ist angeboten. Hier sind die ehrlichen Nutzungsbedingungen, kein 40-seitiger Konzernvertrag.',
    lastUpdatedLabel: 'Aktualisiert',
    lastUpdated,
    sections: [
      {
        heading: 'Kostenloser Dienst, keine Garantien',
        body: [
          'Voz Clara wird kostenlos und ohne SLA bereitgestellt. Wir betreiben den Dienst auf der kostenlosen Stufe von Cloudflare Workers; wenn die Monatslimits erschöpft sind oder ein Service ausfällt, gibt es keine Entschädigung. Wir würden es auf der Startseite ankündigen.',
          'Wir versprechen weder Verfügbarkeit, noch absolute Genauigkeit der Transkripte, noch unbegrenzte Fortführung des Projekts.',
        ],
      },
      {
        heading: 'Was du mit der KI erzeugst',
        body: [
          'Zusammenfassungen, Vokabeln, Quiz-Fragen und alle anderen Inhalte werden von Large Language Models (Llama 3.3 70B) erzeugt. Sie können halluzinieren, Nuancen weglassen, Kontext falsch deuten oder sich bei Daten, Zahlen und Zuschreibungen irren.',
          'Nutze diese Ergebnisse nicht als medizinische, juristische, finanzielle oder berufliche Beratung. Betrachte sie als guten ersten Entwurf, nicht als geprüfte Quelle. Die abschließende Überprüfung liegt bei dir.',
        ],
      },
      {
        heading: 'Deine YouTube-Nutzung und Urheberrecht',
        body: [
          'Wir greifen ausschließlich auf Transkripte zu, die YouTube bereits als zugängliche Untertitel veröffentlicht. Wir laden keine Videos herunter, speichern keinen Audio-Stream und umgehen keine Beschränkungen.',
          'Du entscheidest, welche URL du einfügst. Wenn du aus geschütztem Material einen Pack erzeugst und ihn öffentlich teilst, bist du für die urheberrechtliche Konformität in deiner Rechtsordnung verantwortlich.',
        ],
      },
      {
        heading: 'Akzeptable Nutzung',
        body: [
          'Verwende Voz Clara nicht zur Verarbeitung von in deiner Rechtsordnung illegalen Inhalten (Hassrede, Missbrauchsmaterial usw.). Versuche nicht, adversariale Prompts zu injizieren, um unerwünschtes Modellverhalten zu provozieren. Automatisiere keine Massen-Aufrufe der API über vernünftigen menschlichen Gebrauch hinaus; bei Volumen-Bedarf melde dich.',
          'Wir behalten uns vor, IP-Adressen zu blockieren, die den Dienst missbrauchen.',
        ],
      },
      {
        heading: 'Änderungen dieser Bedingungen',
        body: [
          'Bei Änderungen aktualisieren wir das Datum am Seitenanfang. Wir verschicken keine E-Mail-Benachrichtigung, weil wir deine E-Mail-Adresse nicht haben. Bei wesentlichen Änderungen würden wir das mindestens zwei Wochen auf der Startseite ankündigen.',
        ],
      },
      {
        heading: 'Gerichtsstand',
        body: [
          'Voz Clara wird aus Frankfurt am Main, Deutschland, betrieben. Für Verbraucher in der EU gilt das jeweilige Verbraucherrecht. Im Übrigen gilt deutsches Recht.',
        ],
      },
    ],
    operatorLabel: 'Betreiber',
    operatorHeading: 'Wer dahintersteht.',
    operatorNote:
      'Voz Clara ist ein unabhängiges digitales Projekt unter der Marke LEON MARÉ. Es gibt für dieses Produkt keine eigene Handelsgesellschaft; es wird als selbstständige Tätigkeit betrieben.',
  };

  return {
    headTitle: 'Terms of use — Voz Clara',
    headDescription:
      'Basic rules for using Voz Clara — a small, free project, no warranties.',
    backHome: 'Back to home',
    sectionLabel: 'Terms',
    heroTitle: 'Basic rules. No fine print.',
    heroLead:
      "Voz Clara is free and offered as-is. These are honest terms of use, not a 40-page corporate contract.",
    lastUpdatedLabel: 'Updated',
    lastUpdated,
    sections: [
      {
        heading: 'Free service, no warranties',
        body: [
          'Voz Clara is offered at no cost and without an SLA. We run on the free tier of Cloudflare Workers; if monthly limits are exhausted or a service goes down, there is no compensation. We would notice on the homepage if that happens.',
          'We do not promise uptime, transcript accuracy, or indefinite project continuity.',
        ],
      },
      {
        heading: 'What the AI produces',
        body: [
          'Summaries, vocabulary, quiz questions, and other generated content are produced by large language models (Llama 3.3 70B). They can hallucinate, miss nuance, misread context, or get dates, numbers, and attributions wrong.',
          'Do not treat these outputs as medical, legal, financial, or professional advice. Treat them as a good first draft, not a verified source. Final verification is on you.',
        ],
      },
      {
        heading: 'Your use of YouTube and copyright',
        body: [
          'We only access transcripts that YouTube already publishes as accessible captions. We do not download videos, store audio, or circumvent restrictions.',
          'You choose which URL to paste. If you generate a Pack from protected content and share it publicly, you are responsible for copyright compliance in your jurisdiction.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'Do not use Voz Clara to process content that is illegal in your jurisdiction (hate speech, abuse material, etc.). Do not inject adversarial prompts to extract unintended model behaviour. Do not automate mass API calls beyond reasonable human use; if you need volume, contact us.',
          'We reserve the right to block IPs that abuse the service.',
        ],
      },
      {
        heading: 'Changes to these terms',
        body: [
          'When these terms change, we update the date at the top of the page. We do not send email notifications because we do not have your email. For material changes, we would announce them on the homepage for at least two weeks.',
        ],
      },
      {
        heading: 'Jurisdiction',
        body: [
          'Voz Clara is operated from Frankfurt am Main, Germany. EU consumer law applies for consumers in the EU. Otherwise, German law applies.',
        ],
      },
    ],
    operatorLabel: 'Operator',
    operatorHeading: 'Who is behind this.',
    operatorNote:
      'Voz Clara is an independent digital project under the LEON MARÉ brand. There is no separate corporate entity for this product; it is operated as an independent professional activity.',
  };
}
