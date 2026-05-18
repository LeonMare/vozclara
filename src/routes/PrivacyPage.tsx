import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';
import { SITE_URL } from '../lib/site';

const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '');

/**
 * /privacy — Privacy notice.
 *
 * The architecture itself is the privacy story:
 *   • No accounts. No login. No email. No analytics.
 *   • Knowledge Packs are persisted in IndexedDB on the user's device.
 *   • The brainId is a random anonymous identifier, used only to scope
 *     vector search queries to the user's own Packs when that feature
 *     is activated.
 *   • The only network call that touches user-supplied data is the POST
 *     to our Cloudflare Worker, which forwards the YouTube transcript
 *     and prompts to Workers AI (Llama 3.3 70B). Cloudflare's Workers
 *     AI does not train on inputs and does not retain them past the
 *     request lifecycle. That's documented in their AUP.
 *   • Optional OpenAI TTS path: when activated, the text-to-narrate is
 *     forwarded to OpenAI's /v1/audio/speech endpoint to render MP3.
 *     OpenAI's API data is not used for training per their API terms.
 *
 * The page reads like a brand statement, not a cookie-banner essay.
 * That matches the LEON MARÉ tone: editorial, candid, short.
 */
export function PrivacyPage() {
  const { locale } = useLocale();
  const labels = privacyLabels(locale);

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
            {s.bullets && (
              <ul className="mt-6 space-y-3 font-serif text-base leading-relaxed text-graphit/80 sm:text-lg">
                {s.bullets.map((b, k) => (
                  <li key={k} className="flex items-baseline gap-3">
                    <span className="text-gold">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}

      {/* Contact */}
      <section className="border-t border-navy/10 bg-creme py-12 text-center sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="font-serif text-lg italic leading-relaxed text-graphit/75 sm:text-xl">
            {labels.contactBody}
          </p>
          <p className="mt-5 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
            — Christian Leon · LEON MARÉ · Frankfurt
          </p>
        </div>
      </section>
    </main>
  );
}

function privacyLabels(locale: string) {
  // Month name varies per locale — May / Mayo / Maio / Mai.
  const lastUpdated = locale.startsWith('es')
    ? 'mayo 2026'
    : locale.startsWith('pt')
      ? 'maio 2026'
      : locale.startsWith('de')
        ? 'Mai 2026'
        : 'May 2026';

  if (locale.startsWith('es')) return {
    headTitle: 'Privacidad — Voz Clara',
    headDescription:
      'Tu biblioteca permanece en tu dispositivo. Sin cuentas, sin tracking, sin anuncios. Solo el análisis con IA sale de tu navegador.',
    backHome: 'Volver a la página principal',
    sectionLabel: 'Privacidad',
    heroTitle: 'Lo que protegemos. Cómo lo protegemos.',
    heroLead:
      'Voz Clara no recopila tus datos personales porque no necesita tu identidad para funcionar. Esta página explica qué información se procesa, dónde vive y por qué.',
    lastUpdatedLabel: 'Actualizado',
    lastUpdated,
    sections: [
      {
        heading: 'Sin cuentas, sin login',
        body: [
          'Voz Clara no requiere registro. No pedimos correo electrónico, teléfono, nombre real ni ninguna otra forma de identificación. No puedes "iniciar sesión" porque no hay sesión que iniciar.',
          'En lugar de un ID de usuario, tu navegador genera un brainId aleatorio anónimo (similar a un UUID) que se guarda localmente. Sirve únicamente para vincular tus consultas de búsqueda semántica a tus propios Packs cuando esa función esté activada.',
        ],
      },
      {
        heading: 'Tu biblioteca vive en tu dispositivo',
        body: [
          'Los Knowledge Packs que creas o guardas se persisten en IndexedDB — el almacenamiento local que tu navegador ofrece a las aplicaciones web. No se suben a nuestros servidores.',
          'Si borras los datos del sitio en tu navegador, o usas el botón "Eliminar" en tu biblioteca, esos Packs desaparecen. No hay copia en la nube. Es responsabilidad tuya hacer exportaciones (Markdown / TXT / PDF) si quieres archivar a largo plazo.',
        ],
      },
      {
        heading: 'Qué sale de tu navegador',
        body: [
          'Cuando generas un Pack, ocurren dos llamadas de red a nuestro Cloudflare Worker:',
        ],
        bullets: [
          'POST a /api/transcript con la URL del vídeo de YouTube. Obtenemos el transcript público.',
          'POST a /api/insights con el transcript + tus preferencias (idioma, modo). Cloudflare Workers AI ejecuta Llama 3.3 70B sobre los datos y devuelve el análisis estructurado.',
          'Opcional, cuando esté activado: POST a /api/tts con el texto a narrar. Se reenvía a OpenAI tts-1 y devuelve el MP3.',
          'Opcional, cuando esté activado: POST a /api/index con tus chunks del Pack. Se indexan en Cloudflare Vectorize bajo tu brainId para búsqueda semántica.',
        ],
      },
      {
        heading: 'Política de los proveedores',
        body: [
          'Cloudflare Workers AI no entrena modelos con tus inputs y no retiene los datos más allá de la duración de la petición (ver Cloudflare AI Acceptable Use Policy).',
          'OpenAI API, según sus términos comerciales, no usa los datos de la API para entrenamiento por defecto (ver OpenAI API data usage policy).',
          'No usamos servicios de analítica (ni Google Analytics, ni Plausible, ni Fathom). No hay píxeles de tracking. No hay cookies de tercero.',
        ],
      },
      {
        heading: 'Cookies y almacenamiento local',
        body: [
          'Voz Clara no usa cookies. Usa localStorage e IndexedDB del navegador para guardar tus preferencias (idioma, tema) y tu biblioteca de Packs. Estos datos no salen de tu dispositivo.',
        ],
      },
      {
        heading: 'Tus derechos',
        body: [
          'Como no recopilamos datos personales identificables, no hay un "perfil de usuario" que solicitar, exportar o eliminar de nuestros servidores. Todo lo que controla tu experiencia vive en tu navegador.',
          `Para borrar todo: ajustes del navegador → "Borrar datos del sitio" para ${SITE_HOST}. Eso elimina la biblioteca, las preferencias y el brainId. La próxima visita empieza desde cero.`,
        ],
      },
    ],
    contactBody:
      'Si tienes dudas sobre privacidad o una pregunta concreta sobre cómo se procesan los datos, escríbeme. Voz Clara es un proyecto pequeño operado por una sola persona; las respuestas no son automáticas.',
  };

  if (locale.startsWith('pt')) return {
    headTitle: 'Privacidade — Voz Clara',
    headDescription:
      'A tua biblioteca permanece no teu dispositivo. Sem contas, sem tracking, sem anúncios. Apenas a análise por IA sai do teu navegador.',
    backHome: 'Voltar à página principal',
    sectionLabel: 'Privacidade',
    heroTitle: 'O que protegemos. Como o protegemos.',
    heroLead:
      'A Voz Clara não recolhe os teus dados pessoais porque não precisa da tua identidade para funcionar. Esta página explica que informação é processada, onde vive e porquê.',
    lastUpdatedLabel: 'Atualizado',
    lastUpdated,
    sections: [
      {
        heading: 'Sem contas, sem login',
        body: [
          'A Voz Clara não exige registo. Não pedimos email, telemóvel, nome real nem qualquer outra forma de identificação. Não podes "iniciar sessão" porque não há sessão para iniciar.',
          'Em vez de um ID de utilizador, o teu navegador gera um brainId aleatório anónimo (similar a um UUID) guardado localmente. Serve apenas para ligar as tuas consultas de pesquisa semântica aos teus próprios Packs quando essa funcionalidade estiver ativada.',
        ],
      },
      {
        heading: 'A tua biblioteca vive no teu dispositivo',
        body: [
          'Os Knowledge Packs que crias ou guardas são persistidos em IndexedDB — o armazenamento local que o teu navegador oferece a aplicações web. Não são enviados para os nossos servidores.',
          'Se apagares os dados do site no teu navegador, ou usares o botão "Eliminar" na tua biblioteca, esses Packs desaparecem. Não há cópia na nuvem. É responsabilidade tua exportar (Markdown / TXT / PDF) se quiseres arquivar a longo prazo.',
        ],
      },
      {
        heading: 'O que sai do teu navegador',
        body: [
          'Quando geras um Pack, ocorrem duas chamadas de rede para o nosso Cloudflare Worker:',
        ],
        bullets: [
          'POST para /api/transcript com o URL do vídeo do YouTube. Obtemos o transcript público.',
          'POST para /api/insights com o transcript + as tuas preferências (idioma, modo). Cloudflare Workers AI executa Llama 3.3 70B sobre os dados e devolve a análise estruturada.',
          'Opcional, quando ativado: POST para /api/tts com o texto a narrar. É reencaminhado para OpenAI tts-1 e devolve o MP3.',
          'Opcional, quando ativado: POST para /api/index com os chunks do teu Pack. São indexados no Cloudflare Vectorize sob o teu brainId para pesquisa semântica.',
        ],
      },
      {
        heading: 'Política dos fornecedores',
        body: [
          'Cloudflare Workers AI não treina modelos com os teus inputs e não retém os dados além da duração do pedido (ver Cloudflare AI Acceptable Use Policy).',
          'OpenAI API, segundo os seus termos comerciais, não usa dados da API para treino por omissão (ver OpenAI API data usage policy).',
          'Não usamos serviços de analytics (nem Google Analytics, nem Plausible, nem Fathom). Não há pixels de tracking. Não há cookies de terceiros.',
        ],
      },
      {
        heading: 'Cookies e armazenamento local',
        body: [
          'A Voz Clara não usa cookies. Usa localStorage e IndexedDB do navegador para guardar as tuas preferências (idioma, tema) e a tua biblioteca de Packs. Estes dados não saem do teu dispositivo.',
        ],
      },
      {
        heading: 'Os teus direitos',
        body: [
          'Como não recolhemos dados pessoais identificáveis, não há um "perfil de utilizador" para solicitar, exportar ou eliminar dos nossos servidores. Tudo o que controla a tua experiência vive no teu navegador.',
          `Para apagar tudo: definições do navegador → "Limpar dados do site" para ${SITE_HOST}. Isso elimina a biblioteca, as preferências e o brainId. A próxima visita começa do zero.`,
        ],
      },
    ],
    contactBody:
      'Se tens dúvidas sobre privacidade ou uma pergunta concreta sobre como os dados são processados, escreve-me. A Voz Clara é um projeto pequeno operado por uma só pessoa; as respostas não são automáticas.',
  };

  if (locale.startsWith('de')) return {
    headTitle: 'Datenschutz — Voz Clara',
    headDescription:
      'Deine Bibliothek bleibt auf deinem Gerät. Keine Konten, kein Tracking, keine Werbung. Nur die KI-Analyse verlässt deinen Browser.',
    backHome: 'Zurück zur Startseite',
    sectionLabel: 'Datenschutz',
    heroTitle: 'Was wir schützen. Wie wir es schützen.',
    heroLead:
      'Voz Clara erhebt keine personenbezogenen Daten, weil es deine Identität nicht braucht um zu funktionieren. Diese Seite erklärt, welche Information verarbeitet wird, wo sie lebt und warum.',
    lastUpdatedLabel: 'Aktualisiert',
    lastUpdated,
    sections: [
      {
        heading: 'Keine Konten, kein Login',
        body: [
          'Voz Clara verlangt keine Registrierung. Wir fragen weder E-Mail, Telefon, Klarname noch irgendeine andere Identifikation ab. Du kannst dich nicht „anmelden", weil es keine Sitzung gibt.',
          'Statt einer Benutzer-ID erzeugt dein Browser eine zufällige anonyme brainId (UUID-ähnlich), lokal gespeichert. Sie dient ausschließlich dazu, semantische Suchanfragen an deine eigenen Packs zu binden, sobald diese Funktion aktiviert ist.',
        ],
      },
      {
        heading: 'Deine Bibliothek lebt auf deinem Gerät',
        body: [
          'Die Knowledge Packs, die du erstellst oder speicherst, werden in IndexedDB persistiert — der lokale Speicher den dein Browser Web-Anwendungen zur Verfügung stellt. Sie werden nicht auf unsere Server hochgeladen.',
          'Löschst du die Site-Daten im Browser oder verwendest du den „Löschen"-Button in deiner Bibliothek, sind diese Packs weg. Es gibt keine Cloud-Kopie. Es liegt an dir Exporte (Markdown / TXT / PDF) anzufertigen, wenn du langfristig archivieren willst.',
        ],
      },
      {
        heading: 'Was deinen Browser verlässt',
        body: [
          'Wenn du einen Pack erstellst, gehen zwei Netzwerkaufrufe an unseren Cloudflare Worker:',
        ],
        bullets: [
          'POST an /api/transcript mit der YouTube-Video-URL. Wir holen das öffentliche Transkript.',
          'POST an /api/insights mit dem Transkript + deinen Präferenzen (Sprache, Modus). Cloudflare Workers AI führt Llama 3.3 70B über die Daten aus und liefert die strukturierte Analyse zurück.',
          'Optional, wenn aktiviert: POST an /api/tts mit dem zu vertonenden Text. Wird an OpenAI tts-1 weitergeleitet und liefert die MP3 zurück.',
          'Optional, wenn aktiviert: POST an /api/index mit deinen Pack-Chunks. Sie werden in Cloudflare Vectorize unter deiner brainId für semantische Suche indexiert.',
        ],
      },
      {
        heading: 'Anbieter-Richtlinien',
        body: [
          'Cloudflare Workers AI trainiert keine Modelle mit deinen Inputs und behält Daten nicht über die Dauer des Requests hinaus (siehe Cloudflare AI Acceptable Use Policy).',
          'OpenAI API verwendet nach ihren Business-Bedingungen API-Daten standardmäßig nicht für Training (siehe OpenAI API data usage policy).',
          'Wir verwenden keine Analytics-Dienste (weder Google Analytics noch Plausible noch Fathom). Keine Tracking-Pixel. Keine Third-Party-Cookies.',
        ],
      },
      {
        heading: 'Cookies und lokaler Speicher',
        body: [
          'Voz Clara verwendet keine Cookies. Es nutzt localStorage und IndexedDB des Browsers um deine Präferenzen (Sprache, Theme) und deine Pack-Bibliothek zu speichern. Diese Daten verlassen dein Gerät nicht.',
        ],
      },
      {
        heading: 'Deine Rechte',
        body: [
          'Da wir keine personenbeziehbaren Daten erheben, gibt es kein „Nutzerprofil" das von unseren Servern angefordert, exportiert oder gelöscht werden könnte. Alles was dein Erlebnis steuert lebt in deinem Browser.',
          `Um alles zu löschen: Browser-Einstellungen → „Site-Daten löschen" für ${SITE_HOST}. Das entfernt Bibliothek, Präferenzen und brainId. Der nächste Besuch beginnt bei null.`,
        ],
      },
    ],
    contactBody:
      'Wenn du Datenschutz-Fragen hast oder eine konkrete Frage zur Datenverarbeitung — schreib mich an. Voz Clara ist ein kleines Projekt, von einer Person betrieben; Antworten sind nicht automatisiert.',
  };

  return {
    headTitle: 'Privacy — Voz Clara',
    headDescription:
      'Your library stays on your device. No accounts, no tracking, no ads. Only the AI analysis call leaves your browser.',
    backHome: 'Back to home',
    sectionLabel: 'Privacy',
    heroTitle: 'What we protect. How we protect it.',
    heroLead:
      "Voz Clara doesn't collect your personal data because it doesn't need your identity to work. This page explains what information is processed, where it lives, and why.",
    lastUpdatedLabel: 'Updated',
    lastUpdated,
    sections: [
      {
        heading: 'No accounts, no login',
        body: [
          "Voz Clara requires no signup. We don't ask for email, phone, real name, or any other form of identification. You can't 'log in' because there's no session to start.",
          'Instead of a user ID, your browser generates a random anonymous brainId (UUID-shaped), stored locally. It exists solely to scope semantic search queries to your own Packs when that feature is activated.',
        ],
      },
      {
        heading: 'Your library lives on your device',
        body: [
          'The Knowledge Packs you create or save are persisted in IndexedDB — the local storage your browser offers to web apps. They are never uploaded to our servers.',
          'If you wipe site data in your browser, or use the "Delete" button in your library, those Packs are gone. There is no cloud copy. It is on you to export (Markdown / TXT / PDF) if you want long-term archives.',
        ],
      },
      {
        heading: 'What leaves your browser',
        body: [
          'When you generate a Pack, two network calls go to our Cloudflare Worker:',
        ],
        bullets: [
          'POST /api/transcript with the YouTube video URL. We fetch the public transcript.',
          'POST /api/insights with the transcript + your preferences (language, mode). Cloudflare Workers AI runs Llama 3.3 70B over the data and returns the structured analysis.',
          'Optional, when activated: POST /api/tts with the text to narrate. Forwarded to OpenAI tts-1, returns MP3.',
          'Optional, when activated: POST /api/index with your Pack chunks. Indexed into Cloudflare Vectorize under your brainId for semantic search.',
        ],
      },
      {
        heading: 'Provider policies',
        body: [
          'Cloudflare Workers AI does not train models on your inputs and does not retain data past the request lifecycle (see Cloudflare AI Acceptable Use Policy).',
          'OpenAI API under their commercial terms does not use API data for training by default (see OpenAI API data usage policy).',
          'We use no analytics services (no Google Analytics, no Plausible, no Fathom). No tracking pixels. No third-party cookies.',
        ],
      },
      {
        heading: 'Cookies and local storage',
        body: [
          "Voz Clara doesn't use cookies. It uses the browser's localStorage and IndexedDB to store your preferences (language, theme) and your Pack library. None of this leaves your device.",
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'Because we collect no personally identifiable data, there is no "user profile" to request, export, or delete from our servers. Everything that shapes your experience lives in your browser.',
          `To wipe everything: browser settings → "Clear site data" for ${SITE_HOST}. That removes the library, the preferences, and the brainId. The next visit starts from zero.`,
        ],
      },
    ],
    contactBody:
      "If you have privacy questions or a specific concern about data handling, write to me. Voz Clara is a small project run by one person; responses aren't automated.",
  };
}
