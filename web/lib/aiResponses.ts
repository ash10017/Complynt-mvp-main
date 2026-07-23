import type { Compliance } from '@/types'

function daysUntil(dateStr: string): number {
  const due   = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const PENALTY_INFO: Record<string, string> = {
  haccp:
    'Inadequate HACCP records are the most common reason for a sub-3 FHRS rating. An EHO inspector can issue a Hygiene Improvement Notice, which triggers a re-inspection and appears on your public FHRS record. A score of 2 or below can get you delisted from Deliveroo and Uber Eats, costing thousands per week. In severe cases, a Hygiene Emergency Prohibition Notice can close your kitchen with immediate effect.',
  allergen:
    "Non-compliance with Natasha's Law carries criminal liability — unlimited fines and up to 2 years' imprisonment for the individuals responsible. Trading Standards actively prosecutes allergen violations. Causing an allergic reaction through failure to declare allergens can result in prosecution for gross negligence manslaughter. A regional Trading Standards survey found 56% of food businesses still non-compliant.",
  premises:
    'Selling alcohol without a valid Premises Licence is a criminal offence under the Licensing Act 2003 — fine up to £20,000 and/or 6 months imprisonment. The local authority can apply for a licence review resulting in suspension or revocation. Police and licensing officers conduct joint enforcement operations in hospitality venues.',
  fire:
    'Failure to have a current fire risk assessment is a criminal offence under the Regulatory Reform (Fire Safety) Order 2005 — unlimited fines and up to 2 years imprisonment. The Fire Service can issue a Prohibition Notice closing your premises immediately. If a fire results in injury and no valid assessment exists, criminal liability including manslaughter charges can apply to the responsible person.',
  eli:
    "Operating without Employer's Liability Insurance is a criminal offence. The HSE can fine you £2,500 for every day you operate without a valid certificate. The certificate must be displayed at the premises or accessible to employees at all times.",
  nlw:
    "Failing to pay the National Living Wage results in fines up to £20,000 per worker, mandatory repayment of all underpayments, and public naming on the government's NMW enforcement list. HMRC runs active enforcement campaigns targeting hospitality specifically — surprise payroll audits are common. Directors can be personally liable.",
  rtw:
    'Employing someone without a valid right to work check results in a civil penalty of up to £45,000 per illegal worker. If you had reason to know the worker was illegal, criminal prosecution applies — up to 5 years imprisonment and an unlimited fine. Immigration Enforcement conducts joint operations with EHOs in hospitality premises.',
  vat:
    'Failure to register for VAT when turnover exceeds £90,000 results in back-payment of all VAT owed, plus surcharges up to 15%, interest on unpaid VAT, and a potential penalty of up to 100% of the VAT owed. HMRC can raise assessments going back up to 20 years for deliberate non-disclosure.',
  ico:
    "Failure to register with the ICO is a criminal offence — fines up to £400 per organisation for non-registration alone. For data breaches caused by poor compliance, the ICO can issue fines up to £17.5 million or 4% of global turnover (whichever is higher). The ICO actively monitors hospitality businesses operating loyalty schemes and booking systems.",
  gas:
    'Operating gas appliances without a valid annual CP12 certificate is a criminal offence under the Gas Safety (Installation and Use) Regulations 1998 — unlimited fines and imprisonment. If a gas incident occurs and no valid certificate exists, criminal liability including manslaughter charges can apply. The HSE can prohibit use of the premises immediately.',
  fbd:
    'Operating as a food business without registration is a criminal offence — fines up to £5,000. More critically, it invalidates your FHRS rating and triggers an immediate EHO inspection. Platforms like Just Eat and Deliveroo require a valid food business registration number to keep your listing active.',
}

const RENEWAL_STEPS: Record<string, string[]> = {
  haccp: [
    "1. Download the FSA's 'Safe Catering' pack or use a Safer Food Better Business (SFBB) folder",
    '2. Adapt the HACCP plan to your specific kitchen — a generic template will not satisfy an EHO',
    '3. Update temperature logs with fresh, real entries (avoid suspiciously round numbers)',
    '4. Sign and date every cleaning schedule — unsigned records count as missing records',
    '5. Document any new suppliers with due diligence records',
    '6. Train any new staff and add their signatures to the training register',
    'Tip: An EHO inspector spends 30 minutes on paperwork first. Neat, up-to-date records can turn a routine visit into a 5-star rating.',
  ],
  allergen: [
    '1. List every ingredient in every dish and map against all 14 regulated allergens',
    '2. Produce a written allergen matrix accessible to both customers and staff',
    '3. For PPDS food, ensure a full ingredient list with allergens highlighted is on the packaging',
    '4. For online orders, publish allergen information before the purchase is complete AND at delivery',
    '5. Train all front-of-house and kitchen staff on allergen procedures and cross-contamination risks',
    '6. Update the allergen matrix any time a supplier changes ingredients or a menu item changes',
    "Tip: Owen's Law (likely 2027–2028) will make written allergen menus mandatory — getting this done now puts you ahead of the legislation.",
  ],
  premises: [
    '1. Contact your local authority licensing team for the review or variation application form',
    '2. Ensure your Designated Premises Supervisor (DPS) holds a valid Personal Licence',
    '3. Check the DPS DBS certificate is within 3 years and Challenge 25 is actively enforced',
    '4. Review your operating schedule — any changes require a formal variation application',
    '5. Submit the application with the prescribed fee (varies by rateable value)',
    '6. Reviews typically take 28 days — plan any licence variations at least 6 weeks in advance',
  ],
  fire: [
    '1. Commission a fire risk assessment from a competent person (BAFE certified assessors preferred)',
    '2. Ensure all fire extinguishers have been serviced within the last 12 months',
    '3. Test the fire detection system and log the result in your fire safety record',
    '4. Update the emergency evacuation plan if anything has changed at the premises',
    '5. Train all staff on fire safety and evacuation procedures and document the training',
    '6. Implement any outstanding action items from the previous assessment before the new one',
    'Tip: A complete fire risk assessment folder ready to show the inspector demonstrates compliance culture.',
  ],
  gas: [
    '1. Find a Gas Safe registered engineer for commercial kitchen appliances (check gasregister.co.uk)',
    '2. Book the inspection 4–6 weeks before your CP12 expiry date',
    '3. Ensure access to all gas appliances — kitchen range, boiler, and all gas lines',
    '4. The engineer will inspect, test, and issue the CP12 certificate on the day if appliances pass',
    '5. Keep the CP12 on site at all times — it may be checked by the EHO or Fire Service',
    '6. If any appliances fail, they must be repaired or replaced before a CP12 can be issued',
  ],
  rtw: [
    '1. Check right to work documents before the employee starts — not on day one',
    '2. UK / Irish citizens: original passport or birth certificate plus NI number',
    '3. EU settled status: request a share code from the employee and verify via gov.uk/prove-right-to-work',
    '4. Non-EU visa holders: check Biometric Residence Permit or visa vignette',
    '5. Copy, date, and sign all documents — note who carried out the check',
    '6. File records securely and retain for 2 years after employment ends',
    'Tip: UKVI online share code checks take under 2 minutes and provide a statutory defence against penalties.',
  ],
  eli: [
    "1. Contact your current insurer or a commercial insurance broker before the policy expires",
    "2. Confirm cover is at least £5 million — the legal minimum under the Employers' Liability (Compulsory Insurance) Act 1969",
    '3. Request a renewal quote — premiums typically range from £200–£800/year for small hospitality businesses based on annual payroll and headcount',
    '4. Compare at least two or three quotes from different brokers before renewing',
    '5. Ensure there is no gap in cover between policies — even one day uninsured is an offence',
    "6. Display the certificate at the premises or ensure it is electronically accessible to all employees at all times",
    'Tip: The HSE can issue a £2,500 fine for each day you operate without a valid certificate displayed.',
  ],
  nlw: [
    '1. Check the new NLW and NMW rates for each age band at gov.uk/national-minimum-wage-rates — updated every April',
    '2. Update payroll records for every employee whose rate is at or near the new minimum',
    '3. Recalculate pay for any workers on variable hours, tronc, or piece-rate arrangements',
    '4. If the April update was missed, process backdated pay immediately to avoid penalty interest',
    '5. Document the review — print and sign the updated payroll schedule and retain it on file',
    '6. Run an annual payroll audit to catch edge cases: accommodation offset, salary sacrifice schemes, uniforms',
    'Tip: HMRC runs targeted enforcement campaigns in hospitality — officers check payslips on the day of inspection. Directors can be personally liable for underpayment.',
  ],
  vat: [
    '1. Register for VAT at gov.uk/vat-registration if your 12-month rolling taxable turnover has exceeded or is approaching £90,000',
    '2. Sign up for Making Tax Digital (MTD) — all VAT-registered businesses must file via MTD-compatible software',
    '3. Submit each quarterly VAT return by the deadline (1 month + 7 days after the end of the VAT period)',
    '4. Ensure your VAT account separates standard-rated (20%), zero-rated, and exempt supplies correctly',
    '5. Hot food and drinks served on the premises are standard-rated at 20% — cold takeaway food is typically zero-rated',
    '6. Pay the VAT due on the same day as submission — late payment triggers automatic surcharge points; 5 points results in a £200 penalty per return',
    'Tip: The GOV.UK Business Tax Account dashboard shows all upcoming VAT deadlines in one place and allows direct MTD authorisation.',
  ],
  ico: [
    '1. Register or renew at ico.org.uk — most small businesses pay the Tier 1 annual fee of £40',
    '2. Confirm your tier: Tier 1 (£40) applies to businesses with turnover under £36 million and fewer than 250 staff',
    '3. Ensure a customer-facing Privacy Policy is published on your website and booking systems',
    '4. Document your lawful basis for each type of data processing (consent, legitimate interest, contract)',
    '5. Check that any third-party processors (booking platforms, email tools, EPOS providers) have signed Data Processing Agreements',
    '6. Update your ICO registration if your processing activities change significantly (new loyalty scheme, CCTV, online ordering)',
    'Tip: The ICO self-assessment tool at ico.org.uk/for-organisations/smes takes 15 minutes and identifies all your specific obligations as a small business.',
  ],
  fbd: [
    '1. Register your food business with your local council at least 28 days before you start trading — it is free',
    '2. Apply online at gov.uk or directly through your local authority\'s website',
    '3. Provide accurate details: trading name, address, type of food business, and owner contact information',
    '4. The registration is tied to your trading address — if you move or open a new site, register the new address separately',
    '5. After registration an Environmental Health Officer (EHO) will visit to inspect the premises',
    '6. Maintain your FHRS food hygiene rating — it is linked to this registration address and is publicly visible on the FSA website',
    'Tip: Delivery platforms (Deliveroo, Uber Eats, Just Eat) require a valid food business registration number to list your business — an unregistered kitchen can be delisted.',
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
    suggestions.push(`How do I fix my ${overdue[0].name.replace(/ \(.*\)/, '')}?`)
    suggestions.push(`What are the penalties for expired ${overdue[0].name.replace(/ \(.*\)/, '')}?`)
  }
  if (soon.length > 0) {
    suggestions.push(`What documents do I need for ${soon[0].name.replace(/ \(.*\)/, '')}?`)
  }
  if (suggestions.length < 4) suggestions.push('What is my FHRS inspection risk right now?')
  if (suggestions.length < 4) suggestions.push('Show me my compliance summary')
  if (suggestions.length < 4) suggestions.push("What is Owen's Law and when does it apply?")
  if (suggestions.length < 4) suggestions.push('What are my upcoming deadlines?')
  return suggestions.slice(0, 4)
}

export function generateAIResponse(question: string, compliances: Compliance[]): string {
  const q = question.toLowerCase().trim()

  // ── Greeting ──────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|good morning|good afternoon|hlo|hii)/.test(q)) {
    const overdue = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
    const soon    = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30)
    if (overdue.length > 0) {
      return `Hello! I can see you have **${overdue.length} overdue item${overdue.length > 1 ? 's' : ''}** that need immediate attention:\n${overdue.map(c => `• ${c.name} (${Math.abs(daysUntil(c.dueDate))}d overdue)`).join('\n')}\n\nWould you like help with any of these?`
    }
    if (soon.length > 0) {
      return `Hello! Your compliance profile looks mostly good. You have **${soon.length} item${soon.length > 1 ? 's' : ''}** due within 30 days:\n${soon.map(c => `• ${c.name} — ${daysUntil(c.dueDate)} days`).join('\n')}\n\nI recommend starting the renewal process now. Ask me anything!`
    }
    return `Hello! Your compliance profile looks great — no urgent items right now. Feel free to ask about your FHRS inspection readiness, allergen compliance, or any renewal process!`
  }

  // ── FHRS / inspection readiness ───────────────────────────────────────────
  if (q.includes('fhrs') || q.includes('food hygiene rating') || q.includes('hygiene rating') || q.includes('inspection ready') || q.includes('eho') || q.includes('inspection risk')) {
    const haccp    = compliances.find(c => c.name.toLowerCase().includes('haccp') || c.name.toLowerCase().includes('food safety management'))
    const training = compliances.find(c => c.name.toLowerCase().includes('food hygiene training') || c.name.toLowerCase().includes('staff food hygiene'))
    const allergen = compliances.find(c => c.name.toLowerCase().includes('allergen'))
    const issues: string[] = []

    if (haccp && haccp.status !== 'Completed' && daysUntil(haccp.dueDate) < 0) {
      issues.push('❗ **HACCP records overdue** — this alone can drop your FHRS rating to 2 or below')
    }
    if (training && training.status !== 'Completed' && daysUntil(training.dueDate) < 0) {
      issues.push('❗ **Staff food hygiene training expired** — EHOs check certificates on every inspection')
    }
    if (allergen && allergen.status !== 'Completed' && daysUntil(allergen.dueDate) <= 14) {
      issues.push("⚠️ **Allergen review pending** — Natasha's Law violations are actively prosecuted")
    }

    if (issues.length === 0) {
      return `Your FHRS inspection readiness looks solid. Inspections assess three areas: **hygiene practices**, **structure and cleanliness**, and **confidence in management** (mainly your HACCP records). All three are tracking well.\n\nYour current rating should be safe at the next unannounced EHO visit. Remember — the EHO can visit without notice at any time during trading hours.`
    }
    return `Your FHRS inspection risk is **elevated**. An EHO can visit unannounced at any time, and the following issues would count against your rating:\n\n${issues.join('\n')}\n\nFix these in priority order — HACCP records first, then training certificates. Ask me "how do I fix my HACCP records" for step-by-step guidance.`
  }

  // ── Owen's Law ─────────────────────────────────────────────────────────────
  if (q.includes("owen's law") || q.includes('owens law') || q.includes('written allergen') || q.includes('allergen menu')) {
    const allergenItem = compliances.find(c => c.name.toLowerCase().includes('allergen'))
    return `**Owen's Law — What You Need to Know:**\n\nOwen's Law is proposed legislation that would make written allergen menus mandatory in all UK restaurants and food businesses. Here's the timeline:\n\n• **March 2025**: FSA published best practice guidance urging written allergen information for all non-prepacked food\n• **Spring 2026**: FSA evaluates whether businesses are following the guidance (most aren't)\n• **2027–2028**: If the evaluation shows poor uptake (the more likely outcome), Owen's Law becomes mandatory legislation\n\n**What "written allergen menus" means:** Every customer must be able to see allergen information for every dish in writing — "ask the staff" is no longer sufficient.\n\nThe businesses getting ahead of this now will be compliant before the law forces it. Your allergen management is ${allergenItem?.status === 'Completed' ? 'marked complete ✓ — you\'re already ahead of the legislation.' : 'currently pending — sorting this now gets you ahead of Owen\'s Law at no extra effort.'}`
  }

  // ── Health score ───────────────────────────────────────────────────────────
  if (q.includes('health score') || q.includes('compliance score') || q.includes('how am i doing') || q === 'score') {
    const total     = compliances.length
    const completed = compliances.filter(c => c.status === 'Completed').length
    const onTrack   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30).length
    const overdue   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
    const score     = total > 0 ? Math.round(((onTrack + completed) / total) * 100) : 100
    const grade     = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs urgent attention'
    let response = `Your compliance health score is **${score}/100** — ${grade}.\n\n`
    response += `• ${completed} items completed ✓\n• ${onTrack} on track (>30 days)\n• ${compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30).length} due within 30 days\n• ${overdue.length} overdue ❗`
    if (overdue.length > 0) {
      response += `\n\nThe overdue items are dragging your score down: ${overdue.map(c => c.name).join(', ')}. Resolving these will improve your score — and your FHRS inspection readiness.`
    }
    return response
  }

  // ── Overdue ────────────────────────────────────────────────────────────────
  if (q.includes('overdue') || q.includes('expired') || q.includes('past due') || q.includes('lapsed')) {
    const items = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
    if (items.length === 0) return `Great news — you have **no overdue items!** Everything is either completed or has time remaining. Keep it up!`
    const list = items.map(c => `• **${c.name}** — ${Math.abs(daysUntil(c.dueDate))} days overdue (expired ${c.dueDate})`).join('\n')
    return `You have **${items.length} overdue item${items.length > 1 ? 's' : ''}:**\n${list}\n\nAddress these immediately — overdue food safety records put your FHRS rating at risk. Ask me "how do I fix [item name]" for step-by-step guidance.`
  }

  // ── Upcoming / due soon ────────────────────────────────────────────────────
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
    return `You have **${soon.length} item${soon.length > 1 ? 's' : ''}** due in the next 30 days:\n${list}\n\nGovernment and council approvals can take 7–14 working days — start now to avoid lapses.`
  }

  // ── Summary / status ───────────────────────────────────────────────────────
  if (q.includes('summary') || q.includes('overview') || q === 'status' || q === 'compliance summary' || q === 'show me my compliance summary') {
    const total     = compliances.length
    const completed = compliances.filter(c => c.status === 'Completed').length
    const overdue   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) < 0)
    const soon      = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) >= 0 && daysUntil(c.dueDate) <= 30)
    const onTrack   = compliances.filter(c => c.status !== 'Completed' && daysUntil(c.dueDate) > 30)
    const score     = total > 0 ? Math.round(((onTrack.length + completed) / total) * 100) : 100
    return `**Compliance Summary**\n\n• Total items tracked: ${total}\n• ✓ Completed: ${completed}\n• On track (>30 days): ${onTrack.length}\n• ⚠️ Due within 30 days: ${soon.length}\n• ❗ Overdue: ${overdue.length}\n\nHealth Score: **${score}/100**\n\n${overdue.length > 0 ? `Overdue: ${overdue.map(c => c.name).join(', ')}` : 'No overdue items — great work!'}`
  }

  // ── Cost / fees ────────────────────────────────────────────────────────────
  if (q.includes('cost') || q.includes('fee') || q.includes('price') || q.includes('how much') || q.includes('charges')) {
    return `Approximate costs for common UK compliance requirements:\n\n• **Food Business Registration**: Free (local council)\n• **HACCP Records Update**: £0–£500 (DIY to consultant)\n• **Fire Risk Assessment**: £150–£500 (third-party assessor)\n• **Premises Licence**: £100–£1,905 (by rateable value)\n• **Gas Safety CP12**: £100–£250 (commercial kitchen)\n• **Employer's Liability Insurance**: £200–£800/year (varies by headcount)\n• **ICO Registration**: £40/year (most small businesses)\n• **Food Hygiene Training (Level 2)**: £20–£50 per person\n• **Allergen Consultancy**: £200–£800 (specialist review)\n• **VAT Registration**: Free\n\nFees change — always verify on the official authority's website before payment.`
  }

  // ── What do I need to track ────────────────────────────────────────────────
  if (q.includes('what license') || q.includes('what do i need') || q.includes('which license') || q.includes('all license') || q.includes('full list')) {
    const byCategory: Record<string, string[]> = {}
    compliances.forEach(c => {
      if (!byCategory[c.category]) byCategory[c.category] = []
      byCategory[c.category].push(c.name)
    })
    const parts = Object.entries(byCategory).map(([cat, items]) => `**${cat}:**\n${items.map(n => `• ${n}`).join('\n')}`)
    return `You're currently tracking **${compliances.length} compliance items**:\n\n${parts.join('\n\n')}\n\nYou can add more items using the "+ Add item" button in your Compliance tab.`
  }

  // ── Completed items ────────────────────────────────────────────────────────
  if ((q.includes('completed') || q.includes('done')) && !q.includes('how') && !q.includes('mark')) {
    const items = compliances.filter(c => c.status === 'Completed')
    if (items.length === 0) return `You haven't marked any items as completed yet. Once you complete a compliance task, click "Mark as Done" inside the compliance item.`
    return `You have **${items.length} completed items** ✓:\n${items.map(c => `• ${c.name}`).join('\n')}\n\nWell done on staying on top of these!`
  }

  // ── License-specific queries ───────────────────────────────────────────────
  const licenseMap: { keywords: string[]; name: string; penaltyKey: string; renewalKey: string }[] = [
    { keywords: ['haccp', 'food safety management', 'food safety record', 'food hygiene record', 'temperature log', 'cleaning schedule'], name: 'HACCP Records',                    penaltyKey: 'haccp',    renewalKey: 'haccp'    },
    { keywords: ['allergen', "natasha's law", 'natashas law', 'allergen review', 'allergen matrix', 'allergen management'],               name: 'Allergen Management',              penaltyKey: 'allergen', renewalKey: 'allergen' },
    { keywords: ['food hygiene training', 'food hygiene cert', 'level 2 food', 'staff training certificate'],                              name: 'Staff Food Hygiene Training',      penaltyKey: 'haccp',    renewalKey: 'haccp'    },
    { keywords: ['premises licence', 'premises license', 'alcohol licence', 'alcohol license', 'licensing act', 'dps'],                    name: 'Premises Licence',                 penaltyKey: 'premises', renewalKey: 'premises' },
    { keywords: ['fire risk', 'fire assessment', 'fire safety', 'fire extinguisher'],                                                      name: 'Fire Risk Assessment',             penaltyKey: 'fire',     renewalKey: 'fire'     },
    { keywords: ['gas safety', 'cp12', 'gas cert', 'gas inspection', 'gas safe'],                                                          name: 'Gas Safety Certificate',           penaltyKey: 'gas',      renewalKey: 'gas'      },
    { keywords: ['employer liability', 'el insurance', "employers' liability", 'liability insurance', 'el cert'],                           name: "Employer's Liability Insurance",   penaltyKey: 'eli',      renewalKey: 'eli'      },
    { keywords: ['nlw', 'national living wage', 'minimum wage', 'payroll compliance', 'nwm'],                                              name: 'NLW Payroll Review',               penaltyKey: 'nlw',      renewalKey: 'nlw'      },
    { keywords: ['right to work', 'rtw', 'share code', 'immigration check', 'visa check', 'settled status'],                               name: 'Right to Work',                    penaltyKey: 'rtw',      renewalKey: 'rtw'      },
    { keywords: ['vat', 'making tax digital', 'mtd', 'hmrc vat', 'vat return'],                                                            name: 'VAT Registration',                 penaltyKey: 'vat',      renewalKey: 'vat'      },
    { keywords: ['ico', 'gdpr', 'data protection', 'ico registration', 'uk gdpr'],                                                         name: 'GDPR / ICO Registration',          penaltyKey: 'ico',      renewalKey: 'ico'      },
    { keywords: ['food business registration', 'food registration', 'fsa registration', 'fbd'],                                            name: 'Food Business Registration',       penaltyKey: 'fbd',      renewalKey: 'fbd'      },
  ]

  for (const { keywords, name, penaltyKey, renewalKey } of licenseMap) {
    const matched = keywords.some(kw => q.includes(kw))
    if (!matched) continue

    const item = compliances.find(c =>
      keywords.some(kw => c.name.toLowerCase().includes(kw)) || c.name === name
    )

    if (q.includes('penalt') || q.includes('fine') || q.includes('consequence') || q.includes('risk') || q.includes('what happen') || q.includes('if i don')) {
      const penalty = PENALTY_INFO[penaltyKey]
      if (item && item.status !== 'Completed' && daysUntil(item.dueDate) < 0) {
        return `⚠️ Your **${item.name}** has been overdue for **${Math.abs(daysUntil(item.dueDate))} days**. You are currently at risk:\n\n${penalty}\n\nPlease act immediately. Ask me "how do I fix ${item.name.replace(/ \(.*\)/, '')}" for the steps.`
      }
      return penalty || `Penalties vary by authority. Please check the official regulator's website for current penalty schedules.`
    }

    if (q.includes('document') || q.includes('need') || q.includes('require') || q.includes('paper') || q.includes('checklist')) {
      if (item) {
        return `For **${item.name}**, you'll need:\n${formatList(item.documents)}\n\nKeep all copies on site and available for inspection. Some authorities request originals for spot verification.`
      }
      return `The standard documents for ${name} include: application form, previous certificate, identity proof, and the applicable fee. Check the official authority's website for the current complete list.`
    }

    if (q.includes('how to') || q.includes('renewal process') || q.includes('steps') || q.includes('procedure') || q.includes('how do i') || q.startsWith('renew') || q.startsWith('fix') || q.startsWith('sort')) {
      const steps = RENEWAL_STEPS[renewalKey]
      if (steps) {
        return `**How to sort your ${item?.name || name}:**\n\n${steps.join('\n')}`
      }
      return `Contact the relevant authority directly or visit their website. Have your previous certificate, identity proof, and renewal fee ready. Most UK regulatory approvals take 7–14 working days — start at least 30 days before expiry.`
    }

    if (item) {
      const days = daysUntil(item.dueDate)
      if (item.status === 'Completed') return `Your **${item.name}** has been marked as completed ✓. All up to date!`
      if (days < 0)   return `⚠️ Your **${item.name}** expired **${Math.abs(days)} days ago** (${item.dueDate}). You need to act immediately. Ask me "how do I fix ${item.name.replace(/ \(.*\)/, '')}" for the steps.`
      if (days === 0)  return `🚨 Your **${item.name}** is due **TODAY** (${item.dueDate}). Please take immediate action.`
      if (days <= 7)   return `⚠️ Your **${item.name}** expires in **${days} day${days > 1 ? 's' : ''}** on ${item.dueDate}. Start the renewal process immediately — approvals take 7–14 working days.`
      if (days <= 30)  return `Your **${item.name}** expires in **${days} days** on ${item.dueDate}. I recommend starting the process this week. Want the documents checklist?`
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
    'Your compliance status looks good! '
  }\n\nTry asking:\n• "What is my FHRS inspection risk right now?"\n• "What are the penalties for expired HACCP records?"\n• "What documents do I need for my fire risk assessment?"\n• "How do I sort out my allergen compliance?"\n• "What is Owen's Law and when does it apply?"\n• "How do I renew my premises licence?"\n• "What is my health score?"`
}
