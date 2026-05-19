import { Link } from 'react-router-dom';
import { useLocale } from '../lib/i18n';
import { usePageHead } from '../hooks/usePageHead';

/**
 * /refund — Refund policy.
 *
 * Required by Paddle (Merchant-of-Record) and EU Consumer Rights Directive.
 *
 * Posture (balanced — generous enough to build trust, tight enough
 * to limit abuse):
 *   • 14-day money-back window from purchase date for new buyers
 *     (Founder Lifetime, Pro, Pro Plus). Full refund if the service
 *     has not been substantially used.
 *   • Substantial use within the window (e.g. heavy pack generation
 *     or extensive Pro Plus usage) may result in a partial refund or
 *     decline at our discretion — assessed in good faith.
 *   • Upon refund, access to content generated under the refunded tier
 *     may be revoked.
 *   • Subscriptions: cancel any time; access continues until end of the
 *     paid period; no pro-rated refund for the partially-used period
 *     (industry standard for digital subscriptions).
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
            <a href="mailto:finance@leonmare.de" className="text-navy underline decoration-gold underline-offset-4 hover:decoration-2">
              finance@leonmare.de
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
      'Garantía de devolución de 14 días para nuevas compras. Cancela tu suscripción cuando quieras.',
    backHome: 'Volver a la página principal',
    sectionLabel: 'Reembolsos',
    heroTitle: '14 días para decidir.',
    heroLead:
      'Si VozClara no es lo que esperabas, devolvemos tu dinero dentro de los 14 días posteriores a la compra. Esto vale para el pase Founder, Pro y Pro Plus.',
    lastUpdatedLabel: 'Actualizado',
    lastUpdated,
    sections: [
      {
        heading: 'Ventana de 14 días',
        body: [
          'Cualquier compra en VozClara — el pase Founder vitalicio, una suscripción Pro o Pro Plus — puede reembolsarse en su totalidad dentro de los 14 días siguientes a la fecha de pago, siempre que el servicio no se haya utilizado de forma sustancial.',
          'Si has utilizado el servicio de manera significativa durante ese plazo (por ejemplo, generando muchos Packs o usando intensivamente funciones de Pro Plus), evaluamos el reembolso caso por caso de buena fe: puede aprobarse de forma parcial o denegarse a nuestra discreción. Cuando se concede un reembolso, el acceso al contenido generado bajo el nivel reembolsado puede ser revocado.',
        ],
      },
      {
        heading: 'Suscripciones recurrentes',
        body: [
          'Puedes cancelar tu suscripción mensual en cualquier momento desde tu portal de cliente. Mantendrás el acceso hasta el final del período facturado; no se prorratea el tiempo restante (estándar de la industria para SaaS digitales).',
          'Si cancelas dentro de los primeros 14 días y no has utilizado el servicio de forma sustancial, recibirás un reembolso completo. Después de ese plazo, las cancelaciones cierran el ciclo siguiente sin reembolso adicional.',
        ],
      },
      {
        heading: 'Pase Founder vitalicio',
        body: [
          'El pase Founder vitalicio (99 €) está cubierto por la misma garantía de 14 días, con la misma condición de uso razonable durante ese plazo.',
          'Después del plazo de 14 días, el pase Founder no es reembolsable porque concede acceso vitalicio a una edición limitada (capped a 100 plazas).',
        ],
      },
      {
        heading: 'Cómo solicitar un reembolso',
        body: [
          'Escríbenos a finance@leonmare.de desde el correo electrónico que usaste en la compra. Indica el producto adquirido (Founder / Pro / Pro Plus) y la fecha aproximada del pago. Procesamos la solicitud manualmente y respondemos en un máximo de 5 días hábiles.',
          'El reembolso lo gestiona Paddle, nuestro Merchant-of-Record. Verás el cargo revertido en el método de pago original dentro de 5 a 10 días hábiles, según tu banco.',
        ],
      },
      {
        heading: 'Excepciones',
        body: [
          'Las suscripciones que han estado activas de forma ininterrumpida durante más de 12 meses se consideran totalmente consumidas y no son reembolsables.',
          'Los reembolsos por compras realizadas con tarjetas reportadas como robadas o disputadas como fraude los gestiona directamente Paddle dentro de su proceso de chargeback.',
          'Nos reservamos el derecho de denegar reembolsos en caso de uso evidentemente abusivo del servicio (por ejemplo, compras repetidas seguidas de reembolso, o evasión de límites del plan).',
        ],
      },
    ],
    contactLabel: 'Contacto',
    contactHeading: 'Pídelo aquí.',
    contactNote:
      'Para evitar fricción, indica en el correo el nombre del producto que compraste (Founder / Pro / Pro Plus) y la fecha aproximada del pago. Confirmamos en menos de 5 días hábiles.',
  };

  if (locale.startsWith('pt')) return {
    headTitle: 'Política de reembolso — VozClara',
    headDescription:
      'Garantia de devolução de 14 dias para novas compras. Cancela a tua subscrição quando quiseres.',
    backHome: 'Voltar à página principal',
    sectionLabel: 'Reembolsos',
    heroTitle: '14 dias para decidir.',
    heroLead:
      'Se a VozClara não for o que esperavas, devolvemos o teu dinheiro nos 14 dias seguintes à compra. Vale para o passe Founder, Pro e Pro Plus.',
    lastUpdatedLabel: 'Atualizado',
    lastUpdated,
    sections: [
      {
        heading: 'Janela de 14 dias',
        body: [
          'Qualquer compra na VozClara — o passe Founder vitalício, uma subscrição Pro ou Pro Plus — pode ser reembolsada integralmente nos 14 dias seguintes à data de pagamento, desde que o serviço não tenha sido utilizado de forma substancial.',
          'Se utilizaste o serviço de forma significativa durante esse prazo (por exemplo, gerando muitos Packs ou usando intensivamente as funcionalidades Pro Plus), avaliamos o reembolso caso a caso de boa-fé: pode ser aprovado parcialmente ou recusado ao nosso critério. Quando um reembolso é concedido, o acesso ao conteúdo gerado sob o nível reembolsado pode ser revogado.',
        ],
      },
      {
        heading: 'Subscrições recorrentes',
        body: [
          'Podes cancelar a tua subscrição mensal a qualquer momento a partir do teu portal de cliente. Mantens o acesso até ao final do período faturado; não há proporcionalidade pelo tempo restante (padrão da indústria para SaaS digitais).',
          'Se cancelares nos primeiros 14 dias e não tiveres utilizado o serviço de forma substancial, recebes o reembolso integral. Depois desse prazo, os cancelamentos encerram o ciclo seguinte sem reembolso adicional.',
        ],
      },
      {
        heading: 'Passe Founder vitalício',
        body: [
          'O passe Founder vitalício (€99) está coberto pela mesma garantia de 14 dias, com a mesma condição de uso razoável durante esse prazo.',
          'Após os 14 dias, o passe Founder não é reembolsável porque concede acesso vitalício a uma edição limitada (capped a 100 lugares).',
        ],
      },
      {
        heading: 'Como pedir um reembolso',
        body: [
          'Escreve para finance@leonmare.de a partir do email que usaste na compra. Indica o produto adquirido (Founder / Pro / Pro Plus) e a data aproximada do pagamento. Processamos o pedido manualmente e respondemos no máximo em 5 dias úteis.',
          'O reembolso é gerido pela Paddle, o nosso Merchant-of-Record. Verás o pagamento revertido no método original em 5 a 10 dias úteis, dependendo do teu banco.',
        ],
      },
      {
        heading: 'Exceções',
        body: [
          'As subscrições que estiveram ativas ininterruptamente durante mais de 12 meses consideram-se totalmente consumidas e não são reembolsáveis.',
          'Os reembolsos para compras feitas com cartões reportados como roubados ou disputados como fraude são geridos diretamente pela Paddle no seu processo de chargeback.',
          'Reservamos o direito de recusar reembolsos em casos de uso manifestamente abusivo do serviço (por exemplo, compras repetidas seguidas de reembolso ou contorno de limites do plano).',
        ],
      },
    ],
    contactLabel: 'Contacto',
    contactHeading: 'Pede aqui.',
    contactNote:
      'Para evitar fricção, indica no email o nome do produto que compraste (Founder / Pro / Pro Plus) e a data aproximada do pagamento. Confirmamos em menos de 5 dias úteis.',
  };

  if (locale.startsWith('de')) return {
    headTitle: 'Rückerstattungs-Policy — VozClara',
    headDescription:
      '14-Tage-Geld-zurück-Garantie für neue Käufe. Abo jederzeit kündbar.',
    backHome: 'Zurück zur Startseite',
    sectionLabel: 'Rückerstattung',
    heroTitle: '14 Tage zum Entscheiden.',
    heroLead:
      'Wenn VozClara nicht das ist, was du erwartet hast, erstatten wir dein Geld innerhalb von 14 Tagen nach dem Kauf. Gilt für Founder, Pro und Pro Plus.',
    lastUpdatedLabel: 'Aktualisiert',
    lastUpdated,
    sections: [
      {
        heading: '14-Tage-Fenster',
        body: [
          'Jeder Kauf bei VozClara — der lebenslange Founder-Pass, ein Pro- oder Pro-Plus-Abo — kann innerhalb von 14 Tagen nach dem Zahlungsdatum vollständig erstattet werden, sofern der Dienst nicht substanziell genutzt wurde.',
          'Wenn du den Dienst in diesem Zeitraum erheblich genutzt hast (zum Beispiel viele Packs erzeugt oder Pro-Plus-Funktionen intensiv verwendet), prüfen wir den Antrag im Einzelfall nach Treu und Glauben: eine anteilige Erstattung oder Ablehnung liegt in unserem Ermessen. Bei einer Erstattung kann der Zugang zu Inhalten, die unter der erstatteten Stufe erzeugt wurden, widerrufen werden.',
        ],
      },
      {
        heading: 'Wiederkehrende Abos',
        body: [
          'Du kannst dein Monats-Abo jederzeit über das Kundenportal kündigen. Der Zugang bleibt bis zum Ende des bezahlten Zeitraums bestehen; eine anteilige Erstattung für die restliche Laufzeit findet nicht statt (Branchenstandard für digitale SaaS).',
          'Wenn du innerhalb der ersten 14 Tage kündigst und den Dienst nicht substanziell genutzt hast, gibt es die vollständige Rückerstattung. Danach beendet die Kündigung lediglich den nächsten Abrechnungszyklus.',
        ],
      },
      {
        heading: 'Lebenslanger Founder-Pass',
        body: [
          'Der lebenslange Founder-Pass (99 €) ist von derselben 14-Tage-Garantie abgedeckt, mit derselben Bedingung angemessener Nutzung in diesem Zeitraum.',
          'Nach Ablauf der 14 Tage ist der Founder-Pass nicht mehr rückerstattbar, weil er einen lebenslangen Zugang innerhalb einer limitierten Edition (Cap bei 100 Plätzen) gewährt.',
        ],
      },
      {
        heading: 'Erstattung anfordern',
        body: [
          'Schreib uns an finance@leonmare.de von der E-Mail-Adresse, mit der du gekauft hast. Nenne das gekaufte Produkt (Founder / Pro / Pro Plus) und das ungefähre Kaufdatum. Wir bearbeiten den Antrag manuell und antworten innerhalb von 5 Werktagen.',
          'Die Erstattung wickelt Paddle, unser Merchant-of-Record, ab. Der Betrag erscheint innerhalb von 5 bis 10 Werktagen auf dem ursprünglichen Zahlungsmittel — abhängig von deiner Bank.',
        ],
      },
      {
        heading: 'Ausnahmen',
        body: [
          'Abos, die mehr als 12 Monate ununterbrochen aktiv waren, gelten als vollständig in Anspruch genommen und sind nicht erstattungsfähig.',
          'Erstattungen für Käufe mit als gestohlen gemeldeten oder als Betrug bestrittenen Karten werden direkt von Paddle im Chargeback-Prozess bearbeitet.',
          'Wir behalten uns vor, Erstattungen bei offensichtlich missbräuchlicher Nutzung des Dienstes abzulehnen (zum Beispiel wiederholte Käufe gefolgt von Erstattungen oder Umgehen der Plan-Limits).',
        ],
      },
    ],
    contactLabel: 'Kontakt',
    contactHeading: 'Hier melden.',
    contactNote:
      'Zur Beschleunigung bitte den gekauften Produktnamen (Founder / Pro / Pro Plus) und das ungefähre Kaufdatum in der E-Mail angeben. Bestätigung innerhalb von 5 Werktagen.',
  };

  return {
    headTitle: 'Refund policy — VozClara',
    headDescription:
      '14-day money-back guarantee for new purchases. Cancel your subscription anytime.',
    backHome: 'Back to home',
    sectionLabel: 'Refunds',
    heroTitle: '14 days to decide.',
    heroLead:
      "If VozClara isn't what you expected, we'll refund your purchase within 14 days. That covers the Founder pass, Pro, and Pro Plus.",
    lastUpdatedLabel: 'Updated',
    lastUpdated,
    sections: [
      {
        heading: '14-day window',
        body: [
          'Any purchase on VozClara — the lifetime Founder pass, a Pro or Pro Plus subscription — can be refunded in full within 14 days of the payment date, provided the service has not been substantially used.',
          'If you have substantially used the service during that window (for example, generated many Packs or used Pro Plus features extensively), we assess the request case by case in good faith — a partial refund or decline is at our discretion. When a refund is granted, access to content generated under the refunded tier may be revoked.',
        ],
      },
      {
        heading: 'Recurring subscriptions',
        body: [
          'You can cancel your monthly subscription any time from your customer portal. Access continues until the end of the paid period; we do not pro-rate the unused remainder (industry standard for digital SaaS).',
          "If you cancel within the first 14 days and haven't substantially used the service, you receive a full refund. After that window, cancellations close the next billing cycle with no additional refund.",
        ],
      },
      {
        heading: 'Lifetime Founder pass',
        body: [
          'The lifetime Founder pass (€99) is covered by the same 14-day guarantee, with the same reasonable-use condition during that period.',
          'After the 14-day window, the Founder pass is non-refundable because it grants lifetime access within a limited edition (capped at 100 seats).',
        ],
      },
      {
        heading: 'How to request a refund',
        body: [
          'Email finance@leonmare.de from the address you used at checkout. Include the product you bought (Founder / Pro / Pro Plus) and the approximate payment date. We process requests manually and reply within 5 business days.',
          "The refund is handled by Paddle, our Merchant-of-Record. You'll see the charge reversed on your original payment method within 5 to 10 business days, depending on your bank.",
        ],
      },
      {
        heading: 'Exceptions',
        body: [
          'Subscriptions that have been continuously active for more than 12 months are considered fully consumed and are not refundable.',
          'Refunds for purchases made with cards reported as stolen or disputed as fraud are handled directly by Paddle within their chargeback process.',
          'We reserve the right to decline refunds in cases of clearly abusive use of the service (for example, repeated purchases followed by refunds, or circumvention of plan limits).',
        ],
      },
    ],
    contactLabel: 'Contact',
    contactHeading: 'Reach out here.',
    contactNote:
      "To speed things up, include the product you bought (Founder / Pro / Pro Plus) and the approximate payment date in your email. We confirm within 5 business days.",
  };
}
