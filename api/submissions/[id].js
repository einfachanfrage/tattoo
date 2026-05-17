'use strict';

const supabase = require('../_supabase');
const { requireAuth } = require('../_auth');

function rowToSubmission(row) {
  return {
    ...row.data,
    id:        row.id,
    createdAt: row.created_at,
    status:    row.status || row.data?.status || 'neu',
  };
}

module.exports = async (req, res) => {
  const { id } = req.query;

  // ── GET /api/submissions/:id ──────────────────────────────────────────────
  if (req.method === 'GET') {
    if (!requireAuth(req, res)) return;

    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Nicht gefunden' });
    return res.json(rowToSubmission(data));
  }

  // ── PATCH /api/submissions/:id (status update) ────────────────────────────
  if (req.method === 'PATCH') {
    if (!requireAuth(req, res)) return;

    const { status } = req.body || {};
    const VALID = ['neu', 'in_bearbeitung', 'angebot_gesendet', 'beauftragt', 'archiviert'];

    if (!VALID.includes(status)) {
      return res.status(400).json({ error: 'Ungültiger Status.' });
    }

    // Fetch existing row
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
    return res.json(rowToSubmission(data));
  }

  // ── DELETE /api/submissions/:id ───────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!requireAuth(req, res)) return;

    const { error } = await supabase
      .from('inquiries').delete().eq('id', id);

    if (error) return res.status(404).json({ error: 'Nicht gefunden' });
    return res.json({ success: true });
  }

  res.status(405).end();
};
