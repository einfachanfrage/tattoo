'use strict';

const supabase = require('./_supabase');
const { makeAdminToken, makePhotographerToken } = require('./_auth');

const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'einfach2026';

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, slug } = req.body || {};

  // ── Photographer login (slug + password) ──────────────────────────────────
  if (slug) {
    const key = slug.toLowerCase().trim();

    const { data, error } = await supabase
      .from('photographers')
      .select('password, name')
      .eq('slug', key)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Unbekannte URL / falscher Slug.' });
    }

    if (!data.password || data.password !== password) {
      return res.status(401).json({ error: 'Falsches Passwort.' });
    }

    return res.json({
      token: makePhotographerToken(key),
      slug:  key,
      name:  data.name,
    });
  }

  // ── Admin login (password only) ───────────────────────────────────────────
  if (password !== DASHBOARD_PASS) {
    return res.status(401).json({ error: 'Falsches Passwort.' });
  }

  res.json({ token: makeAdminToken(), slug: null, name: 'Admin' });
};
