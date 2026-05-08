'use client'
import { useEffect } from 'react'
import Link from 'next/link'

const LogoMark = () => (
  <div className="cs-logo-mark">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    </svg>
  </div>
)

const regions = [
  {
    code: 'IN',
    href: '/in',
    flag: '🇮🇳',
    name: 'India',
    authorities: 'FSSAI · BBMP · Karnataka Excise · ESIC · EPFO · GST · Fire NOC',
    status: 'live' as const,
    statusLabel: 'Live · Bangalore',
  },
  {
    code: 'AU',
    href: '/au',
    flag: '🇦🇺',
    name: 'Australia',
    authorities: 'Food Safety · VCGLR · Fair Work · ATO / BAS · WorkSafe · Superannuation',
    status: 'live' as const,
    statusLabel: 'Live · Melbourne',
  },
  {
    code: 'UK',
    href: '/uk',
    flag: '🇬🇧',
    name: 'United Kingdom',
    authorities: 'FSA · Premises Licence · HMRC / VAT · Companies House · HSE · Employer Liability',
    status: 'early' as const,
    statusLabel: 'Early Access · London',
  },
]

export default function CountrySelector() {
  useEffect(() => {
    const saved = localStorage.getItem('complynt_region')
    if (saved) {
      const card = document.querySelector<HTMLElement>(`[data-region="${saved}"]`)
      if (card) card.style.borderColor = '#0071e3'
    }
  }, [])

  const handleRegionClick = (code: string) => {
    localStorage.setItem('complynt_region', code)
  }

  return (
    <div className="cs-page">
      <a href="#" className="cs-logo">
        <LogoMark />
        <span className="cs-logo-name">Complynt</span>
      </a>

      <h1 className="cs-headline">Where is your business?</h1>
      <p className="cs-sub">
        Complynt is tailored to the compliance requirements of each country. Select yours to continue.
      </p>

      <div className="cs-cards">
        {regions.map(r => (
          <Link
            key={r.code}
            href={r.href}
            className="cs-card"
            data-region={r.code}
            onClick={() => handleRegionClick(r.code)}
          >
            <div className="cs-flag">{r.flag}</div>
            <div className="cs-country-name">{r.name}</div>
            <p className="cs-authorities">{r.authorities}</p>
            <span className={`cs-status ${r.status}`}>{r.statusLabel}</span>
          </Link>
        ))}
      </div>

      <p className="cs-footer-row">
        Already have an account? <Link href="/login">Log in →</Link>
        &nbsp;·&nbsp; More regions coming soon
      </p>
    </div>
  )
}
