'use strict';

const supabase = require('./_supabase');
const bcrypt   = require('bcryptjs');
const { makeAdminToken, makePhotographerToken } = require('./_auth');

// No hardcoded fallback – must be set via environment variable
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || null;

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

    if (!data.password) {
      return res.status(401).json({ error: 'Kein Passwort gesetzt. Bitte Administrator kontaktieren.' });
    }

    let passwordValid = false;
    const isBcrypt = data.password.startsWith('$2b$') || data.password.startsWith('$2a$');

    if (isBcrypt) {
      // Modern bcrypt comparison
      passwordValid = await bcrypt.compare(password, data.password);
    } else {
      // Legacy plaintext – compare directly
      passwordValid = data.password === password;
      if (passwordValid) {
        // Auto-upgrade to bcrypt on first login
        const hash = await bcrypt.hash(password, 12);
        await supabase.from('photographers').update({ password: hash }).eq('slug', key);
        console.log('Password auto-upgraded to bcrypt for:', key);
      }
    }

    if (!passwordValid) {
      return res.status(401).json({ error: 'Falsches Passwort.' });
    }

    return res.json({
      token: makePhotographerToken(key),
      slug:  key,
      name:  data.name,
    });
  }

  // ── Admin login (password only) ───────────────────────────────────────────
  if (!DASHBOARD_PASS) {
    console.error('CRITICAL: DASHBOARD_PASS environment variable is not set!');
    return res.status(500).json({ error: 'Server-Konfigurationsfehler.' });
  }

  if (password !== DASHBOARD_PASS) {
    return res.status(401).json({ error: 'Falsches Passwort.' });
  }

  res.json({ token: makeAdminToken(), slug: null, name: 'Admin' });
};
