/**
 * Firebase Cloud Functions — Complynt compliance engine
 *
 * Functions:
 *  1. aiChat           — HTTP: Anthropic API proxy for the AI assistant
 *  2. dailyReminders   — Scheduled: compliance deadline emails (9am London)
 *  3. testReminder     — HTTP: manual trigger for testing
 *
 * Setup secrets before deploying:
 *  firebase functions:secrets:set ANTHROPIC_API_KEY   (for aiChat)
 *  firebase functions:secrets:set MAIL_HOST MAIL_PORT MAIL_USER MAIL_PASS
 *
 * Deploy:
 *  firebase deploy --only functions
 */

const { onSchedule }   = require('firebase-functions/v2/scheduler')
const { onRequest }    = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const admin            = require('firebase-admin')
const nodemailer       = require('nodemailer')

admin.initializeApp()
const db = admin.firestore()

/* ── Secrets ─────────────────────────────────────────────────────────────── */
const ANTHROPIC_KEY = defineSecret('ANTHROPIC_API_KEY')
const MAIL_HOST     = defineSecret('MAIL_HOST')
const MAIL_PORT     = defineSecret('MAIL_PORT')
const MAIL_USER     = defineSecret('MAIL_USER')
const MAIL_PASS     = defineSecret('MAIL_PASS')

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function daysUntil(dueDateStr) {
  const due   = new Date(dueDateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due - today) / 86400000)
}

function buildReminderEmail(bizName, alertEmail, dueItems) {
  const hasUrgent = dueItems.some(d => d.days <= 1)
  const subject = hasUrgent
    ? `⚠ Action required: Compliance deadline${dueItems.length > 1 ? 's' : ''} — ${bizName}`
    : `Compliance reminder: ${dueItems.length} item${dueItems.length > 1 ? 's' : ''} due soon — ${bizName}`

  const itemsHtml = dueItems.map(d => {
    const daysLabel = d.days < 0 ? `${Math.abs(d.days)} days OVERDUE`
      : d.days === 0 ? 'Due TODAY'
      : d.days === 1 ? 'Due TOMORROW'
      : `${d.days} days left`
    const color = d.days <= 1 ? '#b80000' : d.days <= 7 ? '#8a4d00' : '#0071e3'
    return `<div style="border:1px solid #e5e5ea;border-radius:10px;padding:14px 16px;margin:10px 0;background:#fafafa">
      <div style="font-size:14px;font-weight:700;color:#1d1d1f;margin-bottom:3px">${d.name}</div>
      <div style="font-size:12px;color:#6e6e73;margin-bottom:5px">${d.authority} · ${d.category}</div>
      <span style="font-size:13px;font-weight:700;color:${color}">${daysLabel}</span>
    </div>`
  }).join('')

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:580px;margin:0 auto;padding:24px;background:#fff">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e5e5ea">
      <div style="width:28px;height:28px;background:#0071e3;border-radius:7px;display:inline-flex;align-items:center;justify-content:center">
        <span style="color:white;font-weight:900;font-size:14px">C</span>
      </div>
      <span style="font-size:16px;font-weight:700;color:#1d1d1f">Complynt</span>
    </div>
    <h2 style="font-size:17px;font-weight:700;color:#1d1d1f;margin:0 0 4px">${hasUrgent ? '⚠ Action required' : 'Compliance reminder'}</h2>
    <p style="font-size:13px;color:#6e6e73;margin:0 0 16px">${bizName}</p>
    ${itemsHtml}
    <div style="margin:20px 0">
      <a href="https://nurturise-5346e.web.app/dashboard"
         style="display:inline-block;background:#0071e3;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">
        View dashboard →
      </a>
    </div>
    <div style="border-top:1px solid #e5e5ea;padding-top:14px">
      <p style="font-size:11px;color:#a1a1a6;margin:0">Alert email: ${alertEmail}. Change this in dashboard Settings.</p>
    </div>
  </div>`

  return { subject, html }
}

async function runReminders(secrets) {
  const transporter = nodemailer.createTransport({
    host:   secrets.mailHost || 'smtp.gmail.com',
    port:   Number(secrets.mailPort) || 587,
    secure: Number(secrets.mailPort) === 465,
    auth:   { user: secrets.mailUser, pass: secrets.mailPass },
  })

  const THRESHOLDS = [30, 7, 1, 0]
  const usersSnap  = await db.collection('users').get()
  let sent = 0

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data()
    const alertEmail = data.alertPrefs?.email
    if (!alertEmail || !alertEmail.includes('@')) continue

    const compliances = Array.isArray(data.compliances) ? data.compliances : []
    const dueItems = []

    for (const c of compliances) {
      if (c.status === 'Completed' || !c.dueDate) continue
      const days = daysUntil(c.dueDate)
      if (THRESHOLDS.includes(days)) {
        dueItems.push({ name: c.name, authority: c.authority, category: c.category || '', days })
      }
    }

    if (!dueItems.length) continue

    const bizName = data.locationName || data.displayName || 'Your Business'
    const { subject, html } = buildReminderEmail(bizName, alertEmail, dueItems)

    try {
      await transporter.sendMail({ from: `"Complynt" <${secrets.mailUser}>`, to: alertEmail, subject, html })
      sent++
      console.log(`Reminder → ${alertEmail}: ${dueItems.length} items`)
    } catch (err) {
      console.error(`Failed for ${userDoc.id}:`, err.message)
    }
  }
  return sent
}

/* ── 1. AI Chat proxy ────────────────────────────────────────────────────── */
exports.aiChat = onRequest(
  {
    cors:           ['https://nurturise-5346e.web.app', 'https://nurturise-5346e.firebaseapp.com', 'http://localhost:3000'],
    region:         'europe-west2',
    timeoutSeconds: 30,
    secrets:        [ANTHROPIC_KEY],
  },
  async (req, res) => {
    if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return }

    const { messages, compliances } = req.body || {}
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages required' }); return
    }

    const apiKey = ANTHROPIC_KEY.value()
    if (!apiKey) { res.status(500).json({ error: 'AI not configured' }); return }

    const context = Array.isArray(compliances) && compliances.length > 0
      ? compliances.map(c => `- ${c.name}: status=${c.status}, due=${c.dueDate}`).join('\n')
      : 'No compliance items provided'

    const system = `You are a UK food business compliance expert and the embedded AI assistant for Complynt.

The user's compliance items:
${context}

Expertise: FHRS ratings, Natasha's Law, HACCP, food business registration, premises licences, fire/gas/electrical safety, National Living Wage, Right to Work, VAT, ICO registration, staff food hygiene training.
Be concise (under 250 words unless detail is needed), practical, and always refer to the user's specific items when relevant.`

    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system,
          messages: messages.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
        }),
      })

      if (!r.ok) { const e = await r.text(); console.error('Anthropic error:', e); res.status(500).json({ error: 'AI error' }); return }
      const data = await r.json()
      res.json({ text: data.content[0].text })
    } catch (err) {
      console.error('aiChat:', err)
      res.status(500).json({ error: 'Internal error' })
    }
  }
)

/* ── 2. Daily deadline reminders ─────────────────────────────────────────── */
exports.dailyReminders = onSchedule(
  {
    schedule:  '0 9 * * *',
    timeZone:  'Europe/London',
    region:    'europe-west2',
    secrets:   [MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS],
  },
  async () => {
    const sent = await runReminders({
      mailHost: MAIL_HOST.value(),
      mailPort: MAIL_PORT.value(),
      mailUser: MAIL_USER.value(),
      mailPass: MAIL_PASS.value(),
    })
    console.log(`Daily reminders: ${sent} emails sent`)
  }
)

/* ── 3. Manual test trigger ──────────────────────────────────────────────── */
exports.testReminder = onRequest(
  {
    region:  'europe-west2',
    secrets: [MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS],
  },
  async (req, res) => {
    if (req.method !== 'POST') { res.status(405).send('POST only'); return }
    const sent = await runReminders({
      mailHost: MAIL_HOST.value(),
      mailPort: MAIL_PORT.value(),
      mailUser: MAIL_USER.value(),
      mailPass: MAIL_PASS.value(),
    })
    res.json({ sent, message: `${sent} reminder emails sent` })
  }
)
