import type { Metadata } from 'next'
import RegionalLanding, { type RegionalConfig } from '@/components/RegionalLanding'

export const metadata: Metadata = {
  title: 'Complynt Australia — Compliance Tracking for Australian Businesses',
  description: 'Track Food Safety, VCGLR, Fair Work, BAS and Super obligations from one dashboard. Built for Australian hospitality.',
}

const ICON = (path: string) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">${path}</svg>`

const config: RegionalConfig = {
  region:   'au',
  lang:     'en-AU',
  title:    'Complynt Australia',
  desc:     'Track every Food Safety, VCGLR, Fair Work, BAS, and Super obligation.',
  badge:    'Built for Australia · Starting in Melbourne',
  heroHeadline: 'Your compliance,<br>always under control.',
  heroSub:  'Every food safety registration, VCGLR liquor licence, Fair Work obligation, BAS lodgement, and Super deadline — tracked and alerted before they become disasters.',
  heroCta:  'Start free today',
  heroNote: 'No credit card required · Free compliance audit included',
  mockupUrl: 'app.complynt.com.au · Compliance Dashboard',
  currency: 'A$',
  stats: [
    { val: '7+',  label: 'Licences managed' },
    { val: '0',   label: 'Missed deadlines' },
    { val: 'A$12K', label: 'Fines prevented' },
  ],
  leftPanelSub: 'Every food safety registration, VCGLR liquor licence, Fair Work obligation, BAS lodgement, and Super deadline — tracked, documented, and alerted before deadlines become disasters.',
  features: [
    { title: 'Deadline Tracking',  icon: ICON('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'), desc: 'BAS quarters, Super deadlines, licence renewals — all in one calendar with smart alerts.' },
    { title: 'Document Vault',     icon: ICON('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>'),              desc: 'Attach Food Safety certificates, licences, and WorkSafe docs to every deadline.' },
    { title: 'Fair Work Tracking', icon: ICON('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>'),                                   desc: 'Track Modern Award obligations, pay rate reviews, and employee onboarding requirements.' },
    { title: 'ATO / BAS Alerts',   icon: ICON('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),                             desc: 'Never miss a BAS lodgement or PAYG instalment with automatic ATO deadline alerts.' },
  ],
  categories: [
    { name: 'Food Safety Registration',  auth: 'Local Council',    icon: ICON('<path d="M9 12l2 2 4-4"/><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>') },
    { name: 'Liquor Licence (VCGLR)',    auth: 'VCGLR',            icon: ICON('<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>') },
    { name: 'BAS / GST Lodgement',       auth: 'ATO',              icon: ICON('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>') },
    { name: 'Superannuation',            auth: 'ATO',              icon: ICON('<path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>') },
    { name: 'Fair Work Obligations',     auth: 'Fair Work Ombudsman', icon: ICON('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>') },
    { name: 'WorkSafe Registration',     auth: 'WorkSafe Victoria', icon: ICON('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>') },
    { name: 'Business Registration',     auth: 'ASIC / ABR',       icon: ICON('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>') },
    { name: 'Health & Hygiene Cert',     auth: 'Local Council',    icon: ICON('<path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>') },
  ],
  plans: [
    {
      name: 'Starter', price: '0', period: 'Free forever',
      features: ['Up to 3 compliance items', 'Email reminders', 'Document vault (50 MB)', 'Deadline calendar'],
    },
    {
      name: 'Pro', price: '49', period: 'per month', badge: 'Most popular', featured: true,
      features: ['Unlimited compliance items', 'SMS + email reminders', 'Document vault (5 GB)', 'Multi-location (up to 5)', 'Priority support', 'Compliance health report'],
    },
    {
      name: 'Enterprise', price: '149', period: 'per month',
      features: ['Everything in Pro', 'Unlimited locations', 'Dedicated account manager', 'Custom integrations', 'White-label option', 'SLA guarantee'],
    },
  ],
}

export default function AustraliaPage() {
  return <RegionalLanding config={config} />
}
