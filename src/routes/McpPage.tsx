import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';

/**
 * /mcp — developer-facing page for the Model Context Protocol server.
 *
 * Audience: AI engineers, Claude Desktop / Cursor / Continue / Claude
 * Code users, anyone discovering VozClara through Smithery, Glama,
 * awesome-mcp-servers, or the broader MCP ecosystem.
 *
 * Intent cluster:
 *   "vozclara mcp"
 *   "youtube mcp server"
 *   "knowledge pack mcp"
 *   "claude mcp youtube"
 *   "cursor mcp youtube transcript"
 *
 * Tight, dev-friendly composition: install snippet up top (instant
 * value), tools list, endpoint table, listed-at credibility,
 * Pro Plus / Sonnet 4.5 note, CTAs. Code blocks stay English /
 * technical regardless of locale; surrounding prose is localised.
 */
export function McpPage() {
  const { locale } = useLocale();
  const labels = mcpLabels(locale);

  return (
    <main id="main" className="relative overflow-hidden bg-creme paper">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-70"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(201,162,75,0.16), transparent 55%), radial-gradient(ellipse at bottom left, rgba(10,26,58,0.06), transparent 50%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-20">
        <header>
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.eyebrow}
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl lg:text-6xl">
            {labels.h1}
          </h1>
          <div className="mt-5 h-px w-16 bg-gold draw-rule" aria-hidden />
          <p className="mt-5 max-w-2xl font-sans text-base leading-relaxed text-graphit/80 sm:text-lg">
            {labels.sub}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="https://smithery.ai/server/salvador7eon/vozclara"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card bg-navy px-5 py-2.5 font-sans text-sm font-medium text-creme transition hover:bg-navy/90"
            >
              {labels.smitheryCta} ↗
            </a>
            <a
              href="https://github.com/LeonMare/vozclara"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-card border border-navy/15 bg-white px-5 py-2.5 font-sans text-sm font-medium text-navy transition hover:border-gold"
            >
              {labels.githubCta} ↗
            </a>
          </div>
        </header>

        {/* Quick install — Claude Desktop config, instant value */}
        <section className="mt-14 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.installEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.installTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-3 max-w-2xl font-sans text-sm text-graphit/75">
            {labels.installSub}
          </p>

          <pre className="mt-6 overflow-x-auto rounded-card border border-navy/15 bg-navy/95 p-5 font-mono text-[12px] leading-relaxed text-creme sm:p-6 sm:text-[13px]">
{`// claude_desktop_config.json
{
  "mcpServers": {
    "vozclara": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://vozclara.app/api/mcp"
      ]
    }
  }
}`}
          </pre>

          <p className="mt-3 font-sans text-[12px] text-graphit/60">
            {labels.installNote}
          </p>
        </section>

        {/* Tool list */}
        <section className="mt-14 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.toolsEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.toolsTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <ul className="mt-8 grid gap-4">
            {labels.tools.map((tool, i) => (
              <li
                key={i}
                className="rounded-card border border-navy/10 bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-baseline gap-3">
                  <code className="font-mono text-sm text-navy sm:text-base">
                    {tool.name}
                  </code>
                  <span className={`rounded-full px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-widest ${tool.auth === 'anonymous' ? 'bg-gold/15 text-gold-deep' : 'bg-navy/10 text-navy'}`}>
                    {tool.auth === 'anonymous' ? labels.anonBadge : labels.oauthBadge}
                  </span>
                </div>
                <p className="mt-2 font-sans text-sm leading-relaxed text-graphit/75">
                  {tool.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Endpoint table */}
        <section className="mt-14 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.endpointsEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.endpointsTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <div className="mt-6 overflow-hidden rounded-card border border-navy/15">
            <div className="grid grid-cols-[1fr_120px] gap-4 border-b border-navy/10 bg-creme/60 px-5 py-3 font-sans text-[11px] uppercase tracking-widest text-graphit/60 sm:px-6">
              <div>{labels.urlLabel}</div>
              <div>{labels.authLabel}</div>
            </div>
            {[
              { url: 'https://vozclara.app/api/mcp', auth: labels.anonBadge, note: 'Streamable HTTP, anonymous' },
              { url: 'https://vozclara.app/api/sse', auth: labels.anonBadge, note: 'SSE, anonymous' },
              { url: 'https://vozclara.app/api/mcp/pro', auth: labels.oauthBadge, note: 'Streamable HTTP, OAuth 2.1 PKCE S256' },
              { url: 'https://vozclara.app/api/sse/pro', auth: labels.oauthBadge, note: 'SSE, OAuth 2.1 PKCE S256' },
            ].map((row, i, arr) => (
              <div
                key={i}
                className={[
                  'grid grid-cols-[1fr_120px] gap-4 px-5 py-3 sm:px-6',
                  i < arr.length - 1 ? 'border-b border-navy/10' : '',
                ].join(' ')}
              >
                <div>
                  <code className="font-mono text-[12px] text-navy sm:text-[13px]">{row.url}</code>
                  <div className="mt-1 font-sans text-[11px] text-graphit/60">{row.note}</div>
                </div>
                <div className="font-sans text-[11px] uppercase tracking-widest text-graphit/65">
                  {row.auth}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* OAuth scopes */}
        <section className="mt-14 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.oauthEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.oauthTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-graphit/75">
            {labels.oauthSub}
          </p>
          <pre className="mt-5 overflow-x-auto rounded-card border border-navy/15 bg-navy/95 p-5 font-mono text-[12px] leading-relaxed text-creme sm:p-6 sm:text-[13px]">
{`/.well-known/oauth-authorization-server   → RFC-8414 metadata
/.well-known/oauth-protected-resource     → resource metadata
/oauth/authorize                          → consent UI (PKCE S256)
/oauth/token                              → access + refresh tokens
/oauth/register                           → RFC-7591 dynamic client reg

Scopes: library:read · library:write · profile`}
          </pre>
        </section>

        {/* Listed at */}
        <section className="mt-14 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.listedEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.listedTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { name: 'Smithery', url: 'https://smithery.ai/server/salvador7eon/vozclara', note: 'Score 84 / 100 · Public · TypeScript' },
              { name: 'Glama (Servers)', url: 'https://glama.ai/mcp/servers/LeonMare/vozclara', note: 'Author-verified · FSL-1.1-Apache-2.0' },
              { name: 'Glama (Connectors)', url: 'https://glama.ai/mcp/connectors', note: 'Hosted endpoint, no install required' },
              { name: 'awesome-mcp-servers', url: 'https://github.com/punkpeye/awesome-mcp-servers/pull/6721', note: 'PR #6721 — Knowledge & Memory section' },
            ].map((row, i) => (
              <li key={i} className="rounded-card border border-navy/10 bg-white px-5 py-4">
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-base text-navy underline-offset-4 hover:underline"
                >
                  {row.name} ↗
                </a>
                <p className="mt-1 font-sans text-[12px] text-graphit/65">{row.note}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Pro Plus note */}
        <section className="mt-14 sm:mt-20">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            {labels.tiersEyebrow}
          </div>
          <h2 className="mt-3 font-serif text-2xl text-navy sm:text-3xl">
            {labels.tiersTitle}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-graphit/85">
            {labels.tiersBody}
          </p>
          <p className="mt-5 font-sans text-sm text-graphit/65">
            <Link to="/founder" className="text-gold-deep underline-offset-4 hover:underline">
              {labels.tiersFounderLink} →
            </Link>
          </p>
        </section>

        {/* Footer CTAs */}
        <div className="mt-16 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm text-graphit/65 sm:mt-20">
          <Link
            to="/pack/sample"
            className="italic underline-offset-4 transition hover:text-gold hover:underline"
          >
            {labels.sampleCta}
          </Link>
          <Link
            to="/"
            className="underline-offset-4 transition hover:text-navy hover:underline"
          >
            {labels.backCta}
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ─── Localised copy ──────────────────────────────────────────────── */

function mcpLabels(locale: string) {
  if (locale.startsWith('es')) return {
    eyebrow: 'MCP · MODEL CONTEXT PROTOCOL',
    h1: 'El motor de Knowledge Packs, llamable desde cualquier cliente MCP.',
    sub: 'VozClara expone un servidor MCP compatible con Claude Desktop, Cursor, Continue, Claude Code, y cualquier agente que hable Model Context Protocol. Cuatro herramientas, dos modos de autenticación, una superficie de descubrimiento.',
    smitheryCta: 'Instalar desde Smithery',
    githubCta: 'GitHub repo',
    installEyebrow: '§ Instalación rápida',
    installTitle: 'Una entrada en claude_desktop_config.json.',
    installSub: 'Pega esto en el JSON de configuración de Claude Desktop, reinicia la app, y vozclara_generate_pack está disponible inmediatamente. Sin cuenta, sin OAuth para empezar.',
    installNote: 'mcp-remote viene como dependencia npm. Para Cursor / Continue / Claude Code la sintaxis es similar — consulta la página de Smithery para snippets exactos por cliente.',
    toolsEyebrow: '§ Herramientas',
    toolsTitle: 'Cuatro herramientas, dos niveles de acceso.',
    tools: [
      { name: 'vozclara_generate_pack', auth: 'anonymous', body: 'Pega una URL de YouTube y recibe un Knowledge Pack completo: resumen, ideas clave, vocabulario, quiz, citas con timestamp, y opcionalmente un mazo Anki .apkg. Anónimo, sin signup.' },
      { name: 'vozclara_search_my_library', auth: 'oauth', body: 'Búsqueda semántica sobre todos los packs guardados del usuario. RAG sobre IndexedDB sincronizada al servidor. Scope: library:read.' },
      { name: 'vozclara_ask_video', auth: 'oauth', body: 'Q&A con grounding sobre un pack específico. Devuelve respuestas con citas timestamp [mm:ss] al video original. Scope: library:read.' },
      { name: 'vozclara_export_anki', auth: 'oauth', body: 'Exporta cualquier pack como archivo .apkg estándar. Tarjetas con frase en contexto + traducción + enlace timestamp. Scope: library:read.' },
    ],
    anonBadge: 'Anónimo',
    oauthBadge: 'OAuth 2.1',
    endpointsEyebrow: '§ Endpoints',
    endpointsTitle: 'Cuatro URLs. Dos transports. Dos modos auth.',
    urlLabel: 'URL',
    authLabel: 'Auth',
    oauthEyebrow: '§ OAuth flow',
    oauthTitle: 'OAuth 2.1 con PKCE S256.',
    oauthSub: 'Implementado vía @cloudflare/workers-oauth-provider con almacenamiento KV para clients, codes, access tokens y refresh tokens. Los secretos se almacenan como hashes, nunca como valores planos.',
    listedEyebrow: '§ Listado en',
    listedTitle: 'Cuatro directorios MCP, una PR pública.',
    tiersEyebrow: '§ Tiers',
    tiersTitle: 'Free Llama. Pro Plus Sonnet 4.5.',
    tiersBody:
      'El endpoint anónimo y el endpoint OAuth usan Llama 3.3 70B vía Cloudflare Workers AI para Free y Pro. El tier Pro Plus (€19/mes o €99 lifetime founder) cambia el motor a Claude Sonnet 4.5 vía Cloudflare AI Gateway — calidad de razonamiento más alta en summaries densos y comprensión multilingüe.',
    tiersFounderLink: 'Founder Deal: €99 una vez, lifetime Pro Plus',
    sampleCta: 'Ver un pack de muestra primero →',
    backCta: 'Volver a VozClara',
  };

  if (locale.startsWith('pt')) return {
    eyebrow: 'MCP · MODEL CONTEXT PROTOCOL',
    h1: 'O motor de Knowledge Packs, chamável de qualquer cliente MCP.',
    sub: 'VozClara expõe um servidor MCP compatível com Claude Desktop, Cursor, Continue, Claude Code, e qualquer agente que fale Model Context Protocol. Quatro ferramentas, dois modos de autenticação, uma superfície de descoberta.',
    smitheryCta: 'Instalar do Smithery',
    githubCta: 'Repositório GitHub',
    installEyebrow: '§ Instalação rápida',
    installTitle: 'Uma entrada no claude_desktop_config.json.',
    installSub: 'Cola isto na configuração JSON do Claude Desktop, reinicia a app, e vozclara_generate_pack fica disponível de imediato. Sem conta, sem OAuth para começar.',
    installNote: 'mcp-remote vem como dependência npm. Para Cursor / Continue / Claude Code a sintaxe é similar — consulta a página Smithery para snippets exatos por cliente.',
    toolsEyebrow: '§ Ferramentas',
    toolsTitle: 'Quatro ferramentas, dois níveis de acesso.',
    tools: [
      { name: 'vozclara_generate_pack', auth: 'anonymous', body: 'Cola um URL do YouTube e recebe um Knowledge Pack completo: resumo, ideias-chave, vocabulário, quiz, citações com timestamp, e opcionalmente um deck Anki .apkg. Anónimo, sem registo.' },
      { name: 'vozclara_search_my_library', auth: 'oauth', body: 'Pesquisa semântica sobre todos os packs guardados do utilizador. RAG sobre IndexedDB sincronizada ao servidor. Scope: library:read.' },
      { name: 'vozclara_ask_video', auth: 'oauth', body: 'Q&A com grounding sobre um pack específico. Devolve respostas com citações timestamp [mm:ss] ao vídeo original. Scope: library:read.' },
      { name: 'vozclara_export_anki', auth: 'oauth', body: 'Exporta qualquer pack como ficheiro .apkg standard. Cartões com frase em contexto + tradução + ligação timestamp. Scope: library:read.' },
    ],
    anonBadge: 'Anónimo',
    oauthBadge: 'OAuth 2.1',
    endpointsEyebrow: '§ Endpoints',
    endpointsTitle: 'Quatro URLs. Dois transports. Dois modos auth.',
    urlLabel: 'URL',
    authLabel: 'Auth',
    oauthEyebrow: '§ Fluxo OAuth',
    oauthTitle: 'OAuth 2.1 com PKCE S256.',
    oauthSub: 'Implementado via @cloudflare/workers-oauth-provider com armazenamento KV para clients, codes, access tokens e refresh tokens. Os segredos são guardados como hashes, nunca como valores planos.',
    listedEyebrow: '§ Listado em',
    listedTitle: 'Quatro diretórios MCP, uma PR pública.',
    tiersEyebrow: '§ Tiers',
    tiersTitle: 'Free Llama. Pro Plus Sonnet 4.5.',
    tiersBody:
      'O endpoint anónimo e o endpoint OAuth usam Llama 3.3 70B via Cloudflare Workers AI para Free e Pro. O tier Pro Plus (€19/mês ou €99 lifetime founder) muda o motor para Claude Sonnet 4.5 via Cloudflare AI Gateway — qualidade de raciocínio mais alta em resumos densos e compreensão multilingue.',
    tiersFounderLink: 'Founder Deal: €99 uma vez, lifetime Pro Plus',
    sampleCta: 'Ver um pack de exemplo primeiro →',
    backCta: 'Voltar à VozClara',
  };

  if (locale.startsWith('de')) return {
    eyebrow: 'MCP · MODEL CONTEXT PROTOCOL',
    h1: 'Die Knowledge-Pack-Engine, aufrufbar aus jedem MCP-Client.',
    sub: 'VozClara stellt einen MCP-Server bereit kompatibel mit Claude Desktop, Cursor, Continue, Claude Code, und jedem Agent der Model Context Protocol spricht. Vier Tools, zwei Auth-Modi, eine Discovery-Oberfläche.',
    smitheryCta: 'Aus Smithery installieren',
    githubCta: 'GitHub-Repo',
    installEyebrow: '§ Schnellinstallation',
    installTitle: 'Ein Eintrag in claude_desktop_config.json.',
    installSub: 'Füg das in Claude Desktops Konfigurations-JSON, neustart die App, und vozclara_generate_pack ist sofort verfügbar. Kein Account, kein OAuth zum Anfangen.',
    installNote: 'mcp-remote kommt als npm-Dependency. Für Cursor / Continue / Claude Code ist die Syntax ähnlich — siehe Smithery-Seite für exakte Client-Snippets.',
    toolsEyebrow: '§ Tools',
    toolsTitle: 'Vier Tools, zwei Access-Ebenen.',
    tools: [
      { name: 'vozclara_generate_pack', auth: 'anonymous', body: 'YouTube-URL einfügen und einen kompletten Knowledge Pack bekommen: Zusammenfassung, Kerngedanken, Vokabular, Quiz, Zitate mit Timestamp, und optional ein Anki-Deck .apkg. Anonym, ohne Signup.' },
      { name: 'vozclara_search_my_library', auth: 'oauth', body: 'Semantische Suche über alle gespeicherten Packs eines Users. RAG über server-synchronisierte IndexedDB. Scope: library:read.' },
      { name: 'vozclara_ask_video', auth: 'oauth', body: 'Q&A mit Grounding über einen spezifischen Pack. Antworten enthalten Timestamp-Zitate [mm:ss] zum Original-Video. Scope: library:read.' },
      { name: 'vozclara_export_anki', auth: 'oauth', body: 'Exportiert jeden Pack als Standard-.apkg-Datei. Karten mit Satz im Kontext + Übersetzung + Timestamp-Link. Scope: library:read.' },
    ],
    anonBadge: 'Anonym',
    oauthBadge: 'OAuth 2.1',
    endpointsEyebrow: '§ Endpoints',
    endpointsTitle: 'Vier URLs. Zwei Transports. Zwei Auth-Modi.',
    urlLabel: 'URL',
    authLabel: 'Auth',
    oauthEyebrow: '§ OAuth-Flow',
    oauthTitle: 'OAuth 2.1 mit PKCE S256.',
    oauthSub: 'Implementiert via @cloudflare/workers-oauth-provider mit KV-Storage für Clients, Codes, Access Tokens und Refresh Tokens. Secrets werden als Hashes gespeichert, nie als Plain-Werte.',
    listedEyebrow: '§ Gelistet in',
    listedTitle: 'Vier MCP-Verzeichnisse, eine öffentliche PR.',
    tiersEyebrow: '§ Tiers',
    tiersTitle: 'Free Llama. Pro Plus Sonnet 4.5.',
    tiersBody:
      'Der anonyme Endpoint und der OAuth-Endpoint nutzen Llama 3.3 70B via Cloudflare Workers AI für Free und Pro. Der Pro-Plus-Tier (€19/Monat oder €99 lifetime Founder) wechselt die Engine zu Claude Sonnet 4.5 via Cloudflare AI Gateway — höhere Reasoning-Qualität bei dichten Zusammenfassungen und mehrsprachigem Verständnis.',
    tiersFounderLink: 'Founder Deal: €99 einmal, lifetime Pro Plus',
    sampleCta: 'Erst ein Sample-Pack anschauen →',
    backCta: 'Zurück zu VozClara',
  };

  return {
    eyebrow: 'MCP · MODEL CONTEXT PROTOCOL',
    h1: 'The Knowledge Pack engine, callable from any MCP client.',
    sub: 'VozClara ships an MCP server compatible with Claude Desktop, Cursor, Continue, Claude Code, and any agent that speaks Model Context Protocol. Four tools, two auth modes, one discovery surface.',
    smitheryCta: 'Install from Smithery',
    githubCta: 'GitHub repo',
    installEyebrow: '§ Quick install',
    installTitle: 'One entry in claude_desktop_config.json.',
    installSub: "Paste this into Claude Desktop's config JSON, restart the app, and vozclara_generate_pack is available immediately. No account, no OAuth to get started.",
    installNote: 'mcp-remote ships as an npm dependency. Cursor / Continue / Claude Code use similar syntax — check the Smithery page for exact per-client snippets.',
    toolsEyebrow: '§ Tools',
    toolsTitle: 'Four tools, two access tiers.',
    tools: [
      { name: 'vozclara_generate_pack', auth: 'anonymous', body: 'Paste a YouTube URL and receive a full Knowledge Pack: summary, key ideas, vocabulary, quiz, timestamped quotes, and optionally an Anki .apkg deck. Anonymous, no signup.' },
      { name: 'vozclara_search_my_library', auth: 'oauth', body: "Semantic search across the user's saved packs. RAG over server-synced IndexedDB. Scope: library:read." },
      { name: 'vozclara_ask_video', auth: 'oauth', body: 'Grounded Q&A on a specific pack. Returns answers with [mm:ss] timestamp citations back to the original video. Scope: library:read.' },
      { name: 'vozclara_export_anki', auth: 'oauth', body: 'Exports any pack as a standard .apkg file. Cards with sentence-context + translation + timestamp link. Scope: library:read.' },
    ],
    anonBadge: 'Anonymous',
    oauthBadge: 'OAuth 2.1',
    endpointsEyebrow: '§ Endpoints',
    endpointsTitle: 'Four URLs. Two transports. Two auth modes.',
    urlLabel: 'URL',
    authLabel: 'Auth',
    oauthEyebrow: '§ OAuth flow',
    oauthTitle: 'OAuth 2.1 with PKCE S256.',
    oauthSub: 'Implemented via @cloudflare/workers-oauth-provider with KV storage for clients, codes, access tokens, and refresh tokens. Secrets stored as hashes, never as plain values.',
    listedEyebrow: '§ Listed at',
    listedTitle: 'Four MCP directories, one public PR.',
    tiersEyebrow: '§ Tiers',
    tiersTitle: 'Free Llama. Pro Plus Sonnet 4.5.',
    tiersBody:
      'The anonymous endpoint and the OAuth endpoint both use Llama 3.3 70B via Cloudflare Workers AI for Free and Pro. The Pro Plus tier (€19/month or €99 lifetime founder) switches the engine to Claude Sonnet 4.5 via Cloudflare AI Gateway — higher reasoning quality on dense summaries and multilingual comprehension.',
    tiersFounderLink: 'Founder Deal: €99 once, lifetime Pro Plus',
    sampleCta: 'See a sample pack first →',
    backCta: 'Back to VozClara',
  };
}
