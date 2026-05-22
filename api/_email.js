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

function buildArtistHtml(submission) {
  const { contact, motif, style, health, appointment, budget } = submission;
  const name = esc(contact.name) || esc(contact.email) || '–';

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Neue Tattoo-Anfrage</title></head>
<body style="margin:0;padding:0;background:#EFEDE9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#EFEDE9;padding:40px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;max-width:580px;border:1px solid #D1CDC7;">
  <!-- Header -->
  <tr><td style="background:#1B1B1B;padding:24px 36px;">
    <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:700;color:#F7F6F3;letter-spacing:0.1em;text-transform:uppercase;">Einfach Anfrage</span>
  </td></tr>
  <!-- Title -->
  <tr><td style="padding:36px 36px 20px;">
    <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9A9590;text-transform:uppercase;letter-spacing:0.08em;">Neue Tattoo-Anfrage</p>
    <h1 style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:28px;font-weight:800;color:#1B1B1B;letter-spacing:-0.02em;">${name}</h1>
    <p style="margin:8px 0 0;font-size:13px;color:#9A9590;">Eingegangen am ${formatDateTime(submission.createdAt)}</p>
  </td></tr>
  <!-- Key Facts -->
  <tr><td style="padding:0 36px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;border-radius:10px;border:1px solid #D1CDC7;">
      <tr>
        <td style="padding:16px 20px;border-bottom:1px solid #D1CDC7;">
          <span style="font-size:10px;font-weight:700;color:#9A9590;text-transform:uppercase;letter-spacing:0.06em;">Körperstelle</span><br>
          <span style="font-size:15px;color:#1B1B1B;font-weight:600;">${esc((motif || {}).placement) || '–'}</span>
        </td>
        <td style="padding:16px 20px;border-bottom:1px solid #D1CDC7;border-left:1px solid #D1CDC7;">
          <span style="font-size:10px;font-weight:700;color:#9A9590;text-transform:uppercase;letter-spacing:0.06em;">Größe</span><br>
          <span style="font-size:15px;color:#1B1B1B;font-weight:600;">${esc((motif || {}).size) || '–'}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 20px;">
          <span style="font-size:10px;font-weight:700;color:#9A9590;text-transform:uppercase;letter-spacing:0.06em;">Wunsch-Termin</span><br>
          <span style="font-size:15px;color:#1B1B1B;font-weight:600;">${esc((appointment || {}).timeframe) || '–'}</span>
        </td>
        <td style="padding:16px 20px;border-left:1px solid #D1CDC7;">
          <span style="font-size:10px;font-weight:700;color:#9A9590;text-transform:uppercase;letter-spacing:0.06em;">Budget</span><br>
          <span style="font-size:15px;color:#1B1B1B;font-weight:600;">${esc((budget || {}).range) || 'Keine Angabe'}</span>
        </td>
      </tr>
    </table>
  </td></tr>
  <!-- Details -->
  <tr><td style="padding:0 36px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:5px 0;font-size:13px;color:#6B6B6B;width:160px;">Tattoo-Stil</td><td style="padding:5px 0;font-size:13px;color:#1B1B1B;font-weight:500;">${esc(((style || {}).styles || []).join(', ')) || '–'}</td></tr>
      <tr><td style="padding:5px 0;font-size:13px;color:#6B6B6B;">Farbe / SW</td><td style="padding:5px 0;font-size:13px;color:#1B1B1B;font-weight:500;">${esc((style || {}).colorPreference) || '–'}</td></tr>
      <tr><td style="padding:5px 0;font-size:13px;color:#6B6B6B;">Cover-Up</td><td style="padding:5px 0;font-size:13px;color:#1B1B1B;font-weight:500;">${esc((motif || {}).isCoverUp) || '–'}</td></tr>
      <tr><td style="padding:5px 0;font-size:13px;color:#6B6B6B;">Erstes Tattoo</td><td style="padding:5px 0;font-size:13px;color:#1B1B1B;font-weight:500;">${esc((health || {}).isFirstTattoo) || '–'}</td></tr>
      <tr><td style="padding:5px 0;font-size:13px;color:#6B6B6B;">Allergien</td><td style="padding:5px 0;font-size:13px;color:#1B1B1B;font-weight:500;">${esc((health || {}).knownAllergies) || '–'}</td></tr>
      <tr><td style="padding:5px 0;font-size:13px;color:#6B6B6B;">Bevorzugte Zeit</td><td style="padding:5px 0;font-size:13px;color:#1B1B1B;font-weight:500;">${esc((appointment || {}).preferredTime) || '–'}</td></tr>
    </table>
  </td></tr>
  <!-- Text blocks -->
  ${(motif || {}).description ? `<tr><td style="padding:0 36px 16px;"><div style="background:#F7F6F3;border-left:3px solid #BA897F;padding:16px 20px;border-radius:0 8px 8px 0;"><p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#BA897F;text-transform:uppercase;letter-spacing:0.08em;">Motiv-Beschreibung</p><p style="margin:0;font-size:14px;color:#1B1B1B;line-height:1.65;">${esc(motif.description)}</p></div></td></tr>` : ''}
  ${(motif || {}).coverUpNotes ? `<tr><td style="padding:0 36px 16px;"><div style="background:#F7F6F3;border-left:3px solid #BA897F;padding:16px 20px;border-radius:0 8px 8px 0;"><p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#BA897F;text-transform:uppercase;letter-spacing:0.08em;">Cover-Up Details</p><p style="margin:0;font-size:14px;color:#1B1B1B;line-height:1.65;">${esc(motif.coverUpNotes)}</p></div></td></tr>` : ''}
  ${(style || {}).styleNotes ? `<tr><td style="padding:0 36px 16px;"><div style="background:#F7F6F3;border-left:3px solid #BA897F;padding:16px 20px;border-radius:0 8px 8px 0;"><p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#BA897F;text-transform:uppercase;letter-spacing:0.08em;">Stil in eigenen Worten</p><p style="margin:0;font-size:14px;color:#1B1B1B;line-height:1.65;">${esc(style.styleNotes)}</p></div></td></tr>` : ''}
  ${(health || {}).allergiesDetail ? `<tr><td style="padding:0 36px 16px;"><div style="background:#FDF4F2;border-left:3px solid #BA897F;padding:16px 20px;border-radius:0 8px 8px 0;"><p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#BA897F;text-transform:uppercase;letter-spacing:0.08em;">Allergie-Details</p><p style="margin:0;font-size:14px;color:#1B1B1B;line-height:1.65;">${esc(health.allergiesDetail)}</p></div></td></tr>` : ''}
  ${(budget || {}).notes ? `<tr><td style="padding:0 36px 16px;"><div style="background:#F7F6F3;border-left:3px solid #BA897F;padding:16px 20px;border-radius:0 8px 8px 0;"><p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#BA897F;text-transform:uppercase;letter-spacing:0.08em;">Besondere Wünsche</p><p style="margin:0;font-size:14px;color:#1B1B1B;line-height:1.65;">${esc(budget.notes)}</p></div></td></tr>` : ''}
  ${((style || {}).inspirationImageCount > 0) ? `<tr><td style="padding:0 36px 16px;"><div style="background:#F7F6F3;border:1px solid #D1CDC7;border-radius:10px;padding:16px 20px;"><p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1B1B1B;">🖼 ${style.inspirationImageCount} Referenzbild${style.inspirationImageCount > 1 ? 'er' : ''} hochgeladen</p><p style="margin:0;font-size:12px;color:#6B6B6B;">Die Bilder sind in deinem Dashboard einsehbar.</p></div></td></tr>` : ''}
  <!-- CTA -->
  <tr><td style="padding:8px 36px 28px;text-align:center;">
    <a href="${process.env.DASHBOARD_URL || 'https://einfachanfrage-tattoo.de/dashboard'}" style="display:inline-block;background:#1B1B1B;color:#F7F6F3;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.04em;padding:14px 32px;border-radius:100px;text-decoration:none;text-transform:uppercase;">Im Dashboard ansehen →</a>
  </td></tr>
  <!-- Contact card -->
  <tr><td style="padding:0 36px 36px;">
    <div style="background:#1B1B1B;border-radius:10px;padding:24px 28px;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#BA897F;text-transform:uppercase;letter-spacing:0.1em;">Kontakt</p>
      <p style="margin:0 0 10px;font-size:20px;font-weight:700;color:#F7F6F3;">${name}</p>
      <p style="margin:0 0 4px;font-size:13px;"><a href="mailto:${esc(contact.email)}" style="color:#BA897F;text-decoration:none;">${esc(contact.email)}</a></p>
      ${contact.phone ? `<p style="margin:0 0 4px;font-size:13px;color:#9A9590;">${esc(contact.phone)}</p>` : ''}
      ${contact.instagram ? `<p style="margin:0 0 4px;font-size:13px;color:#9A9590;">Instagram: ${esc(contact.instagram)}</p>` : ''}
      <p style="margin:12px 0 0;font-size:12px;color:#6B6B6B;">Gefunden über: ${esc(contact.howFound) || '–'}</p>
    </div>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#EFEDE9;padding:18px 36px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#9A9590;">Generiert von <strong style="color:#1B1B1B;">Einfach Anfrage</strong></p>
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
