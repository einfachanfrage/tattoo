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
  };

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
      <button class="close-btn" id="ea-close" aria-label="Schließen">${ICON_CLOSE}</button>
    </div>

    <div class="modal-content" id="ea-content">

      <!-- ── Step 1: Willkommen ── -->
      <div class="step active" data-step="1">
        <div class="welcome-icon">${ICON_NEEDLE}</div>
        <h2 class="step-title">Tattoo-Anfrage<br>stellen</h2>
        <p class="step-subtitle">
          Damit ${CONFIG.photographerName} dir ein passendes Angebot machen kann –
          ein paar kurze Fragen, dauert nur <strong>3 Minuten</strong>.
        </p>
        <ul class="feature-list">
          <li>Fast alles kann auch mit „Noch unklar" beantwortet werden</li>
          <li>Kein Account, keine Werbung</li>
          <li>Deine Daten gehen nur an ${CONFIG.photographerName}</li>
        </ul>
        <button class="btn btn-primary btn-full" id="ea-start">Jetzt starten →</button>
      </div>

      <!-- ── Step 2: Motiv & Ort ── -->
      <div class="step" data-step="2">
        <h2 class="step-title">Dein Motiv</h2>
        <p class="step-subtitle">Was soll gestochen werden – und wo?</p>

        <div class="field">
          <label class="field-label" for="ea-motif-desc">Was stellst du dir vor? <span class="req">*</span></label>
          <textarea id="ea-motif-desc" name="motifDesc" rows="3" placeholder="z. B. „Fine-Line Rosen, eher zart und filigran""></textarea>
          <div class="err-msg" id="ea-motif-err">Bitte kurz beschreiben, was du dir vorstellst.</div>
        </div>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="ea-placement">Körperstelle</label>
            <select id="ea-placement" name="placement">
              <option value="">– bitte wählen –</option>
              <option>Unterarm</option>
              <option>Oberarm</option>
              <option>Schulter / Schulterblatt</option>
              <option>Brust / Sternum</option>
              <option>Rücken</option>
              <option>Rippen / Seite</option>
              <option>Bauch</option>
              <option>Hüfte / Hüftknochen</option>
              <option>Oberschenkel</option>
              <option>Unterschenkel / Schienbein</option>
              <option>Knöchel / Fuß</option>
              <option>Hand / Finger</option>
              <option>Hals / Nacken</option>
              <option>Kopf</option>
              <option>Noch unklar</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="ea-size">Ungefähre Größe</label>
            <select id="ea-size" name="size">
              <option value="">– bitte wählen –</option>
              <option value="Klein (bis 5 cm)">Klein (bis 5 cm)</option>
              <option value="Mittel (5–10 cm)">Mittel (5–10 cm)</option>
              <option value="Groß (10–20 cm)">Groß (10–20 cm)</option>
              <option value="Sehr groß / Sleeve (über 20 cm)">Sehr groß / Sleeve (über 20 cm)</option>
              <option value="Noch unklar">Noch unklar</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Cover-Up?</label>
          <div class="radio-group" id="ea-coverup">
            <label class="radio-item"><input type="radio" name="isCoverUp" value="Nein"> Nein</label>
            <label class="radio-item"><input type="radio" name="isCoverUp" value="Ja"> Ja, Cover-Up</label>
            <label class="radio-item"><input type="radio" name="isCoverUp" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field" id="ea-coverup-notes-wrap" style="display:none;">
          <label class="field-label" for="ea-coverup-notes">Das bestehende Tattoo <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <textarea id="ea-coverup-notes" name="coverUpNotes" placeholder="Farbe, Größe und Stil des alten Tattoos."></textarea>
        </div>
      </div>

      <!-- ── Step 3: Stil & Referenzen ── -->
      <div class="step" data-step="3">
        <h2 class="step-title">Stil &amp; Referenzen</h2>
        <p class="step-subtitle">Welchen Stil suchst du? Mehrfachauswahl möglich.</p>

        <div class="field">
          <label class="field-label">Tattoo-Stil</label>
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
            <label class="check-item"><input type="checkbox" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Farbe oder Schwarz-Grau?</label>
          <div class="radio-group" id="ea-color-pref">
            <label class="radio-item"><input type="radio" name="colorPreference" value="Schwarz-Grau"> Schwarz-Grau</label>
            <label class="radio-item"><input type="radio" name="colorPreference" value="Farbe"> Farbe</label>
            <label class="radio-item"><input type="radio" name="colorPreference" value="Beides möglich"> Beides möglich</label>
            <label class="radio-item"><input type="radio" name="colorPreference" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Referenzbilder <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional · max. 3 Fotos)</span></label>
          <div class="upload-area" id="ea-upload-area">
            <input type="file" id="ea-file-input" accept="image/jpeg,image/png,image/webp" multiple>
            <div class="upload-label" id="ea-upload-label">
              <strong>Klicken zum Hochladen</strong> oder Bilder hierher ziehen<br>
              <span style="font-size:12px;color:#B0A898;">Screenshots, Pinterest-Pins, Fotos von Tattoos, die dir gefallen</span>
            </div>
            <div class="upload-previews" id="ea-upload-previews"></div>
          </div>
          <div class="upload-hint">JPG, PNG oder WEBP · max. 2 MB pro Bild · max. 3 Bilder</div>
          <div class="upload-err" id="ea-upload-err"></div>
        </div>
      </div>

      <!-- ── Step 4: Termin & Budget ── -->
      <div class="step" data-step="4">
        <h2 class="step-title">Termin &amp; Budget</h2>
        <p class="step-subtitle">Ungefähr reicht – kein verbindlicher Termin.</p>

        <div class="field">
          <label class="field-label" for="ea-timeframe">Wunsch-Zeitraum</label>
          <select id="ea-timeframe" name="timeframe">
            <option value="">– bitte wählen –</option>
            <option value="So bald wie möglich">So bald wie möglich</option>
            <option value="In 1–3 Monaten">In 1–3 Monaten</option>
            <option value="In 3–6 Monaten">In 3–6 Monaten</option>
            <option value="In 6–12 Monaten">In 6–12 Monaten</option>
            <option value="Kein fester Zeitdruck">Kein fester Zeitdruck</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label">Bevorzugte Tageszeit</label>
          <div class="radio-group" id="ea-preferred-time">
            <label class="radio-item"><input type="radio" name="preferredTime" value="Vormittags"> Vormittags</label>
            <label class="radio-item"><input type="radio" name="preferredTime" value="Nachmittags"> Nachmittags</label>
            <label class="radio-item"><input type="radio" name="preferredTime" value="Abends"> Abends</label>
            <label class="radio-item"><input type="radio" name="preferredTime" value="Keine Präferenz"> Keine Präferenz</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-budget">Dein Budgetrahmen</label>
          <select id="ea-budget" name="budget">
            <option value="">– bitte wählen –</option>
            <option value="Noch unklar">Noch unklar</option>
            <option value="Möchte ich nicht angeben">Möchte ich nicht angeben</option>
            <option value="unter 150 €">unter 150 €</option>
            <option value="150–300 €">150–300 €</option>
            <option value="300–500 €">300–500 €</option>
            <option value="500–800 €">500–800 €</option>
            <option value="800–1.500 €">800–1.500 €</option>
            <option value="über 1.500 €">über 1.500 €</option>
          </select>
        </div>
      </div>

      <!-- ── Step 5: Deine Haut ── -->
      <div class="step" data-step="5">
        <h2 class="step-title">Deine Haut</h2>
        <p class="step-subtitle">Hilft beim Vorbereiten der Session – alles freiwillig.</p>

        <div class="field">
          <label class="field-label">Ist das dein erstes Tattoo?</label>
          <div class="radio-group" id="ea-first-tattoo">
            <label class="radio-item"><input type="radio" name="isFirstTattoo" value="Ja"> Ja</label>
            <label class="radio-item"><input type="radio" name="isFirstTattoo" value="Nein"> Nein</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Bekannte Allergien oder Hautunverträglichkeiten?</label>
          <div class="radio-group" id="ea-allergies">
            <label class="radio-item"><input type="radio" name="knownAllergies" value="Nein"> Nein</label>
            <label class="radio-item"><input type="radio" name="knownAllergies" value="Ja"> Ja</label>
            <label class="radio-item"><input type="radio" name="knownAllergies" value="Nicht sicher"> Nicht sicher</label>
          </div>
        </div>

        <div class="field" id="ea-allergies-detail-wrap" style="display:none;">
          <label class="field-label" for="ea-allergies-detail">Welche Allergien oder Unverträglichkeiten? <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <textarea id="ea-allergies-detail" name="allergiesDetail" placeholder="z. B. Nickelallergie, empfindliche Haut, Neurodermitis …"></textarea>
        </div>
      </div>

      <!-- ── Step 6: Kontakt ── -->
      <div class="step" data-step="6">
        <h2 class="step-title">Wie können wir<br>dich erreichen?</h2>
        <p class="step-subtitle">Nur die E-Mail ist Pflicht – alles andere ist freiwillig.</p>

        <div class="field">
          <label class="field-label" for="ea-name">Dein Name</label>
          <input type="text" id="ea-name" name="name" placeholder="z. B. Mia Müller">
        </div>

        <div class="field">
          <label class="field-label" for="ea-email">E-Mail-Adresse <span class="req">*</span></label>
          <input type="email" id="ea-email" name="email" placeholder="deine@email.de">
          <div class="err-msg" id="ea-email-err">Bitte eine gültige E-Mail-Adresse eingeben.</div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-phone">Telefon <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <input type="tel" id="ea-phone" name="phone" placeholder="+49 176 …">
        </div>

        <div class="field">
          <label class="field-label" for="ea-instagram">Instagram-Handle <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <input type="text" id="ea-instagram" name="instagram" placeholder="@deinname">
        </div>

        <div class="field">
          <label class="field-label" for="ea-found">Wie hast du uns gefunden?</label>
          <select id="ea-found" name="howFound">
            <option value="">– bitte wählen –</option>
            <option>Instagram</option>
            <option>Google</option>
            <option>TikTok</option>
            <option>Empfehlung</option>
            <option>Walk-In</option>
            <option>Pinterest</option>
            <option>Sonstiges</option>
          </select>
        </div>

        <div class="field" style="margin-top:4px;">
          <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;padding:12px 14px;border:1.5px solid #D1CDC7;border-radius:9px;transition:border-color 0.15s;" id="ea-privacy-label">
            <input type="checkbox" id="ea-privacy-consent" style="margin-top:2px;flex-shrink:0;width:16px;height:16px;cursor:pointer;accent-color:#BF7A60;">
            <span style="font-size:12.5px;color:#6B6B6B;line-height:1.5;">
              Ich habe die <a href="${CONFIG.privacyUrl}" target="_blank" rel="noopener noreferrer" style="color:#BF7A60;text-decoration:underline;">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung meiner Anfrage durch <strong>${CONFIG.photographerName}</strong> zu. <span style="color:#BF7A60;">*</span>
            </span>
          </label>
          <div class="err-msg" id="ea-privacy-err">Bitte die Datenschutzerklärung akzeptieren, um fortzufahren.</div>
        </div>
        <div id="ea-submit-err" style="display:none;margin-top:12px;padding:12px 14px;background:#FFF3F0;border:1px solid #F5C6BC;border-radius:8px;font-size:13px;color:#C0392B;line-height:1.5;">
          Es ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere uns direkt.
        </div>
      </div>

      <!-- ── Step 7: Bestätigung ── -->
      <div class="step" data-step="7">
        <div class="thankyou-wrap">
          <div class="thankyou-icon">${ICON_DONE}</div>
          <h2 class="step-title">Vielen Dank!</h2>
          <p class="step-subtitle" id="ea-thankyou-text">
            <strong>${CONFIG.photographerName}</strong> meldet sich innerhalb von<br>
            <strong>48 Stunden</strong> bei dir.
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
  const TOTAL_STEPS = 7;
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
      nextBtn.textContent = currentStep === 6 ? 'Abschicken ✓' : 'Weiter →';
      counter.textContent = 'Schritt ' + (currentStep - 1) + ' von 5';
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
    nextBtn.textContent = 'Wird gesendet …';

    try {
      formData = collectFormData();

      // Strip image data for the main API call to keep payload small
      var payloadForApi = JSON.parse(JSON.stringify(formData));
      payloadForApi.style.inspirationImageCount = uploadedFiles.length;
      if (payloadForApi.style) delete payloadForApi.style.inspirationImages;

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
    goToStep(7);
  }

  function buildSummary() {
    var fd = formData;
    if (!fd) return;
    var summary = shadowRoot.getElementById('ea-summary');
    if (!summary) return;

    var rows = [
      ['Motiv',        (fd.motif && fd.motif.description) ? fd.motif.description.substring(0, 60) + (fd.motif.description.length > 60 ? '…' : '') : '–'],
      ['Körperstelle', (fd.motif && fd.motif.placement) || '–'],
      ['Stil',         (fd.style && fd.style.styles && fd.style.styles.length) ? fd.style.styles.join(', ') : '–'],
      ['Termin',       (fd.appointment && fd.appointment.timeframe) || '–'],
      ['Budget',       (fd.budget && fd.budget.range) || '–'],
      ['E-Mail',       fd.contact.email],
    ];

    summary.innerHTML = '<div class="summary-card-title">Deine Zusammenfassung</div>' +
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

