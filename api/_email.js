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
  const AC = '#BF7A60'; // Terrakotta Akzent

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Neue Tattoo-Anfrage</title></head>
<body style="margin:0;padding:0;background:#1B1B1B;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1B1B1B;padding:40px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

  <!-- Logo -->
  <tr><td style="padding:0 0 28px;">
    <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;color:#F7F6F3;letter-spacing:0.18em;text-transform:uppercase;">EINFACH <span style="color:${AC};">ANFRAGE</span></span>
  </td></tr>

  <!-- Headline -->
  <tr><td style="padding:0 0 6px;">
    <p style="margin:0;font-size:10px;font-weight:700;color:rgba(247,246,243,0.3);text-transform:uppercase;letter-spacing:0.14em;">Neue Anfrage</p>
  </td></tr>
  <tr><td style="padding:0 0 32px;">
    <h1 style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:36px;font-weight:800;color:#F7F6F3;letter-spacing:-0.02em;line-height:1.1;">${name}</h1>
    <p style="margin:6px 0 0;font-size:12px;color:rgba(247,246,243,0.3);">${formatDateTime(submission.createdAt)}</p>
  </td></tr>

  <!-- Key facts: 2x2 grid -->
  <tr><td style="padding:0 0 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="50%" style="padding:16px 20px 16px 0;border-bottom:1px solid rgba(247,246,243,0.08);vertical-align:top;">
          <p style="margin:0 0 4px;font-size:9px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.12em;">Körperstelle</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#F7F6F3;">${esc((motif || {}).placement) || '–'}</p>
        </td>
        <td width="50%" style="padding:16px 0 16px 20px;border-bottom:1px solid rgba(247,246,243,0.08);border-left:1px solid rgba(247,246,243,0.08);vertical-align:top;">
          <p style="margin:0 0 4px;font-size:9px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.12em;">Größe</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#F7F6F3;">${esc((motif || {}).size) || '–'}</p>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding:16px 20px 0 0;vertical-align:top;">
          <p style="margin:0 0 4px;font-size:9px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.12em;">Wunsch-Termin</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#F7F6F3;">${esc((appointment || {}).timeframe) || '–'}</p>
        </td>
        <td width="50%" style="padding:16px 0 0 20px;border-left:1px solid rgba(247,246,243,0.08);vertical-align:top;">
          <p style="margin:0 0 4px;font-size:9px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.12em;">Budget</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#F7F6F3;">${esc((budget || {}).range) || '–'}</p>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding:0 0 24px;"><div style="height:1px;background:rgba(247,246,243,0.08);"></div></td></tr>

  <!-- Detail rows -->
  <tr><td style="padding:0 0 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:5px 0;font-size:12px;color:rgba(247,246,243,0.35);width:160px;">Tattoo-Stil</td><td style="padding:5px 0;font-size:12px;color:#F7F6F3;font-weight:500;">${esc(((style || {}).styles || []).join(', ')) || '–'}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:rgba(247,246,243,0.35);">Farbe / SW</td><td style="padding:5px 0;font-size:12px;color:#F7F6F3;font-weight:500;">${esc((style || {}).colorPreference) || '–'}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:rgba(247,246,243,0.35);">Cover-Up</td><td style="padding:5px 0;font-size:12px;color:#F7F6F3;font-weight:500;">${esc((motif || {}).isCoverUp) || '–'}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:rgba(247,246,243,0.35);">Erstes Tattoo</td><td style="padding:5px 0;font-size:12px;color:#F7F6F3;font-weight:500;">${esc((health || {}).isFirstTattoo) || '–'}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:rgba(247,246,243,0.35);">Allergien</td><td style="padding:5px 0;font-size:12px;color:#F7F6F3;font-weight:500;">${esc((health || {}).knownAllergies) || '–'}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:rgba(247,246,243,0.35);">Bevorzugte Zeit</td><td style="padding:5px 0;font-size:12px;color:#F7F6F3;font-weight:500;">${esc((appointment || {}).preferredTime) || '–'}</td></tr>
    </table>
  </td></tr>

  <!-- Text blocks -->
  ${(motif || {}).description ? `<tr><td style="padding:0 0 16px;"><div style="border-left:2px solid ${AC};padding:12px 16px;"><p style="margin:0 0 5px;font-size:9px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.12em;">Motiv-Beschreibung</p><p style="margin:0;font-size:13px;color:rgba(247,246,243,0.75);line-height:1.65;">${esc(motif.description)}</p></div></td></tr>` : ''}
  ${(motif || {}).coverUpNotes ? `<tr><td style="padding:0 0 16px;"><div style="border-left:2px solid ${AC};padding:12px 16px;"><p style="margin:0 0 5px;font-size:9px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.12em;">Cover-Up Details</p><p style="margin:0;font-size:13px;color:rgba(247,246,243,0.75);line-height:1.65;">${esc(motif.coverUpNotes)}</p></div></td></tr>` : ''}
  ${(style || {}).styleNotes ? `<tr><td style="padding:0 0 16px;"><div style="border-left:2px solid ${AC};padding:12px 16px;"><p style="margin:0 0 5px;font-size:9px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.12em;">Stil in eigenen Worten</p><p style="margin:0;font-size:13px;color:rgba(247,246,243,0.75);line-height:1.65;">${esc(style.styleNotes)}</p></div></td></tr>` : ''}
  ${(health || {}).allergiesDetail ? `<tr><td style="padding:0 0 16px;"><div style="border-left:2px solid ${AC};padding:12px 16px;"><p style="margin:0 0 5px;font-size:9px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.12em;">Allergie-Details</p><p style="margin:0;font-size:13px;color:rgba(247,246,243,0.75);line-height:1.65;">${esc(health.allergiesDetail)}</p></div></td></tr>` : ''}
  ${(budget || {}).notes ? `<tr><td style="padding:0 0 16px;"><div style="border-left:2px solid ${AC};padding:12px 16px;"><p style="margin:0 0 5px;font-size:9px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.12em;">Besondere Wünsche</p><p style="margin:0;font-size:13px;color:rgba(247,246,243,0.75);line-height:1.65;">${esc(budget.notes)}</p></div></td></tr>` : ''}
  ${((style || {}).inspirationImageCount > 0) ? `<tr><td style="padding:0 0 16px;"><div style="border:1px solid rgba(247,246,243,0.1);border-radius:8px;padding:14px 18px;"><p style="margin:0 0 3px;font-size:13px;font-weight:700;color:#F7F6F3;">🖼 ${style.inspirationImageCount} Referenzbild${style.inspirationImageCount > 1 ? 'er' : ''} hochgeladen</p><p style="margin:0;font-size:12px;color:rgba(247,246,243,0.3);">Im Dashboard einsehbar.</p></div></td></tr>` : ''}

  <!-- Divider -->
  <tr><td style="padding:8px 0 28px;"><div style="height:1px;background:rgba(247,246,243,0.08);"></div></td></tr>

  <!-- CTA -->
  <tr><td style="padding:0 0 32px;">
    <a href="${process.env.DASHBOARD_URL || 'https://einfachanfrage-tattoo.de/dashboard'}" style="display:inline-block;background:${AC};color:#fff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.08em;padding:13px 28px;border-radius:4px;text-decoration:none;text-transform:uppercase;">Im Dashboard ansehen →</a>
  </td></tr>

  <!-- Contact -->
  <tr><td style="padding:0 0 8px;">
    <p style="margin:0 0 3px;font-size:9px;font-weight:700;color:${AC};text-transform:uppercase;letter-spacing:0.14em;">Kontakt</p>
    <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#F7F6F3;letter-spacing:-0.02em;">${name}</p>
    <p style="margin:0 0 3px;"><a href="mailto:${esc(contact.email)}" style="font-size:13px;color:rgba(247,246,243,0.5);text-decoration:none;">${esc(contact.email)}</a></p>
    ${contact.phone ? `<p style="margin:0 0 3px;font-size:13px;color:rgba(247,246,243,0.35);">${esc(contact.phone)}</p>` : ''}
    ${contact.instagram ? `<p style="margin:0 0 3px;font-size:13px;color:rgba(247,246,243,0.35);">Instagram: ${esc(contact.instagram)}</p>` : ''}
    <p style="margin:8px 0 0;font-size:11px;color:rgba(247,246,243,0.2);">Gefunden über: ${esc(contact.howFound) || '–'}</p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:32px 0 0;border-top:1px solid rgba(247,246,243,0.06);">
    <p style="margin:0;font-size:11px;color:rgba(247,246,243,0.2);">Einfach Anfrage · <a href="https://einfachanfrage-tattoo.de" style="color:rgba(247,246,243,0.2);text-decoration:none;">einfachanfrage-tattoo.de</a></p>
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
