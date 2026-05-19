import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';

/**
 * /refund — Refund policy.
 *
 * Required by Paddle (Merchant-of-Record) and EU Consumer Rights Directive.
 *
 * Posture:
 *   • 14-day money-back window from purchase date for any paid product
 *     (Founder Lifetime, Pro, Pro Plus). No questions asked.
 *   • Subscriptions: cancel any time; access continues until end of the
 *     paid period; no pro-rated refund for the partially-used period
 *     (industry standard for digital subscriptions).
 *   • EU customers: explicit reminder of the 14-day statutory withdrawal
 *     right under Art. 16(m); we honour it even when immediate digital
 *     access has been used.
 *   • Refunds are processed by Paddle (our Merchant-of-Record) within
 *     5–10 business days back to the original payment method.
 *
 * Editorial layout matches /terms — § eyebrow, gold rule, serif body,
 * alternating creme/white bands.
 */
export function RefundPage() {
  const { locale } = useLocale();
  const labels = refundLabels(locale);

  usePageHead({
    title: labels.headTitle,
    description: labels.headDescription,
  });

  return (
    <main id="main" className="bg-creme paper">
      <div className="mx-auto max-w-3xl px-5 pt-6 sm:px-8 sm:pt-8">
        <Link to="/" className="font-sans text-sm text-graphit/65 underline-offset-4 hover:text-navy hover:underline">
          ← {labels.backHome}
        </Link>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-14">
        <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
          § {labels.sectionLabel}
        </div>
        <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-navy sm:text-5xl">
          {labels.heroTitle}
        </h1>
        <div className="mt-6 h-px w-16 bg-gold" aria-hidden />
        <p className="mt-6 font-serif text-xl leading-relaxed text-graphit/85 sm:text-2xl">
          {labels.heroLead}
        </p>
        <p className="mt-5 font-sans text-[11px] uppercase tracking-widest text-graphit/65">
          {labels.lastUpdatedLabel} {labels.lastUpdated}
        </p>
      </section>

      {/* Sections */}
      {labels.sections.map((s, i) => (
        <section key={i} className={i % 2 === 0 ? 'bg-white/70 py-12 sm:py-16' : 'py-12 sm:py-16'}>
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
              · {String(i + 1).padStart(2, '0')}
            </div>
            <h2 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
              {s.heading}
            </h2>
            <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
            <div className="mt-6 space-y-4 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
              {s.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Contact block */}
      <section className="border-t border-navy/10 bg-creme py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="font-sans text-[10px] uppercase tracking-[0.4em] text-gold-deep">
            § {labels.contactLabel}
          </div>
          <h2 className="mt-3 font-serif text-2xl leading-tight text-navy sm:text-3xl">
            {labels.contactHeading}
          </h2>
          <div className="mt-5 h-px w-12 bg-gold" aria-hidden />
          <p className="mt-6 font-serif text-lg leading-relaxed text-graphit/85 sm:text-xl">
            <a href="mailto:hello@vozclara.app" className="text-navy underline decoration-gold underline-offset-4 hover:decoration-2">
              hello@vozclara.app
            </a>
          </p>
          <p className="mt-5 font-sans text-sm italic text-graphit/65">
            {labels.contactNote}
          </p>
        </div>
      </section>
    </main>
  );
}

function refundLabels(locale: string) {
  const lastUpdated = locale.startsWith('es')
    ? 'mayo 2026'
    : locale.startsWith('pt')
      ? 'maio 2026'
      : locale.startsWith('de')
        ? 'Mai 2026'
        : 'May 2026';

  if (locale.startsWith('es')) return {
    headTitle: 'Política de reembolso — VozClara',
    headDescription:
      'Garantía de devolución de 14 días, sin preguntas. Cancela tu suscripción cuando quieras.',
    backHome: 'Volver a la página principal',
    sectionLabel: 'Reembolsos',
    heroTitle: '14 días. Sin preguntas.',
    heroLead:
      'Si VozClara no te convence, devolvemos tu dinero dentro de los 14 días posteriores a la compra. Esto vale para el pase Founder, Pro y Pro Plus.',
    lastUpdatedLabel: 'Actualizado',
    lastUpdated,
    sections: [
      {
        heading: 'Ventana de 14 días',
        body: [
          'Cualquier compra en VozClara — el pase Founder vitalicio, una suscripción Pro o Pro Plus — puede reembolsarse en su totalidad dentro de los 14 días siguientes a la fecha de pago. No exigimos justificación.',
          'Esto se aplica tanto si has generado Packs como si no. Tu derecho de desistimiento bajo la directiva de derechos del consumidor de la UE (Art. 16(m)) lo respetamos incluso cuando el contenido digital ya se ha ejecutado.',
        ],
      },
      {
        heading: 'Suscripciones recurrentes',
        body: [
          'Puedes cancelar tu suscripción mensual en cualquier momento desde tu portal de cliente. Mantendrás el acceso hasta el final del período facturado; no se prorratea el tiempo restante (estándar de la industria para SaaS digitales).',
          'Si cancelas dentro de los primeros 14 días, recibirás un reembolso completo. Después de ese plazo, las cancelaciones cierran el ciclo siguiente sin reembolso adicional.',
        ],
      },
      {
        heading: 'Pase Founder vitalicio',
        body: [
          'El pase Founder vitalicio (99 €) está cubierto por la misma garantía de 14 días. Si decides que no es para ti, te devolvemos el importe íntegro.',
          'Después del plazo de 14 días, el pase Founder no es reembolsable porque concede acceso vitalicio a una edición limitada (capped a 100 plazas).',
        ],
      },
      {
        heading: 'Cómo solicitar un reembolso',
        body: [
          'Escríbenos a hello@vozclara.app con el correo electrónico que usaste en la compra. Procesamos la solicitud manualmente y respondemos en un máximo de 2 días hábiles.',
          'El reembolso lo gestiona Paddle, nuestro Merchant-of-Record. Verás el cargo revertido en el método de pago original dentro de 5 a 10 días hábiles, según tu banco.',
        ],
      },
      {
        heading: 'Excepciones',
        body: [
          'No procesamos reembolsos por suscripciones que llevan activas más de 12 meses ininterrumpidos. No procesamos reembolsos por compras realizadas con tarjetas reportadas como robadas o disputadas como fraude — esos casos los gestiona directamente Paddle.',
        ],
      },
    ],
    contactLabel: 'Contacto',
    contactHeading: 'Pídelo aquí.',
    contactNote:
      'Para evitar fricción, indica en el correo el nombre del producto que compraste (Founder / Pro / Pro Plus) y la fecha aproximada del pago. Te confirmamos en menos de 48 horas.',
  };

  if (locale.startsWith('pt')) return {
    headTitle: 'Política de reembolso — VozClara',
    headDescription:
      'Garantia de devolução de 14 dias, sem perguntas. Cancela a tua subscrição quando quiseres.',
    backHome: 'Voltar à página principal',
    sectionLabel: 'Reembolsos',
    heroTitle: '14 dias. Sem perguntas.',
    heroLead:
      'Se a VozClara não te convencer, devolvemos o teu dinheiro nos 14 dias seguintes à compra. Vale para o passe Founder, Pro e Pro Plus.',
    lastUpdatedLabel: 'Atualizado',
    lastUpdated,
    sections: [
      {
        heading: 'Janela de 14 dias',
        body: [
          'Qualquer compra na VozClara — o passe Founder vitalício, uma subscrição Pro ou Pro Plus — pode ser reembolsada integralmente nos 14 dias seguintes à data de pagamento. Não exigimos justificação.',
          'Aplica-se tanto se já geraste Packs como se não. O teu direito de livre resolução ao abrigo da diretiva de direitos do consumidor da UE (Art. 16(m)) é respeitado mesmo quando o conteúdo digital já foi executado.',
        ],
      },
      {
        heading: 'Subscrições recorrentes',
        body: [
          'Podes cancelar a tua subscrição mensal a qualquer momento a partir do teu portal de cliente. Mantens o acesso até ao final do período faturado; não há proporcionalidade pelo tempo restante (padrão da indústria para SaaS digitais).',
          'Se cancelares nos primeiros 14 dias, recebes o reembolso integral. Depois desse prazo, os cancelamentos encerram o ciclo seguinte sem reembolso adicional.',
        ],
      },
      {
        heading: 'Passe Founder vitalício',
        body: [
          'O passe Founder vitalício (€99) está coberto pela mesma garantia de 14 dias. Se decidires que não é para ti, devolvemos o valor integral.',
          'Após os 14 dias, o passe Founder não é reembolsável porque concede acesso vitalício a uma edição limitada (capped a 100 lugares).',
        ],
      },
      {
        heading: 'Como pedir um reembolso',
        body: [
          'Escreve para hello@vozclara.app com o email que usaste na compra. Processamos o pedido manualmente e respondemos no máximo em 2 dias úteis.',
          'O reembolso é gerido pela Paddle, o nosso Merchant-of-Record. Verás o pagamento revertido no método original em 5 a 10 dias úteis, dependendo do teu banco.',
        ],
      },
      {
        heading: 'Exceções',
        body: [
          'Não processamos reembolsos para subscrições ativas há mais de 12 meses ininterruptos. Não processamos reembolsos para compras feitas com cartões reportados como roubados ou disputados como fraude — esses casos são geridos diretamente pela Paddle.',
        ],
      },
    ],
    contactLabel: 'Contacto',
    contactHeading: 'Pede aqui.',
    contactNote:
      'Para evitar fricção, indica no email o nome do produto que compraste (Founder / Pro / Pro Plus) e a data aproximada do pagamento. Confirmamos em menos de 48 horas.',
  };

  if (locale.startsWith('de')) return {
    headTitle: 'Rückerstattungs-Policy — VozClara',
    headDescription:
      '14-Tage-Geld-zurück-Garantie ohne Wenn und Aber. Abo jederzeit kündbar.',
    backHome: 'Zurück zur Startseite',
    sectionLabel: 'Rückerstattung',
    heroTitle: '14 Tage. Keine Rückfragen.',
    heroLead:
      'Wenn VozClara dich nicht überzeugt, erstatten wir dein Geld innerhalb von 14 Tagen nach dem Kauf. Gilt für Founder, Pro und Pro Plus.',
    lastUpdatedLabel: 'Aktualisiert',
    lastUpdated,
    sections: [
      {
        heading: '14-Tage-Fenster',
        body: [
          'Jeder Kauf bei VozClara — der lebenslange Founder-Pass, ein Pro- oder Pro-Plus-Abo — kann innerhalb von 14 Tagen nach dem Zahlungsdatum vollständig erstattet werden. Wir verlangen keine Begründung.',
          'Das gilt unabhängig davon, ob du bereits Packs erzeugt hast oder nicht. Dein Widerrufsrecht nach der EU-Verbraucherrechte-Richtlinie (Art. 16(m)) honorieren wir auch dann, wenn der digitale Dienst bereits ausgeführt wurde.',
        ],
      },
      {
        heading: 'Wiederkehrende Abos',
        body: [
          'Du kannst dein Monats-Abo jederzeit über das Kundenportal kündigen. Der Zugang bleibt bis zum Ende des bezahlten Zeitraums bestehen; eine anteilige Erstattung für die restliche Laufzeit findet nicht statt (Branchenstandard für digitale SaaS).',
          'Wenn du innerhalb der ersten 14 Tage kündigst, gibt es die vollständige Rückerstattung. Danach beendet die Kündigung lediglich den nächsten Abrechnungszyklus.',
        ],
      },
      {
        heading: 'Lebenslanger Founder-Pass',
        body: [
          'Der lebenslange Founder-Pass (99 €) ist von derselben 14-Tage-Garantie abgedeckt. Wenn du dich umentscheidest, erstatten wir den Gesamtbetrag.',
          'Nach Ablauf der 14 Tage ist der Founder-Pass nicht mehr rückerstattbar, weil er einen lebenslangen Zugang innerhalb einer limitierten Edition (Cap bei 100 Plätzen) gewährt.',
        ],
      },
      {
        heading: 'Erstattung anfordern',
        body: [
          'Schreib uns an hello@vozclara.app mit der E-Mail-Adresse, die du beim Kauf verwendet hast. Wir bearbeiten den Antrag manuell und antworten innerhalb von 2 Werktagen.',
          'Die Erstattung wickelt Paddle, unser Merchant-of-Record, ab. Der Betrag erscheint innerhalb von 5 bis 10 Werktagen auf dem ursprünglichen Zahlungsmittel — abhängig von deiner Bank.',
        ],
      },
      {
        heading: 'Ausnahmen',
        body: [
          'Wir erstatten keine Abos, die länger als 12 Monate ununterbrochen aktiv waren. Wir erstatten keine Käufe mit Karten, die als gestohlen gemeldet oder als Betrug bestritten wurden — solche Fälle bearbeitet Paddle direkt.',
        ],
      },
    ],
    contactLabel: 'Kontakt',
    contactHeading: 'Hier melden.',
    contactNote:
      'Zur Beschleunigung bitte den gekauften Produktnamen (Founder / Pro / Pro Plus) und das ungefähre Kaufdatum in der E-Mail angeben. Bestätigung innerhalb von 48 Stunden.',
  };

  return {
    headTitle: 'Refund policy — VozClara',
    headDescription:
      '14-day money-back guarantee, no questions asked. Cancel your subscription anytime.',
    backHome: 'Back to home',
    sectionLabel: 'Refunds',
    heroTitle: '14 days. No questions.',
    heroLead:
      "If VozClara isn't right for you, we'll refund your purchase within 14 days. That covers the Founder pass, Pro, and Pro Plus.",
    lastUpdatedLabel: 'Updated',
    lastUpdated,
    sections: [
      {
        heading: '14-day window',
        body: [
          'Any purchase on VozClara — the lifetime Founder pass, a Pro or Pro Plus subscription — can be refunded in full within 14 days of the payment date. We do not ask for a reason.',
          "This applies whether you've generated Packs or not. Your statutory withdrawal right under the EU Consumer Rights Directive (Art. 16(m)) is honoured even when the digital service has already been performed.",
        ],
      },
      {
        heading: 'Recurring subscriptions',
        body: [
          'You can cancel your monthly subscription any time from your customer portal. Access continues until the end of the paid period; we do not pro-rate the unused remainder (industry standard for digital SaaS).',
          'If you cancel within the first 14 days, you receive a full refund. After that window, cancellations close the next billing cycle with no additional refund.',
        ],
      },
      {
        heading: 'Lifetime Founder pass',
        body: [
          'The lifetime Founder pass (€99) is covered by the same 14-day guarantee. If you change your mind, we refund the full amount.',
          'After the 14-day window, the Founder pass is non-refundable because it grants lifetime access within a limited edition (capped at 100 seats).',
        ],
      },
      {
        heading: 'How to request a refund',
        body: [
          'Email hello@vozclara.app with the email address you used at checkout. We process requests manually and reply within 2 business days.',
          "The refund is handled by Paddle, our Merchant-of-Record. You'll see the charge reversed on your original payment method within 5 to 10 business days, depending on your bank.",
        ],
      },
      {
        heading: 'Exceptions',
        body: [
          'We do not process refunds for subscriptions that have been continuously active for more than 12 months. We do not process refunds for purchases made with cards reported stolen or disputed as fraud — those cases are handled directly by Paddle.',
        ],
      },
    ],
    contactLabel: 'Contact',
    contactHeading: 'Reach out here.',
    contactNote:
      "To speed things up, include the product you bought (Founder / Pro / Pro Plus) and the approximate payment date in your email. We confirm within 48 hours.",
  };
}
