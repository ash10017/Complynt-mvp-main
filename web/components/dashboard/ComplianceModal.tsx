'use client'
import { useState, useRef } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import type { Compliance, VaultDoc } from '@/types'

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
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [expiryDate,  setExpiryDate]  = useState('')
  const [uploading,   setUploading]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!c) return null

  const docs = c.vaultDocs || []

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

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-[20px] p-6 w-full max-w-[520px] max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#1d1d1f]">{c.name}</h2>
            <p className="text-[12px] text-[#a1a1a6] mt-0.5">{c.authority}</p>
          </div>
          <button
            className="text-[#a1a1a6] text-[22px] leading-none bg-transparent border-0 cursor-pointer hover:text-[#1d1d1f] ml-4 shrink-0"
            onClick={onClose}
          >×</button>
        </div>

        <p className="text-[14px] text-[#6e6e73] mb-5 leading-relaxed">{c.description}</p>

        {/* Required documents */}
        <div className="mb-5">
          <div className="text-[13px] font-semibold text-[#1d1d1f] mb-2">Required documents</div>
          <ul className="pl-[18px] flex flex-col gap-1">
            {c.documents.map(d => <li key={d} className="text-[13px] text-[#6e6e73]">{d}</li>)}
          </ul>
        </div>

        {/* History */}
        {c.history.length > 0 && (
          <div className="mb-5">
            <div className="text-[13px] font-semibold text-[#1d1d1f] mb-2">History</div>
            <ul className="pl-[18px] flex flex-col gap-1">
              {c.history.map((h, i) => <li key={i} className="text-[13px] text-[#6e6e73]">{h}</li>)}
            </ul>
          </div>
        )}

        {/* Document vault */}
        <div className="mb-5">
          <div className="text-[13px] font-semibold text-[#1d1d1f] mb-2.5">Document vault</div>
          {docs.length === 0 ? (
            <p className="text-[13px] text-[#a1a1a6]">No documents uploaded yet.</p>
          ) : (
            docs.map((d, i) => {
              const days = d.expiry ? daysUntil(d.expiry) : null
              const badgeCls = days === null ? 'badge-gray' : days < 0 ? 'badge-red' : days <= 30 ? 'badge-orange' : 'badge-green'
              const expiryLabel = d.expiry
                ? (days! < 0 ? `Expired ${Math.abs(days!)}d ago` : days === 0 ? 'Expires today' : `Expires in ${days}d`)
                : 'No expiry set'
              return (
                <div key={i} className="flex items-center gap-3 py-3 border-t border-[#e5e5ea]">
                  <div className="w-8 h-8 rounded-[8px] bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] shrink-0">
                    <DocIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#1d1d1f] truncate">{d.name}</div>
                    <div className="text-[11px] text-[#a1a1a6] mt-0.5">{new Date(d.uploadedAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`badge ${badgeCls}`}>{expiryLabel}</span>
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-[12px] text-[#0071e3] font-medium">View</a>}
                  <button onClick={() => handleDelete(i)} className="text-[12px] text-[#a1a1a6] bg-transparent border-0 cursor-pointer hover:text-[#ff3b30]">Delete</button>
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
                className="mt-2.5 text-[13px] text-[#0071e3] bg-[#e8f2ff] border-0 rounded-[8px] px-3.5 py-2 cursor-pointer font-medium hover:bg-[#d0e6ff] transition-colors"
              >
                + Upload document
              </button>
            </>
          ) : (
            <div className="mt-2.5 p-3.5 bg-[#f5f5f7] rounded-[10px] flex flex-col gap-2.5">
              <div className="text-[13px] font-semibold text-[#1d1d1f]">{pendingFile.name}</div>
              <div>
                <label className="text-[12px] text-[#6e6e73] block mb-1">Expiry date (optional)</label>
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
                  {uploading ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setPendingFile(null)}
                  className="px-3.5 py-2 bg-[#e5e5ea] text-[#6e6e73] border-0 rounded-[8px] text-[13px] cursor-pointer hover:bg-[#d2d2d7] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mark done */}
        {c.status !== 'Completed' && (
          <button
            onClick={() => { onMarkDone(c); onClose() }}
            className="w-full py-3 bg-[#34c759] text-white border-0 rounded-[10px] text-[14px] font-semibold cursor-pointer hover:bg-[#28a745] transition-colors"
          >
            Mark as completed ✓
          </button>
        )}
      </div>
    </div>
  )
}
