'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function rv(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(28px)',
    transition: `opacity 0.65s ${delay}s ease, transform 0.65s ${delay}s ease`,
  }
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width: 30, height: 30, background: '#0071e3', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/><path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/></svg>
      </div>
      <span style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Complynt</span>
    </div>
  )
}

const FAQS = [
  { q: 'Do I need to switch from my current systems?', a: 'No. Set Complynt up alongside whatever you currently use — paper folders, spreadsheets, nothing. Most restaurant owners are set up in under two minutes.' },
  { q: 'Can I show it to an EHO inspector during a visit?', a: "Yes. Pull up your live dashboard to show HACCP records, temperature logs, allergen matrices, and training certificates in real time. Inspectors appreciate organised, timestamped digital records." },
  { q: 'What if I already have 5 stars?', a: "Keep them. FHRS ratings are re-assessed on every inspection and can change without warning. Complynt maintains the standard that earned your rating — automatically, year-round." },
  { q: 'Is it really free to start?', a: 'Yes — no credit card, no trial period that cuts off. The free plan covers your core compliance dashboard and deadline tracking. Paid plans start at £19/month for multi-location and SMS alerts.' },
  { q: 'What if I get a surprise inspection tonight?', a: "Your HACCP records, allergen matrix, temperature log history, and staff training certificates are all in Complynt — accessible from any device in seconds. That's the point." },
  { q: 'Does this replace a compliance consultant?', a: 'For day-to-day documentation and deadline tracking, yes. For complex licensing applications or legal disputes, a solicitor is still worth it. We remove the ongoing overhead cost, not the occasional specialist.' },
]

export default function ForRestaurantsPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const s1 = useReveal(), s2 = useReveal(), s3 = useReveal(), s4 = useReveal(), s5 = useReveal(), s6 = useReveal()

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', WebkitFontSmoothing: 'antialiased', overflowX: 'hidden', background: '#020c15' }}>

      {/* ── Nav ── */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 58, background: scrolled ? 'rgba(2,12,21,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none', transition: 'all 0.25s', display: 'flex', alignItems: 'center', padding: '0 clamp(20px,4vw,48px)', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>
        <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="for-rest-nav-desktop">
          {[['Features', '/features'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>{l}</Link>
          ))}
        </nav>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="for-rest-nav-desktop">
          <Link href="/login" style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', padding: '7px 14px' }}>Log in</Link>
          <Link href="/onboarding" style={{ fontSize: 14, fontWeight: 700, color: 'white', background: '#0071e3', textDecoration: 'none', padding: '8px 18px', borderRadius: 100, boxShadow: '0 4px 16px rgba(0,113,227,0.4)' }}>Start free</Link>
        </div>
        <button onClick={() => setMobileOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="for-rest-nav-mobile">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </header>
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: '#020c15', paddingTop: 68, paddingInline: 24, display: 'flex', flexDirection: 'column' }} onClick={() => setMobileOpen(false)}>
          {[['Features', '/features'], ['Pricing', '/pricing'], ['Contact', '/contact'], ['Log in', '/login']].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 18, color: 'white', textDecoration: 'none', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 500 }}>{l}</Link>
          ))}
          <Link href="/onboarding" style={{ marginTop: 24, background: '#0071e3', color: 'white', textDecoration: 'none', textAlign: 'center', padding: '15px', borderRadius: 12, fontSize: 16, fontWeight: 700 }}>Start free — no card needed</Link>
        </div>
      )}
      <style>{`.for-rest-nav-desktop{display:flex}.for-rest-nav-mobile{display:none}@media(max-width:768px){.for-rest-nav-desktop{display:none!important}.for-rest-nav-mobile{display:block!important}}`}</style>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: 'clamp(100px,12vw,140px) clamp(20px,4vw,48px) 80px' }}>
        {/* background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.18) 0%, transparent 65%)', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,59,48,0.06) 0%, transparent 65%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        </div>

        <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto', width: '100%', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.28)', borderRadius: 100, padding: '5px 15px', marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30', display: 'inline-block' }} />
            <span style={{ color: '#ff6b6b', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em' }}>For restaurant owners</span>
          </div>

          <h1 style={{ fontSize: 'clamp(36px,6vw,72px)', fontWeight: 900, color: 'white', lineHeight: 1.04, letterSpacing: '-0.035em', margin: '0 0 24px' }}>
            Your next EHO inspection<br />arrives unannounced.
          </h1>

          <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(255,255,255,0.52)', lineHeight: 1.65, maxWidth: 580, margin: '0 auto 40px', fontWeight: 400 }}>
            Complynt tracks every HACCP record, allergen matrix, temperature log, and staff certificate for your restaurant. So when the inspector knocks, you&apos;re already ready.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
            <Link href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#0071e3', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: 16, padding: '16px 34px', borderRadius: 100, boxShadow: '0 8px 32px rgba(0,113,227,0.45)', letterSpacing: '-0.01em' }}>
              Check my restaurant&apos;s risk — free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
            </Link>
            <Link href="/fhrs-check" style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600, fontSize: 15, padding: '16px 26px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.14)' }}>
              Free FHRS health check →
            </Link>
          </div>

          {/* 3 proof chips */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '✓', text: 'No credit card' },
              { icon: '✓', text: 'Set up in 2 minutes' },
              { icon: '✓', text: 'UK food law only' },
            ].map(c => (
              <div key={c.text} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.18)', borderRadius: 100, padding: '5px 14px' }}>
                <span style={{ color: '#34c759', fontSize: 12, fontWeight: 800 }}>{c.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500 }}>{c.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(transparent, #020c15)', pointerEvents: 'none' }} />
      </section>

      {/* ── What's at stake ── */}
      <section style={{ background: '#0a0f1a', padding: 'clamp(72px,8vw,100px) clamp(20px,4vw,48px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div ref={s1.ref} style={{ maxWidth: 1060, margin: '0 auto', ...rv(s1.visible) }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#ff6b6b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>What non-compliance costs restaurants</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
              The consequences are specific.<br />And they compound.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { rating: '3★ FHRS', consequence: 'Deliveroo and Uber Eats begin removal proceedings from their platforms.', color: '#ff9f0a', urgency: 'Revenue risk' },
              { rating: 'Allergen failure', consequence: "Unlimited fine and up to 2 years imprisonment under Natasha's Law. Trading Standards prosecute.", color: '#ff3b30', urgency: 'Criminal liability' },
              { rating: 'Right to Work', consequence: '£45,000 civil penalty per illegal worker. Criminal conviction for knowingly employing.', color: '#ff3b30', urgency: 'Per employee' },
              { rating: 'HACCP missing', consequence: 'Immediate Hygiene Improvement Notice. Trading standards can force closure within 24 hours.', color: '#ff9f0a', urgency: 'Inspection failure' },
            ].map(r => (
              <div key={r.rating} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${r.color}22`, borderTop: `3px solid ${r.color}`, borderRadius: 18, padding: '24px 22px' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: r.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{r.urgency}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 10 }}>{r.rating}</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: 0 }}>{r.consequence}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The 3 most common EHO failures ── */}
      <section style={{ background: '#020c15', padding: 'clamp(72px,8vw,100px) clamp(20px,4vw,48px)' }}>
        <div ref={s2.ref} style={{ maxWidth: 1060, margin: '0 auto', ...rv(s2.visible) }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Where restaurants lose their FHRS stars</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px' }}>
              It&apos;s never the food.
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
              The majority of FHRS downgrades aren&apos;t caused by unsafe food. They&apos;re caused by missing paperwork.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                pct: '45%',
                problem: 'HACCP records missing or out of date',
                detail: "The EHO's first ask is always your HACCP plan. If you can't produce it immediately, or it hasn't been reviewed in the past year, that's an automatic deduction.",
                fix: 'Complynt generates a fully compliant HACCP plan, stores it digitally, and alerts you when it needs reviewing.',
                color: '#ff3b30',
              },
              {
                pct: '38%',
                problem: 'No written allergen information',
                detail: "Since Natasha's Law in October 2021, verbal allergen disclosure is no longer sufficient. Every dish needs written allergen information — and it must be accurate.",
                fix: 'The Allergen Matrix Builder creates a complete written matrix for your full menu — all 14 regulated allergens, printable for display.',
                color: '#ff9f0a',
              },
              {
                pct: '29%',
                problem: 'Staff training certificates expired',
                detail: "Level 2 Food Hygiene certificates expire every 3 years. With high restaurant turnover, inspectors regularly find that front-line staff are serving food with lapsed qualifications.",
                fix: 'Staff Training tracks every certificate expiry date and alerts you 30 days before anything lapses.',
                color: '#0071e3',
              },
            ].map(f => (
              <div key={f.pct} style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ width: 100, background: `${f.color}12`, borderRight: `1px solid ${f.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '20px 0' }}>
                  <span style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 900, color: f.color, letterSpacing: '-0.03em' }}>{f.pct}</span>
                </div>
                <div style={{ padding: '24px 28px', flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 8 }}>{f.problem}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '0 0 12px' }}>{f.detail}</p>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12"/></svg>
                    <p style={{ fontSize: 13, color: '#34c759', lineHeight: 1.6, margin: 0 }}>{f.fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature showcase ── */}
      <section style={{ background: '#0a0f1a', padding: 'clamp(72px,8vw,100px) clamp(20px,4vw,48px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div ref={s3.ref} style={{ maxWidth: 1060, margin: '0 auto', ...rv(s3.visible) }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>The tools inside Complynt</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
              Built specifically for restaurant compliance.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {[
              { icon: '🔍', tag: 'Inspection Readiness', title: 'EHO Inspection Simulator', body: 'Walk through the exact scoring matrix that EHOs use. See your predicted FHRS rating and exactly which areas need attention — before the inspector arrives.', badge: 'Most popular' },
              { icon: '⚠️', tag: "Natasha's Law", title: 'Allergen Matrix Builder', body: 'Build a complete written allergen matrix for your full menu. All 14 EU-regulated allergens tracked per dish. Printable format ready for display.', badge: null },
              { icon: '🌡️', tag: 'Food Safety', title: 'Temperature Log', body: 'Digital temperature records for every fridge, freezer, and hot-hold station. Timestamped entries, automatic out-of-range alerts, downloadable audit history.', badge: null },
              { icon: '📋', tag: 'HACCP', title: 'HACCP Plan Generator', body: 'Answer 4 questions. Get a complete, legally compliant HACCP plan with every Critical Control Point pre-filled for your kitchen type. Sign and store.', badge: null },
              { icon: '👥', tag: 'HR & Training', title: 'Staff Training Tracker', body: 'Every Level 2 Food Hygiene certificate, Right to Work check, and training record — in one place. Automated 30-day alerts before anything expires.', badge: null },
              { icon: '🤖', tag: 'AI', title: 'Compliance Assistant', body: 'Ask anything about UK food law in plain English. Fridge temperature limits, allergen thresholds, DPS renewal windows, HACCP requirements — instant answers.', badge: null },
            ].map(f => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '24px 22px', position: 'relative' }}>
                {f.badge && (
                  <div style={{ position: 'absolute', top: 16, right: 16, background: '#0071e3', color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 100 }}>{f.badge}</div>
                )}
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{f.tag}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 10 }}>{f.title}</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ background: '#020c15', padding: 'clamp(72px,8vw,100px) clamp(20px,4vw,48px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.1) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div ref={s4.ref} style={{ maxWidth: 1060, margin: '0 auto', position: 'relative', ...rv(s4.visible) }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>From restaurant owners</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>
              Real results. Real restaurants.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { quote: 'We had a surprise EHO visit three months after signing up. The inspector went through our HACCP records, allergen matrix, and temperature logs in twenty minutes flat. We got our 5-star confirmed on the spot. Before Complynt, I\'d have been scrambling.', name: 'James Thornton', role: 'Owner', biz: 'The Anchor, Bethnal Green', result: '5★ FHRS maintained' },
              { quote: 'Our FHRS dropped to 3 stars and Deliveroo threatened to remove our listing. We set up Complynt that same week. Six months later we\'re back at 5 stars and the whole compliance side runs itself. Genuinely worth every penny.', name: 'Priya Mehta', role: 'Operations Manager', biz: 'Spice Route, Canary Wharf', result: '3★ → 5★ FHRS recovery' },
              { quote: "We couldn't justify a compliance consultant at £150 an hour. Complynt gives us the same oversight for £19 a month. Our EHO inspector actually commented on how well-organised our records were. Hadn't expected that.", name: 'Tom Walsh', role: 'Co-owner', biz: 'The Bothy, Clerkenwell', result: 'Saved ~£1,800/year vs consultant' },
            ].map((t, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22, padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'inline-flex', background: 'rgba(52,199,89,0.12)', border: '1px solid rgba(52,199,89,0.25)', borderRadius: 100, padding: '4px 12px', marginBottom: 20, alignSelf: 'flex-start' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#34c759' }}>{t.result}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {[0,1,2,3,4].map(j => <svg key={j} width="13" height="13" viewBox="0 0 24 24" fill="#ff9f0a"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>)}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.75, flex: 1, margin: '0 0 24px', fontStyle: 'italic' }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 18 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,113,227,0.25)', border: '1px solid rgba(0,113,227,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#60a5fa', flexShrink: 0 }}>
                    {t.name.split(' ').map((w: string) => w[0]).join('')}
                  </div>
                  <div>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 2 }}>{t.role} · {t.biz}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing callout ── */}
      <section style={{ background: '#0a0f1a', padding: 'clamp(72px,8vw,100px) clamp(20px,4vw,48px)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div ref={s5.ref} style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center', ...rv(s5.visible) }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</div>
          <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px' }}>
            Less than a takeaway coffee per week.
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '0 0 48px' }}>
            Free forever for core compliance. Pro from £19/month for multi-location and SMS alerts.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, maxWidth: 640, margin: '0 auto' }}>
            {[
              { plan: 'Free', price: '£0', desc: 'Forever', features: ['Compliance dashboard', 'Deadline alerts', 'Document vault', 'AI assistant', 'EHO simulator'], cta: 'Start free', href: '/onboarding', primary: false },
              { plan: 'Pro', price: '£19', desc: '/month', features: ['Everything in Free', 'Up to 5 locations', 'SMS alerts', 'HACCP generator', 'Staff training tracker', 'Priority support'], cta: 'Start Pro free trial', href: '/onboarding', primary: true },
            ].map(p => (
              <div key={p.plan} style={{ background: p.primary ? 'rgba(0,113,227,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${p.primary ? 'rgba(0,113,227,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 20, padding: '28px 24px', textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: p.primary ? '#60a5fa' : 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{p.plan}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{p.desc}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href={p.href} style={{ display: 'block', background: p.primary ? '#0071e3' : 'rgba(255,255,255,0.08)', color: 'white', textDecoration: 'none', textAlign: 'center', padding: '11px', borderRadius: 12, fontSize: 14, fontWeight: 700, border: p.primary ? 'none' : '1px solid rgba(255,255,255,0.14)' }}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ background: '#020c15', padding: 'clamp(72px,8vw,100px) clamp(20px,4vw,48px)' }}>
        <div ref={s6.ref} style={{ maxWidth: 680, margin: '0 auto', ...rv(s6.visible) }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#60a5fa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Common questions</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0 }}>Straight answers.</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAQS.map((item, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: openFaq === i ? 'rgba(0,113,227,0.1)' : 'rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
                  <span style={{ color: 'white', fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{item.q}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '4px 22px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: 14, lineHeight: 1.72, margin: '14px 0 0' }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ background: '#020c15', padding: 'clamp(72px,8vw,100px) clamp(20px,4vw,48px) clamp(80px,10vw,120px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 800, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.15) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.25)', borderRadius: 100, padding: '5px 16px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759', display: 'inline-block' }} />
            <span style={{ color: '#34c759', fontSize: 12, fontWeight: 700 }}>Free to start — no credit card</span>
          </div>
          <h2 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, color: 'white', letterSpacing: '-0.035em', lineHeight: 1.08, margin: '0 0 18px' }}>
            Your next inspection<br />isn&apos;t a surprise if<br />you&apos;re already ready.
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: '0 0 40px' }}>
            Set up takes two minutes. Your compliance dashboard is live immediately.
          </p>
          <Link href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#0071e3', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: 17, padding: '18px 40px', borderRadius: 100, boxShadow: '0 12px 40px rgba(0,113,227,0.45)', letterSpacing: '-0.01em' }}>
            Get my restaurant compliant — free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
          </Link>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 18 }}>Trusted by UK restaurant owners · GDPR compliant · ICO registered</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#010812', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px clamp(20px,4vw,48px)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <Logo />
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Privacy', '/privacy'], ['Terms', '/terms'], ['Features', '/features'], ['Pricing', '/pricing']].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>© 2026 Complynt Ltd · England & Wales</p>
      </footer>
    </div>
  )
}
