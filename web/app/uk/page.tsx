import type { Metadata } from 'next'
import RegionalLanding, { type RegionalConfig } from '@/components/RegionalLanding'

export const metadata: Metadata = {
  title: 'Complynt UK — Protect Your FHRS Rating. Stay Inspection-Ready.',
  description: 'Track FHRS inspection readiness, allergen compliance, premises licences, HMRC obligations, and fire risk assessments from one dashboard. Built for UK hospitality.',
}

const ICON = (path: string) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">${path}</svg>`

const config: RegionalConfig = {
  region:   'uk',
  lang:     'en-GB',
  title:    'Complynt UK',
  desc:     'Stay inspection-ready. Protect your FHRS rating. Never miss a compliance deadline.',
  badge:    'Live · London',
  heroHeadline: 'Your FHRS rating is public.<br><em>Make sure it works for you.</em>',
  heroSub:  '88% of UK consumers check food hygiene ratings before choosing where to eat. Complynt keeps your HACCP records, allergen compliance, and every licence deadline in order — so every EHO inspection goes smoothly.',
  heroCta:  'Start free today',
  heroNote: 'No credit card required · Set up in under 5 minutes',
  mockupUrl: 'app.complynt.co.uk · Compliance Dashboard',
  currency: '£',
  announceBar: "Owen's Law is coming — written allergen menus will be mandatory. <a href='/onboarding' style='color:white;text-decoration:underline;font-weight:600'>Get ready now →</a>",
  stats: [
    { val: '88%',  label: 'of consumers check FHRS ratings' },
    { val: '0',    label: 'missed deadlines' },
    { val: '£8K+', label: 'in fines prevented' },
  ],
  leftPanelSub: 'Every HACCP record, allergen matrix, premises licence condition, HMRC deadline, fire risk assessment, and staff right-to-work check — tracked, documented, and alerted before they become problems.',
  features: [
    {
      title: 'FHRS Inspection Readiness',
      icon: ICON('<path d="M9 12l2 2 4-4"/><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>'),
      desc: 'Know exactly where your inspection risk lies. Missing HACCP records and expired training certificates are the top two causes of sub-3 FHRS scores — Complynt flags both.',
    },
    {
      title: "Allergen Compliance & Owen's Law Prep",
      icon: ICON('<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
      desc: "Track all 14 Natasha's Law allergens. Build your written allergen menu now — get ahead of Owen's Law before it becomes mandatory in 2027–2028.",
    },
    {
      title: 'Deadline Tracking & Smart Alerts',
      icon: ICON('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
      desc: 'Every renewal date tracked with 30/7/1-day alerts before it is due — fire risk assessments, CP12 gas safety, EL insurance, premises licence, ICO registration.',
    },
    {
      title: 'Document Vault',
      icon: ICON('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>'),
      desc: 'Store your FHRS certificate, HACCP plan, premises licence, CP12, and right-to-work records — all attached to their deadlines and ready for inspection.',
    },
    {
      title: 'HMRC & Employment Compliance',
      icon: ICON('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),
      desc: 'Automated alerts for VAT returns, NLW April updates, and right-to-work check renewals. Missing an April NLW uprating is one of the most common compliance failures in hospitality.',
    },
    {
      title: 'Multi-site Dashboard',
      icon: ICON('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>'),
      desc: 'Run multiple venues? Manage compliance for all of them from a single account with per-site FHRS risk scores and a group-level compliance overview.',
    },
  ],
  categories: [
    { name: 'HACCP Records & Food Safety',    auth: 'Food Standards Agency',           icon: ICON('<path d="M9 12l2 2 4-4"/><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>') },
    { name: 'Allergen Management',            auth: "FSA / Trading Standards",          icon: ICON('<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>') },
    { name: 'Premises Licence',               auth: 'Local Authority',                  icon: ICON('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>') },
    { name: 'Fire Risk Assessment',           auth: 'Local Fire Service',               icon: ICON('<path d="M12 2c0 6-6 8-6 14a6 6 0 0012 0c0-6-6-8-6-14z"/>') },
    { name: 'Gas Safety Certificate (CP12)',  auth: 'Gas Safe Register / HSE',          icon: ICON('<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>') },
    { name: "Employer's Liability Insurance", auth: 'HSE / Insurance Provider',         icon: ICON('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>') },
    { name: 'VAT & PAYE / HMRC',             auth: 'HMRC',                             icon: ICON('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>') },
    { name: 'Right to Work Records',          auth: 'Home Office / UKVI',               icon: ICON('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>') },
    { name: 'GDPR / ICO Registration',        auth: "Information Commissioner's Office", icon: ICON('<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>') },
    { name: 'Food Business Registration',     auth: 'FSA / Local Council',              icon: ICON('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>') },
    { name: 'NLW / Payroll Compliance',       auth: 'HMRC',                             icon: ICON('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>') },
    { name: 'Staff Food Hygiene Training',    auth: 'FSA / Highfield',                  icon: ICON('<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>') },
  ],
  plans: [
    {
      name: 'Starter', price: '0', period: 'Free forever',
      features: ['Up to 3 compliance items', 'Email deadline reminders', 'Document vault (50 MB)', 'Compliance calendar'],
    },
    {
      name: 'Pro', price: '39', period: 'per month', badge: 'Most popular', featured: true,
      features: ['Unlimited compliance items', 'SMS + email reminders', 'Document vault (5 GB)', 'Multi-site (up to 5)', 'AI compliance assistant', 'Priority support', 'FHRS readiness score'],
    },
    {
      name: 'Enterprise', price: '99', period: 'per month',
      features: ['Everything in Pro', 'Unlimited sites', 'Dedicated account manager', 'Custom integrations', 'White-label option', 'SLA guarantee', 'Onboarding & training'],
    },
  ],
}

export default function UKPage() {
  return <RegionalLanding config={config} />
}
