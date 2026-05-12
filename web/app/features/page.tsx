import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Features — Complynt',
  description: 'See how Complynt tracks every licence, deadline, and compliance document for your hospitality business.',
}

const features = [
  {
    title: 'Compliance Dashboard',
    desc: 'See all your licences, deadlines, and documents in one place. Filter by category, search by name, and track status at a glance.',
    detail: ['Colour-coded deadline badges (overdue, due soon, on track)', 'Search and filter by category', 'Mark items complete with one click', 'Full compliance history per item'],
  },
  {
    title: 'Smart Deadline Alerts',
    desc: 'Automated reminders 30, 7, and 1 day before each deadline — sent to your email and phone.',
    detail: ['30/7/1-day email reminders', 'SMS alerts (Pro plan)', 'Customisable notification preferences', 'Alert summary digest'],
  },
  {
    title: 'Document Vault',
    desc: 'Upload and attach PDFs, certificates, and inspection reports to each compliance item. Access them any time.',
    detail: ['Attach documents to specific compliance items', 'Expiry date tracking per document', 'Secure cloud storage', 'One-click download'],
  },
  {
    title: 'Compliance Calendar',
    desc: 'Monthly calendar view showing all upcoming deadlines. Click any date to see what\'s due and act on it.',
    detail: ['Monthly grid with deadline dots', 'Click-through to compliance detail', 'Previous/next month navigation', 'Colour-coded by urgency'],
  },
  {
    title: 'Health Score',
    desc: 'An instant compliance health score out of 100 based on your overdue items, upcoming deadlines, and completed obligations.',
    detail: ['0–100 health score with colour indicator', 'Urgent items list on overview', 'Upcoming 30-day deadlines', 'Completed items tracking'],
  },
  {
    title: 'Multi-location',
    desc: 'Run multiple outlets? Manage compliance for all of them from a single Complynt account.',
    detail: ['Up to 5 locations on Pro plan', 'Unlimited on Enterprise', 'Per-location dashboard', 'Group-level health score'],
  },
  {
    title: 'AI Assistant',
    desc: 'Ask compliance questions and get instant answers tailored to your region and business type.',
    detail: ['Ask about deadlines, fines, and requirements', 'Region-aware answers (UK and AU)', 'Linked to your specific compliance items', 'Always learning from updated regulations'],
  },
  {
    title: 'Onboarding Wizard',
    desc: 'Set up your entire compliance profile in under 5 minutes. Select your business type, pick your licences, set expiry dates.',
    detail: ['Business type selection (restaurant, hotel, café, etc.)', 'Pre-loaded licence catalogue per region', 'Bulk expiry date entry', 'Automatic compliance profile generation'],
  },
]

export default function FeaturesPage() {
  return (
    <>
      <Nav solid />
      <main style={{ paddingTop: 'var(--nav-h)' }}>

        {/* Hero */}
        <section className="text-center px-5 pt-[72px] pb-14 max-w-[680px] mx-auto">
          <span className="text-[12px] font-bold text-[#0071e3] uppercase tracking-widest block mb-3">Features</span>
          <h1 className="text-[clamp(26px,3.5vw,38px)] font-bold text-[#1d1d1f] tracking-tight mb-3">
            Everything you need to stay compliant.
          </h1>
          <p className="text-base text-[#6e6e73]">
            From deadline tracking to document storage, Complynt covers every aspect of compliance for hospitality businesses.
          </p>
        </section>

        {/* Features grid */}
        <section className="max-w-[1060px] mx-auto px-5 pb-16">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={f.title} style={{ background: i % 3 === 1 ? 'var(--blue)' : 'var(--bg)', border: '1px solid var(--border-lt)', borderRadius: 20, padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: i % 3 === 1 ? '#fff' : 'var(--text)', marginBottom: 10, letterSpacing: '-.02em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: i % 3 === 1 ? 'rgba(255,255,255,.8)' : 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>{f.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {f.detail.map(d => (
                    <li key={d} style={{ fontSize: 13, color: i % 3 === 1 ? 'rgba(255,255,255,.9)' : 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: i % 3 === 1 ? 'rgba(255,255,255,.7)' : 'var(--green)', fontWeight: 700 }}>✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="px-5 pb-20">
          <div className="bg-gradient-to-br from-[#0071e3] to-[#0058b0] rounded-[24px] p-16 text-center">
            <h2 className="text-[clamp(26px,3.5vw,38px)] font-extrabold text-white mb-3">
              See it all in action.
            </h2>
            <p className="text-[16px] text-white/80 mb-8 max-w-[480px] mx-auto">
              Set up your compliance profile in under 5 minutes. No credit card required.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/onboarding" className="bg-white text-[#0071e3] px-7 py-3.5 rounded-[12px] font-bold text-[15px] hover:bg-[#f0f0f0] transition-colors">
                Get started free
              </Link>
              <Link href="/contact" className="bg-white/15 text-white border border-white/30 px-7 py-3.5 rounded-[12px] font-semibold text-[15px] hover:bg-white/25 transition-colors">
                Talk to us →
              </Link>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
