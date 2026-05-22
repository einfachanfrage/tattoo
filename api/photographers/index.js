'use strict';

const bcrypt   = require('bcryptjs');
const supabase = require('../_supabase');
const { requireAuth } = require('../_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  if (!requireAuth(req, res)) return;

  const { slug, name, email, theme, delivery, password } = req.body || {};

  if (!slug || !name || !email) {
    return res.status(400).json({ error: 'slug, name und email sind Pflicht.' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Passwort ist Pflicht.' });
  }

  const key  = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const hash = await bcrypt.hash(password, 12);

  const { error } = await supabase
    .from('photographers')
    .upsert({ slug: key, name, email, theme: theme || 'champagne', delivery: delivery || 'both', password: hash });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true, slug: key, url: `/p/${key}` });
};
