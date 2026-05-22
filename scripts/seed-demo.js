'use strict';
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  'https://qsdbnckgzllyypmkmzhc.supabase.co',
  'sb_publishable_9b82gGlLFMq8dHfg4Evxkg_ZHW6iEf2'
);

const now = new Date();
function daysAgo(d) { return new Date(now - d * 86400000).toISOString(); }

const submissions = [
  {
    id: crypto.randomUUID(),
    photographer_slug: 'demo',
    status: 'neu',
    created_at: daysAgo(0.3),
    data: {
      status: 'neu', createdAt: daysAgo(0.3), photographerSlug: 'demo',
      motif: { description: 'Eine japanische Koi-Karpfen Szene mit Lotusblumen und Wasserwellen. Der Karpfen soll in kräftigen Farben gestaltet sein, mit viel Bewegung und Energie.', placement: 'Oberschenkel außen', size: 'Groß (20–30 cm)', isCoverUp: 'Nein', coverUpNotes: '' },
      style: { styles: ['Japanese / Irezumi', 'Realistisch'], colorPreference: 'Farbe', styleNotes: 'Traditionelles japanisches Design, satte Farben, klare Outlines', inspirationImages: ['https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=400', 'https://images.unsplash.com/photo-1554873082-5b16ec2dc064?w=400'], inspirationImageCount: 2 },
      health: { isFirstTattoo: 'Nein', knownAllergies: 'Nein', allergiesDetail: '' },
      appointment: { timeframe: 'In 1–3 Monaten', preferredTime: 'Nachmittags' },
      budget: { range: '500–800 €', notes: 'Bin flexibel wenn das Design passt' },
      contact: { name: 'Lena Hoffmann', email: 'lena.hoffmann@gmail.com', phone: '0176 23847291', instagram: '@lena.ink', howFound: 'Instagram', consentGiven: true, consentGivenAt: daysAgo(0.3) }
    }
  },
  {
    id: crypto.randomUUID(),
    photographer_slug: 'demo',
    status: 'neu',
    created_at: daysAgo(1.2),
    data: {
      status: 'neu', createdAt: daysAgo(1.2), photographerSlug: 'demo',
      motif: { description: 'Kleines minimalistisches Herz mit dünner Line-Art Technik. Simpel, clean, zeitlos.', placement: 'Handgelenk innen', size: 'Klein (bis 5 cm)', isCoverUp: 'Nein', coverUpNotes: '' },
      style: { styles: ['Fine Line', 'Minimalistisch'], colorPreference: 'Schwarz/Grau', styleNotes: '', inspirationImages: [], inspirationImageCount: 0 },
      health: { isFirstTattoo: 'Ja', knownAllergies: 'Nicht sicher', allergiesDetail: 'Leichte Nickelallergie bekannt, nicht sicher ob das relevant ist' },
      appointment: { timeframe: 'So bald wie möglich', preferredTime: 'Egal' },
      budget: { range: 'Unter 150 €', notes: '' },
      contact: { name: 'Jonas Weber', email: 'j.weber94@web.de', phone: '', instagram: '', howFound: 'Google', consentGiven: true, consentGivenAt: daysAgo(1.2) }
    }
  },
  {
    id: crypto.randomUUID(),
    photographer_slug: 'demo',
    status: 'in_bearbeitung',
    created_at: daysAgo(3.5),
    data: {
      status: 'in_bearbeitung', createdAt: daysAgo(3.5), photographerSlug: 'demo',
      motif: { description: 'Portrait meiner verstorbenen Katze Luna. Schwarz-weiß, hyperrealistisch. Ich habe mehrere gute Fotos als Referenz.', placement: 'Unterarm außen', size: 'Mittel (10–20 cm)', isCoverUp: 'Nein', coverUpNotes: '' },
      style: { styles: ['Realistisch', 'Portrait'], colorPreference: 'Schwarz/Grau', styleNotes: 'So realistisch wie möglich, die Textur des Fells soll spürbar sein', inspirationImages: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'], inspirationImageCount: 1 },
      health: { isFirstTattoo: 'Nein', knownAllergies: 'Nein', allergiesDetail: '' },
      appointment: { timeframe: 'In 1–3 Monaten', preferredTime: 'Morgens' },
      budget: { range: '300–500 €', notes: 'Qualität ist wichtiger als Preis' },
      contact: { name: 'Sophie Bauer', email: 'sophie.bauer@outlook.com', phone: '0151 98372641', instagram: '@sophiebauer_art', howFound: 'Empfehlung', consentGiven: true, consentGivenAt: daysAgo(3.5) }
    }
  },
  {
    id: crypto.randomUUID(),
    photographer_slug: 'demo',
    status: 'in_bearbeitung',
    created_at: daysAgo(5),
    data: {
      status: 'in_bearbeitung', createdAt: daysAgo(5), photographerSlug: 'demo',
      motif: { description: 'Sleeve-Konzept: Natur-Thema mit Mond, Wölfen und Kiefernwald. Dark & mystisch, kein Kitsch.', placement: 'Oberarm / ganzer Arm', size: 'Sehr groß (Sleeve / Full Piece)', isCoverUp: 'Nein', coverUpNotes: '' },
      style: { styles: ['Blackwork', 'Illustrativ'], colorPreference: 'Schwarz/Grau', styleNotes: 'Inspiriert von nordischer Mythologie, düster und kraftvoll', inspirationImages: ['https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=400', 'https://images.unsplash.com/photo-1565766286662-b74f0a01d9f3?w=400', 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=400'], inspirationImageCount: 3 },
      health: { isFirstTattoo: 'Nein', knownAllergies: 'Nein', allergiesDetail: '' },
      appointment: { timeframe: 'In 3–6 Monaten', preferredTime: 'Nachmittags' },
      budget: { range: 'Über 1.500 €', notes: 'Mehrere Sessions eingeplant, Budget kein Problem' },
      contact: { name: 'Maximilian Krause', email: 'max.krause@protonmail.com', phone: '0179 44512893', instagram: '@maxkrause_wolf', howFound: 'Instagram', consentGiven: true, consentGivenAt: daysAgo(5) }
    }
  },
  {
    id: crypto.randomUUID(),
    photographer_slug: 'demo',
    status: 'beauftragt',
    created_at: daysAgo(8),
    data: {
      status: 'beauftragt', createdAt: daysAgo(8), photographerSlug: 'demo',
      motif: { description: 'Botanische Illustration – Pfingstrose mit feinen Details, zartes Aquarell-Feeling', placement: 'Rippen / Seite', size: 'Mittel (10–20 cm)', isCoverUp: 'Nein', coverUpNotes: '' },
      style: { styles: ['Fine Line', 'Watercolor', 'Botanisch'], colorPreference: 'Farbe', styleNotes: 'Zart und feminin, pastellige Farbtöne, viel Weißraum', inspirationImages: ['https://images.unsplash.com/photo-1490750967868-88df5691cc93?w=400'], inspirationImageCount: 1 },
      health: { isFirstTattoo: 'Nein', knownAllergies: 'Nein', allergiesDetail: '' },
      appointment: { timeframe: 'In 1–3 Monaten', preferredTime: 'Nachmittags' },
      budget: { range: '300–500 €', notes: '' },
      contact: { name: 'Mia Schneider', email: 'mia.schneider@gmail.com', phone: '0160 77293847', instagram: '@mia.blossoms', howFound: 'Instagram', consentGiven: true, consentGivenAt: daysAgo(8) }
    }
  },
  {
    id: crypto.randomUUID(),
    photographer_slug: 'demo',
    status: 'beauftragt',
    created_at: daysAgo(12),
    data: {
      status: 'beauftragt', createdAt: daysAgo(12), photographerSlug: 'demo',
      motif: { description: 'Cover-Up eines alten Tribals vom Knöchel. War ein Jugendfehler, soll jetzt in etwas Schönes verwandelt werden. Tribal ist ca. 8x6cm, dunkel und verwaschen.', placement: 'Knöchel / Fuß', size: 'Mittel (10–20 cm)', isCoverUp: 'Ja', coverUpNotes: 'Alter schwarzer Tribal, ca. 8x6cm, schon leicht verblasst. Wünsche mir eine florale Überdeckung.' },
      style: { styles: ['Realistisch', 'Botanisch', 'Fine Line'], colorPreference: 'Farbe', styleNotes: 'Blumen die den Tribal komplett verdecken', inspirationImages: [], inspirationImageCount: 0 },
      health: { isFirstTattoo: 'Nein', knownAllergies: 'Nein', allergiesDetail: '' },
      appointment: { timeframe: 'So bald wie möglich', preferredTime: 'Egal' },
      budget: { range: '300–500 €', notes: '' },
      contact: { name: 'Anna Müller', email: 'anna.mueller88@t-online.de', phone: '0162 55839201', instagram: '', howFound: 'Google', consentGiven: true, consentGivenAt: daysAgo(12) }
    }
  },
  {
    id: crypto.randomUUID(),
    photographer_slug: 'demo',
    status: 'archiviert',
    created_at: daysAgo(21),
    data: {
      status: 'archiviert', createdAt: daysAgo(21), photographerSlug: 'demo',
      motif: { description: 'Schriftzug "Carpe Diem" in Kursivschrift, schlicht', placement: 'Schlüsselbein', size: 'Klein (bis 5 cm)', isCoverUp: 'Nein', coverUpNotes: '' },
      style: { styles: ['Schrift / Lettering'], colorPreference: 'Schwarz/Grau', styleNotes: 'Klassische Kursive, keine Schnörkel', inspirationImages: [], inspirationImageCount: 0 },
      health: { isFirstTattoo: 'Ja', knownAllergies: 'Nein', allergiesDetail: '' },
      appointment: { timeframe: 'In 1–3 Monaten', preferredTime: 'Morgens' },
      budget: { range: '150–300 €', notes: '' },
      contact: { name: 'Tom Fischer', email: 'tomfischer@gmx.de', phone: '', instagram: '', howFound: 'Freundesempfehlung', consentGiven: true, consentGivenAt: daysAgo(21) }
    }
  }
];

async function run() {
  for (const s of submissions) {
    const { error } = await supabase.from('inquiries').insert(s);
    if (error) console.error('FEHLER:', s.data.contact.name, '-', error.message);
    else console.log('OK:', s.data.contact.name, '|', s.status);
  }
  console.log('Fertig!');
}
run();
