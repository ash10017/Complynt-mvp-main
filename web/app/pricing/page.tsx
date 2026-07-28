'use client'
import { useState } from 'react'
import Link from 'next/link'

const FREE_FEATURES = [
  'Up to 15 compliance items',
  '1 location',
  'HACCP plan generator',
  'Allergen matrix builder',
  'Temperature log tracker',
  'Staff training tracker',
  'Basic AI compliance assistant',
  'Compliance calendar',
]

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited compliance items',
  'Document vault (1 GB storage)',
  'Email + SMS deadline reminders',
  'PDF compliance reports',
  'EHO Inspection Simulator',
  'Live FHRS rating lookup',
  'Priority support',
]

const BIZ_FEATURES = [
  'Everything in Pro',
  'Up to 5 locations',
  'Multi-location dashboard',
  'Team access (up to 5 users)',
  'Branded PDF compliance reports',
  'Dedicated account manager',
  'Custom compliance items',
  'Compliance audit trail',
]

const COMPARE = [
  { feature: 'Compliance items',       free: 'Up to 15',  pro: 'Unlimited', biz: 'Unlimited' },
  { feature: 'Locations',              free: '1',         pro: '1',         biz: 'Up to 5' },
  { feature: 'Team members',           free: '1',         pro: '1',         biz: 'Up to 5' },
  { feature: 'HACCP generator',        free: true,        pro: true,        biz: true },
  { feature: 'Allergen matrix',        free: true,        pro: true,        biz: true },
  { feature: 'Temperature logs',       free: true,        pro: true,        biz: true },
  { feature: 'Staff training tracker', free: true,        pro: true,        biz: true },
  { feature: 'AI assistant',           free: 'Basic',     pro: 'Full',      biz: 'Full' },
  { feature: 'Document vault',         free: false,       pro: '1 GB',      biz: '5 GB' },
  { feature: 'Email reminders',        free: false,       pro: true,        biz: true },
  { feature: 'SMS reminders',          free: false,       pro: true,        biz: true },
  { feature: 'PDF reports',            free: false,       pro: true,        biz: 'Branded' },
  { feature: 'EHO Simulator',          free: false,       pro: true,        biz: true },
  { feature: 'FHRS rating lookup',     free: false,       pro: true,        biz: true },
  { feature: 'Multi-location',         free: false,       pro: false,       biz: true },
  { feature: 'Audit trail',            free: false,       pro: false,       biz: true },
  { feature: 'Dedicated manager',      free: false,       pro: false,       biz: true },
]

const FAQS = [
  { q: 'Is the free plan really free forever?', a: 'Yes. The Free plan has no time limit. You can use Complynt indefinitely for up to 15 compliance items with no credit card required.' },
  { q: 'What does the document vault store?', a: 'Any compliance document — fire risk assessments, gas safety certificates (CP12), HACCP plans, employer\'s liability insurance, food hygiene certificates, right-to-work records, and more. Files are stored securely in Firebase Storage.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No lock-in contracts, no cancellation fees. Cancel from your account settings and your data is always yours to export.' },
  { q: 'How does the annual discount work?', a: 'Paying annually gives you 2 months free — Pro drops from £19/mo to £15/mo (£180/yr), and Business from £49/mo to £39/mo (£468/yr).' },
  { q: 'Do you cover multiple UK regions?', a: 'Yes — the product covers food law across all of England, Wales, Scotland, and Northern Ireland. FHRS applies across the whole UK.' },
  { q: 'Can I add more locations later?', a: 'Absolutely. Upgrade to Business at any time to add up to 5 locations. For larger groups or chains, contact us about Enterprise pricing.' },
]

function CellVal({ val }: { val: boolean | string }) {
  if (val === true) return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
  if (val === false) return <span style={{ color: '#d2d2d7', fontSize: 16 }}>—</span>
  return <span style={{ color: '#1d1d1f', fontSize: 13, fontWeight: 500 }}>{val}</span>
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)

  if (typeof window !== 'undefined') {
    // passive scroll listener for nav
  }

  const proPrice  = annual ? 15 : 19
  const bizPrice  = annual ? 39 : 49

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 62, background: 'rgba(2,12,21,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(20px,4vw,48px)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          </div>
          <span style={{ color: '#fff', fontSize: 17, fontWeight: 800, letterSpacing: '-0.4px' }}>Complynt</span>
        </Link>
        <div style={{ display: 'flex', gap: 28 }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 500 }}>Home</Link>
          <Link href="/pricing" style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>Pricing</Link>
          <Link href="/contact" style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 500 }}>Contact</Link>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>Log in</Link>
          <Link href="/onboarding" style={{ background: '#0071e3', color: '#fff', fontSize: 14, fontWeight: 700, padding: '8px 18px', borderRadius: 100, textDecoration: 'none' }}>Get started free</Link>
        </div>
      </nav>

      {/* ── DARK HERO ── */}
      <section style={{ background: '#020c15', paddingTop: 132, paddingBottom: 80, paddingLeft: 'clamp(20px,4vw,48px)', paddingRight: 'clamp(20px,4vw,48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -80, left: '20%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.13) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,113,227,0.14)', border: '1px solid rgba(0,113,227,0.28)', borderRadius: 100, padding: '5px 15px', marginBottom: 22 }}>
            <span style={{ color: '#60a5fa', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pricing</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, letterSpacing: '-1.2px', lineHeight: 1.06, marginBottom: 16 }}>
            Simple, transparent pricing.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 18, lineHeight: 1.65, maxWidth: 480, margin: '0 auto 36px' }}>
            Start free — no credit card, no time limit. Upgrade when you&apos;re ready.
          </p>

          {/* billing toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 8px 6px 20px' }}>
            <span style={{ color: !annual ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 600, transition: 'color 0.2s' }}>Monthly</span>
            <button onClick={() => setAnnual(v => !v)} style={{ position: 'relative', width: 44, height: 24, borderRadius: 100, background: annual ? '#0071e3' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', transition: 'background 0.2s', padding: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: annual ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
            </button>
            <span style={{ color: annual ? '#fff' : 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: 600, transition: 'color 0.2s' }}>
              Annual
              <span style={{ marginLeft: 8, background: 'rgba(52,199,89,0.2)', border: '1px solid rgba(52,199,89,0.3)', color: '#34c759', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* ── PLAN CARDS ── */}
      <section style={{ background: '#f5f5f7', padding: 'clamp(48px,6vw,72px) clamp(20px,4vw,48px)' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>

          {/* Free */}
          <div style={{ background: '#fff', border: '1px solid #e5e5ea', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#6e6e73', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Free</div>
              <div style={{ fontSize: 44, fontWeight: 900, color: '#1d1d1f', letterSpacing: '-1.5px', lineHeight: 1, marginBottom: 4 }}>£0</div>
              <div style={{ color: '#a1a1a6', fontSize: 13 }}>forever</div>
            </div>
            <p style={{ color: '#6e6e73', fontSize: 13, lineHeight: 1.6, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e5e5ea' }}>
              Everything a single-site operator needs to get compliant and stay there.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {FREE_FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12"/></svg>
                  <span style={{ color: '#1d1d1f', fontSize: 13 }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/onboarding" style={{ display: 'block', textAlign: 'center', padding: '13px 0', borderRadius: 12, background: '#f5f5f7', border: '1px solid #e5e5ea', color: '#1d1d1f', fontSize: 14, fontWeight: 700, textDecoration: 'none', transition: 'background 0.15s' }}>
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div style={{ background: '#fff', border: '2px solid #0071e3', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 8px 40px rgba(0,113,227,0.14)' }}>
            <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#0071e3', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>Most popular</div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#0071e3', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Pro</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: '#1d1d1f', letterSpacing: '-1.5px', lineHeight: 1 }}>£{proPrice}</span>
                <span style={{ color: '#a1a1a6', fontSize: 13, paddingBottom: 6 }}>/mo</span>
              </div>
              {annual && <div style={{ color: '#34c759', fontSize: 12, fontWeight: 600 }}>£180/yr — save £48</div>}
              {!annual && <div style={{ color: '#a1a1a6', fontSize: 12 }}>or £15/mo billed annually</div>}
            </div>
            <p style={{ color: '#6e6e73', fontSize: 13, lineHeight: 1.6, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e5e5ea' }}>
              Full coverage for growing businesses that can&apos;t afford a compliance slip.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {PRO_FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12"/></svg>
                  <span style={{ color: '#1d1d1f', fontSize: 13 }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/onboarding" style={{ display: 'block', textAlign: 'center', padding: '13px 0', borderRadius: 12, background: '#0071e3', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,113,227,0.35)' }}>
              Start free trial
            </Link>
            <p style={{ textAlign: 'center', color: '#a1a1a6', fontSize: 11, marginTop: 10 }}>14-day free trial · No card required</p>
          </div>

          {/* Business */}
          <div style={{ background: '#fff', border: '1px solid #e5e5ea', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: '#6e6e73', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Business</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 44, fontWeight: 900, color: '#1d1d1f', letterSpacing: '-1.5px', lineHeight: 1 }}>£{bizPrice}</span>
                <span style={{ color: '#a1a1a6', fontSize: 13, paddingBottom: 6 }}>/mo</span>
              </div>
              {annual && <div style={{ color: '#34c759', fontSize: 12, fontWeight: 600 }}>£468/yr — save £120</div>}
              {!annual && <div style={{ color: '#a1a1a6', fontSize: 12 }}>or £39/mo billed annually</div>}
            </div>
            <p style={{ color: '#6e6e73', fontSize: 13, lineHeight: 1.6, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e5e5ea' }}>
              Multi-site operators and groups who need full team access and audit trails.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {BIZ_FEATURES.map(f => (
                <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12"/></svg>
                  <span style={{ color: '#1d1d1f', fontSize: 13 }}>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/contact" style={{ display: 'block', textAlign: 'center', padding: '13px 0', borderRadius: 12, background: '#f5f5f7', border: '1px solid #e5e5ea', color: '#1d1d1f', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURE COMPARISON ── */}
      <section style={{ background: '#fff', padding: 'clamp(48px,6vw,72px) clamp(20px,4vw,48px)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: '-0.6px', marginBottom: 36, textAlign: 'center' }}>Compare plans</h2>
          <div style={{ borderRadius: 20, border: '1px solid #e5e5ea', overflow: 'hidden' }}>
            {/* header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: '#f5f5f7', borderBottom: '1px solid #e5e5ea' }}>
              <div style={{ padding: '14px 20px', fontSize: 12, fontWeight: 800, color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feature</div>
              {['Free', 'Pro', 'Business'].map((h, i) => (
                <div key={h} style={{ padding: '14px 20px', textAlign: 'center', fontSize: 13, fontWeight: 800, color: i === 1 ? '#0071e3' : '#1d1d1f' }}>{h}</div>
              ))}
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: i < COMPARE.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ padding: '12px 20px', fontSize: 13, color: '#1d1d1f', fontWeight: 500 }}>{row.feature}</div>
                {([row.free, row.pro, row.biz] as (boolean | string)[]).map((v, j) => (
                  <div key={j} style={{ padding: '12px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: j === 1 ? 'rgba(0,113,227,0.025)' : 'transparent' }}>
                    <CellVal val={v} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: '#f5f5f7', padding: 'clamp(48px,6vw,72px) clamp(20px,4vw,48px)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: '-0.6px', marginBottom: 36, textAlign: 'center' }}>Frequently asked questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQS.map((f, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e5ea' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', textAlign: 'left', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <span style={{ color: '#1d1d1f', fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{f.q}</span>
                  <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6e6e73" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </div>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 20px 18px', color: '#6e6e73', fontSize: 14, lineHeight: 1.65 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(140deg, #004bb0 0%, #0071e3 55%, #0099ff 100%)', padding: 'clamp(60px,8vw,96px) clamp(20px,4vw,48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1.06, marginBottom: 16 }}>Start free today.</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, lineHeight: 1.65, marginBottom: 36 }}>
            No credit card. No time limit. Get compliant in under 10 minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/onboarding" style={{ background: '#fff', color: '#0071e3', fontWeight: 900, fontSize: 16, padding: '15px 32px', borderRadius: 100, textDecoration: 'none', boxShadow: '0 8px 28px rgba(0,0,0,0.15)' }}>
              Get started free
            </Link>
            <Link href="/contact" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 700, fontSize: 16, padding: '15px 28px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>
              Talk to us →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#020c15', padding: 'clamp(32px,4vw,48px) clamp(20px,4vw,48px) 28px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            </div>
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 800 }}>Complynt</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Home', 'Pricing', 'Contact'].map(l => (
              <Link key={l} href={l === 'Home' ? '/' : `/${l.toLowerCase()}`} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>{l}</Link>
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>© {new Date().getFullYear()} Complynt · UK only</p>
        </div>
      </footer>
    </div>
  )
}
