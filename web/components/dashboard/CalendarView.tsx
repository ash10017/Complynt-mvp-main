'use client'
import { useState } from 'react'
import type { Compliance } from '@/types'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

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

interface Props {
  compliances: Compliance[]
  onSelectCompliance: (c: Compliance) => void
}

export default function CalendarView({ compliances, onSelectCompliance }: Props) {
  const now = new Date()
  const [year,  setYear]  = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1); setSelectedDate(null) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1); setSelectedDate(null) }

  const itemsByDate: Record<string, Compliance[]> = {}
  compliances.forEach(c => {
    if (!c.dueDate) return
    itemsByDate[c.dueDate] = itemsByDate[c.dueDate] || []
    itemsByDate[c.dueDate].push(c)
  })

  const firstDay     = new Date(year, month, 1).getDay()
  const daysInMonth  = new Date(year, month + 1, 0).getDate()
  const today        = new Date()
  const todayStr     = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  const selectedItems = selectedDate ? (itemsByDate[selectedDate] || []) : []

  return (
    <div>
      {/* Nav */}
      <div className="cal-nav">
        <button onClick={prevMonth}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{MONTHS[month]} {year}</span>
        <button onClick={nextMonth}>›</button>
      </div>

      {/* Day headers */}
      <div className="cal-grid" style={{ marginBottom: 4 }}>
        {DAYS.map(d => <div key={d} className="cal-header">{d}</div>)}
      </div>

      {/* Calendar cells */}
      <div className="cal-grid">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="cal-cell empty" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d       = i + 1
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
          const items   = itemsByDate[dateStr] || []
          const isToday = dateStr === todayStr

          return (
            <div
              key={d}
              className={`cal-cell${isToday ? ' today' : ''}${items.length ? ' has-items' : ''}`}
              onClick={() => items.length && setSelectedDate(dateStr === selectedDate ? null : dateStr)}
            >
              <span className="cal-day-num">{d}</span>
              {items.length > 0 && (
                <div className="cal-dots">
                  {items.slice(0, 3).map((item, j) => (
                    <span key={j} className={`cal-dot cal-dot-${statusColor(item)}`} />
                  ))}
                  {items.length > 3 && <span style={{ fontSize: 9, color: 'var(--text-3)' }}>+{items.length-3}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Day detail */}
      {selectedDate && selectedItems.length > 0 && (
        <div style={{ marginTop: 20, padding: 16, background: 'var(--bg)', border: '1px solid var(--border-lt)', borderRadius: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          {selectedItems.map(c => {
            const days  = daysUntil(c.dueDate)
            const color = statusColor(c)
            const label = c.status === 'Completed' ? 'Done' : days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`
            return (
              <div
                key={c.id}
                onClick={() => onSelectCompliance(c)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderTop: '1px solid var(--border-lt)', cursor: 'pointer' }}
              >
                <span className={`cal-dot cal-dot-${color}`} style={{ width: 8, height: 8, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.authority}</div>
                </div>
                <span className={`badge badge-${color}`}>{label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
