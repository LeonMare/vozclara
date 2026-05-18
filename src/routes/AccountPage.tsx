import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';
import { getBrainId, libraryStats, listPacks, type LibraryStats, type KnowledgePack } from '../lib/pack';
import { dueSummary, getStreak, type DueSummary, type StreakState } from '../lib/srs';
import { getRecentlyViewed } from '../lib/recentlyViewed';
import { Avatar } from '../components/Avatar';

/**
 * /me — signed-in user dashboard.
 *
 * Editorial-style account hub. Composes existing data sources (auth user,
 * IndexedDB library stats, SRS counts) into a single readable surface so
 * the user finally has *somewhere* to land after sign-in beyond the
 * library grid.
 *
 * Sections, in scroll order:
 *   1. Hero — greeting + Plan badge + member-since
 *   2. Stats triplet — Packs · Languages · Due reviews
 *   3. Plan & billing — current plan + Founder Deal CTA
 *   4. Account — email, display name, preferred language
 *   5. Devices — list of brainIds (anonymous brains adopted by this account)
 *   6. Privacy & data — DSGVO actions (export, delete) via mailto for now
 *   7. Sign out — at the very bottom, intentional friction
 *
 * Anonymous visitors hitting /me get bounced to /signin.
 */
export function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const labels = accountLabels(locale);

  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [due, setDue] = useState<DueSummary | null>(null);
  const [streak, setStreak] = useState<StreakState | null>(null);
  const [recentPacks, setRecentPacks] = useState<KnowledgePack[]>([]);

  usePageHead({
    title: labels.headTitle,
    description: labels.headDescription,
  });

  /* Pull all dashboard data on mount. Each call is a cheap IndexedDB
     read so we can fire them in parallel without choreographing a
     loading state — the UI just fills in as data arrives. Re-runs when
     the signed-in user changes (different brainId → different library). */
  useEffect(() => {
    const brainId = getBrainId();
    void libraryStats(brainId).then(setStats);
    void dueSummary(brainId).then(setDue);
    void getStreak(brainId).then(setStreak);
    // Recent activity: resolve last-viewed pack IDs against the library.
    // Drop any IDs we can't resolve (deleted packs), cap at 3.
    void (async () => {
      const ids = getRecentlyViewed();
      if (ids.length === 0) return;
      const all = await listPacks(brainId);
      const map = new Map(all.map((p) => [p.id, p]));
      setRecentPacks(
        ids
          .map((id) => map.get(id))
          .filter((p): p is KnowledgePack => !!p)
          .slice(0, 3),
      );
    })();
  }, [user?.id]);

  /* Compute the 7-day calendar strip from the streak's activeDays log.
     Yesterday → today reads left-to-right; missing days render as a
     hollow dot, active days as a filled gold dot. Memoised so we don't
     re-build the grid on every keystroke elsewhere. */
  const last7Days = useMemo(() => buildLast7Days(streak?.activeDays ?? []), [streak?.activeDays]);

  /* Anonymous-first product — but /me only makes sense signed in. */
  useEffect(() => {
    if (!loading && !user) navigate('/signin?next=/me', { replace: true });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <main id="main" className="bg-creme paper py-24 text-center">
        <span className="font-serif text-graphit/60">…</span>
      </main>
    );
  }

  const displayName = user.displayName ?? user.email.split('@')[0];
  const memberSince = new Date(user.createdAt).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <main id="main" className="bg-creme paper">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">

        {/* ─── 1 · Hero ──────────────────────────────────────────────── */}
        <section>
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § {labels.eyebrow}
          </p>

          <div className="mt-5 flex items-start gap-5 sm:gap-6">
            {/* Avatar on the left — brand monogram, no Gravatar.
                Decorative because the name is already in the headline. */}
            <Avatar name={user.displayName} email={user.email} size="lg" decorative />

            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-3xl leading-tight text-navy sm:text-5xl">
                {labels.greeting(displayName)}
              </h1>
              <p className="mt-2 break-all font-serif italic text-graphit/65 sm:text-lg">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-5 h-px w-16 bg-gold" aria-hidden />

          <div className="mt-5 flex flex-wrap items-center gap-2 font-sans text-[10px] uppercase tracking-widest">
            <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-gold">
              <span className="text-creme/50">●</span> {labels.planFree}
            </span>
            <span className="rounded-full bg-navy/8 px-2.5 py-1 text-graphit/70">
              {labels.memberSince} {memberSince}
            </span>
            <span className="rounded-full bg-navy/8 px-2.5 py-1 text-graphit/70">
              {user.brainIds.length} {user.brainIds.length === 1 ? labels.device : labels.devices}
            </span>
            {/* Surface today's streak right in the chip row so the most
                gamified number is visible without scrolling. Hidden when
                the user has never reviewed (current === 0) — empty
                gamification screams "you're behind". */}
            {streak && streak.current > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-gold">
                {labels.streakChip(streak.current)}
              </span>
            )}
          </div>
        </section>

        {/* ─── 2 · Stats triplet ─────────────────────────────────────── */}
        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          <StatCard
            value={stats?.totalPacks ?? 0}
            label={labels.statPacks}
            href="/library"
            hint={
              stats && stats.totalPacks === 0
                ? labels.statPacksEmpty
                : labels.statPacksHint
            }
          />
          <StatCard
            value={stats?.totalLangs ?? 0}
            label={labels.statLangs}
            href="/library"
            hint={
              stats && stats.totalLangs === 0
                ? labels.statLangsEmpty
                : labels.statLangsHint
            }
          />
          <StatCard
            value={due?.due ?? 0}
            label={labels.statDue}
            href="/review"
            hint={
              due && due.due === 0
                ? labels.statDueEmpty
                : labels.statDueHint
            }
            accent={Boolean(due?.due && due.due > 0)}
          />
        </section>

        {/* ─── 2b · Streak + 7-day calendar strip ────────────────────── */}
        <section className="mt-10 rounded-card border border-navy/15 bg-white p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-sans text-[10px] uppercase tracking-widest text-gold-deep">
                {labels.streakLabel}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-serif text-4xl tabular-nums text-navy sm:text-5xl">
                  {streak?.current ?? 0}
                </span>
                <span className="font-serif italic text-graphit/65">
                  {labels.streakDays(streak?.current ?? 0)}
                </span>
              </div>
              <div className="mt-1 font-sans text-xs text-graphit/65">
                {(streak?.longest ?? 0) > 0
                  ? labels.streakLongest(streak?.longest ?? 0)
                  : labels.streakStart}
              </div>
            </div>

            {/* 7-day strip — yesterday → today reads left to right.
                Gold filled circle = active that day, hollow = miss. */}
            <ol className="flex items-end gap-2 self-end sm:self-auto">
              {last7Days.map((d) => (
                <li key={d.ymd} className="flex flex-col items-center gap-1.5">
                  <span
                    aria-hidden
                    className={[
                      'inline-block h-3 w-3 rounded-full transition',
                      d.active
                        ? 'bg-gold'
                        : 'border border-navy/15 bg-creme/50',
                      d.isToday ? 'ring-2 ring-gold/40 ring-offset-2 ring-offset-white' : '',
                    ].join(' ')}
                  />
                  <span className="font-sans text-[10px] uppercase tracking-widest text-graphit/65">
                    {d.dayLabel(locale)}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── 2c · Recent activity (only when there's any) ──────────── */}
        {recentPacks.length > 0 && (
          <section className="mt-10">
            <SectionEyebrow text={labels.sectionRecent} />
            <h2 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
              {labels.recentHeading}
            </h2>
            <div className="mt-4 h-px w-12 bg-gold" aria-hidden />

            <ul className="mt-6 divide-y divide-navy/10 overflow-hidden rounded-card border border-navy/15 bg-white">
              {recentPacks.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/pack/${p.id}`}
                    className="flex items-center gap-4 px-5 py-4 transition hover:bg-creme/40"
                  >
                    {p.source.thumbnailUrl ? (
                      <img
                        src={p.source.thumbnailUrl}
                        alt=""
                        className="h-12 w-20 shrink-0 rounded-md object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-12 w-20 shrink-0 rounded-md bg-navy/10" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-serif text-base text-navy">
                        {p.title}
                      </div>
                      <div className="mt-0.5 font-sans text-xs text-graphit/65">
                        {new Date(p.updatedAt).toLocaleDateString(locale, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' · '}
                        {p.outputLang.toUpperCase()}
                      </div>
                    </div>
                    <span className="shrink-0 font-sans text-xs text-gold">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ─── 3 · Plan & billing ────────────────────────────────────── */}
        <section className="mt-16">
          <SectionEyebrow text={labels.sectionPlan} />
          <h2 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.planHeading}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />

          <div className="mt-6 rounded-card border border-navy/15 bg-white p-6 sm:p-7">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <div className="font-sans text-[10px] uppercase tracking-widest text-gold-deep">
                  {labels.currentPlan}
                </div>
                <div className="mt-1 font-serif text-xl text-navy">{labels.planFree}</div>
              </div>
              <div className="font-sans text-sm text-graphit/65">
                {labels.planFreeBlurb}
              </div>
            </div>

            <div className="my-5 h-px bg-navy/10" aria-hidden />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-serif italic text-graphit/75 sm:text-lg">
                {labels.founderPitch}
              </div>
              <Link
                to="/founder"
                className="shrink-0 rounded-card bg-navy px-5 py-2.5 font-sans text-sm font-medium text-creme transition hover:bg-navy/90"
              >
                {labels.founderCta}
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 4 · Account info ──────────────────────────────────────── */}
        <section className="mt-16">
          <SectionEyebrow text={labels.sectionAccount} />
          <h2 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.accountHeading}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />

          <dl className="mt-6 divide-y divide-navy/10 overflow-hidden rounded-card border border-navy/15 bg-white">
            <AccountRow label={labels.fieldEmail} value={user.email} />
            <EditableNameRow labels={labels} initial={user.displayName} />
            <AccountRow
              label={labels.fieldLang}
              value={user.lang.toUpperCase()}
            />
            <AccountRow
              label={labels.fieldUserId}
              value={user.id}
              mono
            />
          </dl>

          <p className="mt-3 font-sans text-xs leading-relaxed text-graphit/65">
            {labels.editHint}
          </p>
        </section>

        {/* ─── 5 · Devices ───────────────────────────────────────────── */}
        {user.brainIds.length > 0 && (
          <section className="mt-16">
            <SectionEyebrow text={labels.sectionDevices} />
            <h2 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
              {labels.devicesHeading}
            </h2>
            <div className="mt-4 h-px w-12 bg-gold" aria-hidden />

            <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-graphit/70">
              {labels.devicesBody}
            </p>

            <ul className="mt-5 space-y-2">
              {user.brainIds.map((bid, i) => {
                const isCurrent = bid === getBrainId();
                return (
                  <li
                    key={bid}
                    className="flex items-center justify-between gap-3 rounded-card border border-navy/10 bg-white px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-sans text-sm text-navy">
                        {labels.brainIdLabel} {i + 1}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-graphit/65">
                        {bid}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 font-sans text-[10px] uppercase tracking-widest text-gold-deep">
                        {labels.thisDevice}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* ─── 6 · Privacy & data (DSGVO) ────────────────────────────── */}
        <section className="mt-16">
          <SectionEyebrow text={labels.sectionPrivacy} />
          <h2 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.privacyHeading}
          </h2>
          <div className="mt-4 h-px w-12 bg-gold" aria-hidden />

          <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-graphit/70">
            {labels.privacyBody}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={`mailto:support@vozclara.app?subject=${encodeURIComponent(labels.mailExportSubject)}&body=${encodeURIComponent(labels.mailExportBody(user.email))}`}
              className="block rounded-card border border-navy/15 bg-white px-5 py-4 transition hover:border-gold"
            >
              <div className="font-serif text-base text-navy">
                {labels.exportTitle}
              </div>
              <div className="mt-1 font-sans text-sm leading-relaxed text-graphit/65">
                {labels.exportBody}
              </div>
            </a>
            <DeleteAccountCard labels={labels} />
          </div>
        </section>

        {/* ─── 7 · Sign out ──────────────────────────────────────────── */}
        <section className="mt-16 border-t border-navy/10 pt-10 text-center">
          <button
            type="button"
            onClick={async () => {
              await signOut();
              navigate('/');
            }}
            className="rounded-card border border-navy/20 bg-white px-6 py-3 font-sans text-sm font-medium text-graphit/80 transition hover:border-navy/40 hover:text-navy"
          >
            {labels.signOut}
          </button>
        </section>
      </div>
    </main>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────── */

interface CalendarDay {
  ymd: string;
  active: boolean;
  isToday: boolean;
  dayLabel: (locale: string) => string;
}

/** Build the 7-day strip ending today. Uses the activeDays log from
 *  StreakState so a missed yesterday renders as a hollow dot rather
 *  than being skipped. */
function buildLast7Days(activeDays: string[]): CalendarDay[] {
  const set = new Set(activeDays);
  const out: CalendarDay[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const ymd = `${y}-${m}-${day}`;
    const captured = new Date(d);
    out.push({
      ymd,
      active: set.has(ymd),
      isToday: i === 0,
      dayLabel: (locale: string) =>
        captured.toLocaleDateString(locale, { weekday: 'narrow' }),
    });
  }
  return out;
}

/* ─── Subcomponents ─────────────────────────────────────────────────── */

function SectionEyebrow({ text }: { text: string }) {
  return (
    <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
      § {text}
    </p>
  );
}

function StatCard({
  value,
  label,
  href,
  hint,
  accent = false,
}: {
  value: number;
  label: string;
  href: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <Link
      to={href}
      className={[
        'group block rounded-card border bg-white px-5 py-6 transition',
        accent
          ? 'border-gold/60 hover:border-gold'
          : 'border-navy/15 hover:border-gold',
      ].join(' ')}
    >
      <div
        className={[
          'font-serif text-4xl leading-none tabular-nums',
          accent ? 'text-gold' : 'text-navy',
        ].join(' ')}
      >
        {value}
      </div>
      <div className="mt-3 font-sans text-[11px] uppercase tracking-widest text-gold-deep">
        {label}
      </div>
      <div className="mt-1 font-sans text-xs leading-relaxed text-graphit/65 group-hover:text-graphit/75">
        {hint}
      </div>
    </Link>
  );
}

function AccountRow({
  label,
  value,
  mono = false,
  muted = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="shrink-0 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
        {label}
      </dt>
      <dd
        className={[
          'truncate text-right',
          mono ? 'font-mono text-xs text-graphit/65' : 'font-serif text-base',
          muted ? 'italic text-graphit/65' : 'text-navy',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  );
}

/** Inline-editable display-name row inside the Account table.
 *  Click on the value → swap to input → save on Enter or blur.
 *  Escape cancels. Empty value clears the field.
 *
 *  Why a dedicated component rather than threading state down through
 *  the AccountPage: the optimistic-update + revert pattern is local,
 *  and the row needs its own focus + keyboard handling that doesn't
 *  belong on the page-level component. */
function EditableNameRow({
  labels,
  initial,
}: {
  labels: ReturnType<typeof accountLabels>;
  initial?: string;
}) {
  const { updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setValue(initial ?? ''); }, [initial]);

  async function commit() {
    const next = value.trim();
    // No-op if unchanged
    if (next === (initial ?? '')) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ displayName: next.length === 0 ? null : next });
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }

  function cancel() {
    setValue(initial ?? '');
    setEditing(false);
  }

  return (
    <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <dt className="shrink-0 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
        {labels.fieldName}
      </dt>
      {editing ? (
        <dd className="flex-1">
          <input
            type="text"
            autoFocus
            value={value}
            disabled={saving}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); void commit(); }
              else if (e.key === 'Escape') cancel();
            }}
            maxLength={40}
            placeholder={labels.namePlaceholder}
            aria-label={labels.fieldName}
            className="w-full rounded border border-navy/20 bg-white px-2 py-1 text-right font-serif text-base text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-60 sm:text-base"
          />
        </dd>
      ) : (
        <dd
          role="button"
          tabIndex={0}
          onClick={() => setEditing(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEditing(true); }
          }}
          className={[
            'cursor-text truncate rounded text-right transition hover:bg-creme/40 focus:bg-creme/40 focus:outline-none',
            'px-2 py-0.5 -mx-2 -my-0.5',
            initial ? 'font-serif text-base text-navy' : 'font-serif text-base italic text-graphit/65',
          ].join(' ')}
          aria-label={labels.editNameAria}
          title={labels.editNameAria}
        >
          {initial ?? labels.notSet}
          <span className="ml-2 text-[11px] text-graphit/65 opacity-0 transition group-hover:opacity-100 sm:inline">✎</span>
        </dd>
      )}
    </div>
  );
}

/** Account deletion card. Two-step confirmation: click to expand the
 *  card into a confirmation form, user types DELETE, click red button
 *  to actually delete. Replaces the previous mailto:support fallback
 *  with a proper DSGVO Art. 17 "Recht auf Löschung" in-app flow. */
function DeleteAccountCard({ labels }: { labels: ReturnType<typeof accountLabels> }) {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function performDelete() {
    setWorking(true);
    setError(null);
    try {
      const ok = await deleteAccount();
      if (!ok) {
        setError(labels.deleteErrorBody);
        setWorking(false);
        return;
      }
      // Success: bounce to landing with a small confirmation
      navigate('/?bye=1', { replace: true });
    } catch {
      setError(labels.deleteErrorBody);
      setWorking(false);
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="block w-full rounded-card border border-navy/15 bg-white px-5 py-4 text-left transition hover:border-red-500/40"
      >
        <div className="font-serif text-base text-navy">
          {labels.deleteTitle}
        </div>
        <div className="mt-1 font-sans text-sm leading-relaxed text-graphit/65">
          {labels.deleteBody}
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-card border border-red-300/60 bg-rose-50/40 px-5 py-4">
      <div className="font-serif text-base text-navy">{labels.deleteTitle}</div>
      <p className="mt-2 font-sans text-sm leading-relaxed text-graphit/85">
        {labels.deleteConfirmBody}
      </p>
      <label className="mt-4 block">
        <span className="font-sans text-[11px] uppercase tracking-widest text-graphit/65">
          {labels.deleteConfirmLabel}
        </span>
        <input
          type="text"
          autoFocus
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={working}
          aria-label={labels.deleteConfirmLabel}
          className="mt-1 block w-full rounded-card border border-navy/20 bg-white px-3 py-2 font-mono text-sm text-graphit focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-60"
        />
      </label>
      {error && (
        <p role="alert" className="mt-3 font-sans text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => { setExpanded(false); setConfirmText(''); setError(null); }}
          disabled={working}
          className="rounded-card border border-navy/20 bg-white px-4 py-2 font-sans text-sm text-graphit/85 transition hover:border-navy/40 hover:text-navy disabled:opacity-60"
        >
          {labels.deleteCancel}
        </button>
        <button
          type="button"
          onClick={performDelete}
          disabled={working || confirmText !== 'DELETE'}
          className="rounded-card bg-red-600 px-4 py-2 font-sans text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {working ? labels.deleteWorking : labels.deleteFinal}
        </button>
      </div>
    </div>
  );
}

/* ─── Labels ────────────────────────────────────────────────────────── */

function accountLabels(locale: string) {
  if (locale.startsWith('es')) return {
    headTitle: 'Tu cuenta · VozClara',
    headDescription: 'Tu panel de cuenta — plan, estadísticas y ajustes.',
    eyebrow: 'TU CUENTA',
    greeting: (n: string) => `Hola, ${n}.`,
    planFree: 'PLAN GRATUITO',
    memberSince: 'Miembro desde',
    device: 'dispositivo',
    devices: 'dispositivos',
    statPacks: 'PACKS',
    statPacksHint: 'En tu biblioteca personal',
    statPacksEmpty: 'Crea tu primer Knowledge Pack →',
    statLangs: 'IDIOMAS',
    statLangsHint: 'Idiomas en los que aprendes',
    statLangsEmpty: 'Empieza con uno cualquiera →',
    statDue: 'POR REPASAR',
    statDueHint: 'Tarjetas SRS para hoy',
    statDueEmpty: 'Todo al día — vuelve mañana',
    streakChip: (n: number) => `🔥 ${n} ${n === 1 ? 'día' : 'días'}`,
    streakLabel: 'RACHA DIARIA',
    streakDays: (n: number) => (n === 1 ? 'día seguido' : 'días seguidos'),
    streakLongest: (n: number) => `Récord: ${n} ${n === 1 ? 'día' : 'días'}`,
    streakStart: 'Empieza tu racha con un repaso hoy.',
    sectionRecent: 'ÚLTIMOS PACKS',
    recentHeading: 'Lo último que viste.',
    sectionPlan: 'PLAN Y FACTURACIÓN',
    planHeading: 'Tu plan.',
    currentPlan: 'Plan actual',
    planFreeBlurb: 'Sin tarjeta. Sin límite de tiempo.',
    founderPitch: '¿Quieres Pro de por vida? Los primeros 100 fundadores pagan 99 € una sola vez.',
    founderCta: 'Ver Founder Deal',
    sectionAccount: 'CUENTA',
    accountHeading: 'Tus datos.',
    fieldEmail: 'EMAIL',
    fieldName: 'NOMBRE',
    fieldLang: 'IDIOMA',
    fieldUserId: 'ID DE USUARIO',
    notSet: 'sin definir',
    namePlaceholder: 'Tu nombre',
    editNameAria: 'Editar nombre',
    deleteConfirmBody: 'Esto elimina tu cuenta y todos los datos asociados en nuestros servidores de forma permanente. Tu biblioteca local en este dispositivo no se borra.',
    deleteConfirmLabel: 'Escribe DELETE para confirmar',
    deleteCancel: 'Cancelar',
    deleteFinal: 'Eliminar para siempre',
    deleteWorking: 'Eliminando…',
    deleteErrorBody: 'No se pudo eliminar la cuenta. Vuelve a intentarlo o escribe a support@vozclara.app.',
    editHint: 'Para cambiar el email o eliminar la cuenta, escribe a support@vozclara.app — durante el periodo de lanzamiento todavía no hay edición en la app.',
    sectionDevices: 'DISPOSITIVOS',
    devicesHeading: 'Tus dispositivos.',
    devicesBody: 'Cada dispositivo desde el que has usado VozClara tiene su propio Brain ID anónimo. Al iniciar sesión, se vinculan a tu cuenta para que tu biblioteca se sincronice en todos.',
    brainIdLabel: 'Dispositivo',
    thisDevice: 'Este',
    sectionPrivacy: 'PRIVACIDAD Y DATOS',
    privacyHeading: 'Tus datos te pertenecen.',
    privacyBody: 'VozClara cumple con el RGPD. Puedes exportar tus datos o eliminar tu cuenta en cualquier momento.',
    exportTitle: 'Exportar mis datos',
    exportBody: 'Recibe un correo con todos los datos asociados a tu cuenta — usuario, packs, sesiones — en formato JSON.',
    deleteTitle: 'Eliminar mi cuenta',
    deleteBody: 'Elimina tu cuenta y todos los datos asociados de forma permanente. No se puede deshacer.',
    mailExportSubject: 'Exportar mis datos de VozClara',
    mailExportBody: (email: string) => `Hola,\n\nQuiero exportar todos los datos asociados a mi cuenta de VozClara (${email}) en formato JSON, conforme al art. 20 del RGPD.\n\nGracias.`,
    mailDeleteSubject: 'Eliminar mi cuenta de VozClara',
    mailDeleteBody: (email: string) => `Hola,\n\nQuiero eliminar de forma permanente mi cuenta de VozClara y todos los datos asociados (${email}), conforme al art. 17 del RGPD.\n\nGracias.`,
    signOut: 'Cerrar sesión',
  };

  if (locale.startsWith('pt')) return {
    headTitle: 'A tua conta · VozClara',
    headDescription: 'O teu painel de conta — plano, estatísticas e definições.',
    eyebrow: 'A TUA CONTA',
    greeting: (n: string) => `Olá, ${n}.`,
    planFree: 'PLANO GRATUITO',
    memberSince: 'Membro desde',
    device: 'dispositivo',
    devices: 'dispositivos',
    statPacks: 'PACKS',
    statPacksHint: 'Na tua biblioteca pessoal',
    statPacksEmpty: 'Cria o teu primeiro Knowledge Pack →',
    statLangs: 'IDIOMAS',
    statLangsHint: 'Línguas em que aprendes',
    statLangsEmpty: 'Começa por uma qualquer →',
    statDue: 'POR REVER',
    statDueHint: 'Cartões SRS para hoje',
    statDueEmpty: 'Tudo em dia — volta amanhã',
    streakChip: (n: number) => `🔥 ${n} ${n === 1 ? 'dia' : 'dias'}`,
    streakLabel: 'SEQUÊNCIA DIÁRIA',
    streakDays: (n: number) => (n === 1 ? 'dia seguido' : 'dias seguidos'),
    streakLongest: (n: number) => `Recorde: ${n} ${n === 1 ? 'dia' : 'dias'}`,
    streakStart: 'Começa a tua sequência com uma revisão hoje.',
    sectionRecent: 'ÚLTIMOS PACKS',
    recentHeading: 'O que viste por último.',
    sectionPlan: 'PLANO E FATURAÇÃO',
    planHeading: 'O teu plano.',
    currentPlan: 'Plano atual',
    planFreeBlurb: 'Sem cartão. Sem limite de tempo.',
    founderPitch: 'Queres Pro para sempre? Os primeiros 100 fundadores pagam 99 € uma única vez.',
    founderCta: 'Ver Founder Deal',
    sectionAccount: 'CONTA',
    accountHeading: 'Os teus dados.',
    fieldEmail: 'EMAIL',
    fieldName: 'NOME',
    fieldLang: 'IDIOMA',
    fieldUserId: 'ID DE UTILIZADOR',
    notSet: 'não definido',
    namePlaceholder: 'O teu nome',
    editNameAria: 'Editar nome',
    deleteConfirmBody: 'Isto elimina a tua conta e todos os dados associados nos nossos servidores de forma permanente. A tua biblioteca local neste dispositivo não é apagada.',
    deleteConfirmLabel: 'Escreve DELETE para confirmar',
    deleteCancel: 'Cancelar',
    deleteFinal: 'Eliminar para sempre',
    deleteWorking: 'A eliminar…',
    deleteErrorBody: 'Não foi possível eliminar a conta. Tenta de novo ou escreve para support@vozclara.app.',
    editHint: 'Para alterar o email ou eliminar a conta, escreve para support@vozclara.app — durante o período de lançamento ainda não há edição na app.',
    sectionDevices: 'DISPOSITIVOS',
    devicesHeading: 'Os teus dispositivos.',
    devicesBody: 'Cada dispositivo a partir do qual usaste VozClara tem o seu próprio Brain ID anónimo. Ao iniciar sessão, ficam ligados à tua conta para que a tua biblioteca se sincronize em todos.',
    brainIdLabel: 'Dispositivo',
    thisDevice: 'Este',
    sectionPrivacy: 'PRIVACIDADE E DADOS',
    privacyHeading: 'Os teus dados são teus.',
    privacyBody: 'VozClara cumpre o RGPD. Podes exportar os teus dados ou eliminar a tua conta a qualquer momento.',
    exportTitle: 'Exportar os meus dados',
    exportBody: 'Recebe um email com todos os dados associados à tua conta — utilizador, packs, sessões — em formato JSON.',
    deleteTitle: 'Eliminar a minha conta',
    deleteBody: 'Elimina a tua conta e todos os dados associados de forma permanente. Não pode ser desfeito.',
    mailExportSubject: 'Exportar os meus dados de VozClara',
    mailExportBody: (email: string) => `Olá,\n\nQuero exportar todos os dados associados à minha conta VozClara (${email}) em formato JSON, ao abrigo do art. 20.º do RGPD.\n\nObrigado.`,
    mailDeleteSubject: 'Eliminar a minha conta VozClara',
    mailDeleteBody: (email: string) => `Olá,\n\nQuero eliminar de forma permanente a minha conta VozClara e todos os dados associados (${email}), ao abrigo do art. 17.º do RGPD.\n\nObrigado.`,
    signOut: 'Terminar sessão',
  };

  if (locale.startsWith('de')) return {
    headTitle: 'Dein Konto · VozClara',
    headDescription: 'Dein Konto-Dashboard — Plan, Statistiken und Einstellungen.',
    eyebrow: 'DEIN KONTO',
    greeting: (n: string) => `Hi, ${n}.`,
    planFree: 'KOSTENLOSER PLAN',
    memberSince: 'Mitglied seit',
    device: 'Gerät',
    devices: 'Geräte',
    statPacks: 'PACKS',
    statPacksHint: 'In deiner persönlichen Bibliothek',
    statPacksEmpty: 'Erstell deinen ersten Knowledge Pack →',
    statLangs: 'SPRACHEN',
    statLangsHint: 'Sprachen die du lernst',
    statLangsEmpty: 'Fang mit einer beliebigen an →',
    statDue: 'ZU WIEDERHOLEN',
    statDueHint: 'SRS-Karten heute fällig',
    statDueEmpty: 'Alles erledigt — komm morgen wieder',
    streakChip: (n: number) => `🔥 ${n} ${n === 1 ? 'Tag' : 'Tage'}`,
    streakLabel: 'TAGES-STREAK',
    streakDays: (n: number) => (n === 1 ? 'Tag in Folge' : 'Tage in Folge'),
    streakLongest: (n: number) => `Rekord: ${n} ${n === 1 ? 'Tag' : 'Tage'}`,
    streakStart: 'Starte deinen Streak mit einer Wiederholung heute.',
    sectionRecent: 'ZULETZT ANGESEHEN',
    recentHeading: 'Was du zuletzt geöffnet hast.',
    sectionPlan: 'PLAN UND ABRECHNUNG',
    planHeading: 'Dein Plan.',
    currentPlan: 'Aktueller Plan',
    planFreeBlurb: 'Keine Karte. Kein Zeitlimit.',
    founderPitch: 'Pro für immer? Die ersten 100 Founder zahlen einmalig 99 €.',
    founderCta: 'Founder Deal ansehen',
    sectionAccount: 'KONTO',
    accountHeading: 'Deine Daten.',
    fieldEmail: 'E-MAIL',
    fieldName: 'NAME',
    fieldLang: 'SPRACHE',
    fieldUserId: 'BENUTZER-ID',
    notSet: 'nicht festgelegt',
    namePlaceholder: 'Dein Name',
    editNameAria: 'Namen bearbeiten',
    deleteConfirmBody: 'Das löscht dein Konto und alle zugehörigen Daten auf unseren Servern dauerhaft. Deine lokale Bibliothek auf diesem Gerät bleibt unberührt.',
    deleteConfirmLabel: 'Tippe DELETE zum Bestätigen',
    deleteCancel: 'Abbrechen',
    deleteFinal: 'Endgültig löschen',
    deleteWorking: 'Wird gelöscht…',
    deleteErrorBody: 'Konto konnte nicht gelöscht werden. Versuch es erneut oder schreib an support@vozclara.app.',
    editHint: 'Um die E-Mail zu ändern oder das Konto zu löschen, schreib an support@vozclara.app — während der Launch-Phase gibt es noch keine In-App-Bearbeitung.',
    sectionDevices: 'GERÄTE',
    devicesHeading: 'Deine Geräte.',
    devicesBody: 'Jedes Gerät, von dem aus du VozClara genutzt hast, hat eine eigene anonyme Brain-ID. Beim Login werden sie mit deinem Konto verknüpft, damit deine Bibliothek auf allen Geräten synchron bleibt.',
    brainIdLabel: 'Gerät',
    thisDevice: 'Aktuell',
    sectionPrivacy: 'DATENSCHUTZ & DATEN',
    privacyHeading: 'Deine Daten gehören dir.',
    privacyBody: 'VozClara erfüllt die DSGVO. Du kannst deine Daten jederzeit exportieren oder dein Konto löschen lassen.',
    exportTitle: 'Meine Daten exportieren',
    exportBody: 'Erhalte eine E-Mail mit allen zu deinem Konto gehörenden Daten — Profil, Packs, Sessions — im JSON-Format.',
    deleteTitle: 'Mein Konto löschen',
    deleteBody: 'Lösche dein Konto und alle zugehörigen Daten dauerhaft. Kann nicht rückgängig gemacht werden.',
    mailExportSubject: 'Datenexport zu meinem VozClara-Konto',
    mailExportBody: (email: string) => `Hallo,\n\nich möchte alle Daten zu meinem VozClara-Konto (${email}) im JSON-Format exportieren — gemäß Art. 20 DSGVO.\n\nDanke.`,
    mailDeleteSubject: 'Löschung meines VozClara-Kontos',
    mailDeleteBody: (email: string) => `Hallo,\n\nich möchte mein VozClara-Konto und alle zugehörigen Daten (${email}) gemäß Art. 17 DSGVO dauerhaft löschen lassen.\n\nDanke.`,
    signOut: 'Abmelden',
  };

  return {
    headTitle: 'Your account · VozClara',
    headDescription: 'Your account dashboard — plan, stats, and settings.',
    eyebrow: 'YOUR ACCOUNT',
    greeting: (n: string) => `Hi, ${n}.`,
    planFree: 'FREE PLAN',
    memberSince: 'Member since',
    device: 'device',
    devices: 'devices',
    statPacks: 'PACKS',
    statPacksHint: 'In your personal library',
    statPacksEmpty: 'Create your first Knowledge Pack →',
    statLangs: 'LANGUAGES',
    statLangsHint: 'Languages you learn',
    statLangsEmpty: 'Start with any one →',
    statDue: 'TO REVIEW',
    statDueHint: 'SRS cards due today',
    statDueEmpty: 'All caught up — come back tomorrow',
    streakChip: (n: number) => `🔥 ${n} ${n === 1 ? 'day' : 'days'}`,
    streakLabel: 'DAILY STREAK',
    streakDays: (n: number) => (n === 1 ? 'day in a row' : 'days in a row'),
    streakLongest: (n: number) => `Best: ${n} ${n === 1 ? 'day' : 'days'}`,
    streakStart: 'Start your streak with a review today.',
    sectionRecent: 'RECENTLY OPENED',
    recentHeading: 'What you opened last.',
    sectionPlan: 'PLAN & BILLING',
    planHeading: 'Your plan.',
    currentPlan: 'Current plan',
    planFreeBlurb: 'No card. No time limit.',
    founderPitch: 'Want Pro forever? The first 100 founders pay 99 € once.',
    founderCta: 'See Founder Deal',
    sectionAccount: 'ACCOUNT',
    accountHeading: 'Your info.',
    fieldEmail: 'EMAIL',
    fieldName: 'NAME',
    fieldLang: 'LANGUAGE',
    fieldUserId: 'USER ID',
    notSet: 'not set',
    namePlaceholder: 'Your name',
    editNameAria: 'Edit name',
    deleteConfirmBody: 'This permanently deletes your account and all associated data on our servers. Your local library on this device stays intact.',
    deleteConfirmLabel: 'Type DELETE to confirm',
    deleteCancel: 'Cancel',
    deleteFinal: 'Delete forever',
    deleteWorking: 'Deleting…',
    deleteErrorBody: 'Could not delete the account. Try again or write to support@vozclara.app.',
    editHint: 'To change your email or delete your account, write to support@vozclara.app — during launch there is no in-app editing yet.',
    sectionDevices: 'DEVICES',
    devicesHeading: 'Your devices.',
    devicesBody: 'Every device you used VozClara from has its own anonymous Brain ID. When you sign in, they get linked to your account so your library syncs across all of them.',
    brainIdLabel: 'Device',
    thisDevice: 'This one',
    sectionPrivacy: 'PRIVACY & DATA',
    privacyHeading: 'Your data is yours.',
    privacyBody: 'VozClara is GDPR-compliant. You can export your data or delete your account at any time.',
    exportTitle: 'Export my data',
    exportBody: 'Receive an email with all the data tied to your account — profile, packs, sessions — in JSON format.',
    deleteTitle: 'Delete my account',
    deleteBody: 'Permanently delete your account and all associated data. Cannot be undone.',
    mailExportSubject: 'Export my VozClara data',
    mailExportBody: (email: string) => `Hi,\n\nI would like to export all data associated with my VozClara account (${email}) in JSON format under GDPR Art. 20.\n\nThanks.`,
    mailDeleteSubject: 'Delete my VozClara account',
    mailDeleteBody: (email: string) => `Hi,\n\nI would like to permanently delete my VozClara account and all associated data (${email}) under GDPR Art. 17.\n\nThanks.`,
    signOut: 'Sign out',
  };
}
