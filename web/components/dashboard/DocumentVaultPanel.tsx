'use client'
import { useState, useEffect, useRef } from 'react'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { storage, db } from '@/lib/firebase'

interface VaultDoc {
  id: string
  name: string
  category: string
  fileName: string
  filePath: string
  url: string
  size: number
  uploadedAt: string
  expiryDate?: string
  notes?: string
}

const CATS = [
  { id: 'legal',       label: 'Legal',       color: '#0071e3', bg: '#e8f2ff' },
  { id: 'food_safety', label: 'Food Safety',  color: '#1a7a34', bg: 'rgba(52,199,89,.10)' },
  { id: 'staff',       label: 'Staff',        color: '#7a4400', bg: 'rgba(255,159,10,.10)' },
  { id: 'insurance',   label: 'Insurance',    color: '#5856d6', bg: 'rgba(88,86,214,.10)' },
  { id: 'safety',      label: 'Safety',       color: '#b80000', bg: 'rgba(255,59,48,.10)' },
  { id: 'other',       label: 'Other',        color: '#6e6e73', bg: '#f5f5f7' },
]

const SUGGESTIONS: { name: string; category: string }[] = [
  { name: 'Premises Licence',                  category: 'legal' },
  { name: 'DPS Certificate',                   category: 'legal' },
  { name: 'Food Business Registration',        category: 'legal' },
  { name: 'HACCP Plan',                        category: 'food_safety' },
  { name: 'Allergen Matrix',                   category: 'food_safety' },
  { name: 'Temperature Log Records',           category: 'food_safety' },
  { name: 'Level 2 Food Hygiene Certificate',  category: 'staff' },
  { name: 'Fire Safety Training Record',       category: 'staff' },
  { name: 'Right to Work Documents',           category: 'staff' },
  { name: "Employer's Liability Insurance",    category: 'insurance' },
  { name: 'Public Liability Insurance',        category: 'insurance' },
  { name: 'Fire Risk Assessment',              category: 'safety' },
  { name: 'Gas Safety Certificate (CP12)',     category: 'safety' },
  { name: 'Electrical Safety Report (EICR)',   category: 'safety' },
]

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

function expiryInfo(date?: string) {
  if (!date) return null
  const days = Math.round((new Date(date).getTime() - Date.now()) / 86400000)
  if (days < 0)   return { label: 'Expired',          color: '#b80000', bg: 'rgba(255,59,48,.10)' }
  if (days <= 30) return { label: `${days}d left`,    color: '#b80000', bg: 'rgba(255,59,48,.10)' }
  if (days <= 60) return { label: `${days}d left`,    color: '#7a4400', bg: 'rgba(255,159,10,.10)' }
  return { label: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), color: '#1a7a34', bg: 'rgba(52,199,89,.10)' }
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const isPdf = ext === 'pdf'
  const isImg = ['jpg','jpeg','png','gif','webp'].includes(ext)
  const isDoc = ['doc','docx'].includes(ext)
  return (
    <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isPdf ? 'rgba(255,59,48,.1)' : isImg ? 'rgba(88,86,214,.1)' : isDoc ? 'rgba(0,113,227,.1)' : '#f5f5f7' }}>
      {isPdf && <span style={{ fontSize: 10, fontWeight: 900, color: '#ff3b30' }}>PDF</span>}
      {isImg && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5856d6" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>}
      {isDoc && <span style={{ fontSize: 9, fontWeight: 900, color: '#0071e3' }}>DOC</span>}
      {!isPdf && !isImg && !isDoc && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a1a1a6" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>}
    </div>
  )
}

interface Props {
  uid: string
  onToast: (msg: string) => void
}

export default function DocumentVaultPanel({ uid, onToast }: Props) {
  const [docs,       setDocs]       = useState<VaultDoc[]>([])
  const [loading,    setLoading]    = useState(true)
  const [catFilter,  setCatFilter]  = useState('all')
  const [search,     setSearch]     = useState('')
  const [showModal,  setShowModal]  = useState(false)
  const [deleting,   setDeleting]   = useState<string | null>(null)
  const [uploading,  setUploading]  = useState(false)
  const [progress,   setProgress]   = useState(0)
  const fileRef                     = useRef<HTMLInputElement>(null)

  /* form state */
  const [fName,     setFName]     = useState('')
  const [fCat,      setFCat]      = useState('legal')
  const [fExpiry,   setFExpiry]   = useState('')
  const [fNotes,    setFNotes]    = useState('')
  const [fFile,     setFFile]     = useState<File | null>(null)

  const inputCls = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e5ea', background: '#f5f5f7', fontSize: 14, color: '#1d1d1f', outline: 'none' } as const

  useEffect(() => {
    getDoc(doc(db, 'users', uid)).then(snap => {
      const d = snap.data()
      setDocs(Array.isArray(d?.vaultDocuments) ? d.vaultDocuments : [])
      setLoading(false)
    })
  }, [uid])

  const saveDocs = async (updated: VaultDoc[]) => {
    await updateDoc(doc(db, 'users', uid), { vaultDocuments: updated }).catch(() => {})
    setDocs(updated)
  }

  const openModal = (sug?: { name: string; category: string }) => {
    setFName(sug?.name || '')
    setFCat(sug?.category || 'legal')
    setFExpiry('')
    setFNotes('')
    setFFile(null)
    if (fileRef.current) fileRef.current.value = ''
    setProgress(0)
    setShowModal(true)
  }

  const handleUpload = async () => {
    if (!fName.trim()) { onToast('Please enter a document name'); return }
    if (!fFile) { onToast('Please select a file to upload'); return }

    setUploading(true)
    setProgress(0)

    try {
      const path  = `vault/${uid}/${Date.now()}_${fFile.name.replace(/\s+/g, '_')}`
      const sRef  = storageRef(storage, path)
      const task  = uploadBytesResumable(sRef, fFile)

      await new Promise<void>((resolve, reject) => {
        task.on(
          'state_changed',
          snap => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
          reject,
          resolve
        )
      })

      const url = await getDownloadURL(sRef)
      const newDoc: VaultDoc = {
        id:         `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name:       fName.trim(),
        category:   fCat,
        fileName:   fFile.name,
        filePath:   path,
        url,
        size:       fFile.size,
        uploadedAt: new Date().toISOString(),
        expiryDate: fExpiry || undefined,
        notes:      fNotes.trim() || undefined,
      }

      await saveDocs([newDoc, ...docs])
      setShowModal(false)
      onToast(`"${fName}" uploaded ✓`)
    } catch {
      onToast('Upload failed — check your connection and try again')
    }

    setUploading(false)
  }

  const handleDelete = async (d: VaultDoc) => {
    if (!confirm(`Delete "${d.name}"? This cannot be undone.`)) return
    setDeleting(d.id)
    try {
      await deleteObject(storageRef(storage, d.filePath))
    } catch { /* file may already be gone */ }
    await saveDocs(docs.filter(x => x.id !== d.id))
    onToast(`"${d.name}" deleted`)
    setDeleting(null)
  }

  const filtered = docs.filter(d => {
    const matchCat = catFilter === 'all' || d.category === catFilter
    const matchQ   = !search || d.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchQ
  })

  const expiringSoon = docs.filter(d => {
    if (!d.expiryDate) return false
    const days = Math.round((new Date(d.expiryDate).getTime() - Date.now()) / 86400000)
    return days >= 0 && days <= 30
  }).length

  const expired = docs.filter(d => {
    if (!d.expiryDate) return false
    return new Date(d.expiryDate) < new Date()
  }).length

  if (loading) return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center', paddingTop: 64 }}>
      <div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div style={{ padding: 24, maxWidth: 960 }}>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1d1d1f', letterSpacing: '-0.3px', margin: 0, marginBottom: 4 }}>Document Vault</h2>
          <p style={{ color: '#6e6e73', fontSize: 13, margin: 0 }}>
            Store compliance certificates, licences, and food safety records — all in one place.
          </p>
        </div>
        <button onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#0071e3', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Upload document
        </button>
      </div>

      {/* alert strips */}
      {(expired > 0 || expiringSoon > 0) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          {expired > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,59,48,.07)', border: '1px solid rgba(255,59,48,.2)', borderRadius: 10, padding: '8px 14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b80000" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ color: '#b80000', fontSize: 13, fontWeight: 600 }}>{expired} document{expired !== 1 ? 's' : ''} expired</span>
            </div>
          )}
          {expiringSoon > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,159,10,.07)', border: '1px solid rgba(255,159,10,.2)', borderRadius: 10, padding: '8px 14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7a4400" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ color: '#7a4400', fontSize: 13, fontWeight: 600 }}>{expiringSoon} expiring within 30 days</span>
            </div>
          )}
        </div>
      )}

      {/* filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 300 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1a6" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input style={{ ...inputCls, paddingLeft: 36 }} placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[{ id: 'all', label: 'All', color: '#1d1d1f', bg: '#f5f5f7' }, ...CATS].map(c => (
            <button key={c.id} onClick={() => setCatFilter(c.id)} style={{ padding: '6px 14px', borderRadius: 100, border: `1px solid ${catFilter === c.id ? c.color : '#e5e5ea'}`, background: catFilter === c.id ? c.bg : '#fff', color: catFilter === c.id ? c.color : '#6e6e73', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
              {c.label}
              {c.id !== 'all' && docs.filter(d => d.category === c.id).length > 0 && (
                <span style={{ marginLeft: 5, fontSize: 10 }}>{docs.filter(d => d.category === c.id).length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* document list */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(d => {
            const cat = CATS.find(c => c.id === d.category) || CATS[5]
            const exp = expiryInfo(d.expiryDate)
            return (
              <div key={d.id} style={{ background: '#fff', border: '1px solid #e5e5ea', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <FileIcon name={d.fileName} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ color: '#1d1d1f', fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{d.name}</span>
                    <span style={{ background: cat.bg, color: cat.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>{cat.label}</span>
                    {exp && <span style={{ background: exp.bg, color: exp.color, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>Expires: {exp.label}</span>}
                  </div>
                  <div style={{ color: '#a1a1a6', fontSize: 11, marginTop: 3 }}>
                    {d.fileName} · {fmtSize(d.size)} · Uploaded {new Date(d.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {d.notes && ` · ${d.notes}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <a href={d.url} target="_blank" rel="noreferrer" style={{ padding: '7px 14px', background: '#f5f5f7', border: '1px solid #e5e5ea', borderRadius: 8, color: '#1d1d1f', fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: 'background 0.15s' }}>
                    View
                  </a>
                  <button onClick={() => handleDelete(d)} disabled={deleting === d.id} style={{ padding: '7px 10px', background: 'transparent', border: '1px solid #e5e5ea', borderRadius: 8, color: '#a1a1a6', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s', opacity: deleting === d.id ? 0.5 : 1 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : docs.length === 0 ? (
        /* Empty state with suggestions */
        <div>
          <div style={{ textAlign: 'center', padding: '40px 20px 32px', color: '#a1a1a6' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a1a1a6" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1d1d1f', marginBottom: 6 }}>No documents yet</div>
            <p style={{ fontSize: 13, lineHeight: 1.55, maxWidth: 380, margin: '0 auto 24px' }}>
              Store your compliance certificates and legal documents here. Start with the most commonly requested documents.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {SUGGESTIONS.map(s => {
              const cat = CATS.find(c => c.id === s.category)!
              return (
                <button key={s.name} onClick={() => openModal(s)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#f5f5f7', border: '1px solid #e5e5ea', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ebebeb' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f5f5f7' }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#1d1d1f', fontWeight: 500, lineHeight: 1.35 }}>{s.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#a1a1a6', fontSize: 14 }}>
          No documents match your filters.
        </div>
      )}

      {/* ── UPLOAD MODAL ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => { if (e.target === e.currentTarget && !uploading) setShowModal(false) }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #e5e5ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1d1d1f' }}>Upload document</h3>
              {!uploading && <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a1a1a6', padding: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>}
            </div>
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* file picker */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1d1d1f', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>File *</label>
                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  style={{ border: `2px dashed ${fFile ? '#0071e3' : '#d2d2d7'}`, borderRadius: 12, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', background: fFile ? '#f0f8ff' : '#fafafa', transition: 'all 0.15s' }}
                >
                  {fFile ? (
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0071e3', marginBottom: 2 }}>{fFile.name}</div>
                      <div style={{ fontSize: 12, color: '#a1a1a6' }}>{fmtSize(fFile.size)}</div>
                    </div>
                  ) : (
                    <div>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1a6" strokeWidth="1.8" strokeLinecap="round" style={{ marginBottom: 8 }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <div style={{ fontSize: 13, color: '#6e6e73' }}>Click to select a file</div>
                      <div style={{ fontSize: 11, color: '#a1a1a6', marginTop: 2 }}>PDF, Word, Excel, images (max 25 MB)</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setFFile(f); if (!fName) setFName(f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())) } }} />
              </div>

              {/* name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1d1d1f', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Document name *</label>
                <input style={inputCls} placeholder="e.g. Gas Safety Certificate 2025" value={fName} onChange={e => setFName(e.target.value)} />
              </div>

              {/* category */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1d1d1f', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category</label>
                <select style={inputCls} value={fCat} onChange={e => setFCat(e.target.value)}>
                  {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              {/* expiry */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1d1d1f', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expiry date <span style={{ color: '#a1a1a6', fontSize: 11, fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' }}>— optional</span></label>
                <input style={inputCls} type="date" value={fExpiry} onChange={e => setFExpiry(e.target.value)} />
              </div>

              {/* notes */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1d1d1f', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes <span style={{ color: '#a1a1a6', fontSize: 11, fontWeight: 400, textTransform: 'none', letterSpacing: 'normal' }}>— optional</span></label>
                <input style={inputCls} placeholder="e.g. Annual renewal — next due Jan 2026" value={fNotes} onChange={e => setFNotes(e.target.value)} />
              </div>

              {/* progress */}
              {uploading && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#6e6e73' }}>Uploading…</span>
                    <span style={{ fontSize: 12, color: '#0071e3', fontWeight: 700 }}>{progress}%</span>
                  </div>
                  <div style={{ height: 4, background: '#e5e5ea', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#0071e3', borderRadius: 2, width: `${progress}%`, transition: 'width 0.2s' }} />
                  </div>
                </div>
              )}

              {/* actions */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button onClick={handleUpload} disabled={uploading} style={{ flex: 1, padding: '12px 0', background: '#0071e3', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: uploading ? 0.7 : 1, transition: 'opacity 0.15s' }}>
                  {uploading ? 'Uploading…' : 'Upload document'}
                </button>
                {!uploading && (
                  <button onClick={() => setShowModal(false)} style={{ padding: '12px 18px', background: '#f5f5f7', color: '#1d1d1f', border: '1px solid #e5e5ea', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    Cancel
                  </button>
                )}
              </div>

              <p style={{ fontSize: 11, color: '#a1a1a6', margin: 0, textAlign: 'center' }}>
                Files are stored securely. You can delete any document at any time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
