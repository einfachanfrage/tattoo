'use strict';

const crypto = require('crypto');

const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'einfach2026';
const TOKEN_SECRET   = process.env.TOKEN_SECRET   || 'einfach-secret-2026';

// ── Admin token ───────────────────────────────────────────────────────────────
function makeAdminToken() {
  return crypto.createHmac('sha256', TOKEN_SECRET).update('admin:' + DASHBOARD_PASS).digest('hex');
}

// ── Photographer token  (format: "slug:hmac") ─────────────────────────────────
function makePhotographerToken(slug) {
  const hash = crypto.createHmac('sha256', TOKEN_SECRET).update('photographer:' + slug).digest('hex');
  return slug + ':' + hash;
}

// ── Verify ────────────────────────────────────────────────────────────────────
function safeEqual(a, b) {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch { return false; }
}

function requireAuth(req, res) {
  const auth  = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) {
    res.status(401).json({ error: 'Nicht autorisiert.' });
    return false;
  }

  // 1. Admin token?
  if (safeEqual(token, makeAdminToken())) {
    req.isAdmin = true;
    return true;
  }

  // 2. Photographer token?  "slug:hash"
  const colonIdx = token.indexOf(':');
  if (colonIdx > 0) {
    const slug         = token.slice(0, colonIdx);
    const hash         = token.slice(colonIdx + 1);
    const expectedHash = crypto.createHmac('sha256', TOKEN_SECRET)
      .update('photographer:' + slug).digest('hex');
    if (safeEqual(hash, expectedHash)) {
      req.photographerSlug = slug;
      return true;
    }
  }

  res.status(401).json({ error: 'Nicht autorisiert.' });
  return false;
}

// Keep old name for backwards compat
const makeToken = makeAdminToken;

module.exports = { makeToken, makeAdminToken, makePhotographerToken, requireAuth };
