'use client'
import { useState } from 'react'

interface Props {
  onToast: (msg: string) => void
}

interface Question {
  id: string
  section: number
  sectionName: string
  question: string
  tip?: string
  options: { text: string; score: number }[]
}

const QUESTIONS: Question[] = [
  // ── Section 1: Hygienic Food Handling (40% of FHRS weight) ──────────────
  {
    id: 'q1', section: 1, sectionName: 'Hygienic Food Handling',
    question: 'How are raw and ready-to-eat foods stored in your kitchen?',
    tip: 'This is the most commonly failed item. Raw meat must always be stored below ready-to-eat foods.',
    options: [
      { text: 'Raw meat always below ready-to-eat; colour-coded boards used consistently by all staff', score: 0 },
      { text: 'Generally correct — occasional lapses, but staff are aware', score: 5 },
      { text: 'Colour coding not always enforced; raw and ready-to-eat sometimes on same shelf', score: 10 },
      { text: 'No formalised separation practices in place', score: 20 },
    ],
  },
  {
    id: 'q2', section: 1, sectionName: 'Hygienic Food Handling',
    question: 'How do you monitor and record food temperatures?',
    tip: 'EHOs look for calibrated probe thermometers and written records — not just verbal assurances.',
    options: [
      { text: 'Calibrated probe thermometer, written temperature records maintained at least twice daily', score: 0 },
      { text: 'Regular checks made but not always recorded in writing', score: 5 },
      { text: 'Occasional spot checks with no systematic recording', score: 10 },
      { text: 'No regular temperature monitoring in place', score: 20 },
    ],
  },
  {
    id: 'q3', section: 1, sectionName: 'Hygienic Food Handling',
    question: 'Staff personal hygiene and handwashing compliance?',
    options: [
      { text: 'Handwashing enforced at all critical points; dedicated sinks always stocked with soap and paper towels', score: 0 },
      { text: 'Generally good; minor lapses addressed when observed', score: 5 },
      { text: 'Poor compliance or facilities inadequate / not always stocked', score: 12 },
      { text: 'No handwashing policy enforced', score: 20 },
    ],
  },
  // ── Section 2: Structure and Cleanliness (30% weight) ────────────────────
  {
    id: 'q4', section: 2, sectionName: 'Structure & Cleanliness',
    question: 'Overall cleanliness and physical condition of food preparation areas?',
    options: [
      { text: 'Very clean; all surfaces, equipment and storage areas in good repair', score: 0 },
      { text: 'Generally clean with minor soiling or isolated areas of wear', score: 5 },
      { text: 'Some areas of visible dirt, damage, or difficult-to-clean surfaces', score: 12 },
      { text: 'Significantly dirty; multiple areas of disrepair or structural failure', score: 20 },
    ],
  },
  {
    id: 'q5', section: 2, sectionName: 'Structure & Cleanliness',
    question: 'Pest control measures in place?',
    tip: 'A single rodent dropping in a food area is grounds for immediate closure.',
    options: [
      { text: 'Active contract with a licensed pest control company; no evidence of pests', score: 0 },
      { text: 'No current contract but no evidence of pest activity', score: 5 },
      { text: 'Some historical evidence; reactive measures taken but no contract', score: 12 },
      { text: 'Evidence of active pest activity in food areas', score: 20 },
    ],
  },
  {
    id: 'q6', section: 2, sectionName: 'Structure & Cleanliness',
    question: 'Ventilation, lighting, and handwashing facility adequacy?',
    options: [
      { text: 'All facilities fully adequate and functional; ventilation regularly cleaned', score: 0 },
      { text: 'Minor issues with one area — being addressed', score: 5 },
      { text: 'Significant deficiency in ventilation, lighting, or wash-hand basins', score: 10 },
    ],
  },
  // ── Section 3: Confidence in Management (30% weight) ────────────────────
  {
    id: 'q7', section: 3, sectionName: 'Confidence in Management',
    question: 'HACCP food safety management plan and supporting records?',
    tip: 'This is the highest-weighted individual criterion. An EHO will spend 30% of their visit on your paperwork.',
    options: [
      { text: 'Complete, up-to-date HACCP plan with signed monitoring records and corrective action log', score: 0 },
      { text: 'HACCP plan exists but records are incomplete, unsigned, or more than 12 months old', score: 5 },
      { text: 'Some food safety records kept but no formal HACCP plan documented', score: 12 },
      { text: 'No food safety management documentation in place', score: 20 },
    ],
  },
  {
    id: 'q8', section: 3, sectionName: 'Confidence in Management',
    question: 'Staff food hygiene training records?',
    options: [
      { text: 'All food handlers have valid Level 2 Food Hygiene certificates on file with expiry dates tracked', score: 0 },
      { text: 'Most staff trained; some certificates expired or new starters awaiting training', score: 5 },
      { text: 'Minimal formal training; no certificates retained on file', score: 10 },
    ],
  },
  {
    id: 'q9', section: 3, sectionName: 'Confidence in Management',
    question: "Allergen management (Natasha's Law compliance)?",
    tip: "Allergen violations carry criminal liability — EHOs treat this as a serious risk regardless of business size.",
    options: [
      { text: 'Full written allergen matrix; all 14 allergens documented per dish; staff trained and information available to customers', score: 0 },
      { text: 'Allergen information maintained but not always written; staff verbally informed', score: 5 },
      { text: 'No formal allergen management — verbal assurances only', score: 10 },
    ],
  },
  {
    id: 'q10', section: 3, sectionName: 'Confidence in Management',
    question: 'Food business registration with local authority?',
    tip: 'Registration is required at least 28 days before trading. It is free and does not expire.',
    options: [
      { text: 'Registered; confirmation letter from local authority on file', score: 0 },
      { text: 'Applied within the last 28 days — awaiting confirmation', score: 3 },
      { text: 'Not registered', score: 20 },
    ],
  },
]

const SECTION_NAMES = ['Hygienic Food Handling', 'Structure & Cleanliness', 'Confidence in Management']

function getRating(total: number): { stars: number; label: string; color: string; advice: string } {
  if (total <= 5)   return { stars: 5, label: 'Very Good (5 stars likely)', color: '#1a7a34', advice: 'Your business is well-prepared for an EHO inspection. Maintain your current standards and keep records current.' }
  if (total <= 15)  return { stars: 4, label: 'Good (4 stars likely)',       color: '#34c759', advice: 'Strong performance. Address any minor gaps and you could achieve a 5-star rating at next inspection.' }
  if (total <= 30)  return { stars: 3, label: 'Generally Satisfactory (3 stars likely)', color: '#ff9f0a', advice: 'Some significant improvements needed before the next inspection. Focus on HACCP documentation and temperature monitoring.' }
  if (total <= 55)  return { stars: 2, label: 'Improvement Necessary (2 stars likely)', color: '#ff6b00', advice: 'Serious improvements required. An EHO may issue a Hygiene Improvement Notice. A rating below 3 must be displayed in Wales.' }
  if (total <= 80)  return { stars: 1, label: 'Major Improvement Necessary (1 star likely)', color: '#ff3b30', advice: 'Urgent action needed. Risk of Prohibition Notice. Delivery platforms may delist you. Seek professional food safety advice immediately.' }
  return { stars: 0, label: 'Urgent Improvement Necessary (0 stars likely)', color: '#b80000', advice: 'Critical food safety failures identified. An EHO may close your business with immediate effect. Engage a food safety consultant today.' }
}

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="24" height="24" viewBox="0 0 24 24" fill={n <= stars ? '#ff9f0a' : '#e5e5ea'} stroke={n <= stars ? '#ff9f0a' : '#d2d2d7'} strokeWidth="1.5" strokeLinecap="round">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      ))}
    </div>
  )
}

export default function EHOSimulatorPanel({ onToast }: Props) {
  const [phase,    setPhase]    = useState<'intro' | 'quiz' | 'results'>('intro')
  const [current,  setCurrent]  = useState(0)
  const [answers,  setAnswers]  = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<number | null>(null)

  const q = QUESTIONS[current]
  const totalQ = QUESTIONS.length

  const handleSelect = (score: number) => setSelected(score)

  const handleNext = () => {
    if (selected === null) { onToast('Please select an answer'); return }
    setAnswers(prev => ({ ...prev, [q.id]: selected }))
    setSelected(null)
    if (current < totalQ - 1) {
      setCurrent(prev => prev + 1)
    } else {
      setPhase('results')
    }
  }

  const totalScore = Object.values(answers).reduce((s, v) => s + v, 0)
  const rating = getRating(totalScore)

  const failedQuestions = QUESTIONS.filter(q => (answers[q.id] ?? 0) >= 10)

  const sectionScores = [1, 2, 3].map(sec => {
    const qs = QUESTIONS.filter(q => q.section === sec)
    const score = qs.reduce((s, q) => s + (answers[q.id] ?? 0), 0)
    const max = qs.reduce((s, q) => s + Math.max(...q.options.map(o => o.score)), 0)
    return { name: SECTION_NAMES[sec - 1], score, max, pct: max > 0 ? Math.round(score / max * 100) : 0 }
  })

  const restart = () => { setPhase('intro'); setCurrent(0); setAnswers({}); setSelected(null) }

  if (phase === 'intro') {
    return (
      <div className="p-5 flex-1 max-w-[680px]">
        <div className="bg-white border border-[#e5e5ea] rounded-[18px] p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#e8f2ff] rounded-[12px] flex items-center justify-center text-[#0071e3] shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#1d1d1f]">EHO Inspection Simulator</h2>
              <p className="text-[12px] text-[#6e6e73]">10 questions · ~4 minutes · Based on actual FHRS scoring criteria</p>
            </div>
          </div>
          <p className="text-[14px] text-[#3a3a3c] leading-relaxed mb-4">
            This simulator mirrors how an Environmental Health Officer (EHO) assesses your business for the Food Hygiene Rating Scheme (FHRS). Answer honestly to get a realistic prediction of your current rating — and a prioritised action plan to improve it.
          </p>
          <div className="flex flex-col gap-2 mb-5">
            {[
              { label: 'Hygienic Food Handling', desc: 'Storage, temperature control, personal hygiene', weight: '40%' },
              { label: 'Structure & Cleanliness', desc: 'Facilities condition, pest control, ventilation', weight: '30%' },
              { label: 'Confidence in Management', desc: 'HACCP, training records, allergen management', weight: '30%' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 px-3 py-2.5 bg-[#f5f5f7] rounded-[10px]">
                <div className="w-1 h-8 rounded-full bg-[#0071e3] shrink-0" />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-[#1d1d1f]">{s.label}</div>
                  <div className="text-[11px] text-[#a1a1a6]">{s.desc}</div>
                </div>
                <div className="text-[12px] font-bold text-[#0071e3] shrink-0">{s.weight}</div>
              </div>
            ))}
          </div>
          <div className="bg-[#fffbeb] border border-[#fde68a] rounded-[10px] p-3 mb-5 text-[12px] text-[#78350f]">
            This is a self-assessment tool and an estimate only. Only an actual EHO inspection determines your official FHRS rating. Answer as honestly as possible for the most useful results.
          </div>
          <button
            onClick={() => setPhase('quiz')}
            className="w-full py-3 bg-[#0071e3] text-white border-0 rounded-[11px] text-[15px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors"
          >
            Start simulation →
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'quiz') {
    const progressPct = (current / totalQ) * 100
    const sectionNow = q.section
    const prevSection = current > 0 ? QUESTIONS[current - 1].section : sectionNow
    const sectionChanged = current > 0 && sectionNow !== prevSection

    return (
      <div className="p-5 flex-1 max-w-[680px]">
        {/* progress */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-1.5 rounded-full bg-[#e5e5ea] overflow-hidden">
            <div className="h-full bg-[#0071e3] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-[12px] text-[#a1a1a6] shrink-0">{current + 1} / {totalQ}</span>
        </div>

        {sectionChanged && (
          <div className="mb-3 px-3 py-1.5 bg-[#e8f2ff] border border-[#b8d8ff] rounded-[8px] text-[12px] font-semibold text-[#0071e3]">
            Section {sectionNow}: {SECTION_NAMES[sectionNow - 1]}
          </div>
        )}
        {current === 0 && (
          <div className="mb-3 px-3 py-1.5 bg-[#e8f2ff] border border-[#b8d8ff] rounded-[8px] text-[12px] font-semibold text-[#0071e3]">
            Section 1: {SECTION_NAMES[0]}
          </div>
        )}

        <div className="bg-white border border-[#e5e5ea] rounded-[18px] p-6">
          <h3 className="text-[16px] font-bold text-[#1d1d1f] mb-2 leading-snug">{q.question}</h3>
          {q.tip && (
            <div className="mb-4 px-3 py-2.5 bg-[#fffbeb] border border-[#fde68a] rounded-[9px] text-[12px] text-[#78350f]">
              <strong>EHO focus:</strong> {q.tip}
            </div>
          )}

          <div className="flex flex-col gap-2 mb-5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelect(opt.score)}
                className={`w-full text-left px-4 py-3 rounded-[11px] border-2 text-[13px] cursor-pointer transition-all ${
                  selected === opt.score
                    ? 'border-[#0071e3] bg-[#e8f2ff] text-[#1d1d1f] font-medium'
                    : 'border-[#e5e5ea] bg-[#fafafa] text-[#3a3a3c] hover:border-[#0071e3] hover:bg-[#f0f7ff]'
                }`}
              >
                {opt.text}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {current > 0 && (
              <button
                onClick={() => { setCurrent(prev => prev - 1); setSelected(answers[QUESTIONS[current - 1].id] ?? null) }}
                className="px-4 py-2.5 border border-[#e5e5ea] rounded-[9px] text-[13px] text-[#6e6e73] cursor-pointer bg-white hover:bg-[#f5f5f7] transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={selected === null}
              className="flex-1 py-2.5 bg-[#0071e3] text-white border-0 rounded-[9px] text-[14px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {current < totalQ - 1 ? 'Next →' : 'See results →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // results
  return (
    <div className="p-5 flex-1 max-w-[720px]">
      {/* Rating card */}
      <div className="bg-white border-2 rounded-[18px] p-6 mb-4" style={{ borderColor: rating.color }}>
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <StarRating stars={rating.stars} />
            <div className="text-[11px] text-[#a1a1a6] text-center mt-1">Predicted FHRS</div>
          </div>
          <div className="flex-1">
            <div className="text-[18px] font-extrabold mb-1" style={{ color: rating.color }}>{rating.label}</div>
            <p className="text-[13px] text-[#3a3a3c] leading-relaxed">{rating.advice}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#f0f0f5]">
          <div className="text-[11px] text-[#a1a1a6] mb-2">Penalty score (lower is better): <strong className="text-[#1d1d1f]">{totalScore}</strong></div>
          <div className="grid grid-cols-3 gap-2">
            {sectionScores.map(s => (
              <div key={s.name}>
                <div className="text-[10px] font-semibold text-[#6e6e73] uppercase tracking-wide mb-1">{s.name}</div>
                <div className="h-1.5 rounded-full bg-[#e5e5ea] overflow-hidden mb-0.5">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.pct >= 60 ? '#ff3b30' : s.pct >= 30 ? '#ff9f0a' : '#34c759' }} />
                </div>
                <div className="text-[10px] text-[#a1a1a6]">{s.score} / {s.max} pts</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action plan */}
      {failedQuestions.length > 0 && (
        <div className="bg-white border border-[#e5e5ea] rounded-[16px] p-5 mb-4">
          <div className="text-[14px] font-bold text-[#1d1d1f] mb-3">Priority actions to improve your rating</div>
          {failedQuestions.map((fq, i) => {
            const score = answers[fq.id] ?? 0
            return (
              <div key={fq.id} className={`py-3 ${i > 0 ? 'border-t border-[#f0f0f5]' : ''}`}>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#ff3b30] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#1d1d1f]">{fq.question}</div>
                    <div className="text-[11px] text-[#ff3b30] font-medium mt-0.5">{score} penalty points — {fq.sectionName}</div>
                    {fq.tip && <div className="text-[12px] text-[#6e6e73] mt-1">{fq.tip}</div>}
                    <div className="text-[12px] text-[#0071e3] mt-1 font-medium">Target: {fq.options[0].text}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {rating.stars >= 4 && (
        <div className="bg-[rgba(52,199,89,.08)] border border-[rgba(52,199,89,.3)] rounded-[14px] p-4 mb-4">
          <div className="text-[14px] font-bold text-[#1a7a34] mb-1">Excellent standing</div>
          <p className="text-[13px] text-[#3a3a3c]">Your responses indicate strong compliance practices. Keep temperature records current, maintain HACCP documentation, and ensure all staff certificates are renewed before expiry.</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={restart}
          className="flex-1 py-2.5 border border-[#e5e5ea] rounded-[10px] text-[14px] font-semibold text-[#6e6e73] cursor-pointer bg-white hover:bg-[#f5f5f7] transition-colors"
        >
          Retake simulation
        </button>
        <button
          onClick={() => { onToast('Use HACCP Builder and Allergen Menu tools to build your evidence') }}
          className="flex-1 py-2.5 bg-[#0071e3] text-white border-0 rounded-[10px] text-[14px] font-semibold cursor-pointer hover:bg-[#0058b0] transition-colors"
        >
          Start improving →
        </button>
      </div>
    </div>
  )
}
