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
  { id: 'restaurant',    label: 'Restaurant',    icon: '🍽️' },
  { id: 'hotel',         label: 'Hotel',         icon: '🏨' },
  { id: 'cafe',          label: 'Café / Bar',    icon: '☕' },
  { id: 'cloud_kitchen', label: 'Cloud Kitchen', icon: '📦' },
  { id: 'retail',        label: 'Retail',        icon: '🏪' },
  { id: 'other',         label: 'Other',         icon: '🏢' },
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

const btnBase = 'flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold border-0 cursor-pointer transition-colors disabled:opacity-50'
const btnPrimary = `${btnBase} bg-[#0071e3] text-white hover:bg-[#0058b0]`
const btnGhost   = `${btnBase} bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e5e5ea]`

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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] p-6">
      <div className="bg-white rounded-[20px] p-8 w-full max-w-[520px] shadow-[0_8px_40px_rgba(0,0,0,.08)]">

        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-8">
          {([1,2,3,4] as Step[]).map(n => (
            <div
              key={n}
              className={`h-2 rounded-full transition-all duration-200 ${
                n < step ? 'w-2 bg-[#0071e3]' : n === step ? 'w-6 bg-[#0071e3]' : 'w-2 bg-[#e5e5ea]'
              }`}
            />
          ))}
        </div>

        {/* ── Step 1: Business type ── */}
        {step === 1 && (
          <>
            <h2 className="text-[22px] font-bold text-[#1d1d1f] mb-1.5">What type of business are you?</h2>
            <p className="text-[14px] text-[#6e6e73] mb-4">We&apos;ll pre-load the licences relevant to you.</p>
            <div className="grid grid-cols-3 gap-3 my-4">
              {BIZ_TYPES.map(b => (
                <div
                  key={b.id}
                  onClick={() => setBizType(b.id)}
                  className={`flex flex-col items-center gap-2 p-4 border-[1.5px] rounded-[14px] cursor-pointer transition-all duration-150 hover:border-[#0071e3] ${
                    bizType === b.id ? 'border-[#0071e3] bg-[#e8f2ff]' : 'border-[#e5e5ea]'
                  }`}
                >
                  <div className="text-2xl leading-none">{b.icon}</div>
                  <div className="text-[13px] font-semibold text-[#1d1d1f] text-center">{b.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button className={btnPrimary} disabled={!bizType} onClick={() => setStep(2)}>Next →</button>
            </div>
          </>
        )}

        {/* ── Step 2: Licences ── */}
        {step === 2 && (
          <>
            <h2 className="text-[22px] font-bold text-[#1d1d1f] mb-1.5">Which licences do you hold?</h2>
            <p className="text-[14px] text-[#6e6e73] mb-4">Select all that apply — you can add more later.</p>
            <div className="flex flex-col gap-2 my-4 max-h-60 overflow-y-auto">
              {relevantLicenses.map(lic => {
                const checked = !!selectedLicenses.find(l => l.id === lic.id)
                return (
                  <div
                    key={lic.id}
                    onClick={() => toggleLicense(lic)}
                    className={`flex items-center gap-3 p-3 border-[1.5px] rounded-[12px] cursor-pointer transition-all ${
                      checked ? 'border-[#0071e3] bg-[#e8f2ff]' : 'border-[#e5e5ea] hover:border-[#d2d2d7]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
                      checked ? 'bg-[#0071e3] border-[#0071e3]' : 'border-[#d2d2d7] bg-white'
                    }`}>
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-[#1d1d1f]">{lic.name}</div>
                      <div className="text-[11px] text-[#a1a1a6] mt-0.5">{lic.authority} · {lic.category}</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3 mt-6">
              <button className={btnGhost} onClick={() => setStep(1)}>← Back</button>
              <button className={btnPrimary} onClick={() => setStep(3)}>Next →</button>
            </div>
          </>
        )}

        {/* ── Step 3: Expiry dates ── */}
        {step === 3 && (
          <>
            <h2 className="text-[22px] font-bold text-[#1d1d1f] mb-1.5">When do your licences expire?</h2>
            <p className="text-[14px] text-[#6e6e73] mb-4">Leave blank if you&apos;re not sure — we&apos;ll default to 1 year from now.</p>
            <div>
              {selectedLicenses.length === 0 ? (
                <p className="text-[14px] text-[#6e6e73]">No licences selected — you can add them from the dashboard later.</p>
              ) : (
                selectedLicenses.map(lic => (
                  <div key={lic.id} className="flex items-center justify-between gap-4 py-3 border-b border-[#e5e5ea]">
                    <span className="text-[13px] font-medium text-[#1d1d1f]">{lic.name}</span>
                    <input
                      type="date"
                      className="px-3 py-2 rounded-[8px] border border-[#e5e5ea] bg-[#f5f5f7] text-[13px] text-[#1d1d1f] outline-none focus:border-[#0071e3] transition-colors"
                      value={expiryDates[lic.id] || ''}
                      onChange={e => setExpiryDates(prev => ({ ...prev, [lic.id]: e.target.value }))}
                    />
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button className={btnGhost} onClick={() => setStep(2)}>← Back</button>
              <button className={btnPrimary} onClick={() => setStep(4)}>Next →</button>
            </div>
          </>
        )}

        {/* ── Step 4: Alert preferences ── */}
        {step === 4 && (
          <>
            <h2 className="text-[22px] font-bold text-[#1d1d1f] mb-1.5">How should we alert you?</h2>
            <p className="text-[14px] text-[#6e6e73] mb-5">Set up your deadline reminders. You can change these anytime.</p>
            <div className="form-group">
              <label className="form-label" htmlFor="ob-email">Alert email</label>
              <input className="form-input" id="ob-email" type="email" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ob-phone">
                Phone number <span className="text-[#a1a1a6] font-normal">— optional</span>
              </label>
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
            <div className="flex gap-3 mt-6">
              <button className={btnGhost} onClick={() => setStep(3)}>← Back</button>
              <button className={btnPrimary} disabled={saving} onClick={saveAndFinish}>
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
