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

    // Get signed URL (valid for 5 years – works with private buckets)
    // 5 years in seconds: 5 * 365 * 24 * 60 * 60 = 157680000
    let imageUrl;
    const { data: urlData, error: signError } = await supabase.storage
      .from('inquiry-images')
      .createSignedUrl(path, 157680000);

    if (signError || !urlData?.signedUrl) {
      console.warn('Signed URL failed, falling back to public URL:', signError?.message);
      // Fallback: use public URL (bucket must be set to public in Supabase)
      const { data: pubData } = supabase.storage
        .from('inquiry-images')
        .getPublicUrl(path);
      imageUrl = pubData?.publicUrl;
    } else {
      imageUrl = urlData.signedUrl;
    }

    const publicUrl = imageUrl;

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
