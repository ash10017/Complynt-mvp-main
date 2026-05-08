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
    detail: ['Ask about deadlines, fines, and requirements', 'Region-aware answers (India, AU, UK)', 'Linked to your specific compliance items', 'Always learning from updated regulations'],
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
        <section style={{ textAlign: 'center', padding: '72px 20px 56px', maxWidth: 680, margin: '0 auto' }}>
          <span className="eyebrow">Features</span>
          <h1 className="section-headline">Everything you need to stay compliant.</h1>
          <p className="section-sub">
            From deadline tracking to document storage, Complynt covers every aspect of compliance for hospitality businesses.
          </p>
        </section>

        {/* Features grid */}
        <section className="section" style={{ paddingTop: 0 }}>
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
        <div style={{ padding: '0 20px 80px' }}>
          <div className="cta-section">
            <h2 className="cta-headline">See it all in action.</h2>
            <p className="cta-sub">Set up your compliance profile in under 5 minutes. No credit card required.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/onboarding" style={{ background: '#fff', color: 'var(--blue)', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
                Get started free
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
