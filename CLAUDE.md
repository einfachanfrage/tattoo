# CLAUDE.md – Einfach Anfrage

Dieses Dokument beschreibt die vollständige Architektur, alle relevanten Dateien und die Anpassungslogik des Projekts. Es dient als Kontext-Briefing für Claude – sowohl für laufende Arbeit an diesem Projekt als auch als Vorlage zum Kopieren in neue Branchen.

---

## Was ist dieses Projekt?

**Einfach Anfrage** ist ein SaaS-Produkt für Hochzeitsfotografen. Es besteht aus:

1. **Widget** – Ein Shadow-DOM-Widget, das Fotografen per `<script>`-Tag auf ihrer Website einbinden. Besucher (Brautpaare) füllen einen mehrstufigen Fragebogen aus. Das Widget läuft komplett im Browser des Kunden, benötigt keine eigene Seite des Fotografen.
2. **Dashboard** – Eine passwortgeschützte Single-Page-App unter `/dashboard`, in der Fotografen eingegangene Anfragen sehen und verwalten können.
3. **Landingpage** – Marketing-Website unter `/`, inkl. Widget-Vorschau (Mockup), Preise und Kontaktformular.
4. **API** – Serverless-Funktionen (Vercel), die Anfragen entgegennehmen, E-Mails versenden, Fotograf-Accounts verwalten.
5. **Standalone-Seite** – Für jeden Fotografen gibt es eine eigene URL `/p/[slug]`, die das Widget direkt öffnet (für Linktree o.ä.).

**Zielgruppe der Endnutzer:** Brautpaare, die beim Fotografen anfragen.  
**Zahlende Kunden:** Fotografen, die das Widget auf ihrer Website einbinden.

---

## Branche & Inhalt

> ⚠️ Dieser Abschnitt ist der erste, der bei einem Branchenwechsel angepasst wird.

| Variable | Wert (Hochzeitsfotografie) |
|---|---|
| **Branche** | Hochzeitsfotografie |
| **Produkt-Name** | Einfach Anfrage |
| **Domain** | einfachanfrage-hochzeitsfotografie.de |
| **Zielgruppe (Kunden)** | Hochzeitsfotografen |
| **Anfragesteller** | Brautpaare |
| **DB-Tabelle (Customers)** | `photographers` |
| **DB-Spalte (Slug)** | `slug` |
| **Preis** | 29 € / Monat |
| **E-Mail-Absender** | Einfach Anfrage `<anfrage@einfach-anfrage.com>` |
| **Dashboard-URL** | /dashboard |

---

## Technologie-Stack

| Schicht | Technologie |
|---|---|
| Hosting | Vercel (Serverless) |
| Datenbank | Supabase (PostgreSQL) |
| E-Mail | Resend |
| Fonts | Bunny Fonts (DSGVO-konform, Google Fonts-Ersatz) |
| Widget | Vanilla JS, Shadow DOM (kein Framework) |
| Frontend | Reines HTML/CSS/JS (kein Build-Step, kein Framework) |
| Auth | Simples Token-Auth über `TOKEN_SECRET` (kein Auth-Provider) |

---

## Dateistruktur

```
/
├── vercel.json              ← Routing (Rewrites + Redirects + Crons)
├── package.json             ← Vercel-Abhängigkeiten (resend, @supabase/supabase-js)
├── .env                     ← Lokale Env-Variablen (nicht im Repo)
├── .env.example             ← Vorlage für benötigte Env-Variablen
│
├── landing/
│   ├── index.html           ← Landingpage (Marketing + Widget-Mockup)
│   ├── demo.html            ← Demo-Seite (Widget live ausprobieren)
│   ├── impressum.html       ← Impressum
│   └── datenschutz.html     ← Datenschutzerklärung
│
├── dashboard/
│   └── index.html           ← Dashboard-SPA (Anfragen verwalten)
│
├── widget/
│   └── widget.js            ← Das Widget (Shadow DOM, alle Themes)
│
└── api/
    ├── _supabase.js         ← Supabase-Client (Singleton)
    ├── _auth.js             ← Auth-Middleware (prüft TOKEN_SECRET)
    ├── _email.js            ← E-Mail-Templates + Versand (Resend)
    ├── auth.js              ← POST /api/auth → gibt JWT zurück
    ├── contact.js           ← POST /api/contact → Kontaktformular Landingpage
    ├── upload.js            ← POST /api/upload → Bild-Upload (Supabase Storage)
    ├── demo.js              ← POST /api/demo → Demo-Einreichungen
    ├── demo-submissions.js  ← GET /api/demo-submissions
    ├── photographers/
    │   ├── index.js         ← POST /api/photographers → Neuen Fotografen anlegen
    │   └── [slug].js        ← GET/PATCH/DELETE /api/photographers/[slug]
    ├── submissions/
    │   ├── index.js         ← POST /api/submissions → Neue Anfrage speichern + E-Mails
    │   ├── [id].js          ← GET /api/submissions/[id]
    │   └── [id]/status.js   ← PATCH /api/submissions/[id]/status
    ├── p/
    │   └── [slug].js        ← GET /p/[slug] → Standalone-Seite für Fotografen
    ├── og.jsx               ← GET /api/og → OG-Image Landingpage
    ├── og/p/[name].jsx      ← GET /api/og/p/[name] → OG-Image pro Fotograf
    └── cron/
        └── cleanup.js       ← Wöchentlicher Cleanup (alte Demo-Daten)
```

---

## Routing (vercel.json)

```json
Rewrites:
  /p/:slug        → /api/p/[slug]
  /api/og/p/:name → /api/og/p/[name]
  /widget.js      → /widget/widget.js
  /demo           → /landing/demo.html
  /dashboard      → /dashboard/index.html
  /impressum      → /landing/impressum.html
  /datenschutz    → /landing/datenschutz.html
  /               → /landing/index.html

⚠️ WICHTIG: Niemals eine index.html ins Root-Verzeichnis legen (weder per Git noch per GitHub-Upload).
   Vercel serviert Root-Dateien DIREKT und umgeht dadurch den "/" → "/landing/index.html" Rewrite.
```

---

## Supabase-Datenmodell

### Tabelle: `photographers`
| Spalte | Typ | Beschreibung |
|---|---|---|
| `slug` | text (PK) | URL-Kennung z.B. `julia-meier` |
| `name` | text | Anzeigename |
| `email` | text | E-Mail für Anfrage-Benachrichtigungen |
| `theme` | text | Widget-Theme (`champagne`/`nacht`/`sage`/`clean`/`modern`) |
| `delivery` | text | E-Mail-Auslieferung: `email`/`dashboard`/`both` |

### Tabelle: `submissions`
Enthält alle Anfragen. Wird von `api/submissions/index.js` geschrieben.

Das Submissions-Objekt hat folgende Struktur:
```js
{
  contact:  { partner1, partner2, email, phone, howFound },
  wedding:  { date, dateUnclear, duration, ceremonyTime },
  location: { city, state, types[], indoorOutdoor, multipleLocations, address },
  style:    { styles[], guestCount, styleNotes, inspirationImageCount },
  services: { mediaType, gettingReady, secondPhotographer, album },
  budget:   { range, notes }
}
```

---

## Widget-System (widget/widget.js)

Das Widget läuft in einem **Shadow DOM** – vollständig gekapselt vom Rest der Website.

### Initialisierung
```html
<script src="/widget.js"
  data-email="fotograf@example.com"
  data-name="Julia Meier"
  data-slug="julia-meier"
  data-theme="champagne"
  data-delivery="both"
  data-api="">
</script>
```

### Theme-System
Es gibt 5 Themes. Das CSS ist in zwei Schichten aufgebaut:

1. **`SHADOW_CSS`** (Basis, ~lines 41–402): Alles was alle Themes teilen. Aktuell: Pill-Buttons (`border-radius: 100px`), weiche Felder (`border-radius: 14px`, `1px border`), großzügige Abstände.

2. **Theme-Override-Konstanten** (ab line ~408): Jeder Theme überschreibt mit `!important` bestimmte Klassen.

| Interne ID | Display-Name | Beschreibung |
|---|---|---|
| `champagne` | Champagne | Basis-Theme, warmes Elfenbein, Gold |
| `nacht` | Rosé | Zartes Blush/Rosa, Cormorant Garamond italic |
| `sage` | Luna | Tief-Schwarz/Nacht, Pearl-Weiß, cineastisch |
| `clean` | Papier | Warmes Ivory, Editorial, Bodoni Moda |
| `modern` | Modern | Beige-Editorial, Uppercase, minimalistisch |

### Widget-Schritte (Hochzeitsfotografie)
Das Widget hat folgende Schritte:
1. **Willkommen** – Intro-Screen, Feature-Liste
2. **Kontakt** – Partner1, Partner2, E-Mail, Telefon, Wie gefunden
3. **Hochzeit** – Datum (oder "noch unklar"), Dauer, Uhrzeit Trauung
4. **Location** – Stadt, Bundesland, Location-Typen, Innen/Außen, Mehrere Locations, Adresse
5. **Stil** – Foto-Stile (Checkboxen), Gästeanzahl, Stil in eigenen Worten, Inspirationsbilder (Upload)
6. **Leistungen** – Media-Typ (Foto/Video/Beides), Getting Ready, 2. Fotograf, Album
7. **Budget** – Budget-Range (Radio), besondere Wünsche
8. **Danke** – Bestätigung mit Zusammenfassung

---

## Landingpage (landing/index.html)

### Wichtige Sektionen
- **Nav** – Logo + CTA-Button
- **Hero** – Headline + Widget-Vorschau (Mockup)
- **Wie es funktioniert** – 3-Step-Erklärung
- **Features / Benefits** – Was bringt es dem Fotografen
- **Pricing** – 29 €/Monat
- **Kontaktformular** – Name, E-Mail, Website (optional), Instagram-Bio (optional), Anfragen/Monat, Nachricht

### Mockup-System
Die Widget-Vorschau auf der Landingpage ist **kein echtes Widget**, sondern CSS-Mockup. Tabs wechseln zwischen Designs.

- **Tab-Reihenfolge:** Champagne | Luna | Papier | Rosé | Modern
- **Interne CSS-Klassen:** `.dk-nacht` (Rosé), `.dk-sage` (Luna), `.dk-clean` (Papier), `.dk-modern` (Modern)
- **Basis-Mockup-Klassen:** `.mk-bar`, `.mk-head`, `.mk-body`, `.mk-field`, `.mk-check`, `.mk-pill`, `.mk-tile`, `.mk-nav`, `.mk-btn`, usw.
- `switchDesign(name)` JS-Funktion toggled die `.dk-*` Klasse auf dem Mockup-Container

---

## E-Mail-System (api/_email.js)

Zwei E-Mails pro Einreichung:
1. **An Fotografen** – Vollständige Briefing-E-Mail mit allen Daten
2. **An Brautpaar** – Bestätigungs-E-Mail mit Zusammenfassung

Absender: `Einfach Anfrage <anfrage@einfach-anfrage.com>`  
Provider: Resend (`RESEND_API_KEY`)

---

## Umgebungsvariablen

```env
# Vercel Environment Variables (Production)
RESEND_API_KEY=          ← Resend API Key für E-Mails
TOKEN_SECRET=            ← Geheimer String für Dashboard-Auth (min. 32 Zeichen)
DASHBOARD_PASS=          ← Passwort für Dashboard-Login
SUPABASE_URL=            ← Supabase Projekt-URL
SUPABASE_ANON_KEY=       ← Supabase Anon-Key
CRON_SECRET=             ← Secret für Cron-Job-Auth
CONTACT_EMAIL=           ← Empfänger für Kontaktformular-Anfragen
DASHBOARD_URL=           ← Volle URL des Dashboards (für E-Mail-Links)
```

---

## Einen neuen Kunden anlegen

Im Dashboard gibt es eine "Neu anlegen"-Funktion. Alternativ direkt per API:

```bash
POST /api/photographers
Authorization: Bearer [TOKEN_SECRET]
{
  "slug": "julia-meier",
  "name": "Julia Meier Fotografie",
  "email": "julia@example.com",
  "theme": "champagne",
  "delivery": "both"
}
```

Die Widget-URL des Kunden lautet dann: `https://[domain]/p/julia-meier`

---

## Deployment

- **Platform:** Vercel
- **Repo:** GitHub → Auto-Deploy bei Push auf `main`
- **Cron:** Wöchentlich Sonntags 3 Uhr → `/api/cron/cleanup`

---

---

# Anleitung: Für eine neue Branche kopieren

> Diese Sektion erklärt, was in einem geklonten Projekt geändert werden muss.

## Schritt 1: Repository kopieren
Komplettes Verzeichnis kopieren, `.git` löschen, neues Repo anlegen.

## Schritt 2: Branchen-spezifische Texte ändern

### Überall suchen & ersetzen:
| Suche | Ersetze mit |
|---|---|
| `Hochzeitsfotograf` / `Hochzeitsfotografen` | z.B. `Tätowierer` / `Tätowierern` |
| `Brautpaar` / `Brautpaare` | z.B. `Kunde` / `Kunden` |
| `Hochzeitsanfrage` | z.B. `Tattoo-Anfrage` |
| `einfach-anfrage.com` | neue Domain |
| `einfachanfrage-hochzeitsfotografie.de` | neue Domain |
| `Einfach Anfrage` | neuer Produkt-Name |
| `photographers` (DB-Tabelle) | neuer Tabellenname (oder gleich lassen) |

### Dateien mit starkem Branchen-Bezug:
- `api/_email.js` – E-Mail-Templates vollständig umschreiben (andere Datenfelder)
- `api/p/[slug].js` – Standalone-Seite (Text "Stell deine Hochzeitsanfrage...")
- `landing/index.html` – Gesamte Landing-Texte, Pricing, Benefits
- `landing/impressum.html` + `datenschutz.html` – Rechtliche Angaben anpassen
- `widget/widget.js` – Widget-Schritte komplett neu konzipieren (andere Fragen)

## Schritt 3: Widget-Schritte neu bauen (widget/widget.js)

Die Fragen im Widget sind **vollständig branchen-spezifisch**. Für Tätowierer z.B.:

- Kontakt (Name, E-Mail, Instagram/Referenz)
- Motiv (Was soll gestochen werden? Größe? Körperstelle?)
- Stil (Realistisch, Tribal, Watercolor, Fine Line, etc.)
- Referenzbilder (Upload)
- Termin (Wunsch-Zeitraum)
- Budget

Das Submissions-Objekt in `api/submissions/index.js` muss entsprechend angepasst werden.

## Schritt 4: Supabase

Neues Supabase-Projekt anlegen (oder dasselbe mit anderen Tabellen). Tabellen-Schema ggf. anpassen falls sich die Submission-Struktur ändert.

## Schritt 5: Neue Umgebungsvariablen in Vercel setzen

Neue E-Mail-Absender-Adresse, neue Domain, neues `TOKEN_SECRET`, neues `DASHBOARD_PASS`.

## Schritt 6: E-Mail-Domain in Resend verifizieren

Neue Absender-Domain in Resend hinzufügen und DNS-Einträge setzen.
