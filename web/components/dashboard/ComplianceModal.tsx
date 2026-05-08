'use client'
import { useState, useRef } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import type { Compliance, VaultDoc } from '@/types'

interface Props {
  compliance: Compliance | null
  uid: string
  onClose:  () => void
  onMarkDone: (c: Compliance) => void
  onUpdateDocs: (c: Compliance, docs: VaultDoc[]) => void
  onToast: (msg: string) => void
}

function daysUntil(dateStr: string) {
  const due   = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default function ComplianceModal({ compliance: c, uid, onClose, onMarkDone, onUpdateDocs, onToast }: Props) {
  const [pendingFile,  setPendingFile]  = useState<File | null>(null)
  const [expiryDate,   setExpiryDate]   = useState('')
  const [uploading,    setUploading]    = useState(false)
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
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{c.name}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{c.authority}</p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>{c.description}</p>

        {/* Required documents */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Required documents</div>
          <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {c.documents.map(d => <li key={d} style={{ fontSize: 13, color: 'var(--text-2)' }}>{d}</li>)}
          </ul>
        </div>

        {/* History */}
        {c.history.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>History</div>
            <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {c.history.map((h, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text-2)' }}>{h}</li>)}
            </ul>
          </div>
        )}

        {/* Document vault */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Document vault</div>
          {docs.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-3)' }}>No documents uploaded yet.</p>
          ) : (
            docs.map((d, i) => {
              const days = d.expiry ? daysUntil(d.expiry) : null
              const badgeCls = days === null ? 'badge-gray' : days < 0 ? 'badge-red' : days <= 30 ? 'badge-orange' : 'badge-green'
              const expiryLabel = d.expiry
                ? (days! < 0 ? `Expired ${Math.abs(days!)}d ago` : days === 0 ? 'Expires today' : `Expires in ${days}d`)
                : 'No expiry set'
              return (
                <div key={i} className="doc-vault-item">
                  <div className="doc-vault-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                  <div className="doc-vault-info">
                    <div className="doc-vault-name">{d.name}</div>
                    <div className="doc-vault-meta">{new Date(d.uploadedAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`badge ${badgeCls}`}>{expiryLabel}</span>
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 500 }}>View</a>}
                  <button onClick={() => handleDelete(i)} style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              )
            })
          )}

          {/* Upload */}
          {!pendingFile ? (
            <>
              <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={handleFileChange} />
              <button onClick={() => fileRef.current?.click()} style={{ marginTop: 10, fontSize: 13, color: 'var(--blue)', background: 'var(--blue-lt)', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 500 }}>
                + Upload document
              </button>
            </>
          ) : (
            <div style={{ marginTop: 10, padding: 14, background: 'var(--bg-alt)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{pendingFile.name}</div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 4 }}>Expiry date (optional)</label>
                <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="expiry-date-input" />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleUpload} disabled={uploading} style={{ padding: '8px 14px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {uploading ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setPendingFile(null)} style={{ padding: '8px 14px', background: 'var(--bg-alt)', color: 'var(--text-2)', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {c.status !== 'Completed' && (
          <button
            onClick={() => { onMarkDone(c); onClose() }}
            style={{ width: '100%', padding: '12px', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Mark as completed ✓
          </button>
        )}
      </div>
    </div>
  )
}
