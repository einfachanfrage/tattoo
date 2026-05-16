'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { generatePDF } = require('./pdf-generator');
const { sendEmails } = require('./email-sender');
const demoData = require('./demo-data');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Photographers config ──────────────────────────────────────────────────────
const PHOTOGRAPHERS_FILE = path.join(__dirname, 'photographers.json');
function loadPhotographers() {
  try { return JSON.parse(fs.readFileSync(PHOTOGRAPHERS_FILE, 'utf8')); }
  catch { return {}; }
}
function savePhotographers(data) {
  fs.writeFileSync(PHOTOGRAPHERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── Standalone page generator ─────────────────────────────────────────────────
function standalonePage(photographer) {
  const { name, theme = 'champagne' } = photographer;
  const apiBase = process.env.API_BASE || '';
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Anfrage – ${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body {
      font-family: 'Inter', sans-serif;
      background: #1A1A1A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 40px 20px;
      text-align: center;
    }
    .pg-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(28px, 6vw, 48px);
      font-weight: 400;
      color: #FAF7F2;
      margin-bottom: 12px;
      line-height: 1.15;
    }
    .pg-sub {
      font-size: 15px;
      color: rgba(250,247,242,0.45);
      margin-bottom: 40px;
      max-width: 340px;
      line-height: 1.6;
    }
    .pg-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #C9A96E;
      color: #1A1A1A;
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 9px;
      border: none;
      cursor: pointer;
      transition: background 0.18s;
    }
    .pg-btn:hover { background: #b8934a; }
    .pg-powered {
      position: fixed;
      bottom: 20px;
      left: 0; right: 0;
      text-align: center;
      font-size: 11px;
      color: rgba(250,247,242,0.2);
      letter-spacing: 0.04em;
    }
    .pg-powered a { color: rgba(201,169,110,0.5); text-decoration: none; }
    .pg-powered a:hover { color: #C9A96E; }
  </style>
</head>
<body>
  <div class="pg-name">${name}</div>
  <p class="pg-sub">Stell deine Hochzeitsanfrage – in 3 Minuten, Schritt für Schritt.</p>
  <button class="pg-btn" data-einfachanfrage>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    Anfrage stellen
  </button>
  <div class="pg-powered">Powered by <a href="https://einfachanfrage.de" target="_blank">einfach anfrage</a></div>

  <script src="${apiBase}/widget.js"
    data-email="${photographer.email}"
    data-name="${name}"
    data-theme="${theme}"
    data-delivery="${photographer.delivery || 'both'}"
    data-api="${apiBase}">
  </script>
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () {
        if (window.einfachAnfrage) window.einfachAnfrage.open();
      }, 300);
    });
  </script>
</body>
</html>`;
}

// ── Auth token (generated once at startup) ────────────────────────────────────
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'einfach2026';
const SESSION_TOKEN = require('crypto').randomBytes(32).toString('hex');

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ── Auth helper ───────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== SESSION_TOKEN) return res.status(401).json({ error: 'Nicht autorisiert.' });
  next();
}

// ── Auth route ────────────────────────────────────────────────────────────────
app.post('/api/auth', (req, res) => {
  const { password } = req.body || {};
  if (password !== DASHBOARD_PASS) {
    return res.status(401).json({ error: 'Falsches Passwort.' });
  }
  res.json({ token: SESSION_TOKEN });
});

// ── In-memory Submissions Store ───────────────────────────────────────────────
let submissions = [...demoData];

// ── Static file serving ───────────────────────────────────────────────────────

// Widget-JS
app.use('/widget.js', express.static(path.join(__dirname, '../widget/widget.js')));

// Dashboard → /dashboard
app.use('/dashboard', express.static(path.join(__dirname, '../dashboard')));

// Landing Page → /
app.use(express.static(path.join(__dirname, '../landing')));

// ── Standalone photographer pages ─────────────────────────────────────────────
app.get('/p/:slug', (req, res) => {
  const photographers = loadPhotographers();
  const photographer = photographers[req.params.slug.toLowerCase()];
  if (!photographer) return res.status(404).send('Fotograf nicht gefunden.');
  res.send(standalonePage(photographer));
});

// GET /api/photographers/:slug — öffentliche Profil-Info
app.get('/api/photographers/:slug', (req, res) => {
  const photographers = loadPhotographers();
  const p = photographers[req.params.slug.toLowerCase()];
  if (!p) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ name: p.name, theme: p.theme, slug: req.params.slug });
});

// POST /api/photographers — neuen Fotografen anlegen / updaten (Auth required)
app.post('/api/photographers', requireAuth, (req, res) => {
  const { slug, name, email, theme, delivery } = req.body || {};
  if (!slug || !name || !email) {
    return res.status(400).json({ error: 'slug, name und email sind Pflicht.' });
  }
  const key = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const photographers = loadPhotographers();
  photographers[key] = { name, email, theme: theme || 'champagne', delivery: delivery || 'both' };
  savePhotographers(photographers);
  res.json({ success: true, slug: key, url: `/p/${key}` });
});

// ── Helper ────────────────────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── API Routes ────────────────────────────────────────────────────────────────

// GET /api/submissions — alle Anfragen auflisten
app.get('/api/submissions', requireAuth, (req, res) => {
  const { status } = req.query;
  const result = status
    ? submissions.filter(s => s.status === status)
    : submissions;
  res.json(result);
});

// GET /api/submissions/:id — eine Anfrage abrufen
app.get('/api/submissions/:id', requireAuth, (req, res) => {
  const submission = submissions.find(s => s.id === req.params.id);
  if (!submission) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json(submission);
});

// POST /api/submissions — neue Anfrage anlegen
app.post('/api/submissions', async (req, res) => {
  const data = req.body;

  // Minimalvalidierung
  if (!data.contact?.email) {
    return res.status(400).json({ error: 'E-Mail-Adresse ist Pflichtfeld.' });
  }

  const delivery = data.delivery || 'both'; // 'email' | 'dashboard' | 'both'

  const submission = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: 'neu',
    ...data,
  };

  // Im Dashboard speichern außer bei email-only
  if (delivery !== 'email') {
    submissions.unshift(submission);
  }

  // Sofortige Antwort an Client, PDF + E-Mail asynchron
  res.json({ success: true, id: submission.id });

  // E-Mail senden außer bei dashboard-only
  if (delivery !== 'dashboard') {
    setImmediate(async () => {
      try {
        console.log(`\n📥 Neue Anfrage: ${submission.contact?.partner1 || '–'} & ${submission.contact?.partner2 || '–'} (${submission.id})`);

        const pdfBuffer = await generatePDF(submission);
        if (pdfBuffer) {
          console.log(`📄 PDF generiert (${Math.round(pdfBuffer.length / 1024)} KB)`);
        }

        await sendEmails(
          submission,
          pdfBuffer,
          data.photographerEmail || process.env.PHOTOGRAPHER_EMAIL,
          data.photographerName || process.env.PHOTOGRAPHER_NAME,
        );

        console.log('✅ E-Mails versendet\n');
      } catch (err) {
        console.error('❌ Fehler bei PDF/E-Mail:', err.message);
      }
    });
  }
});

// PATCH /api/submissions/:id/status — Status ändern
app.patch('/api/submissions/:id/status', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const VALID_STATUSES = ['neu', 'in_bearbeitung', 'angebot_gesendet', 'beauftragt'];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Ungültiger Status.' });
  }

  const submission = submissions.find(s => s.id === id);
  if (!submission) return res.status(404).json({ error: 'Nicht gefunden' });

  submission.status = status;
  res.json(submission);
});

// GET /api/demo-submissions — öffentliche Vorschau (kein Auth nötig)
app.get('/api/demo-submissions', (req, res) => {
  res.json(demoData);
});

// POST /api/demo — Demo-Submissions (kein E-Mail-Versand)
app.post('/api/demo', (req, res) => {
  console.log('\nDemo-Submission eingegangen (kein Versand)');
  res.json({ success: true });
});

// POST /api/contact — Kontaktanfrage von der Landing Page
app.post('/api/contact', async (req, res) => {
  const { name, email, website, volume, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, E-Mail und Nachricht sind Pflicht.' });
  }

  console.log(`\nNeue Kontaktanfrage von ${name} (${email})`);

  try {
    const nodemailer = require('nodemailer');
    let transporter;

    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      const account = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', port: 587, secure: false,
        auth: { user: account.user, pass: account.pass },
      });
      console.log('Kein SMTP konfiguriert – Ethereal-Testmodus aktiv.');
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
    <h2 style="margin:0 0 4px;font-family:Georgia,serif;font-size:24px;font-weight:400;color:#1A1A1A;">${name}</h2>
    <a href="mailto:${email}" style="font-size:14px;color:#C9A96E;text-decoration:none;">${email}</a>
  </td></tr>
  <tr><td style="padding:8px 28px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E2DDD6;margin-top:16px;">
      ${website ? `<tr><td style="padding:9px 0;font-size:13px;color:#8A8580;width:150px;border-bottom:1px solid #F0EDE8;">Website</td><td style="padding:9px 0;font-size:13px;color:#1A1A1A;border-bottom:1px solid #F0EDE8;">${website}</td></tr>` : ''}
      ${volume ? `<tr><td style="padding:9px 0;font-size:13px;color:#8A8580;border-bottom:1px solid #F0EDE8;">Anfragen / Monat</td><td style="padding:9px 0;font-size:13px;color:#1A1A1A;border-bottom:1px solid #F0EDE8;">${volume}</td></tr>` : ''}
      <tr><td colspan="2" style="padding:16px 0 8px;font-size:11px;color:#8A8580;text-transform:uppercase;letter-spacing:0.1em;">Nachricht</td></tr>
      <tr><td colspan="2" style="background:#fff;padding:16px;border-radius:8px;font-size:14px;color:#1A1A1A;line-height:1.65;border:1px solid #E2DDD6;">${message.replace(/\n/g, '<br>')}</td></tr>
    </table>
  </td></tr>
  <tr><td style="background:#F0EDE8;padding:14px 28px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#8A8580;">Einfach Anfrage · einfachanfrage.de</p>
  </td></tr>
</table></td></tr></table>
</body></html>`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Einfach Anfrage" <${process.env.SMTP_USER || 'noreply@einfachanfrage.de'}>`,
      to: process.env.CONTACT_EMAIL || 'einfachanfrage@outlook.com',
      replyTo: email,
      subject: `Neue Anfrage von ${name} – Einfach Anfrage`,
      html,
    });

    if (nodemailer.getTestMessageUrl(info)) {
      console.log('Ethereal-Vorschau:', nodemailer.getTestMessageUrl(info));
    }
  } catch (err) {
    console.error('Kontaktformular-Fehler:', err.message);
  }

  res.json({ success: true });
});

// DELETE /api/submissions/:id — Demo-Zweck: Anfrage löschen
app.delete('/api/submissions/:id', requireAuth, (req, res) => {
  const before = submissions.length;
  submissions = submissions.filter(s => s.id !== req.params.id);
  if (submissions.length === before) return res.status(404).json({ error: 'Nicht gefunden' });
  res.json({ success: true });
});

// ── Server starten ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌸 Einfach Anfrage läuft auf http://localhost:${PORT}`);
  console.log(`   Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`   Widget:    http://localhost:${PORT}/widget.js`);
  console.log(`   API:       http://localhost:${PORT}/api/submissions\n`);
});
