'use strict';

const supabase = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { slug } = req.query;

  const { data, error } = await supabase
    .from('photographers')
    .select('slug, name, theme')
    .eq('slug', slug.toLowerCase())
    .single();

  if (error || !data) return res.status(404).json({ error: 'Nicht gefunden' });

  res.json(data);
};
