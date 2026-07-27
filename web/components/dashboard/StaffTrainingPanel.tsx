'use client'
import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { StaffMember, StaffCert } from '@/types'

interface Props {
  uid: string
  onToast: (msg: string) => void
}

const CERT_TYPES = [
  { id: 'level2',   label: 'Level 2 Food Hygiene',       validYears: 3,  required: true },
  { id: 'level3',   label: 'Level 3 Food Safety (Mgr)',  validYears: 3,  required: false },
  { id: 'allergen', label: 'Allergen Awareness',          validYears: 3,  required: true },
  { id: 'fire',     label: 'Fire Safety Awareness',       validYears: 3,  required: false },
  { id: 'manual',   label: 'Manual Handling',             validYears: 3,  required: false },
  { id: 'other',    label: 'Other Certificate',           validYears: 3,  required: false },
]

const inputCls = 'w-full px-3 py-2.5 rounded-[9px] border border-[#e5e5ea] bg-[#f5f5f7] text-[13px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:bg-white transition-all'
const labelCls = 'block text-[11px] font-semibold text-[#1d1d1f] mb-1 uppercase tracking-wide'

function uid6() { return Math.random().toString(36).slice(2, 8) }

function daysUntilDate(dateStr: string) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

function CertStatusBadge({ expiry }: { expiry: string }) {
  const days = daysUntilDate(expiry)
  if (days === null) return null
  if (days < 0) return <span className="badge badge-red">Expired {Math.abs(days)}d ago</span>
  if (days <= 30) return <span className="badge badge-orange">{days}d left</span>
  if (days <= 90) return <span className="badge badge-blue">{days}d left</span>
  return <span className="badge badge-green">Valid — {new Date(expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
}

function blankCert(): StaffCert {
  return { type: 'level2', provider: '', certNumber: '', completedDate: '', expiryDate: '' }
}

function blankStaff(): StaffMember {
  return { id: uid6(), name: '', role: '', startDate: '', rtwChecked: false, rtwDate: '', certs: [blankCert()] }
}

export default function StaffTrainingPanel({ uid, onToast }: Props) {
  const [staff,      setStaff]      = useState<StaffMember[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editData,   setEditData]   = useState<StaffMember>(blankStaff())
  const [isNew,      setIsNew]      = useState(true)
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setStaff(Array.isArray(d.staff) ? d.staff : [])
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [uid])

  const saveStaff = async (next: StaffMember[]) => {
    await updateDoc(doc(db, 'users', uid), { staff: next }).catch(() => {})
    setStaff(next)
  }

  const openAdd = () => { setEditData(blankStaff()); setIsNew(true); setShowModal(true) }
  const openEdit = (s: StaffMember) => { setEditData(JSON.parse(JSON.stringify(s))); setIsNew(false); setShowModal(true) }

  const handleSave = async () => {
    if (!editData.name.trim()) { onToast('Please enter staff name'); return }
    setSaving(true)
    const next = isNew
      ? [...staff, { ...editData, id: uid6() }]
      : staff.map(s => s.id === editData.id ? editData : s)
    await saveStaff(next)
    setSaving(false)
    setShowModal(false)
    onToast(isNew ? 'Staff member added ✓' : 'Record updated ✓')
  }

  const handleDelete = async (id: string) => {
    await saveStaff(staff.filter(s => s.id !== id))
    onToast('Staff member removed')
  }

  const addCert = () => setEditData(p => ({ ...p, certs: [...p.certs, blankCert()] }))
  const removeCert = (i: number) => setEditData(p => ({ ...p, certs: p.certs.filter((_, ci) => ci !== i) }))
  const updateCert = (i: number, field: keyof StaffCert, value: string) =>
    setEditData(p => ({ ...p, certs: p.certs.map((c, ci) => ci === i ? { ...c, [field]: value } : c) }))

  // Summary stats
  const totalCerts = staff.flatMap(s => s.certs)
  const expiredCerts = totalCerts.filter(c => { const d = daysUntilDate(c.expiryDate); return d !== null && d < 0 })
  const soonCerts = totalCerts.filter(c => { const d = daysUntilDate(c.expiryDate); return d !== null && d >= 0 && d <= 30 })

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-40"><div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="p-5 flex-1">

      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#a1a1a6]">Track food hygiene certificates, allergen training, and right-to-work checks for every team member.</p>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0071e3] text-white rounded-[9px] text-[13px] font-semibold hover:bg-[#0058b0] transition-colors border-0 cursor-pointer shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Staff Member
        </button>
      </div>

      {/* stat row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-[#e5e5ea] rounded-[12px] p-4">
          <div className="text-[22px] font-bold text-[#1d1d1f]">{staff.length}</div>
          <div className="text-[11px] text-[#a1a1a6]">Team members</div>
        </div>
        <div className="bg-white border border-[#e5e5ea] rounded-[12px] p-4">
          <div className="text-[22px] font-bold" style={{ color: expiredCerts.length > 0 ? '#b80000' : '#1a7a34' }}>{expiredCerts.length}</div>
          <div className="text-[11px] text-[#a1a1a6]">Expired certificates</div>
        </div>
        <div className="bg-white border border-[#e5e5ea] rounded-[12px] p-4">
          <div className="text-[22px] font-bold" style={{ color: soonCerts.length > 0 ? '#8a4d00' : '#1d1d1f' }}>{soonCerts.length}</div>
          <div className="text-[11px] text-[#a1a1a6]">Expiring within 30 days</div>
        </div>
      </div>

      {(expiredCerts.length > 0 || soonCerts.length > 0) && (
        <div className={`px-4 py-3 rounded-[12px] mb-4 text-[13px] font-medium border ${expiredCerts.length > 0 ? 'bg-[rgba(255,59,48,.06)] border-[rgba(255,59,48,.2)] text-[#b80000]' : 'bg-[rgba(255,159,10,.06)] border-[rgba(255,159,10,.2)] text-[#8a4d00]'}`}>
          {expiredCerts.length > 0
            ? `${expiredCerts.length} certificate${expiredCerts.length > 1 ? 's' : ''} expired — EHOs check training records on every inspection.`
            : `${soonCerts.length} certificate${soonCerts.length > 1 ? 's' : ''} expiring within 30 days — arrange renewals now.`}
        </div>
      )}

      {staff.length === 0 ? (
        <div className="text-center py-14 bg-white border border-[#e5e5ea] rounded-[14px]">
          <div className="text-[32px] mb-2">👤</div>
          <div className="text-[14px] font-medium text-[#6e6e73] mb-1">No staff records yet</div>
          <div className="text-[12px] text-[#a1a1a6] mb-4 max-w-[280px] mx-auto">Add your team members and their food hygiene certificates. EHOs check these on every visit.</div>
          <button onClick={openAdd} className="px-4 py-2 bg-[#0071e3] text-white border-0 rounded-[9px] text-[13px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors">
            Add first team member
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {staff.map(s => {
            const worstCert = s.certs.reduce<StaffCert | null>((worst, c) => {
              const d = daysUntilDate(c.expiryDate)
              if (d === null) return worst
              if (!worst) return c
              const wd = daysUntilDate(worst.expiryDate)
              return (wd === null || d < wd) ? c : worst
            }, null)
            const overallStatus = !worstCert ? 'ok'
              : (daysUntilDate(worstCert.expiryDate) ?? 999) < 0 ? 'expired'
              : (daysUntilDate(worstCert.expiryDate) ?? 999) <= 30 ? 'soon'
              : 'ok'

            return (
              <div key={s.id} className="bg-white border border-[#e5e5ea] rounded-[14px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0 ${overallStatus === 'expired' ? 'bg-[#ff3b30]' : overallStatus === 'soon' ? 'bg-[#ff9f0a]' : 'bg-[#34c759]'}`}>
                      {s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold text-[#1d1d1f]">{s.name}</div>
                      <div className="text-[12px] text-[#a1a1a6]">
                        {s.role || 'No role specified'}
                        {s.startDate && ` · Started ${new Date(s.startDate + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.rtwChecked
                      ? <span className="text-[10px] font-semibold text-[#34c759] flex items-center gap-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>RTW</span>
                      : <span className="text-[10px] font-semibold text-[#ff3b30]">No RTW</span>}
                    <button onClick={() => openEdit(s)} className="text-[12px] text-[#0071e3] bg-transparent border-0 cursor-pointer font-medium hover:text-[#0058b0]">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-[12px] text-[#ff3b30] bg-transparent border-0 cursor-pointer font-medium hover:text-[#b80000]">Remove</button>
                  </div>
                </div>
                {s.certs.length > 0 && (
                  <div className="border-t border-[#f0f0f5] pt-3 flex flex-col gap-2">
                    {s.certs.map((c, ci) => {
                      const cLabel = CERT_TYPES.find(ct => ct.id === c.type)?.label || c.type
                      return (
                        <div key={ci} className="flex items-center gap-2 flex-wrap">
                          <span className="text-[12px] text-[#1d1d1f] font-medium min-w-[160px]">{cLabel}</span>
                          {c.certNumber && <span className="text-[11px] text-[#a1a1a6]">#{c.certNumber}</span>}
                          {c.expiryDate && <CertStatusBadge expiry={c.expiryDate} />}
                          {!c.expiryDate && <span className="text-[11px] text-[#a1a1a6] italic">No expiry set</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-[18px] w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5ea] sticky top-0 bg-white z-10">
              <span className="text-[15px] font-bold text-[#1d1d1f]">{isNew ? 'Add Staff Member' : 'Edit Staff Member'}</span>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] border-0 cursor-pointer text-[14px] hover:bg-[#e5e5ea] transition-colors">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Full name *</label>
                  <input className={inputCls} placeholder="Jane Smith" value={editData.name} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Role / Job title</label>
                  <input className={inputCls} placeholder="Chef, Supervisor…" value={editData.role} onChange={e => setEditData(p => ({ ...p, role: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Start date</label>
                  <input className={inputCls} type="date" value={editData.startDate} onChange={e => setEditData(p => ({ ...p, startDate: e.target.value }))} />
                </div>
              </div>

              {/* RTW */}
              <div className="flex items-center gap-3 py-3 border-t border-[#f0f0f5]">
                <input
                  id="rtw"
                  type="checkbox"
                  checked={editData.rtwChecked}
                  onChange={e => setEditData(p => ({ ...p, rtwChecked: e.target.checked }))}
                  className="w-4 h-4 accent-[#0071e3] cursor-pointer"
                />
                <div>
                  <label htmlFor="rtw" className="text-[13px] font-semibold text-[#1d1d1f] cursor-pointer">Right to Work check completed</label>
                  <div className="text-[11px] text-[#a1a1a6]">UK legal requirement — retain copies of documents for 2 years post-employment</div>
                </div>
              </div>

              {/* Certificates */}
              <div className="border-t border-[#f0f0f5] pt-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-bold text-[#1d1d1f]">Certificates</span>
                  <button onClick={addCert} className="text-[12px] text-[#0071e3] bg-transparent border-0 cursor-pointer font-semibold hover:text-[#0058b0]">+ Add certificate</button>
                </div>

                {editData.certs.map((cert, i) => (
                  <div key={i} className="border border-[#e5e5ea] rounded-[10px] p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px] font-semibold text-[#6e6e73]">Certificate {i + 1}</span>
                      {editData.certs.length > 1 && (
                        <button onClick={() => removeCert(i)} className="text-[11px] text-[#ff3b30] bg-transparent border-0 cursor-pointer hover:text-[#b80000]">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <label className={labelCls}>Certificate type</label>
                        <select className={inputCls} value={cert.type} onChange={e => updateCert(i, 'type', e.target.value)}>
                          {CERT_TYPES.map(ct => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Awarding body / Provider</label>
                        <input className={inputCls} placeholder="Highfield, RSPH…" value={cert.provider} onChange={e => updateCert(i, 'provider', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Certificate number</label>
                        <input className={inputCls} placeholder="Optional" value={cert.certNumber} onChange={e => updateCert(i, 'certNumber', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Date completed</label>
                        <input className={inputCls} type="date" value={cert.completedDate} onChange={e => updateCert(i, 'completedDate', e.target.value)} />
                      </div>
                      <div>
                        <label className={labelCls}>Expiry date</label>
                        <input className={inputCls} type="date" value={cert.expiryDate} onChange={e => updateCert(i, 'expiryDate', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 bg-[#0071e3] text-white border-0 rounded-[10px] text-[14px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving…' : isNew ? 'Add staff member' : 'Save changes'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-[#e5e5ea] rounded-[10px] text-[14px] text-[#6e6e73] cursor-pointer bg-white hover:bg-[#f5f5f7] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
