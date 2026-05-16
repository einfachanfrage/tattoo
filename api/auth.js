'use strict';

const { makeToken } = require('./_auth');

const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'einfach2026';

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  if (password !== DASHBOARD_PASS) {
    return res.status(401).json({ error: 'Falsches Passwort.' });
  }

  res.json({ token: makeToken() });
};
