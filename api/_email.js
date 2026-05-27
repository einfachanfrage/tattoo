'use strict';

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'Einfach Anfrage <anfrage@einfach-anfrage.com>';

function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateTime(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' Uhr';
}

// Returns a clean international phone number for wa.me links (no +, no spaces)
function waPhone(phone) {
  if (!phone) return '';
  const d = phone.replace(/[\s\-\(\)\.\/]/g, '');
  if (d.startsWith('00')) return d.slice(2);
  if (d.startsWith('+'))  return d.slice(1);
  if (d.startsWith('0'))  return '49' + d.slice(1);
  return d;
}

function buildArtistHtml(submission) {
  const { contact, motif, style, health, appointment, budget } = submission;
  const name   = esc(contact.name) || esc(contact.email) || '–';
  const AC     = '#BF7A60';
  const B      = 'rgba(247,246,243,0.07)';
  const waNum  = waPhone(contact.phone);  // cleaned number for wa.me, empty string if no phone

  // helper: compact detail row
  const row = (label, val) => val && val !== '–'
    ? `<tr>
        <td style="padding:4px 10px 4px 0;font-size:11px;color:rgba(247,246,243,0.36);white-space:nowrap;width:110px;vertical-align:top;">${label}</td>
        <td style="padding:4px 0;font-size:11px;color:#F7F6F3;font-weight:500;vertical-align:top;">${val}</td>
       </tr>`
    : '';

  // helper: text note block
  const note = (label, text) => text
    ? `<tr><td style="padding:0 0 7px;">
        <div style="border-left:2px solid ${AC};padding:6px 10px;background:rgba(255,255,255,0.03);">
          <p style="margin:0 0 2px;font-size:8px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.1em;">${label}</p>
          <p style="margin:0;font-size:12px;color:rgba(247,246,243,0.7);line-height:1.5;">${esc(text)}</p>
        </div>
       </td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Neue Tattoo-Anfrage</title>
  <style>
    @media only screen and (max-width:500px){
      .outer{padding:0 !important;}
      .wrap{border-radius:0 !important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#141414;font-family:'Helvetica Neue',Arial,sans-serif;">
<table class="outer" width="100%" cellpadding="0" cellspacing="0" style="background:#141414;padding:12px 0;">
<tr><td align="center">
<table class="wrap" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#1B1B1B;border-radius:6px;overflow:hidden;">

  <!-- Brand bar -->
  <tr><td style="padding:9px 16px;background:#111;border-bottom:1px solid ${B};">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="font-size:9px;font-weight:700;color:#F7F6F3;letter-spacing:0.16em;text-transform:uppercase;">EINFACH <span style="color:${AC};">ANFRAGE</span></span></td>
      <td style="text-align:right;font-size:9px;color:rgba(247,246,243,0.22);">${formatDateTime(submission.createdAt)}</td>
    </tr></table>
  </td></tr>

  <!-- Name + Aktions-Buttons -->
  <tr><td style="padding:14px 16px 0;border-bottom:1px solid ${B};">

    <p style="margin:0 0 10px;font-size:20px;font-weight:800;color:#F7F6F3;letter-spacing:-0.01em;line-height:1.1;">${name}</p>

    <!-- Gestapelte Aktions-Rows -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:7px;overflow:hidden;border:1px solid rgba(255,255,255,0.09);margin-bottom:14px;">
      <tr><td>
        <a href="mailto:${esc(contact.email)}?subject=Re%3A%20Deine%20Tattoo-Anfrage"
           style="display:block;padding:11px 14px;background:#C9A96E;text-decoration:none;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:700;color:#1B1B1B;">E-Mail antworten</td>
            <td style="text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(27,27,27,0.45);white-space:nowrap;padding-left:8px;">${esc(contact.email)}</td>
          </tr></table>
        </a>
      </td></tr>

      ${(waNum || contact.phone) ? `
      <tr><td style="border-top:1px solid rgba(255,255,255,0.07);">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          ${waNum ? `<td width="${contact.phone && waNum ? '50%' : '100%'}" style="${contact.phone && waNum ? 'border-right:1px solid rgba(255,255,255,0.07);' : ''}">
            <a href="https://wa.me/${waNum}?text=${encodeURIComponent('Hey ' + (contact.name || '') + ', danke für deine Anfrage – ich melde mich gleich!')}"
               style="display:block;padding:10px 14px;background:rgba(255,255,255,0.04);text-decoration:none;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:500;color:#F7F6F3;">WhatsApp</p>
              <p style="margin:2px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:rgba(247,246,243,0.3);">${esc(contact.phone)}</p>
            </a>
          </td>` : ''}
          ${contact.phone ? `<td width="${contact.phone && waNum ? '50%' : '100%'}">
            <a href="tel:${esc(contact.phone)}"
               style="display:block;padding:10px 14px;background:rgba(255,255,255,0.04);text-decoration:none;">
              <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:500;color:#F7F6F3;">Anrufen</p>
              <p style="margin:2px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;color:rgba(247,246,243,0.3);">${esc(contact.phone)}</p>
            </a>
          </td>` : ''}
        </tr></table>
      </td></tr>` : ''}

      ${contact.instagram ? `
      <tr><td style="border-top:1px solid rgba(255,255,255,0.07);">
        <a href="https://instagram.com/${esc((contact.instagram||'').replace(/^@/,''))}"
           style="display:block;padding:10px 14px;background:rgba(255,255,255,0.04);text-decoration:none;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:500;color:#F7F6F3;">Instagram</td>
            <td style="text-align:right;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(247,246,243,0.3);">@${esc((contact.instagram||'').replace(/^@/,''))}</td>
          </tr></table>
        </a>
      </td></tr>` : ''}
    </table>
  </td></tr>

  <!-- Key facts: 3 × 2 kompaktes Grid (Körperstelle, Größe, Termin, Budget, Stil, Farbe) -->
  <tr><td style="padding:0;border-bottom:1px solid ${B};">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="padding:8px 10px 8px 16px;border-right:1px solid ${B};vertical-align:top;">
          <p style="margin:0 0 1px;font-size:8px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.1em;">Körperstelle</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#F7F6F3;">${esc((motif||{}).placement)||'–'}</p>
        </td>
        <td width="50%" style="padding:8px 16px 8px 10px;vertical-align:top;">
          <p style="margin:0 0 1px;font-size:8px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.1em;">Größe</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#F7F6F3;">${esc((motif||{}).size)||'–'}</p>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding:8px 10px 8px 16px;border-right:1px solid ${B};border-top:1px solid ${B};vertical-align:top;">
          <p style="margin:0 0 1px;font-size:8px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.1em;">Termin</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#F7F6F3;">${[esc((appointment||{}).timeframe),esc((appointment||{}).preferredTime)].filter(v=>v&&v!=='–').join(' · ')||'–'}</p>
        </td>
        <td width="50%" style="padding:8px 16px 8px 10px;border-top:1px solid ${B};vertical-align:top;">
          <p style="margin:0 0 1px;font-size:8px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.1em;">Budget</p>
          <p style="margin:0;font-size:13px;font-weight:700;color:#F7F6F3;">${esc((budget||{}).range)||'–'}</p>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding:8px 10px 8px 16px;border-right:1px solid ${B};border-top:1px solid ${B};vertical-align:top;">
          <p style="margin:0 0 1px;font-size:8px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.1em;">Stil</p>
          <p style="margin:0;font-size:12px;font-weight:500;color:#F7F6F3;">${esc(((style||{}).styles||[]).join(', '))||'–'}</p>
        </td>
        <td width="50%" style="padding:8px 16px 8px 10px;border-top:1px solid ${B};vertical-align:top;">
          <p style="margin:0 0 1px;font-size:8px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.1em;">Farbe / SW</p>
          <p style="margin:0;font-size:12px;font-weight:500;color:#F7F6F3;">${esc((style||{}).colorPreference)||'–'}</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Extra Facts: Cover-Up, Gesundheit, Sonstiges -->
  ${((motif||{}).isCoverUp || (health||{}).isFirstTattoo || (health||{}).knownAllergies || contact.howFound) ? `
  <tr><td style="padding:8px 16px 4px;border-bottom:1px solid ${B};">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row('Cover-Up',      esc((motif||{}).isCoverUp))}
      ${row('Erstes Tattoo', esc((health||{}).isFirstTattoo))}
      ${row('Allergien',     esc((health||{}).knownAllergies))}
      ${contact.howFound ? row('Gefunden über', esc(contact.howFound)) : ''}
    </table>
  </td></tr>` : ''}

  <!-- Freitext-Blöcke -->
  ${((motif||{}).description || (motif||{}).coverUpNotes || (style||{}).styleNotes || (health||{}).allergiesDetail || (budget||{}).notes) ? `
  <tr><td style="padding:9px 16px 2px;border-bottom:1px solid ${B};">
    <table width="100%" cellpadding="0" cellspacing="0">
      ${note('Motiv',              (motif||{}).description)}
      ${note('Cover-Up Details',   (motif||{}).coverUpNotes)}
      ${note('Stil-Notizen',       (style||{}).styleNotes)}
      ${note('Allergie-Details',   (health||{}).allergiesDetail)}
      ${note('Budget-Wünsche',     (budget||{}).notes)}
    </table>
  </td></tr>` : ''}

  <!-- Referenzbilder -->
  ${((style||{}).inspirationImages && style.inspirationImages.length > 0) ? `
  <tr><td style="padding:9px 16px;border-bottom:1px solid ${B};">
    <p style="margin:0 0 6px;font-size:8px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.1em;">Referenzbilder</p>
    <table cellpadding="0" cellspacing="0"><tr>${style.inspirationImages.map(function(img){return `
      <td style="padding:0 5px 0 0;vertical-align:top;">
        <a href="${esc(img.url)}" target="_blank" style="display:block;border-radius:5px;overflow:hidden;border:1px solid rgba(247,246,243,0.1);text-decoration:none;line-height:0;">
          <img src="${esc(img.url)}" width="64" height="64" alt="" style="display:block;width:64px;height:64px;object-fit:cover;border:0;outline:0;">
        </a>
      </td>`}).join('')}</tr></table>
  </td></tr>` : ''}

  <!-- CTA -->
  <tr><td style="padding:12px 16px;text-align:center;">
    <a href="${process.env.DASHBOARD_URL || 'https://einfachanfrage-tattoo.de/dashboard'}"
       style="display:inline-block;background:${AC};color:#1B1B1B;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.08em;padding:10px 22px;border-radius:4px;text-decoration:none;text-transform:uppercase;">
      Alle Details im Dashboard →
    </a>
    <p style="margin:7px 0 0;font-size:9px;color:rgba(247,246,243,0.15);">Einfach Anfrage · einfachanfrage-tattoo.de</p>
  </td></tr>

</table></td></tr></table>
</body></html>`;
}

function buildClientHtml(submission, artistName) {
  const { contact, motif } = submission;

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Deine Anfrage</title></head>
<body style="margin:0;padding:0;background:#EFEDE9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EFEDE9;padding:40px 0;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;max-width:520px;border:1px solid #D1CDC7;">
  <!-- Header -->
  <tr><td style="background:#1B1B1B;padding:24px 36px;">
    <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:700;color:#F7F6F3;letter-spacing:0.1em;text-transform:uppercase;">Einfach Anfrage</span>
  </td></tr>
  <!-- Confirmation -->
  <tr><td style="padding:44px 36px 32px;text-align:center;">
    <div style="width:56px;height:56px;background:rgba(186,137,127,0.1);border-radius:50%;margin:0 auto 20px;line-height:56px;font-size:22px;">✓</div>
    <h1 style="margin:0 0 12px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:26px;font-weight:800;color:#1B1B1B;letter-spacing:-0.02em;">Vielen Dank${contact.name ? ', ' + esc(contact.name) : ''}!</h1>
    <p style="margin:0;font-size:15px;color:#6B6B6B;line-height:1.65;">
      Deine Anfrage ist bei <strong style="color:#1B1B1B;">${esc(artistName)}</strong> eingegangen.<br>
      Du erhältst innerhalb von <strong style="color:#1B1B1B;">48 Stunden</strong> eine Antwort.
    </p>
  </td></tr>
  <!-- Summary -->
  <tr><td style="padding:0 36px 36px;">
    <div style="background:#F7F6F3;border-radius:10px;border:1px solid #D1CDC7;padding:20px 24px;">
      <p style="margin:0 0 14px;font-size:10px;font-weight:700;color:#9A9590;text-transform:uppercase;letter-spacing:0.08em;">Deine Angaben</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:5px 0;font-size:13px;color:#6B6B6B;width:130px;">Motiv</td><td style="padding:5px 0;font-size:13px;color:#1B1B1B;font-weight:500;">${esc((motif || {}).description ? (motif.description.substring(0, 80) + (motif.description.length > 80 ? '…' : '')) : '–')}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#6B6B6B;">Körperstelle</td><td style="padding:5px 0;font-size:13px;color:#1B1B1B;font-weight:500;">${esc((motif || {}).placement) || '–'}</td></tr>
        <tr><td style="padding:5px 0;font-size:13px;color:#6B6B6B;">E-Mail</td><td style="padding:5px 0;font-size:13px;color:#1B1B1B;font-weight:500;">${esc(contact.email)}</td></tr>
      </table>
    </div>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#EFEDE9;padding:18px 36px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9A9590;">Generiert von <strong style="color:#1B1B1B;">Einfach Anfrage</strong></p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}

async function sendEmails(submission, artistEmail, artistName) {
  const to         = artistEmail || process.env.PHOTOGRAPHER_EMAIL || 'demo@einfachanfrage.de';
  const artName    = artistName  || process.env.PHOTOGRAPHER_NAME  || 'Dein/e Tätowierer/in';
  const { contact } = submission;
  const clientName = contact.name || contact.email || '–';

  // Mail an Tätowierer
  const r1 = await resend.emails.send({
    from:    FROM,
    to,
    replyTo: contact.email,
    subject: `🖊 Neue Tattoo-Anfrage: ${clientName}`,
    html:    buildArtistHtml(submission),
  });
  if (r1.error) console.error('Resend error (artist mail):', JSON.stringify(r1.error));
  else console.log('Email sent to artist.');

  // Bestätigung an Kunden
  if (contact.email) {
    const r2 = await resend.emails.send({
      from:    FROM,
      to:      contact.email,
      subject: `Deine Anfrage bei ${artName} ist eingegangen ✓`,
      html:    buildClientHtml(submission, artName),
    });
    if (r2.error) console.error('Resend error (client mail):', JSON.stringify(r2.error));
    else console.log('Confirmation sent to client.');
  }

  return true;
}

module.exports = { sendEmails };
