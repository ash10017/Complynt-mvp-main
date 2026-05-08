'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { DEFAULT_COMPLIANCES } from '@/lib/compliances'
import type { Compliance, VaultDoc } from '@/types'
import ComplianceModal from '@/components/dashboard/ComplianceModal'
import CalendarView    from '@/components/dashboard/CalendarView'

type View = 'overview' | 'compliance' | 'calendar' | 'documents' | 'ai'

function daysUntil(dateStr: string) {
  const due   = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function statusColor(c: Compliance) {
  if (c.status === 'Completed') return 'green'
  const d = daysUntil(c.dueDate)
  if (d < 0)   return 'red'
  if (d <= 30) return 'orange'
  return 'blue'
}

const VIEW_LABELS: Record<View, string> = {
  overview:   'Overview',
  compliance: 'Compliance',
  calendar:   'Calendar',
  documents:  'Documents',
  ai:         'AI Assistant',
}

const NAV_ITEMS: { id: View; icon: React.ReactNode; label: string }[] = [
  { id: 'overview',   label: 'Overview',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg> },
  { id: 'compliance', label: 'Compliance',   icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12l2 2 4-4"/></svg> },
  { id: 'calendar',   label: 'Calendar',     icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { id: 'documents',  label: 'Documents',    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg> },
  { id: 'ai',         label: 'AI Assistant', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user,          setUser]          = useState<User | null>(null)
  const [compliances,   setCompliances]   = useState<Compliance[]>([])
  const [view,          setView]          = useState<View>('overview')
  const [search,        setSearch]        = useState('')
  const [filter,        setFilter]        = useState('')
  const [modalItem,     setModalItem]     = useState<Compliance | null>(null)
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [toast,         setToast]         = useState('')
  const [docSearch,     setDocSearch]     = useState('')
  const [aiInput,       setAiInput]       = useState('')
  const [aiMessages,    setAiMessages]    = useState<{role:'user'|'ai',text:string}[]>([])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const saveCompliances = async (uid: string, updated: Compliance[]) => {
    await updateDoc(doc(db, 'users', uid), { compliances: updated }).catch(() => {})
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace('/'); return }
      setUser(u)
      try {
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (!snap.exists()) { router.replace('/onboarding'); return }
        const data = snap.data()
        if (!data.onboardingComplete) { router.replace('/onboarding'); return }
        setCompliances(Array.isArray(data.compliances) ? data.compliances : DEFAULT_COMPLIANCES)
      } catch {
        setCompliances(DEFAULT_COMPLIANCES)
      }
    })
    return unsub
  }, [router])

  const initials = user
    ? (user.displayName || user.email || '').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
    : '?'

  const overdue = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
  const soon    = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 7)

  const handleMarkDone = (c: Compliance) => {
    const updated = compliances.map(x =>
      x.id === c.id
        ? { ...x, status: 'Completed' as const, history: [...(x.history || []), `Marked completed on ${new Date().toLocaleDateString()}`] }
        : x
    )
    setCompliances(updated)
    if (user) saveCompliances(user.uid, updated)
    showToast('Marked as done')
  }

  const handleUpdateDocs = (c: Compliance, docs: VaultDoc[]) => {
    const updated = compliances.map(x => x.id === c.id ? { ...x, vaultDocs: docs } : x)
    setCompliances(updated)
    setModalItem(prev => prev?.id === c.id ? { ...prev, vaultDocs: docs } : prev)
    if (user) saveCompliances(user.uid, updated)
  }

  const filteredCompliances = compliances.filter(c => {
    const matchQ = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.authority.toLowerCase().includes(search.toLowerCase())
    const matchF = !filter || c.category === filter
    return matchQ && matchF
  })

  const completed = compliances.filter(c => c.status === 'Completed').length
  const total     = compliances.length
  const progress  = total > 0 ? (completed / total) * 100 : 0

  const health    = total > 0
    ? Math.round(((compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30).length + completed) / total) * 100)
    : 100
  const healthColor = health >= 80 ? '#1a7a34' : health >= 50 ? '#8a4d00' : '#b80000'
  const healthBg    = health >= 80 ? 'rgba(52,199,89,.12)' : health >= 50 ? 'rgba(255,159,10,.12)' : 'rgba(255,59,48,.12)'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const categories = [...new Set(compliances.map(c => c.category))]

  return (
    <div className="app-shell">

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 49 }} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`app-sidebar${sidebarOpen ? ' open' : ''}`} id="app-sidebar" style={{ zIndex: sidebarOpen ? 50 : undefined }}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <span className="sidebar-logo-name">Complynt</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-item${view === item.id ? ' active' : ''}`}
              onClick={() => { setView(item.id); setSidebarOpen(false) }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.displayName || 'Account'}</div>
            <div className="sidebar-user-email">{user?.email}</div>
          </div>
          <button
            className="sidebar-logout"
            title="Log out"
            onClick={() => signOut(auth).then(() => router.replace('/'))}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="app-content">

        {/* Alert bar */}
        {(overdue.length > 0 || soon.length > 0) && (
          <div className={`alert-bar${overdue.length > 0 ? '' : ' warn'}`}>
            {overdue.length > 0 && `${overdue.length} overdue`}
            {overdue.length > 0 && soon.length > 0 && ' · '}
            {soon.length > 0 && `${soon.length} due within 7 days`}
          </div>
        )}

        {/* Topbar */}
        <div className="app-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" style={{ display: 'flex' }} onClick={() => setSidebarOpen(v => !v)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{VIEW_LABELS[view]}</span>
          </div>
          <div className="progress-track" style={{ width: 100, margin: 0 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* ── Overview ── */}
        {view === 'overview' && (
          <div className="dash-view">
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{greeting}</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{user?.displayName || 'Your dashboard'}</h2>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: healthBg, color: healthColor, border: `1px solid ${healthBg}` }}>
                Health Score: {health}/100
              </span>
            </div>

            <div className="stat-grid" style={{ marginTop: 24 }}>
              <div className="stat-card"><div className="stat-val">{compliances.length}</div><div className="stat-lbl">Total items</div></div>
              <div className="stat-card"><div className="stat-val" style={{ color: 'var(--green)' }}>{compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30).length}</div><div className="stat-lbl">On track</div></div>
              <div className="stat-card"><div className="stat-val" style={{ color: 'var(--orange)' }}>{compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30).length}</div><div className="stat-lbl">Due soon</div></div>
              <div className="stat-card"><div className="stat-val" style={{ color: 'var(--red)' }}>{overdue.length}</div><div className="stat-lbl">Overdue</div></div>
              <div className="stat-card"><div className="stat-val">{completed}</div><div className="stat-lbl">Completed</div></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 4 }}>
              {/* Urgent */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border-lt)', borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Urgent</div>
                {[...overdue, ...soon].length === 0
                  ? <div style={{ fontSize: 13, color: 'var(--text-3)' }}>All clear — nothing urgent right now.</div>
                  : [...overdue, ...soon].slice(0, 5).map(c => {
                      const d = daysUntil(c.dueDate)
                      const col = d < 0 ? 'red' : 'orange'
                      const label = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Due today' : `${d}d left`
                      return (
                        <div key={c.id} onClick={() => setModalItem(c)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border-lt)', cursor: 'pointer' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: `var(--${col})`, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{c.name}</span>
                          <span className={`badge badge-${col}`}>{label}</span>
                        </div>
                      )
                    })
                }
              </div>

              {/* Upcoming */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border-lt)', borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Upcoming 30 days</div>
                  <button onClick={() => setView('calendar')} style={{ fontSize: 12, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Calendar →</button>
                </div>
                {compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 7 && daysUntil(c.dueDate) <= 30).length === 0
                  ? <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Nothing due in the next 30 days.</div>
                  : compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 7 && daysUntil(c.dueDate) <= 30).slice(0, 5).map(c => {
                      const d = daysUntil(c.dueDate)
                      return (
                        <div key={c.id} onClick={() => setModalItem(c)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid var(--border-lt)', cursor: 'pointer' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 13, color: 'var(--text)' }}>{c.name}</span>
                          <span className="badge badge-blue">{d}d left</span>
                        </div>
                      )
                    })
                }
              </div>
            </div>
          </div>
        )}

        {/* ── Compliance list ── */}
        {view === 'compliance' && (
          <div className="dash-view">
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <div className="compliance-toolbar">
              <input className="search-input" type="text" placeholder="Search compliance items…" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="">All categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {filteredCompliances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No compliance items match your search.</div>
            ) : (
              filteredCompliances.map(c => {
                const days  = daysUntil(c.dueDate)
                const color = statusColor(c)
                const label = c.status === 'Completed' ? 'Done'
                  : days < 0  ? `${Math.abs(days)}d overdue`
                  : days === 0 ? 'Due today'
                  : `${days}d left`
                return (
                  <div key={c.id} className="card" onClick={() => setModalItem(c)}>
                    <div>
                      <h3>{c.name}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>{c.authority} · Due {c.dueDate}</p>
                    </div>
                    <span className={`badge badge-${color}`}>{label}</span>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── Calendar ── */}
        {view === 'calendar' && (
          <div className="dash-view">
            <CalendarView compliances={compliances} onSelectCompliance={setModalItem} />
          </div>
        )}

        {/* ── Documents ── */}
        {view === 'documents' && (
          <div className="dash-view">
            <input
              className="search-input"
              type="text"
              placeholder="Search documents…"
              value={docSearch}
              onChange={e => setDocSearch(e.target.value)}
              style={{ marginBottom: 20, maxWidth: 400 }}
            />
            {compliances.filter(c => (c.vaultDocs || []).length > 0).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-3)', fontSize: 14 }}>
                No documents uploaded yet.<br />Open a compliance item and upload your first document.
              </div>
            ) : (
              compliances.filter(c => (c.vaultDocs || []).length > 0).map(c => {
                const docs = (c.vaultDocs || []).filter(d => !docSearch || d.name.toLowerCase().includes(docSearch.toLowerCase()))
                if (docs.length === 0 && docSearch) return null
                return (
                  <div key={c.id} style={{ background: 'var(--bg)', border: '1px solid var(--border-lt)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{c.name}</span>
                      <span className="badge badge-gray">{docs.length} doc{docs.length !== 1 ? 's' : ''}</span>
                    </div>
                    {docs.map((d, i) => (
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
                        {d.url && <a href={d.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 500 }}>View</a>}
                      </div>
                    ))}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── AI Assistant ── */}
        {view === 'ai' && (
          <div className="dash-view" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>AI Compliance Assistant</h2>
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Ask anything about your licences, deadlines, or compliance requirements.</p>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {aiMessages.length === 0 && (
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border-lt)', borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Try asking:</div>
                  {['When does my FSSAI licence expire?', 'What documents do I need for BBMP renewal?', 'What are the penalties for overdue excise licence?'].map(q => (
                    <div key={q} onClick={() => setAiInput(q)} style={{ fontSize: 13, color: 'var(--blue)', cursor: 'pointer', padding: '6px 0', borderTop: '1px solid var(--border-lt)' }}>
                      {q}
                    </div>
                  ))}
                </div>
              )}
              {aiMessages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%', padding: '10px 14px', borderRadius: 12, fontSize: 14, lineHeight: 1.6,
                    background: m.role === 'user' ? 'var(--blue)' : 'var(--bg)',
                    color: m.role === 'user' ? '#fff' : 'var(--text)',
                    border: m.role === 'ai' ? '1px solid var(--border-lt)' : 'none',
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="search-input"
                type="text"
                placeholder="Ask about your compliance…"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && aiInput.trim()) {
                    setAiMessages(prev => [
                      ...prev,
                      { role: 'user', text: aiInput.trim() },
                      { role: 'ai', text: 'AI integration coming soon. Your compliance data is ready — this feature will provide personalised answers based on your specific licences and deadlines.' },
                    ])
                    setAiInput('')
                  }
                }}
                style={{ flex: 1 }}
              />
              <button
                onClick={() => {
                  if (!aiInput.trim()) return
                  setAiMessages(prev => [
                    ...prev,
                    { role: 'user', text: aiInput.trim() },
                    { role: 'ai', text: 'AI integration coming soon. Your compliance data is ready — this feature will provide personalised answers based on your specific licences and deadlines.' },
                  ])
                  setAiInput('')
                }}
                style={{ padding: '8px 18px', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              >
                Send
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Compliance modal */}
      {modalItem && (
        <ComplianceModal
          compliance={modalItem}
          uid={user?.uid || ''}
          onClose={() => setModalItem(null)}
          onMarkDone={handleMarkDone}
          onUpdateDocs={handleUpdateDocs}
          onToast={showToast}
        />
      )}

      {/* Toast */}
      <div className={`toast${toast ? '' : ' hidden'}`}>{toast}</div>
    </div>
  )
}
