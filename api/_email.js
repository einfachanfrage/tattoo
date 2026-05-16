'use strict';

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Einfach Anfrage <anfrage@einfachanfrage.de>';

function formatDate(isoDate) {
  if (!isoDate) return 'Noch unklar';
  const d = new Date(isoDate);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' Uhr';
}

function buildPhotographerHtml(submission) {
  const { contact, wedding, location, style, services, budget } = submission;
  const weddingDate = wedding.dateUnclear ? 'Noch unklar' : formatDate(wedding.date);
  const names = `${contact.partner1 || '–'} & ${contact.partner2 || '–'}`;

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Neue Hochzeitsanfrage</title></head>
<body style="margin:0;padding:0;background:#F0EDE8;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE8;padding:32px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:16px;overflow:hidden;max-width:580px;">
  <tr><td style="background:#1A1A1A;padding:28px 36px;">
    <span style="font-family:Georgia,serif;font-size:22px;color:#C9A96E;">Einfach Anfrage</span>
  </td></tr>
  <tr><td style="padding:36px 36px 8px;">
    <p style="margin:0 0 6px;font-size:12px;color:#8A8580;text-transform:uppercase;">Neue Hochzeitsanfrage</p>
    <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:400;color:#1A1A1A;">${names}</h1>
    <p style="margin:8px 0 0;font-size:13px;color:#8A8580;">Eingegangen am ${formatDateTime(submission.createdAt)}</p>
  </td></tr>
  <tr><td style="padding:24px 36px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;border:1px solid #E2DDD6;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #F0EDE8;">
          <span style="font-size:11px;color:#8A8580;text-transform:uppercase;">Hochzeitsdatum</span><br>
          <span style="font-size:16px;color:#1A1A1A;font-weight:600;">${weddingDate}</span>
        </td>
        <td style="padding:16px 20px;border-bottom:1px solid #F0EDE8;border-left:1px solid #F0EDE8;">
          <span style="font-size:11px;color:#8A8580;text-transform:uppercase;">Location</span><br>
          <span style="font-size:16px;color:#1A1A1A;font-weight:600;">${location.city || '–'}, ${location.state || '–'}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <span style="font-size:11px;color:#8A8580;text-transform:uppercase;">Gäste</span><br>
          <span style="font-size:16px;color:#1A1A1A;font-weight:600;">${(style || {}).guestCount || 'Noch unklar'}</span>
        </td>
        <td style="padding:16px 20px;border-left:1px solid #F0EDE8;">
          <span style="font-size:11px;color:#8A8580;text-transform:uppercase;">Budget</span><br>
          <span style="font-size:16px;color:#1A1A1A;font-weight:600;">${(budget || {}).range || 'Keine Angabe'}</span>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:0 36px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:6px 0;font-size:13px;color:#8A8580;width:160px;">Dauer</td><td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${(wedding || {}).duration || 'Noch unklar'}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#8A8580;">Uhrzeit Trauung</td><td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${(wedding || {}).ceremonyTime || 'Noch unklar'}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#8A8580;">Location-Typen</td><td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${((location || {}).types || []).join(', ') || 'Noch unklar'}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#8A8580;">Stil-Wünsche</td><td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${((style || {}).styles || []).join(', ') || 'Noch unklar'}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#8A8580;">Medien</td><td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${(services || {}).mediaType || 'Noch unklar'}</td></tr>
      <tr><td style="padding:6px 0;font-size:13px;color:#8A8580;">2. Fotograf</td><td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${(services || {}).secondPhotographer || 'Noch unklar'}</td></tr>
    </table>
  </td></tr>
  ${(budget || {}).notes ? `<tr><td style="padding:0 36px 24px;"><div style="background:#fff;border-left:3px solid #C9A96E;padding:16px 20px;border-radius:0 8px 8px 0;"><p style="margin:0 0 6px;font-size:11px;color:#C9A96E;text-transform:uppercase;">Besondere Wünsche</p><p style="margin:0;font-size:14px;color:#1A1A1A;line-height:1.6;">${budget.notes}</p></div></td></tr>` : ''}
  <tr><td style="padding:0 36px 36px;">
    <div style="background:#1A1A1A;border-radius:12px;padding:24px;">
      <p style="margin:0 0 12px;font-size:12px;color:#C9A96E;text-transform:uppercase;">Kontakt aufnehmen</p>
      <p style="margin:0 0 4px;font-size:22px;color:#FAF7F2;font-family:Georgia,serif;">${names}</p>
      <p style="margin:0 0 12px;font-size:14px;"><a href="mailto:${contact.email}" style="color:#C9A96E;">${contact.email}</a></p>
      ${contact.phone ? `<p style="margin:0;font-size:14px;color:#8A8580;">${contact.phone}</p>` : ''}
      <p style="margin:12px 0 0;font-size:12px;color:#8A8580;">Gefunden über: ${contact.howFound || '–'}</p>
    </div>
  </td></tr>
  <tr><td style="background:#F0EDE8;padding:20px 36px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#8A8580;">Generiert von <strong style="color:#C9A96E;">Einfach Anfrage</strong></p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

function buildCoupleHtml(submission, photographerName) {
  const { contact, wedding } = submission;
  const weddingDate = wedding.dateUnclear ? 'Noch unklar' : formatDate(wedding.date);
  const names = `${contact.partner1 || ''} & ${contact.partner2 || ''}`.trim().replace(/^&\s*/, '').replace(/\s*&$/, '');

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Deine Anfrage</title></head>
<body style="margin:0;padding:0;background:#F0EDE8;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE8;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:16px;overflow:hidden;max-width:560px;">
  <tr><td style="background:#1A1A1A;padding:24px 36px;">
    <span style="font-family:Georgia,serif;font-size:20px;color:#C9A96E;">Einfach Anfrage</span>
  </td></tr>
  <tr><td style="padding:40px 36px 28px;text-align:center;">
    <div style="width:64px;height:64px;background:rgba(201,169,110,0.12);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
      <span style="font-size:28px;">🤍</span>
    </div>
    <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:28px;font-weight:400;color:#1A1A1A;">Vielen Dank, ${names}!</h1>
    <p style="margin:0;font-size:15px;color:#8A8580;line-height:1.6;">
      Eure Anfrage ist bei <strong style="color:#1A1A1A;">${photographerName}</strong> eingegangen.<br>
      Ihr erhaltet innerhalb von <strong>48 Stunden</strong> eine Antwort.
    </p>
  </td></tr>
  <tr><td style="padding:0 36px 36px;">
    <div style="background:#fff;border-radius:10px;border:1px solid #E2DDD6;padding:20px;">
      <p style="margin:0 0 14px;font-size:11px;color:#8A8580;text-transform:uppercase;">Eure Angaben</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:5px 0;font-size:13px;color:#8A8580;width:130px;">Hochzeitsdatum</td><td style="padding:5px 0;font-size:13px;color:#1A1A1A;">${weddingDate}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#8A8580;">Ort</td><td style="padding:5px 0;font-size:13px;color:#1A1A1A;">${submission.location.city || '–'}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#8A8580;">E-Mail</td><td style="padding:5px 0;font-size:13px;color:#1A1A1A;">${contact.email}</td></tr>
      </table>
    </div>
  </td></tr>
  <tr><td style="background:#F0EDE8;padding:18px 36px;text-align:center;">
    <p style="margin:0;font-size:12px;color:#8A8580;">Generiert von <strong style="color:#C9A96E;">Einfach Anfrage</strong></p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

async function sendEmails(submission, photographerEmail, photographerName) {
  const to        = photographerEmail || process.env.PHOTOGRAPHER_EMAIL || 'demo@einfachanfrage.de';
  const photoName = photographerName  || process.env.PHOTOGRAPHER_NAME  || 'Ihr/e Fotograf/in';
  const { contact, wedding } = submission;
  const names     = `${contact.partner1 || '–'} & ${contact.partner2 || '–'}`;
  const weddingDate = wedding.dateUnclear ? 'Datum offen' : formatDate(wedding.date);

  // Mail an Fotografen
  const r1 = await resend.emails.send({
    from:     FROM,
    to,
    replyTo:  contact.email,
    subject:  `📸 Neue Anfrage: ${names} · Hochzeit am ${weddingDate}`,
    html:     buildPhotographerHtml(submission),
  });
  if (r1.error) console.error('Resend error (photographer):', JSON.stringify(r1.error));
  else console.log('Email sent to photographer:', to);

  // Bestätigung an Brautpaar
  if (contact.email) {
    const r2 = await resend.emails.send({
      from:    FROM,
      to:      contact.email,
      subject: `Eure Anfrage bei ${photoName} ist eingegangen 🤍`,
      html:    buildCoupleHtml(submission, photoName),
    });
    if (r2.error) console.error('Resend error (couple):', JSON.stringify(r2.error));
    else console.log('Confirmation sent to couple:', contact.email);
  }

  return true;
}

module.exports = { sendEmails };
