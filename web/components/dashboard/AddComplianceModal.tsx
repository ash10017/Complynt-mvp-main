'use client'
import { useState } from 'react'
import { ALL_LICENSES, LICENSE_DOCS } from '@/lib/compliances'
import type { Compliance } from '@/types'

interface Props {
  compliances: Compliance[]
  onAdd:   (item: Compliance) => void
  onClose: () => void
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-[10px] border border-[#e5e5ea] bg-[#f5f5f7] text-[13px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:bg-white transition-all'

export default function AddComplianceModal({ compliances, onAdd, onClose }: Props) {
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState<typeof ALL_LICENSES[0] | null>(null)
  const [isCustom,   setIsCustom]   = useState(false)
  const [dueDate,    setDueDate]    = useState('')
  const [custName,   setCustName]   = useState('')
  const [custAuth,   setCustAuth]   = useState('')
  const [custCat,    setCustCat]    = useState('')
  const [error,      setError]      = useState('')

  const existingNames = new Set(compliances.map(c => c.name.toLowerCase()))

  const filtered = ALL_LICENSES.filter(l =>
    !existingNames.has(l.name.toLowerCase()) &&
    (!search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()) ||
      l.authority.toLowerCase().includes(search.toLowerCase()))
  )

  const canAdd = isCustom
    ? (custName.trim().length > 0 && dueDate.length > 0)
    : (selected !== null && dueDate.length > 0)

  const handleAdd = () => {
    setError('')
    if (!dueDate) { setError('Please set a due / expiry date.'); return }

    if (isCustom) {
      if (!custName.trim()) { setError('Please enter a name.'); return }
      const newItem: Compliance = {
        id:          Date.now(),
        name:        custName.trim(),
        authority:   custAuth.trim() || 'Custom',
        category:    custCat.trim()  || 'Other',
        frequency:   'Annual',
        description: `${custName.trim()} compliance item.`,
        documents:   ['Application Form', 'Identity Proof', 'Fee Receipt'],
        dueDate,
        status:      new Date(dueDate) < new Date() ? 'Overdue' : 'Pending',
        history:     [`Added on ${new Date().toLocaleDateString('en-GB')}`],
      }
      onAdd(newItem)
    } else if (selected) {
      const newItem: Compliance = {
        id:          Date.now(),
        name:        selected.name,
        authority:   selected.authority,
        category:    selected.category,
        frequency:   'Annual',
        description: `${selected.name} issued by ${selected.authority}.`,
        documents:   LICENSE_DOCS[selected.id] || ['Application Form', 'Identity Proof', 'Fee Receipt'],
        dueDate,
        status:      new Date(dueDate) < new Date() ? 'Overdue' : 'Pending',
        history:     [`Added on ${new Date().toLocaleDateString('en-GB')}`],
      }
      onAdd(newItem)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-[24px] sm:rounded-[20px] w-full sm:max-w-[480px] shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5ea] shrink-0">
          <h2 className="text-[16px] font-bold text-[#1d1d1f]">Add Compliance Item</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e5e5ea] transition-colors border-0 cursor-pointer text-[16px] font-bold"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {!isCustom ? (
            <>
              <input
                className={`${inputCls} mb-3`}
                type="text"
                placeholder="Search licences…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />

              {filtered.length === 0 && (
                <div className="text-[13px] text-[#a1a1a6] text-center py-4">
                  {search ? 'No matching licences found.' : 'All catalogue licences are already added.'}
                </div>
              )}

              <div className="flex flex-col gap-2 mb-4">
                {filtered.map(lic => (
                  <button
                    key={lic.id}
                    onClick={() => setSelected(lic.id === selected?.id ? null : lic)}
                    className={`flex items-start gap-3 p-3 border-[1.5px] rounded-[12px] cursor-pointer text-left transition-all w-full bg-transparent ${
                      selected?.id === lic.id
                        ? 'border-[#0071e3] bg-[#e8f2ff]'
                        : 'border-[#e5e5ea] hover:border-[#d2d2d7]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-[5px] border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        selected?.id === lic.id ? 'bg-[#0071e3] border-[#0071e3]' : 'border-[#d2d2d7] bg-white'
                      }`}
                    >
                      {selected?.id === lic.id && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20,6 9,17 4,12"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-[#1d1d1f]">{lic.name}</div>
                      <div className="text-[11px] text-[#a1a1a6] mt-0.5">{lic.authority} · {lic.category}</div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => { setIsCustom(true); setSelected(null) }}
                className="text-[13px] text-[#0071e3] bg-transparent border-0 cursor-pointer font-medium hover:text-[#0058b0]"
              >
                + Can&apos;t find it? Add a custom item
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsCustom(false)}
                className="flex items-center gap-1.5 text-[13px] text-[#0071e3] bg-transparent border-0 cursor-pointer mb-4 hover:text-[#0058b0]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
                Back to catalogue
              </button>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide block mb-1.5">License / Compliance name *</label>
                  <input className={inputCls} type="text" placeholder="e.g. Music License, Signage Permit" value={custName} onChange={e => setCustName(e.target.value)} />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide block mb-1.5">Issuing authority</label>
                  <input className={inputCls} type="text" placeholder="e.g. District Collector, PPRS" value={custAuth} onChange={e => setCustAuth(e.target.value)} />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide block mb-1.5">Category</label>
                  <select className={inputCls} value={custCat} onChange={e => setCustCat(e.target.value)}>
                    <option value="">Select category…</option>
                    <option value="Food Safety">Food Safety</option>
                    <option value="Licensing">Licensing</option>
                    <option value="Safety">Safety</option>
                    <option value="Labour & HR">Labour & HR</option>
                    <option value="Tax">Tax</option>
                    <option value="Data & Privacy">Data & Privacy</option>
                    <option value="Legal">Legal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Due date — shown when something is selected or custom mode */}
          {(selected || isCustom) && (
            <div className="mt-4 pt-4 border-t border-[#e5e5ea]">
              <label className="text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wide block mb-1.5">
                Due / expiry date *
              </label>
              <input
                className={inputCls}
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
              <p className="text-[11px] text-[#a1a1a6] mt-1.5">
                Enter when the current license expires or when the obligation is next due.
              </p>
            </div>
          )}

          {error && (
            <p className="mt-3 text-[12px] text-[#ff3b30] font-medium">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e5ea] flex gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e5e5ea] transition-colors border-0 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="flex-1 py-2.5 rounded-[10px] text-[14px] font-semibold bg-[#0071e3] text-white hover:bg-[#0058b0] transition-colors border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
