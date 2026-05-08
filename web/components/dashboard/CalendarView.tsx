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
  compliances:        Compliance[]
  onSelectCompliance: (c: Compliance) => void
}

export default function CalendarView({ compliances, onSelectCompliance }: Props) {
  const now = new Date()
  const [year,         setYear]         = useState(now.getFullYear())
  const [month,        setMonth]        = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1); setSelectedDate(null) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1); setSelectedDate(null) }

  const itemsByDate: Record<string, Compliance[]> = {}
  compliances.forEach(c => {
    if (!c.dueDate) return
    itemsByDate[c.dueDate] = itemsByDate[c.dueDate] || []
    itemsByDate[c.dueDate].push(c)
  })

  const firstDay    = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today       = new Date()
  const todayStr    = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  const selectedItems = selectedDate ? (itemsByDate[selectedDate] || []) : []

  const navBtnCls = 'w-8 h-8 rounded-[8px] border border-[#e5e5ea] flex items-center justify-center text-[18px] text-[#6e6e73] bg-white cursor-pointer hover:bg-[#f5f5f7] transition-colors'

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between mb-5">
        <button className={navBtnCls} onClick={prevMonth}>‹</button>
        <span className="font-bold text-[15px] text-[#1d1d1f]">{MONTHS[month]} {year}</span>
        <button className={navBtnCls} onClick={nextMonth}>›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-[11px] font-semibold text-[#a1a1a6] text-center py-2">{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`empty-${i}`} className="min-h-[52px]" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d       = i + 1
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
          const items   = itemsByDate[dateStr] || []
          const isToday = dateStr === todayStr

          return (
            <div
              key={d}
              className={`min-h-[52px] rounded-[8px] p-1.5 flex flex-col transition-colors ${
                isToday ? 'bg-[#e8f2ff]' : ''
              } ${items.length ? 'cursor-pointer hover:bg-[#f0f4ff]' : ''}`}
              onClick={() => items.length && setSelectedDate(dateStr === selectedDate ? null : dateStr)}
            >
              <span className={`text-[13px] font-medium ${isToday ? 'text-[#0071e3] font-bold' : 'text-[#1d1d1f]'}`}>
                {d}
              </span>
              {items.length > 0 && (
                <div className="flex gap-1 flex-wrap mt-auto pt-0.5">
                  {items.slice(0, 3).map((item, j) => (
                    <span key={j} className={`cal-dot cal-dot-${statusColor(item)}`} />
                  ))}
                  {items.length > 3 && <span className="text-[9px] text-[#a1a1a6]">+{items.length-3}</span>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Day detail */}
      {selectedDate && selectedItems.length > 0 && (
        <div className="mt-5 p-4 bg-white border border-[#e5e5ea] rounded-[12px]">
          <div className="text-[13px] font-semibold text-[#1d1d1f] mb-3">
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
                className="flex items-center gap-2.5 py-2.5 border-t border-[#e5e5ea] cursor-pointer"
              >
                <span className={`cal-dot cal-dot-${color}`} style={{ width: 8, height: 8, flexShrink: 0 }} />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#1d1d1f]">{c.name}</div>
                  <div className="text-[11px] text-[#a1a1a6]">{c.authority}</div>
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
