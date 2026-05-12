'use client'
import { useState } from 'react'
import Link from 'next/link'

const TABS = [
  {
    id: 'food',
    label: 'Food Safety',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M9 12l2 2 4-4"/><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>
      </svg>
    ),
    headline: 'Inspection-ready, every single day.',
    sub: "88% of UK consumers check hygiene ratings before visiting. Your FHRS score is public — and so is every failure. Complynt tracks every food safety obligation so an unannounced EHO visit is never a surprise.",
    items: [
      { title: 'HACCP Records & Food Safety Management', desc: 'The #1 cause of sub-3 FHRS ratings. Complynt tracks your review dates and alerts you before records go stale — the inspector asks for these first.' },
      { title: "Natasha's Law Allergen Compliance", desc: 'All 14 regulated allergens mapped across every dish. Written allergen information ready for every customer, every service.' },
      { title: "Owen's Law Preparation", desc: 'Written allergen menus will be mandatory legislation by 2027–2028. Complynt gets you compliant before the law forces it — at no extra effort.' },
      { title: 'Staff Food Hygiene Training Tracker', desc: 'Level 2 food hygiene certificate expiry tracked for every food handler. EHOs check training records on every inspection visit.' },
      { title: 'Food Business Registration & FHRS Link', desc: 'Your hygiene rating is tied to your registration address. Track your rating, monitor inspection history, and know when a re-inspection is due.' },
    ],
  },
  {
    id: 'licensing',
    label: 'Licensing',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
    headline: 'Never let a licence lapse.',
    sub: 'Selling alcohol without a valid premises licence is a criminal offence — fines up to £20,000 and up to 6 months imprisonment. Complynt tracks every licence condition, renewal date, and DPS obligation.',
    items: [
      { title: 'Premises Licence (Licensing Act 2003)', desc: 'Renewal dates, DPS conditions, and Challenge 25 compliance all tracked. Any change to hours, layout, or activities requires a formal variation — Complynt flags the trigger.' },
      { title: 'DPS DBS Certificate Renewal', desc: 'Designated Premises Supervisor background checks expire every 3 years. Complynt alerts you 60 days before expiry.' },
      { title: 'Licence Conditions Vault', desc: 'Your specific premises licence conditions — noise, capacity, security requirements — stored and accessible to all relevant staff.' },
      { title: 'Licence Variation Alerts', desc: 'Changing your layout, hours, or adding a new licensable activity? A formal variation application is required. Complynt prevents accidental breaches.' },
    ],
  },
  {
    id: 'employment',
    label: 'Employment',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    headline: 'Staff compliance that actually works.',
    sub: 'Civil penalties up to £45,000 per illegal worker. HMRC publicly names businesses that underpay the minimum wage. Complynt keeps every employment obligation tracked and on time.',
    items: [
      { title: 'National Living Wage — April Updates', desc: "Every April the NLW changes. Complynt alerts you ahead of time with the new rates for each age band — missed upratings are HMRC's #1 hospitality enforcement target." },
      { title: 'Right to Work Records', desc: 'UK nationals, EU settled status share codes, and non-EU visa holders all tracked with document expiry alerts. Joint immigration and EHO inspections happen.' },
      { title: 'Holiday Pay Compliance', desc: 'Variable-hours staff holiday pay calculations are notoriously complex and frequently wrong. Complynt flags when records need an annual review.' },
      { title: 'PAYE & Payroll Deadlines', desc: 'Monthly PAYE payment deadlines and RTI submission reminders so you never incur late payment surcharges from HMRC.' },
    ],
  },
  {
    id: 'tax',
    label: 'Tax & Finance',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    headline: 'Never miss an HMRC deadline.',
    sub: 'VAT surcharges, PAYE penalties, and late filing fines are entirely avoidable. Complynt tracks every HMRC obligation with automated alerts so nothing slips through the cracks.',
    items: [
      { title: 'VAT Returns (Making Tax Digital)', desc: 'Quarterly MTD VAT return deadlines tracked and alerted. 20% standard rate applies to hot food and restaurant service — Complynt flags the rules that catch operators out.' },
      { title: 'VAT Registration Threshold Watch', desc: 'Automatic alert when your 12-month rolling turnover approaches the £90,000 registration threshold — with time to register before penalties apply.' },
      { title: 'PAYE Payment Deadlines', desc: 'Monthly PAYE payment reminders. Late payment triggers automatic surcharges and HMRC interest — easily avoided with a reminder.' },
      { title: 'Companies House Annual Filings', desc: 'Confirmation statement and annual accounts deadlines tracked for your registered company. Missed filings lead to automatic strike-off.' },
    ],
  },
  {
    id: 'safety',
    label: 'Safety & Insurance',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    headline: 'Cover every legal safety obligation.',
    sub: "Operating without EL insurance costs £2,500 per day. An expired fire risk assessment can close your premises with immediate effect. Complynt ensures nothing lapses — ever.",
    items: [
      { title: "Employer's Liability Insurance", desc: 'Minimum £5m cover mandatory under the 1969 Act. Annual renewal tracked with 60-day advance alerts. Must be displayed at the premises at all times.' },
      { title: 'Fire Risk Assessment', desc: 'Annual FRA required under the Regulatory Reform (Fire Safety) Order 2005. The Fire Service can issue a Prohibition Notice closing your premises immediately for non-compliance.' },
      { title: 'Gas Safety Certificate (CP12)', desc: 'All commercial gas appliances inspected annually by a Gas Safe registered engineer. Complynt books ahead of expiry and stores the CP12 in your document vault.' },
      { title: 'Electrical Safety (EICR)', desc: 'Fixed electrical installation condition reports required every 5 years. Complynt tracks this long cycle automatically so it never catches you off-guard.' },
    ],
  },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('food')
  const tab = TABS.find(t => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-[#f5f5f7]">

      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-5 bg-[#f5f5f7]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0071e3] rounded-[9px] flex items-center justify-center text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <span className="text-[17px] font-bold text-[#1d1d1f] tracking-tight">Complynt</span>
        </div>
        <Link href="/login" className="text-[13px] font-medium text-[#0071e3] hover:text-[#0058b0]">
          Log in →
        </Link>
      </nav>

      <main className="max-w-[860px] mx-auto px-5 pb-24">

        {/* Hero */}
        <div className="text-center pt-14 pb-12">
          <div className="inline-flex items-center gap-2 bg-[#e8f2ff] text-[#0071e3] px-3 py-1.5 rounded-full text-[12px] font-semibold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] animate-pulse" />
            Now live in the United Kingdom
          </div>
          <h1 className="text-[clamp(30px,5vw,50px)] font-extrabold text-[#1d1d1f] tracking-tight leading-[1.08] mb-4">
            Compliance tracking built<br />for UK hospitality.
          </h1>
          <p className="text-[17px] text-[#6e6e73] max-w-[500px] mx-auto leading-relaxed mb-8">
            Every FHRS deadline, allergen obligation, licence renewal, and HMRC filing — tracked and alerted from one dashboard. Never fail an inspection again.
          </p>
          <Link
            href="/uk"
            onClick={() => localStorage.setItem('complynt_region', 'UK')}
            className="inline-block px-8 py-3.5 bg-[#0071e3] text-white rounded-[12px] font-semibold text-[16px] hover:bg-[#0058b0] transition-colors"
          >
            Get started — it&apos;s free
          </Link>
          <p className="text-[12px] text-[#a1a1a6] mt-3">No credit card required · Set up in under 5 minutes</p>
        </div>

        {/* Region cards */}
        <div className="flex gap-4 justify-center flex-wrap mb-16">
          {/* UK — live */}
          <Link
            href="/uk"
            onClick={() => localStorage.setItem('complynt_region', 'UK')}
            className="flex flex-col items-center gap-2.5 bg-white border-[1.5px] border-[#0071e3] shadow-[0_4px_20px_rgba(0,113,227,.12)] rounded-[18px] p-6 w-[220px] text-center no-underline transition-all duration-[180ms] hover:shadow-[0_8px_28px_rgba(0,113,227,.18)] hover:-translate-y-0.5"
          >
            <span className="text-4xl leading-none">🇬🇧</span>
            <span className="text-[17px] font-bold text-[#1d1d1f]">United Kingdom</span>
            <p className="text-[11px] text-[#6e6e73] leading-relaxed">FSA · FHRS · Premises Licence · HMRC · Fire Safety · RTW</p>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[rgba(52,199,89,0.12)] text-[#1a7a34]">
              ● Live · London
            </span>
          </Link>

          {/* Australia — coming soon */}
          <div className="flex flex-col items-center gap-2.5 bg-white border-[1.5px] border-[#e5e5ea] rounded-[18px] p-6 w-[220px] text-center opacity-60 cursor-not-allowed select-none">
            <span className="text-4xl leading-none grayscale">🇦🇺</span>
            <span className="text-[17px] font-bold text-[#1d1d1f]">Australia</span>
            <p className="text-[11px] text-[#a1a1a6] leading-relaxed">Food Safety · VCGLR · Fair Work · ATO / BAS · WorkSafe</p>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[rgba(255,159,10,0.10)] text-[#8a4d00]">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Feature tabs section */}
        <div className="mb-4">
          <p className="text-[12px] font-bold text-[#0071e3] uppercase tracking-widest text-center mb-2">What Complynt covers</p>
          <h2 className="text-[clamp(22px,3vw,32px)] font-bold text-[#1d1d1f] tracking-tight text-center mb-8">
            Every compliance area, in one place.
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-[#e5e5ea] rounded-[14px] p-1.5 mb-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-[13px] font-semibold whitespace-nowrap transition-all border-0 cursor-pointer flex-1 justify-center ${
                activeTab === t.id
                  ? 'bg-[#0071e3] text-white shadow-sm'
                  : 'text-[#6e6e73] bg-transparent hover:bg-[#f5f5f7]'
              }`}
            >
              <span className={activeTab === t.id ? 'text-white' : 'text-[#6e6e73]'}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-white border border-[#e5e5ea] rounded-[20px] p-7">
          <div className="mb-6">
            <h3 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight mb-2">{tab.headline}</h3>
            <p className="text-[14px] text-[#6e6e73] leading-relaxed max-w-[640px]">{tab.sub}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tab.items.map(item => (
              <div key={item.title} className="flex gap-3 p-4 bg-[#f5f5f7] rounded-[14px]">
                <div className="w-5 h-5 rounded-full bg-[#e8f2ff] flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#1d1d1f] mb-0.5">{item.title}</div>
                  <div className="text-[12px] text-[#6e6e73] leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-8 bg-gradient-to-br from-[#0071e3] to-[#0058b0] rounded-[20px] px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-white font-bold text-[18px] mb-1">Ready to stay compliant?</div>
            <div className="text-white/75 text-[13px]">Free plan forever · No credit card · Set up in 5 minutes</div>
          </div>
          <Link
            href="/uk"
            onClick={() => localStorage.setItem('complynt_region', 'UK')}
            className="bg-white text-[#0071e3] px-6 py-3 rounded-[12px] font-bold text-[14px] hover:bg-[#f0f0f0] transition-colors whitespace-nowrap shrink-0"
          >
            Start free →
          </Link>
        </div>

        <p className="mt-6 text-[13px] text-[#a1a1a6] text-center">
          Already have an account? <Link href="/login" className="text-[#0071e3] font-medium">Log in →</Link>
        </p>

      </main>
    </div>
  )
}
