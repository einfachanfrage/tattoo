'use strict';

require('dotenv').config();
const nodemailer = require('nodemailer');

let _transporter = null;
let _isEthereal = false;

async function getTransporter() {
  if (_transporter) return _transporter;

  if (process.env.SMTP_HOST) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📧 SMTP konfiguriert:', process.env.SMTP_HOST);
  } else {
    // Ethereal-Test-Account für Entwicklung
    const account = await nodemailer.createTestAccount();
    _transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: account.user, pass: account.pass },
    });
    _isEthereal = true;
    console.log('📧 Ethereal-Test-SMTP aktiv. Vorschau-URLs erscheinen nach dem Versand.');
  }

  return _transporter;
}

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

function badge(value) {
  const unclear = ['noch unklar', 'Noch unklar', 'unklar'];
  const isUnclear = unclear.some(u => String(value).toLowerCase().includes('unklar')) || !value;
  if (isUnclear) {
    return `<span style="background:#e8e4dd;color:#8A8580;padding:2px 8px;border-radius:12px;font-size:12px;">Noch unklar</span>`;
  }
  return `<strong>${value}</strong>`;
}

// ── Photographer notification email ──────────────────────────────────────────

function buildPhotographerHtml(submission) {
  const { contact, wedding, location, wishes, budget } = submission;
  const weddingDate = wedding.dateUnclear ? 'Noch unklar' : formatDate(wedding.date);
  const names = `${contact.partner1 || '–'} & ${contact.partner2 || '–'}`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Neue Hochzeitsanfrage</title>
</head>
<body style="margin:0;padding:0;background:#F0EDE8;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE8;padding:32px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:16px;overflow:hidden;max-width:580px;">

  <!-- Header -->
  <tr>
    <td style="background:#1A1A1A;padding:28px 36px;text-align:left;">
      <span style="font-family:Georgia,serif;font-size:22px;font-weight:400;color:#C9A96E;letter-spacing:0.05em;">Einfach Anfrage</span>
    </td>
  </tr>

  <!-- Title -->
  <tr>
    <td style="padding:36px 36px 8px;">
      <p style="margin:0 0 6px;font-size:12px;color:#8A8580;letter-spacing:0.1em;text-transform:uppercase;">Neue Hochzeitsanfrage</p>
      <h1 style="margin:0;font-family:Georgia,serif;font-size:32px;font-weight:400;color:#1A1A1A;">${names}</h1>
      <p style="margin:8px 0 0;font-size:13px;color:#8A8580;">Eingegangen am ${formatDateTime(submission.createdAt)}</p>
    </td>
  </tr>

  <!-- Quick facts -->
  <tr>
    <td style="padding:24px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;border:1px solid #E2DDD6;">
        <tr>
          <td style="padding:16px 20px;border-bottom:1px solid #F0EDE8;">
            <span style="font-size:11px;color:#8A8580;text-transform:uppercase;letter-spacing:0.08em;">Hochzeitsdatum</span><br>
            <span style="font-size:16px;color:#1A1A1A;font-weight:600;">${weddingDate}</span>
          </td>
          <td style="padding:16px 20px;border-bottom:1px solid #F0EDE8;border-left:1px solid #F0EDE8;">
            <span style="font-size:11px;color:#8A8580;text-transform:uppercase;letter-spacing:0.08em;">Location</span><br>
            <span style="font-size:16px;color:#1A1A1A;font-weight:600;">${location.city || '–'}, ${location.state || '–'}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 20px;">
            <span style="font-size:11px;color:#8A8580;text-transform:uppercase;letter-spacing:0.08em;">Gäste</span><br>
            <span style="font-size:16px;color:#1A1A1A;font-weight:600;">${wishes.guestCount || 'Noch unklar'}</span>
          </td>
          <td style="padding:16px 20px;border-left:1px solid #F0EDE8;">
            <span style="font-size:11px;color:#8A8580;text-transform:uppercase;letter-spacing:0.08em;">Budget</span><br>
            <span style="font-size:16px;color:#1A1A1A;font-weight:600;">${budget.range || 'Keine Angabe'}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Details -->
  <tr>
    <td style="padding:0 36px 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#8A8580;width:160px;">Dauer</td>
          <td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${wedding.duration || 'Noch unklar'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#8A8580;">Uhrzeit Trauung</td>
          <td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${wedding.ceremonyTime || 'Noch unklar'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#8A8580;">Location-Typen</td>
          <td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${(location.types || []).join(', ') || 'Noch unklar'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#8A8580;">Stil-Wünsche</td>
          <td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${(wishes.style || []).join(', ') || 'Noch unklar'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#8A8580;">Videograf</td>
          <td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${wishes.videographer || 'Noch unklar'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:13px;color:#8A8580;">2. Fotograf</td>
          <td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${wishes.secondPhotographer || 'Noch unklar'}</td>
        </tr>
      </table>
    </td>
  </tr>

  ${budget.notes ? `
  <!-- Notes -->
  <tr>
    <td style="padding:0 36px 24px;">
      <div style="background:#fff;border-left:3px solid #C9A96E;border-radius:0 8px 8px 0;padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:11px;color:#C9A96E;text-transform:uppercase;letter-spacing:0.1em;">Besondere Wünsche</p>
        <p style="margin:0;font-size:14px;color:#1A1A1A;line-height:1.6;">${budget.notes}</p>
      </div>
    </td>
  </tr>
  ` : ''}

  <!-- Action box -->
  <tr>
    <td style="padding:0 36px 36px;">
      <div style="background:#1A1A1A;border-radius:12px;padding:24px;">
        <p style="margin:0 0 12px;font-size:12px;color:#C9A96E;text-transform:uppercase;letter-spacing:0.1em;">Kontakt aufnehmen</p>
        <p style="margin:0 0 4px;font-size:22px;color:#FAF7F2;font-family:Georgia,serif;">${names}</p>
        <p style="margin:0 0 12px;font-size:14px;color:#C9A96E;">
          <a href="mailto:${contact.email}" style="color:#C9A96E;">${contact.email}</a>
        </p>
        ${contact.phone ? `<p style="margin:0;font-size:14px;color:#8A8580;">${contact.phone}</p>` : ''}
        <p style="margin:12px 0 0;font-size:12px;color:#8A8580;">Gefunden über: ${contact.howFound || '–'}</p>
      </div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#F0EDE8;padding:20px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#8A8580;">Generiert von <strong style="color:#C9A96E;">Einfach Anfrage</strong> · einfachanfrage.de</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Couple confirmation email ─────────────────────────────────────────────────

function buildCoupleHtml(submission, photographerName) {
  const { contact, wedding } = submission;
  const weddingDate = wedding.dateUnclear ? 'Noch unklar' : formatDate(wedding.date);
  const names = `${contact.partner1 || ''} & ${contact.partner2 || ''}`.trim().replace(/^&\s*/, '').replace(/\s*&$/, '');

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Deine Anfrage</title>
</head>
<body style="margin:0;padding:0;background:#F0EDE8;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE8;padding:32px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:16px;overflow:hidden;max-width:560px;">

  <tr>
    <td style="background:#1A1A1A;padding:24px 36px;">
      <span style="font-family:Georgia,serif;font-size:20px;color:#C9A96E;">Einfach Anfrage</span>
    </td>
  </tr>

  <tr>
    <td style="padding:40px 36px 28px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(201,169,110,0.12);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <span style="font-size:28px;">🤍</span>
      </div>
      <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:28px;font-weight:400;color:#1A1A1A;">Vielen Dank, ${names}!</h1>
      <p style="margin:0;font-size:15px;color:#8A8580;line-height:1.6;">
        Eure Anfrage ist bei <strong style="color:#1A1A1A;">${photographerName}</strong> eingegangen.<br>
        Ihr erhaltet innerhalb von <strong>48 Stunden</strong> eine Antwort.
      </p>
    </td>
  </tr>

  <tr>
    <td style="padding:0 36px 36px;">
      <div style="background:#fff;border-radius:10px;border:1px solid #E2DDD6;padding:20px;">
        <p style="margin:0 0 14px;font-size:11px;color:#8A8580;text-transform:uppercase;letter-spacing:0.1em;">Eure Angaben</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#8A8580;width:130px;">Hochzeitsdatum</td>
            <td style="padding:5px 0;font-size:13px;color:#1A1A1A;">${weddingDate}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#8A8580;">Ort</td>
            <td style="padding:5px 0;font-size:13px;color:#1A1A1A;">${submission.location.city || '–'}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;font-size:13px;color:#8A8580;">E-Mail</td>
            <td style="padding:5px 0;font-size:13px;color:#1A1A1A;">${contact.email}</td>
          </tr>
        </table>
      </div>
    </td>
  </tr>

  <tr>
    <td style="background:#F0EDE8;padding:18px 36px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#8A8580;">Generiert von <strong style="color:#C9A96E;">Einfach Anfrage</strong> · einfachanfrage.de</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Public API ────────────────────────────────────────────────────────────────

async function sendEmails(submission, pdfBuffer, photographerEmail, photographerName) {
  const transporter = await getTransporter();

  const to = photographerEmail
    || process.env.PHOTOGRAPHER_EMAIL
    || 'demo@einfachanfrage.de';

  const photoName = photographerName
    || process.env.PHOTOGRAPHER_NAME
    || 'Ihr/e Fotograf/in';

  const { contact, wedding } = submission;
  const names = `${contact.partner1 || '–'} & ${contact.partner2 || '–'}`;
  const weddingDate = wedding.dateUnclear ? 'Datum offen' : formatDate(wedding.date);

  const subject = `📸 Neue Anfrage: ${names} · Hochzeit am ${weddingDate}`;
  const fromAddress = process.env.SMTP_FROM || 'Einfach Anfrage <noreply@einfachanfrage.de>';

  // 1) E-Mail an Fotografen
  const photographerMail = {
    from: fromAddress,
    to,
    subject,
    html: buildPhotographerHtml(submission),
    attachments: pdfBuffer
      ? [{ filename: `Anfrage-${names.replace(/\s/g, '_')}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
      : [],
  };

  const photographerInfo = await transporter.sendMail(photographerMail);

  if (_isEthereal) {
    console.log('\n📬 Fotograf-E-Mail (Ethereal-Vorschau):');
    console.log('   ' + nodemailer.getTestMessageUrl(photographerInfo));
  }

  // 2) Bestätigungs-E-Mail an Brautpaar
  if (contact.email) {
    const coupleMail = {
      from: fromAddress,
      to: contact.email,
      subject: `Eure Anfrage bei ${photoName} ist eingegangen 🤍`,
      html: buildCoupleHtml(submission, photoName),
    };
    const coupleInfo = await transporter.sendMail(coupleMail);

    if (_isEthereal) {
      console.log('📬 Brautpaar-Bestätigungs-E-Mail (Ethereal-Vorschau):');
      console.log('   ' + nodemailer.getTestMessageUrl(coupleInfo));
    }
  }

  return true;
}

module.exports = { sendEmails };
