import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { BrandMark } from '../components/BrandMark';
import { usePageHead } from '../hooks/usePageHead';

/**
 * /about — the editorial-tone story of VozClara.
 *
 * Three sections:
 *   1. The origin story (why VozClara exists, who it's for)
 *   2. The "we" — VozClara under LEON MARÉ
 *   3. Where it's going (an honest roadmap, no aspirational fantasies)
 *
 * Reuses the existing landing typography rhythm — § eyebrows, gold
 * rules, serif headings, sans body. No glassmorphism, no testimonials,
 * no fake-team photos. The page reads like a Sunday-magazine column
 * profile rather than a startup About.
 */
export function AboutPage() {
  const { locale } = useLocale();
  const labels = aboutLabels(locale);

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
          § {labels.aboutSection}
        </div>
        <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
          {labels.heroTitle}
        </h1>
        <div className="mt-6 h-px w-16 bg-gold" aria-hidden />
        <p className="mt-6 font-serif text-xl leading-relaxed text-graphit/85 sm:text-2xl">
          {labels.heroLead}
        </p>
      </section>

      {/* Origin */}
      <section className="bg-white/70 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">§ {labels.originSection}</div>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-navy sm:text-4xl">
            {labels.originHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <div className="mt-6 space-y-5 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            {labels.originBody.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* LEON MARÉ context */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">§ {labels.parentSection}</div>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-navy sm:text-4xl">
            {labels.parentHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <div className="mt-6 space-y-5 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            {labels.parentBody.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="bg-white/70 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">§ {labels.roadmapSection}</div>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-navy sm:text-4xl">
            {labels.roadmapHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-5 font-serif italic text-graphit/70 sm:text-lg">
            {labels.roadmapLead}
          </p>

          <ul className="mt-8 space-y-6">
            {labels.roadmapItems.map((item, i) => (
              <li key={i} className="flex items-baseline gap-4">
                <span className="font-serif text-base text-gold tabular-nums sm:text-lg">
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

      {/* Closing — brand seal + signature */}
      <section className="border-t border-navy/10 bg-creme paper py-14 text-center sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <BrandMark variant="monogram" size="xl" tone="gold" decorative />
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-graphit/75 sm:text-xl">
            {labels.signatureBody}
          </p>
          <p className="mt-5 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
            — Christian Leon · LEON MARÉ · Frankfurt
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/new"
              className="rounded-card bg-navy px-6 py-3 font-sans text-base font-medium text-creme transition hover:bg-navy/90"
            >
              {labels.ctaPrimary}
            </Link>
            <Link
              to="/pack/sample"
              className="font-sans text-sm italic text-graphit/60 underline-offset-4 transition hover:text-gold hover:underline"
            >
              {labels.ctaSecondary}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function aboutLabels(locale: string) {
  if (locale.startsWith('es')) return {
    headTitle: 'Sobre VozClara',
    headDescription:
      'VozClara existe porque mi compañera, hispanohablante, quería acceder al conocimiento alemán en su idioma — sin tener que estudiar alemán durante años antes.',
    backHome: 'Volver a la página principal',
    aboutSection: 'Sobre nosotros',
    heroTitle: 'Una capa de conocimiento para personas que viven entre idiomas.',
    heroLead:
      'VozClara empezó como herramienta interna para una pareja bilingüe. La abrimos a todos los que aprenden, trabajan o crean a caballo entre lenguas.',

    originSection: 'Origen',
    originHeading: 'La frustración que dio origen a esto.',
    originBody: [
      'Mi compañera es hispanohablante, vive en Frankfurt y quería entender la Tagesschau, los podcasts económicos alemanes, los vídeos de divulgación científica que yo veía cada día.',
      'Existían transcripciones. Existían traducciones automáticas. Pero el conocimiento se diluía: un transcript de 30 minutos no es conocimiento, es texto. Hacía falta otra capa — una que destilara las ideas clave, las palabras nuevas, las preguntas que se podían hacer al material.',
      'Construí la primera versión de VozClara en una semana, como herramienta interna. La usaba dos personas. Ahora la abrimos para que cualquiera que viva entre lenguas tenga el mismo atajo.',
    ],

    parentSection: 'La marca matriz',
    parentHeading: 'VozClara vive bajo LEON MARÉ.',
    parentBody: [
      'LEON MARÉ es la marca paraguas: una identidad de estilo editorial, raíces alemanas y españolas, con un código visual de tinte navy, oro, crema y tipografía clásica.',
      'VozClara es el primer producto digital bajo esa marca. Heredamos la estética y los principios — "FAZ statt Bild", forma sin ornamentación gratuita, contenido antes que efectismo. Y nos quedamos con la promesa: respetamos lo que se nos confía.',
      'Por eso tu biblioteca de Knowledge Packs vive en tu dispositivo, no en nuestros servidores. Por eso no hay tracking, no hay anuncios, no hay feed público.',
    ],

    roadmapSection: 'Hacia dónde va',
    roadmapHeading: 'Próximos meses, sin promesas vacías.',
    roadmapLead:
      'Roadmap pública. Si algo no aparece aquí, probablemente no esté en planes — y si lo está, llegará cuando esté listo.',
    roadmapItems: [
      {
        title: 'Voz de estudio',
        body: 'Audio narrado generado con IA premium en lugar de la voz del navegador. Infraestructura ya construida, falta activación.',
      },
      {
        title: 'Búsqueda semántica a escala',
        body: 'Vectorización del conocimiento para librerías de cientos de Packs. La pregunta "¿qué dije en abril sobre IA?" encuentra el Pack adecuado en segundos.',
      },
      {
        title: 'Repeticiones espaciadas',
        body: 'Los Quiz y Vocabulario de tus Packs en formato de tarjeta. Aprender de verdad lo que has guardado.',
      },
      {
        title: 'Notion / Obsidian sync',
        body: 'Exportación automática a tu sistema de notas. Hoy: descarga manual de Markdown. Mañana: sincronización en segundo plano.',
      },
    ],

    signatureBody:
      'VozClara existe porque alguien en tu vida — o tú mismo — querría acceder a lo que sólo se publica en una lengua que no domina. Si te resuena, prueba el Pack de ejemplo. Si te gusta, dile a alguien que viva entre idiomas.',
    ctaPrimary: 'Crear mi primer Pack',
    ctaSecondary: 'Ver un ejemplo',
  };

  if (locale.startsWith('pt')) return {
    headTitle: 'Sobre a VozClara',
    headDescription:
      'A VozClara existe porque a minha companheira, lusófona, queria aceder ao conhecimento alemão na sua língua — sem ter de estudar alemão durante anos primeiro.',
    backHome: 'Voltar à página principal',
    aboutSection: 'Sobre nós',
    heroTitle: 'Uma camada de conhecimento para pessoas que vivem entre idiomas.',
    heroLead:
      'A VozClara começou como ferramenta interna para um casal bilingue. Abrimo-la para todos os que aprendem, trabalham ou criam entre línguas.',

    originSection: 'Origem',
    originHeading: 'A frustração que deu origem a isto.',
    originBody: [
      'A minha companheira é lusófona, vive em Frankfurt e queria perceber o Tagesschau, os podcasts económicos alemães, os vídeos de divulgação científica que eu via todos os dias.',
      'Havia transcrições. Havia traduções automáticas. Mas o conhecimento diluía-se: uma transcrição de 30 minutos não é conhecimento, é texto. Faltava outra camada — uma que destilasse as ideias-chave, as palavras novas, as perguntas possíveis sobre o material.',
      'Construí a primeira versão da VozClara numa semana, como ferramenta interna. Usavam-na duas pessoas. Agora abrimo-la para que quem viva entre línguas tenha o mesmo atalho.',
    ],

    parentSection: 'A marca-mãe',
    parentHeading: 'A VozClara vive sob a LEON MARÉ.',
    parentBody: [
      'LEON MARÉ é a marca-chapéu: uma identidade de estilo editorial, raízes alemãs e espanholas, com um código visual de navy, ouro, creme e tipografia clássica.',
      'A VozClara é o primeiro produto digital sob essa marca. Herdamos a estética e os princípios — "FAZ statt Bild", forma sem ornamentação gratuita, conteúdo antes de efeito. E ficamos com a promessa: respeitamos o que nos é confiado.',
      'Por isso a tua biblioteca de Knowledge Packs vive no teu dispositivo, não nos nossos servidores. Por isso não há tracking, não há anúncios, não há feed público.',
    ],

    roadmapSection: 'Para onde vai',
    roadmapHeading: 'Próximos meses, sem promessas vazias.',
    roadmapLead:
      'Roadmap pública. Se algo não aparece aqui, provavelmente não está nos planos — e se está, chegará quando estiver pronto.',
    roadmapItems: [
      { title: 'Voz de estúdio', body: 'Áudio narrado com IA premium em vez da voz do navegador. Infraestrutura já construída, falta ativação.' },
      { title: 'Pesquisa semântica em escala', body: 'Vetorização do conhecimento para bibliotecas de centenas de Packs.' },
      { title: 'Repetições espaçadas', body: 'Os Quiz e Vocabulário dos teus Packs em formato de cartão.' },
      { title: 'Notion / Obsidian sync', body: 'Exportação automática para o teu sistema de notas.' },
    ],

    signatureBody:
      'A VozClara existe porque alguém na tua vida — ou tu próprio — gostaria de aceder ao que só se publica numa língua que não domina. Se ressoa, experimenta o Pack de exemplo. Se gostas, conta a alguém que viva entre línguas.',
    ctaPrimary: 'Criar o meu primeiro Pack',
    ctaSecondary: 'Ver um exemplo',
  };

  if (locale.startsWith('de')) return {
    headTitle: 'Über VozClara',
    headDescription:
      'VozClara existiert weil meine Partnerin, Spanisch-Muttersprachlerin, deutsches Wissen in ihrer Sprache verstehen wollte — ohne erst Jahre Deutsch zu lernen.',
    backHome: 'Zurück zur Startseite',
    aboutSection: 'Über uns',
    heroTitle: 'Eine Knowledge-Layer für Menschen die zwischen Sprachen leben.',
    heroLead:
      'VozClara begann als internes Werkzeug für ein zweisprachiges Paar. Wir öffnen es für alle die zwischen Sprachen lernen, arbeiten oder Inhalte produzieren.',

    originSection: 'Ursprung',
    originHeading: 'Die Frustration, aus der das hier entstand.',
    originBody: [
      'Meine Partnerin ist Spanisch-Muttersprachlerin, lebt in Frankfurt und wollte die Tagesschau verstehen, die deutschen Wirtschaftspodcasts, die populärwissenschaftlichen Videos die ich jeden Tag schaute.',
      'Es gab Transkripte. Es gab automatische Übersetzungen. Aber das Wissen verwässerte sich: ein 30-Minuten-Transkript ist kein Wissen, das ist Text. Es fehlte eine zweite Schicht — eine die Kernideen destillierte, neue Worte herausarbeitete, die Fragen die man dem Material stellen kann.',
      'Ich baute die erste Version von VozClara in einer Woche, als internes Werkzeug. Es nutzten es zwei Personen. Jetzt öffnen wir es damit jeder der zwischen Sprachen lebt dieselbe Abkürzung hat.',
    ],

    parentSection: 'Die Dachmarke',
    parentHeading: 'VozClara lebt unter LEON MARÉ.',
    parentBody: [
      'LEON MARÉ ist die Dachmarke: eine editoriale Identität mit deutsch-spanischen Wurzeln, ein visueller Code aus Navy, Gold, Creme und klassischer Typografie.',
      'VozClara ist das erste digitale Produkt unter dieser Marke. Wir erben die Ästhetik und die Prinzipien — „FAZ statt Bild", Form ohne dekorative Spielerei, Inhalt vor Effekt. Und wir behalten das Versprechen: wir schützen, was uns anvertraut wird.',
      'Deshalb lebt deine Knowledge-Pack-Bibliothek auf deinem Gerät, nicht auf unseren Servern. Deshalb gibt es kein Tracking, keine Werbung, keinen öffentlichen Feed.',
    ],

    roadmapSection: 'Wohin es geht',
    roadmapHeading: 'Die nächsten Monate, ohne leere Versprechen.',
    roadmapLead:
      'Öffentliche Roadmap. Wenn etwas hier nicht steht, ist es vermutlich nicht geplant — und wenn es steht, kommt es wenn es fertig ist.',
    roadmapItems: [
      { title: 'Studio-Stimme', body: 'Audio-Vorlesung mit KI-Premium-Stimme statt Browser-Stimme. Infrastruktur ist gebaut, fehlt nur die Aktivierung.' },
      { title: 'Semantische Suche im großen Maßstab', body: 'Vektorisierung deines Wissens für Bibliotheken mit hunderten Packs. Die Frage „was sagte ich im April über KI?" findet den richtigen Pack in Sekunden.' },
      { title: 'Spaced Repetition', body: 'Quiz und Vokabeln deiner Packs als Karteikarten. Wirklich behalten was du gespeichert hast.' },
      { title: 'Notion / Obsidian Sync', body: 'Automatischer Export ins Notiz-System. Heute: manueller Markdown-Download. Morgen: Hintergrund-Sync.' },
    ],

    signatureBody:
      'VozClara existiert weil irgendjemand in deinem Leben — oder du selbst — auf das zugreifen wollen würde was nur in einer Sprache veröffentlicht wird die nicht beherrscht wird. Wenn es bei dir ankommt: probier den Beispiel-Pack. Wenn du es magst: erzähl es jemandem der zwischen Sprachen lebt.',
    ctaPrimary: 'Meinen ersten Pack erstellen',
    ctaSecondary: 'Ein Beispiel ansehen',
  };

  return {
    headTitle: 'About VozClara',
    headDescription:
      'VozClara exists because my partner, a native Spanish speaker, wanted access to German knowledge in her own language — without spending years learning German first.',
    backHome: 'Back to home',
    aboutSection: 'About us',
    heroTitle: 'A knowledge layer for people who live between languages.',
    heroLead:
      'VozClara started as an internal tool for a bilingual couple. We are opening it to everyone who learns, works or creates across languages.',

    originSection: 'Origin',
    originHeading: 'The frustration that started this.',
    originBody: [
      'My partner is a native Spanish speaker, lives in Frankfurt, and wanted to understand the Tagesschau, the German finance podcasts, the science explainer videos I watched every day.',
      'Transcripts existed. Machine translation existed. But the knowledge thinned out: a 30-minute transcript is not knowledge, it is text. Another layer was missing — one that distilled the key ideas, surfaced new words, captured the questions you could ask the material.',
      'I built the first version of VozClara in a week, as an internal tool. Two people used it. We are opening it so anyone who lives between languages has the same shortcut.',
    ],

    parentSection: 'The parent brand',
    parentHeading: 'VozClara lives under LEON MARÉ.',
    parentBody: [
      'LEON MARÉ is the parent brand: an editorial identity with German and Spanish roots, a visual code of navy, gold, cream, classical typography.',
      'VozClara is the first digital product under that brand. We inherit the aesthetic and the principles — "FAZ statt Bild", form without decorative play, content over effect. And we keep the promise: we protect what is entrusted to us.',
      'That is why your Knowledge Pack library lives on your device, not on our servers. Why there is no tracking, no advertising, no public feed.',
    ],

    roadmapSection: 'Where it is going',
    roadmapHeading: 'The next few months, no empty promises.',
    roadmapLead:
      'Public roadmap. If something is not here, it probably is not planned — and if it is, it arrives when ready.',
    roadmapItems: [
      { title: 'Studio voice', body: 'Audio narration with a premium AI voice instead of the browser default. Infrastructure already built, activation pending.' },
      { title: 'Semantic search at scale', body: 'Vector embeddings of your knowledge for libraries of hundreds of Packs. "What did I say about AI in April?" finds the right Pack in seconds.' },
      { title: 'Spaced repetition', body: 'Quiz and Vocabulary from your Packs as flashcards. Actually remember what you saved.' },
      { title: 'Notion / Obsidian sync', body: 'Automatic export into your notes system. Today: manual Markdown download. Tomorrow: background sync.' },
    ],

    signatureBody:
      'VozClara exists because someone in your life — or you yourself — would want access to content only published in a language they do not speak. If that resonates, try the sample Pack. If you like it, tell someone who lives between languages.',
    ctaPrimary: 'Create my first Pack',
    ctaSecondary: 'See a sample',
  };
}
