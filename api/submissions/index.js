'use strict';

const crypto     = require('crypto');
const supabase   = require('../_supabase');
const { requireAuth } = require('../_auth');
const { sendEmails }  = require('../_email');

function generateId() {
  return crypto.randomUUID();
}

function rowToSubmission(row) {
  return {
    ...row.data,
    id:        row.id,
    createdAt: row.created_at,
    status:    row.status || row.data?.status || 'neu',
  };
}

module.exports = async (req, res) => {
  // ── GET /api/submissions ──────────────────────────────────────────────────
  if (req.method === 'GET') {
    if (!requireAuth(req, res)) return;

    const { status, photographer_slug } = req.query;

    let query = supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    // Photographers only see their own submissions; admins can filter or see all
    if (req.photographerSlug) {
      query = query.eq('photographer_slug', req.photographerSlug);
    } else if (photographer_slug) {
      query = query.eq('photographer_slug', photographer_slug);
    }
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    return res.json(data.map(rowToSubmission));
  }

  // ── POST /api/submissions ─────────────────────────────────────────────────
  if (req.method === 'POST') {
    const body = req.body || {};

    if (!body.contact?.email) {
      return res.status(400).json({ error: 'E-Mail-Adresse ist Pflichtfeld.' });
    }

    const delivery = body.delivery || 'both';
    const id       = generateId();
    const now      = new Date().toISOString();

    const submission = {
      id,
      createdAt: now,
      status: 'neu',
      ...body,
    };

    // Save to Supabase (unless email-only delivery)
    if (delivery !== 'email') {
      const slug = body.photographerSlug
        || body.photographerEmail?.split('@')[0]?.replace(/[^a-z0-9]/gi, '').toLowerCase()
        || 'unknown';

      const { error: dbErr } = await supabase.from('inquiries').insert({
        id,
        photographer_slug: slug,
        data:       submission,
        status:     'neu',
        created_at: now,
      });

      if (dbErr) console.error('DB insert error:', dbErr.message);
    }

    // Send email before responding (serverless functions stop after res.json)
    if (delivery !== 'dashboard') {
      try {
        await sendEmails(
          submission,
          body.photographerEmail || process.env.PHOTOGRAPHER_EMAIL,
          body.photographerName  || process.env.PHOTOGRAPHER_NAME,
        );
      } catch (err) {
        console.error('Email error:', err.message);
      }
    }

    res.json({ success: true, id });
    return;
  }

  res.status(405).end();
};
