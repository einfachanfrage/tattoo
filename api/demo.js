'use strict';

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  console.log('Demo-Submission eingegangen (kein Versand)');
  res.json({ success: true });
};
