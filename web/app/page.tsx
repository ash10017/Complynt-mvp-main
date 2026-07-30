'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ─── animated counter ─── */
function useCounter(target: number, duration = 1400, enabled = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!enabled) return
    let frame = 0
    const steps = Math.round(duration / 16)
    const step = () => {
      frame++
      const ease = 1 - Math.pow(1 - frame / steps, 3)
      setVal(Math.round(target * ease))
      if (frame < steps) requestAnimationFrame(step)
      else setVal(target)
    }
    requestAnimationFrame(step)
  }, [target, duration, enabled])
  return val
}

/* ─── quiz data ─── */
const QUIZ_Q = [
  {
    q: 'Do you have a current HACCP plan with up-to-date temperature monitoring records?',
    opts: [
      { label: 'Yes — complete and reviewed within the last 12 months', score: 0 },
      { label: 'We have one but it\'s outdated / incomplete', score: 1 },
      { label: 'No — we don\'t have formal HACCP records', score: 2 },
    ],
  },
  {
    q: 'Do all food handlers have valid Level 2 Food Hygiene certificates on file?',
    opts: [
      { label: 'Yes — all staff are trained and certified', score: 0 },
      { label: 'Some are, some aren\'t', score: 1 },
      { label: 'No — training hasn\'t been formalised', score: 2 },
    ],
  },
  {
    q: 'Do you have written allergen information for every dish on your menu?',
    opts: [
      { label: 'Yes — full written allergen matrix for every dish', score: 0 },
      { label: 'Partially — we mostly tell customers verbally', score: 1 },
      { label: 'No formal allergen information in place', score: 2 },
    ],
  },
]

const RISK = [
  { min: 0, max: 0, level: 'LOW RISK', color: '#1c7a34', bg: 'rgba(52,199,89,.07)', border: 'rgba(52,199,89,.22)', title: 'You\'re in good shape.', body: 'Your fundamentals are covered. Sign up to maintain this standard year-round — automated reminders catch what busy kitchens forget.' },
  { min: 1, max: 2, level: 'MEDIUM RISK', color: '#7a4400', bg: 'rgba(255,159,10,.07)', border: 'rgba(255,159,10,.22)', title: 'You have compliance gaps.', body: 'An EHO inspector visiting today would likely find these. A downgraded FHRS rating stays on your public record for up to 3 years.' },
  { min: 3, max: 4, level: 'HIGH RISK', color: '#a00000', bg: 'rgba(255,59,48,.07)', border: 'rgba(255,59,48,.22)', title: 'Significant enforcement exposure.', body: 'You\'re vulnerable to a 1–2 star FHRS rating, Hygiene Improvement Notices, and potential removal from Deliveroo / Uber Eats platforms.' },
  { min: 5, max: 6, level: 'CRITICAL RISK', color: '#7a0000', bg: 'rgba(160,0,0,.07)', border: 'rgba(160,0,0,.28)', title: 'Immediate action required.', body: 'Serious risk of enforcement action, voluntary closure notices, and personal criminal liability under Natasha\'s Law for allergen failures.' },
]

/* ─── ticker items — duplicated for seamless loop ─── */
const TICK_ITEMS = [
  '£45,000 fine — Right to Work violation',
  '£20,000 fine — Unlicensed alcohol sale',
  '£2,500 fine — Late Personal Licence renewal',
  '£10,000 fine — Premises Licence breach',
  '£15,000 legal cost — Allergen claim, County Court',
  '5★ → 1★ — FHRS downgrade after surprise inspection',
  '30% revenue loss — Delivery platform suspension',
  '£80,000 fine — Serious Food Safety Act offence',
]

/* ─── features ─── */
const FEATURES = [
  {
    tag: 'FHRS',
    title: 'Live Compliance Dashboard',
    body: 'Every licence, certificate, and legal deadline in one real-time view. Color-coded by urgency — nothing ever falls through the cracks.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  },
  {
    tag: 'Inspection',
    title: 'EHO Inspection Simulator',
    body: 'Walk through the exact 10-question scoring matrix that Environmental Health Officers use. Know your predicted FHRS rating before they knock.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  },
  {
    tag: 'Food Safety',
    title: 'HACCP Plan Generator',
    body: 'Answer 4 questions. Get a legally compliant HACCP plan with every Critical Control Point pre-populated for your kitchen type. Print and sign.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  },
  {
    tag: "Natasha's Law",
    title: 'Allergen Matrix Builder',
    body: 'Build a printable allergen matrix for your full menu. All 14 UK regulated allergens. Stay compliant with Natasha\'s Law — automatically.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    tag: 'Employment',
    title: 'Staff Training Tracker',
    body: 'Track every food hygiene cert, fire safety course, and Right to Work check. Automated alerts 30 days before any certificate expires.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    tag: 'AI',
    title: 'AI Compliance Assistant',
    body: 'Ask anything about UK food law — fridge temps, DPS renewal, allergen thresholds. Answers specific to UK legislation, not generic advice.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  },
]

const LAWS = [
  { abbr: 'FHRS', full: 'Food Hygiene Rating Scheme', body: 'Track EHO readiness and simulate your next inspection before it happens.' },
  { abbr: "Natasha's Law", full: 'Allergen Labelling Regulations 2021', body: 'Written allergen info required for all PPDs since October 2021.' },
  { abbr: "Owen's Law", full: 'Allergen disclosure legislation', body: 'Written allergen menus on every table — be ready before it becomes law.' },
  { abbr: 'SFBB', full: 'Safer Food Better Business', body: "The FSA's own compliance framework, built into your HACCP generator." },
  { abbr: 'DPS & TENs', full: 'Licensing Act 2003', body: 'Track your DPS, premises licence conditions, and Temporary Events Notices.' },
  { abbr: 'Right to Work', full: 'Immigration, Asylum and Nationality Act', body: 'Track RTW check dates for all staff — avoid £45,000 fines per worker.' },
]

const EHO_AREAS = [
  { pct: '30%', area: 'Hygienic food handling', desc: 'Cooking, re-heating, cooling, storage. Temperature records, cross-contamination controls.' },
  { pct: '25%', area: 'Cleanliness & condition', desc: 'Structure of the premises, equipment cleanliness, pest control, lighting, ventilation.' },
  { pct: '45%', area: 'Confidence in management', desc: 'HACCP plans, staff training records, allergen documents, food safety policies. This is where most businesses lose points.' },
]

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [statsVis, setStatsVis] = useState(false)
  const [quiz, setQuiz] = useState<(number | null)[]>([null, null, null])
  const [showResult, setShowResult] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 56)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => e.target.classList.toggle('is-visible', e.isIntersecting)),
      { threshold: 0.1 }
    )
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVis(true) },
      { threshold: 0.25 }
    )
    if (statsRef.current) io.observe(statsRef.current)
    return () => io.disconnect()
  }, [])

  const c1 = useCounter(45000, 1200, statsVis)
  const c2 = useCounter(20000, 1000, statsVis)
  const c3 = useCounter(2500, 900, statsVis)
  const c4 = useCounter(94, 700, statsVis)

  const score = quiz.reduce<number>((s, v) => s + (v ?? 0), 0)
  const risk = RISK.find(r => score >= r.min && score <= r.max)!
  const quizDone = quiz.every(v => v !== null)

  /* helpers */
  const S: React.CSSProperties = {}
  void S

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', WebkitFontSmoothing: 'antialiased', overflowX: 'hidden' }}>

      {/* ════════ NAV ════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 62,
        background: scrolled ? 'rgba(2,12,21,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(160%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        transition: 'background 0.35s, border-color 0.35s',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(20px, 4vw, 48px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          </div>
          <span style={{ color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: '-0.4px' }}>Complynt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="live-dot" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500 }}>UK only</span>
          </div>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500 }}>Log in</Link>
          <Link href="/signup" style={{
            background: '#0071e3', color: '#fff', fontSize: 14, fontWeight: 700,
            padding: '8px 20px', borderRadius: 100, textDecoration: 'none',
            boxShadow: '0 2px 12px rgba(0,113,227,0.4)',
          }}>Get started free</Link>
        </div>
      </nav>

      {/* ════════ HERO ════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh', background: '#020c15',
        display: 'flex', alignItems: 'center', overflow: 'hidden',
        padding: 'clamp(100px,12vw,140px) clamp(20px,4vw,48px) 80px',
      }}>
        {/* background blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-8%', left: '-4%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.16) 0%, transparent 68%)', animation: 'blob 20s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-12%', right: '2%', width: 540, height: 540, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,70,160,0.14) 0%, transparent 68%)', animation: 'blob2 25s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '28%', right: '18%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,40,100,0.18) 0%, transparent 68%)', animation: 'blob3 30s ease-in-out infinite' }} />
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
        </div>

        <div style={{ position: 'relative', maxWidth: 1160, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 'clamp(40px,6vw,80px)', alignItems: 'center' }}>

          {/* left */}
          <div>
            <div className="hero-text-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,113,227,0.14)', border: '1px solid rgba(0,113,227,0.28)', borderRadius: 100, padding: '5px 15px', marginBottom: 28 }}>
              <span className="live-dot" />
              <span style={{ color: '#60a5fa', fontSize: 13, fontWeight: 700 }}>Now live for UK food businesses</span>
            </div>

            <h1 className="hero-text-2" style={{ color: '#fff', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-1.8px', marginBottom: 26 }}>
              Stop failing EHO{' '}
              <span style={{ color: '#0071e3' }}>inspections</span>{' '}
              you&nbsp;should have aced.
            </h1>

            <p className="hero-text-3" style={{ color: 'rgba(255,255,255,0.58)', fontSize: 18, lineHeight: 1.68, marginBottom: 38, maxWidth: 460 }}>
              Complynt tracks every licence, certificate, and food safety deadline for your UK restaurant or café — and tells you exactly what to fix before the EHO arrives.
            </p>

            <div className="hero-text-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32 }}>
              <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#0071e3', color: '#fff', fontWeight: 800, fontSize: 16, padding: '15px 30px', borderRadius: 100, textDecoration: 'none', boxShadow: '0 8px 32px rgba(0,113,227,0.42)', letterSpacing: '-0.2px' }}>
                Get started — it&apos;s free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
              </Link>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: 15, padding: '15px 24px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.14)', textDecoration: 'none' }}>
                Log in
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 22 }}>
              {['Free to start', 'UK food law', 'No card needed'].map(l => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 500 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* right — floating dashboard card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="hero-card" style={{ width: '100%', background: 'rgba(255,255,255,0.055)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)', padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>The Crown &amp; Kitchen</div>
                  <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Compliance overview</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(52,199,89,0.13)', border: '1px solid rgba(52,199,89,0.24)', borderRadius: 100, padding: '4px 11px' }}>
                  <span className="live-dot" style={{ width: 6, height: 6 }} />
                  <span style={{ color: '#34c759', fontSize: 11, fontWeight: 700 }}>Live</span>
                </div>
              </div>

              {/* health ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: 'rgba(0,113,227,0.1)', border: '1px solid rgba(0,113,227,0.18)', borderRadius: 14, marginBottom: 14 }}>
                <div style={{ position: 'relative', width: 58, height: 58, flexShrink: 0 }}>
                  <svg width="58" height="58" viewBox="0 0 58 58" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="29" cy="29" r="23" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5"/>
                    <circle cx="29" cy="29" r="23" fill="none" stroke="#0071e3" strokeWidth="5" strokeLinecap="round" strokeDasharray="145" className="ring-anim"/>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ color: '#fff', fontSize: 17, fontWeight: 900, lineHeight: 1 }}>87</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8 }}>/ 100</span>
                  </div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, marginBottom: 6 }}>Health score</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(52,199,89,0.15)', color: '#34c759', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>9 done</span>
                    <span style={{ background: 'rgba(255,159,10,0.15)', color: '#ff9f0a', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>2 due soon</span>
                  </div>
                </div>
              </div>

              {/* items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 13 }}>
                {[
                  { l: 'HACCP Records', s: 'On track', ok: true },
                  { l: 'Staff Training Certs', s: 'On track', ok: true },
                  { l: 'Allergen Matrix', s: '14 days left', ok: false },
                  { l: 'Food Business Reg', s: 'Complete', ok: true },
                ].map(item => (
                  <div key={item.l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 11px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: item.ok ? 'rgba(52,199,89,0.18)' : 'rgba(255,159,10,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.ok
                          ? <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                          : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ff9f0a" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        }
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.76)', fontSize: 11, fontWeight: 500 }}>{item.l}</span>
                    </div>
                    <span style={{ color: item.ok ? 'rgba(52,199,89,0.8)' : '#ff9f0a', fontSize: 10, fontWeight: 700 }}>{item.s}</span>
                  </div>
                ))}
              </div>

              {/* deadline strip */}
              <div style={{ background: 'rgba(255,159,10,0.1)', border: '1px solid rgba(255,159,10,0.2)', borderRadius: 11, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff9f0a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>Next: <strong style={{ color: '#fff' }}>Allergen Compliance</strong> · 14 days</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 110, background: 'linear-gradient(transparent, #020c15)', pointerEvents: 'none' }} />
      </section>

      {/* ════════ PENALTY TICKER ════════ */}
      <div style={{ background: '#0a1825', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '13px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flexShrink: 0, padding: '0 18px 0 22px', color: '#ff3b30', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', borderRight: '1px solid rgba(255,255,255,0.07)', marginRight: 18, whiteSpace: 'nowrap' }}>Real UK penalties</div>
          <div className="ticker-wrap" style={{ flex: 1 }}>
            <div className="ticker-inner">
              {[...TICK_ITEMS, ...TICK_ITEMS].map((item, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 20, padding: '0 28px', color: 'rgba(255,255,255,0.42)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#ff3b30', fontSize: 16 }}>·</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════ STATS ════════ */}
      <section ref={statsRef} style={{ background: '#fff', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div data-reveal className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ color: '#0071e3', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>The cost of getting it wrong</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: '-1px', lineHeight: 1.08 }}>
              Non-compliance is expensive.<br />Preventable is the point.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
            {[
              { val: `£${c1.toLocaleString()}`, label: 'max fine for employing without Right to Work checks — per worker', accent: '#ff3b30' },
              { val: `£${c2.toLocaleString()}`, label: 'fine for a single unlicensed alcohol sale — criminal offence', accent: '#ff9f0a' },
              { val: `£${c3.toLocaleString()}`, label: 'average legal cost when a customer sues over allergen non-disclosure', accent: '#0071e3' },
              { val: `${c4}%`, label: 'of food businesses inspected by an EHO have at least one compliance issue', accent: '#34c759' },
            ].map((s, i) => (
              <div key={i} data-reveal className={`reveal reveal-d${i + 1}`} style={{ background: '#f5f5f7', borderRadius: 20, padding: 'clamp(22px,3vw,32px) 22px', borderTop: `3px solid ${s.accent}` }}>
                <div style={{ fontSize: 'clamp(28px,3vw,44px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: '-1px', lineHeight: 1, marginBottom: 10 }}>{s.val}</div>
                <p style={{ color: '#6e6e73', fontSize: 13, lineHeight: 1.55 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section style={{ background: '#f5f5f7', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div data-reveal className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ color: '#0071e3', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Everything you need</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: '-1px', lineHeight: 1.08, marginBottom: 14 }}>
              Built for UK food businesses.<br />Nothing else.
            </h2>
            <p style={{ color: '#6e6e73', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.62 }}>
              Every feature maps to a real UK legal requirement — FHRS, Natasha&apos;s Law, Owen&apos;s Law, Right to Work. Zero filler.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {FEATURES.map((f, i) => (
              <div key={i} data-reveal className={`reveal reveal-d${(i % 3) + 1}`}
                style={{ background: '#fff', borderRadius: 20, padding: '26px 22px', border: '1px solid #e5e5ea', cursor: 'default', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 10px 36px rgba(0,0,0,0.08)'; el.style.borderColor = '#c8c8cc' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.borderColor = '#e5e5ea' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(0,113,227,0.08)', color: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
                  <span style={{ background: '#e8f2ff', color: '#0071e3', fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 100, marginTop: 2 }}>{f.tag}</span>
                </div>
                <h3 style={{ color: '#1d1d1f', fontSize: 16, fontWeight: 800, marginBottom: 9, letterSpacing: '-0.3px' }}>{f.title}</h3>
                <p style={{ color: '#6e6e73', fontSize: 13, lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ EHO DARK SECTION ════════ */}
      <section style={{ background: '#020c15', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div data-reveal className="reveal" style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ color: '#60a5fa', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>EHO Inspections</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.08, marginBottom: 14 }}>
              What Environmental Health<br />Officers actually score you on.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17, maxWidth: 500, margin: '0 auto', lineHeight: 1.62 }}>
              Most businesses fail on the paperwork, not the hygiene. Here&apos;s exactly how EHOs split their scoring.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 52 }}>
            {EHO_AREAS.map((a, i) => (
              <div key={i} data-reveal className={`reveal reveal-d${i + 1}`} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '26px 22px' }}>
                <div style={{ fontSize: 'clamp(30px,3vw,40px)', fontWeight: 900, color: '#0071e3', marginBottom: 9, letterSpacing: '-1px' }}>{a.pct}</div>
                <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, marginBottom: 10 }}>{a.area}</div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.62 }}>{a.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { val: '1 in 3', label: 'UK food businesses have an FHRS rating of 3 stars or below' },
              { val: '48h', label: 'how quickly an EHO can arrive after a complaint — no notice required' },
              { val: '3 yrs', label: 'a downgraded FHRS rating stays publicly visible on the FSA website' },
              { val: '£80k', label: 'maximum fine for serious offences under the Food Safety Act 1990' },
            ].map((s, i) => (
              <div key={i} data-reveal className={`reveal reveal-d${i + 1}`} style={{ textAlign: 'center', padding: '30px 18px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div style={{ color: '#fff', fontSize: 'clamp(24px,2.5vw,30px)', fontWeight: 900, letterSpacing: '-0.6px', marginBottom: 8 }}>{s.val}</div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.55 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TESTIMONIALS ════════ */}
      <section style={{ background: '#020c15', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div data-reveal className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ color: '#60a5fa', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Used by UK restaurant owners</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.08 }}>
              What they say after their first EHO visit.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              {
                quote: 'We had a surprise EHO visit three months after signing up. The inspector went through our HACCP records, allergen matrix, and temperature logs in twenty minutes. We got our 5-star confirmed on the spot. Before Complynt, I\'d have been scrambling.',
                name: 'James Thornton', role: 'Owner', biz: 'The Anchor, Bethnal Green',
              },
              {
                quote: 'Our FHRS dropped to 3 stars after a bad inspection and Deliveroo threatened to remove our listing. We set up Complynt that same week. Six months later we\'re back at 5 stars and the whole compliance side runs itself.',
                name: 'Priya Mehta', role: 'Operations Manager', biz: 'Spice Route, Canary Wharf',
              },
              {
                quote: 'We couldn\'t justify a compliance consultant at £150 an hour. Complynt gives us the same oversight for £19 a month. Our EHO inspector actually commented on how organised our records were.',
                name: 'Tom Walsh', role: 'Co-owner', biz: 'The Bothy, Clerkenwell',
              },
            ].map((t, i) => (
              <div key={i} data-reveal className={`reveal reveal-d${i + 1}`}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 22, padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: 18 }}>
                  {[0,1,2,3,4].map(j => (
                    <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#ff9f0a"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
                  ))}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.75, flex: 1, margin: '0 0 24px', fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 18 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,113,227,0.25)', border: '1px solid rgba(0,113,227,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#60a5fa', flexShrink: 0 }}>
                    {t.name.split(' ').map((w: string) => w[0]).join('')}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 1 }}>{t.role} · {t.biz}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ QUIZ ════════ */}
      <section style={{ background: '#fff', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div data-reveal className="reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ color: '#0071e3', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Free risk check</div>
            <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: '-0.8px', lineHeight: 1.08, marginBottom: 14 }}>
              Find your FHRS risk in 60&nbsp;seconds.
            </h2>
            <p style={{ color: '#6e6e73', fontSize: 16, lineHeight: 1.62 }}>Three questions. Instant result. No sign-up required.</p>
          </div>

          {!showResult ? (
            <div data-reveal className="reveal">
              {QUIZ_Q.map((q, qi) => (
                <div key={qi} style={{ marginBottom: 24, padding: '22px 22px 20px', background: '#f5f5f7', borderRadius: 20 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: quiz[qi] !== null ? '#0071e3' : '#e5e5ea', color: quiz[qi] !== null ? '#fff' : '#a1a1a6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, transition: 'all 0.2s' }}>
                      {quiz[qi] !== null
                        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                        : qi + 1}
                    </div>
                    <p style={{ color: '#1d1d1f', fontSize: 14, fontWeight: 700, lineHeight: 1.5, margin: 0, paddingTop: 2 }}>{q.q}</p>
                  </div>
                  <div style={{ paddingLeft: 38, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {q.opts.map((opt, oi) => (
                      <button key={oi} onClick={() => setQuiz(p => { const n = [...p]; n[qi] = opt.score; return n })} style={{ textAlign: 'left', cursor: 'pointer', padding: '11px 15px', borderRadius: 12, fontSize: 13, fontWeight: 500, border: quiz[qi] === opt.score ? '2px solid #0071e3' : '2px solid #e5e5ea', background: quiz[qi] === opt.score ? '#e8f2ff' : '#fff', color: quiz[qi] === opt.score ? '#004aad' : '#1d1d1f', transition: 'all 0.15s' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center' }}>
                <button onClick={() => { if (quizDone) setShowResult(true) }} style={{ background: quizDone ? '#0071e3' : '#e5e5ea', color: quizDone ? '#fff' : '#a1a1a6', border: 'none', cursor: quizDone ? 'pointer' : 'default', padding: '14px 36px', borderRadius: 100, fontSize: 15, fontWeight: 800, transition: 'all 0.2s', boxShadow: quizDone ? '0 6px 24px rgba(0,113,227,0.3)' : 'none' }}>
                  {quizDone ? 'See my risk assessment →' : 'Answer all 3 questions to continue'}
                </button>
              </div>
            </div>
          ) : (
            <div data-reveal className="reveal" style={{ border: `2px solid ${risk.border}`, background: risk.bg, borderRadius: 24, padding: 'clamp(28px,4vw,40px)', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${risk.border}`, borderRadius: 100, padding: '5px 16px', marginBottom: 18 }}>
                <span style={{ color: risk.color, fontSize: 12, fontWeight: 900, letterSpacing: '0.08em' }}>{risk.level}</span>
              </div>
              <h3 style={{ color: '#1d1d1f', fontSize: 'clamp(20px,3vw,26px)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.4px' }}>{risk.title}</h3>
              <p style={{ color: '#6e6e73', fontSize: 15, lineHeight: 1.65, maxWidth: 460, margin: '0 auto 28px' }}>{risk.body}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/signup" style={{ background: '#0071e3', color: '#fff', fontWeight: 800, fontSize: 14, padding: '13px 28px', borderRadius: 100, textDecoration: 'none', boxShadow: '0 6px 20px rgba(0,113,227,0.35)' }}>Fix it with Complynt — free</Link>
                <button onClick={() => { setQuiz([null, null, null]); setShowResult(false) }} style={{ background: 'transparent', border: '1px solid #e5e5ea', color: '#6e6e73', fontWeight: 600, fontSize: 14, padding: '13px 22px', borderRadius: 100, cursor: 'pointer' }}>Retake quiz</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════ LAW COVERAGE ════════ */}
      <section style={{ background: '#f5f5f7', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div data-reveal className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ color: '#0071e3', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>UK coverage</div>
            <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: '-0.8px', lineHeight: 1.08 }}>Every UK food law. One platform.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {LAWS.map((l, i) => (
              <div key={i} data-reveal className={`reveal reveal-d${(i % 3) + 1}`} style={{ background: '#fff', borderRadius: 16, padding: '20px 18px', border: '1px solid #e5e5ea' }}>
                <div style={{ display: 'inline-block', background: '#e8f2ff', color: '#0071e3', fontSize: 10, fontWeight: 900, padding: '3px 10px', borderRadius: 100, marginBottom: 8 }}>{l.abbr}</div>
                <div style={{ color: '#a1a1a6', fontSize: 10, marginBottom: 8 }}>{l.full}</div>
                <p style={{ color: '#1d1d1f', fontSize: 13, lineHeight: 1.58 }}>{l.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section style={{ background: '#020c15', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <div data-reveal className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ color: '#60a5fa', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Common questions</div>
            <h2 style={{ fontSize: 'clamp(26px,4vw,42px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.08 }}>
              Everything you&apos;d want to know.
            </h2>
          </div>
          <div data-reveal className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {([
              { q: 'Is it really free to start?', a: 'Yes — no credit card, no trial period. The free plan covers your core compliance dashboard, deadline tracking, and document vault. Paid plans unlock multi-location support, SMS alerts, and advanced reporting.' },
              { q: 'How is this different from a spreadsheet?', a: 'A spreadsheet doesn\'t alert you 30 days before a deadline, simulate an EHO inspection, generate a HACCP plan, build your allergen matrix, or track staff training certificates. Complynt does all of these — and keeps a timestamped audit trail an EHO inspector can verify on the spot.' },
              { q: 'Do I need to switch from my current systems?', a: 'No. Set Complynt up alongside whatever you currently use. Most users start by importing their existing licences and expiry dates, then let the alerts handle the rest.' },
              { q: 'Can I show Complynt to an EHO inspector during a visit?', a: 'Yes — many users do exactly this. Pull up your live dashboard to show HACCP records, temperature logs, allergen matrices, and staff training certificates. Inspectors appreciate organised, timestamped digital records.' },
              { q: 'What if I already have 5 stars?', a: 'Keep them. FHRS ratings are re-assessed on every inspection and can change without warning. Complynt maintains the compliance standard that earned your rating — year-round, automatically.' },
              { q: 'Does it work for multiple locations?', a: 'Yes. The Pro plan supports up to 5 locations under one account. The Business plan is unlimited. Each location gets its own compliance dashboard and health score.' },
              { q: 'Is the AI compliance assistant actually useful?', a: 'It knows UK food law — Natasha\'s Law allergen thresholds, Licensing Act 2003 DPS requirements, HACCP Critical Control Points, Right to Work check intervals. Ask it anything specific about your compliance items and it answers in plain English.' },
              { q: 'What happens to my data if I cancel?', a: 'You own your data. Request a CSV export any time. We retain data for 30 days after cancellation, then permanently delete it. We never sell it.' },
            ] as { q: string; a: string }[]).map((item, i) => (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', background: openFaq === i ? 'rgba(0,113,227,0.1)' : 'rgba(255,255,255,0.03)', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}
                >
                  <span style={{ color: '#fff', fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{item.q}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '4px 22px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.72, margin: '14px 0 0' }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section style={{ background: 'linear-gradient(140deg, #004bb0 0%, #0071e3 55%, #0099ff 100%)', padding: 'clamp(72px,10vw,110px) clamp(20px,4vw,48px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />
        <div data-reveal className="reveal" style={{ position: 'relative', maxWidth: 620, margin: '0 auto' }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(28px,5vw,54px)', fontWeight: 900, letterSpacing: '-1.2px', lineHeight: 1.05, marginBottom: 18 }}>
            Get compliant.<br />Stay compliant.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 18, lineHeight: 1.64, marginBottom: 42 }}>
            Join UK food businesses that replaced late-night spreadsheet panic with one calm dashboard. Free to start — no credit card, no contracts.
          </p>
          <Link href="/signup" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#fff', color: '#0071e3', fontWeight: 900, fontSize: 17, padding: '18px 40px', borderRadius: 100, textDecoration: 'none', boxShadow: '0 14px 40px rgba(0,0,0,0.18)', letterSpacing: '-0.2px' }}>
            Start free today
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13, marginTop: 18 }}>Currently available for UK food businesses only · Australia coming soon</p>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ background: '#020c15', padding: 'clamp(40px,6vw,56px) clamp(20px,4vw,48px) 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
              </div>
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>Complynt</span>
            </div>
            <div style={{ display: 'flex', gap: 28 }}>
              {([['Privacy', '/privacy'], ['Terms', '/terms'], ['Contact', '/contact']] as [string, string][]).map(([l, h]) => (
                <Link key={l} href={h} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 500 }}>{l}</Link>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: 12 }}>© {new Date().getFullYear()} Complynt. Built for UK food businesses.</p>
            <p style={{ color: 'rgba(255,255,255,0.16)', fontSize: 12 }}>Not legal advice. Consult a qualified solicitor for complex compliance matters.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
