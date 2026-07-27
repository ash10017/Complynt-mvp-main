'use client'
import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { TemperatureLog } from '@/types'

interface Props {
  uid: string
  locationName?: string
  onToast: (msg: string) => void
}

type ProbeType = TemperatureLog['probe']

const PROBE_CONFIG: Record<ProbeType, { label: string; range: string; passTest: (t: number) => boolean }> = {
  fridge:   { label: 'Refrigerator',  range: '1°C – 8°C',   passTest: t => t >= 1 && t <= 8 },
  freezer:  { label: 'Freezer',       range: '≤ −15°C',      passTest: t => t <= -15 },
  hot_hold: { label: 'Hot Holding',   range: '≥ 63°C',       passTest: t => t >= 63 },
  delivery: { label: 'Delivery',      range: '≤ 8°C',        passTest: t => t <= 8 },
  cooking:  { label: 'Cooking',       range: '≥ 75°C',       passTest: t => t >= 75 },
}

const inputCls = 'w-full px-3 py-2.5 rounded-[9px] border border-[#e5e5ea] bg-[#f5f5f7] text-[13px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:bg-white transition-all'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5)
}
function uid6() {
  return Math.random().toString(36).slice(2, 8)
}

function groupByDate(logs: TemperatureLog[]): Record<string, TemperatureLog[]> {
  return logs.reduce<Record<string, TemperatureLog[]>>((acc, log) => {
    ;(acc[log.date] = acc[log.date] || []).push(log)
    return acc
  }, {})
}

export default function TemperatureLogsPanel({ uid, locationName, onToast }: Props) {
  const [logs,       setLogs]       = useState<TemperatureLog[]>([])
  const [loading,    setLoading]    = useState(true)
  const [saving,     setSaving]     = useState(false)
  const [showForm,   setShowForm]   = useState(false)
  const [daysShown,  setDaysShown]  = useState(7)
  const printRef = useRef<HTMLDivElement>(null)

  // form state
  const [probe,       setProbe]       = useState<ProbeType>('fridge')
  const [label,       setLabel]       = useState('')
  const [tempC,       setTempC]       = useState('')
  const [recordedBy,  setRecordedBy]  = useState('')
  const [corrective,  setCorrective]  = useState('')
  const [date,        setDate]        = useState(todayStr())
  const [time,        setTime]        = useState(nowTime())

  useEffect(() => {
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        setLogs(Array.isArray(d.temperatureLogs) ? d.temperatureLogs : [])
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [uid])

  const saveLogs = async (next: TemperatureLog[]) => {
    const trimmed = next.slice(-300)
    await updateDoc(doc(db, 'users', uid), { temperatureLogs: trimmed }).catch(() => {})
    setLogs(trimmed)
  }

  const handleAdd = async () => {
    const t = parseFloat(tempC)
    if (isNaN(t)) { onToast('Please enter a valid temperature'); return }
    setSaving(true)
    const entry: TemperatureLog = {
      id: uid6(),
      date,
      time,
      probe,
      label: label || PROBE_CONFIG[probe].label,
      tempC: t,
      pass: PROBE_CONFIG[probe].passTest(t),
      corrective: corrective || undefined,
      recordedBy,
    }
    await saveLogs([...logs, entry])
    setTempC('')
    setCorrective('')
    setTime(nowTime())
    setDate(todayStr())
    setSaving(false)
    setShowForm(false)
    onToast(entry.pass ? 'Reading saved — PASS ✓' : 'Reading saved — FAIL (corrective action required)')
  }

  const handleDelete = async (id: string) => {
    await saveLogs(logs.filter(l => l.id !== id))
    onToast('Entry deleted')
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysShown)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  const visibleLogs = logs.filter(l => l.date >= cutoffStr).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
  const grouped = groupByDate(visibleLogs)
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))
  const todayLogs = logs.filter(l => l.date === todayStr())
  const passRate = logs.length ? Math.round(logs.filter(l => l.pass).length / logs.length * 100) : 100

  const handlePrint = () => {
    const el = printRef.current
    if (!el) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>Temperature Log — ${locationName || 'Food Business'}</title>
    <style>
      body { font-family: -apple-system, sans-serif; padding: 24px; color: #1d1d1f; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      p.sub { color: #6e6e73; font-size: 12px; margin: 0 0 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #f5f5f7; text-align: left; padding: 8px 10px; border: 1px solid #e5e5ea; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
      td { padding: 8px 10px; border: 1px solid #e5e5ea; }
      .pass { color: #1a7a34; font-weight: 600; }
      .fail { color: #b80000; font-weight: 600; }
      .date-head { background: #f5f5f7; font-weight: 700; padding: 8px 10px; }
      @media print { body { padding: 12px; } }
    </style></head><body>`)
    w.document.write(el.innerHTML)
    w.document.write('</body></html>')
    w.document.close()
    w.print()
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-40">
        <div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 flex-1">

      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] text-[#a1a1a6]">Record fridge, freezer, cooking and hot-hold temperatures for EHO compliance.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] border border-[#e5e5ea] text-[13px] text-[#6e6e73] font-medium bg-white hover:bg-[#f5f5f7] cursor-pointer transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print / Export
          </button>
          <button
            onClick={() => { setShowForm(v => !v); setProbe('fridge'); setLabel(''); setTempC(''); setCorrective(''); setDate(todayStr()); setTime(nowTime()) }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0071e3] text-white rounded-[9px] text-[13px] font-semibold hover:bg-[#0058b0] transition-colors border-0 cursor-pointer"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Reading
          </button>
        </div>
      </div>

      {/* stat row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white border border-[#e5e5ea] rounded-[12px] p-4">
          <div className="text-[22px] font-bold text-[#1d1d1f]">{todayLogs.length}</div>
          <div className="text-[11px] text-[#a1a1a6]">Readings today</div>
        </div>
        <div className="bg-white border border-[#e5e5ea] rounded-[12px] p-4">
          <div className="text-[22px] font-bold" style={{ color: passRate >= 95 ? '#1a7a34' : passRate >= 80 ? '#8a4d00' : '#b80000' }}>{passRate}%</div>
          <div className="text-[11px] text-[#a1a1a6]">Pass rate (all time)</div>
        </div>
        <div className="bg-white border border-[#e5e5ea] rounded-[12px] p-4">
          <div className="text-[22px] font-bold text-[#1d1d1f]">{logs.filter(l => !l.pass).length}</div>
          <div className="text-[11px] text-[#a1a1a6]">Failures recorded</div>
        </div>
      </div>

      {/* add form */}
      {showForm && (
        <div className="bg-white border border-[#0071e3] rounded-[14px] p-5 mb-4">
          <div className="text-[14px] font-bold text-[#1d1d1f] mb-4">New Temperature Reading</div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#1d1d1f] mb-1 uppercase tracking-wide">Probe type</label>
              <select className={inputCls} value={probe} onChange={e => { setProbe(e.target.value as ProbeType); setLabel('') }}>
                {Object.entries(PROBE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label} ({v.range})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#1d1d1f] mb-1 uppercase tracking-wide">Location / Equipment label</label>
              <input className={inputCls} placeholder={`e.g. ${PROBE_CONFIG[probe].label} 1`} value={label} onChange={e => setLabel(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#1d1d1f] mb-1 uppercase tracking-wide">Temperature (°C) *</label>
              <input className={inputCls} type="number" step="0.1" placeholder="e.g. 4.2" value={tempC} onChange={e => setTempC(e.target.value)} />
              <div className="text-[11px] text-[#a1a1a6] mt-1">Target: {PROBE_CONFIG[probe].range}</div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#1d1d1f] mb-1 uppercase tracking-wide">Recorded by</label>
              <input className={inputCls} placeholder="Staff name" value={recordedBy} onChange={e => setRecordedBy(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#1d1d1f] mb-1 uppercase tracking-wide">Date</label>
              <input className={inputCls} type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#1d1d1f] mb-1 uppercase tracking-wide">Time</label>
              <input className={inputCls} type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>
          {tempC && !PROBE_CONFIG[probe].passTest(parseFloat(tempC)) && (
            <div>
              <label className="block text-[11px] font-semibold text-[#b80000] mb-1 uppercase tracking-wide">Corrective action taken (required for failures)</label>
              <input className={`${inputCls} border-[#ff3b30]`} placeholder="e.g. Moved food to backup fridge, engineer called" value={corrective} onChange={e => setCorrective(e.target.value)} />
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={saving || !tempC}
              className="px-4 py-2 bg-[#0071e3] text-white border-0 rounded-[9px] text-[13px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save reading'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#e5e5ea] rounded-[9px] text-[13px] text-[#6e6e73] cursor-pointer bg-white hover:bg-[#f5f5f7] transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* EHO guidance box */}
      <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[12px] p-3.5 mb-4 text-[12px] text-[#78350f]">
        <strong>EHO requirement:</strong> Refrigerators should be checked at least <strong>twice daily</strong> (opening and before close). All temperature checks must be recorded, signed, and dated. Retain records for at least 3 months — EHOs often request 6 months.
      </div>

      {/* log filters */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[12px] text-[#6e6e73]">Show last:</span>
        {[7, 14, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setDaysShown(d)}
            className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium border cursor-pointer transition-colors ${
              daysShown === d ? 'bg-[#0071e3] text-white border-[#0071e3]' : 'bg-white text-[#6e6e73] border-[#e5e5ea] hover:bg-[#f5f5f7]'
            }`}
          >
            {d} days
          </button>
        ))}
      </div>

      {/* log list */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-14 text-[#a1a1a6]">
          <div className="text-[32px] mb-2">🌡</div>
          <div className="text-[14px] font-medium text-[#6e6e73] mb-1">No readings yet</div>
          <div className="text-[12px]">Add your first temperature reading above.</div>
        </div>
      ) : (
        <div className="bg-white border border-[#e5e5ea] rounded-[14px] overflow-hidden">
          {sortedDates.map((date, di) => (
            <div key={date}>
              <div className="px-4 py-2 bg-[#f5f5f7] border-b border-[#e5e5ea] text-[11px] font-bold text-[#6e6e73] uppercase tracking-wide">
                {date === todayStr() ? 'Today' : new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                <span className="ml-2 font-normal text-[#a1a1a6]">({grouped[date].length} reading{grouped[date].length !== 1 ? 's' : ''})</span>
              </div>
              {grouped[date].map((log, li) => (
                <div key={log.id} className={`flex items-center gap-3 px-4 py-3 ${di + li > 0 || li > 0 ? 'border-t border-[#e5e5ea]' : ''}`}>
                  <div className="shrink-0 text-center w-[38px]">
                    <div className={`text-[15px] font-extrabold ${log.pass ? 'text-[#1a7a34]' : 'text-[#b80000]'}`}>
                      {log.tempC > 0 ? '+' : ''}{log.tempC}°
                    </div>
                    <div className={`text-[9px] font-bold uppercase tracking-wider ${log.pass ? 'text-[#34c759]' : 'text-[#ff3b30]'}`}>
                      {log.pass ? 'PASS' : 'FAIL'}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-[#1d1d1f]">{log.label}</span>
                      <span className="text-[10px] text-[#a1a1a6] px-1.5 py-0.5 bg-[#f5f5f7] rounded-full">{PROBE_CONFIG[log.probe].label}</span>
                    </div>
                    <div className="text-[11px] text-[#a1a1a6] mt-0.5">
                      {log.time} · {log.recordedBy || 'Not specified'}
                      {!log.pass && log.corrective && <span className="text-[#8a4d00] ml-1.5">Action: {log.corrective}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-[#a1a1a6] hover:text-[#ff3b30] bg-transparent border-0 cursor-pointer transition-colors p-1 shrink-0"
                    title="Delete entry"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* hidden print target */}
      <div ref={printRef} className="hidden">
        <h1>Temperature Log — {locationName || 'Food Business'}</h1>
        <p className="sub">Printed {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {logs.length} total records · {passRate}% pass rate</p>
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Time</th><th>Probe</th><th>Location</th><th>Temp (°C)</th><th>Result</th><th>Recorded by</th><th>Corrective action</th>
            </tr>
          </thead>
          <tbody>
            {[...logs].reverse().map(l => (
              <tr key={l.id}>
                <td>{new Date(l.date + 'T00:00:00').toLocaleDateString('en-GB')}</td>
                <td>{l.time}</td>
                <td>{PROBE_CONFIG[l.probe].label}</td>
                <td>{l.label}</td>
                <td>{l.tempC > 0 ? '+' : ''}{l.tempC}°C</td>
                <td className={l.pass ? 'pass' : 'fail'}>{l.pass ? 'PASS' : 'FAIL'}</td>
                <td>{l.recordedBy || '—'}</td>
                <td>{l.corrective || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
