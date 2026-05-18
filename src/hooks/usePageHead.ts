import { useEffect } from 'react';

interface PageHeadOptions {
  /** Title text — will be suffixed " · VozClara" automatically. */
  title: string;
  /** Optional override of the <meta name="description"> tag. */
  description?: string;
}

const TITLE_SUFFIX = '· VozClara';

/**
 * Update the document title (and optionally the meta description) for
 * the currently mounted route. Restores the previous values on unmount
 * so SPA navigation back to a parent route doesn't leave the wrong
 * title in the browser tab.
 *
 * Modern search engines (Google) execute JS and pick up these
 * client-side changes for indexing. Social-card crawlers (X, WhatsApp,
 * LinkedIn) DO NOT — they read the static index.html meta tags. Per-
 * route OG cards would need SSR or an edge-function HTML rewrite,
 * which is intentionally out of scope here.
 */
export function usePageHead({ title, description }: PageHeadOptions): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const prevTitle = document.title;
    const fullTitle = title.includes(TITLE_SUFFIX) ? title : `${title} ${TITLE_SUFFIX}`;
    document.title = fullTitle;

    let metaEl: HTMLMetaElement | null = null;
    let prevDesc: string | null = null;
    if (description !== undefined) {
      metaEl = document.querySelector('meta[name="description"]');
      if (metaEl) {
        prevDesc = metaEl.content;
        metaEl.content = description;
      }
    }

    return () => {
      document.title = prevTitle;
      if (metaEl && prevDesc !== null) {
        metaEl.content = prevDesc;
      }
    };
  }, [title, description]);
}
