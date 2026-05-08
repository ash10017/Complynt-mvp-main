'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NavProps {
  region?: 'in' | 'uk' | 'au'
  solid?: boolean
}

const LogoMark = () => (
  <div className="w-7 h-7 rounded-lg bg-blue flex items-center justify-center text-white flex-shrink-0">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
      <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    </svg>
  </div>
)

export default function Nav({ region, solid = false }: NavProps) {
  const [scrolled,    setScrolled]    = useState(false)
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  useEffect(() => {
    if (solid) return
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [solid])

  const base     = region ? `/${region}` : ''
  const homeHref = region ? `/${region}` : '/'

  const navBg = solid || scrolled
    ? 'bg-white/90 backdrop-blur-xl border-b border-border'
    : 'bg-transparent'

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${navBg}`} style={{ height: '56px' }}>
        <div className="max-w-[1140px] mx-auto px-6 h-full flex items-center justify-between gap-6">
          {/* Brand */}
          <Link href={homeHref} className="flex items-center gap-2 no-underline">
            <LogoMark />
            <span className="font-semibold text-[15px] text-text tracking-tight">Complynt</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm text-text-2 hover:text-text transition-colors">Features</Link>
            <Link href="/pricing"  className="text-sm text-text-2 hover:text-text transition-colors">Pricing</Link>
            <Link href="/contact"  className="text-sm text-text-2 hover:text-text transition-colors">Talk to us</Link>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-text-2 hover:text-text px-3 py-1.5 rounded-md transition-colors">
              Log in
            </Link>
            <Link href="/onboarding" className="text-sm font-semibold text-white bg-blue hover:bg-blue-dark px-4 py-1.5 rounded-lg transition-colors">
              Get started
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-1.5"
            onClick={() => setDrawerOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className="w-5 h-0.5 bg-text block" />
            <span className="w-5 h-0.5 bg-text block" />
            <span className="w-5 h-0.5 bg-text block" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-white pt-14 px-6 flex flex-col gap-5 md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <Link href="/features" className="text-base font-medium text-text py-2 border-b border-border-lt">Features</Link>
          <Link href="/pricing"  className="text-base font-medium text-text py-2 border-b border-border-lt">Pricing</Link>
          <Link href="/contact"  className="text-base font-medium text-text py-2 border-b border-border-lt">Talk to us</Link>
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/login"       className="text-center py-2.5 rounded-xl border border-border font-medium text-text">Log in</Link>
            <Link href="/onboarding"  className="text-center py-2.5 rounded-xl bg-blue text-white font-semibold">Get started</Link>
          </div>
        </div>
      )}
    </>
  )
}
