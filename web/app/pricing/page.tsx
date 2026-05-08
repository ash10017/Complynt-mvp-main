import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — Complynt',
  description: 'Simple, transparent pricing. Start free. Upgrade when you\'re ready. No hidden fees, no lock-in contracts.',
}

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for a single outlet getting started with compliance tracking.',
    features: [
      'Up to 3 compliance items',
      'Deadline calendar',
      'Email reminders',
      'Document vault (50 MB)',
      'Basic health score',
    ],
    cta: 'Get started free',
    href: '/onboarding',
    featured: false,
  },
  {
    name: 'Pro',
    price: '₹999',
    period: 'per month + GST',
    desc: 'For growing businesses that need full coverage and multi-location support.',
    badge: 'Most popular',
    features: [
      'Unlimited compliance items',
      'SMS + email reminders',
      'Document vault (5 GB)',
      'Multi-location (up to 5)',
      'Compliance health report',
      'Priority support',
      'AI compliance assistant',
    ],
    cta: 'Start free trial',
    href: '/onboarding',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For groups, franchises, and chains that need unlimited scale and dedicated support.',
    features: [
      'Everything in Pro',
      'Unlimited locations',
      'Dedicated account manager',
      'Custom integrations & API',
      'White-label option',
      'SLA guarantee',
      'Onboarding & training',
    ],
    cta: 'Talk to us',
    href: '/contact',
    featured: false,
  },
]

const faqs = [
  { q: 'Is the free plan really free forever?', a: 'Yes. The Starter plan is free with no time limit. You can use it as long as you want for up to 3 compliance items.' },
  { q: 'Can I switch regions?', a: 'Absolutely. You can track compliances for India, Australia, or the UK — and more regions are coming soon.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, and bank transfers for Indian customers. International cards accepted for AU and UK.' },
  { q: 'Can I cancel anytime?', a: 'Yes, no lock-in contracts. Cancel anytime and your data is always yours to export.' },
  { q: 'Do you offer discounts for multiple locations?', a: 'Yes — Pro covers up to 5 locations. For larger groups, talk to us about our Enterprise plan.' },
]

export default function PricingPage() {
  return (
    <>
      <Nav solid />
      <main style={{ paddingTop: 'var(--nav-h)' }}>

        {/* Hero */}
        <section style={{ textAlign: 'center', padding: '72px 20px 56px', maxWidth: 680, margin: '0 auto' }}>
          <span className="eyebrow">Pricing</span>
          <h1 className="section-headline">Simple, transparent pricing.</h1>
          <p className="section-sub">Start free. Upgrade when you&apos;re ready. No hidden fees, no lock-in contracts.</p>
        </section>

        {/* Plans */}
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="pricing-grid">
            {plans.map(p => (
              <div key={p.name} className={`pricing-card${p.featured ? ' featured' : ''}`}>
                {p.badge && <span className="pricing-badge">{p.badge}</span>}
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>{p.desc}</div>
                <div className="pricing-price" style={{ marginBottom: 4 }}>{p.price}</div>
                {p.period && <div className="pricing-period">{p.period}</div>}
                <ul className="pricing-features">
                  {p.features.map(f => <li key={f}>{f}</li>)}
                </ul>
                <Link
                  href={p.href}
                  style={{
                    display: 'block', textAlign: 'center', padding: '13px',
                    background: p.featured ? 'var(--blue)' : 'var(--bg-alt)',
                    color: p.featured ? '#fff' : 'var(--text)',
                    borderRadius: 10, fontWeight: 600, fontSize: 15,
                    border: p.featured ? 'none' : '1px solid var(--border-lt)',
                    marginTop: 'auto',
                  }}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="section" style={{ maxWidth: 720 }}>
          <h2 className="section-headline" style={{ marginBottom: 32 }}>Frequently asked questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {faqs.map(f => (
              <div key={f.q} style={{ borderBottom: '1px solid var(--border-lt)', paddingBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{f.q}</div>
                <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{ padding: '0 20px 80px' }}>
          <div className="cta-section">
            <h2 className="cta-headline">Still have questions?</h2>
            <p className="cta-sub">Talk to our team — we&apos;ll help you find the right plan for your business.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/onboarding" style={{ background: '#fff', color: 'var(--blue)', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
                Start free
              </Link>
              <Link href="/contact" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: 15, border: '1px solid rgba(255,255,255,.3)' }}>
                Talk to us →
              </Link>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
