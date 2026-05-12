import type { Compliance } from '@/types'

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function dateLabel(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// The Crown & Kitchen — Restaurant & Bar, Soho, London
// 2 overdue, 3 due soon, 4 on track, 3 completed = health ~58%
export const MOCK_COMPLIANCE_MAIN: Compliance[] = [
  {
    id: 1,
    name: 'HACCP Records & Food Safety Management',
    authority: 'Food Standards Agency (EHO)',
    category: 'Food Safety',
    frequency: 'Ongoing',
    description:
      'HACCP documentation is the first thing an Environmental Health Officer checks at inspection. Missing or outdated records are the #1 cause of sub-3 FHRS ratings. Covers your food safety management system, temperature logs, cleaning schedules, and supplier due diligence.',
    documents: [
      'HACCP Plan (adapted to your specific kitchen — not a template)',
      'Daily Temperature Logs (fridge, freezer, hot-holding)',
      'Cleaning Schedule with signed completion records',
      'Supplier Due Diligence Records',
      'Pest Control Log',
      'Staff Training Records',
    ],
    dueDate: daysFromNow(-30),
    status: 'Overdue',
    history: [
      `HACCP records last reviewed on ${dateLabel(-395)}`,
      `EHO flagged incomplete temperature logs on ${dateLabel(-30)}`,
      `Reminder issued on ${dateLabel(-25)}`,
      `Previous full HACCP audit on ${dateLabel(-395)}`,
    ],
    vaultDocs: [
      {
        name: 'HACCP_Plan_2024.pdf',
        url: '',
        expiry: daysFromNow(-30),
        uploadedAt: new Date(Date.now() - 395 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 2,
    name: 'Staff Food Hygiene Training',
    authority: 'Food Standards Agency / Highfield',
    category: 'Food Safety',
    frequency: 'Every 3 years',
    description:
      'Level 2 Award in Food Safety for Catering required for all food handlers. Certificates expire every 3 years. EHO inspectors routinely check training records — expired certificates count against your FHRS score.',
    documents: [
      'Level 2 Food Hygiene Certificates (all food handlers)',
      'Level 3 Award in Food Safety (supervisors/managers)',
      'Allergen Awareness Training Certificates',
      'Staff Training Register',
    ],
    dueDate: daysFromNow(-45),
    status: 'Overdue',
    history: [
      `Training certificates expired on ${dateLabel(-45)}`,
      `Renewal in progress — 3 staff re-booked on ${dateLabel(-10)}`,
      `Last training completed on ${dateLabel(-1125)}`,
      `All staff certified on ${dateLabel(-1130)}`,
    ],
    vaultDocs: [],
  },
  {
    id: 3,
    name: "Allergen Management Review (Natasha's Law)",
    authority: 'FSA / Trading Standards',
    category: 'Food Safety',
    frequency: 'Per menu change',
    description:
      "Natasha's Law (2021) requires full allergen labelling on all PPDS food. All 14 regulated allergens must be declared in writing, staff must be trained, and allergen information provided before customers order. A recent menu change has triggered this review.",
    documents: [
      'Allergen Matrix (all dishes mapped against 14 allergens)',
      'Written Allergen Information for Customers',
      'Supplier Ingredient Declarations',
      'Allergen Awareness Training Records',
      'Allergen Cross-Contamination Procedure',
    ],
    dueDate: daysFromNow(12),
    status: 'Pending',
    history: [
      `Menu updated on ${dateLabel(-5)} — allergen review triggered`,
      `Previous allergen review on ${dateLabel(-90)}`,
      `Natasha's Law training for all staff on ${dateLabel(-180)}`,
    ],
    vaultDocs: [
      {
        name: 'Allergen_Matrix_v3.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 4,
    name: 'Fire Risk Assessment',
    authority: 'London Fire Brigade',
    category: 'Safety',
    frequency: 'Annual',
    description:
      'Mandatory annual fire risk assessment under the Regulatory Reform (Fire Safety) Order 2005. Must cover detection systems, escape routes, extinguisher provision, staff fire training, and any premises changes since the last assessment.',
    documents: [
      'Fire Risk Assessment Report (signed by competent person)',
      'Fire Detection System Service Certificate',
      'Fire Extinguisher Annual Service Record',
      'Emergency Evacuation Plan and Signage',
      'Staff Fire Safety Training Records',
    ],
    dueDate: daysFromNow(3),
    status: 'Pending',
    history: [
      `Fire risk assessor booked for ${dateLabel(2)}`,
      `Current assessment expires in 3 days`,
      `Previous assessment on ${dateLabel(-362)}`,
      `Fire extinguisher service completed on ${dateLabel(-30)}`,
    ],
    vaultDocs: [
      {
        name: 'FireRiskAssessment_2024.pdf',
        url: '',
        expiry: daysFromNow(3),
        uploadedAt: new Date(Date.now() - 362 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 5,
    name: "Employer's Liability Insurance",
    authority: 'HSE / Insurance Provider',
    category: 'Legal',
    frequency: 'Annual',
    description:
      "Mandatory employer's liability insurance (minimum £5 million cover) under the Employers' Liability (Compulsory Insurance) Act 1969. The certificate must be displayed at the premises. Fine of £2,500 per day uninsured.",
    documents: [
      "Employer's Liability Insurance Certificate",
      'Insurance Policy Schedule',
      'Renewal Confirmation Letter',
    ],
    dueDate: daysFromNow(22),
    status: 'Pending',
    history: [
      `Renewal quote received on ${dateLabel(-3)}`,
      `Current policy expires on ${dateLabel(22)}`,
      `Previous policy issued on ${dateLabel(-343)}`,
    ],
    vaultDocs: [
      {
        name: 'EL_Insurance_Certificate_2024.pdf',
        url: '',
        expiry: daysFromNow(22),
        uploadedAt: new Date(Date.now() - 343 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 6,
    name: 'Premises Licence (Licensing Act 2003)',
    authority: 'Westminster City Council',
    category: 'Licensing',
    frequency: 'Ongoing',
    description:
      'Premises licence authorising the sale of alcohol and late-night refreshment under the Licensing Act 2003. Any change to operating hours, layout, or licensable activities requires a variation. DBS check required for the Designated Premises Supervisor.',
    documents: [
      'Premises Licence (original document)',
      'DPS DBS Certificate (within 3 years)',
      'Challenge 25 ID Policy Statement',
      'Refusal Register',
      'Licence Conditions Summary for Staff',
    ],
    dueDate: daysFromNow(60),
    status: 'Pending',
    history: [
      `Annual licence review scheduled for ${dateLabel(45)}`,
      `DPS DBS renewed on ${dateLabel(-90)}`,
      `Licence conditions reviewed on ${dateLabel(-180)}`,
      `Licence granted on ${dateLabel(-730)}`,
    ],
    vaultDocs: [
      {
        name: 'Premises_Licence_Westminster.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 730 * 24 * 3600 * 1000).toISOString(),
      },
      {
        name: 'DPS_DBS_Certificate.pdf',
        url: '',
        expiry: daysFromNow(960),
        uploadedAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 7,
    name: 'National Living Wage Payroll Review',
    authority: 'HMRC',
    category: 'Labour & HR',
    frequency: 'Annual (April)',
    description:
      'The National Living Wage is updated every April. All payroll must be updated immediately — HMRC runs active enforcement campaigns in hospitality. Missed upratings are one of the most common compliance failures in the sector.',
    documents: [
      'Payroll Records showing NLW compliance',
      'Employee Pay Rate Review Document',
      'PAYE Settlement Records',
    ],
    dueDate: daysFromNow(95),
    status: 'Pending',
    history: [
      `Next NLW review due April 2027`,
      `April 2026 NLW update applied on ${dateLabel(-365)}`,
      `Payroll confirmed compliant on ${dateLabel(-360)}`,
      `HMRC NLW rates reviewed and implemented`,
    ],
    vaultDocs: [
      {
        name: 'NLW_Compliance_April2026.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 360 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 8,
    name: 'GDPR / ICO Data Protection Registration',
    authority: "Information Commissioner's Office (ICO)",
    category: 'Data & Privacy',
    frequency: 'Annual',
    description:
      'Annual registration with the ICO required under UK GDPR for any business collecting customer data — booking systems, loyalty schemes, email marketing. Failure to register is a criminal offence. Requires a privacy policy and documented lawful basis for data processing.',
    documents: [
      'ICO Registration Certificate',
      'Privacy Policy (customer-facing)',
      'Data Retention Policy',
      'Data Protection Training Records',
    ],
    dueDate: daysFromNow(120),
    status: 'Pending',
    history: [
      `ICO registration renewed on ${dateLabel(-245)}`,
      `Annual fee £40 paid on ${dateLabel(-245)}`,
      `Privacy policy updated on ${dateLabel(-200)}`,
    ],
    vaultDocs: [
      {
        name: 'ICO_Registration_Certificate.pdf',
        url: '',
        expiry: daysFromNow(120),
        uploadedAt: new Date(Date.now() - 245 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 9,
    name: 'Gas Safety Certificate (CP12)',
    authority: 'Gas Safe Register / HSE',
    category: 'Safety',
    frequency: 'Annual',
    description:
      'Annual gas safety inspection by a Gas Safe registered engineer for all gas appliances — kitchen range, boiler, and gas lines. The CP12 certificate is legally required annually under the Gas Safety (Installation and Use) Regulations 1998.',
    documents: [
      'Gas Safety Certificate (CP12)',
      'Gas Safe Registered Engineer Report',
      'Boiler and Appliance Service Record',
    ],
    dueDate: daysFromNow(180),
    status: 'Pending',
    history: [
      `Gas safety inspection on ${dateLabel(-185)} — all appliances passed`,
      `CP12 certificate issued on ${dateLabel(-185)}`,
      `Gas Safe Registered Engineer: Reg. 562341`,
    ],
    vaultDocs: [
      {
        name: 'CP12_GasSafety_2025.pdf',
        url: '',
        expiry: daysFromNow(180),
        uploadedAt: new Date(Date.now() - 185 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 10,
    name: 'Food Business Registration',
    authority: 'FSA / Westminster City Council',
    category: 'Food Safety',
    frequency: 'One-time',
    description:
      'Mandatory registration with the local authority under the Food Safety and Hygiene (England) Regulations 2013. Must be completed at least 28 days before trading. Underpins your FHRS rating — the registered address is what the EHO inspects.',
    documents: [
      'Food Business Registration Certificate',
      'EHO Inspection Report',
      'FHRS Certificate (Food Hygiene Rating)',
    ],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [
      `FHRS rating: 4 stars received on ${dateLabel(-180)}`,
      `EHO inspection passed on ${dateLabel(-180)}`,
      `Food business registered with Westminster Council on ${dateLabel(-730)}`,
    ],
    vaultDocs: [
      {
        name: 'FoodBusiness_Registration.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 730 * 24 * 3600 * 1000).toISOString(),
      },
      {
        name: 'FHRS_Certificate_4stars.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 180 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 11,
    name: 'VAT Registration & MTD Returns',
    authority: 'HMRC',
    category: 'Tax',
    frequency: 'Quarterly',
    description:
      'VAT registration for businesses with taxable turnover above £90,000. Quarterly VAT returns via Making Tax Digital (MTD). Standard rate 20% applies to hot food and drinks served in a restaurant. Back-payments plus penalties apply for late registration.',
    documents: [
      'VAT Registration Certificate (VAT 1)',
      'Quarterly VAT Returns (last 4)',
      'MTD Software Authorisation',
      'VAT Account Records',
    ],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [
      `Q1 2026 VAT return submitted on ${dateLabel(-30)}`,
      `Q4 2025 VAT return submitted on ${dateLabel(-120)}`,
      `Q3 2025 VAT return submitted on ${dateLabel(-210)}`,
      `MTD software authorised and active`,
    ],
    vaultDocs: [
      {
        name: 'VAT_Registration_Certificate.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 1095 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 12,
    name: 'Right to Work Records',
    authority: 'Home Office / UKVI',
    category: 'Labour & HR',
    frequency: 'Per hire',
    description:
      "Right to work checks required for every employee before they start. Post-Brexit, EU citizens require the same checks as non-EU workers — UK settled status or valid visa. Civil penalty up to £45,000 per illegal worker. Illegal working is a criminal offence.",
    documents: [
      'Right to Work Check Records (all employees)',
      'Passport / Biometric Residence Permit Copies',
      'EU Settled Status Share Code Checks',
      'RTW Check Policy and Procedure',
    ],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [
      `Right to work audit completed on ${dateLabel(-10)}`,
      `All 14 staff records verified and filed`,
      `3 EU settled status share codes confirmed`,
      `2 new hire RTW checks completed on ${dateLabel(-15)}`,
    ],
    vaultDocs: [
      {
        name: 'RTW_Records_Register.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
]

// Spice Routes — Delivery Kitchen, Hackney
// 1 overdue, 5 on track, 2 completed = health ~88%
export const MOCK_COMPLIANCE_DELIVERY: Compliance[] = [
  {
    id: 101,
    name: 'Food Business Registration',
    authority: 'FSA / Hackney Council',
    category: 'Food Safety',
    frequency: 'One-time',
    description: 'Mandatory food business registration with Hackney Council. Underpins the FHRS rating for this delivery kitchen site.',
    documents: ['Food Business Registration Certificate', 'EHO Inspection Report', 'FHRS Certificate'],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [`Registered with Hackney Council on ${dateLabel(-600)}`, `EHO inspection passed on ${dateLabel(-400)}`],
    vaultDocs: [
      { name: 'FoodBusiness_Registration_Hackney.pdf', url: '', expiry: '', uploadedAt: new Date(Date.now() - 600 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 102,
    name: 'HACCP Records & Food Safety Management',
    authority: 'Food Standards Agency (EHO)',
    category: 'Food Safety',
    frequency: 'Ongoing',
    description: 'HACCP documentation for delivery kitchen operations. Temperature logs and cleaning schedules are critical for any EHO inspection.',
    documents: ['HACCP Plan', 'Temperature Logs', 'Cleaning Schedule', 'Supplier Records'],
    dueDate: daysFromNow(-12),
    status: 'Overdue',
    history: [`HACCP records overdue since ${dateLabel(-12)}`, `Last review on ${dateLabel(-377)}`],
    vaultDocs: [
      { name: 'HACCP_Plan_Hackney.pdf', url: '', expiry: daysFromNow(-12), uploadedAt: new Date(Date.now() - 377 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 103,
    name: "Allergen Management Review (Natasha's Law)",
    authority: 'FSA / Trading Standards',
    category: 'Food Safety',
    frequency: 'Per menu change',
    description: "Allergen compliance under Natasha's Law. Delivery platforms require allergen information to be listed on all menus — non-compliance can lead to platform delisting.",
    documents: ['Allergen Matrix', 'Delivery Platform Allergen Declarations', 'Staff Training Records'],
    dueDate: daysFromNow(75),
    status: 'Pending',
    history: [`Last allergen review on ${dateLabel(-290)}`, `Delivery menu allergen update pending`],
    vaultDocs: [
      { name: 'Allergen_Matrix_Delivery.pdf', url: '', expiry: '', uploadedAt: new Date(Date.now() - 290 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 104,
    name: 'Gas Safety Certificate (CP12)',
    authority: 'Gas Safe Register / HSE',
    category: 'Safety',
    frequency: 'Annual',
    description: 'Annual gas safety inspection for all kitchen gas appliances at the delivery kitchen.',
    documents: ['CP12 Certificate', 'Gas Safe Engineer Report', 'Appliance Service Records'],
    dueDate: daysFromNow(85),
    status: 'Pending',
    history: [`Gas inspection on ${dateLabel(-280)}`, `CP12 issued on ${dateLabel(-280)}`],
    vaultDocs: [
      { name: 'CP12_Hackney_2025.pdf', url: '', expiry: daysFromNow(85), uploadedAt: new Date(Date.now() - 280 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 105,
    name: "Employer's Liability Insurance",
    authority: 'HSE / Insurance Provider',
    category: 'Legal',
    frequency: 'Annual',
    description: "Mandatory EL insurance (minimum £5m cover) for all employees at the delivery kitchen site.",
    documents: ["Employer's Liability Insurance Certificate", 'Policy Schedule'],
    dueDate: daysFromNow(160),
    status: 'Pending',
    history: [`Current policy expires on ${dateLabel(160)}`, `Last renewed on ${dateLabel(-205)}`],
    vaultDocs: [
      { name: 'EL_Insurance_Hackney.pdf', url: '', expiry: daysFromNow(160), uploadedAt: new Date(Date.now() - 205 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 106,
    name: 'National Living Wage Payroll Review',
    authority: 'HMRC',
    category: 'Labour & HR',
    frequency: 'Annual (April)',
    description: 'Payroll must reflect the April NLW update across all delivery kitchen staff.',
    documents: ['Payroll Records', 'NLW Rate Confirmation', 'PAYE Records'],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [`April 2026 NLW update applied on ${dateLabel(-365)}`, `All staff payroll confirmed compliant`],
    vaultDocs: [],
  },
  {
    id: 107,
    name: 'Right to Work Records',
    authority: 'Home Office / UKVI',
    category: 'Labour & HR',
    frequency: 'Per hire',
    description: 'Right to work checks for all delivery kitchen employees before they start.',
    documents: ['RTW Check Records', 'Passport Copies', 'EU Share Code Records'],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [`RTW audit on ${dateLabel(-20)}`, `All 8 staff records verified`],
    vaultDocs: [],
  },
  {
    id: 108,
    name: 'GDPR / ICO Data Protection Registration',
    authority: "Information Commissioner's Office (ICO)",
    category: 'Data & Privacy',
    frequency: 'Annual',
    description: 'Annual ICO registration for delivery kitchen customer data — order records and email marketing to past customers.',
    documents: ['ICO Registration Certificate', 'Privacy Policy', 'Data Retention Policy'],
    dueDate: daysFromNow(200),
    status: 'Pending',
    history: [`ICO registration renewed on ${dateLabel(-165)}`, `Annual fee paid on ${dateLabel(-165)}`],
    vaultDocs: [
      { name: 'ICO_Registration_Hackney.pdf', url: '', expiry: daysFromNow(200), uploadedAt: new Date(Date.now() - 165 * 24 * 3600 * 1000).toISOString() },
    ],
  },
]

// The Nook — Café, Notting Hill
// 0 overdue, 2 due soon, 2 on track, 2 completed = health ~67%
export const MOCK_COMPLIANCE_CAFE: Compliance[] = [
  {
    id: 201,
    name: 'Food Business Registration',
    authority: 'FSA / Royal Borough of Kensington & Chelsea',
    category: 'Food Safety',
    frequency: 'One-time',
    description: 'Food business registration for the Notting Hill café. The FHRS rating (currently 5 stars) is tied to this registration.',
    documents: ['Food Business Registration Certificate', 'FHRS Certificate', 'EHO Inspection Report'],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [`Registered with RBKC on ${dateLabel(-540)}`, `EHO inspection: 5 stars on ${dateLabel(-200)}`],
    vaultDocs: [
      { name: 'FoodBusiness_Registration_NottingHill.pdf', url: '', expiry: '', uploadedAt: new Date(Date.now() - 540 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 202,
    name: "Allergen Management Review (Natasha's Law)",
    authority: 'FSA / Trading Standards',
    category: 'Food Safety',
    frequency: 'Per menu change',
    description: "Allergen review triggered by seasonal menu change. Natasha's Law compliance required — written allergen information must be available for every food item.",
    documents: ['Allergen Matrix', 'Written Allergen Menu', 'Supplier Declarations', 'Staff Training Records'],
    dueDate: daysFromNow(18),
    status: 'Pending',
    history: [`Seasonal menu change on ${dateLabel(-7)}`, `Previous review on ${dateLabel(-110)}`],
    vaultDocs: [],
  },
  {
    id: 203,
    name: 'Fire Risk Assessment',
    authority: 'London Fire Brigade',
    category: 'Safety',
    frequency: 'Annual',
    description: 'Annual fire risk assessment for the café premises under the Regulatory Reform (Fire Safety) Order 2005.',
    documents: ['Fire Risk Assessment Report', 'Extinguisher Service Record', 'Emergency Evacuation Plan'],
    dueDate: daysFromNow(22),
    status: 'Pending',
    history: [`Assessment due in 22 days — assessor booked`, `Previous assessment on ${dateLabel(-343)}`],
    vaultDocs: [
      { name: 'FireRiskAssessment_Cafe.pdf', url: '', expiry: daysFromNow(22), uploadedAt: new Date(Date.now() - 343 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 204,
    name: 'National Living Wage Payroll Review',
    authority: 'HMRC',
    category: 'Labour & HR',
    frequency: 'Annual (April)',
    description: 'Annual NLW payroll compliance check for café staff. April rate update must be applied immediately.',
    documents: ['Payroll Records', 'NLW Rate Evidence', 'PAYE Records'],
    dueDate: daysFromNow(110),
    status: 'Pending',
    history: [`Next review due April 2027`, `April 2026 rates applied on ${dateLabel(-365)}`],
    vaultDocs: [],
  },
  {
    id: 205,
    name: 'GDPR / ICO Data Protection Registration',
    authority: "Information Commissioner's Office (ICO)",
    category: 'Data & Privacy',
    frequency: 'Annual',
    description: 'Annual ICO registration for café customer data — loyalty card scheme and email newsletter subscribers.',
    documents: ['ICO Registration Certificate', 'Privacy Policy', 'Data Retention Policy'],
    dueDate: daysFromNow(150),
    status: 'Pending',
    history: [`ICO registration renewed on ${dateLabel(-215)}`, `Loyalty scheme data audit completed on ${dateLabel(-100)}`],
    vaultDocs: [
      { name: 'ICO_Registration_Cafe.pdf', url: '', expiry: daysFromNow(150), uploadedAt: new Date(Date.now() - 215 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 206,
    name: 'Right to Work Records',
    authority: 'Home Office / UKVI',
    category: 'Labour & HR',
    frequency: 'Per hire',
    description: 'Right to work checks for all café staff, including one EU national requiring settled status verification.',
    documents: ['RTW Check Records', 'Passport Copies', 'EU Share Code Records'],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [`RTW audit completed on ${dateLabel(-5)}`, `All 6 staff records verified`, `1 EU settled status share code confirmed`],
    vaultDocs: [
      { name: 'RTW_Records_Cafe.pdf', url: '', expiry: '', uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    ],
  },
]

export const MOCK_LOCATIONS = [
  {
    id: 'main',
    name: 'The Crown & Kitchen',
    subtitle: 'Restaurant & Bar · Soho, London',
    compliances: MOCK_COMPLIANCE_MAIN,
  },
  {
    id: 'delivery',
    name: 'Spice Routes',
    subtitle: 'Delivery Kitchen · Hackney',
    compliances: MOCK_COMPLIANCE_DELIVERY,
  },
  {
    id: 'cafe',
    name: 'The Nook',
    subtitle: 'Café · Notting Hill',
    compliances: MOCK_COMPLIANCE_CAFE,
  },
]

export const MOCK_USER_PROFILE = {
  bizType:            'restaurant',
  alertPrefs:         { email: 'testing@testing.com', phone: '+44 7700 900123', method: 'both' },
  onboardingComplete: true,
  displayName:        'The Crown & Kitchen',
  createdAt:          new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
}
