/*!
 * Einfach Anfrage Widget v2.0.0
 * Das elegante Anfrage-Widget für Tätowierer
 * https://einfachanfrage.de
 */
(function (w, d) {
  'use strict';

  if (w.__einfachAnfrage) return;
  w.__einfachAnfrage = true;

  const currentScript =
    d.currentScript ||
    (function () {
      const s = d.getElementsByTagName('script');
      return s[s.length - 1];
    })();

  const scriptOrigin = currentScript.src
    ? new URL(currentScript.src).origin
    : w.location.origin;

  const CONFIG = {
    photographerEmail: currentScript.getAttribute('data-email') || '',
    photographerName:
      currentScript.getAttribute('data-name') || 'Dein/e Tätowierer/in',
    photographerSlug: currentScript.getAttribute('data-slug') || '',
    privacyUrl: currentScript.getAttribute('data-privacy') || 'https://einfachanfrage-tattoo.de/datenschutz',
    webhookUrl: currentScript.getAttribute('data-webhook') || '',
    apiUrl:
      currentScript.getAttribute('data-api') ||
      scriptOrigin + '/api/submissions',
    theme: currentScript.getAttribute('data-theme') || 'champagne',
    // 'email' = nur E-Mail | 'dashboard' = nur Dashboard | 'both' = beides (Standard)
    delivery: currentScript.getAttribute('data-delivery') || 'both',
    // 'de' = fest Deutsch | 'en' = fest Englisch | 'auto' = Nutzer wählt selbst
    language: currentScript.getAttribute('data-language') || 'de',
    // Pflichtfelder im Kontaktschritt, kommasepariert z. B. 'email,phone'
    requiredContact: (function () {
      var raw = currentScript.getAttribute('data-required-contact') || 'email';
      return raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    })(),
  };

  // ──────────────────────────────────────────────────────────────────────────
  // TRANSLATIONS  (DE / EN)
  // ──────────────────────────────────────────────────────────────────────────
  const TRANSLATIONS = {
    de: {
      close: 'Schließen',
      'btn.start': 'Jetzt starten →', 'btn.next': 'Weiter →', 'btn.back': '← Zurück',
      'btn.submit': 'Abschicken ✓', 'btn.sending': 'Wird gesendet …', 'btn.retry': 'Erneut versuchen →',
      counter: 'Schritt {n} von 5',
      'w.title': 'Tattoo-Anfrage stellen',
      'w.sub': 'Damit {name} dir ein passendes Angebot machen kann – ein paar kurze Fragen, dauert nur <strong>3 Minuten</strong>.',
      'w.li1': 'Fast alles kann auch mit „Noch unklar" beantwortet werden',
      'w.li2': 'Kein Account, keine Werbung',
      'w.li3': 'Deine Daten gehen nur an {name}',
      's2.title': 'Dein Motiv', 's2.sub': 'Was soll gestochen werden – und wo?',
      's2.desc.lbl': 'Was stellst du dir vor?', 's2.desc.ph': '„Fine-Line Rosen, eher zart und filigran"',
      's2.desc.err': 'Bitte kurz beschreiben, was du dir vorstellst.',
      's2.place.lbl': 'Körperstelle', 's2.size.lbl': 'Ungefähre Größe',
      's2.cu.lbl': 'Cover-Up?', 's2.cu.notes.lbl': 'Das bestehende Tattoo', 's2.cu.notes.opt': '(optional)',
      's2.cu.notes.ph': 'Farbe, Größe und Stil des alten Tattoos.',
      'ph': '– bitte wählen –',
      'place.forearm': 'Unterarm', 'place.upperarm': 'Oberarm', 'place.shoulder': 'Schulter / Schulterblatt',
      'place.chest': 'Brust / Sternum', 'place.back': 'Rücken', 'place.ribs': 'Rippen / Seite',
      'place.belly': 'Bauch', 'place.hip': 'Hüfte / Hüftknochen', 'place.thigh': 'Oberschenkel',
      'place.shin': 'Unterschenkel / Schienbein', 'place.ankle': 'Knöchel / Fuß',
      'place.hand': 'Hand / Finger', 'place.neck': 'Hals / Nacken', 'place.head': 'Kopf',
      'place.unclear': 'Noch unklar',
      'size.s': 'Klein (bis 5 cm)', 'size.m': 'Mittel (5–10 cm)', 'size.l': 'Groß (10–20 cm)',
      'size.xl': 'Sehr groß / Sleeve (über 20 cm)', 'size.unclear': 'Noch unklar',
      'cu.no': 'Nein', 'cu.yes': 'Ja, Cover-Up', 'cu.unclear': 'Noch unklar',
      's3.title': 'Stil & Referenzen', 's3.sub': 'Welchen Stil suchst du? Mehrfachauswahl möglich.',
      's3.style.lbl': 'Tattoo-Stil', 's3.style.unclear': 'Noch unklar',
      's3.color.lbl': 'Farbe oder Schwarz-Grau?',
      's3.notes.lbl': 'Stil-Notizen', 's3.notes.opt': '(optional)', 's3.notes.ph': 'z. B. „eher minimalistisch, keine dicken Linien, soll zeitlos wirken" …',
      's3.upload.lbl': 'Referenzbilder', 's3.upload.opt': '(optional · max. 3 Fotos)',
      's3.upload.cta': 'Klicken zum Hochladen', 's3.upload.drag': 'oder Bilder hierher ziehen',
      's3.upload.sub': 'Screenshots, Pinterest-Pins, Fotos von Tattoos, die dir gefallen',
      's3.upload.hint': 'JPG, PNG oder WEBP · max. 2 MB pro Bild · max. 3 Bilder',
      'col.bw': 'Schwarz-Grau', 'col.color': 'Farbe', 'col.both': 'Beides möglich', 'col.unclear': 'Noch unklar',
      's4.title': 'Termin & Budget', 's4.sub': 'Ungefähr reicht – kein verbindlicher Termin.',
      's4.time.lbl': 'Wunsch-Zeitraum', 's4.pref.lbl': 'Bevorzugte Tageszeit', 's4.budget.lbl': 'Dein Budgetrahmen',
      's4.notes.lbl': 'Besondere Wünsche oder Fragen', 's4.notes.opt': '(optional)', 's4.notes.ph': 'z. B. besonderer Anlass, offene Fragen, Terminwünsche …',
      'tf.asap': 'So bald wie möglich', 'tf.1_3': 'In 1–3 Monaten', 'tf.3_6': 'In 3–6 Monaten',
      'tf.6_12': 'In 6–12 Monaten', 'tf.none': 'Kein fester Zeitdruck',
      'pt.morning': 'Vormittags', 'pt.afternoon': 'Nachmittags', 'pt.evening': 'Abends', 'pt.none': 'Keine Präferenz',
      'bud.unclear': 'Noch unklar', 'bud.private': 'Möchte ich nicht angeben',
      'bud.u150': 'unter 150 €', 'bud.150_300': '150–300 €', 'bud.300_500': '300–500 €',
      'bud.500_800': '500–800 €', 'bud.800_1500': '800–1.500 €', 'bud.o1500': 'über 1.500 €',
      's5.title': 'Deine Haut', 's5.sub': 'Hilft beim Vorbereiten der Session – alles freiwillig.',
      's5.first.lbl': 'Ist das dein erstes Tattoo?',
      's5.allergy.lbl': 'Bekannte Allergien oder Hautunverträglichkeiten?',
      's5.allergy.notes.lbl': 'Welche Allergien oder Unverträglichkeiten?', 's5.allergy.notes.opt': '(optional)',
      's5.allergy.notes.ph': 'z. B. Nickelallergie, empfindliche Haut, Neurodermitis …',
      'yn.yes': 'Ja', 'yn.no': 'Nein', 'yn.unsure': 'Nicht sicher',
      's6.title': 'Wie können wir<br>dich erreichen?',
      's6.sub': 'Nur die E-Mail ist Pflicht – alles andere ist freiwillig.',
      's6.name.lbl': 'Dein Name', 's6.name.ph': 'z. B. Mia Müller',
      's6.email.lbl': 'E-Mail-Adresse', 's6.email.ph': 'deine@email.de', 's6.email.opt': '(optional)', 's6.email.err2': 'Bitte eine gültige E-Mail eingeben oder das Pflichtfeld leer lassen.',
      's6.phone.err': 'Bitte eine Telefonnummer eingeben.',
      's6.ig.err': 'Bitte deinen Instagram-Handle eingeben.',
      's6.email.err': 'Bitte eine gültige E-Mail-Adresse eingeben.',
      's6.phone.lbl': 'Telefon', 's6.phone.opt': '(optional)', 's6.phone.ph': '+49 176 …',
      's6.ig.lbl': 'Instagram-Handle', 's6.ig.opt': '(optional)', 's6.ig.ph': 'deinname',
      's6.found.lbl': 'Wie hast du uns gefunden?',
      's6.privacy': 'Ich habe die {link} gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage durch {name} zu.',
      's6.privacy.link': 'Datenschutzerklärung',
      's6.privacy.err': 'Bitte die Datenschutzerklärung akzeptieren, um fortzufahren.',
      's6.submit.err': 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere uns direkt.',
      'found.recommendation': 'Empfehlung', 'found.other': 'Sonstiges',
      's7.title': 'Vielen Dank!',
      's7.sub': '{name} meldet sich innerhalb von <strong>48 Stunden</strong> bei dir.',
      's7.summary': 'Deine Zusammenfassung',
      'sum.motif': 'Motiv', 'sum.place': 'Körperstelle', 'sum.style': 'Stil',
      'sum.appt': 'Termin', 'sum.budget': 'Budget', 'sum.email': 'E-Mail',
      'upload.max3': 'Maximal 3 Bilder erlaubt.',
      'upload.imgonly': 'Nur Bildformate erlaubt (JPG, PNG, WEBP).',
      'upload.toobig': ' ist zu groß (max. 2 MB).',
    },
    en: {
      close: 'Close',
      'btn.start': 'Get started →', 'btn.next': 'Next →', 'btn.back': '← Back',
      'btn.submit': 'Submit ✓', 'btn.sending': 'Sending …', 'btn.retry': 'Try again →',
      counter: 'Step {n} of 5',
      'w.title': 'Request a Tattoo',
      'w.sub': 'So {name} can put together the right quote – a few quick questions, takes only <strong>3 minutes</strong>.',
      'w.li1': 'Almost anything can be answered with "Not sure yet"',
      'w.li2': 'No account needed, no ads',
      'w.li3': 'Your data goes only to {name}',
      's2.title': 'Your Idea', 's2.sub': 'What should be tattooed – and where?',
      's2.desc.lbl': 'What do you have in mind?', 's2.desc.ph': 'e.g. "Fine-line roses, rather delicate and filigree"',
      's2.desc.err': 'Please briefly describe what you have in mind.',
      's2.place.lbl': 'Body part', 's2.size.lbl': 'Approximate size',
      's2.cu.lbl': 'Cover-up?', 's2.cu.notes.lbl': 'The existing tattoo', 's2.cu.notes.opt': '(optional)',
      's2.cu.notes.ph': 'Color, size and style of the old tattoo.',
      'ph': '– please select –',
      'place.forearm': 'Forearm', 'place.upperarm': 'Upper arm', 'place.shoulder': 'Shoulder / shoulder blade',
      'place.chest': 'Chest / sternum', 'place.back': 'Back', 'place.ribs': 'Ribs / side',
      'place.belly': 'Belly', 'place.hip': 'Hip / hip bone', 'place.thigh': 'Thigh',
      'place.shin': 'Lower leg / shin', 'place.ankle': 'Ankle / foot',
      'place.hand': 'Hand / fingers', 'place.neck': 'Neck', 'place.head': 'Head',
      'place.unclear': 'Not sure yet',
      'size.s': 'Small (up to 5 cm)', 'size.m': 'Medium (5–10 cm)', 'size.l': 'Large (10–20 cm)',
      'size.xl': 'Very large / Sleeve (over 20 cm)', 'size.unclear': 'Not sure yet',
      'cu.no': 'No', 'cu.yes': 'Yes, cover-up', 'cu.unclear': 'Not sure yet',
      's3.title': 'Style & References', 's3.sub': 'Which style are you looking for? Multiple selection possible.',
      's3.style.lbl': 'Tattoo style', 's3.style.unclear': 'Not sure yet',
      's3.color.lbl': 'Color or black & grey?',
      's3.notes.lbl': 'Style notes', 's3.notes.opt': '(optional)', 's3.notes.ph': 'e.g. "minimalist, no thick lines, should feel timeless" …',
      's3.upload.lbl': 'Reference images', 's3.upload.opt': '(optional · max. 3 photos)',
      's3.upload.cta': 'Click to upload', 's3.upload.drag': 'or drag images here',
      's3.upload.sub': 'Screenshots, Pinterest pins, photos of tattoos you like',
      's3.upload.hint': 'JPG, PNG or WEBP · max. 2 MB per image · max. 3 images',
      'col.bw': 'Black & grey', 'col.color': 'Color', 'col.both': 'Either works', 'col.unclear': 'Not sure yet',
      's4.title': 'Appointment & Budget', 's4.sub': 'Approximate is fine – no binding commitment.',
      's4.time.lbl': 'Preferred timeframe', 's4.pref.lbl': 'Preferred time of day', 's4.budget.lbl': 'Your budget range',
      's4.notes.lbl': 'Special requests or questions', 's4.notes.opt': '(optional)', 's4.notes.ph': 'e.g. special occasion, open questions, preferred dates …',
      'tf.asap': 'As soon as possible', 'tf.1_3': 'In 1–3 months', 'tf.3_6': 'In 3–6 months',
      'tf.6_12': 'In 6–12 months', 'tf.none': 'No fixed timeline',
      'pt.morning': 'Morning', 'pt.afternoon': 'Afternoon', 'pt.evening': 'Evening', 'pt.none': 'No preference',
      'bud.unclear': 'Not sure yet', 'bud.private': 'Prefer not to say',
      'bud.u150': 'under €150', 'bud.150_300': '€150–300', 'bud.300_500': '€300–500',
      'bud.500_800': '€500–800', 'bud.800_1500': '€800–1,500', 'bud.o1500': 'over €1,500',
      's5.title': 'Your Skin', 's5.sub': 'Helps prepare the session – all optional.',
      's5.first.lbl': 'Is this your first tattoo?',
      's5.allergy.lbl': 'Any known allergies or skin sensitivities?',
      's5.allergy.notes.lbl': 'Which allergies or sensitivities?', 's5.allergy.notes.opt': '(optional)',
      's5.allergy.notes.ph': 'e.g. nickel allergy, sensitive skin, eczema …',
      'yn.yes': 'Yes', 'yn.no': 'No', 'yn.unsure': 'Not sure',
      's6.title': 'How can we<br>reach you?',
      's6.sub': 'Only your e-mail is required – everything else is optional.',
      's6.name.lbl': 'Your name', 's6.name.ph': 'e.g. Jane Smith',
      's6.email.lbl': 'E-mail address', 's6.email.ph': 'your@email.com', 's6.email.opt': '(optional)',
      's6.phone.err': 'Please enter a phone number.',
      's6.ig.err': 'Please enter your Instagram handle.',
      's6.email.err': 'Please enter a valid e-mail address.',
      's6.phone.lbl': 'Phone', 's6.phone.opt': '(optional)', 's6.phone.ph': '+1 555 …',
      's6.ig.lbl': 'Instagram handle', 's6.ig.opt': '(optional)', 's6.ig.ph': 'yourname',
      's6.found.lbl': 'How did you find us?',
      's6.privacy': 'I have read the {link} and consent to the processing of my data for handling my request by {name}.',
      's6.privacy.link': 'Privacy Policy',
      's6.privacy.err': 'Please accept the privacy policy to continue.',
      's6.submit.err': 'An error occurred. Please try again or contact us directly.',
      'found.recommendation': 'Recommendation', 'found.other': 'Other',
      's7.title': 'Thank you!',
      's7.sub': '{name} will get back to you within <strong>48 hours</strong>.',
      's7.summary': 'Your summary',
      'sum.motif': 'Idea', 'sum.place': 'Body part', 'sum.style': 'Style',
      'sum.appt': 'Timeline', 'sum.budget': 'Budget', 'sum.email': 'E-mail',
      'upload.max3': 'Maximum 3 images allowed.',
      'upload.imgonly': 'Only image formats allowed (JPG, PNG, WEBP).',
      'upload.toobig': ' is too large (max. 2 MB).',
    },
  };

  // Translation helper
  function T(key) {
    var dict = TRANSLATIONS[currentLang] || TRANSLATIONS.de;
    return (dict[key] !== undefined ? dict[key] : (TRANSLATIONS.de[key] !== undefined ? TRANSLATIONS.de[key] : key));
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CSS
  // ──────────────────────────────────────────────────────────────────────────
  const SHADOW_CSS = `
    @import url('https://fonts.bunny.net/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    :host { all: initial; }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(27,27,27,0.60);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2147483646;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      transition: opacity 0.32s ease;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    }
    .overlay.visible { opacity: 1; }

    .modal {
      background: #F7F6F3;
      border-radius: 24px;
      width: 100%;
      max-width: 560px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(27,27,27,0.18), 0 8px 24px rgba(27,27,27,0.08);
      transform: translateY(28px) scale(0.97);
      transition: transform 0.36s cubic-bezier(0.34,1.56,0.64,1);
    }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    /* Language toggle */
    .lang-toggle { display:flex; align-items:center; gap:1px; background:rgba(27,27,27,0.07); border-radius:6px; padding:2px; }
    .lang-btn { background:transparent; border:none; border-radius:4px; padding:3px 8px; font-size:10px; font-weight:700; letter-spacing:0.07em; cursor:pointer; color:rgba(27,27,27,0.35); font-family:inherit; transition:all 0.15s; }
    .lang-btn.active { background:#fff; color:#1B1B1B; box-shadow:0 1px 3px rgba(0,0,0,0.1); }
    .modal-header-right { display:flex; align-items:center; gap:6px; }

    .progress-bar { height: 2px; background: #E9E7E2; flex-shrink: 0; }
    .progress-fill {
      height: 100%;
      background: #BF7A60;
      transition: width 0.45s cubic-bezier(0.4,0,0.2,1);
      border-radius: 2px;
    }

    .modal-header {
      padding: 24px 30px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .logo {
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: #1B1B1B;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      line-height: 1;
    }
    .close-btn {
      width: 36px; height: 36px;
      border: none; background: transparent; cursor: pointer;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #9A9590;
      transition: background 0.2s, color 0.2s;
      flex-shrink: 0;
    }
    .close-btn:hover { background: rgba(27,27,27,0.06); color: #1B1B1B; }
    .close-btn svg { display: block; }

    .modal-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 32px 36px;
      scrollbar-width: thin;
      scrollbar-color: #D1CDC7 transparent;
    }
    .modal-content::-webkit-scrollbar { width: 3px; }
    .modal-content::-webkit-scrollbar-thumb { background: #D1CDC7; border-radius: 2px; }

    .step { display: none; }
    .step.active { display: block; animation: fadeSlideIn 0.3s ease; }
    .step.active.back { animation: fadeSlideInLeft 0.3s ease; }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateX(16px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeSlideInLeft {
      from { opacity: 0; transform: translateX(-16px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .step-title {
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      font-size: 26px; font-weight: 700;
      color: #1B1B1B; line-height: 1.2;
      letter-spacing: -0.02em;
      margin: 0 0 8px;
    }
    .step-subtitle {
      font-size: 14px; color: #9A9590;
      line-height: 1.7; margin: 0 0 34px;
    }

    .field { margin-bottom: 22px; }
    .field-label {
      display: block; font-size: 11px; font-weight: 600;
      color: #9A9590; text-transform: uppercase;
      letter-spacing: 0.1em; margin-bottom: 8px;
    }
    .field-label .req { color: #BF7A60; margin-left: 2px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field-pfx-wrap { position: relative; }
    .field-pfx {
      position: absolute; left: 18px; top: 50%; transform: translateY(-50%);
      font-size: 14px; color: #C8C4BF; pointer-events: none; user-select: none;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    }
    .field-pfx-wrap input { padding-left: 30px !important; }

    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="date"],
    select,
    textarea {
      width: 100%;
      padding: 14px 18px;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      font-size: 14px; color: #1B1B1B;
      background: #fff;
      border: 1px solid #D1CDC7;
      border-radius: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      appearance: none; -webkit-appearance: none;
    }
    input::placeholder, textarea::placeholder { color: #C8C4BF; }
    input:focus, select:focus, textarea:focus {
      border-color: #BF7A60;
      box-shadow: 0 0 0 3px rgba(191,122,96,0.12);
    }
    input.err, select.err { border-color: #BF7A60; }

    select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239A9590' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      padding-right: 44px;
      cursor: pointer;
    }
    textarea { min-height: 100px; resize: vertical; line-height: 1.6; }

    .err-msg { font-size: 12px; color: #BF7A60; margin-top: 6px; display: none; }
    .err-msg.show { display: block; }

    /* Checkboxes */
    .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .check-item {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px;
      background: #fff; border: 1px solid #D1CDC7;
      border-radius: 14px; cursor: pointer;
      font-size: 13px; color: #1B1B1B;
      line-height: 1.35;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    .check-item:hover {
      border-color: #BF7A60;
      background: #F7F6F3;
      box-shadow: 0 2px 8px rgba(191,122,96,0.10);
    }
    .check-item.checked {
      border-color: #BF7A60;
      background: rgba(191,122,96,0.07);
      box-shadow: 0 2px 8px rgba(191,122,96,0.12);
    }
    .check-item input[type="checkbox"] {
      width: 15px; height: 15px;
      accent-color: #BF7A60; flex-shrink: 0; cursor: pointer;
    }

    /* Radio pills */
    .radio-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .radio-item {
      flex: 1; min-width: 70px;
      display: flex; align-items: center; justify-content: center;
      padding: 12px 14px;
      background: #fff; border: 1px solid #D1CDC7;
      border-radius: 100px; cursor: pointer;
      font-size: 13px; color: #1B1B1B;
      text-align: center;
      transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    .radio-item:hover {
      border-color: #BF7A60;
      background: #F7F6F3;
      box-shadow: 0 2px 8px rgba(191,122,96,0.10);
    }
    .radio-item.checked {
      border-color: #1B1B1B;
      background: #1B1B1B;
      color: #F7F6F3; font-weight: 600;
      box-shadow: 0 2px 10px rgba(27,27,27,0.15);
    }
    .radio-item input[type="radio"] { display: none; }

    /* Media-type tiles */
    .media-group { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .media-item {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 8px;
      padding: 20px 10px;
      background: #fff; border: 1px solid #D1CDC7;
      border-radius: 16px; cursor: pointer;
      font-size: 13px; color: #1B1B1B; text-align: center;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.2s;
      user-select: none;
    }
    .media-item:hover {
      border-color: #BF7A60;
      background: #F7F6F3;
      box-shadow: 0 4px 14px rgba(191,122,96,0.12);
      transform: translateY(-1px);
    }
    .media-item.checked {
      border-color: #1B1B1B;
      background: #1B1B1B;
      color: #F7F6F3; font-weight: 600;
      box-shadow: 0 4px 16px rgba(27,27,27,0.16);
      transform: translateY(-1px);
    }
    .media-item input[type="radio"] { display: none; }
    .media-icon { display: flex; align-items: center; justify-content: center; }

    /* "Noch unklar" toggle */
    .unclear-row {
      display: flex; align-items: center; gap: 9px;
      margin-top: 12px; cursor: pointer; user-select: none;
    }
    .unclear-row input[type="checkbox"] {
      width: 14px; height: 14px;
      accent-color: #BF7A60; cursor: pointer;
    }
    .unclear-row span { font-size: 12px; color: #9A9590; }

    /* File upload */
    .upload-area {
      border: 1.5px dashed #D1CDC7;
      border-radius: 16px;
      padding: 24px 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .upload-area:hover {
      border-color: #BF7A60;
      background: #F7F6F3;
      box-shadow: 0 4px 14px rgba(191,122,96,0.08);
    }
    .upload-area.has-files {
      border-color: #BF7A60;
      background: rgba(191,122,96,0.05);
    }
    .upload-label { font-size: 13px; color: #9A9590; line-height: 1.65; }
    .upload-label strong { color: #1B1B1B; }
    input[type="file"] { display: none; }
    .upload-previews {
      display: flex; gap: 10px; margin-top: 14px;
      flex-wrap: wrap; justify-content: center;
    }
    .upload-thumb-wrap { position: relative; }
    .upload-thumb {
      width: 72px; height: 72px;
      object-fit: cover; border-radius: 10px;
      border: 1px solid #D1CDC7; display: block;
    }
    .upload-thumb-del {
      position: absolute; top: -6px; right: -6px;
      width: 20px; height: 20px;
      background: #1B1B1B; color: #F7F6F3;
      border: none; border-radius: 50%;
      font-size: 13px; line-height: 1;
      cursor: pointer; display: flex;
      align-items: center; justify-content: center;
      padding: 0;
    }
    .upload-hint { font-size: 11px; color: #9A9590; margin-top: 8px; }
    .upload-err { font-size: 12px; color: #BF7A60; margin-top: 6px; display: none; }
    .upload-err.show { display: block; }

    /* Divider */
    .divider { height: 1px; background: #E9E7E2; margin: 28px 0; }

    /* Welcome */
    .welcome-icon {
      width: 66px; height: 66px;
      background: rgba(191,122,96,0.10);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 26px;
    }
    .feature-list { list-style: none; padding: 0; margin: 0 0 32px; }
    .feature-list li {
      display: flex; align-items: flex-start; gap: 12px;
      font-size: 14px; color: #6B6B6B;
      padding: 7px 0; line-height: 1.55;
    }
    .feature-list li::before {
      content: '✦'; color: #BF7A60;
      font-size: 11px; margin-top: 3px; flex-shrink: 0;
    }

    /* Navigation */
    .modal-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 32px;
      border-top: 1px solid rgba(0,0,0,0.06);
      flex-shrink: 0;
      background: #F7F6F3;
    }
    .btn {
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
      font-size: 14px; font-weight: 600;
      padding: 13px 28px;
      border-radius: 100px; border: none;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
      display: inline-flex; align-items: center; gap: 6px;
      letter-spacing: 0.02em;
    }
    .btn-primary {
      background: #1B1B1B; color: #F7F6F3;
      box-shadow: 0 2px 8px rgba(27,27,27,0.16);
    }
    .btn-primary:hover {
      background: #333;
      box-shadow: 0 4px 16px rgba(27,27,27,0.22);
      transform: translateY(-1px);
    }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
    .btn-primary:disabled:hover { background: #1B1B1B; transform: none; }
    .btn-ghost {
      background: transparent; color: #9A9590;
      border: none;
    }
    .btn-ghost:hover {
      color: #1B1B1B;
      background: rgba(27,27,27,0.05);
    }
    .btn-full {
      width: 100%; justify-content: center;
      padding: 16px; font-size: 15px;
      border-radius: 100px; margin-top: 8px;
    }
    .step-counter { font-size: 12px; color: #9A9590; letter-spacing: 0.04em; }

    /* Thank you */
    .thankyou-wrap { text-align: center; padding: 12px 0 6px; }
    .thankyou-icon {
      width: 80px; height: 80px;
      background: rgba(191,122,96,0.10);
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 24px;
      animation: heartbeat 2.4s ease-in-out infinite;
    }
    @keyframes heartbeat {
      0%,100% { transform: scale(1); }
      30%      { transform: scale(1.07); }
      60%      { transform: scale(1); }
      80%      { transform: scale(1.04); }
    }
    .summary-card {
      background: #fff; border: 1px solid #D1CDC7;
      border-radius: 16px; padding: 20px 22px;
      margin-top: 26px; text-align: left;
    }
    .summary-card-title {
      font-size: 11px; color: #9A9590;
      text-transform: uppercase; letter-spacing: 0.1em;
      margin-bottom: 14px;
    }
    .summary-row {
      display: flex; gap: 10px;
      padding: 7px 0; font-size: 13px;
      border-bottom: 1px solid #EFEDE9;
    }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { color: #9A9590; width: 130px; flex-shrink: 0; }
    .summary-value { color: #1B1B1B; font-weight: 500; }

    /* Responsive */
    @media (max-width: 520px) {
      .upload-drag-hint { display: none; }
      .modal { border-radius: 20px; max-height: 96vh; }
      .modal-header { padding: 18px 20px 12px; }
      .modal-content { padding: 4px 20px 28px; }
      .modal-nav { padding: 16px 20px; }
      .step-title { font-size: 22px; }
      .field-row { grid-template-columns: 1fr; }
      .check-grid { grid-template-columns: 1fr 1fr; }
      .check-item { font-size: 12px; padding: 11px 12px; }
      .radio-group { flex-direction: column; }
      .media-group { grid-template-columns: 1fr; }
    }
  `;

  // ──────────────────────────────────────────────────────────────────────────
  // THEME OVERRIDES
  // ──────────────────────────────────────────────────────────────────────────

  // ── PEBBLE: Warmes Taupe � Mushroom � Clean & Modern ──
  const THEME_CSS_NACHT = `
    .overlay { background: rgba(40,32,24,0.48); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
    .modal { background: #EFEBE5; border-radius: 20px; box-shadow: 0 32px 80px rgba(40,32,24,0.22), 0 4px 16px rgba(40,32,24,0.08); }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { background: #E2D8CC; height: 1px; }
    .progress-fill { background: #AC9278; border-radius: 1px; }

    .logo { font-size: 12px; font-weight: 700; color: #8A7A68; letter-spacing: 0.12em; text-transform: uppercase; }
    .close-btn { color: #B8A898; border-radius: 8px; }
    .close-btn:hover { background: #E4DDD4; color: #1C1810; border-radius: 8px; }

    .modal-content { scrollbar-color: #D4CAC0 transparent; }
    .modal-content::-webkit-scrollbar-thumb { background: #D4CAC0; border-radius: 2px; }

    .step-title { color: #1C1810; font-size: 26px; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; }
    .step-subtitle { color: #8A7A68; font-size: 14px; line-height: 1.7; }
    .field-label { font-size: 10px; font-weight: 700; color: #9A8A78; text-transform: uppercase; letter-spacing: 0.12em; }
    .field-label .req { color: #AC9278; }

    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], textarea {
      background: #FAF8F5; border: 1px solid #D9D0C4; border-radius: 10px; color: #1C1810;
      padding: 14px 18px; font-size: 14px; transition: border-color 0.2s, box-shadow 0.2s;
    }
    input::placeholder, textarea::placeholder { color: #C4B8A8; }
    input:focus, textarea:focus { border-color: #AC9278; box-shadow: 0 0 0 3px rgba(172,146,120,0.1); outline: none; }
    input.err { border-color: #AC9278; }
    select {
      background: #FAF8F5; border: 1px solid #D9D0C4; border-radius: 10px; color: #1C1810;
      padding: 14px 40px 14px 18px; font-size: 14px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239A8A78' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 14px center;
    }
    select:focus { border-color: #AC9278; outline: none; }
    select.err { border-color: #AC9278; }

    .check-item { background: #FAF8F5; border: 1px solid #D9D0C4; border-radius: 10px; color: #8A7A68; transition: all 0.18s; }
    .check-item:hover { border-color: #AC9278; background: #F5F0E8; color: #1C1810; }
    .check-item.checked { border-color: #AC9278; background: rgba(172,146,120,0.1); color: #1C1810; }
    .check-item input[type="checkbox"] { accent-color: #AC9278; }

    .radio-item { background: #FAF8F5; border: 1px solid #D9D0C4; border-radius: 100px; color: #8A7A68; }
    .radio-item:hover { border-color: #AC9278; background: #F5F0E8; color: #1C1810; }
    .radio-item.checked { background: #1C1810; border-color: #1C1810; color: #EFE8DE; font-weight: 600; }

    .upload-area { border-color: #D9D0C4; border-radius: 12px; background: #FAF8F5; }
    .upload-area:hover { border-color: #AC9278; background: #F5F0E8; }
    .upload-area.has-files { border-color: #AC9278; background: rgba(172,146,120,0.06); }
    .upload-label { color: #9A8A78; }
    .upload-label strong { color: #1C1810; }

    .divider { background: #E2D8CC; }
    .welcome-icon { background: rgba(172,146,120,0.1); border-radius: 50%; }
    .feature-list li { color: #8A7A68; }
    .feature-list li::before { content: '\u2736'; color: #AC9278; font-size: 10px; margin-top: 3px; }

    .modal-nav { background: #EFEBE5; border-top: 1px solid #E2D8CC; }
    .btn-primary { background: #1C1810; color: #EFE8DE; border-radius: 100px; transition: all 0.2s; }
    .btn-primary:hover { background: #2C2818; }
    .btn-primary:disabled { opacity: 0.35; }
    .btn-primary:disabled:hover { background: #1C1810; }
    .btn-ghost { color: #B8A898; border: none; background: transparent; }
    .btn-ghost:hover { color: #1C1810; background: rgba(28,24,16,0.06); }
    .step-counter { color: #B8A898; }

    .thankyou-icon { background: rgba(172,146,120,0.1); border-radius: 50%; }
    .summary-card { background: #FAF8F5; border-color: #D9D0C4; border-radius: 12px; }
    .summary-card-title { color: #9A8A78; letter-spacing: 0.12em; text-transform: uppercase; font-size: 9px; }
    .summary-row { border-bottom-color: #EAE2D8; }
    .summary-label { color: #9A8A78; }
    .summary-value { color: #1C1810; font-weight: 500; }
  `;

  // ── EMBER: Warmes Amber � Linen � Golden & Warm ──
  const THEME_CSS_SAGE = `
    .overlay { background: rgba(45,30,14,0.50); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
    .modal { background: #F3EDE0; border-radius: 20px; box-shadow: 0 32px 80px rgba(45,30,14,0.22), 0 4px 16px rgba(45,30,14,0.08); }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { background: #E8DCC8; height: 1px; }
    .progress-fill { background: linear-gradient(90deg, #C8965A, #D4A870); border-radius: 1px; }

    .logo { font-size: 12px; font-weight: 700; color: #7A6248; letter-spacing: 0.12em; text-transform: uppercase; }
    .close-btn { color: #C4A870; border-radius: 8px; }
    .close-btn:hover { background: #EBE0CC; color: #221C10; border-radius: 8px; }

    .modal-content { scrollbar-color: #D8C8A8 transparent; }
    .modal-content::-webkit-scrollbar-thumb { background: #D8C8A8; border-radius: 2px; }

    .step-title { color: #221C10; font-size: 26px; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; }
    .step-subtitle { color: #8A7258; font-size: 14px; line-height: 1.7; }
    .field-label { font-size: 10px; font-weight: 700; color: #9A8060; text-transform: uppercase; letter-spacing: 0.12em; }
    .field-label .req { color: #C8965A; }

    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], textarea {
      background: #FDF8EF; border: 1px solid #E2D4B8; border-radius: 10px; color: #221C10;
      padding: 14px 18px; font-size: 14px; transition: border-color 0.2s, box-shadow 0.2s;
    }
    input::placeholder, textarea::placeholder { color: #CEC0A0; }
    input:focus, textarea:focus { border-color: #C8965A; box-shadow: 0 0 0 3px rgba(200,150,90,0.1); outline: none; }
    input.err { border-color: #C8965A; }
    select {
      background: #FDF8EF; border: 1px solid #E2D4B8; border-radius: 10px; color: #221C10;
      padding: 14px 40px 14px 18px; font-size: 14px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239A8060' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 14px center;
    }
    select:focus { border-color: #C8965A; outline: none; }
    select.err { border-color: #C8965A; }

    .check-item { background: #FDF8EF; border: 1px solid #E2D4B8; border-radius: 10px; color: #8A7258; transition: all 0.18s; }
    .check-item:hover { border-color: #C8965A; background: #F8F0E0; color: #221C10; }
    .check-item.checked { border-color: #C8965A; background: rgba(200,150,90,0.1); color: #221C10; }
    .check-item input[type="checkbox"] { accent-color: #C8965A; }

    .radio-item { background: #FDF8EF; border: 1px solid #E2D4B8; border-radius: 100px; color: #8A7258; }
    .radio-item:hover { border-color: #C8965A; background: #F8F0E0; color: #221C10; }
    .radio-item.checked { background: #221C10; border-color: #221C10; color: #F3EDE0; font-weight: 600; }

    .upload-area { border-color: #E2D4B8; border-radius: 12px; background: #FDF8EF; }
    .upload-area:hover { border-color: #C8965A; background: #F8F0E0; }
    .upload-area.has-files { border-color: #C8965A; background: rgba(200,150,90,0.07); }
    .upload-label { color: #9A8060; }
    .upload-label strong { color: #221C10; }

    .divider { background: #E8DCC8; }
    .welcome-icon { background: rgba(200,150,90,0.1); border-radius: 50%; }
    .feature-list li { color: #8A7258; }
    .feature-list li::before { content: '\u2736'; color: #C8965A; font-size: 10px; margin-top: 3px; }

    .modal-nav { background: #F3EDE0; border-top: 1px solid #E8DCC8; }
    .btn-primary { background: #221C10; color: #F3EDE0; border-radius: 100px; transition: all 0.2s; }
    .btn-primary:hover { background: #342E20; }
    .btn-primary:disabled { opacity: 0.35; }
    .btn-primary:disabled:hover { background: #221C10; }
    .btn-ghost { color: #C4A870; border: none; background: transparent; }
    .btn-ghost:hover { color: #221C10; background: rgba(34,28,16,0.06); }
    .step-counter { color: #C4A870; }

    .thankyou-icon { background: rgba(200,150,90,0.1); border-radius: 50%; }
    .summary-card { background: #FDF8EF; border-color: #E2D4B8; border-radius: 12px; }
    .summary-card-title { color: #9A8060; letter-spacing: 0.12em; text-transform: uppercase; font-size: 9px; }
    .summary-row { border-bottom-color: #EDE4CC; }
    .summary-label { color: #9A8060; }
    .summary-value { color: #221C10; font-weight: 500; }
  `;

  // ── ATELIER: Editorial · Warm Ivory · Bodoni · Hochwertig wie ein Tattoo-Studio ──
  const THEME_CSS_CLEAN = `
    @import url('https://fonts.bunny.net/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;1,400;1,500&display=swap');

    .overlay { background: rgba(30,24,20,0.55); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
    .modal { background: #F8F5F1; border-radius: 20px; box-shadow: 0 32px 80px rgba(30,24,20,0.18), 0 2px 8px rgba(30,24,20,0.06); }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { background: #EDE8E2; height: 1px; }
    .progress-fill { background: #2A2420; border-radius: 1px; }

    .logo { font-family: 'Bodoni Moda', serif; font-size: 13px; font-weight: 400; color: #2A2420; letter-spacing: 0.2em; text-transform: uppercase; font-style: normal; }
    .close-btn { color: #C8BFB4; border-radius: 10px; }
    .close-btn:hover { background: #EDE8E2; color: #2A2420; border-radius: 10px; }

    .modal-content { scrollbar-color: #D4C8BC transparent; }
    .modal-content::-webkit-scrollbar-thumb { background: #D4C8BC; border-radius: 2px; }

    .step-title { font-family: 'Bodoni Moda', serif; font-size: 38px; font-weight: 400; color: #1E1A18; line-height: 1.05; letter-spacing: -0.01em; font-style: italic; }
    .step-subtitle { color: #A09890; font-size: 13px; line-height: 1.7; letter-spacing: 0.01em; }
    .field-label { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; color: #B0A898; text-transform: uppercase; letter-spacing: 0.16em; }
    .field-label .req { color: #C4917A; }

    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], textarea {
      background: #FFFFFF;
      border: 1px solid #E4DDD6;
      border-radius: 12px;
      color: #1E1A18;
      padding: 14px 18px;
      font-size: 14px;
      font-family: 'Inter', sans-serif;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input::placeholder, textarea::placeholder { color: #D4CCC4; }
    input:focus, textarea:focus { border-color: #2A2420; box-shadow: 0 0 0 3px rgba(42,36,32,0.06); outline: none; }
    input.err { border-color: #C4917A; }
    select {
      background: #FFFFFF;
      border: 1px solid #E4DDD6;
      border-radius: 12px;
      color: #1E1A18;
      padding: 14px 40px 14px 18px;
      font-size: 14px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23B0A898' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
    }
    select:focus { border-color: #2A2420; outline: none; }
    select.err { border-color: #C4917A; }

    .check-item { background: #FFFFFF; border: 1px solid #E4DDD6; border-radius: 12px; color: #A09890; transition: all 0.18s; }
    .check-item:hover { border-color: #2A2420; background: #FDFAF8; color: #1E1A18; }
    .check-item.checked { border-color: #2A2420; background: #FDFAF8; color: #1E1A18; }
    .check-item input[type="checkbox"] { accent-color: #2A2420; }

    .radio-item { background: #FFFFFF; border: 1px solid #E4DDD6; border-radius: 12px; color: #A09890; }
    .radio-item:hover { border-color: #2A2420; background: #FDFAF8; color: #1E1A18; }
    .radio-item.checked { border-color: #2A2420; background: #2A2420; color: #F8F5F1; font-style: italic; font-family: 'Bodoni Moda', serif; font-weight: 400; font-size: 14px; }

    .media-item { background: #FFFFFF; border: 1px solid #E4DDD6; border-radius: 13px; color: #A09890; }
    .media-item:hover { border-color: #2A2420; background: #FDFAF8; color: #1E1A18; }
    .media-item.checked { border-color: #2A2420; background: #2A2420; color: #F8F5F1; }

    .unclear-row span { color: #B0A898; }
    .unclear-row input[type="checkbox"] { accent-color: #2A2420; }

    .upload-area { border-color: #E4DDD6; border-radius: 13px; background: #FFFFFF; }
    .upload-area:hover { border-color: #2A2420; background: #FDFAF8; }
    .upload-area.has-files { border-color: #2A2420; background: rgba(42,36,32,0.03); }
    .upload-label { color: #B0A898; }
    .upload-label strong { color: #1E1A18; }

    .divider { background: #EDE8E2; }
    .welcome-icon { background: rgba(42,36,32,0.06); border-radius: 50%; }
    .feature-list li { color: #A09890; }
    .feature-list li::before { content: '—'; color: #C4917A; font-size: 11px; margin-top: 3px; }

    .modal-nav { background: #F8F5F1; border-top: 1px solid #EDE8E2; }
    .btn-primary { background: #2A2420; color: #F8F5F1; border-radius: 12px; font-weight: 400; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; padding: 13px 28px; font-family: 'Inter', sans-serif; transition: all 0.2s; }
    .btn-primary:hover { background: #1A1410; }
    .btn-primary:disabled { opacity: 0.3; }
    .btn-primary:disabled:hover { background: #2A2420; }
    .btn-ghost { color: #B0A898; border: 1px solid #E4DDD6; border-radius: 12px; background: transparent; }
    .btn-ghost:hover { color: #1E1A18; border-color: #2A2420; }
    .step-counter { color: #C8BFB4; letter-spacing: 0.06em; }

    .thankyou-icon { background: rgba(42,36,32,0.06); border-radius: 50%; }
    .summary-card { background: #FFFFFF; border-color: #E4DDD6; border-radius: 13px; }
    .summary-card-title { color: #B0A898; letter-spacing: 0.12em; text-transform: uppercase; font-size: 9px; }
    .summary-row { border-bottom-color: #F0EBE4; }
    .summary-label { color: #B0A898; }
    .summary-value { color: #1E1A18; font-weight: 400; }
  `;

  // ── SCRIPT: Bold &amp; Grafisch · Uppercase · Stark wie Traditional Tattoo-Art ──
  const THEME_CSS_MODERN = `
    .overlay { background: rgba(30,26,22,0.65); }
    .modal { background: #EDEAE4; border-radius: 0; box-shadow: 0 32px 80px rgba(0,0,0,0.18); }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { background: #D8D4CC; height: 1px; border-radius: 0; }
    .progress-fill { background: #1A1714; border-radius: 0; }

    .modal-header { border-bottom: none; padding-bottom: 0; }
    .logo { font-family: 'Cormorant Garamond', serif; font-size: 10px; font-weight: 400; color: #9A9390; letter-spacing: 0.22em; text-transform: uppercase; }
    .close-btn { color: #9A9390; border-radius: 0; }
    .close-btn:hover { background: rgba(0,0,0,0.06); color: #1A1714; }

    .step-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: #1A1714; letter-spacing: 0.28em; text-transform: uppercase; line-height: 1.2; }
    .step-subtitle { color: #9A9390; font-size: 12px; letter-spacing: 0.04em; }
    .field-label { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 400; color: #9A9390; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 2px; }
    .field-label .req { color: #B8A898; }

    /* Felder – nur Unterstrich */
    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], select, textarea {
      background: transparent;
      border: none;
      border-bottom: 1px solid #C4BFB8;
      border-radius: 0;
      color: #1A1714;
      padding: 10px 0;
      font-size: 14px;
    }
    textarea { border-bottom: 1px solid #C4BFB8; padding-bottom: 10px; min-height: 80px; }
    input::placeholder, textarea::placeholder { color: #BAB6AF; }
    input:focus, select:focus, textarea:focus { border-bottom-color: #1A1714; outline: none; background: transparent; box-shadow: none; }
    input.err, select.err { border-bottom-color: #9B6B5A; }
    select { padding-right: 24px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239A9390' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 4px center;
    }

    /* Checkboxen – flach, Linie */
    .check-item { background: transparent; border: none; border-bottom: 1px solid #D4CFC8; border-radius: 0; color: #9A9390; padding: 10px 0; }
    .check-item:hover { background: rgba(0,0,0,0.03); color: #1A1714; }
    .check-item.checked { border-bottom-color: #1A1714; color: #1A1714; background: transparent; }
    .check-item input[type="checkbox"] { accent-color: #1A1714; }

    .radio-item { background: transparent; border: 1px solid #C4BFB8; border-radius: 0; color: #9A9390; }
    .radio-item:hover { border-color: #1A1714; color: #1A1714; }
    .radio-item.checked { border-color: #1A1714; background: #1A1714; color: #EDEAE4; font-weight: 400; }

    .media-item { background: transparent; border: 1px solid #C4BFB8; border-radius: 0; color: #9A9390; }
    .media-item:hover { border-color: #1A1714; color: #1A1714; }
    .media-item.checked { border-color: #1A1714; background: rgba(26,23,20,0.07); color: #1A1714; }

    .unclear-row span { color: #9A9390; }
    .unclear-row input[type="checkbox"] { accent-color: #1A1714; }

    .upload-area { border-color: #C4BFB8; border-radius: 0; background: transparent; }
    .upload-area:hover { border-color: #1A1714; background: rgba(0,0,0,0.02); }
    .upload-area.has-files { border-color: #1A1714; }
    .upload-label { color: #9A9390; }
    .upload-label strong { color: #1A1714; }

    .divider { background: #C4BFB8; }
    .welcome-icon { background: rgba(0,0,0,0.06); border-radius: 0; }
    .feature-list li { color: #9A9390; }
    .feature-list li::before { color: #1A1714; }

    /* Navigation – flache Buttons */
    .modal-nav { background: #E5E1DB; border-top: 1px solid #C4BFB8; }
    .btn-primary { background: #1A1714; color: #EDEAE4; border-radius: 0; font-weight: 400; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; padding: 13px 28px; font-family: 'Inter', sans-serif; }
    .btn-primary:hover { background: #2E2A26; }
    .btn-primary:disabled:hover { background: #1A1714; }
    .btn-ghost { color: #9A9390; border: 1px solid #C4BFB8; border-radius: 0; background: transparent; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }
    .btn-ghost:hover { color: #1A1714; border-color: #1A1714; }
    .step-counter { color: #B8B4AC; letter-spacing: 0.06em; }

    .thankyou-icon { background: rgba(0,0,0,0.06); border-radius: 0; }
    .summary-card { background: rgba(0,0,0,0.04); border-color: #C4BFB8; border-radius: 0; }
    .summary-card-title { color: #9A9390; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; font-size: 10px; }
    .summary-row { border-bottom-color: #D4CFC8; }
    .summary-label { color: #9A9390; }
    .summary-value { color: #1A1714; font-weight: 400; }
  `;

  // ──────────────────────────────────────────────────────────────────────────
  // ICONS
  // ──────────────────────────────────────────────────────────────────────────
  const ICON_CLOSE =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const ICON_DONE =
    '<svg width="34" height="34" viewBox="0 0 60 60" fill="none" stroke="#BF7A60" stroke-width="2.5" stroke-linecap="round"><circle cx="30" cy="30" r="22"/><path d="M20 30 L27 37 L41 21"/></svg>';
  const ICON_NEEDLE =
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#BF7A60" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><line x1="15" y1="5" x2="19" y2="9"/></svg>';

  // ──────────────────────────────────────────────────────────────────────────
  // HTML (7 Steps = Welcome + 5 Inhalts-Schritte + Danke)
  // ──────────────────────────────────────────────────────────────────────────
  const MODAL_HTML = `
    <div class="progress-bar"><div class="progress-fill" id="ea-progress"></div></div>
    <div class="modal-header">
      <span class="logo">einfach anfrage</span>
      <div class="modal-header-right">
        <div id="ea-lang-toggle" class="lang-toggle" style="display:${CONFIG.language === 'auto' ? 'flex' : 'none'};">
          <button class="lang-btn active" data-lang="de">DE</button>
          <button class="lang-btn" data-lang="en">EN</button>
        </div>
        <button class="close-btn" id="ea-close" aria-label="Schließen">${ICON_CLOSE}</button>
      </div>
    </div>

    <div class="modal-content" id="ea-content">

      <!-- ── Step 1: Willkommen ── -->
      <div class="step active" data-step="1">
        <div class="welcome-icon">${ICON_NEEDLE}</div>
        <h2 class="step-title" data-i18n="w.title">Tattoo-Anfrage stellen</h2>
        <p class="step-subtitle" data-i18n-html="w.sub">Damit ${CONFIG.photographerName} dir ein passendes Angebot machen kann – ein paar kurze Fragen, dauert nur <strong>3 Minuten</strong>.</p>
        <ul class="feature-list">
          <li data-i18n="w.li1">Fast alles kann auch mit „Noch unklar" beantwortet werden</li>
          <li data-i18n="w.li2">Kein Account, keine Werbung</li>
          <li data-i18n-html="w.li3">Deine Daten gehen nur an ${CONFIG.photographerName}</li>
        </ul>
        <button class="btn btn-primary btn-full" id="ea-start" data-i18n="btn.start">Jetzt starten →</button>
      </div>

      <!-- ── Step 2: Motiv & Ort ── -->
      <div class="step" data-step="2">
        <h2 class="step-title" data-i18n="s2.title">Dein Motiv</h2>
        <p class="step-subtitle" data-i18n="s2.sub">Was soll gestochen werden – und wo?</p>

        <div class="field">
          <label class="field-label" for="ea-motif-desc"><span data-i18n="s2.desc.lbl">Was stellst du dir vor?</span> <span class="req">*</span></label>
          <textarea id="ea-motif-desc" name="motifDesc" rows="3" data-i18n-ph="s2.desc.ph" placeholder="„Fine-Line Rosen, eher zart und filigran""></textarea>
          <div class="err-msg" id="ea-motif-err" data-i18n="s2.desc.err">Bitte kurz beschreiben, was du dir vorstellst.</div>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="ea-placement" data-i18n="s2.place.lbl">Körperstelle</label>
            <select id="ea-placement" name="placement">
              <option value="" data-i18n="ph">– bitte wählen –</option>
              <option value="Unterarm" data-i18n="place.forearm">Unterarm</option>
              <option value="Oberarm" data-i18n="place.upperarm">Oberarm</option>
              <option value="Schulter / Schulterblatt" data-i18n="place.shoulder">Schulter / Schulterblatt</option>
              <option value="Brust / Sternum" data-i18n="place.chest">Brust / Sternum</option>
              <option value="Rücken" data-i18n="place.back">Rücken</option>
              <option value="Rippen / Seite" data-i18n="place.ribs">Rippen / Seite</option>
              <option value="Bauch" data-i18n="place.belly">Bauch</option>
              <option value="Hüfte / Hüftknochen" data-i18n="place.hip">Hüfte / Hüftknochen</option>
              <option value="Oberschenkel" data-i18n="place.thigh">Oberschenkel</option>
              <option value="Unterschenkel / Schienbein" data-i18n="place.shin">Unterschenkel / Schienbein</option>
              <option value="Knöchel / Fuß" data-i18n="place.ankle">Knöchel / Fuß</option>
              <option value="Hand / Finger" data-i18n="place.hand">Hand / Finger</option>
              <option value="Hals / Nacken" data-i18n="place.neck">Hals / Nacken</option>
              <option value="Kopf" data-i18n="place.head">Kopf</option>
              <option value="Noch unklar" data-i18n="place.unclear">Noch unklar</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="ea-size" data-i18n="s2.size.lbl">Ungefähre Größe</label>
            <select id="ea-size" name="size">
              <option value="" data-i18n="ph">– bitte wählen –</option>
              <option value="Klein (bis 5 cm)" data-i18n="size.s">Klein (bis 5 cm)</option>
              <option value="Mittel (5–10 cm)" data-i18n="size.m">Mittel (5–10 cm)</option>
              <option value="Groß (10–20 cm)" data-i18n="size.l">Groß (10–20 cm)</option>
              <option value="Sehr groß / Sleeve (über 20 cm)" data-i18n="size.xl">Sehr groß / Sleeve (über 20 cm)</option>
              <option value="Noch unklar" data-i18n="size.unclear">Noch unklar</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label class="field-label" data-i18n="s2.cu.lbl">Cover-Up?</label>
          <div class="radio-group" id="ea-coverup">
            <label class="radio-item"><input type="radio" name="isCoverUp" value="Nein"><span data-i18n="cu.no">Nein</span></label>
            <label class="radio-item"><input type="radio" name="isCoverUp" value="Ja"><span data-i18n="cu.yes">Ja, Cover-Up</span></label>
            <label class="radio-item"><input type="radio" name="isCoverUp" value="Noch unklar"><span data-i18n="cu.unclear">Noch unklar</span></label>
          </div>
        </div>

        <div class="field" id="ea-coverup-notes-wrap" style="display:none;">
          <label class="field-label" for="ea-coverup-notes"><span data-i18n="s2.cu.notes.lbl">Das bestehende Tattoo</span> <span style="font-weight:400;text-transform:none;letter-spacing:0;" data-i18n="s2.cu.notes.opt">(optional)</span></label>
          <textarea id="ea-coverup-notes" name="coverUpNotes" data-i18n-ph="s2.cu.notes.ph" placeholder="Farbe, Größe und Stil des alten Tattoos."></textarea>
        </div>
      </div>

      <!-- ── Step 3: Stil & Referenzen ── -->
      <div class="step" data-step="3">
        <h2 class="step-title" data-i18n="s3.title">Stil &amp; Referenzen</h2>
        <p class="step-subtitle" data-i18n="s3.sub">Welchen Stil suchst du? Mehrfachauswahl möglich.</p>

        <div class="field">
          <label class="field-label" data-i18n="s3.style.lbl">Tattoo-Stil</label>
          <div class="check-grid" id="ea-styles">
            <label class="check-item"><input type="checkbox" value="Fine Line"> Fine Line</label>
            <label class="check-item"><input type="checkbox" value="Blackwork / Dotwork"> Blackwork / Dotwork</label>
            <label class="check-item"><input type="checkbox" value="Realistisch"> Realistisch</label>
            <label class="check-item"><input type="checkbox" value="Portrait"> Portrait</label>
            <label class="check-item"><input type="checkbox" value="Japanisch / Irezumi"> Japanisch / Irezumi</label>
            <label class="check-item"><input type="checkbox" value="Traditional / Old School"> Traditional / Old School</label>
            <label class="check-item"><input type="checkbox" value="Neo Traditional"> Neo Traditional</label>
            <label class="check-item"><input type="checkbox" value="Watercolor"> Watercolor</label>
            <label class="check-item"><input type="checkbox" value="Geometric"> Geometric</label>
            <label class="check-item"><input type="checkbox" value="Ornamental / Mandala"> Ornamental / Mandala</label>
            <label class="check-item"><input type="checkbox" value="Lettering / Schrift"> Lettering / Schrift</label>
            <label class="check-item"><input type="checkbox" value="Noch unklar"><span data-i18n="s3.style.unclear">Noch unklar</span></label>
          </div>
        </div>

        <div class="field">
          <label class="field-label" data-i18n="s3.color.lbl">Farbe oder Schwarz-Grau?</label>
          <div class="radio-group" id="ea-color-pref">
            <label class="radio-item"><input type="radio" name="colorPreference" value="Schwarz-Grau"><span data-i18n="col.bw">Schwarz-Grau</span></label>
            <label class="radio-item"><input type="radio" name="colorPreference" value="Farbe"><span data-i18n="col.color">Farbe</span></label>
            <label class="radio-item"><input type="radio" name="colorPreference" value="Beides möglich"><span data-i18n="col.both">Beides möglich</span></label>
            <label class="radio-item"><input type="radio" name="colorPreference" value="Noch unklar"><span data-i18n="col.unclear">Noch unklar</span></label>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-style-notes"><span data-i18n="s3.notes.lbl">Stil-Notizen</span> <span style="font-weight:400;text-transform:none;letter-spacing:0;" data-i18n="s3.notes.opt">(optional)</span></label>
          <textarea id="ea-style-notes" name="styleNotes" rows="2" data-i18n-ph="s3.notes.ph" placeholder="z. B. „eher minimalistisch, keine dicken Linien, soll zeitlos wirken" …"></textarea>
        </div>

        <div class="field">
          <label class="field-label"><span data-i18n="s3.upload.lbl">Referenzbilder</span> <span style="font-weight:400;text-transform:none;letter-spacing:0;" data-i18n="s3.upload.opt">(optional · max. 3 Fotos)</span></label>
          <div class="upload-area" id="ea-upload-area">
            <input type="file" id="ea-file-input" accept="image/jpeg,image/png,image/webp" multiple>
            <div class="upload-label" id="ea-upload-label">
              <strong data-i18n="s3.upload.cta">Klicken zum Hochladen</strong> <span class="upload-drag-hint" data-i18n="s3.upload.drag">oder Bilder hierher ziehen</span><br>
              <span style="font-size:12px;color:#B0A898;" data-i18n="s3.upload.sub">Screenshots, Pinterest-Pins, Fotos von Tattoos, die dir gefallen</span>
            </div>
            <div class="upload-previews" id="ea-upload-previews"></div>
          </div>
          <div class="upload-hint" data-i18n="s3.upload.hint">JPG, PNG oder WEBP · max. 2 MB pro Bild · max. 3 Bilder</div>
          <div class="upload-err" id="ea-upload-err"></div>
        </div>
      </div>

      <!-- ── Step 4: Termin & Budget ── -->
      <div class="step" data-step="4">
        <h2 class="step-title" data-i18n="s4.title">Termin &amp; Budget</h2>
        <p class="step-subtitle" data-i18n="s4.sub">Ungefähr reicht – kein verbindlicher Termin.</p>

        <div class="field">
          <label class="field-label" for="ea-timeframe" data-i18n="s4.time.lbl">Wunsch-Zeitraum</label>
          <select id="ea-timeframe" name="timeframe">
            <option value="" data-i18n="ph">– bitte wählen –</option>
            <option value="So bald wie möglich" data-i18n="tf.asap">So bald wie möglich</option>
            <option value="In 1–3 Monaten" data-i18n="tf.1_3">In 1–3 Monaten</option>
            <option value="In 3–6 Monaten" data-i18n="tf.3_6">In 3–6 Monaten</option>
            <option value="In 6–12 Monaten" data-i18n="tf.6_12">In 6–12 Monaten</option>
            <option value="Kein fester Zeitdruck" data-i18n="tf.none">Kein fester Zeitdruck</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label" data-i18n="s4.pref.lbl">Bevorzugte Tageszeit</label>
          <div class="radio-group" id="ea-preferred-time">
            <label class="radio-item"><input type="radio" name="preferredTime" value="Vormittags"><span data-i18n="pt.morning">Vormittags</span></label>
            <label class="radio-item"><input type="radio" name="preferredTime" value="Nachmittags"><span data-i18n="pt.afternoon">Nachmittags</span></label>
            <label class="radio-item"><input type="radio" name="preferredTime" value="Abends"><span data-i18n="pt.evening">Abends</span></label>
            <label class="radio-item"><input type="radio" name="preferredTime" value="Keine Präferenz"><span data-i18n="pt.none">Keine Präferenz</span></label>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-budget" data-i18n="s4.budget.lbl">Dein Budgetrahmen</label>
          <select id="ea-budget" name="budget">
            <option value="" data-i18n="ph">– bitte wählen –</option>
            <option value="Noch unklar" data-i18n="bud.unclear">Noch unklar</option>
            <option value="Möchte ich nicht angeben" data-i18n="bud.private">Möchte ich nicht angeben</option>
            <option value="unter 150 €" data-i18n="bud.u150">unter 150 €</option>
            <option value="150–300 €" data-i18n="bud.150_300">150–300 €</option>
            <option value="300–500 €" data-i18n="bud.300_500">300–500 €</option>
            <option value="500–800 €" data-i18n="bud.500_800">500–800 €</option>
            <option value="800–1.500 €" data-i18n="bud.800_1500">800–1.500 €</option>
            <option value="über 1.500 €" data-i18n="bud.o1500">über 1.500 €</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label" for="ea-notes"><span data-i18n="s4.notes.lbl">Besondere Wünsche oder Fragen</span> <span style="font-weight:400;text-transform:none;letter-spacing:0;" data-i18n="s4.notes.opt">(optional)</span></label>
          <textarea id="ea-notes" name="notes" rows="2" data-i18n-ph="s4.notes.ph" placeholder="z. B. besonderer Anlass, offene Fragen, Terminwünsche …"></textarea>
        </div>
      </div>

      <!-- ── Step 5: Deine Haut ── -->
      <div class="step" data-step="5">
        <h2 class="step-title" data-i18n="s5.title">Deine Haut</h2>
        <p class="step-subtitle" data-i18n="s5.sub">Hilft beim Vorbereiten der Session – alles freiwillig.</p>

        <div class="field">
          <label class="field-label" data-i18n="s5.first.lbl">Ist das dein erstes Tattoo?</label>
          <div class="radio-group" id="ea-first-tattoo">
            <label class="radio-item"><input type="radio" name="isFirstTattoo" value="Ja"><span data-i18n="yn.yes">Ja</span></label>
            <label class="radio-item"><input type="radio" name="isFirstTattoo" value="Nein"><span data-i18n="yn.no">Nein</span></label>
          </div>
        </div>

        <div class="field">
          <label class="field-label" data-i18n="s5.allergy.lbl">Bekannte Allergien oder Hautunverträglichkeiten?</label>
          <div class="radio-group" id="ea-allergies">
            <label class="radio-item"><input type="radio" name="knownAllergies" value="Nein"><span data-i18n="yn.no">Nein</span></label>
            <label class="radio-item"><input type="radio" name="knownAllergies" value="Ja"><span data-i18n="yn.yes">Ja</span></label>
            <label class="radio-item"><input type="radio" name="knownAllergies" value="Nicht sicher"><span data-i18n="yn.unsure">Nicht sicher</span></label>
          </div>
        </div>

        <div class="field" id="ea-allergies-detail-wrap" style="display:none;">
          <label class="field-label" for="ea-allergies-detail"><span data-i18n="s5.allergy.notes.lbl">Welche Allergien oder Unverträglichkeiten?</span> <span style="font-weight:400;text-transform:none;letter-spacing:0;" data-i18n="s5.allergy.notes.opt">(optional)</span></label>
          <textarea id="ea-allergies-detail" name="allergiesDetail" data-i18n-ph="s5.allergy.notes.ph" placeholder="z. B. Nickelallergie, empfindliche Haut, Neurodermitis …"></textarea>
        </div>
      </div>

      <!-- ── Step 6: Kontakt ── -->
      <div class="step" data-step="6">
        <h2 class="step-title" data-i18n-html="s6.title">Wie können wir<br>dich erreichen?</h2>
        <p class="step-subtitle" data-i18n="s6.sub">Nur die E-Mail ist Pflicht – alles andere ist freiwillig.</p>

        <div class="field">
          <label class="field-label" for="ea-name" data-i18n="s6.name.lbl">Dein Name</label>
          <input type="text" id="ea-name" name="name" data-i18n-ph="s6.name.ph" placeholder="z. B. Mia Müller">
        </div>

        <div class="field">
          <label class="field-label" for="ea-email">
            <span data-i18n="s6.email.lbl">E-Mail-Adresse</span>
            <span class="rc-req" data-rc="email"><span class="req">*</span></span>
            <span class="rc-opt" data-rc="email" style="display:none;font-weight:400;text-transform:none;letter-spacing:0;" data-i18n="s6.email.opt">(optional)</span>
          </label>
          <input type="email" id="ea-email" name="email" data-i18n-ph="s6.email.ph" placeholder="deine@email.de">
          <div class="err-msg" id="ea-email-err" data-i18n="s6.email.err">Bitte eine gültige E-Mail-Adresse eingeben.</div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-phone">
            <span data-i18n="s6.phone.lbl">Telefon</span>
            <span class="rc-req" data-rc="phone" style="display:none;"><span class="req">*</span></span>
            <span class="rc-opt" data-rc="phone" style="font-weight:400;text-transform:none;letter-spacing:0;" data-i18n="s6.phone.opt">(optional)</span>
          </label>
          <input type="tel" id="ea-phone" name="phone" data-i18n-ph="s6.phone.ph" placeholder="+49 176 …">
          <div class="err-msg" id="ea-phone-err" data-i18n="s6.phone.err">Bitte eine Telefonnummer eingeben.</div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-instagram">
            <span data-i18n="s6.ig.lbl">Instagram-Handle</span>
            <span class="rc-req" data-rc="instagram" style="display:none;"><span class="req">*</span></span>
            <span class="rc-opt" data-rc="instagram" style="font-weight:400;text-transform:none;letter-spacing:0;" data-i18n="s6.ig.opt">(optional)</span>
          </label>
          <div class="field-pfx-wrap">
            <span class="field-pfx">@</span>
            <input type="text" id="ea-instagram" name="instagram" data-i18n-ph="s6.ig.ph" placeholder="deinname" autocomplete="off">
          </div>
          <div class="err-msg" id="ea-ig-err" data-i18n="s6.ig.err">Bitte deinen Instagram-Handle eingeben.</div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-found" data-i18n="s6.found.lbl">Wie hast du uns gefunden?</label>
          <select id="ea-found" name="howFound">
            <option value="" data-i18n="ph">– bitte wählen –</option>
            <option>Instagram</option>
            <option>Google</option>
            <option>TikTok</option>
            <option value="Empfehlung" data-i18n="found.recommendation">Empfehlung</option>
            <option>Walk-In</option>
            <option>Pinterest</option>
            <option value="Sonstiges" data-i18n="found.other">Sonstiges</option>
          </select>
        </div>

        <div class="field" style="margin-top:4px;">
          <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;padding:12px 14px;border:1.5px solid #D1CDC7;border-radius:9px;transition:border-color 0.15s;" id="ea-privacy-label">
            <input type="checkbox" id="ea-privacy-consent" style="margin-top:2px;flex-shrink:0;width:16px;height:16px;cursor:pointer;accent-color:#BF7A60;">
            <span style="font-size:12.5px;color:#6B6B6B;line-height:1.5;" data-i18n-privacy>
              Ich habe die <a href="${CONFIG.privacyUrl}" target="_blank" rel="noopener noreferrer" style="color:#BF7A60;text-decoration:underline;">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage durch <strong>${CONFIG.photographerName}</strong> zu. <span style="color:#BF7A60;">*</span>
            </span>
          </label>
          <div class="err-msg" id="ea-privacy-err" data-i18n="s6.privacy.err">Bitte die Datenschutzerklärung akzeptieren, um fortzufahren.</div>
        </div>
        <div id="ea-submit-err" style="display:none;margin-top:12px;padding:12px 14px;background:#FFF3F0;border:1px solid #F5C6BC;border-radius:8px;font-size:13px;color:#C0392B;line-height:1.5;" data-i18n="s6.submit.err">
          Es ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere uns direkt.
        </div>
      </div>

      <!-- ── Step 7: Bestätigung ── -->
      <div class="step" data-step="7">
        <div class="thankyou-wrap">
          <div class="thankyou-icon">${ICON_DONE}</div>
          <h2 class="step-title" data-i18n="s7.title">Vielen Dank!</h2>
          <p class="step-subtitle" id="ea-thankyou-text" data-i18n-html="s7.sub">
            <strong>${CONFIG.photographerName}</strong> meldet sich innerhalb von<br>
            <strong>48 Stunden</strong> bei dir.
          </p>
          <div class="summary-card" id="ea-summary"></div>
        </div>
      </div>

    </div><!-- /modal-content -->

    <div class="modal-nav" id="ea-nav">
      <button class="btn btn-ghost" id="ea-back" style="visibility:hidden;" data-i18n="btn.back">← Zurück</button>
      <span class="step-counter" id="ea-counter"></span>
      <button class="btn btn-primary" id="ea-next" data-i18n="btn.next">Weiter →</button>
    </div>
  `;

  // ──────────────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────────────
  const TOTAL_STEPS = 7;
  let currentStep = 1;
  let currentLang = CONFIG.language === 'en' ? 'en' : 'de'; // 'auto' defaults to de (set later via browser lang)
  let formData = {};
  let uploadedFiles = []; // [{name, data, type}]
  let shadowRoot, overlay, modalEl, progressFill, navEl, backBtn, nextBtn, counter;

  // ──────────────────────────────────────────────────────────────────────────
  // CREATE WIDGET
  // ──────────────────────────────────────────────────────────────────────────
  function createWidget() {
    const host = d.createElement('div');
    host.id = 'ea-widget-root';
    d.body.appendChild(host);

    shadowRoot = host.attachShadow({ mode: 'open' });

    const style = d.createElement('style');
    style.textContent = SHADOW_CSS;
    shadowRoot.appendChild(style);

    const themeMap = { nacht: THEME_CSS_NACHT, sage: THEME_CSS_SAGE, clean: THEME_CSS_CLEAN, modern: THEME_CSS_MODERN };
    if (themeMap[CONFIG.theme]) {
      const themeStyle = d.createElement('style');
      themeStyle.textContent = themeMap[CONFIG.theme];
      shadowRoot.appendChild(themeStyle);
    }

    overlay = d.createElement('div');
    overlay.className = 'overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Anfrage stellen');
    overlay.innerHTML = '<div class="modal">' + MODAL_HTML + '</div>';
    shadowRoot.appendChild(overlay);

    progressFill = shadowRoot.getElementById('ea-progress');
    navEl        = shadowRoot.getElementById('ea-nav');
    backBtn      = shadowRoot.getElementById('ea-back');
    nextBtn      = shadowRoot.getElementById('ea-next');
    counter      = shadowRoot.getElementById('ea-counter');
    modalEl      = overlay.querySelector('.modal');

    // Base events
    shadowRoot.getElementById('ea-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    shadowRoot.getElementById('ea-start').addEventListener('click', function () { goToStep(2); });
    backBtn.addEventListener('click', function () { if (currentStep > 2) goToStep(currentStep - 1, true); });
    nextBtn.addEventListener('click', handleNext);

    // Enter key in input/select fields triggers Next (not in textarea)
    shadowRoot.getElementById('ea-content').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'textarea') return;
      if (tag === 'input' && (e.target.type === 'checkbox' || e.target.type === 'radio')) return;
      e.preventDefault();
      // Blur first so date/select values are committed before validation
      if (e.target.blur) e.target.blur();
      handleNext();
    });

    // Check-item interactivity — use 'change' to avoid double-toggle from wrapping label
    shadowRoot.querySelectorAll('.check-grid').forEach(function (grid) {
      grid.querySelectorAll('.check-item').forEach(function (item) {
        var cb = item.querySelector('input[type="checkbox"]');
        cb.addEventListener('change', function () {
          item.classList.toggle('checked', cb.checked);
        });
      });
    });

    // Radio-item interactivity (standard .radio-group)
    shadowRoot.querySelectorAll('.radio-group').forEach(function (group) {
      group.querySelectorAll('.radio-item').forEach(function (item) {
        var radio = item.querySelector('input[type="radio"]');
        radio.addEventListener('change', function () {
          group.querySelectorAll('.radio-item').forEach(function (ri) { ri.classList.remove('checked'); });
          item.classList.add('checked');
        });
      });
    });

    // Media-type interactivity (.media-group)
    var mediaGroup = shadowRoot.getElementById('ea-media-type');
    if (mediaGroup) {
      mediaGroup.querySelectorAll('.media-item').forEach(function (item) {
        var radio = item.querySelector('input[type="radio"]');
        radio.addEventListener('change', function () {
          mediaGroup.querySelectorAll('.media-item').forEach(function (mi) { mi.classList.remove('checked'); });
          item.classList.add('checked');
        });
      });
    }

    // Cover-Up toggle
    shadowRoot.querySelectorAll('input[name="isCoverUp"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        var wrap = shadowRoot.getElementById('ea-coverup-notes-wrap');
        if (wrap) wrap.style.display = radio.value === 'Ja' ? 'block' : 'none';
      });
    });

    // Allergies detail toggle
    shadowRoot.querySelectorAll('input[name="knownAllergies"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        var wrap = shadowRoot.getElementById('ea-allergies-detail-wrap');
        if (wrap) wrap.style.display = radio.value === 'Ja' ? 'block' : 'none';
      });
    });

    // File upload
    initFileUpload();

    // Language init (auto: detect browser language)
    if (CONFIG.language === 'auto') {
      var browserLang = (navigator.language || 'de').toLowerCase();
      currentLang = browserLang.startsWith('de') ? 'de' : 'en';
    }
    applyTranslations(currentLang);

    // Language toggle buttons
    var langToggle = shadowRoot.getElementById('ea-lang-toggle');
    if (langToggle) {
      langToggle.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          currentLang = btn.dataset.lang;
          langToggle.querySelectorAll('.lang-btn').forEach(function (b) {
            b.classList.toggle('active', b.dataset.lang === currentLang);
          });
          applyTranslations(currentLang);
          applyRequiredContactUI();
        });
      });
    }

    // Pflichtfeld-UI auf Kontakt-Schritt anwenden
    applyRequiredContactUI();

    // Escape to close
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // APPLY TRANSLATIONS
  // ──────────────────────────────────────────────────────────────────────────
  function applyTranslations(lang) {
    // Plain text
    shadowRoot.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = T(el.dataset.i18n);
      if (v !== el.dataset.i18n) el.textContent = v;
    });
    // HTML (allows <strong>, <br>, {name} substitution)
    shadowRoot.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = T(el.dataset.i18nHtml);
      if (v !== el.dataset.i18nHtml) el.innerHTML = v.replace(/\{name\}/g, CONFIG.photographerName);
    });
    // Placeholders
    shadowRoot.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var v = T(el.dataset.i18nPh);
      if (v !== el.dataset.i18nPh) el.setAttribute('placeholder', v);
    });
    // Privacy text (special: link + {name} + {link})
    var privEl = shadowRoot.querySelector('[data-i18n-privacy]');
    if (privEl) {
      var tmpl = T('s6.privacy');
      var linkTxt = T('s6.privacy.link');
      var linkHtml = '<a href="' + CONFIG.privacyUrl + '" target="_blank" rel="noopener noreferrer" style="color:#BF7A60;text-decoration:underline;">' + linkTxt + '</a>';
      privEl.innerHTML = tmpl
        .replace('{link}', linkHtml)
        .replace('{name}', '<strong>' + CONFIG.photographerName + '</strong>')
        + ' <span style="color:#BF7A60;">*</span>';
    }
    // Close button aria-label
    var closeEl = shadowRoot.getElementById('ea-close');
    if (closeEl) closeEl.setAttribute('aria-label', T('close'));
    // Refresh nav (counter + button texts)
    updateNav();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FILE UPLOAD
  // ──────────────────────────────────────────────────────────────────────────
  function initFileUpload() {
    var area     = shadowRoot.getElementById('ea-upload-area');
    var input    = shadowRoot.getElementById('ea-file-input');
    var previews = shadowRoot.getElementById('ea-upload-previews');
    var label    = shadowRoot.getElementById('ea-upload-label');
    var errEl    = shadowRoot.getElementById('ea-upload-err');

    if (!area) return;

    area.addEventListener('click', function (e) {
      if (e.target.classList.contains('upload-thumb-del')) return;
      if (uploadedFiles.length < 3) input.click();
    });

    input.addEventListener('change', function () {
      handleUploadFiles(Array.from(input.files), previews, label, errEl);
      input.value = '';
    });

    area.addEventListener('dragover', function (e) {
      e.preventDefault();
      area.style.borderColor = '#BF7A60';
    });
    area.addEventListener('dragleave', function () {
      area.style.borderColor = uploadedFiles.length ? '#BF7A60' : '';
    });
    area.addEventListener('drop', function (e) {
      e.preventDefault();
      handleUploadFiles(Array.from(e.dataTransfer.files), previews, label, errEl);
    });
  }

  function handleUploadFiles(files, previews, label, errEl) {
    errEl.classList.remove('show');
    files.forEach(function (file) {
      if (uploadedFiles.length >= 3) { showUploadErr(errEl, T('upload.max3')); return; }
      if (!file.type.startsWith('image/')) { showUploadErr(errEl, T('upload.imgonly')); return; }
      if (file.size > 2 * 1024 * 1024) { showUploadErr(errEl, file.name + T('upload.toobig')); return; }

      var reader = new FileReader();
      reader.onload = function (e) {
        uploadedFiles.push({ name: file.name, data: e.target.result, type: file.type });
        renderPreviews(previews, label);
      };
      reader.readAsDataURL(file);
    });
  }

  function showUploadErr(errEl, msg) {
    errEl.textContent = msg;
    errEl.classList.add('show');
  }

  function renderPreviews(previews, label) {
    previews.innerHTML = uploadedFiles.map(function (f, i) {
      return '<div class="upload-thumb-wrap">' +
        '<img class="upload-thumb" src="' + f.data + '" alt="' + f.name + '">' +
        '<button class="upload-thumb-del" data-idx="' + i + '" title="Entfernen">×</button>' +
        '</div>';
    }).join('');

    if (label) label.style.display = uploadedFiles.length >= 3 ? 'none' : '';

    var area = shadowRoot.getElementById('ea-upload-area');
    if (area) area.classList.toggle('has-files', uploadedFiles.length > 0);

    previews.querySelectorAll('.upload-thumb-del').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        uploadedFiles.splice(parseInt(btn.dataset.idx), 1);
        renderPreviews(
          shadowRoot.getElementById('ea-upload-previews'),
          shadowRoot.getElementById('ea-upload-label')
        );
      });
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ──────────────────────────────────────────────────────────────────────────
  function goToStep(n, back) {
    shadowRoot.querySelectorAll('.step').forEach(function (s) { s.classList.remove('active', 'back'); });
    var target = shadowRoot.querySelector('[data-step="' + n + '"]');
    if (!target) return;
    currentStep = n;
    target.classList.add('active');
    if (back) target.classList.add('back');
    updateNav();
    updateProgress();
    var content = shadowRoot.getElementById('ea-content');
    if (content) content.scrollTop = 0;
  }

  function updateNav() {
    var isFirst = currentStep === 1;
    var isLast  = currentStep === TOTAL_STEPS;
    navEl.style.display = (isFirst || isLast) ? 'none' : 'flex';
    if (!isFirst && !isLast) {
      backBtn.style.visibility = currentStep === 2 ? 'hidden' : 'visible';
      nextBtn.textContent = currentStep === 6 ? T('btn.submit') : T('btn.next');
      backBtn.textContent = T('btn.back');
      counter.textContent = T('counter').replace('{n}', String(currentStep - 1));
    }
  }

  function updateProgress() {
    var pct = currentStep === 1 ? 0 : Math.round(((currentStep - 1) / 6) * 100);
    progressFill.style.width = pct + '%';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ──────────────────────────────────────────────────────────────────────────
  function validateStep(step) {
    clearErrors();

    if (step === 2) {
      var motifDesc = shadowRoot.getElementById('ea-motif-desc');
      if (!motifDesc || !motifDesc.value.trim()) {
        showError('ea-motif-err', 'ea-motif-desc');
        return false;
      }
    }

    if (step === 6) {
      var req = CONFIG.requiredContact || ['email'];

      // E-Mail: Pflicht-Validierung oder Format-Validierung wenn ausgefüllt
      var emailInput = shadowRoot.getElementById('ea-email');
      var emailVal   = emailInput ? emailInput.value.trim() : '';
      if (req.indexOf('email') !== -1) {
        if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
          showError('ea-email-err', 'ea-email'); return false;
        }
      } else if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        // Optional aber falsch formatiert
        showError('ea-email-err', 'ea-email'); return false;
      }

      // Telefon
      if (req.indexOf('phone') !== -1) {
        var phoneInput = shadowRoot.getElementById('ea-phone');
        if (!phoneInput || !phoneInput.value.trim()) {
          showError('ea-phone-err', 'ea-phone'); return false;
        }
      }

      // Instagram
      if (req.indexOf('instagram') !== -1) {
        var igInput = shadowRoot.getElementById('ea-instagram');
        if (!igInput || !igInput.value.trim()) {
          showError('ea-ig-err', 'ea-instagram'); return false;
        }
      }

      var privacyCb = shadowRoot.getElementById('ea-privacy-consent');
      if (!privacyCb || !privacyCb.checked) {
        showError('ea-privacy-err', null);
        var lbl = shadowRoot.getElementById('ea-privacy-label');
        if (lbl) lbl.style.borderColor = '#BF7A60';
        return false;
      }
      if (privacyCb) {
        privacyCb.addEventListener('change', function () {
          var lbl = shadowRoot.getElementById('ea-privacy-label');
          if (lbl) lbl.style.borderColor = privacyCb.checked ? '#BF7A60' : '#D1CDC7';
        }, { once: true });
      }
    }

    return true;
  }

  function showError(errId, fieldId) {
    var errEl = shadowRoot.getElementById(errId);
    if (errEl) errEl.classList.add('show');
    if (fieldId) {
      var fieldEl = shadowRoot.getElementById(fieldId);
      if (fieldEl) fieldEl.classList.add('err');
    }
  }

  function clearErrors() {
    shadowRoot.querySelectorAll('.err-msg').forEach(function (e) { e.classList.remove('show'); });
    shadowRoot.querySelectorAll('.err').forEach(function (e) { e.classList.remove('err'); });
  }

  // Setzt * / (optional) auf den Kontaktfeldern basierend auf CONFIG.requiredContact
  function applyRequiredContactUI() {
    var req = CONFIG.requiredContact || ['email'];
    ['email', 'phone', 'instagram'].forEach(function (field) {
      var isReq = req.indexOf(field) !== -1;
      shadowRoot.querySelectorAll('.rc-req[data-rc="' + field + '"]').forEach(function (el) {
        el.style.display = isReq ? '' : 'none';
      });
      shadowRoot.querySelectorAll('.rc-opt[data-rc="' + field + '"]').forEach(function (el) {
        el.style.display = isReq ? 'none' : '';
      });
    });
    // Dynamischer Untertitel im Kontakt-Schritt
    var subtitle = shadowRoot.querySelector('[data-step="6"] .step-subtitle');
    if (subtitle) subtitle.textContent = buildContactSubtitle(req);
  }

  function buildContactSubtitle(req) {
    var isDE = currentLang !== 'en';
    var names = {
      email: isDE ? 'E-Mail' : 'email',
      phone: isDE ? 'Telefonnummer' : 'phone number',
      instagram: 'Instagram',
    };
    if (!req || req.length === 0) {
      return isDE ? 'Alle Felder sind freiwillig.' : 'All fields are optional.';
    }
    var reqNames = req.map(function (f) { return names[f] || f; });
    if (reqNames.length === 1) {
      return isDE
        ? 'Nur ' + reqNames[0] + ' ist Pflicht – alles andere ist freiwillig.'
        : 'Only ' + reqNames[0] + ' is required – everything else is optional.';
    }
    var copy = reqNames.slice();
    var last = copy.pop();
    var joined = copy.join(', ') + (isDE ? ' und ' : ' and ') + last;
    return isDE
      ? joined + ' sind Pflichtfelder – alles andere ist freiwillig.'
      : joined + ' are required – everything else is optional.';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // COLLECT FORM DATA
  // ──────────────────────────────────────────────────────────────────────────
  function collectFormData() {
    var styles = [];
    shadowRoot.querySelectorAll('#ea-styles input:checked').forEach(function (cb) {
      styles.push(cb.value);
    });

    var getVal = function (name) {
      var el = shadowRoot.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : null;
    };

    return {
      photographerEmail: CONFIG.photographerEmail,
      photographerName:  CONFIG.photographerName,
      photographerSlug:  CONFIG.photographerSlug,
      delivery:          CONFIG.delivery,
      motif: {
        description: (shadowRoot.getElementById('ea-motif-desc') || {}).value ? shadowRoot.getElementById('ea-motif-desc').value.trim() : null,
        placement:   (shadowRoot.getElementById('ea-placement') || {}).value || null,
        size:        (shadowRoot.getElementById('ea-size') || {}).value || null,
        isCoverUp:   getVal('isCoverUp'),
        coverUpNotes: (shadowRoot.getElementById('ea-coverup-notes') || {}).value ? shadowRoot.getElementById('ea-coverup-notes').value.trim() || null : null,
      },
      style: {
        styles:      styles,
        colorPreference: getVal('colorPreference'),
        styleNotes:  (shadowRoot.getElementById('ea-style-notes') || {}).value ? shadowRoot.getElementById('ea-style-notes').value.trim() || null : null,
        inspirationImages: uploadedFiles.map(function (f) {
          return { name: f.name, data: f.data };
        }),
      },
      health: {
        isFirstTattoo:   getVal('isFirstTattoo'),
        knownAllergies:  getVal('knownAllergies'),
        allergiesDetail: (shadowRoot.getElementById('ea-allergies-detail') || {}).value ? shadowRoot.getElementById('ea-allergies-detail').value.trim() || null : null,
      },
      appointment: {
        timeframe:     (shadowRoot.getElementById('ea-timeframe') || {}).value || null,
        preferredTime: getVal('preferredTime'),
      },
      budget: {
        range: (shadowRoot.getElementById('ea-budget') || {}).value || null,
        notes: (shadowRoot.getElementById('ea-notes') || {}).value ? shadowRoot.getElementById('ea-notes').value.trim() || null : null,
      },
      contact: {
        name:           (shadowRoot.getElementById('ea-name') || {}).value ? shadowRoot.getElementById('ea-name').value.trim() || null : null,
        email:          shadowRoot.getElementById('ea-email').value.trim(),
        phone:          (shadowRoot.getElementById('ea-phone') || {}).value ? shadowRoot.getElementById('ea-phone').value.trim() || null : null,
        instagram:      (shadowRoot.getElementById('ea-instagram') || {}).value ? shadowRoot.getElementById('ea-instagram').value.trim() || null : null,
        howFound:       (shadowRoot.getElementById('ea-found') || {}).value || null,
        consentGiven:   true,
        consentGivenAt: new Date().toISOString(),
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SUBMIT
  // ──────────────────────────────────────────────────────────────────────────
  async function submitForm() {
    nextBtn.disabled    = true;
    nextBtn.textContent = T('btn.sending');

    try {
      formData = collectFormData();

      // Upload images FIRST so the URLs are embedded in the submission
      var uploadBase = CONFIG.apiUrl.replace(/\/submissions.*$/, '');
      var imageUrls  = [];
      if (uploadedFiles.length > 0) {
        for (var i = 0; i < uploadedFiles.length; i++) {
          try {
            var uploadRes = await fetch(uploadBase + '/upload', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                imageData: uploadedFiles[i].data,
                imageName: uploadedFiles[i].name,
                imageType: uploadedFiles[i].type,
              }),
            });
            if (uploadRes.ok) {
              var uploadData = await uploadRes.json();
              if (uploadData.url) imageUrls.push({ name: uploadedFiles[i].name, url: uploadData.url });
            } else {
              var uploadErrData = await uploadRes.json().catch(function () { return {}; });
              console.warn('[EinfachAnfrage] Bild-Upload fehlgeschlagen (' + uploadRes.status + '):', uploadErrData.error || '');
            }
          } catch (imgErr) {
            console.warn('[EinfachAnfrage] Bild-Upload Netzwerkfehler:', imgErr.message);
          }
        }
      }

      // Build payload: replace raw base64 data with uploaded URLs
      var payloadForApi = JSON.parse(JSON.stringify(formData));
      payloadForApi.style.inspirationImages     = imageUrls;
      payloadForApi.style.inspirationImageCount = imageUrls.length; // nur erfolgreich hochgeladene

      var res = await fetch(CONFIG.apiUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payloadForApi),
      });
      if (!res.ok) throw new Error('API error ' + res.status);

      var resData = await res.json();

      if (CONFIG.webhookUrl) {
        fetch(CONFIG.webhookUrl, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payloadForApi),
        }).catch(function () {});
      }

      nextBtn.disabled    = false;
      nextBtn.textContent = T('btn.next');
      showThankYou();
    } catch (err) {
      console.error('[EinfachAnfrage] Fehler:', err);
      nextBtn.disabled    = false;
      nextBtn.textContent = T('btn.retry');
      var submitErr = shadowRoot.getElementById('ea-submit-err');
      if (submitErr) submitErr.style.display = 'block';
    }
  }

  function showThankYou() {
    buildSummary();
    goToStep(7);
  }

  function buildSummary() {
    var fd = formData;
    if (!fd) return;
    var summary = shadowRoot.getElementById('ea-summary');
    if (!summary) return;

    var rows = [
      [T('sum.motif'),  (fd.motif && fd.motif.description) ? fd.motif.description.substring(0, 60) + (fd.motif.description.length > 60 ? '…' : '') : '–'],
      [T('sum.place'), (fd.motif && fd.motif.placement) || '–'],
      [T('sum.style'), (fd.style && fd.style.styles && fd.style.styles.length) ? fd.style.styles.join(', ') : '–'],
      [T('sum.appt'),  (fd.appointment && fd.appointment.timeframe) || '–'],
      [T('sum.budget'),(fd.budget && fd.budget.range) || '–'],
      [T('sum.email'), fd.contact.email],
    ];

    summary.innerHTML = '<div class="summary-card-title">' + T('s7.summary') + '</div>' +
      rows.map(function (r) {
        return '<div class="summary-row">' +
          '<span class="summary-label">' + r[0] + '</span>' +
          '<span class="summary-value">'  + r[1] + '</span>' +
          '</div>';
      }).join('');
  }

  function formatDate(iso) {
    if (!iso) return '–';
    var dt = new Date(iso);
    return dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // NEXT HANDLER
  // ──────────────────────────────────────────────────────────────────────────
  function handleNext() {
    if (!validateStep(currentStep)) return;
    if (currentStep === 6) {
      submitForm();
    } else if (currentStep < 6) {
      goToStep(currentStep + 1);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // OPEN / CLOSE
  // ──────────────────────────────────────────────────────────────────────────
  function openModal() {
    if (!shadowRoot) createWidget();

    currentStep   = 1;
    formData      = {};
    uploadedFiles = [];
    if (nextBtn) { nextBtn.disabled = false; nextBtn.textContent = 'Weiter →'; }
    goToStep(1);

    // Reset form fields
    if (shadowRoot) {
      shadowRoot.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], select, textarea').forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'radio') return;
        el.value = '';
      });
      shadowRoot.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(function (el) {
        el.checked = false;
      });
      shadowRoot.querySelectorAll('.check-item, .radio-item, .media-item').forEach(function (el) {
        el.classList.remove('checked');
      });
      var previewsEl = shadowRoot.getElementById('ea-upload-previews');
      if (previewsEl) previewsEl.innerHTML = '';
      var labelEl = shadowRoot.getElementById('ea-upload-label');
      if (labelEl) labelEl.style.display = '';
      var areaEl = shadowRoot.getElementById('ea-upload-area');
      if (areaEl) areaEl.classList.remove('has-files');
      var submitErrEl = shadowRoot.getElementById('ea-submit-err');
      if (submitErrEl) submitErrEl.style.display = 'none';
    }

    overlay.style.display = 'flex';
    d.body.style.overflow  = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { overlay.classList.add('visible'); });
    });
  }

  function closeModal() {
    overlay.classList.remove('visible');
    d.body.style.overflow = '';
    var onEnd = function () {
      overlay.style.display = 'none';
      overlay.removeEventListener('transitionend', onEnd);
    };
    overlay.addEventListener('transitionend', onEnd);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────────────────────────────────
  function init() {
    d.querySelectorAll('[data-einfachanfrage]').forEach(function (btn) {
      btn.addEventListener('click', openModal);
    });

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.hasAttribute && node.hasAttribute('data-einfachanfrage')) node.addEventListener('click', openModal);
          if (node.querySelectorAll) {
            node.querySelectorAll('[data-einfachanfrage]').forEach(function (btn) { btn.addEventListener('click', openModal); });
          }
        });
      });
    });
    observer.observe(d.body, { childList: true, subtree: true });

    w.einfachAnfrage = { open: openModal, close: closeModal };
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);

