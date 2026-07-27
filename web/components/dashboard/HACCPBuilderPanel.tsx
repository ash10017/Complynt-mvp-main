'use client'
import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { HACCPData } from '@/types'

interface Props {
  uid: string
  locationName?: string
  bizType?: string
  onToast: (msg: string) => void
}

const ACTIVITIES = [
  { id: 'raw_meat',   label: 'Cooking raw meat / poultry' },
  { id: 'raw_fish',   label: 'Cooking raw fish / seafood' },
  { id: 'cooling',    label: 'Cooling cooked food' },
  { id: 'reheating',  label: 'Reheating pre-cooked food' },
  { id: 'cold_prep',  label: 'Preparing cold / salad dishes' },
  { id: 'hot_hold',   label: 'Hot holding food for service' },
  { id: 'delivery',   label: 'Receiving food deliveries' },
  { id: 'ppds',       label: 'Producing pre-packed food (sandwiches etc.)' },
  { id: 'open_count', label: 'Buffet / open counters' },
]

const KITCHEN_TYPES = [
  { id: 'full',      label: 'Full production kitchen (cooking from raw)' },
  { id: 'prep',      label: 'Prep / finishing kitchen' },
  { id: 'cold',      label: 'Cold assembly kitchen (no cooking)' },
  { id: 'delivery',  label: 'Delivery / dark kitchen' },
]

const REVIEW_FREQS = [
  { id: 'annual',    label: 'Annually' },
  { id: 'biannual',  label: 'Every 6 months' },
  { id: 'quarterly', label: 'Every 3 months' },
  { id: 'change',    label: 'On menu/process change only' },
]

const inputCls = 'w-full px-3 py-2.5 rounded-[9px] border border-[#e5e5ea] bg-[#f5f5f7] text-[13px] text-[#1d1d1f] outline-none focus:border-[#0071e3] focus:bg-white transition-all'
const labelCls = 'block text-[11px] font-semibold text-[#1d1d1f] mb-1.5 uppercase tracking-wide'

function generateHACCP(data: HACCPData, bizName: string): string {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const reviewDate = new Date()
  reviewDate.setFullYear(reviewDate.getFullYear() + 1)
  const reviewStr = reviewDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  const activeActivities = ACTIVITIES.filter(a => data.activities.includes(a.id))
  const kitchenLabel = KITCHEN_TYPES.find(k => k.id === data.kitchenType)?.label || 'Full production kitchen'

  const ccps: { name: string; hazard: string; limit: string; monitor: string; corrective: string; records: string }[] = []

  if (data.activities.includes('delivery')) {
    ccps.push({
      name: 'CCP 1 — Delivery / Receipt',
      hazard: 'Biological: pathogen growth during transport; Chemical: contamination from damaged packaging',
      limit: 'Cold foods ≤ 8°C on arrival; Frozen foods ≤ −15°C; Hot foods ≥ 63°C',
      monitor: 'Probe thermometer check on every delivery; visual inspection of packaging integrity; check use-by dates',
      corrective: 'Reject delivery if temperature exceeded or packaging damaged. Record in Non-Conformance Log. Contact supplier.',
      records: 'Delivery Temperature Log',
    })
  }

  if (data.activities.includes('raw_meat') || data.activities.includes('raw_fish') || data.activities.includes('cold_prep')) {
    ccps.push({
      name: `CCP ${ccps.length + 1} — Cold Storage`,
      hazard: 'Biological: pathogen growth from inadequate refrigeration; cross-contamination from raw to ready-to-eat',
      limit: 'Refrigerators ≤ 5°C; Freezers ≤ −18°C; Raw meat stored below ready-to-eat foods; colour-coded storage',
      monitor: 'Probe or display thermometer checked minimum twice daily (opening and pre-close); recorded in writing',
      corrective: 'If above 8°C: move food, check fridge function, call engineer, assess food safety. Record action taken.',
      records: 'Temperature Monitoring Log (daily)',
    })
  }

  if (data.activities.includes('raw_meat') || data.activities.includes('raw_fish')) {
    ccps.push({
      name: `CCP ${ccps.length + 1} — Cooking`,
      hazard: 'Biological: survival of pathogens (Salmonella, E.coli, Campylobacter) due to insufficient heat treatment',
      limit: 'Core temperature ≥ 75°C (or ≥ 70°C held for 2 minutes). For whole poultry: juices run clear AND ≥ 75°C at thickest point.',
      monitor: 'Calibrated probe thermometer on every batch / critical portion; probe cleaned and disinfected between uses',
      corrective: 'If < 75°C: return to cooking. If equipment failure: discard food, tag equipment out of use, report to manager.',
      records: 'Cooking Temperature Log',
    })
  }

  if (data.activities.includes('cooling')) {
    ccps.push({
      name: `CCP ${ccps.length + 1} — Cooling`,
      hazard: 'Biological: rapid multiplication of pathogens (especially Bacillus cereus, Clostridium) during slow cooling',
      limit: 'Food cooled from 63°C to ≤ 8°C within 90 minutes. Do not place hot food directly into refrigerator.',
      monitor: 'Probe temperature at 30 and 90 minutes; divide food into shallow trays to maximise cooling rate',
      corrective: 'If not cooled to ≤ 8°C within 90 minutes: discard food immediately. Record in Non-Conformance Log.',
      records: 'Cooling Temperature Log',
    })
  }

  if (data.activities.includes('reheating')) {
    ccps.push({
      name: `CCP ${ccps.length + 1} — Reheating`,
      hazard: 'Biological: survival of vegetative pathogens; spore-forming bacteria surviving inadequate reheating',
      limit: 'Core temperature ≥ 75°C. Food may only be reheated once.',
      monitor: 'Probe thermometer on every batch; record time and temperature',
      corrective: 'If < 75°C: reheat further. Food must not be reheated a second time if already reheated — discard.',
      records: 'Reheating Temperature Log',
    })
  }

  if (data.activities.includes('hot_hold')) {
    ccps.push({
      name: `CCP ${ccps.length + 1} — Hot Holding`,
      hazard: 'Biological: pathogen growth if temperature falls below critical limit during service',
      limit: 'Food held at ≥ 63°C at all times. Discard after 2 hours if temperature cannot be maintained.',
      monitor: 'Check temperature every 2 hours during service period; record in Hot Hold Log',
      corrective: 'If < 63°C: either reheat immediately to ≥ 75°C (once only) or discard. Record reason and action taken.',
      records: 'Hot Holding Temperature Log',
    })
  }

  if (!ccps.length) {
    ccps.push({
      name: 'CCP 1 — Food Safety Control',
      hazard: 'Biological: pathogen growth from inadequate temperature control or cross-contamination',
      limit: 'Cold foods ≤ 8°C; Hot foods ≥ 63°C; Personal hygiene maintained at all times',
      monitor: 'Visual check of food condition; probe thermometer on high-risk foods; handwashing at critical points',
      corrective: 'Discard any food of questionable safety; retrain staff on procedure; document corrective action.',
      records: 'Daily Food Safety Record',
    })
  }

  return `
HACCP FOOD SAFETY MANAGEMENT SYSTEM
Safer Food Better Business (SFBB) Compliant

Business name: ${bizName || '[Business Name]'}
Prepared by: ${data.managerName || '[Manager Name]'}
Date prepared: ${today}
Review date: ${reviewStr}
Review frequency: ${REVIEW_FREQS.find(r => r.id === data.reviewFrequency)?.label || 'Annually'}
Kitchen type: ${kitchenLabel}

═══════════════════════════════════════════════════════════════════
SECTION 1 — SCOPE AND INTRODUCTION
═══════════════════════════════════════════════════════════════════

This HACCP plan has been developed in accordance with Regulation (EC) No 852/2004 on the hygiene of foodstuffs, and the Food Safety and Hygiene (England) Regulations 2013 (as amended).

This plan covers all food handling activities at ${bizName || 'the business'}, including:
${activeActivities.map(a => `  • ${a.label}`).join('\n')}

All staff handling food are trained in food hygiene procedures. This plan is reviewed ${REVIEW_FREQS.find(r => r.id === data.reviewFrequency)?.label?.toLowerCase() || 'annually'} or whenever a significant change to processes, menus, or equipment occurs.

═══════════════════════════════════════════════════════════════════
SECTION 2 — HACCP TEAM
═══════════════════════════════════════════════════════════════════

HACCP Team Leader: ${data.managerName || '[Manager Name]'}
Responsibilities: Maintaining and updating this HACCP plan; overseeing monitoring procedures; reviewing corrective actions; ensuring all food handlers are adequately trained; liaison with local authority environmental health department.

All food handlers receive Level 2 Food Hygiene training. Supervisors hold Level 3 Food Safety in Catering certification. Training records are maintained and available for inspection.

═══════════════════════════════════════════════════════════════════
SECTION 3 — PREREQUISITE PROGRAMMES
═══════════════════════════════════════════════════════════════════

The following prerequisite programmes are in place and documented separately:

  • Cleaning and disinfection schedule (daily, weekly, periodic)
  • Pest control — active contract with licensed contractor
  • Supplier approval — approved supplier list maintained
  • Staff hygiene — written policy; no jewellery, short nails, clean uniforms
  • Personal illness policy — staff excluded if vomiting, diarrhoea, jaundice, or infected skin
  • Allergen management — written allergen matrix maintained and available to customers
  • Maintenance — all equipment maintained in good repair; defects reported immediately
  • Waste management — segregated bins; food waste collected daily

═══════════════════════════════════════════════════════════════════
SECTION 4 — PROCESS FLOW DIAGRAM
═══════════════════════════════════════════════════════════════════

${data.activities.includes('delivery') ? '  RECEIPT OF DELIVERIES → CHECK TEMPERATURE & CONDITION\n          ↓' : ''}
  STORAGE (cold ≤ 5°C / dry / frozen ≤ −18°C)
          ↓
  PREPARATION (cross-contamination prevention)
          ↓
${data.activities.includes('raw_meat') || data.activities.includes('raw_fish') ? '  COOKING (≥ 75°C core temperature)\n          ↓' : ''}
${data.activities.includes('cooling') ? '  COOLING (63°C to ≤ 8°C within 90 min)\n          ↓' : ''}
${data.activities.includes('hot_hold') ? '  HOT HOLDING (≥ 63°C)\n          ↓' : ''}
  SERVICE / PLATING / PACKAGING
          ↓
  CUSTOMER / SALE

═══════════════════════════════════════════════════════════════════
SECTION 5 — HAZARD ANALYSIS AND CRITICAL CONTROL POINTS
═══════════════════════════════════════════════════════════════════

${ccps.map(ccp => `
${'─'.repeat(67)}
${ccp.name}
${'─'.repeat(67)}

Hazards identified:
${ccp.hazard}

Critical limit(s):
${ccp.limit}

Monitoring procedure:
${ccp.monitor}

Corrective action:
${ccp.corrective}

Records:
${ccp.records}
`).join('\n')}

═══════════════════════════════════════════════════════════════════
SECTION 6 — ALLERGEN MANAGEMENT
═══════════════════════════════════════════════════════════════════

This business operates under Natasha's Law (Food Information (Amendment) (England) Regulations 2021). A written allergen matrix covering all 14 regulated allergens is maintained and updated whenever menu items or ingredients change.

All staff are trained in the 14 allergens. Front-of-house staff can direct customers to written allergen information before ordering. Allergen-free meals are prepared using dedicated equipment and separate preparation areas where possible.

═══════════════════════════════════════════════════════════════════
SECTION 7 — VERIFICATION
═══════════════════════════════════════════════════════════════════

This HACCP plan is verified through:

  1. Daily: Review of monitoring records by manager / supervisor
  2. Weekly: Management review of corrective action log; check records are complete and signed
  3. Monthly: Random temperature probe audit; cleaning schedule spot-check; staff hygiene observation
  4. Annually (or on change): Full HACCP review and update by HACCP Team Leader

═══════════════════════════════════════════════════════════════════
SECTION 8 — RECORD KEEPING
═══════════════════════════════════════════════════════════════════

The following records are maintained and available for inspection:

  • Temperature monitoring logs (retained minimum 3 months, target 12 months)
  • Cleaning and disinfection records (retained 3 months)
  • Corrective action log (retained 12 months)
  • Delivery records (retained 3 months)
  • Staff training records (retained for duration of employment + 2 years)
  • Allergen matrix (current version always available)
  • Pest control reports (retained 12 months)
  • Supplier invoices (retained 3 months)

All records are kept securely on the premises and made available to authorised enforcement officers on request.

═══════════════════════════════════════════════════════════════════
SIGN-OFF
═══════════════════════════════════════════════════════════════════

I confirm that this HACCP plan accurately reflects the food safety management procedures at ${bizName || 'the business'}. All staff have been trained in the procedures described and are aware of their individual responsibilities.

Signed: ___________________________________

Name (print): ${data.managerName || '________________________________'}

Job title: ___________________________________

Date: ${today}

Next review date: ${reviewStr}
`
}

export default function HACCPBuilderPanel({ uid, locationName, bizType, onToast }: Props) {
  const [step,      setStep]      = useState(0)
  const [saved,     setSaved]     = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [loadExist, setLoadExist] = useState<HACCPData | null>(null)
  const [showDoc,   setShowDoc]   = useState(false)
  const printRef = useRef<HTMLPreElement>(null)

  const [bizName,         setBizName]         = useState(locationName || '')
  const [kitchenType,     setKitchenType]     = useState('full')
  const [activities,      setActivities]      = useState<string[]>(['raw_meat', 'delivery', 'cooling'])
  const [managerName,     setManagerName]     = useState('')
  const [reviewFrequency, setReviewFrequency] = useState('annual')

  useEffect(() => {
    getDoc(doc(db, 'users', uid)).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        if (d.haccpData) {
          setLoadExist(d.haccpData as HACCPData)
          setActivities(d.haccpData.activities || activities)
          setKitchenType(d.haccpData.kitchenType || 'full')
          setManagerName(d.haccpData.managerName || '')
          setReviewFrequency(d.haccpData.reviewFrequency || 'annual')
          setSaved(true)
        }
        if (d.locationName && !bizName) setBizName(d.locationName)
      }
    }).catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  const toggleActivity = (id: string) =>
    setActivities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])

  const haccpData: HACCPData = {
    updatedAt: new Date().toISOString(),
    bizType: bizType || '',
    kitchenType,
    activities,
    managerName,
    reviewFrequency,
  }

  const handleSave = async () => {
    setSaving(true)
    await updateDoc(doc(db, 'users', uid), { haccpData }).catch(() => {})
    setSaving(false)
    setSaved(true)
    setShowDoc(true)
    onToast('HACCP plan saved ✓')
  }

  const handlePrint = () => {
    const el = printRef.current
    if (!el) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>HACCP Plan — ${bizName || 'Food Business'}</title>
    <style>
      body { font-family: monospace; font-size: 12px; padding: 32px; color: #1d1d1f; line-height: 1.7; max-width: 800px; margin: 0 auto; }
      h1 { font-size: 15px; }
      pre { white-space: pre-wrap; font-family: inherit; font-size: 12px; }
      @media print { body { padding: 16px; } }
    </style></head><body><pre>${el.textContent}</pre></body></html>`)
    w.document.close()
    w.print()
  }

  const STEPS = [
    'Business details',
    'Kitchen activities',
    'Management',
    'Generate plan',
  ]

  return (
    <div className="p-5 flex-1">
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[13px] text-[#a1a1a6]">Generate an EHO-ready HACCP plan tailored to your kitchen in minutes. Consultants charge £500–£2,000 for this.</p>
        </div>
        {saved && (
          <button
            onClick={() => setShowDoc(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0071e3] text-white rounded-[9px] text-[13px] font-semibold border-0 cursor-pointer hover:bg-[#0058b0] transition-colors shrink-0"
          >
            {showDoc ? 'Edit plan' : 'View plan'}
          </button>
        )}
      </div>

      {showDoc ? (
        /* Document view */
        <div>
          <div className="flex gap-2 mb-4">
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0071e3] text-white rounded-[9px] text-[13px] font-semibold border-0 cursor-pointer hover:bg-[#0058b0] transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print / Download PDF
            </button>
            <button onClick={() => setShowDoc(false)} className="px-3.5 py-2 border border-[#e5e5ea] rounded-[9px] text-[13px] text-[#6e6e73] cursor-pointer bg-white hover:bg-[#f5f5f7] transition-colors">
              Edit plan
            </button>
          </div>
          <div className="bg-white border border-[#e5e5ea] rounded-[14px] p-5 overflow-x-auto">
            <pre
              ref={printRef}
              className="text-[12px] text-[#1d1d1f] whitespace-pre-wrap font-mono leading-relaxed"
            >
              {generateHACCP(haccpData, bizName)}
            </pre>
          </div>
        </div>
      ) : (
        /* Wizard */
        <div className="max-w-[600px]">
          {/* step indicator */}
          <div className="flex items-center gap-1 mb-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${i === step ? 'bg-[#0071e3] text-white' : i < step ? 'bg-[#34c759] text-white' : 'bg-[#e5e5ea] text-[#a1a1a6]'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div className={`text-[11px] font-medium ${i === step ? 'text-[#0071e3]' : i < step ? 'text-[#34c759]' : 'text-[#a1a1a6]'}`}>{s}</div>
                {i < STEPS.length - 1 && <div className="flex-1 h-px bg-[#e5e5ea] mx-1" />}
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#e5e5ea] rounded-[16px] p-5">

            {/* Step 0: Business details */}
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[15px] font-bold text-[#1d1d1f]">Business details</h3>
                <div>
                  <label className={labelCls}>Business / location name *</label>
                  <input className={inputCls} placeholder="e.g. The Crown & Kitchen" value={bizName} onChange={e => setBizName(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Kitchen type</label>
                  <select className={inputCls} value={kitchenType} onChange={e => setKitchenType(e.target.value)}>
                    {KITCHEN_TYPES.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* Step 1: Activities */}
            {step === 1 && (
              <div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1">Food preparation activities</h3>
                <p className="text-[12px] text-[#a1a1a6] mb-4">Select everything your kitchen does. This determines which Critical Control Points appear in your plan.</p>
                <div className="flex flex-col gap-2">
                  {ACTIVITIES.map(a => (
                    <label key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer hover:bg-[#f5f5f7] transition-colors">
                      <input
                        type="checkbox"
                        checked={activities.includes(a.id)}
                        onChange={() => toggleActivity(a.id)}
                        className="w-4 h-4 accent-[#0071e3] cursor-pointer"
                      />
                      <span className="text-[13px] text-[#1d1d1f]">{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Management */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[15px] font-bold text-[#1d1d1f]">Management details</h3>
                <div>
                  <label className={labelCls}>HACCP Team Leader / Manager name</label>
                  <input className={inputCls} placeholder="Full name" value={managerName} onChange={e => setManagerName(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Plan review frequency</label>
                  <select className={inputCls} value={reviewFrequency} onChange={e => setReviewFrequency(e.target.value)}>
                    {REVIEW_FREQS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <div className="bg-[#f0f7ff] border border-[#b8d8ff] rounded-[10px] p-3 text-[12px] text-[#1d4a8a]">
                  <strong>Tip:</strong> The FSA recommends reviewing your HACCP plan at least annually, or whenever you change your menu, suppliers, equipment, or premises layout.
                </div>
              </div>
            )}

            {/* Step 3: Generate */}
            {step === 3 && (
              <div>
                <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-3">Ready to generate your HACCP plan</h3>
                <div className="flex flex-col gap-2 mb-4">
                  {[
                    { label: 'Business', value: bizName || '(not set)' },
                    { label: 'Kitchen type', value: KITCHEN_TYPES.find(k => k.id === kitchenType)?.label },
                    { label: 'Activities', value: `${activities.length} selected` },
                    { label: 'Manager', value: managerName || '(not set)' },
                    { label: 'Review', value: REVIEW_FREQS.find(r => r.id === reviewFrequency)?.label },
                    { label: 'CCPs generated', value: (() => {
                      let n = 0
                      if (activities.includes('delivery')) n++
                      if (activities.some(a => ['raw_meat', 'raw_fish', 'cold_prep'].includes(a))) n++
                      if (activities.some(a => ['raw_meat', 'raw_fish'].includes(a))) n++
                      if (activities.includes('cooling')) n++
                      if (activities.includes('reheating')) n++
                      if (activities.includes('hot_hold')) n++
                      return n > 0 ? `${n} critical control points` : '1 (general food safety)'
                    })() },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-[#f0f0f5] text-[13px]">
                      <span className="text-[#6e6e73]">{r.label}</span>
                      <span className="font-semibold text-[#1d1d1f]">{r.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[10px] p-3 mb-4 text-[12px] text-[#78350f]">
                  Your HACCP plan will be saved to your account and can be updated at any time. Print it and keep a physical copy on your premises for EHO inspections.
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 bg-[#0071e3] text-white border-0 rounded-[11px] text-[15px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors disabled:opacity-60"
                >
                  {saving ? 'Generating…' : 'Generate & save my HACCP plan →'}
                </button>
              </div>
            )}

            {/* Navigation */}
            {step < 3 && (
              <div className="flex gap-2 mt-5 pt-4 border-t border-[#f0f0f5]">
                {step > 0 && (
                  <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 border border-[#e5e5ea] rounded-[9px] text-[13px] text-[#6e6e73] cursor-pointer bg-white hover:bg-[#f5f5f7] transition-colors">
                    ← Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (step === 0 && !bizName.trim()) { onToast('Please enter your business name'); return }
                    if (step === 1 && activities.length === 0) { onToast('Please select at least one activity'); return }
                    setStep(s => s + 1)
                  }}
                  className="flex-1 py-2 bg-[#0071e3] text-white border-0 rounded-[9px] text-[14px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
