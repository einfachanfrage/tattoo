'use strict';

const supabase = require('../_supabase');
const { requireAuth } = require('../_auth');

module.exports = async (req, res) => {
  const { slug } = req.query;
  const key = slug.toLowerCase();

  // ── GET /api/photographers/:slug ──────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('photographers')
      .select('slug, name, theme, delivery')
      .eq('slug', key)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Nicht gefunden' });
    return res.json(data);
  }

  // ── PATCH /api/photographers/:slug  (update settings) ─────────────────────
  if (req.method === 'PATCH') {
    if (!requireAuth(req, res)) return;

    // Photographers may only update their own profile
    if (req.photographerSlug && req.photographerSlug !== key) {
      return res.status(403).json({ error: 'Kein Zugriff auf dieses Profil.' });
    }

    const { theme, delivery, newPassword, currentPassword } = req.body || {};
    const updates = {};

    // Theme / delivery
    const VALID_THEMES    = ['champagne', 'nacht', 'sage', 'clean', 'modern'];
    const VALID_DELIVERIES = ['both', 'email', 'dashboard'];
    if (theme    && VALID_THEMES.includes(theme))       updates.theme    = theme;
    if (delivery && VALID_DELIVERIES.includes(delivery)) updates.delivery = delivery;

    // Password change
    if (newPassword) {
      // Verify current password
      const { data: existing } = await supabase
        .from('photographers').select('password').eq('slug', key).single();

      if (!existing || existing.password !== currentPassword) {
        return res.status(401).json({ error: 'Aktuelles Passwort ist falsch.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Neues Passwort muss mindestens 6 Zeichen haben.' });
      }
      updates.password = newPassword;
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'Keine Änderungen angegeben.' });
    }

    const { data, error } = await supabase
      .from('photographers')
      .update(updates)
      .eq('slug', key)
      .select('slug, name, theme, delivery')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, ...data });
  }

  res.status(405).end();
};
