'use strict';

const crypto  = require('crypto');
const supabase = require('./_supabase-admin');

/**
 * POST /api/upload
 *
 * Lädt ein Bild in Supabase Storage und gibt die signierte URL zurück.
 * submissionId ist optional – wenn nicht angegeben, wird ein UUID als Pfad-Präfix genutzt.
 * Es wird KEIN DB-Update gemacht; die URL wird stattdessen direkt vom Widget in die
 * initiale Submission eingebettet (sauberer, RLS-unabhängiger Ansatz).
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { submissionId, imageData, imageName, imageType } = req.body || {};

  if (!imageData || !imageName) {
    return res.status(400).json({ error: 'imageData und imageName sind Pflicht.' });
  }

  try {
    // Convert base64 data URL to buffer
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    // Sanitize filename and create unique path
    const safeName   = imageName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathPrefix = submissionId || crypto.randomUUID();
    const path       = `${pathPrefix}/${Date.now()}_${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('inquiry-images')
      .upload(path, buffer, {
        contentType: imageType || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      return res.status(500).json({ error: 'Bild-Upload fehlgeschlagen: ' + uploadError.message });
    }

    // Get signed URL (valid for 5 years = 157_680_000 seconds)
    let imageUrl;
    const { data: urlData, error: signError } = await supabase.storage
      .from('inquiry-images')
      .createSignedUrl(path, 157680000);

    if (signError || !urlData?.signedUrl) {
      console.warn('Signed URL failed, falling back to public URL:', signError?.message);
      const { data: pubData } = supabase.storage
        .from('inquiry-images')
        .getPublicUrl(path);
      imageUrl = pubData?.publicUrl;
    } else {
      imageUrl = urlData.signedUrl;
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'Bild-URL konnte nicht generiert werden.' });
    }

    // Return the URL – the widget embeds it into the submission before the POST to /api/submissions.
    // No DB update needed here (avoids RLS issues entirely).
    return res.json({ success: true, url: imageUrl });

  } catch (err) {
    console.error('Upload exception:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
