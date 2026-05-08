'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { DEFAULT_COMPLIANCES } from '@/lib/compliances'
import { MOCK_LOCATIONS, MOCK_COMPLIANCE_MAIN, MOCK_COMPLIANCE_CLOUD, MOCK_COMPLIANCE_CAFE, MOCK_USER_PROFILE } from '@/lib/mockData'
import { generateAIResponse, getAISuggestions } from '@/lib/aiResponses'
import type { Compliance, VaultDoc } from '@/types'
import ComplianceModal    from '@/components/dashboard/ComplianceModal'
import CalendarView       from '@/components/dashboard/CalendarView'
import AddComplianceModal from '@/components/dashboard/AddComplianceModal'

const TEST_EMAIL = 'testing@testing.com'

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

function computeHealth(items: Compliance[]) {
  if (items.length === 0) return 100
  const completed = items.filter(c => c.status === 'Completed').length
  const onTrack   = items.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30).length
  return Math.round(((onTrack + completed) / items.length) * 100)
}

// Render AI response: handle **bold** and line breaks
function renderAI(text: string) {
  return text.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line.split(/\*\*(.*?)\*\*/).map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      )}
      {i < arr.length - 1 && <br />}
    </span>
  ))
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

const DocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
)

export default function DashboardPage() {
  const router = useRouter()
  const [user,           setUser]           = useState<User | null>(null)
  const [compliances,    setCompliances]    = useState<Compliance[]>([])
  const [view,           setView]           = useState<View>('overview')
  const [search,         setSearch]         = useState('')
  const [filter,         setFilter]         = useState('')
  const [modalItem,      setModalItem]      = useState<Compliance | null>(null)
  const [sidebarOpen,    setSidebarOpen]    = useState(false)
  const [toast,          setToast]          = useState('')
  const [docSearch,      setDocSearch]      = useState('')
  const [aiInput,        setAiInput]        = useState('')
  const [aiMessages,     setAiMessages]     = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [aiLoading,      setAiLoading]      = useState(false)
  const [isTestUser,     setIsTestUser]     = useState(false)
  const [activeLocation, setActiveLocation] = useState('main')
  const [showAddModal,   setShowAddModal]   = useState(false)

  const locationCacheRef = useRef<Record<string, Compliance[]>>({})
  const aiEndRef         = useRef<HTMLDivElement>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const saveCompliances = async (uid: string, updated: Compliance[]) => {
    if (!isTestUser || activeLocation === 'main') {
      await updateDoc(doc(db, 'users', uid), { compliances: updated }).catch(() => {})
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.replace('/'); return }
      setUser(u)
      try {
        const snap = await getDoc(doc(db, 'users', u.uid))
        const data = snap.exists() ? snap.data() : null

        if (u.email === TEST_EMAIL) {
          setIsTestUser(true)
          let mainCompliances: Compliance[]
          if (!data || !data.onboardingComplete) {
            // First time: seed full mock profile
            await setDoc(doc(db, 'users', u.uid), {
              ...MOCK_USER_PROFILE,
              compliances: MOCK_COMPLIANCE_MAIN,
            })
            mainCompliances = MOCK_COMPLIANCE_MAIN
          } else {
            mainCompliances = Array.isArray(data.compliances) ? data.compliances : MOCK_COMPLIANCE_MAIN
          }
          locationCacheRef.current = {
            main:  mainCompliances,
            cloud: MOCK_COMPLIANCE_CLOUD,
            cafe:  MOCK_COMPLIANCE_CAFE,
          }
          setCompliances(mainCompliances)
          return
        }

        if (!data || !data.onboardingComplete) { router.replace('/onboarding'); return }
        setCompliances(Array.isArray(data.compliances) ? data.compliances : DEFAULT_COMPLIANCES)
      } catch {
        setCompliances(DEFAULT_COMPLIANCES)
      }
    })
    return unsub
  }, [router])

  // Auto-scroll AI to bottom
  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, aiLoading])

  const switchLocation = (locId: string) => {
    if (locId === activeLocation) return
    locationCacheRef.current[activeLocation] = compliances
    const newData = locationCacheRef.current[locId] || MOCK_LOCATIONS.find(l => l.id === locId)?.compliances || []
    setCompliances(newData)
    setActiveLocation(locId)
    setSearch('')
    setFilter('')
    setSidebarOpen(false)
  }

  const initials = user
    ? (user.displayName || user.email || '').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
    : '?'

  const overdue   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
  const soon      = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 7)
  const completed = compliances.filter(c => c.status === 'Completed').length
  const total     = compliances.length
  const progress  = total > 0 ? (completed / total) * 100 : 0
  const health      = computeHealth(compliances)
  const healthColor = health >= 80 ? '#1a7a34' : health >= 50 ? '#8a4d00' : '#b80000'
  const healthBg    = health >= 80 ? 'rgba(52,199,89,.12)' : health >= 50 ? 'rgba(255,159,10,.12)' : 'rgba(255,59,48,.12)'
  const hour        = new Date().getHours()
  const greeting    = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const categories  = Array.from(new Set(compliances.map(c => c.category)))

  const filteredCompliances = compliances.filter(c => {
    const matchQ = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.authority.toLowerCase().includes(search.toLowerCase())
    const matchF = !filter || c.category === filter
    return matchQ && matchF
  })

  const handleMarkDone = (c: Compliance) => {
    const updated = compliances.map(x =>
      x.id === c.id
        ? { ...x, status: 'Completed' as const, history: [...(x.history || []), `Marked completed on ${new Date().toLocaleDateString('en-IN')}`] }
        : x
    )
    setCompliances(updated)
    if (user) saveCompliances(user.uid, updated)
    if (isTestUser) locationCacheRef.current[activeLocation] = updated
    showToast('Marked as done ✓')
  }

  const handleUpdateDocs = (c: Compliance, docs: VaultDoc[]) => {
    const updated = compliances.map(x => x.id === c.id ? { ...x, vaultDocs: docs } : x)
    setCompliances(updated)
    setModalItem(prev => prev?.id === c.id ? { ...prev, vaultDocs: docs } : prev)
    if (user) saveCompliances(user.uid, updated)
    if (isTestUser) locationCacheRef.current[activeLocation] = updated
  }

  const handleAddItem = (newItem: Compliance) => {
    const updated = [...compliances, newItem]
    setCompliances(updated)
    if (user) saveCompliances(user.uid, updated)
    if (isTestUser) locationCacheRef.current[activeLocation] = updated
    setShowAddModal(false)
    showToast('Compliance item added ✓')
  }

  const handleAISend = async (text?: string) => {
    const input = (text ?? aiInput).trim()
    if (!input) return
    setAiInput('')
    setAiMessages(prev => [...prev, { role: 'user', text: input }])
    setAiLoading(true)
    await new Promise(r => setTimeout(r, 500 + Math.random() * 500))
    const response = generateAIResponse(input, compliances)
    setAiMessages(prev => [...prev, { role: 'ai', text: response }])
    setAiLoading(false)
  }

  const inputCls = 'px-3.5 py-2.5 rounded-[10px] border border-[#e5e5ea] bg-[#f5f5f7] text-[13px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:bg-white transition-all'

  const activeLocData = MOCK_LOCATIONS.find(l => l.id === activeLocation)

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 h-full w-[220px] bg-white border-r border-[#e5e5ea] flex flex-col transition-transform duration-200 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#e5e5ea]">
          <div className="w-7 h-7 bg-[#0071e3] rounded-[8px] flex items-center justify-center text-white shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <span className="text-[15px] font-bold text-[#1d1d1f]">Complynt</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-3">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] text-[13px] font-medium w-full bg-transparent border-0 cursor-pointer text-left transition-colors ${
                view === item.id ? 'bg-[#e8f2ff] text-[#0071e3]' : 'text-[#6e6e73] hover:bg-[#f5f5f7]'
              }`}
              onClick={() => { setView(item.id); setSidebarOpen(false) }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Multi-location (test user only) */}
        {isTestUser && (
          <div className="px-3 py-3 border-t border-[#e5e5ea]">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#a1a1a6] px-2 mb-2">Outlets</div>
            {MOCK_LOCATIONS.map(loc => {
              const locData   = loc.id === activeLocation ? compliances : (locationCacheRef.current[loc.id] || loc.compliances)
              const locHealth = computeHealth(locData)
              const hColor    = locHealth >= 80 ? '#34c759' : locHealth >= 50 ? '#ff9f0a' : '#ff3b30'
              return (
                <button
                  key={loc.id}
                  onClick={() => switchLocation(loc.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-[9px] text-left transition-colors border-0 cursor-pointer mb-0.5 ${
                    activeLocation === loc.id ? 'bg-[#e8f2ff]' : 'hover:bg-[#f5f5f7]'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeLocation === loc.id ? 'bg-[#0071e3]' : 'bg-[#d2d2d7]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[12px] font-semibold truncate leading-tight ${activeLocation === loc.id ? 'text-[#0071e3]' : 'text-[#1d1d1f]'}`}>
                      {loc.name}
                    </div>
                    <div className="text-[10px] text-[#a1a1a6] leading-tight truncate">{loc.id === 'main' ? 'Main Restaurant' : loc.id === 'cloud' ? 'Cloud Kitchen' : 'Café Branch'}</div>
                  </div>
                  <span className="text-[11px] font-bold shrink-0" style={{ color: hColor }}>{locHealth}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* User / logout */}
        <div className="flex items-center gap-2.5 p-4 border-t border-[#e5e5ea]">
          <div className="w-8 h-8 rounded-full bg-[#0071e3] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-[#1d1d1f] truncate">{user?.displayName || 'Account'}</div>
            <div className="text-[11px] text-[#a1a1a6] truncate">{user?.email}</div>
          </div>
          <button
            title="Log out"
            className="text-[#a1a1a6] hover:text-[#ff3b30] bg-transparent border-0 cursor-pointer flex items-center transition-colors"
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
      <div className="flex flex-col flex-1 min-h-screen md:ml-[220px]">

        {/* Alert bar */}
        {(overdue.length > 0 || soon.length > 0) && (
          <div className={`px-6 py-3 text-[13px] font-semibold ${
            overdue.length > 0 ? 'bg-[rgba(255,59,48,.10)] text-[#b80000]' : 'bg-[rgba(255,159,10,.10)] text-[#8a4d00]'
          }`}>
            {overdue.length > 0 && `${overdue.length} overdue item${overdue.length > 1 ? 's' : ''} — action required`}
            {overdue.length > 0 && soon.length > 0 && ' · '}
            {soon.length > 0 && `${soon.length} due within 7 days`}
          </div>
        )}

        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e5e5ea] sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-8 h-8 rounded-[8px] border border-[#e5e5ea] flex items-center justify-center text-[#6e6e73] bg-transparent cursor-pointer"
              onClick={() => setSidebarOpen(v => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <span className="text-[15px] font-bold text-[#1d1d1f]">{VIEW_LABELS[view]}</span>
              {isTestUser && activeLocData && (
                <span className="ml-2 text-[12px] text-[#a1a1a6]">· {activeLocData.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-[100px] h-1.5 rounded-full bg-[#e5e5ea] overflow-hidden">
              <div className="h-full bg-[#0071e3] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[11px] font-medium text-[#a1a1a6]">{completed}/{total}</span>
          </div>
        </div>

        {/* ── Overview ─────────────────────────────────────────────────────── */}
        {view === 'overview' && (
          <div className="p-6 flex-1">

            {/* Health score card */}
            <div className="flex items-center gap-5 bg-white border border-[#e5e5ea] rounded-[16px] p-5 mb-5">
              {/* Ring */}
              <div className="relative w-[80px] h-[80px] shrink-0">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e5ea" strokeWidth="7"/>
                  <circle
                    cx="40" cy="40" r="32"
                    fill="none"
                    stroke={healthColor}
                    strokeWidth="7"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - health / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[18px] font-extrabold leading-none" style={{ color: healthColor }}>{health}</span>
                  <span className="text-[8px] text-[#a1a1a6] uppercase tracking-wider">/ 100</span>
                </div>
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#a1a1a6]">{greeting}</p>
                <h2 className="text-[17px] font-bold text-[#1d1d1f] mt-0.5 truncate">
                  {isTestUser ? (activeLocData?.name || 'Dashboard') : (user?.displayName || 'Your dashboard')}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-[#34c759] font-semibold">✓ {completed} done</span>
                  {overdue.length > 0 && <span className="text-[11px] text-[#ff3b30] font-semibold">❗ {overdue.length} overdue</span>}
                  {soon.length > 0 && <span className="text-[11px] text-[#ff9f0a] font-semibold">⚠️ {soon.length} due soon</span>}
                </div>
                <div className="text-[11px] text-[#a1a1a6] mt-1">
                  {health >= 80 ? 'Excellent compliance standing — keep it up!' : health >= 60 ? 'Good — a few items need attention' : health >= 40 ? 'Fair — address overdue items to improve' : 'Critical — immediate action required'}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
              {[
                { val: total,                                                                                                               label: 'Total items',  color: '#1d1d1f' },
                { val: compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30).length,                             label: 'On track',     color: '#34c759' },
                { val: compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30).length, label: 'Due soon',   color: '#ff9f0a' },
                { val: overdue.length,                                                                                                      label: 'Overdue',      color: '#ff3b30' },
                { val: completed,                                                                                                           label: 'Completed',    color: '#1d1d1f' },
              ].map(s => (
                <div key={s.label} className="bg-white border border-[#e5e5ea] rounded-[12px] p-4">
                  <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.val}</div>
                  <div className="text-[11px] text-[#a1a1a6] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Urgent */}
              <div className="bg-white border border-[#e5e5ea] rounded-[14px] p-5">
                <div className="text-[14px] font-bold text-[#1d1d1f] mb-3">Urgent items</div>
                {[...overdue, ...soon].length === 0 ? (
                  <div className="flex items-center gap-2 text-[13px] text-[#34c759]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                    All clear — nothing urgent right now.
                  </div>
                ) : (
                  [...overdue, ...soon].slice(0, 5).map(c => {
                    const d   = daysUntil(c.dueDate)
                    const col = d < 0 ? 'red' : 'orange'
                    const lbl = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Due today' : `${d}d left`
                    return (
                      <div key={c.id} onClick={() => setModalItem(c)} className="flex items-center gap-2.5 py-2.5 border-t border-[#e5e5ea] cursor-pointer hover:bg-[#fafafa] -mx-1 px-1 rounded transition-colors">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${col === 'red' ? 'bg-[#ff3b30]' : 'bg-[#ff9f0a]'}`} />
                        <span className="flex-1 text-[13px] text-[#1d1d1f]">{c.name}</span>
                        <span className={`badge badge-${col}`}>{lbl}</span>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Upcoming */}
              <div className="bg-white border border-[#e5e5ea] rounded-[14px] p-5">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[14px] font-bold text-[#1d1d1f]">Upcoming 30 days</div>
                  <button onClick={() => setView('calendar')} className="text-[12px] text-[#0071e3] bg-transparent border-0 cursor-pointer font-medium hover:text-[#0058b0]">
                    Calendar →
                  </button>
                </div>
                {compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 7 && daysUntil(c.dueDate) <= 30).length === 0 ? (
                  <div className="text-[13px] text-[#a1a1a6]">Nothing due in the next 30 days.</div>
                ) : (
                  compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 7 && daysUntil(c.dueDate) <= 30)
                    .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))
                    .slice(0, 5)
                    .map(c => {
                      const d = daysUntil(c.dueDate)
                      return (
                        <div key={c.id} onClick={() => setModalItem(c)} className="flex items-center gap-2.5 py-2.5 border-t border-[#e5e5ea] cursor-pointer hover:bg-[#fafafa] -mx-1 px-1 rounded transition-colors">
                          <span className="w-2 h-2 rounded-full bg-[#0071e3] shrink-0" />
                          <span className="flex-1 text-[13px] text-[#1d1d1f]">{c.name}</span>
                          <span className="badge badge-blue">{d}d left</span>
                        </div>
                      )
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Compliance list ──────────────────────────────────────────────── */}
        {view === 'compliance' && (
          <div className="p-6 flex-1">
            <div className="h-1.5 rounded-full bg-[#e5e5ea] overflow-hidden mb-4">
              <div className="h-full bg-[#0071e3] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>

            {/* Search + filter + add */}
            <div className="flex gap-2.5 mb-4">
              <input
                className={`${inputCls} flex-1`}
                type="text"
                placeholder="Search compliance items…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select className={inputCls} value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="">All categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#0071e3] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#0058b0] transition-colors border-0 cursor-pointer shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add item
              </button>
            </div>

            {filteredCompliances.length === 0 ? (
              <div className="text-center py-10 text-[#a1a1a6]">No compliance items match your search.</div>
            ) : (
              filteredCompliances.map(c => {
                const days  = daysUntil(c.dueDate)
                const color = statusColor(c)
                const label = c.status === 'Completed' ? 'Done'
                  : days < 0   ? `${Math.abs(days)}d overdue`
                  : days === 0 ? 'Due today'
                  : `${days}d left`
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between bg-white border border-[#e5e5ea] rounded-[14px] p-4 mb-3 cursor-pointer hover:border-[#0071e3] hover:shadow-sm transition-all"
                    onClick={() => setModalItem(c)}
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="text-[14px] font-semibold text-[#1d1d1f]">{c.name}</h3>
                      <p className="text-[12px] text-[#a1a1a6] mt-0.5">{c.authority} · Due {c.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(c.vaultDocs || []).length > 0 && (
                        <span className="text-[11px] text-[#a1a1a6] flex items-center gap-0.5">
                          <DocIcon />
                          {(c.vaultDocs || []).length}
                        </span>
                      )}
                      <span className={`badge badge-${color}`}>{label}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── Calendar ─────────────────────────────────────────────────────── */}
        {view === 'calendar' && (
          <div className="p-6 flex-1">
            <CalendarView compliances={compliances} onSelectCompliance={setModalItem} />
          </div>
        )}

        {/* ── Documents ────────────────────────────────────────────────────── */}
        {view === 'documents' && (
          <div className="p-6 flex-1">
            <input
              className={`${inputCls} w-full max-w-[400px] mb-5`}
              type="text"
              placeholder="Search documents…"
              value={docSearch}
              onChange={e => setDocSearch(e.target.value)}
            />
            {compliances.filter(c => (c.vaultDocs || []).length > 0).length === 0 ? (
              <div className="text-center py-16 text-[#a1a1a6] text-[14px]">
                No documents uploaded yet.<br />
                Open a compliance item and upload your first document.
              </div>
            ) : (
              compliances.filter(c => (c.vaultDocs || []).length > 0).map(c => {
                const docs = (c.vaultDocs || []).filter(d => !docSearch || d.name.toLowerCase().includes(docSearch.toLowerCase()))
                if (docs.length === 0 && docSearch) return null
                return (
                  <div key={c.id} className="bg-white border border-[#e5e5ea] rounded-[14px] p-5 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[14px] font-bold text-[#1d1d1f]">{c.name}</span>
                      <span className="badge badge-gray">{docs.length} doc{docs.length !== 1 ? 's' : ''}</span>
                    </div>
                    {docs.map((d, i) => (
                      <div key={i} className="flex items-center gap-3 py-3 border-t border-[#e5e5ea]">
                        <div className="w-8 h-8 rounded-[8px] bg-[#f5f5f7] flex items-center justify-center text-[#6e6e73] shrink-0">
                          <DocIcon />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-[#1d1d1f] truncate">{d.name}</div>
                          <div className="text-[11px] text-[#a1a1a6] mt-0.5">
                            Uploaded {new Date(d.uploadedAt).toLocaleDateString('en-IN')}
                            {d.expiry && ` · Expires ${d.expiry}`}
                          </div>
                        </div>
                        {d.url ? (
                          <a href={d.url} target="_blank" rel="noreferrer" className="text-[12px] text-[#0071e3] font-medium hover:text-[#0058b0]">View</a>
                        ) : (
                          <span className="text-[11px] text-[#a1a1a6] italic">Demo file</span>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── AI Assistant ──────────────────────────────────────────────────── */}
        {view === 'ai' && (
          <div className="flex flex-col flex-1" style={{ height: 'calc(100vh - 120px)' }}>
            <div className="px-6 pt-5 pb-3 border-b border-[#e5e5ea] bg-white">
              <h2 className="text-[16px] font-bold text-[#1d1d1f]">AI Compliance Assistant</h2>
              <p className="text-[13px] text-[#6e6e73] mt-0.5">Ask anything about your licences, deadlines, or renewal requirements.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {aiMessages.length === 0 && (
                <div className="bg-white border border-[#e5e5ea] rounded-[14px] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-[#0071e3] rounded-full flex items-center justify-center text-white">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    </div>
                    <span className="text-[14px] font-semibold text-[#1d1d1f]">Complynt AI</span>
                  </div>
                  <p className="text-[13px] text-[#6e6e73] mb-3 leading-relaxed">
                    Hello! I&apos;m your compliance assistant. I know your {compliances.length} compliance items and can help with deadlines, documents, renewal steps, and penalties. Try asking:
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {getAISuggestions(compliances).map(q => (
                      <button
                        key={q}
                        onClick={() => handleAISend(q)}
                        className="text-[13px] text-[#0071e3] cursor-pointer py-2 px-3 border-t border-[#e5e5ea] hover:bg-[#f5f5f7] rounded text-left bg-transparent border-x-0 border-b-0 border-solid transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiMessages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'ai' && (
                    <div className="w-6 h-6 bg-[#0071e3] rounded-full flex items-center justify-center text-white shrink-0 mt-1 mr-2">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    </div>
                  )}
                  <div className={`max-w-[75%] px-3.5 py-2.5 rounded-[12px] text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#0071e3] text-white'
                      : 'bg-white text-[#1d1d1f] border border-[#e5e5ea]'
                  }`}>
                    {m.role === 'ai' ? renderAI(m.text) : m.text}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex justify-start items-end gap-2">
                  <div className="w-6 h-6 bg-[#0071e3] rounded-full flex items-center justify-center text-white shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  </div>
                  <div className="bg-white border border-[#e5e5ea] rounded-[12px] px-3.5 py-2.5">
                    <div className="flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-[#a1a1a6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#a1a1a6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#a1a1a6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={aiEndRef} />
            </div>

            <div className="flex gap-2.5 px-5 py-4 bg-white border-t border-[#e5e5ea]">
              <input
                className={`${inputCls} flex-1`}
                type="text"
                placeholder="Ask about your compliance…"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !aiLoading) handleAISend() }}
                disabled={aiLoading}
              />
              <button
                onClick={() => handleAISend()}
                disabled={!aiInput.trim() || aiLoading}
                className="px-4 py-2.5 bg-[#0071e3] text-white border-0 rounded-[9px] text-[14px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Add compliance modal */}
      {showAddModal && (
        <AddComplianceModal
          compliances={compliances}
          onAdd={handleAddItem}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Toast */}
      <div className={`toast${toast ? '' : ' hidden'}`}>{toast}</div>
    </div>
  )
}
