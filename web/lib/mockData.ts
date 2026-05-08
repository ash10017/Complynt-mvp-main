import type { Compliance } from '@/types'

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function dateLabel(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const MOCK_COMPLIANCE_MAIN: Compliance[] = [
  {
    id: 1,
    name: 'FSSAI License',
    authority: 'Food Safety and Standards Authority of India',
    category: 'Food & Safety',
    frequency: 'Annual',
    description:
      'Mandatory food business operator license under the Food Safety and Standards Act, 2006. Covers all food preparation, handling, and service activities at your premises.',
    documents: [
      'Form B (FSSAI Renewal Application)',
      'ID Proof of Proprietor',
      'Kitchen Layout Plan',
      'Food Safety Management System Plan',
      'Premises Ownership / Rental Agreement',
      'Fee Challan Receipt',
    ],
    dueDate: daysFromNow(12),
    status: 'Pending',
    history: [
      `Renewed on ${dateLabel(-365)}`,
      `Documents uploaded on ${dateLabel(-372)}`,
      `Premises inspection passed on ${dateLabel(-380)}`,
      `Application submitted on ${dateLabel(-390)}`,
    ],
    vaultDocs: [
      {
        name: 'FSSAI_License_Certificate.pdf',
        url: '',
        expiry: daysFromNow(12),
        uploadedAt: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
      },
      {
        name: 'FSMS_Plan_2025.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 372 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 2,
    name: 'BBMP Trade License',
    authority: 'Bruhat Bengaluru Mahanagara Palike',
    category: 'Municipal',
    frequency: 'Annual',
    description:
      'Trade License issued by BBMP for operating a food and beverage business within Bengaluru city limits. Required for all commercial establishments before commencing operations.',
    documents: [
      'Previous Trade License Copy',
      'Property Tax Paid Receipt (latest)',
      'Building Plan Approval',
      'NOC from Landlord / Owner',
      'Identity Proof of Proprietor',
      'Rental Agreement',
    ],
    dueDate: daysFromNow(-30),
    status: 'Overdue',
    history: [
      `Renewal overdue — application not yet filed`,
      `Reminder sent on ${dateLabel(-25)}`,
      `Previous license expired on ${dateLabel(-30)}`,
      `Last renewed on ${dateLabel(-395)}`,
    ],
    vaultDocs: [
      {
        name: 'BBMP_TradeLicense_2024-25.pdf',
        url: '',
        expiry: daysFromNow(-30),
        uploadedAt: new Date(Date.now() - 395 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 3,
    name: 'Excise / Liquor License',
    authority: 'Karnataka Excise Department',
    category: 'Liquor & Bar',
    frequency: 'Annual',
    description:
      'License to serve and sell liquor (beer, wine, spirits) within the restaurant premises. Issued under the Karnataka Excise Act. Renewal must be filed 45 days before expiry.',
    documents: [
      'Form CL-9 (Renewal Application)',
      'Affidavit',
      'Scaled Floor Plan showing bar area',
      'Police NOC',
      'Solvency Certificate from bank',
      'Previous Excise License copy',
    ],
    dueDate: daysFromNow(60),
    status: 'Pending',
    history: [
      `Renewed on ${dateLabel(-305)}`,
      `Fee paid on ${dateLabel(-308)}`,
      `Application submitted on ${dateLabel(-320)}`,
    ],
    vaultDocs: [
      {
        name: 'Excise_License_CL9_2025-26.pdf',
        url: '',
        expiry: daysFromNow(60),
        uploadedAt: new Date(Date.now() - 305 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 4,
    name: 'Fire NOC',
    authority: 'Karnataka State Fire & Emergency Services',
    category: 'Safety',
    frequency: 'Annual',
    description:
      'No Objection Certificate from the Fire Department confirming that adequate fire safety measures are in place. Mandatory for all public food establishments before BBMP trade license renewal.',
    documents: [
      'Fire Safety Audit Report',
      'Scaled Floor Plan with Fire Exits marked',
      'Fire Extinguisher Service Certificate (within 6 months)',
      'Application Form KSFE-1',
      'Payment Receipt',
    ],
    dueDate: daysFromNow(3),
    status: 'Pending',
    history: [
      `Fire safety audit scheduled for ${dateLabel(1)}`,
      `Reminder: NOC expires in 3 days`,
      `Last NOC issued on ${dateLabel(-362)}`,
      `Inspection passed on ${dateLabel(-362)}`,
    ],
    vaultDocs: [],
  },
  {
    id: 5,
    name: 'Health Trade License',
    authority: 'BBMP Health Department',
    category: 'Health & Sanitation',
    frequency: 'Annual',
    description:
      "Issued by BBMP's Health Department after a physical inspection of kitchen hygiene, food handling practices, and sanitation standards. Staff medical certificates must be valid.",
    documents: [
      'Health Inspection Report',
      'Kitchen Hygiene Certificate',
      'Staff Medical Fitness Certificates (all food handlers)',
      'Water Quality Test Certificate',
    ],
    dueDate: daysFromNow(180),
    status: 'Completed',
    history: [
      `Marked complete on ${dateLabel(0)}`,
      `Inspection passed on ${dateLabel(-15)}`,
      `Application submitted on ${dateLabel(-30)}`,
      `Previous license expired on ${dateLabel(-5)}`,
    ],
    vaultDocs: [
      {
        name: 'Health_TL_2025-26.pdf',
        url: '',
        expiry: daysFromNow(180),
        uploadedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      },
      {
        name: 'Kitchen_Hygiene_Certificate.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 6,
    name: 'Eating House License',
    authority: 'Bengaluru City Police Commissioner',
    category: 'Police Licensing',
    frequency: 'Annual',
    description:
      "License issued by the Commissioner of Police to operate an eating house open to the public in Bengaluru. Required for all restaurants under Bangalore City Police Licensing Rules.",
    documents: [
      'Eating House Application Form (Police)',
      'Police Verification Certificate',
      'Identity Proof of Proprietor',
      'Property NOC',
      'Photos of Premises (front & kitchen)',
    ],
    dueDate: daysFromNow(95),
    status: 'Pending',
    history: [
      `Renewed on ${dateLabel(-270)}`,
      `Application submitted on ${dateLabel(-285)}`,
    ],
    vaultDocs: [
      {
        name: 'Eating_House_License_2025.pdf',
        url: '',
        expiry: daysFromNow(95),
        uploadedAt: new Date(Date.now() - 270 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 7,
    name: 'GST Registration',
    authority: 'Goods and Services Tax Network (GSTN)',
    category: 'Tax & Finance',
    frequency: 'Lifetime',
    description:
      'GST registration mandatory for businesses with annual turnover above ₹20 lakh. Covers collection of GST on food (5% for non-AC, 18% for AC restaurants). Returns filed monthly/quarterly.',
    documents: [
      'GSTIN Certificate',
      'Latest 3 months GST Returns (GSTR-3B)',
      'GST Annual Return (GSTR-9)',
    ],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [
      `GSTR-3B filed for March 2026`,
      `GSTR-3B filed for February 2026`,
      `GSTR-3B filed for January 2026`,
      `GSTR-9 (Annual Return) filed for FY 2024-25`,
    ],
    vaultDocs: [
      {
        name: 'GSTIN_Certificate.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 730 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 8,
    name: 'Shops & Establishments Act',
    authority: 'Karnataka Labour Department',
    category: 'Labour & HR',
    frequency: 'Annual',
    description:
      'Registration under the Karnataka Shops and Commercial Establishments Act for regulating working hours, employee leave, and employment conditions. All commercial establishments must register.',
    documents: [
      'Registration Certificate copy',
      'Employee Attendance Register',
      'Salary / Wages Register',
      'Leave Register',
    ],
    dueDate: daysFromNow(-45),
    status: 'Overdue',
    history: [
      `Renewal overdue since ${dateLabel(-45)} — filing in progress`,
      `Last renewed on ${dateLabel(-410)}`,
    ],
    vaultDocs: [],
  },
  {
    id: 9,
    name: 'ESIC Registration',
    authority: "Employees' State Insurance Corporation",
    category: 'Labour & HR',
    frequency: 'Monthly',
    description:
      'ESIC registration mandatory for businesses with 10+ employees. Provides medical, sickness, maternity, and disability benefits. Both employer (3.25%) and employee (0.75%) contribute monthly.',
    documents: [
      'ESIC Registration Certificate',
      'Monthly Contribution Challans (last 3 months)',
      'Employee Register with ESIC numbers',
    ],
    dueDate: daysFromNow(180),
    status: 'Pending',
    history: [
      `Monthly contribution filed for April 2026`,
      `Monthly contribution filed for March 2026`,
      `Monthly contribution filed for February 2026`,
      `Annual returns submitted for FY 2024-25`,
    ],
    vaultDocs: [
      {
        name: 'ESIC_Registration_Certificate.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 540 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 10,
    name: 'EPFO / PF Registration',
    authority: "Employees' Provident Fund Organisation",
    category: 'Labour & HR',
    frequency: 'Monthly',
    description:
      'Provident Fund registration mandatory for businesses with 20+ employees. Employer and employee each contribute 12% of basic salary. Monthly ECR (Electronic Challan cum Return) must be filed.',
    documents: [
      'PF Registration Certificate',
      'Monthly ECR Challans (last 3 months)',
      'Employee UAN (Universal Account Number) list',
    ],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [
      `Monthly ECR filed for April 2026`,
      `Monthly ECR filed for March 2026`,
      `Monthly ECR filed for February 2026`,
      `Annual accounts submitted`,
    ],
    vaultDocs: [
      {
        name: 'EPFO_Registration_Certificate.pdf',
        url: '',
        expiry: '',
        uploadedAt: new Date(Date.now() - 720 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 11,
    name: 'PCB Consent to Operate',
    authority: 'Karnataka State Pollution Control Board',
    category: 'Environmental',
    frequency: 'Annual',
    description:
      'Consent to Operate from KSPCB required for commercial kitchens under the Air (Prevention & Control of Pollution) Act and Water (Prevention & Control of Pollution) Act. Restaurant kitchens must apply under Orange category.',
    documents: [
      'Form PCB-2 (Renewal Application)',
      'Previous Consent Certificate',
      'Site Layout Plan',
      'Effluent/Waste Water Disposal Details',
      'Emission Test Report (chimney/exhaust)',
    ],
    dueDate: daysFromNow(22),
    status: 'Pending',
    history: [
      `Renewal application to be submitted by ${dateLabel(7)}`,
      `Last consent issued on ${dateLabel(-343)}`,
    ],
    vaultDocs: [],
  },
  {
    id: 12,
    name: 'Lift / Elevator License',
    authority: 'Karnataka Electrical Inspectorate',
    category: 'Safety',
    frequency: 'Annual',
    description:
      'Annual inspection and licensing for commercial lifts and elevators under the Karnataka Lifts and Escalators Act, 2011. A competency certificate from a certified engineer is required.',
    documents: [
      'Lift Annual Inspection Certificate',
      'Competency Certificate from Lift Engineer',
      'AMC (Annual Maintenance Contract) copy',
      'Previous License',
    ],
    dueDate: daysFromNow(120),
    status: 'Pending',
    history: [
      `Annual inspection scheduled for ${dateLabel(90)}`,
      `Last inspection passed on ${dateLabel(-245)}`,
    ],
    vaultDocs: [
      {
        name: 'Lift_License_2025.pdf',
        url: '',
        expiry: daysFromNow(120),
        uploadedAt: new Date(Date.now() - 245 * 24 * 3600 * 1000).toISOString(),
      },
    ],
  },
]

export const MOCK_COMPLIANCE_CLOUD: Compliance[] = [
  {
    id: 101,
    name: 'FSSAI License (Cloud Kitchen)',
    authority: 'Food Safety and Standards Authority of India',
    category: 'Food & Safety',
    frequency: 'Annual',
    description: 'FSSAI state license for cloud kitchen operations covering food preparation and packaging for delivery. Requires annual renewal and adherence to FSMS standards.',
    documents: ['FSSAI License Certificate', 'Kitchen Inspection Report', 'Food Safety Management System Plan'],
    dueDate: daysFromNow(145),
    status: 'Pending',
    history: [`Renewed on ${dateLabel(-220)}`, `Inspection passed on ${dateLabel(-225)}`],
    vaultDocs: [
      { name: 'FSSAI_CloudKitchen_2025.pdf', url: '', expiry: daysFromNow(145), uploadedAt: new Date(Date.now() - 220 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 102,
    name: 'BBMP Trade License',
    authority: 'Bruhat Bengaluru Mahanagara Palike',
    category: 'Municipal',
    frequency: 'Annual',
    description: 'BBMP trade license for commercial kitchen operations at the cloud kitchen premises.',
    documents: ['Trade License Copy', 'Property Tax Receipt', 'Rental Agreement'],
    dueDate: daysFromNow(75),
    status: 'Pending',
    history: [`Renewed on ${dateLabel(-290)}`, `Fee paid on ${dateLabel(-292)}`],
    vaultDocs: [
      { name: 'BBMP_TL_CloudKitchen.pdf', url: '', expiry: daysFromNow(75), uploadedAt: new Date(Date.now() - 290 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 103,
    name: 'Shops & Establishments Act',
    authority: 'Karnataka Labour Department',
    category: 'Labour & HR',
    frequency: 'Annual',
    description: 'Registration under Karnataka S&E Act for the cloud kitchen establishment and its staff.',
    documents: ['Registration Certificate', 'Employee Register'],
    dueDate: daysFromNow(-12),
    status: 'Overdue',
    history: [`Renewal overdue since ${dateLabel(-12)} — filing in progress`],
    vaultDocs: [],
  },
  {
    id: 104,
    name: 'Fire NOC (Kitchen)',
    authority: 'Karnataka State Fire & Emergency Services',
    category: 'Safety',
    frequency: 'Annual',
    description: 'Fire safety NOC for the commercial kitchen operations.',
    documents: ['Fire Audit Report', 'Fire Extinguisher Service Certificate', 'Floor Plan'],
    dueDate: daysFromNow(85),
    status: 'Pending',
    history: [`Renewed on ${dateLabel(-280)}`, `Inspection passed on ${dateLabel(-282)}`],
    vaultDocs: [
      { name: 'FireNOC_CloudKitchen.pdf', url: '', expiry: daysFromNow(85), uploadedAt: new Date(Date.now() - 280 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 105,
    name: 'PCB Consent to Operate',
    authority: 'Karnataka State Pollution Control Board',
    category: 'Environmental',
    frequency: 'Annual',
    description: 'KSPCB consent to operate for the cloud kitchen under pollution control regulations.',
    documents: ['PCB Consent Certificate', 'Application Form PCB-2'],
    dueDate: daysFromNow(200),
    status: 'Pending',
    history: [`Consent renewed on ${dateLabel(-165)}`],
    vaultDocs: [
      { name: 'PCB_CloudKitchen.pdf', url: '', expiry: daysFromNow(200), uploadedAt: new Date(Date.now() - 165 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 106,
    name: 'GST Registration',
    authority: 'Goods and Services Tax Network (GSTN)',
    category: 'Tax & Finance',
    frequency: 'Lifetime',
    description: 'GST registration for cloud kitchen business covering delivery platform sales.',
    documents: ['GSTIN Certificate', 'Latest Monthly Returns'],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [`April 2026 GSTR-3B filed`, `March 2026 GSTR-3B filed`],
    vaultDocs: [
      { name: 'GSTIN_CloudKitchen.pdf', url: '', expiry: '', uploadedAt: new Date(Date.now() - 500 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 107,
    name: 'EPFO / PF Registration',
    authority: "Employees' Provident Fund Organisation",
    category: 'Labour & HR',
    frequency: 'Monthly',
    description: 'PF compliance for cloud kitchen staff.',
    documents: ['PF Registration Certificate', 'Monthly ECR Challans'],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [`April 2026 ECR filed`, `March 2026 ECR filed`],
    vaultDocs: [],
  },
  {
    id: 108,
    name: 'Health Trade License',
    authority: 'BBMP Health Department',
    category: 'Health & Sanitation',
    frequency: 'Annual',
    description: 'Health department certification for food preparation facility at the cloud kitchen.',
    documents: ['Health Inspection Report', 'Kitchen Hygiene Certificate'],
    dueDate: daysFromNow(160),
    status: 'Completed',
    history: [`Inspection passed on ${dateLabel(-5)}`, `Marked complete`],
    vaultDocs: [
      { name: 'Health_TL_CloudKitchen.pdf', url: '', expiry: daysFromNow(160), uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() },
    ],
  },
]

export const MOCK_COMPLIANCE_CAFE: Compliance[] = [
  {
    id: 201,
    name: 'FSSAI License (Café)',
    authority: 'Food Safety and Standards Authority of India',
    category: 'Food & Safety',
    frequency: 'Annual',
    description: 'FSSAI state license for café serving beverages and light food items. Covers tea, coffee, bakery items, and snacks.',
    documents: ['FSSAI Certificate', 'Food Safety Plan', 'Kitchen Inspection Report'],
    dueDate: daysFromNow(200),
    status: 'Pending',
    history: [`Renewed on ${dateLabel(-165)}`, `Inspection passed on ${dateLabel(-170)}`],
    vaultDocs: [
      { name: 'FSSAI_Cafe_2025.pdf', url: '', expiry: daysFromNow(200), uploadedAt: new Date(Date.now() - 165 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 202,
    name: 'BBMP Trade License',
    authority: 'Bruhat Bengaluru Mahanagara Palike',
    category: 'Municipal',
    frequency: 'Annual',
    description: 'Trade license for café operations within BBMP jurisdiction.',
    documents: ['Trade License Copy', 'Property Tax Receipt', 'Rental Agreement'],
    dueDate: daysFromNow(18),
    status: 'Pending',
    history: [`Application filed on ${dateLabel(-2)}`, `Renewal due on ${dateLabel(18)}`],
    vaultDocs: [],
  },
  {
    id: 203,
    name: 'Fire NOC',
    authority: 'Karnataka State Fire & Emergency Services',
    category: 'Safety',
    frequency: 'Annual',
    description: 'Fire safety NOC for café premises covering seating area, kitchen, and electrical installations.',
    documents: ['Fire Audit Report', 'Extinguisher Certificate', 'Floor Plan'],
    dueDate: daysFromNow(110),
    status: 'Pending',
    history: [`Renewed on ${dateLabel(-255)}`, `Inspection cleared on ${dateLabel(-258)}`],
    vaultDocs: [
      { name: 'FireNOC_Cafe.pdf', url: '', expiry: daysFromNow(110), uploadedAt: new Date(Date.now() - 255 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 204,
    name: 'GST Registration',
    authority: 'Goods and Services Tax Network (GSTN)',
    category: 'Tax & Finance',
    frequency: 'Lifetime',
    description: 'GST registration for the café. 5% GST applies on food and beverages for non-AC seating; 18% for AC areas.',
    documents: ['GSTIN Certificate', 'Latest GSTR-3B'],
    dueDate: daysFromNow(365),
    status: 'Completed',
    history: [`April 2026 returns filed`, `March 2026 returns filed`],
    vaultDocs: [
      { name: 'GSTIN_Cafe.pdf', url: '', expiry: '', uploadedAt: new Date(Date.now() - 600 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 205,
    name: 'Health Trade License',
    authority: 'BBMP Health Department',
    category: 'Health & Sanitation',
    frequency: 'Annual',
    description: 'Health trade license for food and beverage service at the café.',
    documents: ['Health Inspection Report', 'Kitchen Hygiene Certificate', 'Staff Medical Certificates'],
    dueDate: daysFromNow(250),
    status: 'Completed',
    history: [`Inspection passed on ${dateLabel(-20)}`, `Marked complete`],
    vaultDocs: [
      { name: 'Health_TL_Cafe.pdf', url: '', expiry: daysFromNow(250), uploadedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString() },
    ],
  },
  {
    id: 206,
    name: 'Shops & Establishments Act',
    authority: 'Karnataka Labour Department',
    category: 'Labour & HR',
    frequency: 'Annual',
    description: 'S&E registration for café staff management and working conditions compliance.',
    documents: ['S&E Certificate', 'Employee Attendance Register', 'Salary Register'],
    dueDate: daysFromNow(150),
    status: 'Pending',
    history: [`Renewed on ${dateLabel(-215)}`, `Registration updated on ${dateLabel(-220)}`],
    vaultDocs: [
      { name: 'SE_Cafe.pdf', url: '', expiry: daysFromNow(150), uploadedAt: new Date(Date.now() - 215 * 24 * 3600 * 1000).toISOString() },
    ],
  },
]

export const MOCK_LOCATIONS = [
  {
    id: 'main',
    name: 'The Grand Spice',
    subtitle: 'Main Restaurant · Koramangala',
    compliances: MOCK_COMPLIANCE_MAIN,
  },
  {
    id: 'cloud',
    name: 'Quick Bites',
    subtitle: 'Cloud Kitchen · HSR Layout',
    compliances: MOCK_COMPLIANCE_CLOUD,
  },
  {
    id: 'cafe',
    name: 'The Coffee Nook',
    subtitle: 'Café Branch · Indiranagar',
    compliances: MOCK_COMPLIANCE_CAFE,
  },
]

export const MOCK_USER_PROFILE = {
  bizType:           'restaurant',
  alertPrefs:        { email: 'testing@testing.com', phone: '+91 98765 43210', method: 'both' },
  onboardingComplete: true,
  displayName:       'The Grand Spice',
  createdAt:         new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
}
