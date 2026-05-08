import type { Metadata } from 'next'
import RegionalLanding, { type RegionalConfig } from '@/components/RegionalLanding'

export const metadata: Metadata = {
  title: 'Complynt India — Compliance Made Simple for Indian Businesses',
  description: 'Track every FSSAI, BBMP, Excise, and labour compliance from one dashboard. Zero missed deadlines. Built for Indian F&B and hospitality.',
}

const ICON = (path: string) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">${path}</svg>`

const config: RegionalConfig = {
  region:   'in',
  lang:     'en-IN',
  title:    'Complynt India',
  desc:     'Track every FSSAI, BBMP, Excise, and labour compliance from one dashboard.',
  badge:    'Built for India · Starting in Bangalore',
  heroHeadline: 'Stay compliant.<br>Not stressed.',
  heroSub:  'Complynt tracks every license, deadline, and document your business needs — so you can focus on running it.',
  heroCta:  'Start free today',
  heroNote: 'No credit card required · Free compliance audit included',
  mockupUrl: 'app.complynt.in · Compliance Dashboard',
  currency: '₹',
  announceBar: 'Free compliance audit for the first 100 Bangalore businesses · <a href="/onboarding">Claim yours →</a>',
  stats: [
    { val: '8+', label: 'Licences tracked' },
    { val: '0',  label: 'Missed deadlines' },
    { val: '₹12L', label: 'Fines prevented' },
  ],
  leftPanelSub: 'Every FSSAI renewal, BBMP trade licence, excise permit, ESIC obligation, GST filing, and fire NOC — tracked, documented, and alerted before deadlines become disasters.',
  features: [
    { title: 'Deadline Tracking',     icon: ICON('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'), desc: 'Every renewal date automatically tracked with 30/7/1-day alerts before it\'s due.' },
    { title: 'Document Vault',        icon: ICON('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>'),              desc: 'Store licence PDFs, certificates, and inspection reports — attached to each deadline.' },
    { title: 'Health Score',          icon: ICON('<polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>'),                                                              desc: 'Instant compliance health score so you always know where you stand.' },
    { title: 'Multi-location',        icon: ICON('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>'), desc: 'Manage compliance across all your outlets from a single account.' },
  ],
  categories: [
    { name: 'FSSAI Food License',        auth: 'FSSAI',               icon: ICON('<path d="M9 12l2 2 4-4"/><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>') },
    { name: 'BBMP Trade License',         auth: 'BBMP',                icon: ICON('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>') },
    { name: 'Excise Licence',             auth: 'Karnataka Excise',    icon: ICON('<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>') },
    { name: 'GST Registration',           auth: 'GST Council',         icon: ICON('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>') },
    { name: 'ESIC / EPFO',               auth: 'ESIC · EPFO',         icon: ICON('<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>') },
    { name: 'Fire NOC',                   auth: 'Karnataka Fire Dept', icon: ICON('<path d="M12 2c0 6-6 8-6 14a6 6 0 0012 0c0-6-6-8-6-14z"/>') },
    { name: 'Shops & Establishments',     auth: 'Dept of Labour',      icon: ICON('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>') },
    { name: 'PCB Consent to Operate',     auth: 'Karnataka PCB',       icon: ICON('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>') },
  ],
  plans: [
    {
      name: 'Starter', price: '0', period: 'Free forever',
      features: ['Up to 3 compliance items', 'Email reminders', 'Document vault (50 MB)', 'Deadline calendar'],
    },
    {
      name: 'Pro', price: '999', period: 'per month + GST', badge: 'Most popular', featured: true,
      features: ['Unlimited compliance items', 'SMS + email reminders', 'Document vault (5 GB)', 'Multi-location (up to 5)', 'Priority support', 'Compliance health report'],
    },
    {
      name: 'Enterprise', price: '2,499', period: 'per month + GST',
      features: ['Everything in Pro', 'Unlimited locations', 'Dedicated account manager', 'Custom integrations', 'White-label option', 'SLA guarantee'],
    },
  ],
}

export default function IndiaPage() {
  return <RegionalLanding config={config} />
}
