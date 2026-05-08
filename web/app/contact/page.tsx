'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function ContactPage() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [business, setBusiness] = useState('')
  const [region,   setRegion]   = useState('')
  const [message,  setMessage]  = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('complynt_region')
    if (saved) {
      const map: Record<string, string> = { IN: 'India', AU: 'Australia', UK: 'UK' }
      if (map[saved]) setRegion(map[saved])
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !message) { setError('Please fill in your name, email, and message.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return }

    setLoading(true)
    try {
      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        business:  business || null,
        region:    region   || null,
        message,
        createdAt: serverTimestamp(),
        source:    typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
      })
      setSuccess(true)
    } catch {
      setError('Something went wrong — please email us directly at hello@complynt.com')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Nav solid />
      <div style={{ paddingTop: 'var(--nav-h)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 1060, margin: '0 auto', padding: '72px 32px 100px', gap: 72, alignItems: 'start' }}>

          {/* Left: copy */}
          <div>
            <h1 style={{ fontSize: 'clamp(34px,4vw,52px)', fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1.08, color: 'var(--text)', marginBottom: 16 }}>
              Let&apos;s talk.
            </h1>
            <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 44, maxWidth: 380 }}>
              Whether you&apos;re evaluating Complynt, need help with your account, or have a compliance question — we&apos;re here and we reply fast.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { title: 'Demo & sales',              desc: 'See the platform live for your business type' },
                { title: 'Account support',            desc: 'Questions about your subscription, features, or billing' },
                { title: 'Compliance questions',       desc: 'Ask about licences, filings, or deadlines in your region' },
                { title: 'Partnerships & enterprise',  desc: 'Multi-location groups, accountant integrations, white-label' },
              ].map(r => (
                <div key={r.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--blue-mid)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--blue)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                      <rect x="9" y="3" width="6" height="4" rx="1"/>
                    </svg>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{r.title}</strong>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div style={{ background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 18, padding: 40, boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text)', marginBottom: 4 }}>Send us a message</h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)' }}>We reply within one business day.</p>
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--green-lt)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Message sent!</h3>
                <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6 }}>Thanks for reaching out. We&apos;ll get back to you within one business day.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="ct-name">Full name</label>
                  <input className="form-input" id="ct-name" type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ct-email">Email</label>
                  <input className="form-input" id="ct-email" type="email" placeholder="you@business.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ct-business">
                    Business name <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>— optional</span>
                  </label>
                  <input className="form-input" id="ct-business" type="text" placeholder="Your restaurant, pub, or company" value={business} onChange={e => setBusiness(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ct-region">Your region</label>
                  <select className="form-input" id="ct-region" value={region} onChange={e => setRegion(e.target.value)}>
                    <option value="">Select region…</option>
                    <option value="India">India</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Other">Other / Not sure yet</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="ct-message">How can we help?</label>
                  <textarea className="form-input" id="ct-message" placeholder="Tell us what you're looking for…" value={message} onChange={e => setMessage(e.target.value)} required style={{ minHeight: 120, resize: 'vertical' }} />
                </div>

                {error && <p className="form-error visible">{error}</p>}

                <button type="submit" disabled={loading} className="flex justify-center items-center w-full py-3 bg-[#0071e3] text-white border-0 rounded-[10px] text-[15px] font-semibold cursor-pointer mt-2 disabled:opacity-60 hover:bg-[#0058b0] transition-colors">
                  {loading ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
