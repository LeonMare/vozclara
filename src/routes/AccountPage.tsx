import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';
import { getBrainId, libraryStats, type LibraryStats } from '../lib/pack';
import { dueSummary, type DueSummary } from '../lib/srs';

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

  usePageHead({
    title: labels.headTitle,
    description: labels.headDescription,
  });

  /* Pull stats on mount. Cheap — IndexedDB reads. Re-runs if the user
     attaches a new brainId (different identity → different library). */
  useEffect(() => {
    const brainId = getBrainId();
    void libraryStats(brainId).then(setStats);
    void dueSummary(brainId).then(setDue);
  }, [user?.id]);

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
          <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
            § {labels.eyebrow}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-navy sm:text-5xl">
            {labels.greeting(displayName)}
          </h1>
          <div className="mt-4 h-px w-16 bg-gold" aria-hidden />

          <div className="mt-6 flex flex-wrap items-center gap-3 font-sans text-[10px] uppercase tracking-widest">
            <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-1 text-gold">
              <span className="text-creme/50">●</span> {labels.planFree}
            </span>
            <span className="rounded-full bg-navy/8 px-2.5 py-1 text-graphit/70">
              {labels.memberSince} {memberSince}
            </span>
            <span className="rounded-full bg-navy/8 px-2.5 py-1 text-graphit/70">
              {user.brainIds.length} {user.brainIds.length === 1 ? labels.device : labels.devices}
            </span>
          </div>
        </section>

        {/* ─── 2 · Stats triplet ─────────────────────────────────────── */}
        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          <StatCard
            value={stats?.totalPacks ?? 0}
            label={labels.statPacks}
            href="/library"
            hint={labels.statPacksHint}
          />
          <StatCard
            value={stats?.totalLangs ?? 0}
            label={labels.statLangs}
            href="/library"
            hint={labels.statLangsHint}
          />
          <StatCard
            value={due?.due ?? 0}
            label={labels.statDue}
            href="/review"
            hint={labels.statDueHint}
            accent={Boolean(due?.due && due.due > 0)}
          />
        </section>

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
                <div className="font-sans text-[10px] uppercase tracking-widest text-gold">
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
            <AccountRow
              label={labels.fieldName}
              value={user.displayName ?? labels.notSet}
              muted={!user.displayName}
            />
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

          <p className="mt-3 font-sans text-xs leading-relaxed text-graphit/55">
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
                      <div className="mt-0.5 truncate font-mono text-[11px] text-graphit/55">
                        {bid}
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 font-sans text-[10px] uppercase tracking-widest text-gold">
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
            <a
              href={`mailto:support@vozclara.app?subject=${encodeURIComponent(labels.mailDeleteSubject)}&body=${encodeURIComponent(labels.mailDeleteBody(user.email))}`}
              className="block rounded-card border border-navy/15 bg-white px-5 py-4 transition hover:border-red-500/40"
            >
              <div className="font-serif text-base text-navy">
                {labels.deleteTitle}
              </div>
              <div className="mt-1 font-sans text-sm leading-relaxed text-graphit/65">
                {labels.deleteBody}
              </div>
            </a>
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

/* ─── Subcomponents ─────────────────────────────────────────────────── */

function SectionEyebrow({ text }: { text: string }) {
  return (
    <p className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold">
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
      <div className="mt-3 font-sans text-[11px] uppercase tracking-widest text-gold">
        {label}
      </div>
      <div className="mt-1 font-sans text-xs leading-relaxed text-graphit/55 group-hover:text-graphit/75">
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
      <dt className="shrink-0 font-sans text-[11px] uppercase tracking-widest text-graphit/55">
        {label}
      </dt>
      <dd
        className={[
          'truncate text-right',
          mono ? 'font-mono text-xs text-graphit/65' : 'font-serif text-base',
          muted ? 'italic text-graphit/45' : 'text-navy',
        ].join(' ')}
      >
        {value}
      </dd>
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
    statLangs: 'IDIOMAS',
    statLangsHint: 'Idiomas en los que aprendes',
    statDue: 'POR REPASAR',
    statDueHint: 'Tarjetas SRS para hoy',
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
    statLangs: 'IDIOMAS',
    statLangsHint: 'Línguas em que aprendes',
    statDue: 'POR REVER',
    statDueHint: 'Cartões SRS para hoje',
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
    statLangs: 'SPRACHEN',
    statLangsHint: 'Sprachen die du lernst',
    statDue: 'ZU WIEDERHOLEN',
    statDueHint: 'SRS-Karten heute fällig',
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
    statLangs: 'LANGUAGES',
    statLangsHint: 'Languages you learn',
    statDue: 'TO REVIEW',
    statDueHint: 'SRS cards due today',
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
