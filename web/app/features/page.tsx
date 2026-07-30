'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ── Scroll reveal ──────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.12 })
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

// ── Inline nav (dark version matching homepage) ───────────────────────────
function DarkNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 56,
        background: scrolled ? 'rgba(2,12,21,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : 'none',
        transition: 'all 0.2s',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, background: '#0071e3', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/><path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Complynt</span>
          </Link>
          <nav style={{ display: 'flex', gap: 28 }} className="hidden-mobile">
            {[['Features', '/features'], ['Pricing', '/pricing'], ['Talk to us', '/contact']].map(([l, h]) => (
              <Link key={l} href={h} style={{ fontSize: 14, color: l === 'Features' ? 'white' : 'rgba(255,255,255,0.65)', textDecoration: 'none', fontWeight: l === 'Features' ? 600 : 400 }}>{l}</Link>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: 10 }} className="hidden-mobile">
            <Link href="/login" style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '6px 12px', borderRadius: 8 }}>Log in</Link>
            <Link href="/onboarding" style={{ fontSize: 14, fontWeight: 600, color: 'white', background: '#0071e3', textDecoration: 'none', padding: '7px 16px', borderRadius: 8 }}>Get started</Link>
          </div>
          <button onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="show-mobile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </header>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: '#020c15', paddingTop: 64, paddingInline: 24, display: 'flex', flexDirection: 'column', gap: 0 }} onClick={() => setOpen(false)}>
          {[['Features', '/features'], ['Pricing', '/pricing'], ['Talk to us', '/contact'], ['Log in', '/login']].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 18, color: 'white', textDecoration: 'none', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 500 }}>{l}</Link>
          ))}
          <Link href="/onboarding" style={{ marginTop: 20, background: '#0071e3', color: 'white', textDecoration: 'none', textAlign: 'center', padding: '14px', borderRadius: 12, fontSize: 16, fontWeight: 700 }}>Get started free</Link>
        </div>
      )}
      <style>{`.hidden-mobile{display:flex}.show-mobile{display:none}@media(max-width:768px){.hidden-mobile{display:none!important}.show-mobile{display:block!important}}`}</style>
    </>
  )
}

// ── CSS mockup components ─────────────────────────────────────────────────

function MockDashboard() {
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e5ea', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ background: '#f5f5f7', borderBottom: '1px solid #e5e5ea', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
        <span style={{ fontSize: 11, color: '#a1a1a6', marginLeft: 6 }}>Compliance Dashboard</span>
      </div>
      <div style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="23" fill="none" stroke="#e5e5ea" strokeWidth="5"/>
            <circle cx="30" cy="30" r="23" fill="none" stroke="#34c759" strokeWidth="5"
              strokeDasharray={`${2*Math.PI*23}`} strokeDashoffset={`${2*Math.PI*23*0.18}`}
              strokeLinecap="round" transform="rotate(-90 30 30)"/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#1a7a34', lineHeight: 1 }}>82</span>
            <span style={{ fontSize: 8, color: '#a1a1a6' }}>/100</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {[
            { name: 'Food Business Registration', days: 'On track', color: '#34c759', bg: '#f0faf3' },
            { name: 'HACCP Records', days: '12d left', color: '#ff9f0a', bg: '#fff8e8' },
            { name: 'Premises Licence', days: '3d overdue', color: '#ff3b30', bg: '#fff2f2' },
          ].map(r => (
            <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f5f5f7' }}>
              <span style={{ fontSize: 11, color: '#1d1d1f', fontWeight: 500 }}>{r.name}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: r.color, background: r.bg, padding: '2px 7px', borderRadius: 20 }}>{r.days}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MockEHO() {
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e5ea', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ background: '#f5f5f7', borderBottom: '1px solid #e5e5ea', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#a1a1a6' }}>EHO Inspection Simulator</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#ff9f0a', background: '#fff8e8', padding: '2px 8px', borderRadius: 20 }}>Medium Risk</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#ff9f0a' }}>74</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f' }}>Inspection Score</div>
            <div style={{ fontSize: 10, color: '#a1a1a6' }}>out of 100</div>
          </div>
        </div>
        {[
          { label: 'Food Safety Management', pct: 90, col: '#34c759' },
          { label: 'Structural Compliance', pct: 75, col: '#ff9f0a' },
          { label: 'Allergen Procedures', pct: 55, col: '#ff9f0a' },
          { label: 'Confidence in Management', pct: 80, col: '#34c759' },
        ].map(r => (
          <div key={r.label} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: '#6e6e73' }}>{r.label}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: r.col }}>{r.pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: '#e5e5ea' }}>
              <div style={{ height: '100%', width: `${r.pct}%`, background: r.col, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockTempLogs() {
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e5ea', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ background: '#f5f5f7', borderBottom: '1px solid #e5e5ea', padding: '10px 16px' }}>
        <span style={{ fontSize: 11, color: '#a1a1a6' }}>Temperature Logs — today</span>
      </div>
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 70px 60px', padding: '8px 0', borderBottom: '1px solid #f5f5f7' }}>
          {['Location', 'Time', 'Temp', 'Status'].map(h => (
            <span key={h} style={{ fontSize: 9, fontWeight: 700, color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
          ))}
        </div>
        {[
          { loc: 'Walk-in Fridge', time: '08:12', temp: '4°C', ok: true },
          { loc: 'Freezer Unit A', time: '08:14', temp: '-18°C', ok: true },
          { loc: 'Hot Hold Counter', time: '11:30', temp: '62°C', ok: true },
          { loc: 'Prep Fridge',      time: '14:05', temp: '9°C', ok: false },
        ].map(r => (
          <div key={r.loc} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 70px 60px', padding: '7px 0', borderBottom: '1px solid #f5f5f7', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#1d1d1f', fontWeight: 500 }}>{r.loc}</span>
            <span style={{ fontSize: 11, color: '#6e6e73' }}>{r.time}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: r.ok ? '#1d1d1f' : '#ff3b30' }}>{r.temp}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: r.ok ? '#34c759' : '#ff3b30', background: r.ok ? '#f0faf3' : '#fff2f2', padding: '2px 6px', borderRadius: 20, textAlign: 'center' }}>{r.ok ? '✓ OK' : '⚠ High'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockAllergen() {
  const allergens = ['Gluten', 'Milk', 'Nuts', 'Eggs', 'Fish', 'Soya']
  const dishes = [
    { name: 'Beef Burger', vals: [true, true, false, true, false, false] },
    { name: 'Caesar Salad', vals: [true, true, false, true, true, false] },
    { name: 'Vegan Bowl', vals: [false, false, true, false, false, true] },
    { name: 'Fish & Chips', vals: [true, false, false, false, true, false] },
  ]
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e5ea', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ background: '#f5f5f7', borderBottom: '1px solid #e5e5ea', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#a1a1a6' }}>Allergen Matrix</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#0071e3', background: '#e8f2ff', padding: '2px 8px', borderRadius: 20 }}>14 allergens tracked</span>
      </div>
      <div style={{ padding: 14, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '4px 8px 8px 0', color: '#a1a1a6', fontWeight: 600, whiteSpace: 'nowrap' }}>Dish</th>
              {allergens.map(a => <th key={a} style={{ padding: '4px 4px 8px', color: '#6e6e73', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>{a}</th>)}
            </tr>
          </thead>
          <tbody>
            {dishes.map(d => (
              <tr key={d.name} style={{ borderTop: '1px solid #f5f5f7' }}>
                <td style={{ padding: '6px 8px 6px 0', fontWeight: 600, color: '#1d1d1f', whiteSpace: 'nowrap' }}>{d.name}</td>
                {d.vals.map((v, i) => (
                  <td key={i} style={{ textAlign: 'center', padding: '6px 4px' }}>
                    {v
                      ? <span style={{ color: '#ff3b30', fontWeight: 700, fontSize: 11 }}>●</span>
                      : <span style={{ color: '#d2d2d7', fontSize: 11 }}>–</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MockVault() {
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e5ea', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ background: '#f5f5f7', borderBottom: '1px solid #e5e5ea', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#a1a1a6' }}>Document Vault</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#ff9f0a', background: '#fff8e8', padding: '2px 8px', borderRadius: 20 }}>1 expiring soon</span>
      </div>
      <div style={{ padding: '0 16px' }}>
        {[
          { name: 'Gas Safety Certificate (CP12)', type: 'PDF', cat: 'Safety', expiry: '14 Aug 2026', warn: true },
          { name: 'Premises Licence',              type: 'PDF', cat: 'Licensing', expiry: '30 Dec 2026', warn: false },
          { name: 'EHO Inspection Report',          type: 'PDF', cat: 'Inspection', expiry: 'No expiry', warn: false },
          { name: 'Public Liability Insurance',    type: 'PDF', cat: 'Legal', expiry: '01 Apr 2027', warn: false },
        ].map(d => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f5f5f7' }}>
            <div style={{ width: 28, height: 28, background: d.warn ? '#fff8e8' : '#f5f5f7', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={d.warn ? '#ff9f0a' : '#a1a1a6'} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
              <div style={{ fontSize: 10, color: '#a1a1a6', marginTop: 1 }}>{d.cat} · Expires {d.expiry}</div>
            </div>
            {d.warn && <span style={{ fontSize: 9, fontWeight: 700, color: '#ff9f0a', flexShrink: 0 }}>30d</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

function MockAI() {
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e5ea', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ background: '#f5f5f7', borderBottom: '1px solid #e5e5ea', padding: '10px 16px' }}>
        <span style={{ fontSize: 11, color: '#a1a1a6' }}>AI Compliance Assistant</span>
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: '#0071e3', color: 'white', fontSize: 12, padding: '8px 12px', borderRadius: '12px 12px 4px 12px', maxWidth: '80%', lineHeight: 1.4 }}>
            What's the fine for not having written allergen information?
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          </div>
          <div style={{ background: '#f5f5f7', fontSize: 12, padding: '8px 12px', borderRadius: '4px 12px 12px 12px', maxWidth: '85%', lineHeight: 1.5, color: '#1d1d1f' }}>
            Under <strong>Natasha's Law</strong>, failing to provide written allergen information can result in an unlimited fine and up to 2 years imprisonment. Prosecutions are brought by Trading Standards or Environmental Health.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, border: '1px solid #e5e5ea', borderRadius: 10, padding: '7px 10px', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: '#a1a1a6', flex: 1 }}>Ask about your compliance…</span>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9"/></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockStaff() {
  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e5e5ea', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
      <div style={{ background: '#f5f5f7', borderBottom: '1px solid #e5e5ea', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#a1a1a6' }}>Staff Training Records</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#ff3b30', background: '#fff2f2', padding: '2px 8px', borderRadius: 20 }}>1 overdue</span>
      </div>
      <div style={{ padding: '0 16px' }}>
        {[
          { name: 'Sarah Mitchell', role: 'Head Chef', cert: 'Level 3 Food Hygiene', expiry: 'Valid until Apr 2027', ok: true },
          { name: 'James Okafor',   role: 'Chef de Partie', cert: 'Level 2 Food Hygiene', expiry: 'Expired Jun 2026', ok: false },
          { name: 'Priya Patel',    role: 'Front of House', cert: 'Level 2 Food Hygiene', expiry: 'Valid until Dec 2026', ok: true },
        ].map(s => (
          <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f5f5f7' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: s.ok ? '#e8f2ff' : '#fff2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: s.ok ? '#0071e3' : '#ff3b30', flexShrink: 0 }}>
              {s.name.split(' ').map(w => w[0]).join('')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f' }}>{s.name} <span style={{ color: '#a1a1a6', fontWeight: 400 }}>· {s.role}</span></div>
              <div style={{ fontSize: 10, color: s.ok ? '#a1a1a6' : '#ff3b30', marginTop: 1 }}>{s.cert} · {s.expiry}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: s.ok ? '#34c759' : '#ff3b30', flexShrink: 0 }}>{s.ok ? '✓' : '!'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Feature section (alternating) ─────────────────────────────────────────
interface FeatureRowProps {
  tag: string
  tagColor: string
  tagBg: string
  title: string
  body: string
  bullets: string[]
  mockup: React.ReactNode
  flip?: boolean
}

function FeatureRow({ tag, tagColor, tagBg, title, body, bullets, mockup, flip = false }: FeatureRowProps) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{
      display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center',
      opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    }}
    className={`feature-row${flip ? ' feature-row-flip' : ''}`}>
      <div style={{ flex: 1, maxWidth: 460 }} className={flip ? 'order-text-flip' : ''}>
        <span style={{ fontSize: 10, fontWeight: 700, color: tagColor, background: tagBg, padding: '4px 10px', borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{tag}</span>
        <h3 style={{ fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: 800, color: '#1d1d1f', margin: '14px 0 10px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{title}</h3>
        <p style={{ fontSize: 15, color: '#6e6e73', lineHeight: 1.65, margin: '0 0 20px' }}>{body}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bullets.map(b => (
            <div key={b} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20,6 9,17 4,12"/></svg>
              <span style={{ fontSize: 14, color: '#1d1d1f' }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, maxWidth: 460, width: '100%' }}>
        {mockup}
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function FeaturesPage() {
  const FEATURES: FeatureRowProps[] = [
    {
      tag: 'Core',
      tagColor: '#0058b0',
      tagBg: '#e8f2ff',
      title: 'Every deadline. One dashboard.',
      body: 'All your licences, certificates, and legal obligations in a single real-time view. Colour-coded by urgency — overdue, due soon, or on track. Nothing slips through.',
      bullets: [
        'Live compliance health score out of 100',
        'Urgent items and 30-day upcoming list on the overview',
        'Search and filter by category or authority',
        'One-click mark-complete with full history',
      ],
      mockup: <MockDashboard />,
    },
    {
      tag: 'Inspection Readiness',
      tagColor: '#7a4400',
      tagBg: '#fff8e8',
      title: 'Know your FHRS score before the inspector does.',
      body: 'Simulate an EHO visit across all major inspection criteria. Identify gaps in your HACCP, allergen management, and structural compliance — before they cost you stars.',
      bullets: [
        '14-question EHO inspection walkthrough',
        'Weighted score across food safety, structure, and confidence in management',
        'Risk level: Low / Medium / High / Critical',
        'Actionable advice for each weak area',
      ],
      mockup: <MockEHO />,
      flip: true,
    },
    {
      tag: 'Food Safety',
      tagColor: '#0058b0',
      tagBg: '#e8f2ff',
      title: 'Digital temperature records. No clipboards.',
      body: 'Log fridge, freezer, and hot-hold temperatures in seconds from any device. Build a complete, searchable audit trail that satisfies FSA requirements and EHO inspectors on the spot.',
      bullets: [
        'Log any location: fridge, freezer, hot-hold, delivery',
        'Automatic out-of-range flagging with colour alerts',
        'Daily summary with pass/fail status',
        'Download full log history for inspections',
      ],
      mockup: <MockTempLogs />,
    },
    {
      tag: "Natasha's Law",
      tagColor: '#7a1e00',
      tagBg: '#fff2f0',
      title: 'Allergen compliance that protects your customers — and your business.',
      body: "Build a complete allergen matrix for every dish. All 14 major allergens tracked per ingredient, with printable menus and automatic flagging. Criminal liability under Natasha's Law is real — don't leave it to memory.",
      bullets: [
        'All 14 EU/UK major allergens tracked per dish',
        'Visual matrix: filter any allergen to see affected dishes',
        'Generate printable allergen information for menus',
        'Integrates with your compliance checklist',
      ],
      mockup: <MockAllergen />,
      flip: true,
    },
    {
      tag: 'Records',
      tagColor: '#1a5c1a',
      tagBg: '#f0faf3',
      title: 'Every certificate. One secure vault.',
      body: 'Upload licences, inspection reports, insurance certificates, and training records. Set expiry dates per document and get alerted before they lapse. Stop scrambling for paperwork mid-inspection.',
      bullets: [
        'Upload PDF, image, or Word documents',
        'Expiry tracking per document with advance alerts',
        'Category tags: Safety, Licensing, Insurance, HR…',
        'Instant download during an inspection visit',
      ],
      mockup: <MockVault />,
    },
    {
      tag: 'AI',
      tagColor: '#4a0e8f',
      tagBg: '#f4eeff',
      title: 'Ask anything about your compliance.',
      body: "Get instant answers about UK food law, licensing requirements, FHRS criteria, and your specific deadlines — all in plain English. Powered by the same AI that fuels legal and compliance teams.",
      bullets: [
        'Context-aware: knows your specific compliance items',
        'Answers on deadlines, fines, renewal steps, and enforcement',
        'UK food law, alcohol licensing, employment law, and more',
        'Available 24/7 — no waiting for a solicitor',
      ],
      mockup: <MockAI />,
      flip: true,
    },
    {
      tag: 'HR & Training',
      tagColor: '#1a5c1a',
      tagBg: '#f0faf3',
      title: 'Full staff training records. Audit-ready.',
      body: 'Track every team member\'s Level 2 Food Hygiene certificate, Right to Work check, and job-specific training. Know in seconds who is qualified and who needs renewal — before an EHO visit catches it first.',
      bullets: [
        'Certificate upload with expiry per staff member',
        'Role-based training types: food hygiene, allergen, first aid',
        'Right to Work document tracking',
        'Red flag alerts for expired or missing certificates',
      ],
      mockup: <MockStaff />,
    },
  ]

  const lawsRef = useReveal()

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <DarkNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#020c15', paddingTop: 120, paddingBottom: 80, paddingInline: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.2) 0%, transparent 65%)', top: '-150px', left: '50%', transform: 'translateX(-50%)', filter: 'blur(70px)' }} />
        </div>
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,113,227,0.15)', border: '1px solid rgba(0,113,227,0.35)', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0071e3' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#60a8ff', letterSpacing: '0.04em' }}>Built for UK hospitality</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 800, color: 'white', margin: '0 0 18px', lineHeight: 1.08, letterSpacing: '-0.03em' }}>
            Every compliance tool<br />your business actually needs.
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: 'rgba(255,255,255,0.55)', margin: '0 0 36px', lineHeight: 1.65, maxWidth: 560, marginInline: 'auto' }}>
            From HACCP records and allergen matrices to temperature logs and EHO simulation — everything that keeps you legal, audit-ready, and FHRS 5-star.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/onboarding" style={{ background: '#0071e3', color: 'white', textDecoration: 'none', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
              Start free — takes 2 min
            </Link>
            <Link href="/pricing" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', textDecoration: 'none', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}>
              See pricing →
            </Link>
          </div>
          {/* Stat chips */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10 }}>
            {[
              { val: '12',     label: 'compliance tools' },
              { val: '6',      label: 'UK laws covered'  },
              { val: '2 min',  label: 'to set up'        },
              { val: 'Free',   label: 'to start'         },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Laws strip ────────────────────────────────────────────────────── */}
      <div ref={lawsRef.ref} style={{
        background: '#f5f5f7', borderTop: '1px solid #e5e5ea', borderBottom: '1px solid #e5e5ea',
        padding: '28px 24px',
        opacity: lawsRef.visible ? 1 : 0, transform: lawsRef.visible ? 'none' : 'translateY(16px)',
        transition: 'all 0.5s ease',
      }}>
        <div style={{ maxWidth: 1060, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 18 }}>
            Built around UK compliance law
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {[
              { law: 'Food Safety Act 1990',            color: '#0071e3', bg: '#e8f2ff' },
              { law: "Natasha's Law (Oct 2021)",        color: '#c0392b', bg: '#fff2f0' },
              { law: "Owen's Law",                      color: '#c0392b', bg: '#fff2f0' },
              { law: 'FHRS Rating System',              color: '#1a7a34', bg: '#f0faf3' },
              { law: 'Licensing Act 2003',              color: '#7a4400', bg: '#fff8e8' },
              { law: 'Health & Safety at Work Act',     color: '#4a0e8f', bg: '#f4eeff' },
              { law: 'HACCP (UK Retained EU Law)',      color: '#0058b0', bg: '#e8f2ff' },
              { law: 'Right to Work Checks',            color: '#1a5c1a', bg: '#f0faf3' },
            ].map(l => (
              <span key={l.law} style={{ fontSize: 12, fontWeight: 600, color: l.color, background: l.bg, padding: '6px 14px', borderRadius: 20, border: `1px solid ${l.color}22` }}>
                {l.law}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Feature sections ──────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '80px 24px', display: 'flex', flexDirection: 'column', gap: 96 }}>
        {FEATURES.map((f, i) => (
          <FeatureRow key={f.title} {...f} flip={f.flip} />
        ))}
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section style={{ background: '#f5f5f7', borderTop: '1px solid #e5e5ea', padding: '72px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Getting started</span>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, color: '#1d1d1f', margin: '12px 0 48px', letterSpacing: '-0.02em' }}>
            Set up in under 2 minutes.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { step: '01', title: 'Choose your business type', body: 'Tell us you\'re a restaurant, hotel, café, or cloud kitchen — we pre-load every relevant licence and requirement.' },
              { step: '02', title: 'Select your licences', body: 'Pick the licences and certificates you hold. Set expiry dates or leave blank — we default to 1 year.' },
              { step: '03', title: 'Stay compliant automatically', body: 'Your dashboard activates immediately. Get alerts, track deadlines, and ace your next EHO inspection.' },
            ].map(s => (
              <div key={s.step} style={{ background: 'white', border: '1px solid #e5e5ea', borderRadius: 18, padding: '28px 24px', textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0071e3', letterSpacing: '0.06em', marginBottom: 14 }}>{s.step}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1d1d1f', margin: '0 0 10px', lineHeight: 1.25 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.65, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ background: '#020c15', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.18) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(70px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 800, color: 'white', margin: '0 0 14px', letterSpacing: '-0.03em' }}>
            Ready to run a fully compliant kitchen?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', margin: '0 0 36px', lineHeight: 1.65 }}>
            Free forever on the starter plan. No credit card. Set up in 2 minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/onboarding" style={{ background: '#0071e3', color: 'white', textDecoration: 'none', padding: '13px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700 }}>
              Get started free →
            </Link>
            <Link href="/pricing" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', textDecoration: 'none', padding: '13px 32px', borderRadius: 12, fontSize: 15, fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}>
              Compare plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ background: '#020c15', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          {[['Home', '/'], ['Features', '/features'], ['Pricing', '/pricing'], ['Dashboard', '/dashboard'], ['Contact', '/contact']].map(([l, h]) => (
            <Link key={l} href={h} style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>© 2026 Complynt · UK food business compliance</p>
      </footer>

      {/* Responsive helpers */}
      <style>{`
        .feature-row { display: flex; flex-direction: row; gap: 64px; }
        .feature-row-flip { flex-direction: row-reverse; }
        @media (max-width: 768px) {
          .feature-row, .feature-row-flip { flex-direction: column !important; }
        }
      `}</style>
    </div>
  )
}
