# CLAUDE.md – Einfach Anfrage

Dieses Dokument beschreibt die vollständige Architektur, alle relevanten Dateien und die Anpassungslogik des Projekts. Es dient als Kontext-Briefing für Claude – sowohl für laufende Arbeit an diesem Projekt als auch als Vorlage zum Kopieren in neue Branchen.

---

## Was ist dieses Projekt?

**Einfach Anfrage** ist ein SaaS-Produkt für Tätowierer. Es besteht aus:

1. **Widget** – Ein Shadow-DOM-Widget, das Tätowierer per `<script>`-Tag auf ihrer Website einbinden. Besucher (Kunden) füllen einen mehrstufigen Fragebogen aus. Das Widget läuft komplett im Browser des Kunden, benötigt keine eigene Seite des Tätowierers.
2. **Dashboard** – Eine passwortgeschützte Single-Page-App unter `/dashboard`, in der Tätowierer eingegangene Anfragen sehen und verwalten können.
3. **Landingpage** – Marketing-Website unter `/`, inkl. Widget-Vorschau (Mockup), Preise und Kontaktformular.
4. **API** – Serverless-Funktionen (Vercel), die Anfragen entgegennehmen, E-Mails versenden, Tätowierer-Accounts verwalten.
5. **Standalone-Seite** – Für jeden Tätowierer gibt es eine eigene URL `/p/[slug]`, die das Widget direkt öffnet (für Instagram-Bio o.ä.).

**Zielgruppe der Endnutzer:** Kunden, die beim Tätowierer eine Anfrage stellen.  
**Zahlende Kunden:** Tätowierer, die das Widget auf ihrer Website oder in der Instagram-Bio einbinden.

---

## Branche & Inhalt

| Variable | Wert (Tattoo) |
|---|---|
| **Branche** | Tattoo / Tätowierer |
| **Produkt-Name** | Einfach Anfrage |
| **Domain** | einfachanfrage-tattoo.de |
| **Zielgruppe (Kunden)** | Tätowierer |
| **Anfragesteller** | Tattoo-Kunden |
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
| `slug` | text (PK) | URL-Kennung z.B. `ink-by-nova` |
| `name` | text | Anzeigename |
| `email` | text | E-Mail für Anfrage-Benachrichtigungen |
| `theme` | text | Widget-Theme (`champagne`/`nacht`/`sage`/`clean`/`modern`) |
| `delivery` | text | E-Mail-Auslieferung: `email`/`dashboard`/`both` |

### Tabelle: `submissions`
Enthält alle Anfragen. Wird von `api/submissions/index.js` geschrieben.

Das Submissions-Objekt hat folgende Struktur:
```js
{
  motif:       { description, placement, size, isCoverUp, coverUpNotes },
  style:       { styles[], colorPreference, styleNotes, inspirationImages[], inspirationImageCount },
  health:      { isFirstTattoo, knownAllergies, allergiesDetail },
  appointment: { timeframe, preferredTime },
  budget:      { range, notes },
  contact:     { name, email, phone, instagram, howFound, consentGiven, consentGivenAt }
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
| `champagne` | Studio | Basis-Theme, warm Off-White, Plus Jakarta Sans, minimal |
| `nacht` | Bloom | Dusty Rose/Blush, Cormorant italic, Fine-Line-Ästhetik |
| `sage` | Noir | Tief-Schwarz, Pearl-Weiß, cineastisch, Blackwork-Feeling |
| `clean` | Atelier | Warmes Ivory, Editorial, Bodoni Moda, hochwertig |
| `modern` | Script | Beige-Editorial, Uppercase, stark & grafisch |

### Widget-Schritte (Tattoo)
Das Widget hat folgende Schritte (7 intern = Welcome + 5 Inhalts-Schritte + Danke).
Dem Nutzer wird „Schritt X von 5" angezeigt.

1. **Willkommen** – Intro-Screen, Feature-Liste (kein Zähler)
2. **Dein Motiv** (Schritt 1/5) – Motiv-Beschreibung (Pflichtfeld), Körperstelle, Größe, Cover-Up, bedingt: Cover-Up-Details
3. **Stil & Referenzen** (Schritt 2/5) – 12 Stil-Checkboxen, Farbe/SW-Präferenz, Referenzbilder-Upload (max. 3)
4. **Termin & Budget** (Schritt 3/5) – Wunsch-Zeitraum, bevorzugte Tageszeit, Budget-Range
5. **Deine Haut** (Schritt 4/5) – Erstes Tattoo (Ja/Nein), Allergien, bedingt: Allergie-Details
6. **Kontakt** (Schritt 5/5) – Name, E-Mail (Pflichtfeld), Telefon, Instagram, Wie gefunden, Datenschutz (Pflichtfeld)
7. **Danke** – Bestätigung mit Zusammenfassung (kein Zähler)

---

## Landingpage (landing/index.html)

### Wichtige Sektionen
- **Nav** – Logo + CTA-Button
- **Hero** – Headline + Widget-Vorschau (Mockup)
- **Wie es funktioniert** – 3-Step-Erklärung
- **Features / Benefits** – Was bringt es dem Tätowierer
- **Pricing** – 29 €/Monat
- **Kontaktformular** – Name, E-Mail, Website (optional), Instagram-Bio (optional), Anfragen/Monat, Nachricht

### Mockup-System
Die Widget-Vorschau auf der Landingpage ist **kein echtes Widget**, sondern CSS-Mockup. Tabs wechseln zwischen Designs.

- **Tab-Reihenfolge:** Studio | Bloom | Noir | Atelier | Script
- **Interne CSS-Klassen:** `.dk-nacht` (Bloom), `.dk-sage` (Noir), `.dk-clean` (Atelier), `.dk-modern` (Script)
- **Basis-Mockup-Klassen:** `.mk-bar`, `.mk-head`, `.mk-body`, `.mk-field`, `.mk-check`, `.mk-pill`, `.mk-tile`, `.mk-nav`, `.mk-btn`, usw.
- `switchDesign(name)` JS-Funktion toggled die `.dk-*` Klasse auf dem Mockup-Container

---

## E-Mail-System (api/_email.js)

Zwei E-Mails pro Einreichung:
1. **An Tätowierer** (`buildArtistHtml`) – Vollständiges Briefing mit Motiv, Stil, Gesundheit, Termin, Budget, Kontakt
2. **An Kunden** (`buildClientHtml`) – Bestätigungs-E-Mail mit Zusammenfassung (singular "du/dir")

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
  "slug": "ink-by-nova",
  "name": "Ink by Nova",
  "email": "nova@example.com",
  "theme": "champagne",
  "delivery": "both"
}
```

Die Widget-URL des Kunden lautet dann: `https://[domain]/p/ink-by-nova`

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
