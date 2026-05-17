'use strict';

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const FROM    = 'Einfach Anfrage <anfrage@einfach-anfrage.com>';
const TO      = process.env.CONTACT_EMAIL || 'einfachanfrage@outlook.com';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, website, volume, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, E-Mail und Nachricht sind Pflicht.' });
  }

  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F0EDE8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:14px;overflow:hidden;max-width:560px;">
  <tr><td style="background:#1A1A1A;padding:20px 28px;">
    <span style="font-family:Georgia,serif;font-size:18px;color:#C9A96E;">Einfach Anfrage</span>
    <span style="font-size:12px;color:rgba(250,247,242,0.35);margin-left:12px;">Neue Kontaktanfrage</span>
  </td></tr>
  <tr><td style="padding:28px 28px 8px;">
    <h2 style="margin:0 0 4px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#1A1A1A;">${esc(name)}</h2>
    <a href="mailto:${esc(email)}" style="font-size:14px;color:#C9A96E;text-decoration:none;">${esc(email)}</a>
  </td></tr>
  <tr><td style="padding:8px 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E2DDD6;margin-top:16px;">
      ${website ? `<tr><td style="padding:9px 0;font-size:13px;color:#8A8580;width:150px;border-bottom:1px solid #F0EDE8;">Website</td><td style="padding:9px 0;font-size:13px;color:#1A1A1A;border-bottom:1px solid #F0EDE8;">${esc(website)}</td></tr>` : ''}
      ${volume ? `<tr><td style="padding:9px 0;font-size:13px;color:#8A8580;border-bottom:1px solid #F0EDE8;">Anfragen / Monat</td><td style="padding:9px 0;font-size:13px;color:#1A1A1A;border-bottom:1px solid #F0EDE8;">${esc(volume)}</td></tr>` : ''}
      <tr><td colspan="2" style="padding:16px 0 8px;font-size:11px;color:#8A8580;text-transform:uppercase;letter-spacing:0.1em;">Nachricht</td></tr>
      <tr><td colspan="2" style="background:#fff;padding:16px;border-radius:8px;font-size:14px;color:#1A1A1A;line-height:1.65;border:1px solid #E2DDD6;">${esc(message).replace(/\n/g, '<br>')}</td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#F0EDE8;padding:14px 28px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#8A8580;">Einfach Anfrage</p>
  </td></tr>
</table></td></tr></table>
</body></html>`;

  try {
    const { error } = await resend.emails.send({
      from:    FROM,
      to:      TO,
      replyTo: email,
      subject: `Neue Anfrage von ${name} – Einfach Anfrage`,
      html,
    });
    if (error) console.error('Contact email error:', JSON.stringify(error));
  } catch (err) {
    console.error('Contact email exception:', err.message);
  }

  res.json({ success: true });
};
