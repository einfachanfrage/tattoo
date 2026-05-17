'use strict';

const supabase = require('./_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { submissionId, imageData, imageName, imageType } = req.body || {};

  if (!submissionId || !imageData || !imageName) {
    return res.status(400).json({ error: 'submissionId, imageData und imageName sind Pflicht.' });
  }

  try {
    // Convert base64 data URL to buffer
    const base64 = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');

    // Sanitize filename and create unique path
    const ext      = (imageName.match(/\.\w+$/) || ['.jpg'])[0].toLowerCase();
    const safeName = imageName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path     = `${submissionId}/${Date.now()}_${safeName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('inquiry-images')
      .upload(path, buffer, {
        contentType: imageType || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      return res.status(500).json({ error: uploadError.message });
    }

    // Get signed URL (valid for 5 years – private bucket access only)
    // 5 years in seconds: 5 * 365 * 24 * 60 * 60 = 157680000
    const { data: urlData, error: signError } = await supabase.storage
      .from('inquiry-images')
      .createSignedUrl(path, 157680000);

    if (signError) {
      console.error('Signed URL error:', signError.message);
      return res.status(500).json({ error: signError.message });
    }

    const publicUrl = urlData?.signedUrl;

    // Append image URL to the submission in the DB
    const { data: existing } = await supabase
      .from('inquiries').select('data').eq('id', submissionId).single();

    if (existing) {
      const images = existing.data?.style?.inspirationImages || [];
      images.push({ name: imageName, url: publicUrl });
      const updatedData = {
        ...existing.data,
        style: { ...existing.data.style, inspirationImages: images },
      };
      await supabase.from('inquiries').update({ data: updatedData }).eq('id', submissionId);
    }

    return res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('Upload exception:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
