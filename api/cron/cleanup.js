'use strict';

/**
 * DSGVO-Löschroutine – läuft wöchentlich via Vercel Cron
 *
 * Aufbewahrungsfristen:
 *   archiviert             → 6 Monate
 *   neu / in_bearbeitung / termin_ausstehend → 24 Monate
 *   beauftragt             → 36 Monate
 *
 * Der Endpunkt ist durch den CRON_SECRET geschützt.
 * Vercel sendet diesen automatisch als Authorization-Header.
 */

const supabase = require('../_supabase');

const MONTHS_ARCHIVED    = 6;
const MONTHS_NO_CONTRACT = 24;
const MONTHS_BOOKED      = 36;

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString();
}

module.exports = async (req, res) => {
  // Only GET (Vercel cron) or POST (manual trigger by admin)
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  // Protect with CRON_SECRET
  const auth   = (req.headers['authorization'] || '').replace('Bearer ', '');
  const secret = process.env.CRON_SECRET;

  if (!secret || auth !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const stats = { scanned: 0, deleted: 0, imagesDeleted: 0, errors: 0 };
  const log   = [];

  try {
    // ── 1. Archivierte Anfragen älter als 6 Monate ──────────────────────────
    const { data: archived } = await supabase
      .from('inquiries')
      .select('id, created_at, status')
      .eq('status', 'archiviert')
      .lt('created_at', monthsAgo(MONTHS_ARCHIVED));

    // ── 2. Nicht abgeschlossene Anfragen älter als 24 Monate ────────────────
    const { data: stale } = await supabase
      .from('inquiries')
      .select('id, created_at, status')
      .in('status', ['neu', 'in_bearbeitung', 'termin_ausstehend'])
      .lt('created_at', monthsAgo(MONTHS_NO_CONTRACT));

    // ── 3. Beauftragte Anfragen älter als 36 Monate ─────────────────────────
    const { data: oldBooked } = await supabase
      .from('inquiries')
      .select('id, created_at, status')
      .eq('status', 'beauftragt')
      .lt('created_at', monthsAgo(MONTHS_BOOKED));

    const toDelete = [
      ...(archived   || []),
      ...(stale      || []),
      ...(oldBooked  || []),
    ];

    stats.scanned = toDelete.length;

    if (toDelete.length === 0) {
      return res.json({
        ...stats,
        message: 'Keine Einträge zum Löschen gefunden.',
        runAt: new Date().toISOString(),
      });
    }

    // ── Delete images + inquiry for each entry ───────────────────────────────
    for (const inquiry of toDelete) {
      try {
        // Delete images from Supabase Storage
        const { data: files, error: listErr } = await supabase.storage
          .from('inquiry-images')
          .list(inquiry.id);

        if (!listErr && files && files.length > 0) {
          const paths = files.map(f => `${inquiry.id}/${f.name}`);
          const { error: removeErr } = await supabase.storage
            .from('inquiry-images')
            .remove(paths);

          if (removeErr) {
            console.error(`Image delete failed for ${inquiry.id}:`, removeErr.message);
            stats.errors++;
          } else {
            stats.imagesDeleted += files.length;
          }
        }

        // Delete inquiry from database
        const { error: delErr } = await supabase
          .from('inquiries')
          .delete()
          .eq('id', inquiry.id);

        if (delErr) {
          console.error(`Inquiry delete failed for ${inquiry.id}:`, delErr.message);
          stats.errors++;
          log.push({ id: inquiry.id, status: inquiry.status, error: delErr.message });
        } else {
          stats.deleted++;
          log.push({ id: inquiry.id, status: inquiry.status, deleted: true });
        }

      } catch (err) {
        console.error(`Unexpected error for ${inquiry.id}:`, err.message);
        stats.errors++;
      }
    }

    console.log('DSGVO Cleanup completed:', JSON.stringify(stats));

    return res.json({
      ...stats,
      message: `${stats.deleted} Anfragen und ${stats.imagesDeleted} Bilder gelöscht.`,
      runAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error('Cleanup fatal error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
