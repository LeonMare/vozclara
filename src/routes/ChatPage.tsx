import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';
import { getPack, type KnowledgePack } from '../lib/pack';
import { getSamplePack } from '../lib/samplePack';
import {
  ChatError,
  clearChat,
  loadChat,
  sendChatMessage,
  type ChatMessage,
} from '../lib/chat';

/**
 * /pack/:id/chat — multi-turn AI conversation about a specific Pack.
 *
 * The model plays a patient native-language tutor inside the pack's
 * output language. The user practices target-language conversation
 * with a partner who already "knows the video" — the pack's title,
 * summary, ideas, vocabulary and quotes are baked into the system
 * prompt by the worker.
 *
 * Local-first: history persists in IndexedDB under chat:v1:<packId>.
 * Only the last 10 turns ever travel to the worker per request.
 */
export function ChatPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { locale } = useLocale();
  const labels = useMemo(() => chatLabels(locale), [locale]);

  usePageHead({
    title: labels.headTitle,
    description: labels.headDescription,
  });

  const [pack, setPack] = useState<KnowledgePack | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const p = (await getPack(id)) ?? getSamplePack(id) ?? null;
      if (cancel) return;
      setPack(p);
      if (p) setMessages(await loadChat(p.id));
      setLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  // Auto-scroll to the latest message on every change.
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy]);

  const onSend = useCallback(async () => {
    if (!pack || busy) return;
    const text = input.trim();
    if (!text) return;
    setError(null);
    setBusy(true);
    setInput('');
    // Optimistic: show user's message immediately so the textarea
    // empties responsively before the network round-trip resolves.
    setMessages((m) => [...m, { role: 'user', content: text, ts: Date.now() }]);
    try {
      const updated = await sendChatMessage(pack, text);
      setMessages(updated);
    } catch (err) {
      if (err instanceof ChatError) {
        if (err.code === 'empty') setError(labels.errorEmpty);
        else if (err.code === 'too_long') setError(labels.errorTooLong);
        else if (err.code === 'ai_failed') setError(labels.errorAi);
        else setError(labels.errorNetwork);
      } else {
        setError(labels.errorNetwork);
      }
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }, [pack, busy, input, labels]);

  const onClear = useCallback(async () => {
    if (!pack) return;
    if (!confirm(labels.clearConfirm)) return;
    await clearChat(pack.id);
    setMessages([]);
  }, [pack, labels.clearConfirm]);

  /* ─── Render ────────────────────────────────────────────────── */

  if (loading) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 sm:px-8">
          <p className="font-sans text-sm text-graphit/60">{labels.loading}</p>
        </div>
      </main>
    );
  }

  if (!pack) {
    return (
      <main className="bg-creme paper">
        <div className="mx-auto max-w-2xl px-5 pb-16 pt-10 text-center sm:px-8">
          <h1 className="font-serif text-3xl text-navy">{labels.packNotFound}</h1>
          <Link
            to="/library"
            className="mt-6 inline-block rounded-card border border-navy/15 bg-white px-5 py-2.5 font-sans text-sm text-navy transition hover:border-gold"
          >
            {labels.backToLibrary}
          </Link>
        </div>
      </main>
    );
  }

  const starters = labels.starters(pack.outputLang);

  return (
    <main className="bg-creme paper">
      <div className="mx-auto flex h-[calc(100vh-72px)] max-w-2xl flex-col px-5 pb-4 pt-4 sm:px-8 sm:pt-6">
        <div className="flex items-baseline justify-between gap-3 pb-3">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
              {labels.eyebrow}
            </p>
            <h1 className="mt-1 font-serif text-xl leading-tight text-navy sm:text-2xl">
              {pack.title}
            </h1>
          </div>
          <Link
            to={`/pack/${pack.id}`}
            className="shrink-0 font-sans text-xs text-graphit/60 underline-offset-4 hover:text-navy hover:underline"
          >
            ← {labels.backToPack}
          </Link>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto rounded-card border border-navy/10 bg-white/40 px-3 py-4 sm:px-5"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="mx-auto max-w-md px-2 py-6 text-center">
              <p className="font-sans text-sm text-graphit/65">{labels.welcome(pack.outputLang)}</p>
              <div className="mt-5 flex flex-col gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="rounded-card border border-navy/15 bg-white px-3 py-2 text-left font-sans text-sm text-navy transition hover:border-gold"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} content={m.content} />
          ))}

          {busy && <Bubble role="assistant" content={labels.thinking} dim />}
        </div>

        {error && (
          <p role="alert" className="mt-2 font-sans text-xs text-amber-700">
            {error}
          </p>
        )}

        <form
          className="mt-3 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void onSend();
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter to send, Shift+Enter for newline. iOS won't fire
              // keyDown for the virtual keyboard return, so the visible
              // Send button stays the primary action there.
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void onSend();
              }
            }}
            placeholder={labels.placeholder(pack.outputLang)}
            rows={1}
            disabled={busy}
            className="min-h-[44px] max-h-32 flex-1 resize-none rounded-card border border-navy/15 bg-white px-3 py-2 font-sans text-sm text-navy placeholder-graphit/40 outline-none focus:border-gold disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || input.trim().length === 0}
            className="h-[44px] rounded-card bg-navy px-4 font-sans text-sm text-creme transition hover:bg-graphit disabled:opacity-50"
          >
            {labels.send}
          </button>
        </form>

        {messages.length > 0 && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={onClear}
              className="font-sans text-[11px] text-graphit/65 underline-offset-4 hover:text-amber-700 hover:underline"
            >
              {labels.clear}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Bubble({ role, content, dim }: { role: 'user' | 'assistant'; content: string; dim?: boolean }) {
  const isUser = role === 'user';
  return (
    <div className={'mb-3 flex ' + (isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={
          'max-w-[85%] rounded-card px-3.5 py-2.5 font-sans text-sm leading-relaxed ' +
          (isUser
            ? 'bg-navy text-creme'
            : 'border border-navy/10 bg-white text-graphit ' + (dim ? 'italic text-graphit/65' : ''))
        }
      >
        {content}
      </div>
    </div>
  );
}

/* ─── i18n ────────────────────────────────────────────────────────── */

function chatLabels(locale: string) {
  const generic = {
    eyebrow: '',
    headTitle: '',
    headDescription: '',
    backToPack: '',
    backToLibrary: '',
    packNotFound: '',
    loading: '',
    thinking: '',
    send: '',
    clear: '',
    clearConfirm: '',
    errorEmpty: '',
    errorTooLong: '',
    errorAi: '',
    errorNetwork: '',
    welcome: (_lang: string) => '',
    placeholder: (_lang: string) => '',
    starters: (_lang: string) => [] as string[],
  };
  if (locale.startsWith('es')) return {
    ...generic,
    eyebrow: 'CONVERSACIÓN',
    headTitle: 'Conversar — Voz Clara',
    headDescription: 'Practica conversación sobre el contenido del Pack con un compañero de idioma.',
    backToPack: 'Volver al Pack',
    backToLibrary: 'Volver a la biblioteca',
    packNotFound: 'Pack no encontrado.',
    loading: 'Cargando…',
    thinking: '…',
    send: 'Enviar',
    clear: 'Borrar conversación',
    clearConfirm: '¿Borrar toda la conversación?',
    errorEmpty: 'Escribe algo primero.',
    errorTooLong: 'Mensaje demasiado largo.',
    errorAi: 'El modelo no pudo responder. Inténtalo de nuevo.',
    errorNetwork: 'Sin conexión.',
    welcome: (lang: string) => `Conversa sobre este Pack en ${langName(locale, lang)}. El tutor solo habla ese idioma y se mantiene en el tema del vídeo.`,
    placeholder: (lang: string) => `Escribe en ${langName(locale, lang)}…`,
    starters: (lang: string) => starterPrompts(lang).es,
  };
  if (locale.startsWith('pt')) return {
    ...generic,
    eyebrow: 'CONVERSA',
    headTitle: 'Conversar — Voz Clara',
    headDescription: 'Pratica conversa sobre o conteúdo do Pack com um parceiro de idioma.',
    backToPack: 'Voltar ao Pack',
    backToLibrary: 'Voltar à biblioteca',
    packNotFound: 'Pack não encontrado.',
    loading: 'A carregar…',
    thinking: '…',
    send: 'Enviar',
    clear: 'Apagar conversa',
    clearConfirm: 'Apagar toda a conversa?',
    errorEmpty: 'Escreve algo primeiro.',
    errorTooLong: 'Mensagem demasiado longa.',
    errorAi: 'O modelo não conseguiu responder. Tenta de novo.',
    errorNetwork: 'Sem ligação.',
    welcome: (lang: string) => `Conversa sobre este Pack em ${langName(locale, lang)}. O tutor só fala essa língua e mantém-se no tópico do vídeo.`,
    placeholder: (lang: string) => `Escreve em ${langName(locale, lang)}…`,
    starters: (lang: string) => starterPrompts(lang).pt,
  };
  if (locale.startsWith('de')) return {
    ...generic,
    eyebrow: 'GESPRÄCH',
    headTitle: 'Gespräch — Voz Clara',
    headDescription: 'Übe Konversation über den Pack-Inhalt mit einem Sprachpartner.',
    backToPack: 'Zurück zum Pack',
    backToLibrary: 'Zurück zur Bibliothek',
    packNotFound: 'Pack nicht gefunden.',
    loading: 'Lädt…',
    thinking: '…',
    send: 'Senden',
    clear: 'Gespräch löschen',
    clearConfirm: 'Das gesamte Gespräch löschen?',
    errorEmpty: 'Schreib erst etwas.',
    errorTooLong: 'Nachricht zu lang.',
    errorAi: 'Das Modell konnte nicht antworten. Versuch es nochmal.',
    errorNetwork: 'Keine Verbindung.',
    welcome: (lang: string) => `Sprich über diesen Pack auf ${langName(locale, lang)}. Der Tutor spricht nur diese Sprache und bleibt beim Thema des Videos.`,
    placeholder: (lang: string) => `Schreib auf ${langName(locale, lang)}…`,
    starters: (lang: string) => starterPrompts(lang).de,
  };
  return {
    ...generic,
    eyebrow: 'CONVERSATION',
    headTitle: 'Chat — Voz Clara',
    headDescription: 'Practice conversation about the Pack content with a language partner.',
    backToPack: 'Back to Pack',
    backToLibrary: 'Back to library',
    packNotFound: 'Pack not found.',
    loading: 'Loading…',
    thinking: '…',
    send: 'Send',
    clear: 'Clear conversation',
    clearConfirm: 'Clear the whole conversation?',
    errorEmpty: 'Type something first.',
    errorTooLong: 'Message too long.',
    errorAi: 'The model could not respond. Try again.',
    errorNetwork: 'No connection.',
    welcome: (lang: string) => `Talk about this Pack in ${langName(locale, lang)}. The tutor only speaks that language and stays on the video's topic.`,
    placeholder: (lang: string) => `Write in ${langName(locale, lang)}…`,
    starters: (lang: string) => starterPrompts(lang).en,
  };
}

function langName(locale: string, code: string): string {
  if (locale.startsWith('es')) return ({ de: 'alemán', es: 'español', pt: 'portugués', en: 'inglés', fr: 'francés' } as Record<string, string>)[code] ?? code;
  if (locale.startsWith('pt')) return ({ de: 'alemão', es: 'espanhol', pt: 'português', en: 'inglês', fr: 'francês' } as Record<string, string>)[code] ?? code;
  if (locale.startsWith('de')) return ({ de: 'Deutsch', es: 'Spanisch', pt: 'Portugiesisch', en: 'Englisch', fr: 'Französisch' } as Record<string, string>)[code] ?? code;
  return ({ de: 'German', es: 'Spanish', pt: 'Portuguese', en: 'English', fr: 'French' } as Record<string, string>)[code] ?? code;
}

/**
 * Conversation starters in the *target* language so the user just
 * has to tap one and respond — the prompt is already in the language
 * they're practicing.
 */
function starterPrompts(targetLang: string): { es: string[]; pt: string[]; de: string[]; en: string[] } {
  const sets: Record<string, { es: string[]; pt: string[]; de: string[]; en: string[] }> = {
    es: {
      es: ['¿Cuál es la idea más importante del vídeo?', '¿Puedes resumirlo en tres frases?', 'Quiero practicar el vocabulario de este Pack.'],
      pt: ['¿Cuál es la idea más importante del vídeo?', '¿Puedes resumirlo en tres frases?', 'Quiero practicar el vocabulario de este Pack.'],
      de: ['¿Cuál es la idea más importante del vídeo?', '¿Puedes resumirlo en tres frases?', 'Quiero practicar el vocabulario de este Pack.'],
      en: ['¿Cuál es la idea más importante del vídeo?', '¿Puedes resumirlo en tres frases?', 'Quiero practicar el vocabulario de este Pack.'],
    },
    pt: {
      es: ['Qual é a ideia mais importante do vídeo?', 'Podes resumir em três frases?', 'Quero praticar o vocabulário deste Pack.'],
      pt: ['Qual é a ideia mais importante do vídeo?', 'Podes resumir em três frases?', 'Quero praticar o vocabulário deste Pack.'],
      de: ['Qual é a ideia mais importante do vídeo?', 'Podes resumir em três frases?', 'Quero praticar o vocabulário deste Pack.'],
      en: ['Qual é a ideia mais importante do vídeo?', 'Podes resumir em três frases?', 'Quero praticar o vocabulário deste Pack.'],
    },
    de: {
      es: ['Was ist die wichtigste Aussage des Videos?', 'Kannst du es in drei Sätzen zusammenfassen?', 'Ich möchte das Vokabular aus diesem Pack üben.'],
      pt: ['Was ist die wichtigste Aussage des Videos?', 'Kannst du es in drei Sätzen zusammenfassen?', 'Ich möchte das Vokabular aus diesem Pack üben.'],
      de: ['Was ist die wichtigste Aussage des Videos?', 'Kannst du es in drei Sätzen zusammenfassen?', 'Ich möchte das Vokabular aus diesem Pack üben.'],
      en: ['Was ist die wichtigste Aussage des Videos?', 'Kannst du es in drei Sätzen zusammenfassen?', 'Ich möchte das Vokabular aus diesem Pack üben.'],
    },
    en: {
      es: ['What is the most important idea of the video?', 'Can you summarise it in three sentences?', "I want to practice this Pack's vocabulary."],
      pt: ['What is the most important idea of the video?', 'Can you summarise it in three sentences?', "I want to practice this Pack's vocabulary."],
      de: ['What is the most important idea of the video?', 'Can you summarise it in three sentences?', "I want to practice this Pack's vocabulary."],
      en: ['What is the most important idea of the video?', 'Can you summarise it in three sentences?', "I want to practice this Pack's vocabulary."],
    },
  };
  return sets[targetLang] ?? sets.en;
}
