'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { ALL_LICENSES, LICENSE_DOCS } from '@/lib/compliances'
import type { Compliance } from '@/types'

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6

const BIZ_TYPES = [
  { id: 'restaurant',    label: 'Restaurant',    icon: '🍽️', desc: 'Dine-in or takeaway food' },
  { id: 'hotel',         label: 'Hotel',         icon: '🏨', desc: 'Accommodation + food service' },
  { id: 'cafe',          label: 'Café / Bar',    icon: '☕', desc: 'Coffee shop, bar, or pub' },
  { id: 'cloud_kitchen', label: 'Cloud Kitchen', icon: '📦', desc: 'Delivery-only kitchen' },
  { id: 'retail',        label: 'Retail Food',   icon: '🏪', desc: 'Grocery, deli, or food retail' },
  { id: 'other',         label: 'Other',         icon: '🏢', desc: 'Other hospitality business' },
]

function generateCompliances(
  selectedLicenses: typeof ALL_LICENSES,
  expiryDates: Record<string, string>
): Compliance[] {
  const today = new Date()
  return selectedLicenses.map((lic, i) => {
    let dueDate = expiryDates[lic.id] || ''
    if (!dueDate) {
      const d = new Date(today)
      d.setFullYear(d.getFullYear() + 1)
      dueDate = d.toISOString().split('T')[0]
    }
    return {
      id: i + 1,
      name:        lic.name,
      authority:   lic.authority,
      category:    lic.category,
      frequency:   'Annual',
      description: `${lic.name} issued by ${lic.authority}.`,
      documents:   LICENSE_DOCS[lic.id] || ['Application Form', 'ID Proof', 'Fee Receipt'],
      dueDate,
      status:      new Date(dueDate) < today ? 'Overdue' : 'Pending',
      history:     [],
    }
  })
}

// ── Shared style helpers ─────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #e5e5ea', fontSize: 14, color: '#1d1d1f',
  background: '#f5f5f7', outline: 'none', boxSizing: 'border-box',
}
const btnBack: React.CSSProperties = {
  flex: 1, padding: '12px', background: '#f5f5f7', color: '#6e6e73',
  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
}
const btnNext = (disabled?: boolean): React.CSSProperties => ({
  flex: 2, padding: '12px', background: '#0071e3', color: 'white',
  border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  opacity: disabled ? 0.45 : 1,
})

// ── Logo mark ────────────────────────────────────────────────────────────────
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, background: '#0071e3', borderRadius: size * 0.28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/>
        <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      </svg>
    </div>
  )
}

// ── Progress stepper (wizard header) ────────────────────────────────────────
const STEP_LABELS = ['Business type', 'Your details', 'Licences', 'Expiry dates', 'Alerts']

function Stepper({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, flex: 1, justifyContent: 'center', overflow: 'hidden' }}>
      {STEP_LABELS.map((label, i) => {
        const done    = i < current
        const active  = i === current
        const color   = done || active ? '#0071e3' : '#e5e5ea'
        const textCol = done || active ? '#0071e3' : '#a1a1a6'
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: done || active ? '#0071e3' : '#f0f0f5',
                border: `2px solid ${color}`,
                color: done || active ? 'white' : '#a1a1a6',
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                ) : i + 1}
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, color: textCol, whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ width: 28, height: 2, background: done ? '#0071e3' : '#e5e5ea', margin: '0 4px', marginBottom: 14, transition: 'background 0.3s', flexShrink: 0 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [user,             setUser]             = useState<User | null>(null)
  const [step,             setStep]             = useState<Step>(0)

  // form fields
  const [bizType,          setBizType]          = useState('')
  const [locationName,     setLocationName]     = useState('')
  const [city,             setCity]             = useState('')
  const [selectedLicenses, setSelectedLicenses] = useState<typeof ALL_LICENSES>([])
  const [expiryDates,      setExpiryDates]      = useState<Record<string, string>>({})
  const [alertEmail,       setAlertEmail]       = useState('')
  const [alertPhone,       setAlertPhone]       = useState('')
  const [alertDays,        setAlertDays]        = useState('30')
  const [saving,           setSaving]           = useState(false)
  const [savedCount,       setSavedCount]       = useState(0)
  const [toast,            setToast]            = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace('/login'); return }
      setUser(u)
      if (u.email)       setAlertEmail(u.email)
      if (u.displayName) setLocationName(u.displayName)
      const snap = await getDoc(doc(db, 'users', u.uid))
      if (snap.exists() && snap.data().onboardingComplete) {
        router.replace('/dashboard')
      }
    })
    return unsub
  }, [router])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const relevantLicenses = ALL_LICENSES.filter(l => l.types.includes(bizType))

  const licensesByCategory = relevantLicenses.reduce<Record<string, typeof ALL_LICENSES>>((acc, lic) => {
    if (!acc[lic.category]) acc[lic.category] = []
    acc[lic.category].push(lic)
    return acc
  }, {})

  const toggleLicense = (lic: typeof ALL_LICENSES[number]) =>
    setSelectedLicenses(prev =>
      prev.find(l => l.id === lic.id) ? prev.filter(l => l.id !== lic.id) : [...prev, lic]
    )

  const selectAll = () => setSelectedLicenses([...relevantLicenses])

  const saveAndFinish = async () => {
    if (!user) return
    if (!alertEmail || !alertEmail.includes('@')) { showToast('Please enter a valid email address'); return }
    setSaving(true)
    const compliances = generateCompliances(selectedLicenses, expiryDates)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        bizType,
        locationName,
        displayName: locationName,
        city,
        compliances,
        alertPrefs: {
          email:  alertEmail,
          phone:  alertPhone,
          days:   parseInt(alertDays),
          method: alertPhone ? 'both' : 'email',
        },
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      })
      setSavedCount(compliances.length)
      setStep(6)
    } catch (err: unknown) {
      showToast('Error saving: ' + (err instanceof Error ? err.message : 'Unknown error'))
      setSaving(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#020c15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '3px solid rgba(255,255,255,0.12)', borderTopColor: '#0071e3', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  // ── Step 0: Welcome ────────────────────────────────────────────────────────
  if (step === 0) return (
    <div style={{ minHeight: '100vh', background: '#020c15', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,0.18) 0%, transparent 65%)', top: '-150px', left: '-150px', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,199,89,0.1) 0%, transparent 65%)', bottom: '-80px', right: '-80px', filter: 'blur(60px)' }} />
      </div>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 560, width: '100%', textAlign: 'center' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
          <LogoMark size={36} />
          <span style={{ fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>Complynt</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 'clamp(30px, 6vw, 46px)', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.1, letterSpacing: '-0.03em' }}>
          Your compliance<br /><span style={{ color: '#0071e3' }}>dashboard is ready.</span>
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginTop: 16, lineHeight: 1.65, maxWidth: 440 }}>
          Set up takes 2 minutes. We'll pre-load every licence, certificate, and legal deadline — then track renewals and alert you automatically.
        </p>

        {/* Value props */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: '100%', margin: '36px 0' }}>
          {[
            { icon: '🏅', title: 'FHRS 5-star ready',   desc: 'All key EHO criteria tracked and documented' },
            { icon: '⚖️', title: "Natasha's Law",        desc: 'Allergen labelling compliance built in from day one' },
            { icon: '🔔', title: 'Never miss a renewal', desc: 'Automated alerts before every deadline' },
          ].map(v => (
            <div key={v.title} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 14, padding: '16px 14px', textAlign: 'left' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{v.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 5, lineHeight: 1.3 }}>{v.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.42)', lineHeight: 1.45 }}>{v.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setStep(1)}
          style={{ background: '#0071e3', color: 'white', border: 'none', borderRadius: 12, padding: '14px 44px', fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em', transition: 'background 0.15s' }}
          onMouseOver={e => (e.currentTarget.style.background = '#0058b0')}
          onMouseOut={e  => (e.currentTarget.style.background = '#0071e3')}
        >
          Get started →
        </button>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>Takes about 2 minutes · No credit card needed</p>
      </div>
    </div>
  )

  // ── Step 6: Success ────────────────────────────────────────────────────────
  if (step === 6) return (
    <div style={{ minHeight: '100vh', background: '#020c15', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,199,89,0.12) 0%, transparent 65%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 480, width: '100%' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <LogoMark size={32} />
          <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Complynt</span>
        </div>

        {/* Success ring */}
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(52,199,89,0.15)', border: '2px solid rgba(52,199,89,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 800, color: 'white', margin: '0 0 12px', letterSpacing: '-0.03em' }}>
          Dashboard activated!
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: '0 0 28px' }}>
          {locationName ? `${locationName} is all set. ` : ''}
          {savedCount > 0
            ? `${savedCount} compliance item${savedCount !== 1 ? 's' : ''} tracked, deadline alerts configured, and your FHRS readiness score calculated.`
            : `Your dashboard is ready. Add compliance items any time from the Compliance tab.`}
        </p>

        {/* Summary card */}
        <div style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '4px 0', marginBottom: 28, textAlign: 'left' }}>
          {[
            { label: 'Compliance items tracked',   value: `${savedCount}`,         color: '#0071e3'   },
            { label: 'Deadline alerts set',         value: `${alertDays} days before`, color: '#34c759' },
            { label: 'Notification email',          value: alertEmail,              color: '#ff9f0a'   },
            { label: 'Business type',               value: BIZ_TYPES.find(b => b.id === bizType)?.label || bizType, color: 'rgba(255,255,255,0.7)' },
            { label: 'Location',                    value: city ? `${locationName}, ${city}` : locationName, color: 'rgba(255,255,255,0.7)' },
          ].filter(r => r.value).map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: row.color, maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* What's next */}
        <div style={{ background: 'rgba(0,113,227,0.12)', border: '1px solid rgba(0,113,227,0.25)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>What to do first</div>
          {['Run the EHO Inspection Simulator to see your current score', 'Upload your HACCP plan to the Document Vault', 'Log today\'s fridge temperatures in Temp Logs'].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < 2 ? 6 : 0 }}>
              <span style={{ color: '#0071e3', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{tip}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.replace('/dashboard')}
          style={{ width: '100%', background: '#0071e3', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s' }}
          onMouseOver={e => (e.currentTarget.style.background = '#0058b0')}
          onMouseOut={e  => (e.currentTarget.style.background = '#0071e3')}
        >
          Open my dashboard →
        </button>
      </div>
    </div>
  )

  // ── Steps 1–5: Wizard ─────────────────────────────────────────────────────
  const currentStepIndex = step - 1 // 0-indexed for stepper

  return (
    <div style={{ minHeight: '100vh', background: '#f0f0f5', display: 'flex', flexDirection: 'column' }}>

      {/* Top nav */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e5ea', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <LogoMark size={28} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1d1d1f' }}>Complynt</span>
        </div>
        <Stepper current={currentStepIndex} />
        <div style={{ width: 80, flexShrink: 0 }} />
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#e5e5ea' }}>
        <div style={{ height: '100%', background: '#0071e3', width: `${(currentStepIndex / (STEP_LABELS.length - 1)) * 100}%`, transition: 'width 0.4s ease', borderRadius: '0 2px 2px 0' }} />
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '32px 16px' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '32px', width: '100%', maxWidth: 520, boxShadow: '0 4px 32px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}>

          {/* ── Step 1: Business type ── */}
          {step === 1 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e8f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18 }}>🏢</span>
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>What type of business are you?</h2>
                  <p style={{ fontSize: 13, color: '#6e6e73', margin: '2px 0 0' }}>We'll pre-load licences and compliance requirements relevant to you.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                {BIZ_TYPES.map(b => (
                  <div
                    key={b.id}
                    onClick={() => setBizType(b.id)}
                    style={{
                      border: `1.5px solid ${bizType === b.id ? '#0071e3' : '#e5e5ea'}`,
                      background: bizType === b.id ? '#e8f2ff' : 'white',
                      borderRadius: 14, padding: '14px 10px', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      transition: 'all 0.15s', textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 26 }}>{b.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: bizType === b.id ? '#0071e3' : '#1d1d1f' }}>{b.label}</div>
                    <div style={{ fontSize: 10, color: '#a1a1a6', lineHeight: 1.3 }}>{b.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={btnBack} onClick={() => setStep(0)}>← Back</button>
                <button style={btnNext(!bizType)} disabled={!bizType} onClick={() => setStep(2)}>Next →</button>
              </div>
            </>
          )}

          {/* ── Step 2: Business details ── */}
          {step === 2 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e8f2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18 }}>📍</span>
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>Tell us about your business</h2>
                  <p style={{ fontSize: 13, color: '#6e6e73', margin: '2px 0 0' }}>This appears in your dashboard and personalises your compliance profile.</p>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 6 }}>Business / outlet name *</label>
                <input
                  type="text"
                  placeholder="e.g. The Crown &amp; Kitchen"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  style={inp}
                  onFocus={e  => (e.target.style.borderColor = '#0071e3')}
                  onBlur={e   => (e.target.style.borderColor = '#e5e5ea')}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 6 }}>City / town *</label>
                <input
                  type="text"
                  placeholder="e.g. London"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  style={inp}
                  onFocus={e  => (e.target.style.borderColor = '#0071e3')}
                  onBlur={e   => (e.target.style.borderColor = '#e5e5ea')}
                />
              </div>

              <div style={{ background: '#f0f7ff', border: '1px solid #c8dfff', borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: '#0058b0', lineHeight: 1.5 }}>
                  <strong>Why we ask:</strong> Your location name appears in the dashboard header and reports. City helps us show the correct local authority for licensing.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={btnBack} onClick={() => setStep(1)}>← Back</button>
                <button style={btnNext(!(locationName.trim() && city.trim()))} disabled={!(locationName.trim() && city.trim())} onClick={() => setStep(3)}>Next →</button>
              </div>
            </>
          )}

          {/* ── Step 3: Licence selection ── */}
          {step === 3 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>Which licences do you hold?</h2>
                <button onClick={selectAll} style={{ fontSize: 12, color: '#0071e3', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: 2, flexShrink: 0, marginLeft: 12 }}>Select all</button>
              </div>
              <p style={{ fontSize: 13, color: '#6e6e73', margin: '4px 0 16px' }}>
                Select everything that applies to {locationName || 'your business'}. You can add more from the dashboard at any time.
              </p>

              {selectedLicenses.length > 0 && (
                <div style={{ background: '#f0faf3', border: '1px solid #b8e6c8', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#1a7a34', fontWeight: 600 }}>
                  ✓ {selectedLicenses.length} licence{selectedLicenses.length !== 1 ? 's' : ''} selected
                </div>
              )}

              <div style={{ maxHeight: 310, overflowY: 'auto', marginBottom: 20, paddingRight: 2 }}>
                {Object.entries(licensesByCategory).map(([cat, lics]) => (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, paddingLeft: 2 }}>{cat}</div>
                    {lics.map(lic => {
                      const checked = !!selectedLicenses.find(l => l.id === lic.id)
                      return (
                        <div
                          key={lic.id}
                          onClick={() => toggleLicense(lic)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                            border: `1.5px solid ${checked ? '#0071e3' : '#e5e5ea'}`,
                            background: checked ? '#e8f2ff' : 'white',
                            marginBottom: 6, transition: 'all 0.15s',
                          }}
                        >
                          <div style={{
                            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                            border: `1.5px solid ${checked ? '#0071e3' : '#d2d2d7'}`,
                            background: checked ? '#0071e3' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {checked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: checked ? '#0058b0' : '#1d1d1f' }}>{lic.name}</div>
                            <div style={{ fontSize: 11, color: '#a1a1a6', marginTop: 1 }}>{lic.authority}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={btnBack} onClick={() => setStep(2)}>← Back</button>
                <button style={btnNext()} onClick={() => setStep(4)}>
                  Next → {selectedLicenses.length > 0 && `(${selectedLicenses.length})`}
                </button>
              </div>
            </>
          )}

          {/* ── Step 4: Expiry dates ── */}
          {step === 4 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18 }}>📅</span>
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>When do they expire?</h2>
                  <p style={{ fontSize: 13, color: '#6e6e73', margin: '2px 0 0' }}>Leave blank if unsure — we'll default to 1 year from today.</p>
                </div>
              </div>

              {selectedLicenses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#a1a1a6' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#6e6e73' }}>No licences selected</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>That's fine — you can add them from the dashboard any time.</div>
                </div>
              ) : (
                <div style={{ maxHeight: 320, overflowY: 'auto', marginBottom: 20 }}>
                  {selectedLicenses.map((lic, i) => (
                    <div key={lic.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: i < selectedLicenses.length - 1 ? '1px solid #f0f0f5' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lic.name}</div>
                        <div style={{ fontSize: 11, color: '#a1a1a6', marginTop: 1 }}>{lic.category}</div>
                      </div>
                      <input
                        type="date"
                        value={expiryDates[lic.id] || ''}
                        onChange={e => setExpiryDates(prev => ({ ...prev, [lic.id]: e.target.value }))}
                        style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid #e5e5ea', background: '#f5f5f7', fontSize: 12, color: '#1d1d1f', outline: 'none', flexShrink: 0 }}
                        onFocus={e  => (e.target.style.borderColor = '#0071e3')}
                        onBlur={e   => (e.target.style.borderColor = '#e5e5ea')}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: selectedLicenses.length === 0 ? 24 : 0 }}>
                <button style={btnBack} onClick={() => setStep(3)}>← Back</button>
                <button style={btnNext()} onClick={() => setStep(5)}>Next →</button>
              </div>
            </>
          )}

          {/* ── Step 5: Alert preferences ── */}
          {step === 5 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 18 }}>🔔</span>
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>Set up your deadline alerts</h2>
                  <p style={{ fontSize: 13, color: '#6e6e73', margin: '2px 0 0' }}>We'll remind you before licences and tasks are due. Change anytime.</p>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 6 }}>Alert email *</label>
                <input
                  type="email"
                  value={alertEmail}
                  onChange={e => setAlertEmail(e.target.value)}
                  style={inp}
                  onFocus={e  => (e.target.style.borderColor = '#0071e3')}
                  onBlur={e   => (e.target.style.borderColor = '#e5e5ea')}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 6 }}>
                  Phone number <span style={{ fontWeight: 400, color: '#a1a1a6' }}>(optional — enables SMS alerts)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+44 7700 900123"
                  value={alertPhone}
                  onChange={e => setAlertPhone(e.target.value)}
                  style={inp}
                  onFocus={e  => (e.target.style.borderColor = '#0071e3')}
                  onBlur={e   => (e.target.style.borderColor = '#e5e5ea')}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 8 }}>Alert me this many days before a deadline</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { val: '7',  label: '7 days',  sub: 'Last minute' },
                    { val: '14', label: '14 days', sub: 'Standard' },
                    { val: '30', label: '30 days', sub: 'Recommended' },
                    { val: '60', label: '60 days', sub: 'Early bird' },
                  ].map(opt => (
                    <div
                      key={opt.val}
                      onClick={() => setAlertDays(opt.val)}
                      style={{
                        padding: '10px 6px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                        border: `1.5px solid ${alertDays === opt.val ? '#0071e3' : '#e5e5ea'}`,
                        background: alertDays === opt.val ? '#e8f2ff' : 'white',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: alertDays === opt.val ? '#0071e3' : '#1d1d1f' }}>{opt.label}</div>
                      <div style={{ fontSize: 10, color: alertDays === opt.val ? '#0071e3' : '#a1a1a6', marginTop: 2 }}>{opt.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary before save */}
              <div style={{ background: '#f5f5f7', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#a1a1a6', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Your dashboard will include</div>
                {[
                  { label: 'Business', value: `${locationName}${city ? `, ${city}` : ''}` },
                  { label: 'Type',     value: BIZ_TYPES.find(b => b.id === bizType)?.label || '' },
                  { label: 'Licences', value: `${selectedLicenses.length} item${selectedLicenses.length !== 1 ? 's' : ''} tracked` },
                  { label: 'Alerts',   value: `Email ${alertDays}d before deadlines${alertPhone ? ' + SMS' : ''}` },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#6e6e73' }}>{r.label}</span>
                    <span style={{ fontWeight: 600, color: '#1d1d1f' }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={btnBack} onClick={() => setStep(4)}>← Back</button>
                <button
                  style={btnNext(saving || !alertEmail.includes('@'))}
                  disabled={saving || !alertEmail.includes('@')}
                  onClick={saveAndFinish}
                >
                  {saving ? 'Activating…' : 'Activate dashboard →'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
