'use client'
import { useState, useEffect } from 'react'
import { signOut, User } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'

interface Props {
  uid: string
  user: User
  onToast: (msg: string) => void
}

const BIZ_LABELS: Record<string, string> = {
  restaurant:    'Restaurant',
  hotel:         'Hotel',
  cafe:          'Café / Bar',
  cloud_kitchen: 'Cloud Kitchen',
  retail:        'Retail',
  other:         'Other',
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-[10px] border border-[#e5e5ea] bg-[#f5f5f7] text-[14px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:bg-white transition-all'
const labelCls = 'block text-[12px] font-semibold text-[#1d1d1f] mb-1.5 uppercase tracking-wide'

export default function SettingsPanel({ uid, user, onToast }: Props) {
  const router = useRouter()
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [locationName,   setLocationName]   = useState('')
  const [bizType,        setBizType]        = useState('')
  const [alertEmail,     setAlertEmail]     = useState(user.email || '')
  const [alertPhone,     setAlertPhone]     = useState('')
  const [alertMethod,    setAlertMethod]    = useState('email')

  useEffect(() => {
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setLocationName(d.locationName || d.displayName || '')
        setBizType(d.bizType || '')
        setAlertEmail(d.alertPrefs?.email || user.email || '')
        setAlertPhone(d.alertPrefs?.phone || '')
        setAlertMethod(d.alertPrefs?.method || 'email')
      }
      setLoading(false)
    })
  }, [uid, user.email])

  const handleSave = async () => {
    if (!alertEmail || !alertEmail.includes('@')) { onToast('Please enter a valid email address'); return }
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', uid), {
        locationName,
        bizType,
        alertPrefs: { email: alertEmail, phone: alertPhone, method: alertMethod },
      })
      onToast('Settings saved ✓')
    } catch {
      onToast('Error saving — please try again')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-40">
        <div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[600px]">

      {/* Business Settings */}
      <section className="bg-white border border-[#e5e5ea] rounded-[16px] p-5 mb-4">
        <h2 className="text-[15px] font-bold text-[#1d1d1f] mb-4">Business settings</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Business / location name</label>
            <input
              className={inputCls}
              type="text"
              placeholder="e.g. The Crown & Kitchen"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Business type</label>
            <select className={inputCls} value={bizType} onChange={e => setBizType(e.target.value)}>
              <option value="">Select type…</option>
              {Object.entries(BIZ_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Alert Preferences */}
      <section className="bg-white border border-[#e5e5ea] rounded-[16px] p-5 mb-4">
        <h2 className="text-[15px] font-bold text-[#1d1d1f] mb-1">Alert preferences</h2>
        <p className="text-[13px] text-[#a1a1a6] mb-4">We send reminders 30, 7, and 1 day before each deadline.</p>
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Alert email *</label>
            <input
              className={inputCls}
              type="email"
              placeholder="you@business.com"
              value={alertEmail}
              onChange={e => setAlertEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Phone number <span className="text-[#a1a1a6] font-normal normal-case tracking-normal">— optional</span></label>
            <input
              className={inputCls}
              type="tel"
              placeholder="+44 7700 900123"
              value={alertPhone}
              onChange={e => setAlertPhone(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Preferred method</label>
            <select className={inputCls} value={alertMethod} onChange={e => setAlertMethod(e.target.value)}>
              <option value="email">Email only</option>
              <option value="sms">SMS only</option>
              <option value="both">Email + SMS</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-5 px-5 py-2.5 bg-[#0071e3] text-white border-0 rounded-[10px] text-[14px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </section>

      {/* Account */}
      <section className="bg-white border border-[#e5e5ea] rounded-[16px] p-5 mb-4">
        <h2 className="text-[15px] font-bold text-[#1d1d1f] mb-4">Account</h2>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e5e5ea]">
          <div className="w-10 h-10 rounded-full bg-[#0071e3] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
            {(user.displayName || user.email || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[#1d1d1f]">{user.displayName || 'Account'}</div>
            <div className="text-[12px] text-[#a1a1a6]">{user.email}</div>
          </div>
        </div>
        <button
          onClick={() => signOut(auth).then(() => router.replace('/'))}
          className="flex items-center gap-2 text-[13px] text-[#ff3b30] bg-transparent border-0 cursor-pointer font-medium hover:text-[#b80000] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </section>

      {/* Plan */}
      <section className="bg-white border border-[#e5e5ea] rounded-[16px] p-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[15px] font-bold text-[#1d1d1f]">Plan</h2>
          <span className="px-2.5 py-0.5 bg-[#e8f2ff] text-[#0071e3] text-[11px] font-bold rounded-full">FREE</span>
        </div>
        <p className="text-[13px] text-[#6e6e73] mb-4">
          You&apos;re on the free plan. Upgrade for unlimited locations, PDF exports, automated email reminders, and priority support.
        </p>
        <div className="flex flex-col gap-2 mb-4">
          {[
            'Unlimited compliance items & document storage',
            'Automated email + SMS deadline reminders',
            'Multi-location management',
            'PDF compliance reports for auditors & landlords',
            'Priority support from compliance specialists',
          ].map(f => (
            <div key={f} className="flex items-center gap-2 text-[13px] text-[#6e6e73]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
              {f}
            </div>
          ))}
        </div>
        <button
          className="px-5 py-2.5 bg-[#0071e3] text-white border-0 rounded-[10px] text-[14px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors"
          onClick={() => onToast('Pricing coming soon — we\'ll email you first')}
        >
          Upgrade to Pro
        </button>
        <p className="text-[11px] text-[#a1a1a6] mt-2">Early access pricing available — email us at hello@complynt.com</p>
      </section>
    </div>
  )
}
