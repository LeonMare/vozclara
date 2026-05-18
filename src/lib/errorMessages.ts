/**
 * User-friendly translation of worker / network error codes.
 *
 * Both /api/transcript and /api/insights throw typed errors with
 * machine-readable codes (no_captions, quota_exceeded, ai_failed, …).
 * This module maps those into a 3-part user message:
 *
 *   title       — one-line headline ("This video has no subtitles")
 *   description — 1-2 sentences explaining what to do next
 *   severity    — 'error' (blocking) | 'warn' (retry-possible) | 'info'
 *
 * Locales: ES (primary), PT, DE, EN. Anything not in our supported
 * locales falls back to English.
 */

export type ErrorSeverity = 'error' | 'warn' | 'info';

export interface FriendlyError {
  title: string;
  description: string;
  severity: ErrorSeverity;
}

const DICT: Record<string, Record<string, FriendlyError>> = {
  // ─── Transcript errors ──────────────────────────────────────────────
  no_captions: {
    es: {
      title: 'Este vídeo no tiene subtítulos disponibles.',
      description: 'Sin subtítulos no podemos extraer el conocimiento. Prueba con otro vídeo — la mayoría de noticias, educación y contenido de creadores los tiene.',
      severity: 'warn',
    },
    pt: {
      title: 'Este vídeo não tem legendas disponíveis.',
      description: 'Sem legendas não conseguimos extrair o conhecimento. Tenta com outro vídeo — a maioria de notícias, educação e conteúdo de criadores tem-nas.',
      severity: 'warn',
    },
    de: {
      title: 'Dieses Video hat keine Untertitel verfügbar.',
      description: 'Ohne Untertitel können wir das Wissen nicht extrahieren. Versuche ein anderes Video — die meisten Nachrichten-, Bildungs- und Creator-Inhalte haben sie.',
      severity: 'warn',
    },
    en: {
      title: 'This video has no captions available.',
      description: 'Without captions we cannot extract the knowledge. Try another video — most news, education, and creator content has them.',
      severity: 'warn',
    },
  },
  rate_limited: {
    es: {
      title: 'Demasiadas peticiones recientes.',
      description: 'Espera un minuto y vuelve a intentarlo.',
      severity: 'warn',
    },
    pt: {
      title: 'Demasiados pedidos recentes.',
      description: 'Aguarda um minuto e tenta novamente.',
      severity: 'warn',
    },
    de: {
      title: 'Zu viele Anfragen kurz hintereinander.',
      description: 'Warte eine Minute und versuche es erneut.',
      severity: 'warn',
    },
    en: {
      title: 'Too many requests recently.',
      description: 'Wait a minute and try again.',
      severity: 'warn',
    },
  },
  quota_exceeded: {
    es: {
      title: 'Cuota mensual gratuita alcanzada.',
      description: 'Hemos alcanzado el límite mensual del proveedor de transcripciones. Vuelve a intentarlo a partir del 1 del próximo mes.',
      severity: 'error',
    },
    pt: {
      title: 'Quota mensal gratuita atingida.',
      description: 'Atingimos o limite mensal do fornecedor de transcrições. Tenta novamente a partir do dia 1 do próximo mês.',
      severity: 'error',
    },
    de: {
      title: 'Monatliches Kostenlos-Kontingent erreicht.',
      description: 'Wir haben das monatliche Limit des Transkript-Anbieters erreicht. Versuche es ab dem 1. nächsten Monats wieder.',
      severity: 'error',
    },
    en: {
      title: 'Monthly free quota reached.',
      description: 'We hit the transcript provider\'s monthly cap. Try again after the 1st of next month.',
      severity: 'error',
    },
  },
  invalid_id: {
    es: {
      title: 'No reconozco este enlace como un vídeo de YouTube.',
      description: 'Pega un enlace completo (youtube.com/watch?v=… o youtu.be/…) o solo el ID del vídeo.',
      severity: 'warn',
    },
    pt: {
      title: 'Não reconheço este link como um vídeo do YouTube.',
      description: 'Cola um link completo (youtube.com/watch?v=… ou youtu.be/…) ou apenas o ID do vídeo.',
      severity: 'warn',
    },
    de: {
      title: 'Ich erkenne diesen Link nicht als YouTube-Video.',
      description: 'Füge einen vollständigen Link ein (youtube.com/watch?v=… oder youtu.be/…) oder nur die Video-ID.',
      severity: 'warn',
    },
    en: {
      title: 'I don\'t recognise that as a YouTube link.',
      description: 'Paste a full URL (youtube.com/watch?v=… or youtu.be/…) or just the video ID.',
      severity: 'warn',
    },
  },
  fetch_failed: {
    es: {
      title: 'No se pudo conectar con el servidor de transcripción.',
      description: '¿Hay internet? Vuelve a intentarlo en un momento.',
      severity: 'warn',
    },
    pt: {
      title: 'Não foi possível ligar ao servidor de transcrição.',
      description: 'Há internet? Tenta novamente daqui a um momento.',
      severity: 'warn',
    },
    de: {
      title: 'Konnte den Transkript-Server nicht erreichen.',
      description: 'Ist Internet vorhanden? Versuche es in einem Moment erneut.',
      severity: 'warn',
    },
    en: {
      title: 'Could not reach the transcript server.',
      description: 'Is the internet on? Try again in a moment.',
      severity: 'warn',
    },
  },

  // ─── Insights errors ────────────────────────────────────────────────
  transcript_too_short: {
    es: {
      title: 'La transcripción es demasiado corta.',
      description: 'VozClara necesita al menos unos párrafos para extraer ideas. Prueba con un vídeo más largo.',
      severity: 'warn',
    },
    pt: {
      title: 'A transcrição é demasiado curta.',
      description: 'A VozClara precisa de pelo menos alguns parágrafos para extrair ideias. Tenta com um vídeo mais longo.',
      severity: 'warn',
    },
    de: {
      title: 'Das Transkript ist zu kurz.',
      description: 'VozClara braucht mindestens ein paar Absätze um Ideen zu extrahieren. Versuche ein längeres Video.',
      severity: 'warn',
    },
    en: {
      title: 'The transcript is too short.',
      description: 'VozClara needs at least a few paragraphs to extract ideas. Try a longer video.',
      severity: 'warn',
    },
  },
  unsupported_lang: {
    es: {
      title: 'Idioma de salida no soportado.',
      description: 'Por ahora VozClara soporta español, inglés, alemán y portugués.',
      severity: 'warn',
    },
    pt: {
      title: 'Idioma de saída não suportado.',
      description: 'Por agora a VozClara suporta espanhol, inglês, alemão e português.',
      severity: 'warn',
    },
    de: {
      title: 'Ausgabesprache nicht unterstützt.',
      description: 'VozClara unterstützt aktuell Spanisch, Englisch, Deutsch und Portugiesisch.',
      severity: 'warn',
    },
    en: {
      title: 'Output language not supported.',
      description: 'VozClara currently supports Spanish, English, German, and Portuguese.',
      severity: 'warn',
    },
  },
  ai_failed: {
    es: {
      title: 'La IA no pudo procesar este vídeo.',
      description: 'Suele ser temporal. Vuelve a intentarlo en un momento — si persiste, prueba con otro vídeo.',
      severity: 'warn',
    },
    pt: {
      title: 'A IA não conseguiu processar este vídeo.',
      description: 'Costuma ser temporário. Tenta novamente daqui a um momento — se persistir, tenta outro vídeo.',
      severity: 'warn',
    },
    de: {
      title: 'Die KI konnte dieses Video nicht verarbeiten.',
      description: 'Meistens vorübergehend. Versuche es in einem Moment erneut — wenn es bleibt, versuche ein anderes Video.',
      severity: 'warn',
    },
    en: {
      title: 'The AI couldn\'t process this video.',
      description: 'Usually temporary. Try again in a moment — if it persists, try a different video.',
      severity: 'warn',
    },
  },
  network: {
    es: {
      title: 'Sin conexión.',
      description: 'Comprueba tu internet y vuelve a intentarlo.',
      severity: 'warn',
    },
    pt: {
      title: 'Sem ligação.',
      description: 'Verifica a tua internet e tenta novamente.',
      severity: 'warn',
    },
    de: {
      title: 'Keine Verbindung.',
      description: 'Prüfe dein Internet und versuche es erneut.',
      severity: 'warn',
    },
    en: {
      title: 'No connection.',
      description: 'Check your internet and try again.',
      severity: 'warn',
    },
  },
};

const FALLBACK: Record<string, FriendlyError> = {
  es: {
    title: 'Algo no salió bien.',
    description: 'Vuelve a intentarlo en un momento — si persiste, prueba con otro vídeo.',
    severity: 'warn',
  },
  pt: {
    title: 'Algo correu mal.',
    description: 'Tenta novamente daqui a um momento — se persistir, tenta outro vídeo.',
    severity: 'warn',
  },
  de: {
    title: 'Etwas ist schiefgelaufen.',
    description: 'Versuche es in einem Moment erneut — wenn es bleibt, versuche ein anderes Video.',
    severity: 'warn',
  },
  en: {
    title: 'Something went wrong.',
    description: 'Try again in a moment — if it persists, try a different video.',
    severity: 'warn',
  },
};

/**
 * Map an error (code-string from a typed error, or a raw Error object,
 * or an arbitrary string) into a friendly title + description in the
 * user's locale.
 */
export function friendlyError(err: unknown, locale: string): FriendlyError {
  const lang = locale.slice(0, 2).toLowerCase();
  const langKey = ['es', 'pt', 'de', 'en'].includes(lang) ? lang : 'en';

  let code: string | undefined;
  if (err && typeof err === 'object') {
    const e = err as { code?: string; message?: string };
    if (typeof e.code === 'string') code = e.code;
    else if (typeof e.message === 'string') code = e.message;
  } else if (typeof err === 'string') {
    code = err;
  }

  const entry = code ? DICT[code]?.[langKey] : undefined;
  return entry ?? FALLBACK[langKey] ?? FALLBACK.en;
}
