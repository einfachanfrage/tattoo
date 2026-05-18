/*!
 * Einfach Anfrage Widget v2.0.0
 * Das elegante Anfrage-Widget für Hochzeitsfotografen
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
      currentScript.getAttribute('data-name') || 'Ihr/e Fotograf/in',
    photographerSlug: currentScript.getAttribute('data-slug') || '',
    privacyUrl: currentScript.getAttribute('data-privacy') || 'https://einfachanfrage-hochzeitsfotografie.de/datenschutz',
    webhookUrl: currentScript.getAttribute('data-webhook') || '',
    apiUrl:
      currentScript.getAttribute('data-api') ||
      scriptOrigin + '/api/submissions',
    theme: currentScript.getAttribute('data-theme') || 'champagne',
    // 'email' = nur E-Mail | 'dashboard' = nur Dashboard | 'both' = beides (Standard)
    delivery: currentScript.getAttribute('data-delivery') || 'both',
  };

  // ──────────────────────────────────────────────────────────────────────────
  // CSS
  // ──────────────────────────────────────────────────────────────────────────
  const SHADOW_CSS = `
    @import url('https://fonts.bunny.net/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    :host { all: initial; }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(26,26,26,0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2147483646;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      transition: opacity 0.32s ease;
      font-family: 'Inter', sans-serif;
    }
    .overlay.visible { opacity: 1; }

    .modal {
      background: #FAF7F2;
      border-radius: 24px;
      width: 100%;
      max-width: 560px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(26,26,26,0.18), 0 8px 24px rgba(26,26,26,0.08);
      transform: translateY(28px) scale(0.97);
      transition: transform 0.36s cubic-bezier(0.34,1.56,0.64,1);
    }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { height: 2px; background: #EDE8E0; flex-shrink: 0; }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #C9A96E 0%, #C4917A 100%);
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
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      font-weight: 500;
      color: #C9A96E;
      letter-spacing: 0.06em;
      line-height: 1;
    }
    .close-btn {
      width: 36px; height: 36px;
      border: none; background: transparent; cursor: pointer;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #B0A898;
      transition: background 0.2s, color 0.2s;
      flex-shrink: 0;
    }
    .close-btn:hover { background: rgba(26,26,26,0.06); color: #1A1A1A; }
    .close-btn svg { display: block; }

    .modal-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 32px 36px;
      scrollbar-width: thin;
      scrollbar-color: #D8D0C4 transparent;
    }
    .modal-content::-webkit-scrollbar { width: 3px; }
    .modal-content::-webkit-scrollbar-thumb { background: #D8D0C4; border-radius: 2px; }

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
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px; font-weight: 400;
      color: #1A1A1A; line-height: 1.15;
      margin: 0 0 8px;
    }
    .step-subtitle {
      font-size: 14px; color: #9A9590;
      line-height: 1.7; margin: 0 0 34px;
    }

    .field { margin-bottom: 22px; }
    .field-label {
      display: block; font-size: 11px; font-weight: 500;
      color: #A8A09A; text-transform: uppercase;
      letter-spacing: 0.1em; margin-bottom: 8px;
    }
    .field-label .req { color: #C4917A; margin-left: 2px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="date"],
    select,
    textarea {
      width: 100%;
      padding: 14px 18px;
      font-family: 'Inter', sans-serif;
      font-size: 14px; color: #1A1A1A;
      background: #fff;
      border: 1px solid #E8E2DA;
      border-radius: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      appearance: none; -webkit-appearance: none;
    }
    input::placeholder, textarea::placeholder { color: #C8C0B8; }
    input:focus, select:focus, textarea:focus {
      border-color: #C9A96E;
      box-shadow: 0 0 0 3px rgba(201,169,110,0.12);
    }
    input.err, select.err { border-color: #C4917A; }

    select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239A9590' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      padding-right: 44px;
      cursor: pointer;
    }
    textarea { min-height: 100px; resize: vertical; line-height: 1.6; }

    .err-msg { font-size: 12px; color: #C4917A; margin-top: 6px; display: none; }
    .err-msg.show { display: block; }

    /* Checkboxes */
    .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .check-item {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px;
      background: #fff; border: 1px solid #EAE4DC;
      border-radius: 14px; cursor: pointer;
      font-size: 13px; color: #2A2420;
      line-height: 1.35;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    .check-item:hover {
      border-color: #C9A96E;
      background: #FEFCF8;
      box-shadow: 0 2px 8px rgba(201,169,110,0.1);
    }
    .check-item.checked {
      border-color: #C9A96E;
      background: rgba(201,169,110,0.07);
      box-shadow: 0 2px 8px rgba(201,169,110,0.12);
    }
    .check-item input[type="checkbox"] {
      width: 15px; height: 15px;
      accent-color: #C9A96E; flex-shrink: 0; cursor: pointer;
    }

    /* Radio pills */
    .radio-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .radio-item {
      flex: 1; min-width: 70px;
      display: flex; align-items: center; justify-content: center;
      padding: 12px 14px;
      background: #fff; border: 1px solid #EAE4DC;
      border-radius: 100px; cursor: pointer;
      font-size: 13px; color: #2A2420;
      text-align: center;
      transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
      user-select: none;
    }
    .radio-item:hover {
      border-color: #C9A96E;
      background: #FEFCF8;
      box-shadow: 0 2px 8px rgba(201,169,110,0.1);
    }
    .radio-item.checked {
      border-color: #C9A96E;
      background: rgba(201,169,110,0.09);
      color: #8A6A2E; font-weight: 600;
      box-shadow: 0 2px 10px rgba(201,169,110,0.15);
    }
    .radio-item input[type="radio"] { display: none; }

    /* Media-type tiles */
    .media-group { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
    .media-item {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 8px;
      padding: 20px 10px;
      background: #fff; border: 1px solid #EAE4DC;
      border-radius: 16px; cursor: pointer;
      font-size: 13px; color: #2A2420; text-align: center;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.2s;
      user-select: none;
    }
    .media-item:hover {
      border-color: #C9A96E;
      background: #FEFCF8;
      box-shadow: 0 4px 14px rgba(201,169,110,0.12);
      transform: translateY(-1px);
    }
    .media-item.checked {
      border-color: #C9A96E;
      background: rgba(201,169,110,0.08);
      color: #8A6A2E; font-weight: 600;
      box-shadow: 0 4px 16px rgba(201,169,110,0.16);
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
      accent-color: #C9A96E; cursor: pointer;
    }
    .unclear-row span { font-size: 12px; color: #9A9590; }

    /* File upload */
    .upload-area {
      border: 1.5px dashed #DDD8D0;
      border-radius: 16px;
      padding: 24px 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .upload-area:hover {
      border-color: #C9A96E;
      background: #FEFCF8;
      box-shadow: 0 4px 14px rgba(201,169,110,0.08);
    }
    .upload-area.has-files {
      border-color: #C9A96E;
      background: rgba(201,169,110,0.04);
    }
    .upload-label { font-size: 13px; color: #9A9590; line-height: 1.65; }
    .upload-label strong { color: #1A1A1A; }
    input[type="file"] { display: none; }
    .upload-previews {
      display: flex; gap: 10px; margin-top: 14px;
      flex-wrap: wrap; justify-content: center;
    }
    .upload-thumb-wrap { position: relative; }
    .upload-thumb {
      width: 72px; height: 72px;
      object-fit: cover; border-radius: 10px;
      border: 1px solid #E8E2DA; display: block;
    }
    .upload-thumb-del {
      position: absolute; top: -6px; right: -6px;
      width: 20px; height: 20px;
      background: #1A1A1A; color: #FAF7F2;
      border: none; border-radius: 50%;
      font-size: 13px; line-height: 1;
      cursor: pointer; display: flex;
      align-items: center; justify-content: center;
      padding: 0;
    }
    .upload-hint { font-size: 11px; color: #B8B0A8; margin-top: 8px; }
    .upload-err { font-size: 12px; color: #C4917A; margin-top: 6px; display: none; }
    .upload-err.show { display: block; }

    /* Divider */
    .divider { height: 1px; background: #EDE8E0; margin: 28px 0; }

    /* Welcome */
    .welcome-icon {
      width: 66px; height: 66px;
      background: rgba(201,169,110,0.1);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 26px;
    }
    .feature-list { list-style: none; padding: 0; margin: 0 0 32px; }
    .feature-list li {
      display: flex; align-items: flex-start; gap: 12px;
      font-size: 14px; color: #6A6560;
      padding: 7px 0; line-height: 1.55;
    }
    .feature-list li::before {
      content: '✦'; color: #C9A96E;
      font-size: 11px; margin-top: 3px; flex-shrink: 0;
    }

    /* Navigation */
    .modal-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 32px;
      border-top: 1px solid rgba(0,0,0,0.06);
      flex-shrink: 0;
      background: #FAF7F2;
    }
    .btn {
      font-family: 'Inter', sans-serif;
      font-size: 14px; font-weight: 500;
      padding: 13px 28px;
      border-radius: 100px; border: none;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
      display: inline-flex; align-items: center; gap: 6px;
      letter-spacing: 0.01em;
    }
    .btn-primary {
      background: #1A1A1A; color: #FAF7F2;
      box-shadow: 0 2px 8px rgba(26,26,26,0.18);
    }
    .btn-primary:hover {
      background: #C9A96E;
      box-shadow: 0 4px 16px rgba(201,169,110,0.32);
      transform: translateY(-1px);
    }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
    .btn-primary:disabled:hover { background: #1A1A1A; transform: none; }
    .btn-ghost {
      background: transparent; color: #9A9590;
      border: none;
    }
    .btn-ghost:hover {
      color: #1A1A1A;
      background: rgba(26,26,26,0.05);
    }
    .btn-full {
      width: 100%; justify-content: center;
      padding: 16px; font-size: 15px;
      border-radius: 100px; margin-top: 8px;
    }
    .step-counter { font-size: 12px; color: #B8B0A8; letter-spacing: 0.04em; }

    /* Thank you */
    .thankyou-wrap { text-align: center; padding: 12px 0 6px; }
    .thankyou-icon {
      width: 80px; height: 80px;
      background: rgba(201,169,110,0.1);
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
      background: #fff; border: 1px solid #EAE4DC;
      border-radius: 16px; padding: 20px 22px;
      margin-top: 26px; text-align: left;
    }
    .summary-card-title {
      font-size: 11px; color: #A8A09A;
      text-transform: uppercase; letter-spacing: 0.1em;
      margin-bottom: 14px;
    }
    .summary-row {
      display: flex; gap: 10px;
      padding: 7px 0; font-size: 13px;
      border-bottom: 1px solid #F4F0EA;
    }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { color: #9A9590; width: 130px; flex-shrink: 0; }
    .summary-value { color: #1A1A1A; font-weight: 500; }

    /* Responsive */
    @media (max-width: 520px) {
      .modal { border-radius: 20px; max-height: 96vh; }
      .modal-header { padding: 18px 20px 12px; }
      .modal-content { padding: 4px 20px 28px; }
      .modal-nav { padding: 16px 20px; }
      .step-title { font-size: 26px; }
      .field-row { grid-template-columns: 1fr; }
      .check-grid { grid-template-columns: 1fr; }
      .radio-group { flex-direction: column; }
      .media-group { grid-template-columns: 1fr; }
    }
  `;

  // ──────────────────────────────────────────────────────────────────────────
  // THEME OVERRIDES
  // ──────────────────────────────────────────────────────────────────────────

  // ── ROSÉ: Zartes Blush – warm Ivory, Dusty Rose, Cormorant, luftig ──
  const THEME_CSS_NACHT = `
    .overlay { background: rgba(80,40,50,0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
    .modal { background: #FDF2F4; border-radius: 22px; box-shadow: 0 32px 80px rgba(140,80,90,0.18), 0 2px 8px rgba(140,80,90,0.07); }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { background: #F5E0E4; height: 1px; }
    .progress-fill { background: linear-gradient(90deg, #C97A8C, #E0A0B0); border-radius: 1px; }

    .logo { font-family: 'Cormorant Garamond', serif; font-size: 14px; font-weight: 400; color: #B86878; letter-spacing: 0.16em; text-transform: uppercase; font-style: italic; }
    .close-btn { color: #D4A0AA; border-radius: 10px; }
    .close-btn:hover { background: #F5E0E4; color: #7A3040; border-radius: 10px; }

    .modal-content { scrollbar-color: #E0B0BA transparent; }
    .modal-content::-webkit-scrollbar-thumb { background: #E0B0BA; border-radius: 2px; }

    .step-title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: #5A2830; line-height: 1.05; letter-spacing: 0.01em; font-style: italic; }
    .step-subtitle { color: #C09098; font-size: 13px; line-height: 1.7; }
    .field-label { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; color: #C4909A; text-transform: uppercase; letter-spacing: 0.15em; }
    .field-label .req { color: #C97A8C; }

    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], textarea {
      background: #FFFFFF;
      border: 1px solid #EDD0D8;
      border-radius: 13px;
      color: #5A2830;
      padding: 14px 18px;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input::placeholder, textarea::placeholder { color: #E0C0C8; }
    input:focus, textarea:focus { border-color: #C97A8C; box-shadow: 0 0 0 3px rgba(201,122,140,0.1); outline: none; }
    input.err { border-color: #C97A8C; }
    select {
      background: #FFFFFF;
      border: 1px solid #EDD0D8;
      border-radius: 13px;
      color: #5A2830;
      padding: 14px 40px 14px 18px;
      font-size: 14px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23C4909A' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
    }
    select:focus { border-color: #C97A8C; outline: none; }
    select.err { border-color: #C97A8C; }

    .check-item { background: #FFFFFF; border: 1px solid #EDD0D8; border-radius: 13px; color: #C09098; transition: all 0.18s; }
    .check-item:hover { border-color: #C97A8C; background: #FFF8F9; color: #5A2830; }
    .check-item.checked { border-color: #C97A8C; background: rgba(201,122,140,0.07); color: #5A2830; }
    .check-item input[type="checkbox"] { accent-color: #C97A8C; }

    .radio-item { background: #FFFFFF; border: 1px solid #EDD0D8; border-radius: 13px; color: #C09098; }
    .radio-item:hover { border-color: #C97A8C; background: #FFF8F9; color: #5A2830; }
    .radio-item.checked { border-color: #C97A8C; background: #C97A8C; color: #FDF2F4; font-style: italic; font-family: 'Cormorant Garamond', serif; font-size: 14px; font-weight: 400; }

    .media-item { background: #FFFFFF; border: 1px solid #EDD0D8; border-radius: 14px; color: #C09098; }
    .media-item:hover { border-color: #C97A8C; background: #FFF8F9; color: #5A2830; }
    .media-item.checked { border-color: #C97A8C; background: rgba(201,122,140,0.08); color: #5A2830; }

    .unclear-row span { color: #C4909A; }
    .unclear-row input[type="checkbox"] { accent-color: #C97A8C; }

    .upload-area { border-color: #EDD0D8; border-radius: 14px; background: #FFFFFF; }
    .upload-area:hover { border-color: #C97A8C; background: #FFF8F9; }
    .upload-area.has-files { border-color: #C97A8C; background: rgba(201,122,140,0.04); }
    .upload-label { color: #C4909A; }
    .upload-label strong { color: #5A2830; }

    .divider { background: #F5E0E4; }
    .welcome-icon { background: rgba(201,122,140,0.1); border-radius: 50%; }
    .feature-list li { color: #C09098; }
    .feature-list li::before { content: '✦'; color: #C97A8C; font-size: 10px; margin-top: 3px; }

    .modal-nav { background: #FDF2F4; border-top: 1px solid #F5E0E4; }
    .btn-primary { background: #C97A8C; color: #FDF2F4; border-radius: 13px; font-weight: 400; font-size: 13px; letter-spacing: 0.06em; padding: 13px 28px; font-family: 'Cormorant Garamond', serif; font-style: italic; transition: all 0.2s; }
    .btn-primary:hover { background: #B86878; }
    .btn-primary:disabled { opacity: 0.35; }
    .btn-primary:disabled:hover { background: #C97A8C; }
    .btn-ghost { color: #D4A0AA; border: 1px solid #EDD0D8; border-radius: 13px; background: transparent; }
    .btn-ghost:hover { color: #5A2830; border-color: #C97A8C; }
    .step-counter { color: #E0C0C8; letter-spacing: 0.06em; }

    .thankyou-icon { background: rgba(201,122,140,0.1); border-radius: 50%; }
    .summary-card { background: #FFFFFF; border-color: #EDD0D8; border-radius: 14px; }
    .summary-card-title { color: #C4909A; letter-spacing: 0.12em; text-transform: uppercase; font-size: 9px; }
    .summary-row { border-bottom-color: #F8ECF0; }
    .summary-label { color: #C4909A; }
    .summary-value { color: #5A2830; font-weight: 400; }
  `;

  // ── LUNA: Cinematisch & Seidig – tiefschwarz, Cormorant, warmes Perlweiß ──
  const THEME_CSS_SAGE = `
    .overlay { background: rgba(0,0,0,0.92); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
    .modal { background: #0A0A0D; border-radius: 22px; box-shadow: 0 48px 120px rgba(0,0,0,0.95), inset 0 1px 0 rgba(200,184,160,0.08); }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { background: #151518; height: 1px; }
    .progress-fill { background: linear-gradient(90deg, #C8B8A0, #E8D8BC); border-radius: 1px; }

    .logo { font-family: 'Cormorant Garamond', serif; font-size: 14px; font-weight: 400; color: #C8B8A0; letter-spacing: 0.18em; text-transform: uppercase; font-style: italic; }
    .close-btn { color: #2A2A30; border-radius: 10px; }
    .close-btn:hover { background: #141418; color: #C8B8A0; border-radius: 10px; }

    .modal-content { scrollbar-color: #2A2A30 transparent; }
    .modal-content::-webkit-scrollbar-thumb { background: #2A2A30; border-radius: 2px; }

    .step-title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: #EAE0D4; line-height: 1.05; letter-spacing: 0.02em; font-style: italic; }
    .step-subtitle { color: #3A3840; font-size: 13px; line-height: 1.7; letter-spacing: 0.01em; }
    .field-label { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; color: #35333A; text-transform: uppercase; letter-spacing: 0.16em; }
    .field-label .req { color: #C8B8A0; }

    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], textarea {
      background: #111116;
      border: 1px solid #1E1E26;
      border-radius: 13px;
      color: #EAE0D4;
      padding: 14px 18px;
      font-size: 14px;
      transition: border-color 0.22s, background 0.22s;
    }
    input::placeholder, textarea::placeholder { color: #222228; }
    input:focus, textarea:focus { border-color: #C8B8A0; background: #13131A; outline: none; }
    input.err { border-color: #C8B8A0; }
    select {
      background: #111116;
      border: 1px solid #1E1E26;
      border-radius: 13px;
      color: #EAE0D4;
      padding: 14px 40px 14px 18px;
      font-size: 14px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23333338' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 14px center;
    }
    select:focus { border-color: #C8B8A0; outline: none; }
    select.err { border-color: #C8B8A0; }

    .check-item { background: #111116; border: 1px solid #1E1E26; border-radius: 13px; color: #3A3840; transition: all 0.2s; }
    .check-item:hover { border-color: #2A2A34; background: #131318; color: #C8B8A0; }
    .check-item.checked { border-color: #C8B8A0; background: rgba(200,184,160,0.06); color: #EAE0D4; }
    .check-item input[type="checkbox"] { accent-color: #C8B8A0; }

    .radio-item { background: #111116; border: 1px solid #1E1E26; border-radius: 13px; color: #3A3840; }
    .radio-item:hover { border-color: #2A2A34; color: #C8B8A0; }
    .radio-item.checked { border-color: #C8B8A0; background: rgba(200,184,160,0.1); color: #EAE0D4; font-style: italic; font-family: 'Cormorant Garamond', serif; font-size: 14px; font-weight: 400; }

    .media-item { background: #111116; border: 1px solid #1E1E26; border-radius: 14px; color: #3A3840; }
    .media-item:hover { border-color: #2A2A34; color: #C8B8A0; }
    .media-item.checked { border-color: #C8B8A0; background: rgba(200,184,160,0.07); color: #EAE0D4; }

    .unclear-row span { color: #35333A; }
    .unclear-row input[type="checkbox"] { accent-color: #C8B8A0; }

    .upload-area { border-color: #1A1A22; border-radius: 14px; background: #0D0D12; }
    .upload-area:hover { border-color: #C8B8A0; background: rgba(200,184,160,0.03); }
    .upload-area.has-files { border-color: #C8B8A0; background: rgba(200,184,160,0.04); }
    .upload-label { color: #35333A; }
    .upload-label strong { color: #C8B8A0; }

    .divider { background: #151518; }
    .welcome-icon { background: rgba(200,184,160,0.07); border-radius: 50%; }
    .feature-list li { color: #35333A; }
    .feature-list li::before { content: '·'; color: #C8B8A0; font-size: 18px; margin-top: -2px; }

    .modal-nav { background: #0A0A0D; border-top: 1px solid #151518; }
    .btn-primary { background: transparent; color: #EAE0D4; border: 1px solid #C8B8A0; border-radius: 13px; font-weight: 400; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; padding: 13px 28px; font-family: 'Inter', sans-serif; transition: all 0.22s; }
    .btn-primary:hover { background: #C8B8A0; color: #0A0A0D; }
    .btn-primary:disabled { opacity: 0.2; }
    .btn-primary:disabled:hover { background: transparent; color: #EAE0D4; }
    .btn-ghost { color: #2A2A34; border: 1px solid #1A1A22; border-radius: 13px; background: transparent; font-size: 12px; letter-spacing: 0.08em; }
    .btn-ghost:hover { color: #C8B8A0; border-color: #2A2A34; }
    .step-counter { color: #1E1E26; letter-spacing: 0.08em; }

    .thankyou-icon { background: rgba(200,184,160,0.07); border-radius: 50%; }
    .summary-card { background: #111116; border-color: #1E1E26; border-radius: 14px; }
    .summary-card-title { color: #35333A; letter-spacing: 0.12em; text-transform: uppercase; font-size: 9px; }
    .summary-row { border-bottom-color: #151518; }
    .summary-label { color: #35333A; }
    .summary-value { color: #EAE0D4; font-weight: 400; }
  `;

  // ── PAPIER: Editorial Stationery – warmes Ivory, Bodoni, Blush-Akzent ──
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

  // ── MODERN: Bold & Grafisch – navy, Outfit ExtraBold, Coral, Pill-Formen ──
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
  const ICON_RINGS =
    '<svg width="34" height="34" viewBox="0 0 60 60" fill="none" stroke="#C9A96E" stroke-width="2.5" stroke-linecap="round"><circle cx="22" cy="30" r="13"/><circle cx="38" cy="30" r="13"/></svg>';
  const ICON_CAMERA =
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';

  // ──────────────────────────────────────────────────────────────────────────
  // HTML (8 Steps)
  // ──────────────────────────────────────────────────────────────────────────
  const MODAL_HTML = `
    <div class="progress-bar"><div class="progress-fill" id="ea-progress"></div></div>
    <div class="modal-header">
      <span class="logo">einfach anfrage</span>
      <button class="close-btn" id="ea-close" aria-label="Schließen">${ICON_CLOSE}</button>
    </div>

    <div class="modal-content" id="ea-content">

      <!-- ── Step 1: Willkommen ── -->
      <div class="step active" data-step="1">
        <div class="welcome-icon">${ICON_CAMERA}</div>
        <h2 class="step-title">Herzlich<br>willkommen!</h2>
        <p class="step-subtitle">
          Damit wir euch und eure Vorstellungen für euren besonderen Tag<br>
          kennenlernen – ein paar Fragen, dauert nur <strong>3 Minuten</strong>.
        </p>
        <ul class="feature-list">
          <li>Alle Angaben auch als "noch unklar" beantwortbar</li>
          <li>Keine unerwünschten Abonnements oder Werbung</li>
          <li>Deine Daten werden nur an den Fotografen weitergeleitet</li>
        </ul>
        <button class="btn btn-primary btn-full" id="ea-start">Jetzt starten →</button>
      </div>

      <!-- ── Step 2: Euer großer Tag ── -->
      <div class="step" data-step="2">
        <h2 class="step-title">Euer großer Tag</h2>
        <p class="step-subtitle">Wann und wie lange – auch "noch unklar" ist eine gültige Antwort.</p>

        <div class="field">
          <label class="field-label" for="ea-date">Hochzeitsdatum <span class="req">*</span></label>
          <input type="date" id="ea-date" name="date">
          <label class="unclear-row" id="ea-date-unclear-wrap">
            <input type="checkbox" id="ea-date-unclear"> <span>Datum noch unklar</span>
          </label>
          <div class="err-msg" id="ea-date-err">Bitte ein Datum angeben oder "noch unklar" wählen.</div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-time">Uhrzeit der Trauung</label>
          <select id="ea-time" name="ceremonyTime">
            <option value="">– bitte wählen –</option>
            <option value="noch unklar">Noch unklar</option>
            <option value="09:00">09:00 Uhr</option>
            <option value="10:00">10:00 Uhr</option>
            <option value="11:00">11:00 Uhr</option>
            <option value="12:00">12:00 Uhr</option>
            <option value="13:00">13:00 Uhr</option>
            <option value="14:00">14:00 Uhr</option>
            <option value="15:00">15:00 Uhr</option>
            <option value="16:00">16:00 Uhr</option>
            <option value="17:00">17:00 Uhr</option>
            <option value="18:00">18:00 Uhr</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label" for="ea-duration">Ungefähre Dauer</label>
          <select id="ea-duration" name="duration">
            <option value="">– bitte wählen –</option>
            <option value="noch unklar">Noch unklar</option>
            <option value="Nur Trauung (~2h)">Nur Trauung (~2h)</option>
            <option value="Trauung + Feier (~6h)">Trauung + Feier (~6h)</option>
            <option value="Ganztag (~10h+)">Ganztag (~10h+)</option>
          </select>
        </div>
      </div>

      <!-- ── Step 3: Location ── -->
      <div class="step" data-step="3">
        <h2 class="step-title">Die Location</h2>
        <p class="step-subtitle">Wo feiert ihr? Mehrfachauswahl ist möglich.</p>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="ea-state">Bundesland</label>
            <select id="ea-state" name="state">
              <option value="">– wählen –</option>
              <option>Ausland / Destination</option>
              <option>Baden-Württemberg</option>
              <option>Bayern</option>
              <option>Berlin</option>
              <option>Brandenburg</option>
              <option>Bremen</option>
              <option>Hamburg</option>
              <option>Hessen</option>
              <option>Mecklenburg-Vorpommern</option>
              <option>Niedersachsen</option>
              <option>Nordrhein-Westfalen</option>
              <option>Rheinland-Pfalz</option>
              <option>Saarland</option>
              <option>Sachsen</option>
              <option>Sachsen-Anhalt</option>
              <option>Schleswig-Holstein</option>
              <option>Thüringen</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="ea-city">Stadt / Ort</label>
            <input type="text" id="ea-city" name="city" placeholder="z. B. München">
          </div>
        </div>

        <div class="field">
          <label class="field-label">Art der Location</label>
          <div class="check-grid" id="ea-location-types">
            <label class="check-item"><input type="checkbox" value="Standesamt"> Standesamt</label>
            <label class="check-item"><input type="checkbox" value="Kirche"> Kirche</label>
            <label class="check-item"><input type="checkbox" value="Freie Trauung"> Freie Trauung</label>
            <label class="check-item"><input type="checkbox" value="Schloss / Villa"> Schloss / Villa</label>
            <label class="check-item"><input type="checkbox" value="Hotel / Restaurant"> Hotel / Restaurant</label>
            <label class="check-item"><input type="checkbox" value="Weingut / Scheune"> Weingut / Scheune</label>
            <label class="check-item"><input type="checkbox" value="Outdoor / Natur"> Outdoor / Natur</label>
            <label class="check-item"><input type="checkbox" value="Strand / Wasser"> Strand / Wasser</label>
            <label class="check-item"><input type="checkbox" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Setting – drinnen oder draußen?</label>
          <div class="radio-group" id="ea-indoor-outdoor">
            <label class="radio-item"><input type="radio" name="indoorOutdoor" value="Hauptsächlich drinnen"> Drinnen</label>
            <label class="radio-item"><input type="radio" name="indoorOutdoor" value="Hauptsächlich draußen"> Draußen</label>
            <label class="radio-item"><input type="radio" name="indoorOutdoor" value="Drinnen & draußen"> Beides</label>
            <label class="radio-item"><input type="radio" name="indoorOutdoor" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Mehrere Locations an dem Tag?</label>
          <div class="radio-group" id="ea-multi-location">
            <label class="radio-item"><input type="radio" name="multiLocation" value="Ja"> Ja</label>
            <label class="radio-item"><input type="radio" name="multiLocation" value="Nein"> Nein</label>
            <label class="radio-item"><input type="radio" name="multiLocation" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-location-address">Adresse(n) der Location(s) <span style="font-weight:400;text-transform:none;letter-spacing:0;opacity:0.6;">(optional)</span></label>
          <textarea id="ea-location-address" name="locationAddress" rows="3" placeholder="z. B. Schloss Nymphenburg, Schlossrondell 1, 80638 München&#10;Bei mehreren Locations einfach untereinander eintragen."></textarea>
        </div>
      </div>

      <!-- ── Step 4: Leistungen ── -->
      <div class="step" data-step="4">
        <h2 class="step-title">Was soll festgehalten werden?</h2>
        <p class="step-subtitle">Foto, Video oder beides – und was soll alles dazu gehören?</p>

        <div class="field">
          <label class="field-label">Foto & Video <span class="req">*</span></label>
          <div class="media-group" id="ea-media-type">
            <label class="media-item">
              <input type="radio" name="mediaType" value="Nur Fotos">
              <span class="media-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
              <span>Nur Fotos</span>
            </label>
            <label class="media-item">
              <input type="radio" name="mediaType" value="Fotos + Video">
              <span class="media-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="3"/><polygon points="17,10 22,7 22,17 17,14" fill="currentColor" stroke="none" style="transform:scale(0.5) translate(14px,6px)"/></svg></span>
              <span>Fotos + Video</span>
            </label>
            <label class="media-item">
              <input type="radio" name="mediaType" value="Nur Video">
              <span class="media-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="23,7 16,12 23,17 23,7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></span>
              <span>Nur Video</span>
            </label>
          </div>
          <div class="err-msg" id="ea-media-err">Bitte eine Option wählen.</div>
        </div>

        <div class="field">
          <label class="field-label">Getting Ready dabei?</label>
          <div class="radio-group" id="ea-getting-ready">
            <label class="radio-item"><input type="radio" name="gettingReady" value="Ja, beide Partner"> Ja, beide</label>
            <label class="radio-item"><input type="radio" name="gettingReady" value="Ja, ein Partner"> Ja, einer</label>
            <label class="radio-item"><input type="radio" name="gettingReady" value="Nein"> Nein</label>
            <label class="radio-item"><input type="radio" name="gettingReady" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Zweiter Fotograf / Kameramann?</label>
          <div class="radio-group" id="ea-second-photographer">
            <label class="radio-item"><input type="radio" name="secondPhotographer" value="Ja"> Ja</label>
            <label class="radio-item"><input type="radio" name="secondPhotographer" value="Nein"> Nein</label>
            <label class="radio-item"><input type="radio" name="secondPhotographer" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Fotobuch / Album gewünscht?</label>
          <div class="radio-group" id="ea-album">
            <label class="radio-item"><input type="radio" name="album" value="Ja"> Ja</label>
            <label class="radio-item"><input type="radio" name="album" value="Nein"> Nein</label>
            <label class="radio-item"><input type="radio" name="album" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>
      </div>

      <!-- ── Step 5: Stil & Stimmung ── -->
      <div class="step" data-step="5">
        <h2 class="step-title">Stil &amp; Stimmung</h2>
        <p class="step-subtitle">Welchen Look wünscht ihr euch? Mehrfachauswahl möglich.</p>

        <div class="field">
          <label class="field-label" for="ea-guests">Anzahl Gäste</label>
          <select id="ea-guests" name="guestCount">
            <option value="">– bitte wählen –</option>
            <option value="Noch unklar">Noch unklar</option>
            <option value="unter 20 (Intim)">unter 20 (Intim)</option>
            <option value="20–50">20–50</option>
            <option value="50–100">50–100</option>
            <option value="100–150">100–150</option>
            <option value="über 150">über 150</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label">Gewünschter Stil</label>
          <div class="check-grid" id="ea-styles">
            <label class="check-item"><input type="checkbox" value="Reportage / Natürlich"> Reportage / Natürlich</label>
            <label class="check-item"><input type="checkbox" value="Romantisch & Inszeniert"> Romantisch & Inszeniert</label>
            <label class="check-item"><input type="checkbox" value="Modern & Editorial"> Modern & Editorial</label>
            <label class="check-item"><input type="checkbox" value="Klassisch & Elegant"> Klassisch & Elegant</label>
            <label class="check-item"><input type="checkbox" value="Fine Art"> Fine Art</label>
            <label class="check-item"><input type="checkbox" value="Dark & Moody"> Dark & Moody</label>
            <label class="check-item"><input type="checkbox" value="Boho / Verspielt"> Boho / Verspielt</label>
            <label class="check-item"><input type="checkbox" value="Hell & Luftig"> Hell & Luftig</label>
            <label class="check-item"><input type="checkbox" value="Vintage"> Vintage</label>
            <label class="check-item"><input type="checkbox" value="Klassisch & Zeitlos"> Klassisch & Zeitlos</label>
            <label class="check-item"><input type="checkbox" value="Filmisch / Analog"> Filmisch / Analog</label>
            <label class="check-item"><input type="checkbox" value="Schwarz-Weiß"> Schwarz-Weiß</label>
            <label class="check-item"><input type="checkbox" value="Farbenfroh & Lebendig"> Farbenfroh & Lebendig</label>
            <label class="check-item"><input type="checkbox" value="Luxuriös & Glamourös"> Luxuriös & Glamourös</label>
            <label class="check-item"><input type="checkbox" value="Clean & Minimalistisch"> Clean & Minimalistisch</label>
            <label class="check-item"><input type="checkbox" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-style-notes">Stil in eigenen Worten <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <textarea id="ea-style-notes" name="styleNotes" placeholder="z. B. „Ruhige Stimmung, nicht zu viel Inszenierung – lieber echte Momente als gestellte Posen.""></textarea>
        </div>

        <div class="field">
          <label class="field-label">Inspirationsbilder <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional · max. 3 Fotos)</span></label>
          <div class="upload-area" id="ea-upload-area">
            <input type="file" id="ea-file-input" accept="image/jpeg,image/png,image/webp" multiple>
            <div class="upload-label" id="ea-upload-label">
              <strong>Klicken zum Hochladen</strong> oder Bilder hierher ziehen<br>
              <span style="font-size:12px;color:#B0A898;">Zeigt dem Fotografen euren Wunsch-Look</span>
            </div>
            <div class="upload-previews" id="ea-upload-previews"></div>
          </div>
          <div class="upload-hint">JPG, PNG oder WEBP · max. 2 MB pro Bild · max. 3 Bilder</div>
          <div class="upload-err" id="ea-upload-err"></div>
          <div style="margin-top:10px;padding:10px 12px;background:rgba(201,169,110,0.08);border-left:3px solid #C9A96E;border-radius:0 6px 6px 0;font-size:11.5px;color:#8A8580;line-height:1.55;">
            <strong style="color:#6B5A3A;font-size:11.5px;">Hinweis:</strong> Bitte lade keine Fotos hoch, auf denen erkennbare Personen abgebildet sind, ohne deren ausdrückliche Einwilligung. Ausnahmen gelten für euch selbst als Brautpaar.
          </div>
        </div>
      </div>

      <!-- ── Step 6: Budget ── -->
      <div class="step" data-step="6">
        <h2 class="step-title">Budget &amp; Vorstellung</h2>
        <p class="step-subtitle">Keine Pflicht – aber es hilft uns, das passende Paket zu empfehlen.</p>

        <div class="field">
          <label class="field-label" for="ea-budget">Euer Budgetrahmen</label>
          <select id="ea-budget" name="budget">
            <option value="">– bitte wählen –</option>
            <option value="Noch unklar">Noch unklar</option>
            <option value="Möchte ich nicht angeben">Möchte ich nicht angeben</option>
            <option value="unter 1.000 €">unter 1.000 €</option>
            <option value="1.000–1.500 €">1.000–1.500 €</option>
            <option value="1.500–2.500 €">1.500–2.500 €</option>
            <option value="2.500–4.000 €">2.500–4.000 €</option>
            <option value="4.000–6.000 €">4.000–6.000 €</option>
            <option value="über 6.000 €">über 6.000 €</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label" for="ea-notes">Besondere Wünsche <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <textarea id="ea-notes" name="notes" placeholder="Was ist euch besonders wichtig? Gibt es spezielle Momente, Personen oder Ideen, die unbedingt festgehalten werden sollen?"></textarea>
        </div>
      </div>

      <!-- ── Step 7: Kontakt ── -->
      <div class="step" data-step="7">
        <h2 class="step-title">Wie können wir<br>euch erreichen?</h2>
        <p class="step-subtitle">Nur die E-Mail ist Pflicht – alles andere ist freiwillig.</p>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="ea-partner1">Vorname Partner 1</label>
            <input type="text" id="ea-partner1" name="partner1" placeholder="z. B. Sophie">
          </div>
          <div class="field">
            <label class="field-label" for="ea-partner2">Vorname Partner 2</label>
            <input type="text" id="ea-partner2" name="partner2" placeholder="z. B. Lisa">
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-email">E-Mail-Adresse <span class="req">*</span></label>
          <input type="email" id="ea-email" name="email" placeholder="eure@email.de">
          <div class="err-msg" id="ea-email-err">Bitte eine gültige E-Mail-Adresse eingeben.</div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-phone">Telefon <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <input type="tel" id="ea-phone" name="phone" placeholder="+49 176 …">
        </div>

        <div class="field">
          <label class="field-label" for="ea-found">Wie habt ihr uns gefunden?</label>
          <select id="ea-found" name="howFound">
            <option value="">– bitte wählen –</option>
            <option>Google</option>
            <option>Instagram</option>
            <option>Pinterest</option>
            <option>Empfehlung</option>
            <option>Hochzeitsportal</option>
            <option>Sonstiges</option>
          </select>
        </div>

        <div class="field" style="margin-top:4px;">
          <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;padding:12px 14px;border:1.5px solid var(--border,#E2DDD6);border-radius:9px;transition:border-color 0.15s;" id="ea-privacy-label">
            <input type="checkbox" id="ea-privacy-consent" style="margin-top:2px;flex-shrink:0;width:16px;height:16px;cursor:pointer;accent-color:#C9A96E;">
            <span style="font-size:12.5px;color:var(--text-mid,#6A6560);line-height:1.5;">
              Ich habe die <a href="${CONFIG.privacyUrl}" target="_blank" rel="noopener noreferrer" style="color:#C9A96E;text-decoration:underline;">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage durch <strong>${CONFIG.photographerName}</strong> zu. <span style="color:#C4917A;">*</span>
            </span>
          </label>
          <div class="err-msg" id="ea-privacy-err">Bitte die Datenschutzerklärung akzeptieren, um fortzufahren.</div>
        </div>
        <div id="ea-submit-err" style="display:none;margin-top:12px;padding:12px 14px;background:#FFF3F0;border:1px solid #F5C6BC;border-radius:8px;font-size:13px;color:#C0392B;line-height:1.5;">
          Es ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere uns direkt.
        </div>
      </div>

      <!-- ── Step 8: Bestätigung ── -->
      <div class="step" data-step="8">
        <div class="thankyou-wrap">
          <div class="thankyou-icon">${ICON_RINGS}</div>
          <h2 class="step-title">Vielen Dank!</h2>
          <p class="step-subtitle" id="ea-thankyou-text">
            <strong>${CONFIG.photographerName}</strong> meldet sich innerhalb von<br>
            <strong>48 Stunden</strong> bei euch.
          </p>
          <div class="summary-card" id="ea-summary"></div>
        </div>
      </div>

    </div><!-- /modal-content -->

    <div class="modal-nav" id="ea-nav">
      <button class="btn btn-ghost" id="ea-back" style="visibility:hidden;">← Zurück</button>
      <span class="step-counter" id="ea-counter"></span>
      <button class="btn btn-primary" id="ea-next">Weiter →</button>
    </div>
  `;

  // ──────────────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────────────
  const TOTAL_STEPS = 8;
  let currentStep = 1;
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

    // Date "noch unklar" toggle
    var dateInput   = shadowRoot.getElementById('ea-date');
    var dateUnclear = shadowRoot.getElementById('ea-date-unclear');
    dateUnclear.addEventListener('change', function () {
      dateInput.disabled = dateUnclear.checked;
      dateInput.style.opacity = dateUnclear.checked ? '0.4' : '1';
      if (dateUnclear.checked) dateInput.value = '';
    });

    // File upload
    initFileUpload();

    // Escape to close
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
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
      area.style.borderColor = '#C9A96E';
    });
    area.addEventListener('dragleave', function () {
      area.style.borderColor = uploadedFiles.length ? '#C9A96E' : '';
    });
    area.addEventListener('drop', function (e) {
      e.preventDefault();
      handleUploadFiles(Array.from(e.dataTransfer.files), previews, label, errEl);
    });
  }

  function handleUploadFiles(files, previews, label, errEl) {
    errEl.classList.remove('show');
    files.forEach(function (file) {
      if (uploadedFiles.length >= 3) { showUploadErr(errEl, 'Maximal 3 Bilder erlaubt.'); return; }
      if (!file.type.startsWith('image/')) { showUploadErr(errEl, 'Nur Bildformate erlaubt (JPG, PNG, WEBP).'); return; }
      if (file.size > 2 * 1024 * 1024) { showUploadErr(errEl, file.name + ' ist zu groß (max. 2 MB).'); return; }

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
      nextBtn.textContent = currentStep === 7 ? 'Abschicken ✓' : 'Weiter →';
      counter.textContent = 'Schritt ' + (currentStep - 1) + ' von 6';
    }
  }

  function updateProgress() {
    var pct = currentStep === 1 ? 0 : Math.round(((currentStep - 1) / 7) * 100);
    progressFill.style.width = pct + '%';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ──────────────────────────────────────────────────────────────────────────
  function validateStep(step) {
    clearErrors();

    if (step === 2) {
      var dateInput   = shadowRoot.getElementById('ea-date');
      var dateUnclear = shadowRoot.getElementById('ea-date-unclear');
      if (!dateUnclear.checked && !dateInput.value) {
        showError('ea-date-err', 'ea-date');
        return false;
      }
    }

    if (step === 4) {
      var mediaRadio = shadowRoot.querySelector('input[name="mediaType"]:checked');
      if (!mediaRadio) {
        showError('ea-media-err', null);
        return false;
      }
    }

    if (step === 7) {
      var emailInput = shadowRoot.getElementById('ea-email');
      var emailVal   = emailInput.value.trim();
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showError('ea-email-err', 'ea-email');
        return false;
      }
      var privacyCb = shadowRoot.getElementById('ea-privacy-consent');
      if (!privacyCb || !privacyCb.checked) {
        showError('ea-privacy-err', null);
        var lbl = shadowRoot.getElementById('ea-privacy-label');
        if (lbl) lbl.style.borderColor = '#C4917A';
        return false;
      }
      if (privacyCb) {
        privacyCb.addEventListener('change', function () {
          var lbl = shadowRoot.getElementById('ea-privacy-label');
          if (lbl) lbl.style.borderColor = privacyCb.checked ? '#C9A96E' : 'var(--border,#E2DDD6)';
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

  // ──────────────────────────────────────────────────────────────────────────
  // COLLECT FORM DATA
  // ──────────────────────────────────────────────────────────────────────────
  function collectFormData() {
    var dateEl        = shadowRoot.getElementById('ea-date');
    var dateUnclearEl = shadowRoot.getElementById('ea-date-unclear');
    var dateUnclear   = dateUnclearEl.checked;

    var locationTypes = [];
    shadowRoot.querySelectorAll('#ea-location-types input:checked').forEach(function (cb) {
      locationTypes.push(cb.value);
    });

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
      wedding: {
        date:         dateUnclear ? null : (dateEl.value || null),
        dateUnclear:  dateUnclear,
        ceremonyTime: shadowRoot.getElementById('ea-time').value || null,
        duration:     shadowRoot.getElementById('ea-duration').value || null,
      },
      location: {
        state:             shadowRoot.getElementById('ea-state').value || null,
        city:              shadowRoot.getElementById('ea-city').value.trim() || null,
        types:             locationTypes,
        indoorOutdoor:     getVal('indoorOutdoor'),
        multipleLocations: getVal('multiLocation'),
        address:           shadowRoot.getElementById('ea-location-address').value.trim() || null,
      },
      services: {
        mediaType:         getVal('mediaType'),
        gettingReady:      getVal('gettingReady'),
        secondPhotographer: getVal('secondPhotographer'),
        album:             getVal('album'),
      },
      style: {
        guestCount:  shadowRoot.getElementById('ea-guests').value || null,
        styles:      styles,
        styleNotes:  shadowRoot.getElementById('ea-style-notes').value.trim() || null,
        inspirationImages: uploadedFiles.map(function (f) {
          return { name: f.name, data: f.data };
        }),
      },
      budget: {
        range: shadowRoot.getElementById('ea-budget').value || null,
        notes: shadowRoot.getElementById('ea-notes').value.trim() || null,
      },
      contact: {
        partner1:        shadowRoot.getElementById('ea-partner1').value.trim() || null,
        partner2:        shadowRoot.getElementById('ea-partner2').value.trim() || null,
        email:           shadowRoot.getElementById('ea-email').value.trim(),
        phone:           shadowRoot.getElementById('ea-phone').value.trim() || null,
        howFound:        shadowRoot.getElementById('ea-found').value || null,
        consentGiven:    true,
        consentGivenAt:  new Date().toISOString(),
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SUBMIT
  // ──────────────────────────────────────────────────────────────────────────
  async function submitForm() {
    nextBtn.disabled    = true;
    nextBtn.textContent = 'Wird gesendet…';

    try {
      formData = collectFormData();

      // Strip image data for the main API call to keep payload small
      var payloadForApi = JSON.parse(JSON.stringify(formData));
      payloadForApi.style.inspirationImageCount = uploadedFiles.length;
      delete payloadForApi.style.inspirationImages;

      var res = await fetch(CONFIG.apiUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payloadForApi),
      });
      if (!res.ok) throw new Error('API error ' + res.status);

      var resData = await res.json();
      var submissionId = resData.id;

      // Upload inspiration images separately to storage
      if (uploadedFiles.length > 0 && submissionId) {
        var uploadBase = CONFIG.apiUrl.replace('/submissions', '');
        for (var i = 0; i < uploadedFiles.length; i++) {
          try {
            await fetch(uploadBase + '/upload', {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              body:    JSON.stringify({
                submissionId: submissionId,
                imageData:    uploadedFiles[i].data,
                imageName:    uploadedFiles[i].name,
                imageType:    uploadedFiles[i].type,
              }),
            });
          } catch (imgErr) {
            console.warn('[EinfachAnfrage] Bild-Upload fehlgeschlagen:', imgErr.message);
          }
        }
      }

      if (CONFIG.webhookUrl) {
        fetch(CONFIG.webhookUrl, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payloadForApi),
        }).catch(function () {});
      }

      nextBtn.disabled    = false;
      nextBtn.textContent = 'Weiter →';
      showThankYou();
    } catch (err) {
      console.error('[EinfachAnfrage] Fehler:', err);
      nextBtn.disabled    = false;
      nextBtn.textContent = 'Erneut versuchen →';
      var submitErr = shadowRoot.getElementById('ea-submit-err');
      if (submitErr) submitErr.style.display = 'block';
    }
  }

  function showThankYou() {
    buildSummary();
    goToStep(8);
  }

  function buildSummary() {
    var fd = formData;
    if (!fd) return;
    var summary = shadowRoot.getElementById('ea-summary');
    if (!summary) return;

    var weddingDate = fd.wedding.dateUnclear
      ? 'Noch unklar'
      : (fd.wedding.date ? formatDate(fd.wedding.date) : 'Noch unklar');

    var rows = [
      ['Datum',      weddingDate],
      ['Ort',        [fd.location.city, fd.location.state].filter(Boolean).join(', ') || '–'],
      ['Leistung',   fd.services.mediaType || '–'],
      ['Stil',       fd.style.styles.length ? fd.style.styles.join(', ') : '–'],
      ['Budget',     fd.budget.range || '–'],
      ['E-Mail',     fd.contact.email],
    ];

    summary.innerHTML = '<div class="summary-card-title">Eure Zusammenfassung</div>' +
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
    if (currentStep === 7) {
      submitForm();
    } else if (currentStep < 7) {
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
      var dateInput = shadowRoot.getElementById('ea-date');
      if (dateInput) { dateInput.disabled = false; dateInput.style.opacity = '1'; }
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
