'use client'
import { useState } from 'react'
import Link from 'next/link'
import Nav from './Nav'

export interface RegionalConfig {
  region: 'in' | 'uk' | 'au'
  lang:   string
  title:  string
  desc:   string
  badge:  string
  heroHeadline: string
  heroSub:      string
  heroCta:      string
  heroNote:     string
  mockupUrl:    string
  stats:        { val: string; label: string }[]
  leftPanelSub: string
  features: { icon: string; title: string; desc: string }[]
  categories: { icon: string; name: string; auth: string }[]
  plans: { name: string; price: string; period: string; features: string[]; featured?: boolean; badge?: string }[]
  announceBar?: string
  currency:     string
}

const DashboardMockup = ({ url }: { url: string }) => (
  <div className="hero-visual">
    <div className="mockup-frame">
      <div className="mockup-chrome">
        <div className="chrome-dots">
          <div className="chrome-dot r" /><div className="chrome-dot y" /><div className="chrome-dot g" />
        </div>
        <div className="chrome-bar">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          {url}
        </div>
      </div>
      <div className="mockup-body-inner">
        <div className="mockup-sidebar">
          <div className="sb-dot active" /><div className="sb-dot" /><div className="sb-dot" /><div className="sb-dot" />
        </div>
        <div className="mockup-content">
          <div className="mockup-stat-row">
            <div className="m-stat blue"><div className="m-stat-val">8</div><div className="m-stat-label">Licenses tracked</div></div>
            <div className="m-stat orange"><div className="m-stat-val">2</div><div className="m-stat-label">Due this month</div></div>
            <div className="m-stat green"><div className="m-stat-val">72%</div><div className="m-stat-label">Health score</div></div>
          </div>
          <div className="m-row w80" />
          <div className="m-row w60" />
          <div className="m-row w45" />
        </div>
      </div>
    </div>
  </div>
)

export default function RegionalLanding({ config }: { config: RegionalConfig }) {
  const [announceDismissed, setAnnounceDismissed] = useState(false)

  return (
    <>
      {config.announceBar && !announceDismissed && (
          <div className="announce-bar">
            <span dangerouslySetInnerHTML={{ __html: config.announceBar }} />
            <button className="announce-close" onClick={() => setAnnounceDismissed(true)} aria-label="Dismiss">×</button>
          </div>
        )}

        <Nav region={config.region} />

        <main style={{ paddingTop: config.announceBar && !announceDismissed ? 0 : 0 }}>

          {/* HERO */}
          <section className="hero" id="home">
            <div className="hero-badge">
              <span className="badge-dot" />
              {config.badge}
            </div>
            <h1 className="hero-headline" dangerouslySetInnerHTML={{ __html: config.heroHeadline }} />
            <p className="hero-sub">{config.heroSub}</p>
            <div className="hero-actions">
              <Link href="/onboarding" className="btn btn-blue btn-lg" style={{ background: 'var(--blue)', color: '#fff', padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: 16 }}>
                {config.heroCta}
              </Link>
              <Link href="/features" style={{ padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: 16, color: 'var(--text)', background: 'var(--bg-alt)', border: '1px solid var(--border-lt)' }}>
                See how it works →
              </Link>
            </div>
            <span className="hero-note">{config.heroNote}</span>
            <DashboardMockup url={config.mockupUrl} />
          </section>

          {/* FEATURES */}
          <section className="section" style={{ background: 'var(--bg-alt)', borderRadius: 24, maxWidth: '100%', padding: '80px 0' }}>
            <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 20px' }}>
              <span className="eyebrow">Features</span>
              <h2 className="section-headline">Everything you need to stay compliant.</h2>
              <div className="feature-grid">
                {config.features.map(f => (
                  <div key={f.title} className="feature-card">
                    <div className="feature-icon" dangerouslySetInnerHTML={{ __html: f.icon }} />
                    <div className="feature-title">{f.title}</div>
                    <div className="feature-desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* COMPLIANCE CATEGORIES */}
          <section className="section">
            <span className="eyebrow">What we track</span>
            <h2 className="section-headline">Every licence and obligation, covered.</h2>
            <div className="compliance-cats">
              {config.categories.map(c => (
                <div key={c.name} className="compliance-cat">
                  <div className="cat-icon" dangerouslySetInnerHTML={{ __html: c.icon }} />
                  <div>
                    <div className="cat-name">{c.name}</div>
                    <div className="cat-auth">{c.auth}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PRICING */}
          <section className="section" style={{ background: 'var(--bg-alt)', borderRadius: 24, maxWidth: '100%', padding: '80px 0' }}>
            <div style={{ maxWidth: 1060, margin: '0 auto', padding: '0 20px' }}>
              <span className="eyebrow">Pricing</span>
              <h2 className="section-headline">Simple, transparent pricing.</h2>
              <p className="section-sub">Start free. Upgrade when you&apos;re ready.</p>
              <div className="pricing-grid">
                {config.plans.map(p => (
                  <div key={p.name} className={`pricing-card${p.featured ? ' featured' : ''}`}>
                    {p.badge && <span className="pricing-badge">{p.badge}</span>}
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{p.name}</div>
                    <div className="pricing-price"><sub>{config.currency}</sub>{p.price}</div>
                    <div className="pricing-period">{p.period}</div>
                    <ul className="pricing-features">
                      {p.features.map(f => <li key={f}>{f}</li>)}
                    </ul>
                    <Link
                      href="/onboarding"
                      style={{
                        display: 'block', textAlign: 'center', padding: '12px',
                        background: p.featured ? 'var(--blue)' : 'var(--bg-alt)',
                        color: p.featured ? '#fff' : 'var(--text)',
                        borderRadius: 10, fontWeight: 600, fontSize: 14,
                        border: p.featured ? 'none' : '1px solid var(--border-lt)',
                      }}
                    >
                      {p.price === '0' ? 'Get started free' : 'Start free trial'}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <div style={{ padding: '0 20px 80px' }}>
            <div className="cta-section">
              <h2 className="cta-headline">Ready to stop worrying about compliance?</h2>
              <p className="cta-sub">Join businesses that never miss a deadline. Set up takes under 5 minutes.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/onboarding" style={{ background: '#fff', color: 'var(--blue)', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15 }}>
                  Start free today
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
