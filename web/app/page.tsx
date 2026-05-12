'use client'
import { useEffect } from 'react'
import Link from 'next/link'

const regions = [
  { code: 'UK', href: '/uk', flag: '🇬🇧', name: 'United Kingdom',  authorities: 'FSA · FHRS Inspection · Premises Licence · HMRC · Fire Safety · Right to Work', status: 'live', label: 'Live · London' },
  { code: 'AU', href: '/au', flag: '🇦🇺', name: 'Australia',       authorities: 'Food Safety · VCGLR · Fair Work · ATO / BAS · WorkSafe · Superannuation', status: 'live',  label: 'Live · Melbourne' },
  // India support coming soon
  // { code: 'IN', href: '/in', flag: '🇮🇳', name: 'India', authorities: 'FSSAI · BBMP · Karnataka Excise · ESIC · EPFO · GST · Fire NOC', status: 'soon', label: 'Coming Soon' },
]

export default function CountrySelector() {
  useEffect(() => {
    const saved = localStorage.getItem('complynt_region')
    if (saved) {
      const card = document.querySelector<HTMLElement>(`[data-region="${saved}"]`)
      if (card) card.style.borderColor = '#0071e3'
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10">
      {/* Logo */}
      <a href="#" className="flex items-center gap-2.5 mb-14">
        <div className="w-9 h-9 bg-[#0071e3] rounded-[10px] flex items-center justify-center text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-[#1d1d1f] tracking-tight">Complynt</span>
      </a>

      <h1 className="text-[clamp(28px,4vw,42px)] font-bold text-[#1d1d1f] tracking-tight text-center mb-2.5">
        Where is your business?
      </h1>
      <p className="text-base text-[#6e6e73] max-w-[440px] text-center leading-relaxed mb-10">
        Complynt is tailored to the compliance requirements of each country. Select yours to continue.
      </p>

      {/* Region cards */}
      <div className="flex gap-4 flex-wrap justify-center max-w-[780px]">
        {regions.map(r => (
          <Link
            key={r.code}
            href={r.href}
            data-region={r.code}
            onClick={() => localStorage.setItem('complynt_region', r.code)}
            className="flex flex-col items-center gap-2.5 bg-white border-[1.5px] border-[#e5e5ea] rounded-[18px] p-7 w-[220px] text-center cursor-pointer no-underline transition-all duration-[180ms] hover:border-[#0071e3] hover:shadow-[0_8px_24px_rgba(0,113,227,.10)] hover:-translate-y-0.5"
          >
            <span className="text-4xl leading-none">{r.flag}</span>
            <span className="text-[17px] font-bold text-[#1d1d1f]">{r.name}</span>
            <p className="text-[11.5px] text-[#a1a1a6] leading-relaxed">{r.authorities}</p>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              r.status === 'live'
                ? 'bg-[rgba(52,199,89,0.10)] text-[#1a7a34]'
                : 'bg-[rgba(255,159,10,0.10)] text-[#8a4d00]'
            }`}>
              {r.label}
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm text-[#6e6e73] text-center">
        Already have an account? <Link href="/login" className="text-[#0071e3] font-medium">Log in →</Link>
        &nbsp;·&nbsp; More regions coming soon
      </p>
    </div>
  )
}
