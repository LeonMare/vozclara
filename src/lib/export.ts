/**
 * Pack export — Markdown / plain text serialisation + browser download.
 *
 * Exports the active language view of a pack so the file reflects
 * whatever the user is currently reading. Everything stays client-side:
 * we read from IndexedDB, render in-memory, and either trigger a Blob
 * download or write to the system clipboard.
 *
 * Format choice rationale
 *  • Markdown is the universal "knowledge worker" interchange (Obsidian,
 *    Notion, Bear, Logseq, GitHub issues, Slack with rendering, …).
 *    A pack exports as a single self-contained .md file.
 *  • Plain text is the lowest-common-denominator option — Notes apps,
 *    email bodies, terminals. Same structure, no `#`/`>`/`-` syntax.
 */

import { activeView, type KnowledgePack } from './pack';
import { SITE_URL } from './site';

export type ExportFormat = 'markdown' | 'text';

/**
 * Build a YouTube deep-link that opens the source video at a given
 * second. Used by the Obsidian export so every [mm:ss] citation in
 * the vault is one click from the exact source moment — the same
 * click-to-seek promise the in-app citation chips make, preserved
 * after the pack leaves vozclara.app.
 */
function youtubeTimestampUrl(videoId: string, seconds: number): string {
  return `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(seconds)}s`;
}

/** Escape a string for safe use as a double-quoted YAML scalar. */
function yamlString(s: string): string {
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Serialise a pack as Obsidian-flavoured Markdown.
 *
 * Differs from packToMarkdown in three Obsidian-native ways:
 *   1. YAML frontmatter — title, source, channel, pack_id, language,
 *      mode, genre, created, difficulty, tags, aliases. Obsidian reads
 *      these as note Properties + Dataview can query them.
 *   2. Timestamps as clickable YouTube deep-links (?t=Ns) — every
 *      chapter / quote / key-idea citation stays click-to-seek inside
 *      the vault, not a dead [mm:ss] string.
 *   3. Obsidian callout for the summary (> [!quote]) + a Dataview-
 *      friendly vocabulary table.
 *
 * Why a separate exporter: the strategic read (Obsidian is a
 * destination vault, not a competitor — the user already pipes Claude
 * output into it) means meeting that workflow with a first-class
 * "lands cleanly in your vault" artefact, rather than a generic .md.
 */
export function packToObsidianMarkdown(pack: KnowledgePack): string {
  const view = activeView(pack);
  const date = new Date(pack.createdAt).toISOString().split('T')[0];
  const vid = pack.source.videoId;
  const tsLink = (sec: number) => `[${formatTime(sec)}](${youtubeTimestampUrl(vid, sec)})`;

  const out: string[] = [];

  // ── YAML frontmatter ───────────────────────────────────────────
  out.push('---');
  out.push(`title: ${yamlString(pack.title)}`);
  out.push(`source: ${pack.source.url}`);
  if (pack.source.channel) out.push(`channel: ${yamlString(pack.source.channel)}`);
  out.push(`videoId: ${vid}`);
  out.push(`pack_id: ${pack.id}`);
  out.push(`language: ${pack.outputLang}`);
  out.push(`source_language: ${pack.sourceLang}`);
  out.push(`mode: ${pack.mode}`);
  out.push(`genre: ${pack.genre}`);
  out.push(`created: ${date}`);
  if (pack.difficulty) out.push(`difficulty: ${pack.difficulty}`);
  out.push('tags:');
  out.push('  - vozclara');
  out.push('  - knowledge-pack');
  out.push(`  - ${slugify(pack.genre)}`);
  out.push('aliases:');
  out.push(`  - ${yamlString(pack.title)}`);
  out.push('generator: VozClara');
  out.push(`url: ${SITE_URL}`);
  out.push('---');
  out.push('');

  // ── Title + summary callout ────────────────────────────────────
  out.push(`# ${pack.title}`);
  out.push('');
  out.push(`> [!quote] ${view.tldr ?? view.summary.short}`);
  if (view.tldr && view.summary.short && view.tldr !== view.summary.short) {
    out.push(`> ${view.summary.short}`);
  }
  out.push('');
  out.push(`**Source:** [${pack.source.channel ? pack.source.channel + ' — ' : ''}YouTube](${pack.source.url})  ·  **${pack.sourceLang.toUpperCase()} → ${pack.outputLang.toUpperCase()}**  ·  **Mode:** ${pack.mode}  ·  **Genre:** ${pack.genre}`);
  out.push('');
  out.push('---');
  out.push('');

  if (view.summary.long) {
    out.push('## Summary');
    out.push('');
    out.push(view.summary.long);
    out.push('');
  }

  if (view.keyIdeas.length > 0) {
    out.push('## Key Ideas');
    out.push('');
    view.keyIdeas.forEach((idea, i) => {
      const cite = idea.timestampSec != null ? `  ${tsLink(idea.timestampSec)}` : '';
      out.push(`### ${String(i + 1).padStart(2, '0')}. ${idea.title}${cite}`);
      out.push('');
      out.push(idea.body);
      out.push('');
    });
  }

  if (view.chapters.length > 0) {
    out.push('## Chapters');
    out.push('');
    view.chapters.forEach((ch) => {
      out.push(`- ${tsLink(ch.startSec)} — **${ch.title}**: ${ch.summary}`);
    });
    out.push('');
  }

  if (view.actionPlan.length > 0) {
    out.push('## Action Plan');
    out.push('');
    view.actionPlan.forEach((step) => {
      out.push(`- [ ] ${step}`);
    });
    out.push('');
  }

  if (view.vocabulary.length > 0) {
    // Dataview-friendly table — Obsidian users can query/sort these.
    out.push('## Vocabulary');
    out.push('');
    out.push('| Term | Translation | Part of speech |');
    out.push('| --- | --- | --- |');
    view.vocabulary.forEach((v) => {
      const term = v.word.replace(/\|/g, '\\|');
      const tr = v.translation.replace(/\|/g, '\\|');
      const pos = (v.partOfSpeech ?? '').replace(/\|/g, '\\|');
      out.push(`| ${term} | ${tr} | ${pos} |`);
    });
    out.push('');
  }

  if (view.quiz.length > 0) {
    // Quiz as collapsible Obsidian callouts so answers hide until expanded.
    out.push('## Quiz');
    out.push('');
    view.quiz.forEach((q, i) => {
      out.push(`> [!question]- Q${i + 1}: ${q.question}`);
      out.push(`> ${q.answer}`);
      if (q.explanation) {
        out.push('>');
        out.push(`> *${q.explanation}*`);
      }
      out.push('');
    });
  }

  if (view.keyQuotes.length > 0) {
    out.push('## Quotes');
    out.push('');
    view.keyQuotes.forEach((q) => {
      out.push(`> "${q.text}"`);
      const meta: string[] = [];
      if (q.speaker) meta.push(q.speaker);
      if (q.timestampSec) meta.push(tsLink(q.timestampSec));
      if (meta.length > 0) out.push(`> — ${meta.join(' · ')}`);
      if (q.original && q.original !== q.text) {
        out.push(`> _${q.original}_`);
      }
      out.push('');
    });
  }

  out.push('---');
  out.push('');
  out.push(`> [!info] AI-generated Knowledge Pack · [VozClara](${SITE_URL}) · ${date}`);
  out.push('> Generated with Llama 3.3 70B (Free / Pro) or Claude Sonnet 4.5 (Pro Plus). Outputs may be wrong, miss nuance, or carry bias — verify before relying on this content. Watermark per EU AI Act Art. 50(2).');

  return out.join('\n');
}

export function packToMarkdown(pack: KnowledgePack): string {
  const view = activeView(pack);
  const date = new Date(pack.createdAt).toISOString().split('T')[0];
  const langChips = pack.outputLanguages.map((l) => l.toUpperCase()).join(' · ');

  const out: string[] = [];

  out.push(`# ${pack.title}`);
  out.push('');
  out.push(`> ${view.summary.short}`);
  out.push('');
  out.push(`**Mode:** ${pack.mode}  · **Source language:** ${pack.sourceLang.toUpperCase()}  · **Translations:** ${langChips}  · **Genre:** ${pack.genre}`);
  out.push('');
  out.push(`**Source:** [${pack.source.url}](${pack.source.url})`);
  out.push('');
  out.push('---');
  out.push('');

  if (view.summary.long) {
    out.push('## Summary');
    out.push('');
    out.push(view.summary.long);
    out.push('');
  }

  if (view.keyIdeas.length > 0) {
    out.push('## Key Ideas');
    out.push('');
    view.keyIdeas.forEach((idea, i) => {
      out.push(`### ${String(i + 1).padStart(2, '0')}. ${idea.title}`);
      out.push('');
      out.push(idea.body);
      out.push('');
    });
  }

  if (view.chapters.length > 0) {
    out.push('## Chapters');
    out.push('');
    view.chapters.forEach((ch) => {
      out.push(`- **${formatTime(ch.startSec)}** — ${ch.title}: ${ch.summary}`);
    });
    out.push('');
  }

  if (view.actionPlan.length > 0) {
    out.push('## Action Plan');
    out.push('');
    view.actionPlan.forEach((step, i) => {
      out.push(`${i + 1}. ${step}`);
    });
    out.push('');
  }

  if (view.vocabulary.length > 0) {
    out.push('## Vocabulary');
    out.push('');
    view.vocabulary.forEach((v) => {
      const pos = v.partOfSpeech ? ` *(${v.partOfSpeech})*` : '';
      out.push(`- **${v.word}**${pos} → ${v.translation}`);
      if (v.context) out.push(`  > ${v.context}`);
    });
    out.push('');
  }

  if (view.quiz.length > 0) {
    out.push('## Quiz');
    out.push('');
    view.quiz.forEach((q, i) => {
      out.push(`### Question ${i + 1}`);
      out.push('');
      out.push(`**Q:** ${q.question}`);
      out.push('');
      out.push(`**A:** ${q.answer}`);
      if (q.explanation) {
        out.push('');
        out.push(`*${q.explanation}*`);
      }
      out.push('');
    });
  }

  if (view.keyQuotes.length > 0) {
    out.push('## Quotes');
    out.push('');
    view.keyQuotes.forEach((q) => {
      out.push(`> "${q.text}"`);
      const meta: string[] = [];
      if (q.speaker) meta.push(q.speaker);
      if (q.timestampSec) meta.push(formatTime(q.timestampSec));
      if (meta.length > 0) out.push(`> — ${meta.join(' · ')}`);
      if (q.original && q.original !== q.text) {
        out.push(`> _${q.original}_`);
      }
      out.push('');
    });
  }

  if (view.socialAngles.length > 0) {
    out.push('## Social Angles');
    out.push('');
    view.socialAngles.forEach((s, i) => {
      out.push(`### Angle ${i + 1}`);
      out.push('');
      out.push(`**Hook:** "${s.hook}"`);
      out.push('');
      out.push(s.caption);
      out.push('');
    });
  }

  out.push('---');
  out.push('');
  out.push(`*AI-generated Knowledge Pack · VozClara · ${date}*`);
  out.push('*Generated with Llama 3.3 70B (free / Pro) or Claude Sonnet 4.5 (Pro Plus). Outputs may be wrong, miss nuance, or carry bias — verify before relying on this content. Each Pack carries this watermark to satisfy EU AI Act Art. 50(2).*');
  out.push(`*A LEON MARÉ product · ${SITE_URL}*`);

  return out.join('\n');
}

export function packToText(pack: KnowledgePack): string {
  // Strip markdown decoration: ``` ` _ * # > [ ] etc.
  // The structure (headings, indentation, separators) stays.
  const view = activeView(pack);
  const date = new Date(pack.createdAt).toISOString().split('T')[0];
  const langChips = pack.outputLanguages.map((l) => l.toUpperCase()).join(' · ');
  const RULE = '─'.repeat(64);

  const out: string[] = [];

  out.push(pack.title.toUpperCase());
  out.push(RULE);
  out.push('');
  out.push(view.summary.short);
  out.push('');
  out.push(`Mode: ${pack.mode}   Source: ${pack.sourceLang.toUpperCase()}   Translations: ${langChips}`);
  out.push(`Genre: ${pack.genre}`);
  out.push(`Source URL: ${pack.source.url}`);
  out.push('');
  out.push(RULE);

  if (view.summary.long) {
    out.push('');
    out.push('SUMMARY');
    out.push('');
    out.push(view.summary.long);
  }

  if (view.keyIdeas.length > 0) {
    out.push('');
    out.push(RULE);
    out.push('');
    out.push('KEY IDEAS');
    view.keyIdeas.forEach((idea, i) => {
      out.push('');
      out.push(`  ${String(i + 1).padStart(2, '0')}. ${idea.title}`);
      out.push('');
      out.push(wrapText(idea.body, '      '));
    });
  }

  if (view.chapters.length > 0) {
    out.push('');
    out.push(RULE);
    out.push('');
    out.push('CHAPTERS');
    out.push('');
    view.chapters.forEach((ch) => {
      out.push(`  [${formatTime(ch.startSec)}]  ${ch.title} — ${ch.summary}`);
    });
  }

  if (view.actionPlan.length > 0) {
    out.push('');
    out.push(RULE);
    out.push('');
    out.push('ACTION PLAN');
    out.push('');
    view.actionPlan.forEach((step, i) => {
      out.push(`  ${i + 1}. ${step}`);
    });
  }

  if (view.vocabulary.length > 0) {
    out.push('');
    out.push(RULE);
    out.push('');
    out.push('VOCABULARY');
    out.push('');
    view.vocabulary.forEach((v) => {
      const pos = v.partOfSpeech ? ` (${v.partOfSpeech})` : '';
      out.push(`  ${v.word}${pos}  →  ${v.translation}`);
      if (v.context) out.push(`     "${v.context}"`);
    });
  }

  if (view.quiz.length > 0) {
    out.push('');
    out.push(RULE);
    out.push('');
    out.push('QUIZ');
    view.quiz.forEach((q, i) => {
      out.push('');
      out.push(`  Q${i + 1}: ${q.question}`);
      out.push(`  A:  ${q.answer}`);
      if (q.explanation) out.push(`      ${q.explanation}`);
    });
  }

  if (view.keyQuotes.length > 0) {
    out.push('');
    out.push(RULE);
    out.push('');
    out.push('QUOTES');
    out.push('');
    view.keyQuotes.forEach((q) => {
      out.push(`  "${q.text}"`);
      const meta: string[] = [];
      if (q.speaker) meta.push(q.speaker);
      if (q.timestampSec) meta.push(formatTime(q.timestampSec));
      if (meta.length > 0) out.push(`     — ${meta.join(' · ')}`);
      if (q.original && q.original !== q.text) out.push(`     (${q.original})`);
      out.push('');
    });
  }

  if (view.socialAngles.length > 0) {
    out.push('');
    out.push(RULE);
    out.push('');
    out.push('SOCIAL ANGLES');
    view.socialAngles.forEach((s, i) => {
      out.push('');
      out.push(`  ${i + 1}. Hook: "${s.hook}"`);
      out.push('');
      out.push(wrapText(s.caption, '     '));
    });
  }

  out.push('');
  out.push(RULE);
  out.push('');
  out.push(`AI-GENERATED KNOWLEDGE PACK · VozClara · ${date}`);
  out.push('Generated with Llama 3.3 70B (free / Pro) or Claude Sonnet 4.5');
  out.push('(Pro Plus). Outputs may be wrong, miss nuance, or carry bias —');
  out.push('verify before relying on this content. Each Pack carries this');
  out.push('watermark to satisfy EU AI Act Art. 50(2).');
  out.push(`A LEON MARÉ product · ${SITE_URL}`);

  return out.join('\n');
}

/**
 * Trigger a browser download of the given content as a file. Uses an
 * in-memory Blob URL that's revoked right after the click — no leftover
 * URLs in memory, no DOM detritus.
 */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so Safari has time to flush the navigation.
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Copy a string to the system clipboard. Returns true on success. Uses
 * the modern Async Clipboard API where available, falls back to the
 * legacy execCommand path on older browsers + iOS Safari edge cases.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Build a sensible filename for an exported pack, e.g.
 *   "tagesschau-20-00-uhr-03-05-2026-es.md"
 * Strips diacritics, lowercases, joins words with hyphens, appends the
 * active language and the requested extension.
 */
export function exportFilename(pack: KnowledgePack, ext: 'md' | 'txt'): string {
  const slug = slugify(pack.title || 'voz-clara-pack');
  return `${slug}-${pack.outputLang}.${ext}`;
}

/* ─── internals ────────────────────────────────────────────────────────── */

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function wrapText(s: string, indent: string, width = 70): string {
  // Simple word-wrapper for plain-text export so paragraphs read well
  // in fixed-width contexts (terminal, Mail.app plain text mode).
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let current = indent;
  for (const w of words) {
    if (current.length + w.length + 1 > width + indent.length) {
      lines.push(current.trimEnd());
      current = indent + w + ' ';
    } else {
      current += w + ' ';
    }
  }
  if (current.trim()) lines.push(current.trimEnd());
  return lines.join('\n');
}
