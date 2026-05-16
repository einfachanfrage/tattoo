'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');

function formatDate(isoDate) {
  if (!isoDate) return null;
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

function val(v, fallback = '–') {
  if (!v || (Array.isArray(v) && v.length === 0)) return fallback;
  if (Array.isArray(v)) return v.join(', ');
  return v;
}

function cell(label, value) {
  const isUnclear = !value || String(value).toLowerCase().includes('unklar') || value === '–';
  const displayValue = isUnclear
    ? `<span class="badge-unclear">Noch unklar</span>`
    : `<span class="cell-value">${value}</span>`;
  return `
    <tr>
      <td class="cell-label">${label}</td>
      <td class="cell-data">${displayValue}</td>
    </tr>`;
}

function buildPdfHtml(submission) {
  const { contact, wedding, location, wishes, budget } = submission;
  const names = `${contact.partner1 || '–'} & ${contact.partner2 || '–'}`;
  const weddingDate = wedding.dateUnclear ? null : formatDate(wedding.date);

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', Arial, sans-serif;
    background: #FAF7F2;
    color: #1A1A1A;
    padding: 0;
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 16mm 18mm;
    background: #FAF7F2;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 36px;
    padding-bottom: 20px;
    border-bottom: 1px solid #E2DDD6;
  }

  .header-meta {
    text-align: right;
  }

  .logo {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 18px;
    font-weight: 500;
    color: #C9A96E;
    letter-spacing: 0.05em;
  }

  .meta-label {
    font-size: 10px;
    color: #8A8580;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }

  .meta-value {
    font-size: 12px;
    color: #1A1A1A;
  }

  /* Title block */
  .title-block {
    margin-bottom: 32px;
  }

  .eyebrow {
    font-size: 11px;
    color: #C9A96E;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 8px;
  }

  h1 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 38px;
    font-weight: 400;
    color: #1A1A1A;
    line-height: 1.1;
    margin-bottom: 6px;
  }

  .subtitle {
    font-size: 13px;
    color: #8A8580;
  }

  /* Sections */
  .section {
    margin-bottom: 28px;
    background: #FFFFFF;
    border-radius: 10px;
    border: 1px solid #E2DDD6;
    overflow: hidden;
  }

  .section-header {
    background: #1A1A1A;
    padding: 10px 18px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-icon {
    color: #C9A96E;
    font-size: 14px;
  }

  .section-title {
    font-size: 11px;
    font-weight: 600;
    color: #FAF7F2;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  table.data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table tr {
    border-bottom: 1px solid #F0EDE8;
  }

  .data-table tr:last-child {
    border-bottom: none;
  }

  .cell-label {
    padding: 10px 18px;
    font-size: 12px;
    color: #8A8580;
    width: 42%;
    vertical-align: top;
  }

  .cell-data {
    padding: 10px 18px 10px 0;
    font-size: 13px;
    color: #1A1A1A;
    vertical-align: top;
  }

  .cell-value {
    font-weight: 500;
  }

  .badge-unclear {
    display: inline-block;
    background: #E8E4DD;
    color: #8A8580;
    padding: 2px 10px;
    border-radius: 20px;
    font-size: 11px;
  }

  /* Notes box */
  .notes-section {
    margin-bottom: 28px;
    background: #FFFFFF;
    border-radius: 10px;
    border: 1px solid #E2DDD6;
    overflow: hidden;
  }

  .notes-body {
    padding: 16px 18px;
    border-left: 3px solid #C9A96E;
    background: rgba(201,169,110,0.04);
  }

  .notes-label {
    font-size: 10px;
    color: #C9A96E;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
  }

  .notes-text {
    font-size: 14px;
    color: #1A1A1A;
    line-height: 1.7;
    font-style: italic;
  }

  /* Action box */
  .action-box {
    background: #1A1A1A;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 28px;
  }

  .action-label {
    font-size: 10px;
    color: #C9A96E;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-bottom: 12px;
  }

  .action-names {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px;
    font-weight: 400;
    color: #FAF7F2;
    margin-bottom: 8px;
  }

  .action-email {
    font-size: 15px;
    color: #C9A96E;
    margin-bottom: 4px;
  }

  .action-phone {
    font-size: 14px;
    color: #8A8580;
  }

  .action-meta {
    margin-top: 12px;
    font-size: 11px;
    color: #8A8580;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  /* Footer */
  .footer {
    margin-top: 36px;
    padding-top: 16px;
    border-top: 1px solid #E2DDD6;
    text-align: center;
    font-size: 11px;
    color: #8A8580;
  }

  .footer strong {
    color: #C9A96E;
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <span class="logo">Einfach Anfrage</span>
    <div class="header-meta">
      <div class="meta-label">Anfrage erhalten</div>
      <div class="meta-value">${formatDateTime(submission.createdAt)}</div>
    </div>
  </div>

  <!-- Title -->
  <div class="title-block">
    <div class="eyebrow">Neue Hochzeitsanfrage</div>
    <h1>${names}</h1>
    <div class="subtitle">
      Hochzeitsdatum: ${weddingDate ? `<strong>${weddingDate}</strong>` : '<span style="color:#8A8580">Noch unklar</span>'}
      &ensp;·&ensp; ${val(location.city)}, ${val(location.state)}
    </div>
  </div>

  <!-- Section: Euer großer Tag -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">◆</span>
      <span class="section-title">Euer großer Tag</span>
    </div>
    <table class="data-table">
      ${cell('Hochzeitsdatum', weddingDate)}
      ${cell('Uhrzeit Trauung', val(wedding.ceremonyTime))}
      ${cell('Dauer des Events', val(wedding.duration))}
    </table>
  </div>

  <!-- Section: Location -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">◆</span>
      <span class="section-title">Location</span>
    </div>
    <table class="data-table">
      ${cell('Bundesland', val(location.state))}
      ${cell('Stadt / Ort', val(location.city))}
      ${cell('Art der Location', val(location.types))}
      ${cell('Mehrere Locations', val(location.multipleLocations))}
    </table>
  </div>

  <!-- Section: Wünsche -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">◆</span>
      <span class="section-title">Wünsche &amp; Stil</span>
    </div>
    <table class="data-table">
      ${cell('Anzahl Gäste', val(wishes.guestCount))}
      ${cell('Gewünschter Stil', val(wishes.style))}
      ${cell('Videograf', val(wishes.videographer))}
      ${cell('Zweiter Fotograf', val(wishes.secondPhotographer))}
    </table>
  </div>

  <!-- Section: Budget -->
  <div class="section">
    <div class="section-header">
      <span class="section-icon">◆</span>
      <span class="section-title">Budget</span>
    </div>
    <table class="data-table">
      ${cell('Budgetrahmen', val(budget.range))}
    </table>
  </div>

  ${budget.notes ? `
  <!-- Notes -->
  <div class="notes-section">
    <div class="notes-body">
      <div class="notes-label">Besondere Wünsche &amp; Notizen</div>
      <div class="notes-text">"${budget.notes}"</div>
    </div>
  </div>
  ` : ''}

  <!-- Action box -->
  <div class="action-box">
    <div class="action-label">Kontakt aufnehmen</div>
    <div class="action-names">${names}</div>
    <div class="action-email">${contact.email}</div>
    ${contact.phone ? `<div class="action-phone">${contact.phone}</div>` : ''}
    <div class="action-meta">Gefunden über: ${contact.howFound || '–'}</div>
  </div>

  <!-- Footer -->
  <div class="footer">
    Generiert von <strong>Einfach Anfrage</strong> · einfachanfrage.de
  </div>

</div>
</body>
</html>`;
}

async function generatePDF(submission) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    console.warn('⚠️  Puppeteer nicht verfügbar – PDF wird übersprungen.');
    return null;
  }

  const html = buildPdfHtml(submission);
  const tmpFile = path.join(os.tmpdir(), `anfrage-${submission.id}-${Date.now()}.pdf`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Font loading benötigt eine HTTP-Verbindung; daher kurz warten
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    const pdfBuffer = await page.pdf({
      path: tmpFile,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    return pdfBuffer;
  } finally {
    await browser.close();

    // Temp-Datei aufräumen
    fs.unlink(tmpFile, () => {});
  }
}

module.exports = { generatePDF };
