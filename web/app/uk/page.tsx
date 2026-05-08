import type { Metadata } from 'next'
import RegionalLanding, { type RegionalConfig } from '@/components/RegionalLanding'

export const metadata: Metadata = {
  title: 'Complynt UK — Compliance Tracking for UK Hospitality',
  description: 'Track FSA, premises licences, HMRC VAT, Companies House, and HSE obligations from one dashboard. Built for UK hospitality.',
}

const ICON = (path: string) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">${path}</svg>`

const config: RegionalConfig = {
  region:   'uk',
  lang:     'en-GB',
  title:    'Complynt UK',
  desc:     'Track every FSA, premises licence, HMRC, and HSE obligation.',
  badge:    'Early Access · Starting in London',
  heroHeadline: 'Compliance sorted.<br>Business running.',
  heroSub:  'Every FSA registration, premises licence renewal, HMRC VAT return, Companies House filing, and HSE obligation — tracked and alerted well before the deadline.',
  heroCta:  'Join early access',
  heroNote: 'Free during early access · No credit card required',
  mockupUrl: 'app.complynt.co.uk · Compliance Dashboard',
  currency: '£',
  stats: [
    { val: '6+',  label: 'Licences tracked' },
    { val: '0',   label: 'Missed deadlines' },
    { val: '£8K', label: 'Fines prevented' },
  ],
  leftPanelSub: 'Every FSA registration, premises licence renewal, HMRC VAT return, Companies House filing, and HSE obligation — tracked, documented, and alerted before deadlines become disasters.',
  features: [
    { title: 'Deadline Tracking', icon: ICON('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'), desc: 'VAT quarters, Companies House deadlines, licence renewals — tracked with 30/7/1-day alerts.' },
    { title: 'Document Vault',    icon: ICON('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>'),              desc: 'Store your FSA certificate, premises licence, insurance, and DBS checks in one place.' },
    { title: 'HMRC Alerts',       icon: ICON('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),                             desc: 'Never miss a VAT return, PAYE payment, or Self Assessment deadline again.' },
    { title: 'Health & Safety',   icon: ICON('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),                                                            desc: 'Track RIDDOR reporting, fire risk assessments, and HSE inspection due dates.' },
  ],
  categories: [
    { name: 'FSA Food Registration',    auth: 'Food Standards Agency', icon: ICON('<path d="M9 12l2 2 4-4"/><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>') },
    { name: 'Premises Licence',          auth: 'Local Authority',       icon: ICON('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>') },
    { name: 'VAT Returns',               auth: 'HMRC',                  icon: ICON('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>') },
    { name: 'Companies House Filing',    auth: 'Companies House',       icon: ICON('<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>') },
    { name: 'HSE Compliance',            auth: 'Health & Safety Exec.', icon: ICON('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>') },
    { name: 'Employer Liability Ins.',   auth: 'Insurance',             icon: ICON('<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>') },
    { name: 'PAYE / Payroll',            auth: 'HMRC',                  icon: ICON('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>') },
    { name: 'Fire Risk Assessment',      auth: 'Local Fire Service',    icon: ICON('<path d="M12 2c0 6-6 8-6 14a6 6 0 0012 0c0-6-6-8-6-14z"/>') },
  ],
  plans: [
    {
      name: 'Starter', price: '0', period: 'Free forever',
      features: ['Up to 3 compliance items', 'Email reminders', 'Document vault (50 MB)', 'Deadline calendar'],
    },
    {
      name: 'Pro', price: '39', period: 'per month', badge: 'Most popular', featured: true,
      features: ['Unlimited compliance items', 'SMS + email reminders', 'Document vault (5 GB)', 'Multi-location (up to 5)', 'Priority support', 'Compliance health report'],
    },
    {
      name: 'Enterprise', price: '99', period: 'per month',
      features: ['Everything in Pro', 'Unlimited locations', 'Dedicated account manager', 'Custom integrations', 'White-label option', 'SLA guarantee'],
    },
  ],
}

export default function UKPage() {
  return <RegionalLanding config={config} />
}
