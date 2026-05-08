import type { Compliance } from '@/types'

function daysUntil(dateStr: string): number {
  const due   = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const PENALTY_INFO: Record<string, string> = {
  fssai:
    'Operating without a valid FSSAI license can result in fines up to ₹5 lakh and imprisonment up to 6 months under FSSA 2006. For substandard food, penalties can reach ₹10 lakh. FSSAI officers can seal your kitchen without notice.',
  bbmp:
    'Operating without a BBMP Trade License attracts fines of ₹5,000–₹50,000 plus daily penalties until compliance. BBMP inspectors can issue closure notices, and continued operation can lead to FIR under the KMC Act.',
  excise:
    'Serving liquor without a valid Excise license is a serious criminal offence — fines of ₹10,000–₹1 lakh, immediate seizure of all liquor stock, cancellation of license for 3 years, and possible imprisonment under the Karnataka Excise Act.',
  fire:
    'Operating without Fire NOC can result in fines of ₹10,000–₹1 lakh and immediate sealing of the premises by fire authorities. In the event of a fire incident, criminal liability (including culpable homicide) may apply to the owner.',
  shops:
    'Non-compliance under the Shops & Establishments Act attracts fines of ₹1,000–₹10,000 per violation. Labour Department inspectors can conduct surprise raids and file prosecution cases.',
  esic:
    'Non-payment of ESIC contributions attracts 12% interest per annum on dues, plus a penalty equal to the defaulted amount (up to 25% additional). Criminal prosecution under Section 85 of the ESIC Act is also possible.',
  epfo:
    'EPFO non-compliance attracts 12% p.a. interest on dues, damages up to 25% of dues, and imprisonment up to 3 years under the EPF & MP Act. The department can attach business assets to recover dues.',
  pcb:
    "Operating without PCB consent can result in closure orders, fines of ₹10,000–₹1 lakh, and criminal prosecution under the Environment Protection Act 1986. KSPCB can seal the kitchen's exhaust and drainage systems.",
  eating:
    "Operating an eating house without a police license attracts fines under IPC Section 188 and the Commissioner of Police can seal the establishment. It also affects renewal of your BBMP trade license.",
  lift:
    'Operating an uninspected lift is a safety violation. Fines under the Karnataka Lifts Act, plus potential criminal liability (including charges under IPC 304A for negligent death) if an accident occurs.',
  health:
    'Operating without a Health Trade License can lead to fines of ₹5,000–₹25,000 and suspension of your BBMP trade license. BBMP health inspectors can seize food stock if hygiene standards are not met.',
  eating_house: 'Operating without an Eating House License attracts fines and can lead to police sealing the establishment.',
}

const RENEWAL_STEPS: Record<string, string[]> = {
  fssai: [
    '1. Log into the FoSCoS portal (foscos.fssai.gov.in)',
    '2. Go to "Renewal of License/Registration" under My Account',
    '3. Fill Form B — update any changes to your business',
    '4. Upload required documents: kitchen layout, hygiene report, premises proof',
    '5. Pay the renewal fee online: ₹2,000–₹7,500 depending on turnover',
    '6. Submit and track via the portal — typically 7–15 working days for approval',
    'Tip: Start 30 days before expiry to account for inspection scheduling.',
  ],
  bbmp: [
    '1. Visit the BBMP Sakala portal (bbmpsa kala.in) or the nearest ward office',
    '2. Submit the renewal application with the previous license copy',
    '3. Attach the current year property tax paid receipt',
    '4. Pay the renewal fee (₹1,000–₹10,000 depending on establishment type)',
    "5. An inspector may visit for physical verification of your premises",
    '6. License is typically issued within 15 working days after verification',
  ],
  fire: [
    '1. Apply online at the Karnataka Fire NOC portal',
    '2. Attach a scaled floor plan with all fire exits clearly marked',
    '3. Provide fire extinguisher service certificate (must be within 6 months)',
    '4. Schedule a fire safety inspection at your premises (₹2,000–₹10,000 fee)',
    '5. Ensure all fire safety equipment is functional before the inspector visits',
    '6. NOC is issued within 7–10 working days after a successful inspection',
  ],
  excise: [
    '1. Submit Form CL-9 (renewal application) to the Karnataka Excise Department',
    '2. Attach Police NOC, floor plan, solvency certificate, and previous license',
    '3. Pay the prescribed annual fee (varies by license type: ₹15,000–₹3 lakh)',
    '4. Application is reviewed by the Deputy Commissioner of Excise',
    '5. Inspection of premises may be conducted',
    '6. License renewed within 30–45 days — start early, this one takes time.',
  ],
  shops: [
    '1. Visit the Karnataka Labour Department portal or the nearest Labour Office',
    '2. Submit the S&E renewal application with employee count details',
    '3. Attach previous certificate, employee register, and salary register',
    '4. Pay the renewal fee (₹500–₹2,000 based on employee count)',
    '5. Certificate is issued within 5–7 working days',
  ],
}

function formatList(items: string[]): string {
  return items.map(i => `• ${i}`).join('\n')
}

export function getAISuggestions(compliances: Compliance[]): string[] {
  const suggestions: string[] = []
  const overdue = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
  const soon    = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30)

  if (overdue.length > 0) {
    suggestions.push(`How do I renew my ${overdue[0].name.replace(/ \(.*\)/, '')}?`)
    suggestions.push(`What are the penalties for expired ${overdue[0].name.replace(/ \(.*\)/, '')}?`)
  }
  if (soon.length > 0) {
    suggestions.push(`What documents do I need for ${soon[0].name.replace(/ \(.*\)/, '')} renewal?`)
  }
  if (suggestions.length < 4) suggestions.push('Show me my compliance summary')
  if (suggestions.length < 4) suggestions.push('What is my health score?')
  if (suggestions.length < 4) suggestions.push('What are my upcoming deadlines?')
  return suggestions.slice(0, 4)
}

export function generateAIResponse(question: string, compliances: Compliance[]): string {
  const q = question.toLowerCase().trim()

  // ── Greeting ──────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|good morning|good afternoon|namaste|hlo|hii)/.test(q)) {
    const overdue = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
    const soon    = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30)
    if (overdue.length > 0) {
      return `Hello! I can see you have **${overdue.length} overdue item${overdue.length > 1 ? 's' : ''}** that need immediate attention:\n${overdue.map(c => `• ${c.name} (${Math.abs(daysUntil(c.dueDate))}d overdue)`).join('\n')}\n\nWould you like help with the renewal process for any of these?`
    }
    if (soon.length > 0) {
      return `Hello! Your compliance profile looks mostly good. You have **${soon.length} item${soon.length > 1 ? 's' : ''}** due within 30 days:\n${soon.map(c => `• ${c.name} — ${daysUntil(c.dueDate)} days`).join('\n')}\n\nI recommend starting the renewal process now. Ask me anything!`
    }
    return `Hello! Your compliance profile looks great — no urgent items right now. Feel free to ask me anything about your licences, deadlines, or renewal processes!`
  }

  // ── Health score ──────────────────────────────────────────────────────────
  if (q.includes('health score') || q.includes('health check') || q.includes('compliance score') || q.includes('how am i doing') || q === 'score') {
    const total     = compliances.length
    const completed = compliances.filter(c => c.status === 'Completed').length
    const onTrack   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30).length
    const overdue   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
    const score     = total > 0 ? Math.round(((onTrack + completed) / total) * 100) : 100
    const grade     = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs urgent attention'
    let response = `Your compliance health score is **${score}/100** — ${grade}.\n\n`
    response += `• ${completed} items completed ✓\n• ${onTrack} on track (>30 days)\n• ${compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30).length} due within 30 days\n• ${overdue.length} overdue ❗`
    if (overdue.length > 0) {
      response += `\n\nThe overdue items are dragging your score down: ${overdue.map(c => c.name).join(', ')}. Resolving these will significantly improve your score.`
    }
    return response
  }

  // ── Overdue ───────────────────────────────────────────────────────────────
  if (q.includes('overdue') || q.includes('expired') || q.includes('past due') || q.includes('lapsed')) {
    const items = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
    if (items.length === 0) return `Great news — you have **no overdue items!** Everything is either completed or has time remaining. Keep it up!`
    const list = items.map(c => `• **${c.name}** — ${Math.abs(daysUntil(c.dueDate))} days overdue (expired ${c.dueDate})`).join('\n')
    return `You have **${items.length} overdue item${items.length > 1 ? 's' : ''}:**\n${list}\n\nAddress these immediately to avoid penalties. Ask me "how to renew [license name]" for step-by-step guidance.`
  }

  // ── Upcoming / due soon ───────────────────────────────────────────────────
  if (q.includes('upcoming') || q.includes('due soon') || q.includes('coming up') || q.includes('next deadline') || q.includes('expiring')) {
    const soon = compliances
      .filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30)
      .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))
    if (soon.length === 0) {
      const next = compliances
        .filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30)
        .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))
        .slice(0, 3)
      return `Nothing is due in the next 30 days. Your next upcoming deadlines are:\n${next.map(c => `• ${c.name} — in ${daysUntil(c.dueDate)} days (${c.dueDate})`).join('\n')}`
    }
    const list = soon.map(c => `• **${c.name}** — ${daysUntil(c.dueDate) === 0 ? 'Due TODAY' : `${daysUntil(c.dueDate)} days`} (${c.dueDate})`).join('\n')
    return `You have **${soon.length} item${soon.length > 1 ? 's' : ''}** due in the next 30 days:\n${list}\n\nMost government approvals take 7–15 working days — start now to avoid lapses.`
  }

  // ── Summary / status ──────────────────────────────────────────────────────
  if (q.includes('summary') || q.includes('overview') || q === 'status' || q === 'compliance summary' || q === 'show me my compliance summary') {
    const total     = compliances.length
    const completed = compliances.filter(c => c.status === 'Completed').length
    const overdue   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
    const soon      = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30)
    const onTrack   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30)
    const score     = total > 0 ? Math.round(((onTrack.length + completed) / total) * 100) : 100
    return `**Compliance Summary**\n\n• Total items tracked: ${total}\n• ✓ Completed: ${completed}\n• On track (>30 days): ${onTrack.length}\n• ⚠️ Due within 30 days: ${soon.length}\n• ❗ Overdue: ${overdue.length}\n\nHealth Score: **${score}/100**\n\n${overdue.length > 0 ? `Overdue: ${overdue.map(c => c.name).join(', ')}` : 'No overdue items — great work!'}`
  }

  // ── Cost / fees ───────────────────────────────────────────────────────────
  if (q.includes('cost') || q.includes('fee') || q.includes('price') || q.includes('how much') || q.includes('charges')) {
    return `Approximate renewal fees for common licences (Bengaluru, FY 2025-26):\n\n• **FSSAI License**: ₹2,000–₹7,500/year (based on turnover category)\n• **BBMP Trade License**: ₹1,000–₹10,000/year (based on business type & area)\n• **Excise / Liquor License**: ₹15,000–₹3 lakh/year (by license type)\n• **Fire NOC**: ₹2,000–₹10,000 (based on floor area)\n• **Health Trade License**: ₹500–₹3,000\n• **Eating House License**: ₹1,000–₹5,000\n• **GST Registration/Filing**: Free\n• **ESIC / EPFO**: Based on monthly contributions\n\nFees change annually — always verify on the official authority portal before payment.`
  }

  // ── What do I need to track ───────────────────────────────────────────────
  if (q.includes('what license') || q.includes('what do i need') || q.includes('which license') || q.includes('all license') || q.includes('full list')) {
    const byCategory: Record<string, string[]> = {}
    compliances.forEach(c => {
      if (!byCategory[c.category]) byCategory[c.category] = []
      byCategory[c.category].push(c.name)
    })
    const parts = Object.entries(byCategory).map(([cat, items]) => `**${cat}:**\n${items.map(n => `• ${n}`).join('\n')}`)
    return `You're currently tracking **${compliances.length} compliance items**:\n\n${parts.join('\n\n')}\n\nYou can add more items using the "+ Add item" button in your Compliance tab.`
  }

  // ── Completed items ───────────────────────────────────────────────────────
  if ((q.includes('completed') || q.includes('done')) && !q.includes('how') && !q.includes('mark')) {
    const items = compliances.filter(c => c.status === 'Completed')
    if (items.length === 0) return `You haven't marked any items as completed yet. Once you renew a license and upload the certificate, click "Mark as Done" inside the compliance item.`
    return `You have **${items.length} completed items** ✓:\n${items.map(c => `• ${c.name}`).join('\n')}\n\nWell done on staying on top of these!`
  }

  // ── License-specific queries ──────────────────────────────────────────────
  const licenseMap: { keywords: string[]; name: string; penaltyKey: string; renewalKey: string }[] = [
    { keywords: ['fssai', 'food license', 'food safety'],   name: 'FSSAI License',              penaltyKey: 'fssai',  renewalKey: 'fssai'  },
    { keywords: ['bbmp', 'trade license', 'trade licence'], name: 'BBMP Trade License',          penaltyKey: 'bbmp',   renewalKey: 'bbmp'   },
    { keywords: ['excise', 'liquor', 'bar license'],        name: 'Excise / Liquor License',     penaltyKey: 'excise', renewalKey: 'excise' },
    { keywords: ['fire noc', 'fire safety', 'fire cert'],   name: 'Fire NOC',                    penaltyKey: 'fire',   renewalKey: 'fire'   },
    { keywords: ['health trade', 'health license'],         name: 'Health Trade License',        penaltyKey: 'health', renewalKey: 'bbmp'   },
    { keywords: ['eating house', 'eating license'],         name: 'Eating House License',        penaltyKey: 'eating', renewalKey: 'bbmp'   },
    { keywords: ['gst'],                                    name: 'GST Registration',            penaltyKey: 'shops',  renewalKey: 'bbmp'   },
    { keywords: ['shops', 'establishment', 's&e'],          name: 'Shops & Establishments Act',  penaltyKey: 'shops',  renewalKey: 'shops'  },
    { keywords: ['esic', 'employee state'],                 name: 'ESIC Registration',           penaltyKey: 'esic',   renewalKey: 'bbmp'   },
    { keywords: ['epfo', 'provident fund', ' pf ', 'pf registration'], name: 'EPFO / PF Registration', penaltyKey: 'epfo', renewalKey: 'bbmp' },
    { keywords: ['pcb', 'pollution'],                       name: 'PCB Consent to Operate',      penaltyKey: 'pcb',    renewalKey: 'bbmp'   },
    { keywords: ['lift', 'elevator'],                       name: 'Lift / Elevator License',     penaltyKey: 'lift',   renewalKey: 'bbmp'   },
  ]

  for (const { keywords, name, penaltyKey, renewalKey } of licenseMap) {
    const matched = keywords.some(kw => q.includes(kw))
    if (!matched) continue

    const item = compliances.find(c =>
      keywords.some(kw => c.name.toLowerCase().includes(kw)) || c.name === name
    )

    // Penalty / fine / consequences
    if (q.includes('penalt') || q.includes('fine') || q.includes('consequence') || q.includes('risk') || q.includes('what happen') || q.includes('if i don')) {
      const penalty = PENALTY_INFO[penaltyKey]
      if (item && item.status !== 'Completed' && daysUntil(item.dueDate) < 0) {
        return `⚠️ Your **${item.name}** has been expired for **${Math.abs(daysUntil(item.dueDate))} days**. You are currently at risk:\n\n${penalty}\n\nPlease renew immediately. Ask me "how to renew ${item.name}" for steps.`
      }
      return penalty || `Penalties vary by state and authority. Please check the official authority website for current penalty schedules.`
    }

    // Documents required
    if (q.includes('document') || q.includes('need') || q.includes('require') || q.includes('paper') || q.includes('checklist')) {
      if (item) {
        return `For **${item.name}** renewal, you'll need:\n${formatList(item.documents)}\n\nAll copies should be self-attested. Some authorities require original documents for spot verification.`
      }
      return `The standard documents for ${name} renewal include: application form, previous license copy, identity proof, address proof, and the applicable fee challan. Check the official portal for the current complete list.`
    }

    // How to renew / renewal steps
    if (q.includes('how to renew') || q.includes('renewal process') || q.includes('steps') || q.includes('procedure') || q.includes('how do i renew') || q.includes('how to get') || q.startsWith('renew')) {
      const steps = RENEWAL_STEPS[renewalKey]
      if (steps) {
        return `**How to renew your ${item?.name || name}:**\n\n${steps.join('\n')}`
      }
      return `Visit the relevant authority's portal or office with your previous license, identity proof, address proof, and renewal fee. Processing typically takes 7–15 working days. Start at least 30 days before expiry.`
    }

    // When does it expire / due date / status
    if (item) {
      const days = daysUntil(item.dueDate)
      if (item.status === 'Completed') return `Your **${item.name}** has been marked as completed ✓. It's all up to date!`
      if (days < 0)   return `⚠️ Your **${item.name}** expired on **${item.dueDate}** — that's **${Math.abs(days)} days ago**. You need to renew this immediately. Ask me "how to renew ${item.name.replace(/ \(.*\)/, '')}" for the steps.`
      if (days === 0)  return `🚨 Your **${item.name}** is due **TODAY** (${item.dueDate}). Please take immediate action.`
      if (days <= 7)   return `⚠️ Your **${item.name}** expires in **${days} day${days > 1 ? 's' : ''}** on ${item.dueDate}. Start the renewal immediately — approvals take 7–15 working days.`
      if (days <= 30)  return `Your **${item.name}** expires in **${days} days** on ${item.dueDate}. I recommend starting the renewal process this week. Want the required documents checklist?`
      return `Your **${item.name}** expires on **${item.dueDate}** — ${days} days from now. You have time, but set a reminder to start 30 days before. Anything specific you'd like to know?`
    } else {
      return `I don't see a **${name}** in your current compliance list. To add it, click the **"+ Add item"** button in the Compliance tab.`
    }
  }

  // ── Fallback ───────────────────────────────────────────────────────────────
  const overdueCount = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0).length
  const soonCount    = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30).length

  return `I can help you with your ${compliances.length} compliance items. ${
    overdueCount > 0 ? `You have **${overdueCount} overdue item${overdueCount > 1 ? 's' : ''}** needing attention. ` :
    soonCount > 0    ? `You have **${soonCount} item${soonCount > 1 ? 's' : ''}** due in the next 30 days. ` :
    'Your compliance status is looking good! '
  }\n\nTry asking:\n• "When does my FSSAI expire?"\n• "What documents do I need for BBMP renewal?"\n• "Penalties for expired Fire NOC?"\n• "How do I renew my Excise license?"\n• "Show me all overdue items"\n• "What is my health score?"`
}
