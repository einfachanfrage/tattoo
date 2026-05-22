'use strict';

// /api/submissions/:id/status  →  PATCH
// (kept for backwards-compat; delegates to [id].js logic)

const supabase = require('../../_supabase');
const { requireAuth } = require('../../_auth');

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') return res.status(405).end();
  if (!requireAuth(req, res)) return;

  const { id } = req.query;
  const { status } = req.body || {};

  const VALID = ['neu', 'in_bearbeitung', 'termin_ausstehend', 'beauftragt', 'archiviert',
                 'angebot_gesendet']; // legacy compat
  if (!VALID.includes(status)) {
    return res.status(400).json({ error: 'Ungültiger Status.' });
  }

  const { data: existing } = await supabase
    .from('inquiries').select('*').eq('id', id).single();

  if (!existing) return res.status(404).json({ error: 'Nicht gefunden' });

  const updatedData = { ...existing.data, status };

  const { data, error } = await supabase
    .from('inquiries')
    .update({ data: updatedData, status })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ ...data.data, id: data.id, createdAt: data.created_at, status });
};
