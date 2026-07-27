'use client'
import { useRef } from 'react'
import type { Compliance } from '@/types'
import type { User } from 'firebase/auth'

interface Props {
  compliances: Compliance[]
  user: User
  locationName?: string
}

function daysUntil(dateStr: string) {
  const due   = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function computeHealth(items: Compliance[]) {
  if (items.length === 0) return 100
  const completed = items.filter(c => c.status === 'Completed').length
  const onTrack   = items.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30).length
  return Math.round(((onTrack + completed) / items.length) * 100)
}

function statusLabel(c: Compliance) {
  if (c.status === 'Completed') return { text: 'Completed', color: '#1a7a34', bg: 'rgba(52,199,89,.12)' }
  const d = daysUntil(c.dueDate)
  if (d < 0)   return { text: `${Math.abs(d)}d overdue`, color: '#b80000', bg: 'rgba(255,59,48,.12)' }
  if (d === 0) return { text: 'Due today',  color: '#b80000', bg: 'rgba(255,59,48,.12)' }
  if (d <= 30) return { text: `${d}d left`, color: '#8a4d00', bg: 'rgba(255,159,10,.12)' }
  return { text: `${d}d left`, color: '#0071e3', bg: '#e8f2ff' }
}

function statusIcon(c: Compliance) {
  if (c.status === 'Completed') return '✓'
  const d = daysUntil(c.dueDate)
  if (d < 0)   return '❗'
  if (d <= 30) return '⚠'
  return '•'
}

export default function ReportsPanel({ compliances, user, locationName }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const health    = computeHealth(compliances)
  const completed = compliances.filter(c => c.status === 'Completed').length
  const overdue   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
  const dueSoon   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30)
  const onTrack   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30)

  const businessName = locationName || user.displayName || user.email?.split('@')[0] || 'Your Business'
  const generatedAt  = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  const healthColor = health >= 80 ? '#1a7a34' : health >= 50 ? '#8a4d00' : '#b80000'
  const healthBg    = health >= 80 ? 'rgba(52,199,89,.10)' : health >= 50 ? 'rgba(255,159,10,.10)' : 'rgba(255,59,48,.10)'
  const healthLabel = health >= 80 ? 'Excellent' : health >= 60 ? 'Good' : health >= 40 ? 'Fair' : 'Needs attention'

  const categories = Array.from(new Set(compliances.map(c => c.category))).sort()

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML
    if (!printContent) return
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Compliance Report – ${businessName}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1d1d1f; font-size: 13px; padding: 32px; }
            h1 { font-size: 22px; font-weight: 800; }
            h2 { font-size: 14px; font-weight: 700; margin: 20px 0 8px; }
            h3 { font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; letter-spacing: .05em; margin: 16px 0 6px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e5e5ea; }
            .logo { font-size: 16px; font-weight: 800; color: #0071e3; }
            .meta { font-size: 11px; color: #a1a1a6; text-align: right; }
            .score-box { display: inline-flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; }
            .score-num { font-size: 28px; font-weight: 800; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .stat-box { padding: 10px 12px; border: 1px solid #e5e5ea; border-radius: 8px; }
            .stat-val { font-size: 20px; font-weight: 700; }
            .stat-label { font-size: 10px; color: #a1a1a6; margin-top: 2px; }
            .item-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f5f5f7; }
            .item-name { font-size: 13px; font-weight: 500; flex: 1; min-width: 0; margin-right: 8px; }
            .item-auth { font-size: 11px; color: #a1a1a6; }
            .badge { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 100px; font-size: 10px; font-weight: 700; white-space: nowrap; }
            .cat-section { margin-bottom: 16px; }
            .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5ea; font-size: 10px; color: #a1a1a6; display: flex; justify-content: space-between; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    win.document.close()
    setTimeout(() => win.print(), 300)
  }

  return (
    <div className="p-6">

      {/* Action bar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-[16px] font-bold text-[#1d1d1f]">Compliance Report</h2>
          <p className="text-[13px] text-[#a1a1a6] mt-0.5">Generated {generatedAt} · {compliances.length} items tracked</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0071e3] text-white border-0 rounded-[10px] text-[13px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print / Save PDF
        </button>
      </div>

      {/* Printable content */}
      <div ref={printRef}>

        {/* Print header */}
        <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #e5e5ea' }}>
          <div>
            <div className="logo" style={{ fontSize: 16, fontWeight: 800, color: '#0071e3' }}>Complynt</div>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{businessName}</h1>
            <p style={{ fontSize: 12, color: '#a1a1a6', marginTop: 2 }}>Compliance Report</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: '#a1a1a6' }}>
            <div>Generated: {generatedAt}</div>
            <div>{user.email}</div>
          </div>
        </div>

        {/* Health score */}
        <div className="bg-white border border-[#e5e5ea] rounded-[14px] p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-[10px]"
              style={{ background: healthBg }}
            >
              <span className="text-[32px] font-extrabold leading-none" style={{ color: healthColor }}>{health}</span>
              <div>
                <div className="text-[11px] font-semibold text-[#a1a1a6] uppercase tracking-wider">Health Score</div>
                <div className="text-[13px] font-bold" style={{ color: healthColor }}>{healthLabel}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { val: compliances.length, label: 'Total items',  color: '#1d1d1f' },
              { val: completed,           label: 'Completed',    color: '#1a7a34' },
              { val: dueSoon.length,      label: 'Due within 30d', color: '#8a4d00' },
              { val: overdue.length,      label: 'Overdue',      color: '#b80000' },
            ].map(s => (
              <div key={s.label} className="border border-[#e5e5ea] rounded-[10px] p-3">
                <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.val}</div>
                <div className="text-[11px] text-[#a1a1a6] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Items by category */}
        {categories.map(cat => {
          const items = compliances.filter(c => c.category === cat)
          return (
            <div key={cat} className="bg-white border border-[#e5e5ea] rounded-[14px] p-5 mb-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-[#1d1d1f] uppercase tracking-wide">{cat}</h3>
                <span className="text-[11px] text-[#a1a1a6]">
                  {items.filter(c => c.status === 'Completed').length}/{items.length} complete
                </span>
              </div>
              {items.map(c => {
                const st = statusLabel(c)
                return (
                  <div key={c.id} className="flex items-center justify-between py-2.5 border-t border-[#f5f5f7]">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span className="text-[13px] font-bold mt-0.5 shrink-0" style={{ color: st.color }}>
                        {statusIcon(c)}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-[#1d1d1f] truncate">{c.name}</div>
                        <div className="text-[11px] text-[#a1a1a6]">{c.authority}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[11px] text-[#a1a1a6]">{c.dueDate}</span>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {st.text}
                      </span>
                      {(c.vaultDocs || []).length > 0 && (
                        <span className="text-[10px] text-[#a1a1a6] flex items-center gap-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
                          </svg>
                          {(c.vaultDocs || []).length}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Print footer */}
        <div style={{ marginTop: 24, paddingTop: 12, borderTop: '1px solid #e5e5ea', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#a1a1a6' }}>
          <span>Generated by Complynt — complynt.com</span>
          <span>This report reflects compliance status as at {generatedAt}. Keep this document on file for audits and inspections.</span>
        </div>
      </div>
    </div>
  )
}
