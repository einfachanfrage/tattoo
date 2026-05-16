'use strict';

// Hardcoded demo data – no auth required, no DB needed
const demoData = require('../server/demo-data');

module.exports = (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  res.json(demoData);
};
