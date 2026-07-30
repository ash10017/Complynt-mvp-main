'use client'
import { useState } from 'react'
import Link from 'next/link'

const QUESTIONS = [
  {
    id: 'haccp',
    q: 'Do you have a HACCP plan with up-to-date temperature monitoring records?',
    context: 'The #1 cause of FHRS downgrades. EHOs ask for this first, every time.',
    opts: [
      { label: 'Yes — complete, reviewed in the last 12 months', score: 0, detail: 'Good. Keep it current — EHOs check the review date.' },
      { label: 'We have one but it\'s outdated or incomplete', score: 2, detail: 'An incomplete HACCP plan is treated the same as not having one.' },
      { label: 'No — we don\'t have formal HACCP records', score: 4, detail: 'This is the single most common reason restaurants lose FHRS stars.' },
    ],
  },
  {
    id: 'allergen',
    q: 'Do you have written allergen information for every dish on your menu?',
    context: "Since Natasha's Law (Oct 2021), verbal disclosure is no longer sufficient. It must be in writing.",
    opts: [
      { label: 'Yes — full written allergen matrix for every dish', score: 0, detail: 'Compliant. Make sure it\'s accessible to customers and staff.' },
      { label: 'Partially — some dishes documented, some verbal', score: 2, detail: "Partial compliance still creates criminal liability under Natasha's Law." },
      { label: 'No formal allergen information in place', score: 4, detail: 'Unlimited fine risk and up to 2 years imprisonment under UK law.' },
    ],
  },
  {
    id: 'training',
    q: 'Do all food handlers have valid Level 2 Food Hygiene certificates on file?',
    context: 'Certificates expire every 3 years. Inspectors check dates and ask for physical copies.',
    opts: [
      { label: 'Yes — all staff have valid, in-date certificates', score: 0, detail: 'Good. Set a reminder 30 days before each expiry.' },
      { label: 'Some staff are certified, some aren\'t', score: 2, detail: 'Any unqualified food handler is an immediate flag during inspection.' },
      { label: 'Training hasn\'t been formalised', score: 3, detail: 'This contributes to the Confidence in Management score — 45% of your FHRS rating.' },
    ],
  },
  {
    id: 'temp',
    q: 'Do you keep written records of daily fridge and freezer temperatures?',
    context: 'Temperature records are part of HACCP. Missing logs = missing evidence of food safety control.',
    opts: [
      { label: 'Yes — daily logs maintained for all cold storage', score: 0, detail: 'Essential. Keep at least 3 months of records accessible.' },
      { label: 'We check temperatures but don\'t always write them down', score: 2, detail: "Unrecorded temperature checks don't count as evidence to an EHO." },
      { label: 'No formal temperature monitoring in place', score: 3, detail: 'This will be flagged as a critical food safety management gap.' },
    ],
  },
]

type Answers = Record<string, number>

const RESULTS = [
  { min: 0, max: 1, level: 'LOW RISK', color: '#34c759', bg: 'rgba(52,199,89,0.08)', border: 'rgba(52,199,89,0.25)', title: 'Your compliance fundamentals are solid.', summary: 'Based on your answers, your restaurant is well-positioned for an EHO inspection. The risk of an FHRS downgrade is low. Use Complynt to maintain this standard automatically — year-round.' },
  { min: 2, max: 4, level: 'MEDIUM RISK', color: '#ff9f0a', bg: 'rgba(255,159,10,0.08)', border: 'rgba(255,159,10,0.28)', title: 'You have compliance gaps an EHO would find.', summary: "Your restaurant has areas that an EHO inspector would flag. These won't necessarily result in closure, but they risk a downgraded FHRS rating that stays on your public record for up to 3 years." },
  { min: 5, max: 8, level: 'HIGH RISK', color: '#ff3b30', bg: 'rgba(255,59,48,0.07)', border: 'rgba(255,59,48,0.28)', title: 'Significant FHRS exposure right now.', summary: 'Your answers indicate multiple gaps that EHOs actively look for. A surprise inspection today would likely result in a 1–3 star FHRS rating, possible Hygiene Improvement Notices, and risk of Deliveroo / Uber Eats platform removal.' },
  { min: 9, max: 14, level: 'CRITICAL RISK', color: '#ff3b30', bg: 'rgba(180,0,0,0.07)', border: 'rgba(180,0,0,0.3)', title: 'Immediate action required.', summary: 'Your restaurant has critical compliance failures. An EHO visit at any point could result in a 0–1 star FHRS rating, voluntary closure notice, and personal criminal liability under food safety law.' },
]

function ScoreBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.6s ease' }} />
    </div>
  )
}

export default function FHRSCheckPage() {
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState<'quiz' | 'result'>('quiz')

  const totalScore = Object.values(answers).reduce((s, v) => s + v, 0)
  const maxScore = QUESTIONS.reduce((s, q) => s + Math.max(...q.opts.map(o => o.score)), 0)
  const result = RESULTS.find(r => totalScore >= r.min && totalScore <= r.max) ?? RESULTS[RESULTS.length - 1]
  const answered = Object.keys(answers).length
  const allDone = answered === QUESTIONS.length

  const riskPct = Math.round((totalScore / maxScore) * 100)

  return (
    <div style={{ minHeight: '100vh', background: '#020c15', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', WebkitFontSmoothing: 'antialiased' }}>

      {/* Nav */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px clamp(20px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#0071e3', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="white"/><path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none"/></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Complynt</span>
        </Link>
        <Link href="/onboarding" style={{ fontSize: 13, fontWeight: 600, color: 'white', background: '#0071e3', textDecoration: 'none', padding: '7px 16px', borderRadius: 100 }}>Start free</Link>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(48px,6vw,80px) 20px' }}>

        {step === 'quiz' && (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,113,227,0.12)', border: '1px solid rgba(0,113,227,0.28)', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0071e3', display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>Free · No signup required</span>
              </div>
              <h1 style={{ fontSize: 'clamp(28px,5vw,46px)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 14px' }}>
                FHRS Health Check
              </h1>
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.48)', lineHeight: 1.65, margin: 0 }}>
                4 questions. 60 seconds. Instant assessment of your EHO inspection readiness.
              </p>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
              {QUESTIONS.map((q, i) => (
                <div key={q.id} style={{ flex: 1, height: 3, borderRadius: 2, background: answers[q.id] !== undefined ? '#0071e3' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
              ))}
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {QUESTIONS.map((q, qi) => {
                const isAnswered = answers[q.id] !== undefined
                return (
                  <div key={q.id} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isAnswered ? 'rgba(0,113,227,0.35)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 18, padding: '24px', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: isAnswered ? '#0071e3' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                        {isAnswered
                          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                          : <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{qi + 1}</span>}
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.45, margin: 0 }}>{q.q}</p>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, margin: '0 0 18px 36px', fontStyle: 'italic' }}>{q.context}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 36 }}>
                      {q.opts.map((opt, oi) => {
                        const sel = answers[q.id] === opt.score && Object.keys(answers).includes(q.id)
                        const actuallySelected = answers[q.id] === opt.score
                        return (
                          <button
                            key={oi}
                            onClick={() => setAnswers(p => ({ ...p, [q.id]: opt.score }))}
                            style={{
                              textAlign: 'left', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                              border: `1.5px solid ${actuallySelected ? '#0071e3' : 'rgba(255,255,255,0.1)'}`,
                              background: actuallySelected ? 'rgba(0,113,227,0.15)' : 'rgba(255,255,255,0.03)',
                              color: actuallySelected ? 'white' : 'rgba(255,255,255,0.6)',
                              transition: 'all 0.15s',
                            }}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Submit */}
            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{answered} of {QUESTIONS.length} answered</p>
              <button
                onClick={() => { if (allDone) setStep('result') }}
                disabled={!allDone}
                style={{ background: allDone ? '#0071e3' : 'rgba(255,255,255,0.08)', color: allDone ? 'white' : 'rgba(255,255,255,0.3)', border: 'none', cursor: allDone ? 'pointer' : 'not-allowed', padding: '15px 40px', borderRadius: 100, fontSize: 16, fontWeight: 800, transition: 'all 0.2s', boxShadow: allDone ? '0 8px 28px rgba(0,113,227,0.4)' : 'none' }}
              >
                {allDone ? 'See my FHRS risk assessment →' : `Answer all ${QUESTIONS.length} questions to continue`}
              </button>
            </div>
          </>
        )}

        {step === 'result' && (
          <div>
            {/* Result card */}
            <div style={{ background: result.bg, border: `1.5px solid ${result.border}`, borderRadius: 22, padding: 'clamp(28px,4vw,40px)', marginBottom: 32, textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${result.border}`, borderRadius: 100, padding: '5px 16px', marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: result.color, display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 900, color: result.color, letterSpacing: '0.08em' }}>{result.level}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(22px,3vw,30px)', fontWeight: 900, color: 'white', letterSpacing: '-0.025em', margin: '0 0 14px', lineHeight: 1.2 }}>{result.title}</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 480, marginInline: 'auto' }}>{result.summary}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '12px 16px', maxWidth: 320, margin: '0 auto' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>Risk score</span>
                <div style={{ flex: 1 }}><ScoreBar pct={riskPct} color={result.color} /></div>
                <span style={{ fontSize: 13, fontWeight: 800, color: result.color, whiteSpace: 'nowrap' }}>{riskPct}%</span>
              </div>
            </div>

            {/* Per-answer breakdown */}
            <div style={{ marginBottom: 36 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 12 }}>Your answers — what they mean</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {QUESTIONS.map(q => {
                  const ans = answers[q.id]
                  const opt = q.opts.find(o => o.score === ans)
                  const ok = ans === 0
                  return (
                    <div key={q.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: ok ? 'rgba(52,199,89,0.15)' : 'rgba(255,59,48,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        {ok
                          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="3" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                          : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        }
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'white', margin: '0 0 4px', lineHeight: 1.4 }}>{q.q}</p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '0 0 6px' }}>Your answer: <em>{opt?.label}</em></p>
                        {!ok && <p style={{ fontSize: 12, color: '#ff9f0a', margin: 0, lineHeight: 1.5 }}>{opt?.detail}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* CTA */}
            <div style={{ background: 'rgba(0,113,227,0.1)', border: '1px solid rgba(0,113,227,0.28)', borderRadius: 20, padding: 'clamp(24px,3vw,32px)', textAlign: 'center' }}>
              <h3 style={{ fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 900, color: 'white', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                Fix every gap in your dashboard.
              </h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: '0 0 24px' }}>
                Complynt gives you HACCP templates, an allergen matrix builder, digital temperature logs, and staff training tracking — everything flagged in your assessment.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0071e3', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: 15, padding: '14px 28px', borderRadius: 100, boxShadow: '0 6px 24px rgba(0,113,227,0.4)' }}>
                  Get your free compliance dashboard →
                </Link>
                <button onClick={() => { setAnswers({}); setStep('quiz') }} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '14px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                  Retake quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
