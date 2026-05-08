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
  features:     { icon: string; title: string; desc: string }[]
  categories:   { icon: string; name: string; auth: string }[]
  plans:        { name: string; price: string; period: string; features: string[]; featured?: boolean; badge?: string }[]
  announceBar?: string
  currency:     string
}

const DashboardMockup = ({ url }: { url: string }) => (
  <div className="w-full max-w-[640px] mx-auto mt-12">
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
      {/* Announce bar */}
      {config.announceBar && !announceDismissed && (
        <div className="relative bg-[#0071e3] text-white text-center py-2.5 px-10 text-[13px] font-medium">
          <span dangerouslySetInnerHTML={{ __html: config.announceBar }} />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-transparent border-0 cursor-pointer text-[18px] leading-none"
            onClick={() => setAnnounceDismissed(true)}
            aria-label="Dismiss"
          >×</button>
        </div>
      )}

      <Nav region={config.region} />

      <main>

        {/* HERO */}
        <section id="home" className="max-w-[1060px] mx-auto px-5 pt-20 pb-12 text-center flex flex-col items-center">
          <div className="flex items-center gap-2 bg-[#e8f2ff] text-[#0071e3] px-3 py-1.5 rounded-full text-[12px] font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse" />
            {config.badge}
          </div>
          <h1
            className="text-[clamp(32px,5vw,54px)] font-extrabold text-[#1d1d1f] tracking-tight leading-[1.1] mb-5 [&_em]:text-[#0071e3] [&_em]:not-italic"
            dangerouslySetInnerHTML={{ __html: config.heroHeadline }}
          />
          <p className="text-[18px] text-[#6e6e73] max-w-[540px] leading-relaxed mb-8">{config.heroSub}</p>
          <div className="flex gap-4 flex-wrap justify-center mb-4">
            <Link
              href="/onboarding"
              className="px-7 py-3.5 bg-[#0071e3] text-white rounded-[12px] font-semibold text-[16px] hover:bg-[#0058b0] transition-colors"
            >
              {config.heroCta}
            </Link>
            <Link
              href="/features"
              className="px-7 py-3.5 bg-[#f5f5f7] text-[#1d1d1f] border border-[#e5e5ea] rounded-[12px] font-semibold text-[16px] hover:bg-[#e5e5ea] transition-colors"
            >
              See how it works →
            </Link>
          </div>
          <span className="text-[12px] text-[#a1a1a6] mb-12">{config.heroNote}</span>
          <DashboardMockup url={config.mockupUrl} />
        </section>

        {/* FEATURES */}
        <section className="bg-[#f5f5f7] py-20">
          <div className="max-w-[1060px] mx-auto px-5">
            <span className="text-[12px] font-bold text-[#0071e3] uppercase tracking-widest block mb-3">Features</span>
            <h2 className="text-[clamp(26px,3.5vw,38px)] font-bold text-[#1d1d1f] tracking-tight mb-3">
              Everything you need to stay compliant.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {config.features.map(f => (
                <div key={f.title} className="bg-white rounded-[18px] p-6 border border-[#e5e5ea]">
                  <div
                    className="w-10 h-10 bg-[#e8f2ff] rounded-[12px] flex items-center justify-center text-[#0071e3] mb-3"
                    dangerouslySetInnerHTML={{ __html: f.icon }}
                  />
                  <div className="text-[15px] font-bold text-[#1d1d1f] mb-1.5">{f.title}</div>
                  <div className="text-[14px] text-[#6e6e73] leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPLIANCE CATEGORIES */}
        <section className="max-w-[1060px] mx-auto px-5 py-20">
          <span className="text-[12px] font-bold text-[#0071e3] uppercase tracking-widest block mb-3">What we track</span>
          <h2 className="text-[clamp(26px,3.5vw,38px)] font-bold text-[#1d1d1f] tracking-tight mb-3">
            Every licence and obligation, covered.
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
            {config.categories.map(c => (
              <div key={c.name} className="flex items-center gap-3 bg-white rounded-[14px] p-4 border border-[#e5e5ea]">
                <div
                  className="w-9 h-9 rounded-[10px] bg-[#e8f2ff] flex items-center justify-center text-[#0071e3] shrink-0"
                  dangerouslySetInnerHTML={{ __html: c.icon }}
                />
                <div>
                  <div className="text-[13px] font-semibold text-[#1d1d1f]">{c.name}</div>
                  <div className="text-[11px] text-[#a1a1a6] mt-0.5">{c.auth}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section className="bg-[#f5f5f7] py-20">
          <div className="max-w-[1060px] mx-auto px-5">
            <span className="text-[12px] font-bold text-[#0071e3] uppercase tracking-widest block mb-3">Pricing</span>
            <h2 className="text-[clamp(26px,3.5vw,38px)] font-bold text-[#1d1d1f] tracking-tight mb-3">
              Simple, transparent pricing.
            </h2>
            <p className="text-base text-[#6e6e73] mb-10">Start free. Upgrade when you&apos;re ready.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {config.plans.map(p => (
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
                  <div className="text-[18px] font-bold text-[#1d1d1f] mb-1">{p.name}</div>
                  <div className="text-[42px] font-extrabold text-[#1d1d1f] leading-none my-2">
                    <sub className="text-[20px] align-middle">{config.currency}</sub>{p.price}
                  </div>
                  <div className="text-[13px] text-[#a1a1a6] mb-5">{p.period}</div>
                  <ul className="flex flex-col gap-2 mb-6 flex-1 list-none pl-0">
                    {p.features.map(f => (
                      <li key={f} className="flex gap-2 items-start text-[13px] text-[#6e6e73]">
                        <span className="text-[#34c759] font-bold shrink-0 mt-0.5">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/onboarding"
                    className={`block text-center py-3 rounded-[10px] font-semibold text-[14px] transition-colors ${
                      p.featured
                        ? 'bg-[#0071e3] text-white hover:bg-[#0058b0]'
                        : 'bg-[#f5f5f7] text-[#1d1d1f] border border-[#e5e5ea] hover:bg-[#e5e5ea]'
                    }`}
                  >
                    {p.price === '0' ? 'Get started free' : 'Start free trial'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="px-5 pb-20">
          <div className="bg-gradient-to-br from-[#0071e3] to-[#0058b0] rounded-[24px] p-16 text-center">
            <h2 className="text-[clamp(26px,3.5vw,38px)] font-extrabold text-white mb-3">
              Ready to stop worrying about compliance?
            </h2>
            <p className="text-[16px] text-white/80 mb-8 max-w-[480px] mx-auto">
              Join businesses that never miss a deadline. Set up takes under 5 minutes.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/onboarding"
                className="bg-white text-[#0071e3] px-7 py-3.5 rounded-[12px] font-bold text-[15px] hover:bg-[#f0f0f0] transition-colors"
              >
                Start free today
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
