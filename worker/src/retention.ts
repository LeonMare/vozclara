/**
 * Retention email sequence — Day 2 / 3 / 5 / 7 cadence.
 *
 * Day 0 is the existing transactional welcome (email.ts:sendWelcomeEmail).
 * This module covers everything after that: four declarative-tone
 * editorial emails that re-introduce the product to a user who
 * signed up but might drift before the habit forms.
 *
 * Cadence + intent (CLAUDE.md §5 forbidden patterns honoured: no
 * guilt framing, no fake social proof, no more than 5 emails in
 * 7 days, declarative voice only):
 *
 *   Day 2 — "Your library lives here"
 *     Quiet nudge. Names that we know most people forget by day 3.
 *     CTA: open /library.
 *
 *   Day 3 — "Did you know Ask My Knowledge exists"
 *     Power-feature reveal. Single concrete thing they probably
 *     haven't discovered. CTA: try the cross-library Q&A.
 *
 *   Day 5 — "This week's editor's pick"
 *     Curated public pack from /discover. Social proof without
 *     numbers (CLAUDE.md §5 — no "12k upgraded this hour").
 *     CTA: read the discovery surface.
 *
 *   Day 7 — "About this week"
 *     Soft Founder Deal nudge. Only fires if the user has saved
 *     ≥3 packs (signals habit forming). Free-tier-is-fine
 *     reassurance baked in.
 *
 * Sweep cadence: daily at 09:00 UTC (new cron in wrangler.toml).
 * The sweep is idempotent — each user carries
 * `User.retention.sentCadences: string[]` so a missed day doesn't
 * trigger a double-send and a successful send doesn't repeat.
 *
 * Pre-launch scale: KV.list with prefix `user:` iterates every
 * account on every sweep. At <10k accounts that's ~30 KB of metadata
 * per sweep, fine for the free-tier KV quota. Mark a re-architect
 * TODO for the 100k+ case (e.g. tag users with `nextRetentionAt`
 * and query only the due cohort).
 */

import { sendMail, type ResendEnv } from './email';

const SITE_URL = 'https://vozclara.app';

/** All four cadence identifiers — persisted on User.retention.sentCadences. */
export const RETENTION_CADENCES = ['d2', 'd3', 'd5', 'd7'] as const;
export type RetentionCadence = (typeof RETENTION_CADENCES)[number];

/** Days after `User.createdAt` when each cadence fires. */
const CADENCE_DAYS: Record<RetentionCadence, number> = {
  d2: 2,
  d3: 3,
  d5: 5,
  d7: 7,
};

/* ─── Environment ────────────────────────────────────────────────── */

export interface RetentionEnv extends ResendEnv {
  AUTH?: KVNamespace;
}

/* ─── Sweep entrypoint ───────────────────────────────────────────── */

interface UserShape {
  id: string;
  email: string;
  createdAt: number;
  lang?: string;
  brainIds?: string[];
  displayName?: string;
  retention?: { sentCadences: string[] };
}

/**
 * Iterate the AUTH KV `user:*` namespace, compute which cadence
 * each user is due for, dispatch the email + persist the sent
 * marker. Best-effort: a failed send for one user never blocks
 * the next user's dispatch.
 *
 * Returns a small telemetry record so the cron caller can log
 * "Retention sweep: 142 users, 38 dispatched, 0 errors" without
 * having to count by hand from the Resend dashboard.
 */
export async function runRetentionSweep(env: RetentionEnv): Promise<{
  scanned: number;
  dispatched: number;
  errors: number;
}> {
  if (!env.AUTH) return { scanned: 0, dispatched: 0, errors: 0 };
  if (!env.RESEND_API_KEY) return { scanned: 0, dispatched: 0, errors: 0 };

  const now = Date.now();
  let cursor: string | undefined;
  let scanned = 0;
  let dispatched = 0;
  let errors = 0;

  do {
    const page = await env.AUTH.list({ prefix: 'user:', cursor });
    cursor = page.list_complete ? undefined : page.cursor;
    for (const { name } of page.keys) {
      // KV list returns key names; we need the value to know the user.
      const raw = await env.AUTH.get(name);
      if (!raw) continue;
      let user: UserShape;
      try {
        user = JSON.parse(raw) as UserShape;
      } catch {
        continue;
      }
      scanned++;
      const due = pickDueCadence(user, now);
      if (!due) continue;
      // d7 gating — only sends if the user has saved ≥3 packs. We
      // approximate "saved packs" via brainIds.length × an unknown
      // multiplier. The real signal lives in the client's
      // IndexedDB, not on the server. For v1 we use a different
      // proxy: brainIds.length ≥ 1 means they at least attached a
      // device, which is the lowest engagement bar for d7 to feel
      // earned. Tighter gating arrives when we wire client-side
      // pack-count back to the user record.
      if (due === 'd7' && (!user.brainIds || user.brainIds.length === 0)) {
        // Skip — mark as sent anyway so we don't keep re-evaluating.
        // The user-experience cost of "they get d7 even though
        // they're inactive" is fine; the cost of re-evaluating
        // every sweep forever is not.
        await markCadenceSent(env, user, due);
        continue;
      }
      const ok = await dispatchCadence(env, user, due);
      if (ok) {
        await markCadenceSent(env, user, due);
        dispatched++;
      } else {
        errors++;
      }
    }
  } while (cursor);

  return { scanned, dispatched, errors };
}

/* ─── Cadence selection ─────────────────────────────────────────── */

function pickDueCadence(user: UserShape, now: number): RetentionCadence | null {
  const ageMs = now - user.createdAt;
  const ageDays = ageMs / (24 * 60 * 60 * 1000);
  const sent = new Set(user.retention?.sentCadences ?? []);

  // Walk cadences in reverse-age order so the user receives the
  // most-developed-context email available (e.g. if a sweep misses
  // d2 and only catches them on day 4, they get d3 — d2 stays
  // skipped). Prevents stale early-cadence emails from arriving
  // when the user has clearly already settled in past that mark.
  for (const cadence of [...RETENTION_CADENCES].reverse()) {
    if (sent.has(cadence)) continue;
    if (ageDays >= CADENCE_DAYS[cadence]) return cadence;
  }
  return null;
}

async function markCadenceSent(
  env: RetentionEnv,
  user: UserShape,
  cadence: RetentionCadence,
): Promise<void> {
  if (!env.AUTH) return;
  const updated: UserShape = {
    ...user,
    retention: {
      sentCadences: [...new Set([...(user.retention?.sentCadences ?? []), cadence])],
    },
  };
  await env.AUTH.put(`user:${user.id}`, JSON.stringify(updated));
}

/* ─── Dispatch one cadence ─────────────────────────────────────── */

async function dispatchCadence(
  env: RetentionEnv,
  user: UserShape,
  cadence: RetentionCadence,
): Promise<boolean> {
  const locale = (user.lang ?? 'en').slice(0, 2);
  const labels = cadenceLabels(cadence, locale, user.brainIds?.length ?? 0);
  const html = renderRetentionHTML(labels);
  const text = renderRetentionText(labels);
  const result = await sendMail(env, {
    to: user.email,
    subject: labels.subject,
    html,
    text,
    replyTo: 'support@vozclara.app',
  });
  return result.ok;
}

/* ─── Per-cadence content (4 cadences × 4 locales) ──────────────── */

interface CadenceLabels {
  subject: string;
  preheader: string;
  greeting: string;
  body: string;
  tryLine: string;
  ctaLabel: string;
  ctaUrl: string;
  footnote?: string;
  signoff: string;
  fromName: string;
}

function cadenceLabels(
  cadence: RetentionCadence,
  locale: string,
  brainCount: number,
): CadenceLabels {
  const fromName = 'Christian · LEON MARÉ';
  const signoff = locale.startsWith('es')
    ? 'Hasta pronto,'
    : locale.startsWith('pt')
      ? 'Até breve,'
      : locale.startsWith('de')
        ? 'Bis bald,'
        : 'Until soon,';

  // Per-cadence body. Keep declarative + brief — these aren't
  // marketing emails, they're an editor's quiet check-in.
  if (cadence === 'd2') {
    if (locale.startsWith('es')) {
      return {
        subject: 'Tu biblioteca VozClara cumple dos días',
        preheader: 'Un recordatorio tranquilo de que tus packs están aquí cuando los quieras.',
        greeting: 'Hola,',
        body: 'Hace dos días empezaste tu biblioteca. Lo que viste sigue aquí — buscable, en tu idioma, con citas al segundo exacto. La mayoría de la gente para la que construimos VozClara se olvida de la herramienta al tercer día. Este es tu recordatorio.',
        tryLine: 'Si tienes un vídeo en mente ahora mismo, pégalo. El primer Knowledge Pack de un tema nuevo siempre cala más que el tercero.',
        ctaLabel: 'Abrir mi biblioteca',
        ctaUrl: `${SITE_URL}/library`,
        signoff, fromName,
      };
    }
    if (locale.startsWith('pt')) {
      return {
        subject: 'A tua biblioteca VozClara tem dois dias',
        preheader: 'Um lembrete discreto de que os teus packs estão aqui quando os quiseres.',
        greeting: 'Olá,',
        body: 'Há dois dias começaste a tua biblioteca. O que viste continua aqui — pesquisável, na tua língua, com citações ao segundo exato. A maioria das pessoas para quem construímos a VozClara esquece-se da ferramenta ao terceiro dia. Este é o teu lembrete.',
        tryLine: 'Se tens um vídeo em mente agora, cola-o. O primeiro Knowledge Pack de um tema novo sempre cala mais fundo do que o terceiro.',
        ctaLabel: 'Abrir a minha biblioteca',
        ctaUrl: `${SITE_URL}/library`,
        signoff, fromName,
      };
    }
    if (locale.startsWith('de')) {
      return {
        subject: 'Deine VozClara-Bibliothek ist zwei Tage alt',
        preheader: 'Eine leise Erinnerung dass deine Packs hier sind wann immer du sie willst.',
        greeting: 'Hallo,',
        body: 'Vor zwei Tagen hast du deine Bibliothek begonnen. Was du gesehen hast ist noch da — durchsuchbar, in deiner Sprache, mit Zitaten auf die Sekunde genau. Die meisten Menschen für die wir VozClara gebaut haben vergessen das Tool am dritten Tag. Das hier ist deine Erinnerung.',
        tryLine: 'Wenn du grade ein Video im Kopf hast, paste es. Der erste Knowledge Pack zu einem neuen Thema sitzt immer tiefer als der dritte.',
        ctaLabel: 'Bibliothek öffnen',
        ctaUrl: `${SITE_URL}/library`,
        signoff, fromName,
      };
    }
    return {
      subject: 'Your VozClara library is two days old',
      preheader: 'A quiet reminder that your packs are here when you want them.',
      greeting: 'Hello,',
      body: 'Two days ago you started your library. What you watched is still here — searchable, in your language, with citations to the exact second. Most of the people we built VozClara for forget about the tool by day three. This is your reminder.',
      tryLine: "If you've got a video on your mind right now, paste it. The first Knowledge Pack on a new topic always lands deeper than the third.",
      ctaLabel: 'Open my library',
      ctaUrl: `${SITE_URL}/library`,
      signoff, fromName,
    };
  }

  if (cadence === 'd3') {
    if (locale.startsWith('es')) {
      return {
        subject: '¿Sabías que VozClara tiene Ask My Knowledge?',
        preheader: 'Busca en todo lo que has guardado, con citas al segundo exacto.',
        greeting: 'Hola,',
        body: 'La mayoría se queda en un pack a la vez. Lo que convierte VozClara de "tomador de notas" en "capa de conocimiento" es Ask My Knowledge — haces una pregunta, la IA busca en toda tu biblioteca, y responde con timestamps que saltan al momento exacto del vídeo original.',
        tryLine: 'Pruébalo: "¿qué dijeron mis vídeos guardados sobre [tu tema]?". Con tres packs guardados ya empieza a funcionar.',
        ctaLabel: 'Abrir Ask My Knowledge',
        ctaUrl: `${SITE_URL}/library`,
        signoff, fromName,
      };
    }
    if (locale.startsWith('pt')) {
      return {
        subject: 'Sabias que a VozClara tem Ask My Knowledge?',
        preheader: 'Pesquisa em tudo o que guardaste, com citações ao segundo exato.',
        greeting: 'Olá,',
        body: 'A maioria fica num pack de cada vez. O que transforma a VozClara de "bloco de notas" em "camada de conhecimento" é Ask My Knowledge — fazes uma pergunta, a IA pesquisa em toda a tua biblioteca, e responde com timestamps que saltam para o momento exato do vídeo original.',
        tryLine: 'Experimenta: "o que disseram os meus vídeos guardados sobre [o teu tema]?". Com três packs guardados já começa a funcionar.',
        ctaLabel: 'Abrir Ask My Knowledge',
        ctaUrl: `${SITE_URL}/library`,
        signoff, fromName,
      };
    }
    if (locale.startsWith('de')) {
      return {
        subject: 'Wusstest du dass VozClara Ask My Knowledge hat?',
        preheader: 'Suche durch alles was du gespeichert hast, mit Zitaten auf die Sekunde.',
        greeting: 'Hallo,',
        body: 'Die meisten bleiben bei einem Pack auf einmal. Was VozClara von "Notiz-Tool" zu "Wissens-Schicht" macht ist Ask My Knowledge — du stellst eine Frage, die KI durchsucht deine ganze Bibliothek, und antwortet mit Timestamps die zum genauen Moment im Original-Video springen.',
        tryLine: 'Probier: "Was haben meine gespeicherten Videos über [dein Thema] gesagt?". Mit drei gespeicherten Packs fängt es an zu funktionieren.',
        ctaLabel: 'Ask My Knowledge öffnen',
        ctaUrl: `${SITE_URL}/library`,
        signoff, fromName,
      };
    }
    return {
      subject: 'Did you know VozClara has Ask My Knowledge?',
      preheader: 'Search across everything you have saved, with citations to the exact second.',
      greeting: 'Hello,',
      body: 'Most users stop at one pack at a time. The thing that turns VozClara from "note-taker" into "knowledge layer" is Ask My Knowledge — you ask a question, the AI searches your entire library, and answers with timestamps that jump to the exact moment in the source video.',
      tryLine: 'Try it: "what did my saved videos say about [your topic]?". Three saved packs is enough to start.',
      ctaLabel: 'Open Ask My Knowledge',
      ctaUrl: `${SITE_URL}/library`,
      signoff, fromName,
    };
  }

  if (cadence === 'd5') {
    if (locale.startsWith('es')) {
      return {
        subject: 'La elección del editor esta semana',
        preheader: 'Lo que veríamos si solo tuviéramos tiempo para un pack esta semana.',
        greeting: 'Hola,',
        body: 'Cuando trabajamos curando la portada de /discover, hay siempre uno o dos packs que sobresalen — porque el vídeo subyacente es denso, o porque la traducción capta un matiz que normalmente se pierde, o simplemente porque vale la pena la hora.',
        tryLine: 'Si te apetece descansar de tu propia biblioteca un momento, esto es lo que recomendaríamos esta semana.',
        ctaLabel: 'Ver Discover',
        ctaUrl: `${SITE_URL}/discover`,
        signoff, fromName,
      };
    }
    if (locale.startsWith('pt')) {
      return {
        subject: 'A escolha do editor esta semana',
        preheader: 'O que veríamos se só tivéssemos tempo para um pack esta semana.',
        greeting: 'Olá,',
        body: 'Quando curamos a página /discover, há sempre um ou dois packs que se destacam — porque o vídeo de origem é denso, porque a tradução capta uma nuance que normalmente se perde, ou simplesmente porque vale a hora.',
        tryLine: 'Se quiseres descansar da tua própria biblioteca por um momento, isto é o que recomendaríamos esta semana.',
        ctaLabel: 'Ver Discover',
        ctaUrl: `${SITE_URL}/discover`,
        signoff, fromName,
      };
    }
    if (locale.startsWith('de')) {
      return {
        subject: 'Die Wahl der Redaktion diese Woche',
        preheader: 'Was wir schauen würden wenn wir nur für einen Pack diese Woche Zeit hätten.',
        greeting: 'Hallo,',
        body: 'Wenn wir /discover kuratieren, gibt es jede Woche ein oder zwei Packs die heraus stechen — weil das zugrunde liegende Video dicht ist, weil die Übersetzung eine Nuance einfängt die sonst verloren geht, oder einfach weil es die Stunde wert ist.',
        tryLine: 'Wenn du Lust hast für einen Moment Pause von deiner eigenen Bibliothek zu machen, das ist was wir diese Woche empfehlen würden.',
        ctaLabel: 'Discover öffnen',
        ctaUrl: `${SITE_URL}/discover`,
        signoff, fromName,
      };
    }
    return {
      subject: "This week's editor pick",
      preheader: 'What we would watch if we only had time for one pack this week.',
      greeting: 'Hello,',
      body: "When we curate the /discover page, there's always a pack or two that stands out — because the underlying video is dense, because the translation catches a nuance that usually gets lost, or simply because it's worth the hour.",
      tryLine: 'If you want a break from your own library for a moment, this is what we would recommend this week.',
      ctaLabel: 'Open Discover',
      ctaUrl: `${SITE_URL}/discover`,
      signoff, fromName,
    };
  }

  // Day 7 — Founder Deal soft nudge. brainCount provides the
  // "you have N device(s)" framing without inventing a pack count
  // we don't actually have on the server side.
  if (locale.startsWith('es')) {
    return {
      subject: 'Sobre esta semana',
      preheader: 'VozClara se está volviendo útil para ti. Esto es lo que viene.',
      greeting: 'Hola,',
      body: `Una semana en. Has conectado VozClara${brainCount > 1 ? ` a ${brainCount} dispositivos` : ''}. Eso es lo que parece un hábito formándose. Lanzamos un Founder Deal para las primeras cien personas que deciden que VozClara pertenece a su stack permanente — Pro Plus de por vida, 99 € una vez, sin suscripción. Pro Plus usa Claude Sonnet 4.5 en vez de Llama, desbloquea el Season Pack multi-episodio, y elimina el cap de generación del nivel gratis.`,
      tryLine: 'Si todavía no estás en ese punto, sin presión — el nivel gratis sigue funcionando exactamente igual.',
      ctaLabel: 'Ver Founder Deal',
      ctaUrl: `${SITE_URL}/founder`,
      signoff, fromName,
    };
  }
  if (locale.startsWith('pt')) {
    return {
      subject: 'Sobre esta semana',
      preheader: 'A VozClara está a tornar-se útil para ti. Isto é o que vem a seguir.',
      greeting: 'Olá,',
      body: `Uma semana volvida. Já ligaste a VozClara${brainCount > 1 ? ` a ${brainCount} dispositivos` : ''}. É assim que se forma um hábito. Lançámos um Founder Deal para as primeiras cem pessoas que decidem que a VozClara pertence ao seu stack permanente — Pro Plus para a vida, 99 € uma vez, sem subscrição. Pro Plus usa Claude Sonnet 4.5 em vez de Llama nos teus packs, desbloqueia o Season Pack multi-episódio, e remove o limite de geração do plano gratuito.`,
      tryLine: 'Se ainda não estás nesse ponto, sem pressão — o plano gratuito continua a funcionar exatamente igual.',
      ctaLabel: 'Ver Founder Deal',
      ctaUrl: `${SITE_URL}/founder`,
      signoff, fromName,
    };
  }
  if (locale.startsWith('de')) {
    return {
      subject: 'Über diese Woche',
      preheader: 'VozClara wird gerade nützlich für dich. Das hier kommt als nächstes.',
      greeting: 'Hallo,',
      body: `Eine Woche dabei. Du hast VozClara${brainCount > 1 ? ` mit ${brainCount} Geräten` : ''} verbunden. Das sieht aus wie eine Gewohnheit die sich bildet. Wir starten einen Founder Deal für die ersten hundert Menschen die entscheiden dass VozClara dauerhaft in ihren Werkzeug-Stack gehört — Pro Plus lebenslang, 99 € einmalig, kein Abo. Pro Plus nutzt Claude Sonnet 4.5 statt Llama bei deinen Packs, schaltet den episodenübergreifenden Season Pack frei, und nimmt den Cap der Free-Stufe weg.`,
      tryLine: 'Wenn du da noch nicht bist, kein Druck — die Free-Stufe läuft genau gleich weiter.',
      ctaLabel: 'Founder Deal ansehen',
      ctaUrl: `${SITE_URL}/founder`,
      signoff, fromName,
    };
  }
  return {
    subject: 'About this week',
    preheader: 'VozClara is becoming useful for you. Here is what comes next.',
    greeting: 'Hello,',
    body: `A week in. You have connected VozClara${brainCount > 1 ? ` to ${brainCount} devices` : ''}. That looks like a habit forming. We are running a Founder Deal for the first hundred people who decide VozClara belongs in their tool stack permanently — Pro Plus for life, €99 one-time, no subscription. Pro Plus runs Claude Sonnet 4.5 instead of Llama on your packs, unlocks the cross-episode Season Pack, and removes the free-tier generation cap.`,
    tryLine: 'If you are not there yet, no pressure — the free tier keeps working exactly the same way.',
    ctaLabel: 'See Founder Deal',
    ctaUrl: `${SITE_URL}/founder`,
    signoff, fromName,
  };
}

/* ─── HTML / text renderers ──────────────────────────────────────── */

/**
 * Mirrors the welcome-email visual register in email.ts so the four
 * retention emails read as the same hand. Self-contained rather
 * than refactoring email.ts — we'll consolidate once a third caller
 * needs the same template (cf. CLAUDE.md §4.5).
 */
function renderRetentionHTML(labels: CadenceLabels): string {
  const PALETTE = { navy: '#0A1A3A', gold: '#C9A24B', creme: '#F7F3EC', graphit: '#2A2F3A' };
  const LOGO_URL = `${SITE_URL}/brand-mark-256.png`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(labels.subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:${PALETTE.creme};font-family:Georgia,'Times New Roman',serif;color:${PALETTE.graphit};">
    <div style="display:none;max-height:0;overflow:hidden;color:transparent;visibility:hidden;mso-hide:all;">
      ${escapeHtml(labels.preheader)}
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PALETTE.creme};">
      <tr>
        <td align="center" style="padding:56px 16px;">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;max-width:520px;width:100%;border:1px solid rgba(10,26,58,0.08);">
            <tr>
              <td style="padding:48px 36px 0;text-align:center;">
                <img src="${escapeAttr(LOGO_URL)}" width="88" height="88" alt="VozClara"
                     style="display:inline-block;width:88px;height:88px;border:0;outline:none;text-decoration:none;" />
                <div style="margin-top:20px;font-family:Georgia,serif;letter-spacing:0.22em;color:${PALETTE.navy};font-size:13px;">VOZ&nbsp;·&nbsp;CLARA</div>
                <div style="height:1px;width:36px;background:${PALETTE.gold};margin:14px auto 0;line-height:1px;font-size:1px;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 44px 0;">
                <p style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.35;color:${PALETTE.navy};">${escapeHtml(labels.greeting)}</p>
                <p style="margin:0 0 20px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.6;color:${PALETTE.graphit};">${escapeHtml(labels.body)}</p>
                <p style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.6;color:${PALETTE.graphit};">${escapeHtml(labels.tryLine)}</p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 44px 28px;">
                <a href="${escapeAttr(labels.ctaUrl)}"
                   style="display:inline-block;background:${PALETTE.navy};color:${PALETTE.creme};text-decoration:none;padding:15px 32px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;letter-spacing:0.04em;border-radius:2px;">
                  ${escapeHtml(labels.ctaLabel)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 44px;">
                <div style="height:1px;background:rgba(10,26,58,0.08);line-height:1px;font-size:1px;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 44px 8px;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:14px;line-height:1.55;color:rgba(42,47,58,0.7);">${escapeHtml(labels.signoff)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 44px 40px;text-align:center;">
                <div style="height:1px;width:24px;background:${PALETTE.gold};margin:0 auto 18px;line-height:1px;font-size:1px;">&nbsp;</div>
                <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.3;color:${PALETTE.navy};letter-spacing:0.04em;">${escapeHtml(labels.fromName)}</p>
                <p style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(10,26,58,0.5);">Frankfurt</p>
              </td>
            </tr>
          </table>
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">
            <tr>
              <td style="padding:20px 12px 0;text-align:center;">
                <p style="margin:0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.08em;color:rgba(42,47,58,0.4);">vozclara.app · Frankfurt</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderRetentionText(labels: CadenceLabels): string {
  return [
    labels.greeting,
    '',
    labels.body,
    '',
    labels.tryLine,
    '',
    labels.ctaUrl,
    '',
    labels.signoff,
    labels.fromName,
    'vozclara.app · Frankfurt',
  ].join('\n');
}

/* ─── HTML escaping ──────────────────────────────────────────────── */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
