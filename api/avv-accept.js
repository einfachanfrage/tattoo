'use strict';

const { Resend } = require('resend');
const crypto    = require('crypto');
const supabase  = require('./_supabase');

const resend   = new Resend(process.env.RESEND_API_KEY);
const FROM     = 'Einfach Anfrage <anfrage@einfach-anfrage.com>';
const NOTIFY   = process.env.CONTACT_EMAIL || 'einfachanfrage@outlook.com';

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function emailWrap(inner) {
  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F0EDE8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0"
  style="background:#FAF7F2;border-radius:14px;overflow:hidden;max-width:560px;">
  <tr><td style="background:#1A1A1A;padding:20px 28px;">
    <span style="font-family:Georgia,serif;font-size:18px;color:#C9A96E;">Einfach Anfrage</span>
  </td></tr>
  ${inner}
  <tr><td style="background:#F0EDE8;padding:14px 28px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#8A8580;">Einfach Anfrage · Sandra Holm · Wielandstr. 11, 12159 Berlin</p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, studio, email, website } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name und E-Mail sind Pflichtfelder.' });
  }

  // Privacy-freundlich: IP nur als gekürzten Hash speichern
  const rawIp = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 16);

  const { error: dbError } = await supabase
    .from('avv_acceptances')
    .insert({
      name:    name.trim(),
      studio:  studio?.trim()  || null,
      email:   email.trim().toLowerCase(),
      website: website?.trim() || null,
      ip_hash: ipHash,
    });

  if (dbError) {
    console.error('AVV DB error:', JSON.stringify(dbError));
    return res.status(500).json({ error: 'Speichern fehlgeschlagen – bitte nochmal versuchen.' });
  }

  const ts = new Date().toLocaleString('de-DE', {
    timeZone: 'Europe/Berlin',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  // ── Benachrichtigung an Sandra ──────────────────────────────────────────
  const notifyHtml = emailWrap(`
  <tr><td style="padding:28px 28px 8px;">
    <h2 style="margin:0 0 4px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1A1A1A;">
      AVV bestätigt ✓
    </h2>
    <p style="margin:4px 0 0;font-size:13px;color:#8A8580;">${esc(ts)}</p>
  </td></tr>
  <tr><td style="padding:8px 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0"
      style="border-top:1px solid #E2DDD6;margin-top:16px;font-size:13px;">
      <tr>
        <td style="padding:9px 0;color:#8A8580;width:140px;border-bottom:1px solid #F0EDE8;">Name</td>
        <td style="padding:9px 0;color:#1A1A1A;border-bottom:1px solid #F0EDE8;">${esc(name)}</td>
      </tr>
      ${studio ? `<tr>
        <td style="padding:9px 0;color:#8A8580;border-bottom:1px solid #F0EDE8;">Studio</td>
        <td style="padding:9px 0;color:#1A1A1A;border-bottom:1px solid #F0EDE8;">${esc(studio)}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:9px 0;color:#8A8580;border-bottom:1px solid #F0EDE8;">E-Mail</td>
        <td style="padding:9px 0;border-bottom:1px solid #F0EDE8;">
          <a href="mailto:${esc(email)}" style="color:#C9A96E;">${esc(email)}</a>
        </td>
      </tr>
      ${website ? `<tr>
        <td style="padding:9px 0;color:#8A8580;border-bottom:1px solid #F0EDE8;">Website</td>
        <td style="padding:9px 0;border-bottom:1px solid #F0EDE8;">
          <a href="${esc(website)}" style="color:#C9A96E;">${esc(website)}</a>
        </td>
      </tr>` : ''}
    </table>
    <p style="margin:20px 0 0;font-size:13px;color:#8A8580;">
      → Jetzt Account anlegen und Onboarding-E-Mail schicken.
    </p>
  </td></tr>`);

  try {
    await resend.emails.send({
      from:    FROM,
      to:      NOTIFY,
      replyTo: email.trim().toLowerCase(),
      subject: `AVV bestätigt: ${name.trim()}`,
      html:    notifyHtml,
    });
  } catch (e) {
    console.error('AVV notify email error:', e.message);
  }

  // ── Bestätigung an den Tätowierer ───────────────────────────────────────
  const confirmHtml = emailWrap(`
  <tr><td style="padding:28px 28px 8px;">
    <h2 style="margin:0 0 4px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#1A1A1A;">
      Deine AVV-Bestätigung
    </h2>
    <p style="margin:4px 0 0;font-size:13px;color:#8A8580;">Das war's – du hast alles erledigt.</p>
  </td></tr>
  <tr><td style="padding:8px 28px 28px;">
    <p style="font-size:14px;color:#1A1A1A;line-height:1.6;">
      Hallo ${esc(name)},<br><br>
      du hast den Auftragsverarbeitungsvertrag mit Einfach Anfrage am <strong>${esc(ts)}</strong>
      verbindlich bestätigt. Diese E-Mail dient als dein Nachweis.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#F0EDE8;border-radius:8px;padding:14px 18px;margin:16px 0;font-size:13px;">
      <tr>
        <td style="color:#8A8580;width:120px;">Name</td>
        <td style="color:#1A1A1A;">${esc(name)}</td>
      </tr>
      ${studio ? `<tr>
        <td style="color:#8A8580;padding-top:6px;">Studio</td>
        <td style="color:#1A1A1A;padding-top:6px;">${esc(studio)}</td>
      </tr>` : ''}
      <tr>
        <td style="color:#8A8580;padding-top:6px;">E-Mail</td>
        <td style="color:#1A1A1A;padding-top:6px;">${esc(email)}</td>
      </tr>
      <tr>
        <td style="color:#8A8580;padding-top:6px;">Datum</td>
        <td style="color:#1A1A1A;padding-top:6px;">${esc(ts)}</td>
      </tr>
    </table>
    <p style="font-size:13px;color:#8A8580;line-height:1.6;">
      Du erhältst in Kürze eine separate E-Mail mit deinen Zugangsdaten und dem Widget-Code.<br>
      Bei Fragen schreib mir einfach: <a href="mailto:einfachanfrage@outlook.com" style="color:#C9A96E;">einfachanfrage@outlook.com</a>
    </p>
    <p style="font-size:12px;color:#8A8580;margin-top:20px;border-top:1px solid #E2DDD6;padding-top:14px;">
      Den vollständigen AVV kannst du jederzeit unter
      <a href="https://einfachanfrage-tattoo.de/avv" style="color:#C9A96E;">einfachanfrage-tattoo.de/avv</a>
      einsehen.
    </p>
  </td></tr>`);

  try {
    await resend.emails.send({
      from:    FROM,
      to:      email.trim().toLowerCase(),
      subject: 'Deine AVV-Bestätigung – Einfach Anfrage',
      html:    confirmHtml,
    });
  } catch (e) {
    console.error('AVV confirm email error:', e.message);
  }

  return res.json({ ok: true, name: name.trim(), timestamp: ts });
};
