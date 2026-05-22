'use strict';

// GET /api/admin/overview  →  alle Studios mit Anfragen-Zählern
// Nur für Admins (makeAdminToken)

const supabase       = require('../_supabase');
const { requireAuth } = require('../_auth');

const STATUSES = ['neu', 'in_bearbeitung', 'termin_ausstehend', 'beauftragt', 'archiviert'];

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  if (!requireAuth(req, res)) return;

  // Nur Admin darf diese Route aufrufen
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Kein Admin-Zugriff.' });
  }

  // Alle Studios laden
  const { data: studios, error: stErr } = await supabase
    .from('photographers')
    .select('slug, name, email, theme')
    .order('name');

  if (stErr) return res.status(500).json({ error: stErr.message });

  // Alle Anfragen laden (nur slug + status, minimal)
  const { data: inquiries, error: inqErr } = await supabase
    .from('inquiries')
    .select('photographer_slug, status');

  if (inqErr) return res.status(500).json({ error: inqErr.message });

  // Zähler je Studio berechnen
  const countMap = {};
  for (const inq of (inquiries || [])) {
    const slug   = inq.photographer_slug;
    const status = inq.status || 'neu';
    if (!countMap[slug]) {
      countMap[slug] = { total: 0 };
      for (const s of STATUSES) countMap[slug][s] = 0;
    }
    if (STATUSES.includes(status)) countMap[slug][status]++;
    // legacy: angebot_gesendet → termin_ausstehend
    else if (status === 'angebot_gesendet') countMap[slug]['termin_ausstehend']++;
    countMap[slug].total++;
  }

  const result = (studios || []).map(st => ({
    slug:    st.slug,
    name:    st.name,
    email:   st.email,
    theme:   st.theme,
    counts:  countMap[st.slug] || { total: 0, neu: 0, in_bearbeitung: 0, termin_ausstehend: 0, beauftragt: 0, archiviert: 0 },
  }));

  res.json(result);
};
