'use client'
import { useState, useRef } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { getComplianceGuide } from '@/lib/aiResponses'
import type { Compliance, VaultDoc } from '@/types'

type Tab = 'details' | 'steps' | 'documents'

interface Props {
  compliance: Compliance | null
  uid: string
  onClose:      () => void
  onMarkDone:   (c: Compliance) => void
  onUpdateDocs: (c: Compliance, docs: VaultDoc[]) => void
  onToast:      (msg: string) => void
}

function daysUntil(dateStr: string) {
  const due   = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const DocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
)

export default function ComplianceModal({ compliance: c, uid, onClose, onMarkDone, onUpdateDocs, onToast }: Props) {
  const [tab,         setTab]         = useState<Tab>('details')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [expiryDate,  setExpiryDate]  = useState('')
  const [uploading,   setUploading]   = useState(false)
  const [showPenalty, setShowPenalty] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!c) return null

  const docs = c.vaultDocs || []
  const { renewalSteps, penaltyInfo } = getComplianceGuide(c.name)

  const days  = daysUntil(c.dueDate)
  const color = c.status === 'Completed' ? 'green' : days < 0 ? 'red' : days <= 30 ? 'orange' : 'blue'
  const label = c.status === 'Completed' ? 'Completed'
    : days < 0   ? `${Math.abs(days)}d overdue`
    : days === 0 ? 'Due today'
    : `${days}d left`

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setPendingFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!pendingFile) return
    setUploading(true)
    let url = ''
    try {
      const storageRef = ref(storage, `users/${uid}/docs/${c.id}/${pendingFile.name}`)
      await uploadBytes(storageRef, pendingFile)
      url = await getDownloadURL(storageRef)
    } catch {
      // Storage may not be configured — store metadata only
    }
    const newDoc: VaultDoc = {
      name:       pendingFile.name,
      url,
      expiry:     expiryDate,
      uploadedAt: new Date().toISOString(),
    }
    onUpdateDocs(c, [...docs, newDoc])
    setPendingFile(null)
    setExpiryDate('')
    setUploading(false)
    onToast('Document saved')
  }

  const handleDelete = (idx: number) => {
    onUpdateDocs(c, docs.filter((_, i) => i !== idx))
    onToast('Document removed')
  }

  const badgeCls: Record<string, string> = {
    green: 'bg-[rgba(52,199,89,0.12)] text-[#1a7a34]',
    blue:  'bg-[#e8f2ff] text-[#0071e3]',
    orange:'bg-[rgba(255,159,10,0.12)] text-[#8a4d00]',
    red:   'bg-[rgba(255,59,48,0.12)] text-[#b80000]',
  }

  const tabCls = (t: Tab) =>
    `px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 ${
      tab === t ? 'border-[#0071e3] text-[#0071e3]' : 'border-transparent text-[#6e6e73] hover:text-[#1d1d1f]'
    }`

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-[20px] w-full max-w-[560px] max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#e5e5ea] shrink-0">
          <div className="flex-1 min-w-0 mr-3">
            <h2 className="text-[17px] font-bold text-[#1d1d1f] leading-snug">{c.name}</h2>
            <p className="text-[12px] text-[#a1a1a6] mt-0.5">{c.authority}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${badgeCls[color]}`}>
              {label}
            </span>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#f5f5f7] text-[#6e6e73] hover:bg-[#e5e5ea] transition-colors border-0 cursor-pointer text-[16px] font-bold leading-none"
              onClick={onClose}
            >×</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e5e5ea] shrink-0 px-2">
          <button className={tabCls('details')}  onClick={() => setTab('details')}>Details</button>
          <button className={tabCls('steps')}    onClick={() => setTab('steps')}>
            Renewal Steps {renewalSteps ? '' : ''}
          </button>
          <button className={tabCls('documents')} onClick={() => setTab('documents')}>
            Documents {docs.length > 0 ? `(${docs.length})` : ''}
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* ── Details ── */}
          {tab === 'details' && (
            <div className="flex flex-col gap-5">
              {/* Meta pills */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-[#f5f5f7] rounded-full text-[11px] font-medium text-[#6e6e73]">{c.category}</span>
                <span className="px-2.5 py-1 bg-[#f5f5f7] rounded-full text-[11px] font-medium text-[#6e6e73]">{c.frequency}</span>
                <span className="px-2.5 py-1 bg-[#f5f5f7] rounded-full text-[11px] font-medium text-[#6e6e73]">Due {c.dueDate}</span>
              </div>

              <p className="text-[14px] text-[#6e6e73] leading-relaxed">{c.description}</p>

              {/* Penalty info */}
              {penaltyInfo && c.status !== 'Completed' && (
                <div className={`rounded-[12px] border ${days < 0 ? 'border-[rgba(255,59,48,.25)] bg-[rgba(255,59,48,.04)]' : 'border-[rgba(255,159,10,.25)] bg-[rgba(255,159,10,.04)]'}`}>
                  <button
                    onClick={() => setShowPenalty(v => !v)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-[13px] font-semibold bg-transparent border-0 cursor-pointer text-left ${days < 0 ? 'text-[#b80000]' : 'text-[#8a4d00]'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{days < 0 ? '❗' : '⚠️'}</span>
                      Penalty for non-compliance
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: showPenalty ? 'rotate(180deg)' : 'rotate(0)' }}>
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </button>
                  {showPenalty && (
                    <p className="px-4 pb-4 text-[13px] text-[#6e6e73] leading-relaxed border-t border-[rgba(0,0,0,.06)]" style={{ marginTop: 0 }}>
                      {penaltyInfo}
                    </p>
                  )}
                </div>
              )}

              {/* Required documents */}
              <div>
                <div className="text-[13px] font-semibold text-[#1d1d1f] mb-2">Required documents</div>
                <ul className="flex flex-col gap-1.5">
                  {c.documents.map(d => (
                    <li key={d} className="flex items-start gap-2 text-[13px] text-[#6e6e73]">
                      <span className="w-1 h-1 rounded-full bg-[#a1a1a6] mt-2 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* History */}
              {c.history.length > 0 && (
                <div>
                  <div className="text-[13px] font-semibold text-[#1d1d1f] mb-2">Activity history</div>
                  <div className="flex flex-col gap-0">
                    {c.history.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 py-2 border-t border-[#e5e5ea] first:border-t-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#d2d2d7] mt-1.5 shrink-0" />
                        <span className="text-[12px] text-[#6e6e73]">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Renewal Steps ── */}
          {tab === 'steps' && (
            <div>
              {renewalSteps ? (
                <div className="flex flex-col gap-3">
                  <p className="text-[13px] text-[#6e6e73]">
                    Follow these steps to renew or fix your <strong>{c.name}</strong>:
                  </p>
                  {renewalSteps.map((step, i) => {
                    const isTip = step.startsWith('Tip:')
                    return isTip ? (
                      <div key={i} className="flex items-start gap-3 p-3.5 bg-[#e8f2ff] rounded-[10px]">
                        <span className="text-[14px] shrink-0">💡</span>
                        <p className="text-[13px] text-[#0058b0] leading-relaxed">{step.replace('Tip: ', '')}</p>
                      </div>
                    ) : (
                      <div key={i} className="flex items-start gap-3 py-3 border-b border-[#e5e5ea] last:border-b-0">
                        <div className="w-6 h-6 rounded-full bg-[#0071e3] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-[13px] text-[#1d1d1f] leading-relaxed flex-1">{step.replace(/^\d+\.\s/, '')}</p>
                      </div>
                    )
                  })}
                  <p className="text-[11px] text-[#a1a1a6] mt-1">
                    Most UK regulatory approvals take 7–14 working days. Start at least 30 days before expiry.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-[32px] mb-3">📋</div>
                  <p className="text-[14px] text-[#6e6e73]">No specific renewal steps available for this item.</p>
                  <p className="text-[13px] text-[#a1a1a6] mt-1">
                    Contact the relevant authority or visit their official website. Use the AI Assistant for personalised guidance.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Documents ── */}
          {tab === 'documents' && (
            <div>
              {docs.length === 0 ? (
                <div className="text-center py-6 text-[#a1a1a6] text-[13px] mb-4">No documents uploaded yet.</div>
              ) : (
                docs.map((d, i) => {
                  const dDays = d.expiry ? daysUntil(d.expiry) : null
                  const bCls = dDays === null ? 'bg-[#f5f5f7] text-[#6e6e73]'
                    : dDays < 0  ? 'bg-[rgba(255,59,48,.10)] text-[#b80000]'
                    : dDays <= 30 ? 'bg-[rgba(255,159,10,.10)] text-[#8a4d00]'
                    : 'bg-[rgba(52,199,89,.10)] text-[#1a7a34]'
                  const expiryLabel = d.expiry
                    ? (dDays! < 0 ? `Expired ${Math.abs(dDays!)}d ago` : dDays === 0 ? 'Expires today' : `Expires in ${dDays}d`)
                    : 'No expiry'
                  return (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-[#e5e5ea]">
                      <div className="w-8 h-8 rounded-[8px] bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] shrink-0">
                        <DocIcon />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#1d1d1f] truncate">{d.name}</div>
                        <div className="text-[11px] text-[#a1a1a6] mt-0.5">
                          Uploaded {new Date(d.uploadedAt).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${bCls}`}>
                        {expiryLabel}
                      </span>
                      {d.url && (
                        <a href={d.url} target="_blank" rel="noreferrer" className="text-[12px] text-[#0071e3] font-medium hover:text-[#0058b0]">
                          View
                        </a>
                      )}
                      <button onClick={() => handleDelete(i)} className="text-[12px] text-[#a1a1a6] bg-transparent border-0 cursor-pointer hover:text-[#ff3b30] transition-colors">
                        Delete
                      </button>
                    </div>
                  )
                })
              )}

              {/* Upload */}
              {!pendingFile ? (
                <>
                  <input type="file" ref={fileRef} className="hidden" onChange={handleFileChange} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="mt-3 flex items-center gap-2 text-[13px] text-[#0071e3] bg-[#e8f2ff] border-0 rounded-[8px] px-3.5 py-2.5 cursor-pointer font-semibold hover:bg-[#d0e6ff] transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Upload document
                  </button>
                </>
              ) : (
                <div className="mt-3 p-4 bg-[#f5f5f7] rounded-[12px] flex flex-col gap-3">
                  <div className="text-[13px] font-semibold text-[#1d1d1f]">{pendingFile.name}</div>
                  <div>
                    <label className="text-[12px] text-[#6e6e73] block mb-1 font-medium">Expiry date (optional)</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={e => setExpiryDate(e.target.value)}
                      className="px-3 py-2 rounded-[8px] border border-[#e5e5ea] bg-white text-[13px] text-[#1d1d1f] outline-none focus:border-[#0071e3] transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-3.5 py-2 bg-[#0071e3] text-white border-0 rounded-[8px] text-[13px] font-semibold cursor-pointer hover:bg-[#0058b0] disabled:opacity-60 transition-colors"
                    >
                      {uploading ? 'Saving…' : 'Save document'}
                    </button>
                    <button
                      onClick={() => { setPendingFile(null); setExpiryDate('') }}
                      className="px-3.5 py-2 bg-[#e5e5ea] text-[#6e6e73] border-0 rounded-[8px] text-[13px] cursor-pointer hover:bg-[#d2d2d7] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e5ea] flex gap-2.5 shrink-0">
          {c.status !== 'Completed' && tab !== 'steps' && (
            <button
              onClick={() => setTab('steps')}
              className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#f5f5f7] text-[#0071e3] hover:bg-[#e8f2ff] transition-colors border-0 cursor-pointer"
            >
              View renewal steps →
            </button>
          )}
          {c.status !== 'Completed' && (
            <button
              onClick={() => { onMarkDone(c); onClose() }}
              className="flex-1 py-2.5 bg-[#34c759] text-white border-0 rounded-[10px] text-[13px] font-semibold cursor-pointer hover:bg-[#28a745] transition-colors"
            >
              Mark as completed ✓
            </button>
          )}
          {c.status === 'Completed' && (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-[rgba(52,199,89,.10)] text-[#1a7a34] text-[13px] font-semibold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
              Completed
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
