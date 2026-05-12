/**
 * Editorial section divider — three gold dots with thin gold rules
 * extending outward. Echoes the cover-page divider rhythm of the Brand
 * Foundation v5 document and breaks the page into chapters without
 * shouting.
 */
export function SectionDivider() {
  return (
    <div className="bg-creme py-8" aria-hidden>
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-3 px-5 sm:px-8">
        <span className="h-px w-12 bg-gold/40 sm:w-16" />
        <span className="h-1 w-1 rounded-full bg-gold" />
        <span className="h-1 w-1 rounded-full bg-gold/60" />
        <span className="h-1 w-1 rounded-full bg-gold" />
        <span className="h-px w-12 bg-gold/40 sm:w-16" />
      </div>
    </div>
  );
}
