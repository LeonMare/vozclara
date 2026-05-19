/**
 * Anki .apkg export for a Knowledge Pack's vocabulary.
 *
 * Builds a deck of two-sided flashcards (target → translation AND
 * translation → target) from the active translation's VocabularyItems.
 * Output is a real .apkg file — double-clickable in Anki, no manual
 * "File → Import" dance.
 *
 * Implementation notes
 *   • An .apkg is a ZIP of a SQLite "collection.anki2" file plus a JSON
 *     media manifest. We have no media, so the manifest is "{}".
 *   • The SQLite schema is Anki 2.1's (ver=11). The minimum tables are
 *     col, notes, cards, revlog, graves plus the indexes Anki checks
 *     on import.
 *   • Heavy deps (sql.js ≈ 600 KB + WASM, jszip ≈ 30 KB gz) are
 *     dynamically imported by the only call site so they don't enter
 *     the main bundle.
 *   • The WASM lives at /sql-wasm.wasm (copied to public/ at install).
 */
import { activeView, type KnowledgePack } from './pack';

// Stable model id — the same VozClara note type across all generated
// decks so that decks merge cleanly in the user's collection.
const MODEL_ID = 1715784000000;

const LANG_NAME: Record<string, string> = {
  es: 'Spanish',
  pt: 'Portuguese',
  de: 'German',
  en: 'English',
  fr: 'French',
};

/**
 * Generate an .apkg Blob for the given pack's vocabulary. Returns null
 * if the pack has no vocabulary entries to export.
 */
export async function packToAnkiDeck(pack: KnowledgePack): Promise<Blob | null> {
  const view = activeView(pack);
  if (view.vocabulary.length === 0) return null;

  const [{ default: initSqlJs }, { default: JSZip }] = await Promise.all([
    import('sql.js'),
    import('jszip'),
  ]);

  const SQL = await initSqlJs({
    locateFile: (file) => `/${file}`,
  });

  const db = new SQL.Database();
  initSchema(db);

  const nowSec = Math.floor(Date.now() / 1000);
  const nowMs = Date.now();
  const deckId = nowMs;
  const deckName = ankiDeckName(pack);

  populateCollection(db, { nowSec, nowMs, deckId, deckName, pack });

  let nextNoteId = nowMs;
  let nextCardId = nowMs + 1;
  view.vocabulary.forEach((v, i) => {
    const word = (v.word ?? '').trim();
    const translation = (v.translation ?? '').trim();
    if (!word || !translation) return;
    const context = (v.context ?? '').trim();
    const partOfSpeech = (v.partOfSpeech ?? '').trim();

    const noteId = nextNoteId++;
    const cardForwardId = nextCardId++;
    const cardReverseId = nextCardId++;

    // Field values, joined by 0x1f (US separator) per Anki spec.
    const fields = [
      escapeHtml(word),
      escapeHtml(translation),
      context ? escapeHtml(context) : '',
      partOfSpeech ? escapeHtml(partOfSpeech) : '',
      escapeHtml(pack.title),
    ].join('\x1f');

    const sortFld = escapeHtml(word);
    const csum = fieldChecksum(word);

    db.run(
      `INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        noteId,
        guidFor(`${pack.id}:${word}:${translation}`),
        MODEL_ID,
        nowSec,
        -1,
        ' ',
        fields,
        sortFld,
        csum,
        0,
        '',
      ],
    );

    // Two cards per note: forward (ord 0) and reverse (ord 1).
    for (const [ord, cardId] of [[0, cardForwardId], [1, cardReverseId]] as const) {
      db.run(
        `INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cardId, noteId, deckId, ord, nowSec, -1, 0, 0, i + 1, 0, 0, 0, 0, 0, 0, 0, 0, ''],
      );
    }
  });

  const dbBytes = db.export();
  db.close();

  const zip = new JSZip();
  zip.file('collection.anki2', dbBytes);
  zip.file('media', '{}');

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/**
 * Filename the user gets when they download the deck. Built from the
 * pack title, sanitised for filesystem safety. Always ends in .apkg.
 */
export function ankiFilename(pack: KnowledgePack): string {
  const slug = (pack.title || 'vozclara')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'vozclara';
  return `${slug}.apkg`;
}

function ankiDeckName(pack: KnowledgePack): string {
  const sourceLang = LANG_NAME[pack.sourceLang] ?? pack.sourceLang.toUpperCase();
  const outputLang = LANG_NAME[pack.outputLang] ?? pack.outputLang.toUpperCase();
  // Top-level "VozClara" folder so all VozClara decks group together in
  // Anki's tree; subdeck = pack title.
  const title = (pack.title || 'Untitled').replace(/::/g, '-').slice(0, 80);
  return `VozClara::${sourceLang} → ${outputLang}::${title}`;
}

function initSchema(db: import('sql.js').Database): void {
  db.run(`
    CREATE TABLE col (
      id              integer primary key,
      crt             integer not null,
      mod             integer not null,
      scm             integer not null,
      ver             integer not null,
      dty             integer not null,
      usn             integer not null,
      ls              integer not null,
      conf            text not null,
      models          text not null,
      decks           text not null,
      dconf           text not null,
      tags            text not null
    );
    CREATE TABLE notes (
      id              integer primary key,
      guid            text not null,
      mid             integer not null,
      mod             integer not null,
      usn             integer not null,
      tags            text not null,
      flds            text not null,
      sfld            integer not null,
      csum            integer not null,
      flags           integer not null,
      data            text not null
    );
    CREATE TABLE cards (
      id              integer primary key,
      nid             integer not null,
      did             integer not null,
      ord             integer not null,
      mod             integer not null,
      usn             integer not null,
      type            integer not null,
      queue           integer not null,
      due             integer not null,
      ivl             integer not null,
      factor          integer not null,
      reps            integer not null,
      lapses          integer not null,
      left            integer not null,
      odue            integer not null,
      odid            integer not null,
      flags           integer not null,
      data            text not null
    );
    CREATE TABLE revlog (
      id              integer primary key,
      cid             integer not null,
      usn             integer not null,
      ease            integer not null,
      ivl             integer not null,
      lastIvl         integer not null,
      factor          integer not null,
      time            integer not null,
      type            integer not null
    );
    CREATE TABLE graves (
      usn             integer not null,
      oid             integer not null,
      type            integer not null
    );
    CREATE INDEX ix_notes_usn ON notes (usn);
    CREATE INDEX ix_cards_usn ON cards (usn);
    CREATE INDEX ix_revlog_usn ON revlog (usn);
    CREATE INDEX ix_cards_nid ON cards (nid);
    CREATE INDEX ix_cards_sched ON cards (did, queue, due);
    CREATE INDEX ix_revlog_cid ON revlog (cid);
    CREATE INDEX ix_notes_csum ON notes (csum);
  `);
}

interface CollectionParams {
  nowSec: number;
  nowMs: number;
  deckId: number;
  deckName: string;
  pack: KnowledgePack;
}

function populateCollection(db: import('sql.js').Database, p: CollectionParams): void {
  const models = {
    [String(MODEL_ID)]: {
      id: MODEL_ID,
      name: 'VozClara Vocabulary',
      type: 0,
      mod: p.nowSec,
      usn: -1,
      sortf: 0,
      did: p.deckId,
      tmpls: [
        {
          name: 'Forward',
          ord: 0,
          qfmt: '<div class="word">{{Word}}</div>{{#PartOfSpeech}}<div class="pos">{{PartOfSpeech}}</div>{{/PartOfSpeech}}',
          afmt: '{{FrontSide}}<hr id="answer"><div class="translation">{{Translation}}</div>{{#Context}}<div class="context">{{Context}}</div>{{/Context}}<div class="source">{{Source}}</div>',
          did: null,
          bqfmt: '',
          bafmt: '',
          bfont: '',
          bsize: 0,
        },
        {
          name: 'Reverse',
          ord: 1,
          qfmt: '<div class="word">{{Translation}}</div>',
          afmt: '{{FrontSide}}<hr id="answer"><div class="translation">{{Word}}</div>{{#PartOfSpeech}}<div class="pos">{{PartOfSpeech}}</div>{{/PartOfSpeech}}{{#Context}}<div class="context">{{Context}}</div>{{/Context}}<div class="source">{{Source}}</div>',
          did: null,
          bqfmt: '',
          bafmt: '',
          bfont: '',
          bsize: 0,
        },
      ],
      flds: ['Word', 'Translation', 'Context', 'PartOfSpeech', 'Source'].map((name, ord) => ({
        name,
        ord,
        sticky: false,
        rtl: false,
        font: 'Inter, system-ui, sans-serif',
        size: 18,
        media: [],
      })),
      css: ANKI_CARD_CSS,
      latexPre:
        '\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n',
      latexPost: '\\end{document}',
      vers: [],
      req: [
        [0, 'all', [0]],
        [1, 'all', [1]],
      ],
    },
  };

  const decks = {
    '1': {
      id: 1,
      name: 'Default',
      mod: 0,
      desc: '',
      usn: 0,
      collapsed: false,
      newToday: [0, 0],
      revToday: [0, 0],
      lrnToday: [0, 0],
      timeToday: [0, 0],
      dyn: 0,
      extendNew: 10,
      extendRev: 50,
      conf: 1,
    },
    [String(p.deckId)]: {
      id: p.deckId,
      name: p.deckName,
      mod: p.nowSec,
      desc: `Vocabulary from "${p.pack.title}" — AI-generated by VozClara using Llama 3.3 70B (free/Pro) or Claude Sonnet 4.5 (Pro Plus). Verify translations before relying on them. Watermark per EU AI Act Art. 50(2). vozclara.app`,
      usn: -1,
      collapsed: false,
      newToday: [0, 0],
      revToday: [0, 0],
      lrnToday: [0, 0],
      timeToday: [0, 0],
      dyn: 0,
      extendNew: 10,
      extendRev: 50,
      conf: 1,
    },
  };

  const dconf = {
    '1': {
      id: 1,
      name: 'Default',
      replayq: true,
      lapse: { leechFails: 8, minInt: 1, delays: [10], leechAction: 0, mult: 0 },
      rev: {
        perDay: 200,
        fuzz: 0.05,
        ivlFct: 1,
        maxIvl: 36500,
        ease4: 1.3,
        bury: true,
        minSpace: 1,
      },
      timer: 0,
      maxTaken: 60,
      usn: 0,
      new: {
        perDay: 20,
        delays: [1, 10],
        separate: true,
        ints: [1, 4, 7],
        initialFactor: 2500,
        bury: true,
        order: 1,
      },
      mod: 0,
      autoplay: true,
    },
  };

  const conf = {
    nextPos: 1,
    estTimes: true,
    activeDecks: [1],
    sortType: 'noteFld',
    timeLim: 0,
    sortBackwards: false,
    addToCur: true,
    curDeck: 1,
    newBury: true,
    newSpread: 0,
    dueCounts: true,
    curModel: String(MODEL_ID),
    collapseTime: 1200,
  };

  db.run(
    `INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      p.nowSec,
      p.nowMs,
      p.nowMs,
      11,
      0,
      0,
      0,
      JSON.stringify(conf),
      JSON.stringify(models),
      JSON.stringify(decks),
      JSON.stringify(dconf),
      '{}',
    ],
  );
}

const ANKI_CARD_CSS = `
.card {
  font-family: Inter, system-ui, sans-serif;
  font-size: 20px;
  text-align: center;
  color: #1a1a1a;
  background-color: #f7f3ec;
  padding: 24px;
}
.word { font-size: 28px; color: #0a1a3a; font-weight: 500; }
.translation { font-size: 24px; color: #0a1a3a; margin: 8px 0; }
.pos { font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 6px; }
.context { font-style: italic; font-size: 16px; color: #444; margin-top: 14px; }
.source { font-size: 11px; color: #999; margin-top: 18px; text-transform: uppercase; letter-spacing: 0.1em; }
hr#answer { border: 0; border-top: 1px solid #c9a24b; margin: 16px 0; }
`.trim();

/**
 * Stable note GUID. Anki uses these to dedupe on re-import, so the
 * same word from the same pack always lands as the same note even if
 * the user exports twice.
 *
 * 10 chars of base91 of the SHA-256 hash gives ~10^19 search space —
 * enough for practical uniqueness.
 */
function guidFor(seed: string): string {
  // Cheap, deterministic 64-bit hash via FNV-1a × 2. SHA-256 in the
  // browser is async (subtle.digest) and we don't need cryptographic
  // strength here — just collision-resistance across one user's library.
  let h1 = 0x811c9dc5;
  let h2 = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca77);
  }
  h1 = (h1 ^ (h1 >>> 16)) >>> 0;
  h2 = (h2 ^ (h2 >>> 13)) >>> 0;
  const buf = new Uint8Array(8);
  buf[0] = h1 & 0xff;
  buf[1] = (h1 >>> 8) & 0xff;
  buf[2] = (h1 >>> 16) & 0xff;
  buf[3] = (h1 >>> 24) & 0xff;
  buf[4] = h2 & 0xff;
  buf[5] = (h2 >>> 8) & 0xff;
  buf[6] = (h2 >>> 16) & 0xff;
  buf[7] = (h2 >>> 24) & 0xff;
  return base91Encode(buf).slice(0, 10);
}

const BASE91_CHARS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&()*+,-./:;<=>?@[]^_`{|}~';
function base91Encode(buf: Uint8Array): string {
  let n = 0n;
  for (let i = buf.length - 1; i >= 0; i--) n = (n << 8n) | BigInt(buf[i]);
  let out = '';
  while (n > 0n) {
    out += BASE91_CHARS[Number(n % 91n)];
    n /= 91n;
  }
  return out || BASE91_CHARS[0];
}

/**
 * Anki's expected sort-field checksum: 32-bit unsigned int of the
 * SHA-1 prefix of the sort field. We approximate with FNV-1a, which
 * Anki only uses for duplicate detection — collisions there merely
 * flag the user with "this note already exists?", they don't corrupt
 * anything.
 */
function fieldChecksum(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\x1f/g, ' '); // strip Anki's field separator if it appears in content
}
