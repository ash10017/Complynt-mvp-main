import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Complynt',
  description: 'Terms of Service for Complynt, the compliance management platform for UK hospitality businesses.',
}

const EFFECTIVE = '1 July 2026'
const UPDATED   = '29 July 2026'

const sections = [
  {
    title: '1. Acceptance of terms',
    body: `By creating an account or using Complynt (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.\n\nThese Terms form a legally binding agreement between you ("you" or "your") and Complynt Ltd ("Complynt", "we", "us", or "our"), a company registered in England and Wales.`,
  },
  {
    title: '2. Description of the service',
    body: `Complynt provides a compliance management platform for UK hospitality businesses, including tools for tracking licences, deadlines, food safety records, allergen management, staff training, and document storage.\n\nThe Service is provided on a subscription basis with a free tier and paid plans. Feature availability depends on your current plan.`,
  },
  {
    title: '3. Account registration',
    body: `To use the Service you must create an account. You agree to:\n\n• Provide accurate, complete, and current information during registration\n• Maintain the security of your password and account credentials\n• Notify us immediately of any unauthorised access to your account\n• Accept responsibility for all activity that occurs under your account\n\nYou must be at least 18 years old to create an account. By registering, you confirm that you meet this requirement.`,
  },
  {
    title: '4. Acceptable use',
    body: `You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not:\n\n• Use the Service for any fraudulent, unlawful, or deceptive purpose\n• Attempt to gain unauthorised access to any part of the Service or its systems\n• Upload malicious code, viruses, or harmful data\n• Reverse-engineer, decompile, or otherwise attempt to derive source code\n• Resell, sublicense, or otherwise make the Service available to third parties without our consent\n• Use the Service to store or transmit illegal content\n\nWe reserve the right to suspend or terminate accounts that violate this policy.`,
  },
  {
    title: '5. Subscription plans and payment',
    body: `The Service is available on a free plan and paid subscription plans ("Pro" and "Business"). Paid plan features and pricing are described at complynt.co.uk/pricing.\n\nFor paid plans:\n\n• Subscriptions are billed monthly or annually in advance\n• Prices are in GBP and inclusive of any applicable VAT\n• Payment is processed by our third-party payment provider; your payment details are not stored by Complynt\n• Subscriptions auto-renew unless cancelled before the renewal date\n• To cancel, you may do so at any time from your account settings; you retain access until the end of the current billing period\n• Refunds are not provided for partial billing periods, except where required by applicable law\n\nWe reserve the right to change pricing with 30 days' notice to existing subscribers.`,
  },
  {
    title: '6. Your content',
    body: `You retain ownership of all data, documents, and content you upload to the Service ("Your Content"). By uploading content, you grant Complynt a limited, non-exclusive licence to store, process, and display Your Content solely for the purpose of providing the Service to you.\n\nYou are solely responsible for ensuring that Your Content does not infringe any third-party rights or violate any applicable laws.\n\nWe do not sell Your Content or use it for any purpose other than operating and improving the Service.`,
  },
  {
    title: '7. Intellectual property',
    body: `The Service, including all software, design, text, graphics, and features, is owned by Complynt Ltd and protected by intellectual property laws. These Terms do not transfer any ownership rights to you.\n\nYou may not copy, reproduce, modify, distribute, or create derivative works from any part of the Service without our prior written consent.`,
  },
  {
    title: '8. Compliance information',
    body: `The Service provides compliance tracking tools, reminders, templates, and AI-generated guidance. This information is provided for general informational purposes only and does not constitute legal advice.\n\nComplynt is not a law firm and does not provide legal, regulatory, or professional advice. You are solely responsible for ensuring that your business complies with all applicable laws and regulations. We strongly recommend consulting a qualified solicitor or compliance professional for specific legal questions.`,
  },
  {
    title: '9. Disclaimer of warranties',
    body: `To the maximum extent permitted by applicable law, the Service is provided "as is" and "as available" without warranties of any kind, express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.\n\nWe do not warrant that the Service will be uninterrupted, error-free, or free from harmful components, or that any compliance information provided is complete, accurate, or up to date.`,
  },
  {
    title: '10. Limitation of liability',
    body: `To the fullest extent permitted by applicable law, Complynt Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service, even if we have been advised of the possibility of such damages.\n\nOur total aggregate liability to you for any claim arising out of these Terms or the Service shall not exceed the amount you paid to us in the 12 months preceding the claim, or £100, whichever is greater.\n\nNothing in these Terms limits liability for death or personal injury caused by negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded by law.`,
  },
  {
    title: '11. Termination',
    body: `You may close your account at any time from your account settings or by contacting us. Upon termination:\n\n• Your access to the Service will cease\n• Your data will be retained for 30 days, after which it will be permanently deleted\n• Any outstanding subscription fees remain payable\n\nWe may suspend or terminate your account immediately if you materially breach these Terms, without liability to you.`,
  },
  {
    title: '12. Changes to these terms',
    body: `We may update these Terms from time to time. We will notify you of material changes by email or by displaying a notice within the Service at least 14 days before the changes take effect.\n\nYour continued use of the Service after the effective date of revised Terms constitutes acceptance of those changes.`,
  },
  {
    title: '13. Governing law and disputes',
    body: `These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.\n\nBefore initiating legal proceedings, we encourage you to contact us to resolve any dispute informally.`,
  },
  {
    title: '14. Contact',
    body: `If you have any questions about these Terms, please contact us:\n\nComplynt Ltd\nEmail: legal@complynt.co.uk\nUnited Kingdom`,
  },
]

export default function TermsPage() {
  return (
    <>
      <Nav solid />
      <main style={{ paddingTop: 'var(--nav-h)', background: '#f5f5f7', minHeight: '100vh' }}>

        {/* Hero */}
        <div style={{ background: 'white', borderBottom: '1px solid #e5e5ea', padding: '48px 24px 40px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e8f2ff', border: '1px solid #c8dfff', borderRadius: 20, padding: '4px 12px', marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#0058b0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Legal</span>
            </div>
            <h1 style={{ fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, color: '#1d1d1f', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
              Terms of Service
            </h1>
            <p style={{ fontSize: 14, color: '#a1a1a6', margin: 0 }}>
              Effective {EFFECTIVE} · Last updated {UPDATED}
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Intro box */}
          <div style={{ background: '#e8f2ff', border: '1px solid #c8dfff', borderRadius: 14, padding: '20px 24px', marginBottom: 36 }}>
            <p style={{ fontSize: 14, color: '#0058b0', lineHeight: 1.65, margin: 0 }}>
              Please read these Terms of Service carefully before using Complynt. By creating an account or accessing the Service, you agree to be bound by these Terms. These Terms constitute a legally binding agreement between you and Complynt Ltd.
            </p>
          </div>

          {sections.map(s => (
            <div key={s.title} style={{ marginBottom: 36 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1d1d1f', margin: '0 0 12px', letterSpacing: '-0.01em' }}>{s.title}</h2>
              <div style={{ background: 'white', border: '1px solid #e5e5ea', borderRadius: 14, padding: '20px 24px' }}>
                {s.body.split('\n').map((line, i) => {
                  if (!line.trim()) return <div key={i} style={{ height: 10 }} />
                  if (line.startsWith('•')) {
                    return (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                        <span style={{ color: '#0071e3', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>•</span>
                        <p style={{ fontSize: 14, color: '#1d1d1f', lineHeight: 1.65, margin: 0 }}>{line.slice(1).trim()}</p>
                      </div>
                    )
                  }
                  return <p key={i} style={{ fontSize: 14, color: '#1d1d1f', lineHeight: 1.65, margin: '0 0 8px' }}>{line}</p>
                })}
              </div>
            </div>
          ))}

          {/* Footer links */}
          <div style={{ borderTop: '1px solid #e5e5ea', paddingTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ fontSize: 14, color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy →</Link>
            <Link href="/contact" style={{ fontSize: 14, color: '#0071e3', textDecoration: 'none', fontWeight: 500 }}>Contact us →</Link>
          </div>
        </div>

      </main>
    </>
  )
}
