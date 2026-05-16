'use strict';

const crypto = require('crypto');

const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'einfach2026';
const TOKEN_SECRET   = process.env.TOKEN_SECRET   || 'einfach-secret-2026';

function makeToken() {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(DASHBOARD_PASS).digest('hex');
}

function verifyToken(token) {
  if (!token) return false;
  try {
    const expected = Buffer.from(makeToken());
    const actual   = Buffer.from(token);
    if (expected.length !== actual.length) return false;
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function requireAuth(req, res) {
  const auth  = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!verifyToken(token)) {
    res.status(401).json({ error: 'Nicht autorisiert.' });
    return false;
  }
  return true;
}

module.exports = { makeToken, requireAuth };
