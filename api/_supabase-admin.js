'use strict';

/**
 * Admin-Supabase-Client – verwendet den Service-Role-Key, der RLS umgeht.
 * Nur für serverseitige Operationen verwenden, bei denen der Nutzer KEINEN
 * direkten Zugriff hat (z. B. Bild-Upload, interne Daten-Updates).
 *
 * Umgebungsvariable: SUPABASE_SERVICE_KEY
 * Falls nicht gesetzt, wird SUPABASE_ANON_KEY als Fallback benutzt.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

module.exports = supabaseAdmin;
