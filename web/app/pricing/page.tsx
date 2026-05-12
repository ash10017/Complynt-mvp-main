import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — Complynt',
  description: "Simple, transparent pricing. Start free. Upgrade when you're ready. No hidden fees, no lock-in contracts.",
}

const plans = [
  {
    name:     'Starter',
    price:    'Free',
    period:   'forever',
    desc:     'Perfect for a single outlet getting started with compliance tracking.',
    features: [
      'Up to 3 compliance items',
      'Deadline calendar',
      'Email reminders',
      'Document vault (50 MB)',
      'Basic health score',
    ],
    cta:      'Get started free',
    href:     '/onboarding',
    featured: false,
  },
  {
    name:     'Pro',
    price:    '£39',
    period:   'per month',
    desc:     'For growing businesses that need full coverage and multi-location support.',
    badge:    'Most popular',
    features: [
      'Unlimited compliance items',
      'SMS + email reminders',
      'Document vault (5 GB)',
      'Multi-location (up to 5)',
      'Compliance health report',
      'Priority support',
      'AI compliance assistant',
    ],
    cta:      'Start free trial',
    href:     '/onboarding',
    featured: true,
  },
  {
    name:     'Enterprise',
    price:    'Custom',
    period:   '',
    desc:     'For groups, franchises, and chains that need unlimited scale and dedicated support.',
    features: [
      'Everything in Pro',
      'Unlimited locations',
      'Dedicated account manager',
      'Custom integrations & API',
      'White-label option',
      'SLA guarantee',
      'Onboarding & training',
    ],
    cta:      'Talk to us',
    href:     '/contact',
    featured: false,
  },
]

const faqs = [
  { q: 'Is the free plan really free forever?', a: 'Yes. The Starter plan is free with no time limit. You can use it as long as you want for up to 3 compliance items.' },
  { q: 'Can I switch regions?', a: 'Absolutely. You can track compliances for the UK or Australia — and more regions are coming soon.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards. UK customers can also pay via bank transfer.' },
  { q: 'Can I cancel anytime?', a: 'Yes, no lock-in contracts. Cancel anytime and your data is always yours to export.' },
  { q: 'Do you offer discounts for multiple locations?', a: 'Yes — Pro covers up to 5 locations. For larger groups, talk to us about our Enterprise plan.' },
]

export default function PricingPage() {
  return (
    <>
      <Nav solid />
      <main style={{ paddingTop: 'var(--nav-h)' }}>

        {/* Hero */}
        <section className="text-center px-5 pt-[72px] pb-14 max-w-[680px] mx-auto">
          <span className="text-[12px] font-bold text-[#0071e3] uppercase tracking-widest block mb-3">Pricing</span>
          <h1 className="text-[clamp(26px,3.5vw,38px)] font-bold text-[#1d1d1f] tracking-tight mb-3">
            Simple, transparent pricing.
          </h1>
          <p className="text-base text-[#6e6e73]">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no lock-in contracts.
          </p>
        </section>

        {/* Plans */}
        <section className="max-w-[1060px] mx-auto px-5 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {plans.map(p => (
              <div
                key={p.name}
                className={`relative bg-white rounded-[20px] p-7 border flex flex-col ${
                  p.featured
                    ? 'border-[#0071e3] shadow-[0_8px_32px_rgba(0,113,227,.12)]'
                    : 'border-[#e5e5ea]'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0071e3] text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {p.badge}
                  </span>
                )}
                <div className="text-[20px] font-bold text-[#1d1d1f] mb-1.5">{p.name}</div>
                <div className="text-[13px] text-[#6e6e73] mb-4 leading-relaxed">{p.desc}</div>
                <div className="text-[38px] font-extrabold text-[#1d1d1f] leading-none mb-1">{p.price}</div>
                {p.period && <div className="text-[13px] text-[#a1a1a6] mb-5">{p.period}</div>}
                <ul className="flex flex-col gap-2 mb-6 flex-1 list-none pl-0">
                  {p.features.map(f => (
                    <li key={f} className="flex gap-2 items-start text-[13px] text-[#6e6e73]">
                      <span className="text-[#34c759] font-bold shrink-0 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className={`block text-center py-3.5 rounded-[10px] font-semibold text-[15px] transition-colors mt-auto ${
                    p.featured
                      ? 'bg-[#0071e3] text-white hover:bg-[#0058b0]'
                      : 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#e5e5ea] hover:bg-[#e5e5ea]'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-[720px] mx-auto px-5 pb-20">
          <h2 className="text-[clamp(22px,3vw,32px)] font-bold text-[#1d1d1f] tracking-tight mb-8">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-6">
            {faqs.map(f => (
              <div key={f.q} className="border-b border-[#e5e5ea] pb-5">
                <div className="text-[16px] font-semibold text-[#1d1d1f] mb-2">{f.q}</div>
                <div className="text-[14px] text-[#6e6e73] leading-relaxed">{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="px-5 pb-20">
          <div className="bg-gradient-to-br from-[#0071e3] to-[#0058b0] rounded-[24px] p-16 text-center">
            <h2 className="text-[clamp(26px,3.5vw,38px)] font-extrabold text-white mb-3">
              Still have questions?
            </h2>
            <p className="text-[16px] text-white/80 mb-8 max-w-[480px] mx-auto">
              Talk to our team — we&apos;ll help you find the right plan for your business.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/onboarding"
                className="bg-white text-[#0071e3] px-7 py-3.5 rounded-[12px] font-bold text-[15px] hover:bg-[#f0f0f0] transition-colors"
              >
                Start free
              </Link>
              <Link
                href="/contact"
                className="bg-white/15 text-white border border-white/30 px-7 py-3.5 rounded-[12px] font-semibold text-[15px] hover:bg-white/25 transition-colors"
              >
                Talk to us →
              </Link>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
