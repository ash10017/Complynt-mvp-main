import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — Complynt',
  description: 'Why we built Complynt — the compliance platform protecting UK food businesses from EHO inspection failures, FHRS downgrades, and legal penalties.',
}

export default function AboutPage() {
  return (
    <>
      <Nav solid />
      <main style={{ paddingTop: 'var(--nav-h)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', WebkitFontSmoothing: 'antialiased' }}>

        {/* ── Hero ── */}
        <section style={{ background: '#020c15', padding: 'clamp(72px,10vw,120px) clamp(20px,4vw,48px)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.18) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(80px)' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
          </div>
          <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,113,227,0.12)', border: '1px solid rgba(0,113,227,0.28)', borderRadius: 100, padding: '5px 14px', marginBottom: 24 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>About Complynt</span>
            </div>
            <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px' }}>
              Built to protect UK<br />food businesses.
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)', lineHeight: 1.68, margin: 0 }}>
              Every year, thousands of UK restaurants, cafés, and food businesses receive unexpected EHO visits. Many fail — not because their food is unsafe, but because their paperwork isn&apos;t.
            </p>
          </div>
        </section>

        {/* ── Story ── */}
        <section style={{ background: 'white', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Why we built this</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.025em', lineHeight: 1.2, margin: '0 0 28px' }}>
              The compliance problem was hiding in plain sight.
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                `A 1-in-3 chance of failing your first EHO inspection is not a fringe risk. It's the default for UK food businesses that don't have a system. And the consequences — a 1-star FHRS rating, removal from Deliveroo, a Hygiene Improvement Notice — aren't hypothetical. They happen to real restaurants, every week.`,
                `The problem isn't that restaurant owners don't care about compliance. They do. The problem is that the tools to manage it were either expensive consultants, paper folders that get left in a drawer, or spreadsheets that nobody updates.`,
                `We built Complynt to change that. To give every food business in the UK — from a single-site café to a 20-location chain — the compliance infrastructure that was previously only available to those who could afford to pay someone else to manage it.`,
                `We track every licence, certificate, and legal deadline. We simulate EHO inspections. We generate HACCP plans. We track temperature logs and staff training. We alert you 30 days before anything is due. And we do all of it in a dashboard that any owner, manager, or chef can understand in five minutes.`,
              ].map((p, i) => (
                <p key={i} style={{ fontSize: 16, color: '#3a3a3c', lineHeight: 1.75, margin: 0 }}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission ── */}
        <section style={{ background: '#f5f5f7', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)', borderTop: '1px solid #e5e5ea' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
            <blockquote style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.02em', lineHeight: 1.4, margin: '0 0 24px', fontStyle: 'normal' }}>
              &ldquo;No UK food business should lose their FHRS rating because they forgot to review their HACCP plan.&rdquo;
            </blockquote>
            <p style={{ fontSize: 14, color: '#a1a1a6', margin: 0 }}>— The Complynt founding principle</p>
          </div>
        </section>

        {/* ── Values ── */}
        <section style={{ background: 'white', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>How we work</div>
              <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0 }}>
                Four principles we don&apos;t compromise on.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {[
                { icon: '🎯', title: 'UK-specific, always', body: 'Every feature maps to a real UK law — FHRS, Natasha\'s Law, Owen\'s Law, the Licensing Act. We don\'t include generic advice. Every piece of guidance is specific to England and Wales.' },
                { icon: '🔔', title: 'Automation over memory', body: 'You shouldn\'t have to remember your allergen matrix review date. We do. Automated alerts 30, 14, and 7 days before every deadline — so you never get surprised.' },
                { icon: '🔒', title: 'Your data is yours', body: 'We never sell your compliance data, use it for advertising, or share it with third parties beyond what\'s needed to run the service. You own it. You can export and delete it at any time.' },
                { icon: '🏅', title: 'Genuinely useful or nothing', body: "We don't build features for the sake of it. Every tool in Complynt exists because real EHO inspectors check for it, or real UK laws require it. If it doesn't protect your business, it's not in the product." },
              ].map(v => (
                <div key={v.title} style={{ background: '#f5f5f7', border: '1px solid #e5e5ea', borderRadius: 20, padding: '28px 24px' }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{v.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1d1d1f', margin: '0 0 10px', letterSpacing: '-0.01em' }}>{v.title}</h3>
                  <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.65, margin: 0 }}>{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Coverage ── */}
        <section style={{ background: '#020c15', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, color: 'white', letterSpacing: '-0.025em', lineHeight: 1.2, margin: '0 0 14px' }}>
                What Complynt covers today
              </h2>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', margin: 0 }}>UK food businesses — England and Wales.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {[
                'Compliance Dashboard', 'EHO Inspection Simulator', 'HACCP Plan Generator', 'Allergen Matrix Builder',
                'Temperature Log', 'Staff Training Tracker', 'Document Vault', 'AI Compliance Assistant',
                'Compliance Calendar', 'FSA FHRS Lookup', 'Deadline Alerts', 'Multi-location Support',
              ].map(t => (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 36, padding: '20px 24px', background: 'rgba(0,113,227,0.1)', border: '1px solid rgba(0,113,227,0.25)', borderRadius: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Coming soon</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>Australia (food safety framework, state-level licensing). Scotland (separate food safety enforcement). WhatsApp deadline alerts. PDF export for EHO inspections.</p>
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section style={{ background: '#f5f5f7', padding: 'clamp(64px,8vw,100px) clamp(20px,4vw,48px)', borderTop: '1px solid #e5e5ea' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px,3vw,34px)', fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.025em', lineHeight: 1.2, margin: '0 0 16px' }}>
              Get in touch.
            </h2>
            <p style={{ fontSize: 16, color: '#6e6e73', lineHeight: 1.65, margin: '0 0 36px', maxWidth: 480, marginInline: 'auto' }}>
              Questions about the product, a specific compliance scenario, a partnership, or anything else — we read every email.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
              {[
                { label: 'General', email: 'hello@complynt.co.uk' },
                { label: 'Privacy & data', email: 'privacy@complynt.co.uk' },
                { label: 'Legal', email: 'legal@complynt.co.uk' },
              ].map(c => (
                <div key={c.label} style={{ background: 'white', border: '1px solid #e5e5ea', borderRadius: 14, padding: '16px 22px', textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{c.label}</div>
                  <a href={`mailto:${c.email}`} style={{ fontSize: 14, fontWeight: 600, color: '#0071e3', textDecoration: 'none' }}>{c.email}</a>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/onboarding" style={{ background: '#0071e3', color: 'white', textDecoration: 'none', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700 }}>Start free →</Link>
              <Link href="/features" style={{ background: 'white', color: '#1d1d1f', textDecoration: 'none', padding: '13px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, border: '1px solid #e5e5ea' }}>See features</Link>
            </div>
          </div>
        </section>

      </main>
    </>
  )
}
