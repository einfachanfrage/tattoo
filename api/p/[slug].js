'use strict';

const supabase = require('../_supabase');

function standalonePage(photographer) {
  const { name, slug, theme = 'champagne', email, delivery } = photographer;
  const apiBase = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : '';

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
    data-email="${email}"
    data-name="${name}"
    data-slug="${slug}"
    data-theme="${theme}"
    data-delivery="${delivery || 'both'}"
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

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { slug } = req.query;

  const { data, error } = await supabase
    .from('photographers')
    .select('*')
    .eq('slug', slug.toLowerCase())
    .single();

  if (error || !data) {
    return res.status(404).send('Fotograf nicht gefunden.');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(standalonePage(data));
};
