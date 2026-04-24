/**
 * Firebase Cloud Functions — Complynt compliance reminder engine
 *
 * Runs daily at 9:00 AM IST. For every user in Firestore it checks
 * all compliance due dates and sends email/WhatsApp reminders at
 * 60 / 30 / 7 / 1 days before expiry.
 *
 * Setup:
 *   firebase functions:config:set \
 *     mail.host="smtp.gmail.com" \
 *     mail.port="465" \
 *     mail.user="your@gmail.com" \
 *     mail.pass="your-app-password" \
 *     twilio.sid="ACxxxxxxx" \
 *     twilio.token="your-token" \
 *     twilio.from="whatsapp:+14155238886"
 */

const { onSchedule }  = require('firebase-functions/v2/scheduler');
const { onRequest }   = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin           = require('firebase-admin');
const nodemailer      = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

/* ── Secrets (set via Firebase Functions config) ── */
const MAIL_HOST  = defineSecret('MAIL_HOST');
const MAIL_PORT  = defineSecret('MAIL_PORT');
const MAIL_USER  = defineSecret('MAIL_USER');
const MAIL_PASS  = defineSecret('MAIL_PASS');

/* ── Reminder thresholds (days before due date) ── */
const THRESHOLDS = [60, 30, 7, 1];

/* ── Day diff helper ── */
function daysUntil(dueDateStr) {
  const due   = new Date(dueDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

/* ── Email builder ── */
function buildEmail(userEmail, dueItems) {
  const rows = dueItems.map(({ name, authority, dueDate, days }) => {
    const urgency = days <= 1 ? 'URGENT — TODAY' : days <= 7 ? `${days} days left` : `${days} days left`;
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${authority}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${dueDate}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:${days <= 7 ? '#ff3b30' : days <= 30 ? '#ff9f0a' : '#0071e3'};font-weight:600">${urgency}</td>
    </tr>`;
  }).join('');

  return {
    subject: `Complynt: ${dueItems.length} compliance deadline${dueItems.length > 1 ? 's' : ''} approaching`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="margin-bottom:24px">
          <span style="font-size:20px;font-weight:700;color:#1d1d1f">Complynt</span>
          <span style="font-size:13px;color:#6e6e73;margin-left:8px">Compliance Reminder</span>
        </div>
        <p style="font-size:15px;color:#1d1d1f;margin-bottom:20px">
          Hi — here's a summary of your upcoming compliance deadlines.
          Acting early avoids late fees and potential shutdowns.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f5f5f7">
              <th style="padding:10px 12px;text-align:left;font-weight:600">License / Filing</th>
              <th style="padding:10px 12px;text-align:left;font-weight:600">Authority</th>
              <th style="padding:10px 12px;text-align:left;font-weight:600">Due Date</th>
              <th style="padding:10px 12px;text-align:left;font-weight:600">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:28px">
          <a href="https://YOUR_PROJECT.web.app/dashboard.html"
             style="background:#0071e3;color:#fff;padding:12px 24px;border-radius:980px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
            View Dashboard
          </a>
        </div>
        <p style="font-size:12px;color:#aeaeb2;margin-top:28px">
          You're receiving this because you have a Complynt account.<br/>
          To change your alert preferences, visit your dashboard settings.
        </p>
      </div>
    `,
  };
}

/* ── Send reminder via email ── */
async function sendEmail(toAddress, subject, html, secrets) {
  const transporter = nodemailer.createTransport({
    host:   secrets.mailHost || 'smtp.gmail.com',
    port:   Number(secrets.mailPort) || 465,
    secure: true,
    auth: {
      user: secrets.mailUser,
      pass: secrets.mailPass,
    },
  });
  await transporter.sendMail({
    from: `"Complynt" <${secrets.mailUser}>`,
    to: toAddress,
    subject,
    html,
  });
}

/* ── Core reminder logic ── */
async function processReminders(secrets) {
  const usersSnap = await db.collection('users').get();
  let totalSent = 0;

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data();
    if (!data.alertPrefs || !data.alertPrefs.email) continue;
    if (!data.compliances || !Array.isArray(data.compliances)) continue;

    const dueItems = [];

    for (const c of data.compliances) {
      if (!c.dueDate || c.status === 'Completed') continue;
      const days = daysUntil(c.dueDate);
      if (THRESHOLDS.includes(days)) {
        dueItems.push({ name: c.name, authority: c.authority, dueDate: c.dueDate, days });
      }
    }

    if (!dueItems.length) continue;

    const { subject, html } = buildEmail(data.alertPrefs.email, dueItems);

    try {
      await sendEmail(data.alertPrefs.email, subject, html, secrets);
      totalSent++;
      console.log(`Reminder sent to ${data.alertPrefs.email} — ${dueItems.length} items`);
    } catch (err) {
      console.error(`Failed for ${userDoc.id}:`, err.message);
    }
  }

  return totalSent;
}

/* ── Scheduled daily reminder (9:00 AM IST = 3:30 AM UTC) ── */
exports.dailyReminders = onSchedule(
  {
    schedule:  'every day 03:30',
    timeZone:  'Asia/Kolkata',
    secrets:   [MAIL_USER, MAIL_PASS, MAIL_HOST, MAIL_PORT],
  },
  async () => {
    const secrets = {
      mailHost: MAIL_HOST.value(),
      mailPort: MAIL_PORT.value(),
      mailUser: MAIL_USER.value(),
      mailPass: MAIL_PASS.value(),
    };
    const sent = await processReminders(secrets);
    console.log(`Daily reminder run complete — ${sent} emails sent`);
  }
);

/* ── Manual trigger for testing (call via Firebase console) ── */
exports.testReminder = onRequest(
  { secrets: [MAIL_USER, MAIL_PASS, MAIL_HOST, MAIL_PORT] },
  async (req, res) => {
    if (req.method !== 'POST') { res.status(405).send('POST only'); return; }
    const secrets = {
      mailHost: MAIL_HOST.value(),
      mailPort: MAIL_PORT.value(),
      mailUser: MAIL_USER.value(),
      mailPass: MAIL_PASS.value(),
    };
    const sent = await processReminders(secrets);
    res.json({ sent });
  }
);
