'use strict';

const supabase = require('../_supabase');
const bcrypt   = require('bcryptjs');
const { requireAuth } = require('../_auth');

module.exports = async (req, res) => {
  const { slug } = req.query;
  const key = slug.toLowerCase();

  // ── GET /api/photographers/:slug ──────────────────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('photographers')
      .select('slug, name, theme, delivery, language, required_contact')
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

    const { theme, delivery, language, newPassword, currentPassword, required_contact } = req.body || {};
    const updates = {};

    // Theme / delivery / language
    const VALID_THEMES         = ['champagne', 'nacht', 'sage', 'clean', 'modern'];
    const VALID_DELIVERIES     = ['both', 'email', 'dashboard'];
    const VALID_LANGUAGES      = ['de', 'en', 'auto'];
    const VALID_CONTACT_FIELDS = ['email', 'phone', 'instagram'];
    if (theme    && VALID_THEMES.includes(theme))        updates.theme    = theme;
    if (delivery && VALID_DELIVERIES.includes(delivery)) updates.delivery = delivery;
    if (language && VALID_LANGUAGES.includes(language))  updates.language = language;

    // Pflichtfelder Kontakt
    if (required_contact !== undefined) {
      if (!Array.isArray(required_contact)) {
        return res.status(400).json({ error: 'required_contact muss ein Array sein.' });
      }
      const invalid = required_contact.filter(f => !VALID_CONTACT_FIELDS.includes(f));
      if (invalid.length) {
        return res.status(400).json({ error: 'Ungültige Felder: ' + invalid.join(', ') });
      }
      updates.required_contact = required_contact;
    }

    // Password change
    if (newPassword) {
      const { data: existing } = await supabase
        .from('photographers').select('password').eq('slug', key).single();

      if (!existing || !existing.password) {
        return res.status(401).json({ error: 'Aktuelles Passwort ist falsch.' });
      }

      // Support both bcrypt and legacy plaintext for the current password check
      const isBcrypt = existing.password.startsWith('$2b$') || existing.password.startsWith('$2a$');
      const currentValid = isBcrypt
        ? await bcrypt.compare(currentPassword, existing.password)
        : existing.password === currentPassword;

      if (!currentValid) {
        return res.status(401).json({ error: 'Aktuelles Passwort ist falsch.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Neues Passwort muss mindestens 6 Zeichen haben.' });
      }
      // Always store new password as bcrypt hash
      updates.password = await bcrypt.hash(newPassword, 12);
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'Keine Änderungen angegeben.' });
    }

    const { data, error } = await supabase
      .from('photographers')
      .update(updates)
      .eq('slug', key)
      .select('slug, name, theme, delivery, language, required_contact')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, ...data });
  }

  res.status(405).end();
};
