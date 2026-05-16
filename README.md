# Einfach Anfrage

Das elegante Anfrage-Widget für Hochzeitsfotografen.

---

## Projektstruktur

```
einfach-anfrage/
├── server/
│   ├── index.js          # Express-Server (API + Static Serving)
│   ├── pdf-generator.js  # Puppeteer-PDF-Generierung
│   ├── email-sender.js   # Nodemailer (Ethereal für Dev, SMTP für Prod)
│   ├── demo-data.js      # 4 vorgeladene Demo-Anfragen
│   └── package.json
├── widget/
│   └── widget.js         # Self-contained Widget (Shadow DOM)
├── dashboard/
│   └── index.html        # Anfragen-Dashboard (Vanilla JS SPA)
├── landing/
│   └── index.html        # Produkt-Landing-Page
├── .env.example          # Umgebungsvariablen-Vorlage
└── README.md
```

---

## Schnellstart

### 1. Abhängigkeiten installieren

```bash
cd server
npm install
```

> Puppeteer lädt beim ersten `npm install` automatisch eine Chrome-Instanz herunter (~300 MB).

### 2. Umgebungsvariablen einrichten

```bash
cp .env.example .env
```

Ohne Konfiguration läuft der Server im **Demo-Modus** mit Ethereal-SMTP
(Test-E-Mails, kein echtes Konto nötig – Links erscheinen in der Konsole).

### 3. Server starten

```bash
# Entwicklung (mit Auto-Restart)
npm run dev

# Produktion
npm start
```

Der Server läuft auf `http://localhost:3000`.

| URL | Beschreibung |
|-----|-------------|
| `http://localhost:3000/` | Landing Page |
| `http://localhost:3000/dashboard` | Anfragen-Dashboard |
| `http://localhost:3000/widget.js` | Widget-Script |
| `http://localhost:3000/api/submissions` | REST-API |

---

## Widget einbinden

```html
<!-- Auf der eigenen Website des Fotografen -->
<script
  src="https://einfachanfrage.de/widget.js"
  data-email="du@beispiel.de"
  data-name="Deine Fotografie"
  data-webhook="https://optional-webhook.com/endpoint"
></script>

<button data-einfachanfrage="hochzeit">Anfrage stellen</button>
```

### Script-Tag-Attribute

| Attribut | Pflicht | Beschreibung |
|----------|---------|-------------|
| `data-email` | Empfohlen | E-Mail des Fotografen – hierhin kommt das Briefing |
| `data-name` | Optional | Name des Fotografen (erscheint in der Danke-Nachricht) |
| `data-webhook` | Optional | Zusätzliche Webhook-URL (POST, JSON) |
| `data-api` | Optional | Eigene API-URL (Standard: Herkunft des Scripts + `/api/submissions`) |

### JavaScript API

```javascript
// Widget programmatisch öffnen/schließen
window.einfachAnfrage.open();
window.einfachAnfrage.close();
```

---

## REST API

### `GET /api/submissions`

Alle Anfragen abrufen. Optional nach Status filtern:

```
GET /api/submissions?status=neu
GET /api/submissions?status=in_bearbeitung
GET /api/submissions?status=angebot_gesendet
```

### `GET /api/submissions/:id`

Eine Anfrage abrufen.

### `POST /api/submissions`

Neue Anfrage anlegen. Body (JSON):

```json
{
  "photographerEmail": "fotograf@example.com",
  "photographerName": "Meine Fotografie",
  "wedding": {
    "date": "2024-09-14",
    "dateUnclear": false,
    "ceremonyTime": "14:00",
    "duration": "Ganztag (~10h+)"
  },
  "location": {
    "state": "Bayern",
    "city": "München",
    "types": ["Kirche", "Hotel"],
    "multipleLocations": "Ja"
  },
  "wishes": {
    "guestCount": "100–150",
    "style": ["Romantisch & inszeniert"],
    "videographer": "Noch unklar",
    "secondPhotographer": "Ja"
  },
  "budget": {
    "range": "2.500–4.000 €",
    "notes": "Optionaler Freitext"
  },
  "contact": {
    "partner1": "Sophie",
    "partner2": "Thomas",
    "email": "sophie@example.com",
    "phone": "+49 176 1234 5678",
    "howFound": "Instagram"
  }
}
```

**Response:** `{ "success": true, "id": "abc123" }`

### `PATCH /api/submissions/:id/status`

Status einer Anfrage ändern:

```json
{ "status": "in_bearbeitung" }
```

Gültige Werte: `neu`, `in_bearbeitung`, `angebot_gesendet`

### `DELETE /api/submissions/:id`

Anfrage löschen (Demo-Zweck).

---

## E-Mail & PDF Konfiguration

### Entwicklung (Ethereal – kein Setup nötig)

Ohne SMTP-Umgebungsvariablen erstellt der Server automatisch einen
Ethereal-Test-Account. Nach dem Absenden einer Anfrage erscheint in der
Konsole ein Link zur E-Mail-Vorschau:

```
📬 Fotograf-E-Mail (Ethereal-Vorschau):
   https://ethereal.email/message/ABC123...
```

### Produktion (eigener SMTP)

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user@example.com
SMTP_PASS=geheimespasswort
SMTP_FROM=Einfach Anfrage <noreply@einfachanfrage.de>
```

Kompatibel mit: Gmail, Mailgun, Postmark, Brevo, Strato, IONOS u. v. m.

### Puppeteer (PDF-Generierung)

Puppeteer läuft standardmäßig ohne Headless-Chrome-Probleme auf den meisten
Servern. Falls Probleme auftreten (z. B. fehlende Systemabhängigkeiten):

```bash
# Ubuntu/Debian
sudo apt-get install -y libgbm-dev libxss1 libnss3 libasound2

# Docker
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

Wenn Puppeteer nicht verfügbar ist, wird der PDF-Schritt übersprungen und
die E-Mail ohne Anhang gesendet.

---

## Design System

Das Widget und alle Seiten nutzen dasselbe Design-System:

| Token | Wert | Verwendung |
|-------|------|-----------|
| Champagner | `#C9A96E` | Primary Accent, Buttons Hover, Progress |
| Ivory | `#FAF7F2` | Hintergründe |
| Dark | `#1A1A1A` | Text, Primary Button |
| Dusty Rose | `#C4917A` | Sekundärer Accent, Fehler, sparsam |
| Grey Border | `#E2DDD6` | Rahmen, Trennlinien |
| Grey Mid | `#8A8580` | Labels, Platzhalter |

**Schriften:** Cormorant Garamond (Headlines) + Inter (Fließtext) via Google Fonts

---

## CSS-Isolation des Widgets

Das Widget verwendet **Shadow DOM** – alle Styles sind vollständig von der
Host-Website isoliert. Es gibt keine CSS-Konflikte, egal was auf der
einbindenden Seite an Styles gesetzt ist.

---

## Deployment

### Node.js (z. B. Hetzner, DigitalOcean, Railway)

```bash
cd server
npm install --production
NODE_ENV=production node index.js
```

### Mit PM2

```bash
npm install -g pm2
cd server
pm2 start index.js --name einfach-anfrage
pm2 save
```

### Docker (Beispiel)

```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y \
    chromium libgbm-dev libxss1 libnss3 libasound2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN cd server && npm install --production

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
EXPOSE 3000
CMD ["node", "server/index.js"]
```

---

## Hinweise

- Alle Daten liegen **im Arbeitsspeicher** (kein persistenter Datenspeicher).
  Für Produktion empfehlen wir PostgreSQL oder MongoDB.
- Das Widget sendet `photographerEmail` aus dem `data-email`-Attribut mit –
  stelle sicher, dass dies korrekt gesetzt ist.
- Die Demo-Daten werden beim Server-Start automatisch geladen.
