'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { ALL_LICENSES, LICENSE_DOCS } from '@/lib/compliances'
import type { Compliance } from '@/types'

type Step = 1 | 2 | 3 | 4

const BIZ_TYPES = [
  { id: 'restaurant',    label: 'Restaurant',      icon: '🍽️' },
  { id: 'hotel',         label: 'Hotel',           icon: '🏨' },
  { id: 'cafe',          label: 'Café / Bar',      icon: '☕' },
  { id: 'cloud_kitchen', label: 'Cloud Kitchen',   icon: '📦' },
  { id: 'retail',        label: 'Retail',          icon: '🏪' },
  { id: 'other',         label: 'Other',           icon: '🏢' },
]

function generateCompliances(
  selectedLicenses: typeof ALL_LICENSES,
  expiryDates: Record<string, string>,
  bizType: string
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

export default function OnboardingPage() {
  const router = useRouter()
  const [user,             setUser]             = useState<User | null>(null)
  const [step,             setStep]             = useState<Step>(1)
  const [bizType,          setBizType]          = useState('')
  const [selectedLicenses, setSelectedLicenses] = useState<typeof ALL_LICENSES>([])
  const [expiryDates,      setExpiryDates]      = useState<Record<string, string>>({})
  const [alertEmail,       setAlertEmail]       = useState('')
  const [alertPhone,       setAlertPhone]       = useState('')
  const [alertMethod,      setAlertMethod]      = useState('email')
  const [saving,           setSaving]           = useState(false)
  const [toast,            setToast]            = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace('/login'); return }
      setUser(u)
      if (u.email) setAlertEmail(u.email)
      const snap = await getDoc(doc(db, 'users', u.uid))
      if (snap.exists() && snap.data().onboardingComplete) {
        router.replace('/dashboard')
      }
    })
    return unsub
  }, [router])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const relevantLicenses = ALL_LICENSES.filter(l => l.types.includes(bizType))

  const toggleLicense = (lic: typeof ALL_LICENSES[number]) => {
    setSelectedLicenses(prev =>
      prev.find(l => l.id === lic.id)
        ? prev.filter(l => l.id !== lic.id)
        : [...prev, lic]
    )
  }

  const saveAndFinish = async () => {
    if (!user) return
    if (!alertEmail || !alertEmail.includes('@')) { showToast('Please enter a valid email address'); return }
    setSaving(true)
    const compliances = generateCompliances(selectedLicenses, expiryDates, bizType)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        bizType,
        compliances,
        alertPrefs: { email: alertEmail, phone: alertPhone, method: alertMethod },
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
      })
      router.replace('/dashboard')
    } catch (err: unknown) {
      showToast('Error saving: ' + (err instanceof Error ? err.message : 'Unknown error'))
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="ob-page">
      <div className="ob-card">

        {/* Progress dots */}
        <div className="ob-step-dots">
          {([1,2,3,4] as Step[]).map(n => (
            <div key={n} className={`ob-step-dot${n < step ? ' done' : n === step ? ' active' : ''}`} />
          ))}
        </div>

        {/* ── Step 1: Business type ── */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>What type of business are you?</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>We&apos;ll pre-load the licences relevant to you.</p>
            <div className="biz-grid">
              {BIZ_TYPES.map(b => (
                <div
                  key={b.id}
                  className={`biz-card${bizType === b.id ? ' selected' : ''}`}
                  onClick={() => setBizType(b.id)}
                >
                  <div className="biz-card-icon">{b.icon}</div>
                  <div className="biz-card-name">{b.label}</div>
                </div>
              ))}
            </div>
            <div className="ob-btn-row">
              <button className="ob-btn primary" disabled={!bizType} onClick={() => setStep(2)}>
                Next →
              </button>
            </div>
          </>
        )}

        {/* ── Step 2: Licences ── */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Which licences do you hold?</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>Select all that apply — you can add more later.</p>
            <div className="lic-list">
              {relevantLicenses.map(lic => {
                const checked = !!selectedLicenses.find(l => l.id === lic.id)
                return (
                  <div key={lic.id} className={`lic-item${checked ? ' checked' : ''}`} onClick={() => toggleLicense(lic)}>
                    <div className="lic-checkbox">
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="lic-name">{lic.name}</div>
                      <div className="lic-authority">{lic.authority} · {lic.category}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="ob-btn-row">
              <button className="ob-btn ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="ob-btn primary" onClick={() => setStep(3)}>Next →</button>
            </div>
          </>
        )}

        {/* ── Step 3: Expiry dates ── */}
        {step === 3 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>When do your licences expire?</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16 }}>Leave blank if you&apos;re not sure — we&apos;ll default to 1 year from now.</p>
            <div>
              {selectedLicenses.length === 0 ? (
                <p style={{ color: 'var(--text-2)', fontSize: 14 }}>No licences selected — you can add them from the dashboard later.</p>
              ) : (
                selectedLicenses.map(lic => (
                  <div key={lic.id} className="expiry-row">
                    <span className="expiry-name">{lic.name}</span>
                    <input
                      type="date"
                      className="expiry-date-input"
                      value={expiryDates[lic.id] || ''}
                      onChange={e => setExpiryDates(prev => ({ ...prev, [lic.id]: e.target.value }))}
                    />
                  </div>
                ))
              )}
            </div>
            <div className="ob-btn-row">
              <button className="ob-btn ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="ob-btn primary" onClick={() => setStep(4)}>Next →</button>
            </div>
          </>
        )}

        {/* ── Step 4: Alert preferences ── */}
        {step === 4 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>How should we alert you?</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Set up your deadline reminders. You can change these anytime.</p>
            <div className="form-group">
              <label className="form-label" htmlFor="ob-email">Alert email</label>
              <input className="form-input" id="ob-email" type="email" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ob-phone">Phone number <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>— optional</span></label>
              <input className="form-input" id="ob-phone" type="tel" placeholder="+91 98765 43210" value={alertPhone} onChange={e => setAlertPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ob-method">Preferred method</label>
              <select className="form-input" id="ob-method" value={alertMethod} onChange={e => setAlertMethod(e.target.value)}>
                <option value="email">Email only</option>
                <option value="sms">SMS only</option>
                <option value="both">Email + SMS</option>
              </select>
            </div>
            <div className="ob-btn-row">
              <button className="ob-btn ghost" onClick={() => setStep(3)}>← Back</button>
              <button className="ob-btn primary" disabled={saving} onClick={saveAndFinish}>
                {saving ? 'Saving…' : 'Set Up Dashboard'}
              </button>
            </div>
          </>
        )}

      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
