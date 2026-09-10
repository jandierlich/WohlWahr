/* ======================================================================
   ReflexWahr — Nachschlagewerk zu Fuß- & Handreflexzonenmassage
   Informations- und Wellness-App. Die Zuordnung von Reflexzonen zu
   Organen ist ein traditionelles/alternatives Konzept und wissenschaftlich
   nicht ausreichend belegt. Kein Ersatz für ärztliche Diagnose/Behandlung.
   Enthält als Bonus-Feature den Handlinien-Scan (reine Unterhaltung).
   ====================================================================== */

const STATE = {
  screen: (new URLSearchParams(location.search)).get('screen') || 'start',
  zoneType: 'foot',           // 'foot' | 'hand'
  activeRegionId: null,
  openSubzoneId: null,
  massageTab: 'grundlagen',   // 'grundlagen' | 'fuss' | 'hand' | 'weitere' | 'hilfsmittel' | 'hinweise'
  searchQuery: '',
  // Bonus-Scan (HandWahr)
  scanStep: 'intro',          // 'intro' | 'analyzing' | 'result'
  originalCanvas: null,
  analyzedCanvas: null,
  scanResult: null,
  analyzeStatusIdx: 0,
  analyzeProgress: 0,
  analyzeTimer: null,
  // Favoriten, Notizen, Checklisten
  favorites: [],              // Array von Keys "type:regionId:subId"
  notes: {},                  // { key: text }
  checklistMode: { fuss:false, hand:false },
  checklistDone: { fuss:{}, hand:{} },
};

/* ---------------------------------------------------------------------
   Icon-Bibliothek
   --------------------------------------------------------------------- */
const ICON = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  warn: '<path d="M12 2 22 20H2L12 2z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/>',
  shield: '<path d="M12 2 4 5v6c0 5.5 3.4 9.7 8 11 4.6-1.3 8-5.5 8-11V5l-8-3z"/>',
  scroll: '<path d="M8 21h9a2 2 0 0 0 2-2v-2H9v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v1h4"/><path d="M19 17V5a2 2 0 0 0-2-2H8"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/>',
  foot: '<path d="M9 3c-1.4 0-2.3 1.3-2 2.7l1 4.6c.3 1.5-.2 3-1.4 4L4.8 16c-1.3 1.2-1.6 3.1-.7 4.6.9 1.5 2.8 2.1 4.4 1.3l2.7-1.3c1.6-.8 3.5-.8 5.1 0 1.5.7 3.3.2 4.2-1.2.9-1.4.6-3.3-.7-4.4l-1.2-1c-1-.9-1.6-2.2-1.6-3.5V6c0-1.7-1.3-3-3-3H9z"/>',
  hand: '<path d="M8 12.5V4.8a1.5 1.5 0 0 1 3 0V11"/><path d="M11 11V3.6a1.5 1.5 0 0 1 3 0V11"/><path d="M14 11.3V5.8a1.5 1.5 0 0 1 3 0V13"/><path d="M17 13v-2a1.5 1.5 0 0 1 3 0v5.5c0 3.6-2.6 6.1-6.1 6.1h-1.6c-2.2 0-3.5-.8-4.8-2.6L4.9 16c-.6-.9-.4-2 .4-2.6.8-.6 2-.4 2.6.5L9.5 16"/>',
  spa: '<path d="M12 21c4.5 0 7-3 7-7 0-3-2-5.5-3.5-7C14.5 8 13 10 12 10s-2.5-2-3.5-4C7 7.5 5 10 5 13c0 4 2.5 7 7 7z"/>',
  wave: '<path d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  drop: '<path d="M12 3s6 6.4 6 11a6 6 0 1 1-12 0c0-4.6 6-11 6-11z"/>',
  hands2: '<path d="M11 13V6a1.5 1.5 0 0 1 3 0v6"/><path d="M8 21c-2 0-3.5-1.2-4.4-3L2 14.5c-.5-1 0-2.2 1-2.6.9-.4 2 0 2.5 1L7 15"/><path d="M16 21c2 0 3.5-1.2 4.4-3l1.6-3.5c.5-1 0-2.2-1-2.6-.9-.4-2 0-2.5 1L17 15"/><path d="M8 21h8"/>',
  circleWave: '<path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z"/><path d="M8 12c1-2 2-2 3 0s2 2 3 0"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  glossary: '<path d="M6 4h13v16l-4-2-4 2-4-2-1 .5V4z"/><path d="M9 8h7"/><path d="M9 12h7"/>',
  ball: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16"/><path d="M12 4c2.5 2.2 2.5 13.8 0 16"/>',
  roller: '<rect x="3" y="9" width="18" height="6" rx="3"/><path d="M3 12h18"/>',
  bottle: '<path d="M10 2h4v3l2 2v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V7l2-2z"/><path d="M9 11h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  sparkle: '<path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="m5.6 5.6 2.8 2.8"/><path d="m15.6 15.6 2.8 2.8"/><path d="m18.4 5.6-2.8 2.8"/><path d="m8.4 15.6-2.8 2.8"/>',
  camera: '<path d="M4 8h3l1.6-2.4A1 1 0 0 1 9.4 5h5.2a1 1 0 0 1 .8.6L16.9 8H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
  life: '<path d="M12 22c5-3 8-7 8-12a8 8 0 0 0-16 0c0 5 3 9 8 12z"/><path d="M9 11.5 11 13.5 15.5 9"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
  star: '<path d="m12 3 2.6 5.9 6.4.6-4.8 4.3 1.4 6.2-5.6-3.3-5.6 3.3 1.4-6.2-4.8-4.3 6.4-.6z"/>',
  ear: '<path d="M17 6a5 5 0 0 0-10 0c0 2 1 3 1 5a3 3 0 0 0 3 3"/><path d="M12 4a4 4 0 0 1 4 4c0 1.5-.7 2-1.5 2.7-.6.5-1.5 1-1.5 2.3a2 2 0 0 1-2 2"/><path d="M7 11c0 5 3 9 7 10"/>',
  printer: '<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M6 17v4h12v-4"/>',
  play: '<path d="M7 5v14l11-7z"/>',
  pause: '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>',
  reset: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
};
function svg(name, size=18){ return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[name]||''}</svg>`; }
function escapeHtml(str){
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* =======================================================================
   ZONEN-DATEN — hierarchisch: 8 Hauptregionen je Fuß/Hand, mit Unterzonen
   ======================================================================= */
const FOOT_REGIONS = [
  { id:'kopf', label:'Kopfbereich', area:'Zehen', x:140, y:48,
    intro:'Die fünf Zehen bilden in der Reflexzonenlehre den Kopfbereich ab — vom großen Zeh (Kopf/Gehirn) bis zu den kleinen Zehen (Augen, Ohren).',
    subzones:[
      { id:'kopf-gehirn', label:'Kopf & Gehirn', text:'Zugeordnet der Spitze des großen Zehs. Traditionell mit allgemeinem Wohlbefinden im Kopfbereich in Verbindung gebracht.' },
      { id:'kopf-nebenhoehlen', label:'Nebenhöhlen', text:'Liegt an den Außenseiten aller Zehen. Wird oft bei der Selbstmassage als Ausklang der „Kopf-Zehen" mitbehandelt.' },
      { id:'kopf-augen', label:'Augen', text:'Zugeordnet dem Ansatz des zweiten und dritten Zehs (direkt neben dem großen Zeh).' },
      { id:'kopf-ohren', label:'Ohren', text:'Zugeordnet dem Ansatz des vierten und fünften Zehs (kleiner Zeh).' },
      { id:'kopf-zaehne', label:'Zähne & Kiefer', text:'Liegt am oberen, vorderen Bereich der Zehenrücken — wird seltener gezielt einbezogen, gehört aber klassisch zur Kopfzone.' },
    ]},
  { id:'schulter', label:'Schulter & Nacken', area:'Zehengrundgelenke', x:140, y:98,
    intro:'Der Übergang von den Zehen zum Ballen steht für den Schulter-Nacken-Bereich — bei vielen Menschen im Alltag eine besonders verspannte Region.',
    subzones:[
      { id:'schulter-nacken', label:'Nacken / Halswirbelsäule', text:'Liegt an der Basis des großen Zehs, am Übergang zum Fußballen.' },
      { id:'schulter-gelenk', label:'Schultergelenk', text:'Liegt am äußeren Rand des Fußes, auf Höhe des kleinen Zehs-Grundgelenks.' },
      { id:'schulter-schilddruese', label:'Schilddrüse', text:'Liegt im Bogen unterhalb des großen Zehs, quer über den oberen Ballen.' },
    ]},
  { id:'lunge', label:'Lunge & Brustkorb', area:'oberer Ballen', x:140, y:148,
    intro:'Der breite, obere Bereich des Fußballens wird dem Brustkorb zugeordnet.',
    subzones:[
      { id:'lunge-bronchien', label:'Lunge & Bronchien', text:'Nimmt den größten Teil des oberen Ballens ein, beidseitig.' },
      { id:'lunge-zwerchfell', label:'Brustkorb / Zwerchfell', text:'Liegt am unteren Rand des Ballens, wie eine quer verlaufende Linie — markiert traditionell den Übergang zum Solarplexus.' },
    ]},
  { id:'herz', label:'Herz & Solarplexus', area:'Ballenmitte, betont am linken Fuß', x:108, y:178,
    intro:'Herz und Solarplexus (Sonnengeflecht) liegen in der Mitte des Ballens — die Herzzone wird traditionell am linken Fuß stärker gewichtet.',
    subzones:[
      { id:'herz-herz', label:'Herz', side:'Betont am linken Fuß', text:'Liegt links etwas ausgeprägter, da das Herz anatomisch links im Körper liegt. Am rechten Fuß nur als kleinere Nebenzone geführt.' },
      { id:'herz-solar', label:'Solarplexus', text:'Liegt mittig, direkt unterhalb der Ballenzone. Wird oft mit „innerer Anspannung" oder Nervosität assoziiert und gern zum Abschluss sanft gehalten statt geknetet.' },
    ]},
  { id:'verdauung', label:'Magen, Leber & Bauchspeicheldrüse', area:'oberer Mittelfuß', x:155, y:213,
    intro:'Im oberen Mittelfußbereich liegen die Verdauungsorgane — mit deutlichem Unterschied zwischen linkem und rechtem Fuß.',
    subzones:[
      { id:'verd-magen', label:'Magen', text:'Liegt mittig im oberen Mittelfuß, an beiden Füßen ähnlich vertreten.' },
      { id:'verd-leber', label:'Leber & Galle', side:'Betont am rechten Fuß', text:'Die Leber liegt anatomisch rechts — entsprechend wird diese Zone am rechten Fuß deutlich größer geführt als am linken.' },
      { id:'verd-milz', label:'Milz', side:'Nur am linken Fuß', text:'Die Milz liegt anatomisch links, daher wird diese Zone nur am linken Fuß verortet.' },
      { id:'verd-bauchspeichel', label:'Bauchspeicheldrüse', text:'Liegt mittig, zwischen Magen- und Nierenzone, an beiden Füßen.' },
    ]},
  { id:'nieren', label:'Nieren, Nebennieren & Darm', area:'Fußmitte / Wölbung', x:130, y:268,
    intro:'Die Fußmitte und die Wölbung stehen für die Ausscheidungsorgane und den Darm.',
    subzones:[
      { id:'nieren-niere', label:'Nieren', text:'Liegt mittig in der Fußwölbung, symmetrisch an beiden Füßen.' },
      { id:'nieren-neben', label:'Nebennieren', text:'Liegt direkt oberhalb der Nierenzone, etwas kleiner.' },
      { id:'nieren-duenndarm', label:'Dünndarm', text:'Nimmt einen breiten Bereich im unteren Mittelfuß ein.' },
      { id:'nieren-dickdarm', label:'Dickdarm', side:'Verlauf unterscheidet sich links/rechts', text:'Der Verlauf folgt dem tatsächlichen Dickdarmverlauf im Körper — am rechten Fuß beginnt er (aufsteigender Teil, inkl. Blinddarm), am linken Fuß endet er (absteigender Teil).' },
    ]},
  { id:'wirbel', label:'Wirbelsäule', area:'gesamter Innenrand', x:66, y:250,
    intro:'Der gesamte Innenrand des Fußes bildet — vom großen Zeh bis zur Ferse — den Verlauf der Wirbelsäule ab.',
    subzones:[
      { id:'wirbel-hws', label:'Halswirbelsäule (HWS)', text:'Liegt direkt am Innenrand des großen Zehs.' },
      { id:'wirbel-bws', label:'Brustwirbelsäule (BWS)', text:'Liegt im mittleren Abschnitt des Innenrands, auf Höhe des Ballens.' },
      { id:'wirbel-lws', label:'Lendenwirbelsäule (LWS)', text:'Liegt im Innenrand-Abschnitt der Fußwölbung.' },
      { id:'wirbel-kreuzbein', label:'Kreuz- & Steißbein', text:'Liegt am unteren Ende des Innenrands, kurz vor der Ferse.' },
    ]},
  { id:'becken', label:'Becken, Blase & unterer Rücken', area:'Ferse', x:132, y:393,
    intro:'Die Ferse gilt als Zone für Becken, Blase und den unteren Rücken — ein Bereich, der bei der Selbstmassage oft als besonders fest empfunden wird.',
    subzones:[
      { id:'becken-blase', label:'Blase', text:'Liegt am Innenrand, direkt vor der Ferse.' },
      { id:'becken-ischias', label:'Becken & Ischias', text:'Nimmt den Hauptteil der Ferse ein.' },
      { id:'becken-lymph', label:'Lymphsystem', text:'Wird im Bereich der Knöchel und Zehenzwischenräume verortet — oft mit leichten, streichenden Bewegungen einbezogen.' },
    ]},
  { id:'aussenrand', label:'Außenrand (Arme & Gelenke)', area:'äußerer Fußrand', x:211, y:300,
    intro:'Der gesamte Außenrand des Fußes — vom kleinen Zeh bis zur Ferse — wird ergänzend Arm und Gelenken zugeordnet.',
    subzones:[
      { id:'aussen-schulter', label:'Schulter (außen)', text:'Liegt am äußeren Rand im oberen Drittel — ergänzend zur Schulterzone an der Zehengrundlinie.' },
      { id:'aussen-ellenbogen', label:'Ellenbogen', text:'Liegt am äußeren Rand, knapp unterhalb der Schulterzone.' },
      { id:'aussen-huefte', label:'Hüfte', text:'Liegt am äußeren Rand, im unteren Drittel des Fußes.' },
      { id:'aussen-knie', label:'Knie', text:'Liegt am äußeren Rand, nahe der Ferse.' },
    ]},
  { id:'innenrand-unten', label:'Innenrand (Becken, unten)', area:'innerer Fußrand, nahe der Ferse', x:48, y:378,
    intro:'Der untere Abschnitt des Innenrands, kurz vor der Ferse, wird ergänzend dem Beckenbereich zugeordnet.',
    subzones:[
      { id:'innen-becken', label:'Becken (innen)', text:'Liegt am Innenrand, kurz vor der Ferse — ergänzend zur Beckenzone an der Ferse selbst.' },
    ]},
];

const HAND_REGIONS = [
  { id:'kopf', label:'Kopfbereich', area:'Finger & Daumen', x:135, y:58,
    intro:'Die Finger und der Daumen bilden den Kopfbereich ab — der Daumen für Kopf/Gehirn, die übrigen Finger für Augen, Ohren und Nebenhöhlen.',
    subzones:[
      { id:'kopf-gehirn', label:'Kopf & Gehirn', text:'Zugeordnet der Daumenspitze.' },
      { id:'kopf-nebenhoehlen', label:'Nebenhöhlen', text:'Liegt an den Seiten aller Finger, besonders an den Fingerkuppen.' },
      { id:'kopf-augen', label:'Augen', text:'Zugeordnet dem Ansatz von Zeige- und Mittelfinger.' },
      { id:'kopf-ohren', label:'Ohren', text:'Zugeordnet dem Ansatz von Ring- und kleinem Finger.' },
      { id:'kopf-zaehne', label:'Zähne & Kiefer', text:'Liegt am oberen Bereich der Fingerrücken, wird seltener gezielt einbezogen.' },
    ]},
  { id:'schulter', label:'Schulter & Nacken', area:'Fingergrundgelenke', x:140, y:122,
    intro:'Am Übergang von den Fingern zum Handteller liegt die Zone für Schulter und Nacken.',
    subzones:[
      { id:'schulter-nacken', label:'Nacken / Halswirbelsäule', text:'Liegt am Übergang vom Daumen zum Handteller.' },
      { id:'schulter-gelenk', label:'Schultergelenk', text:'Liegt am äußeren Handrand, auf Höhe des kleinen Fingers.' },
      { id:'schulter-schilddruese', label:'Schilddrüse', text:'Liegt im oberen Handteller, unterhalb des Daumenansatzes.' },
    ]},
  { id:'lunge', label:'Lunge & Brust', area:'oberer Handteller', x:140, y:160,
    intro:'Der obere Bereich des Handtellers steht für Lunge, Bronchien und Brustkorb.',
    subzones:[
      { id:'lunge-bronchien', label:'Lunge & Bronchien', text:'Nimmt den oberen Handteller-Bereich beidseitig ein.' },
      { id:'lunge-zwerchfell', label:'Brustkorb / Zwerchfell', text:'Markiert den Übergang zur Handtellermitte.' },
    ]},
  { id:'herz', label:'Herz', area:'unter dem Ringfinger, betont an der linken Hand', x:168, y:183,
    intro:'Die Herzzone liegt unter Ring- und kleinem Finger und wird an der linken Hand stärker gewichtet.',
    subzones:[
      { id:'herz-herz', label:'Herz', side:'Betont an der linken Hand', text:'Liegt unter dem Ansatz von Ring- und kleinem Finger, an der linken Hand deutlicher ausgeprägt.' },
      { id:'herz-solar', label:'Solarplexus', text:'Liegt mittig im oberen Handteller, unterhalb der Lungenzone.' },
    ]},
  { id:'verdauung', label:'Magen, Leber & Verdauung', area:'Handtellermitte', x:122, y:222,
    intro:'Die Mitte des Handtellers steht für Magen, Leber, Galle, Milz und Bauchspeicheldrüse.',
    subzones:[
      { id:'verd-magen', label:'Magen', text:'Liegt zentral in der Handtellermitte.' },
      { id:'verd-leber', label:'Leber & Galle', side:'Betont an der rechten Hand', text:'Liegt an der rechten Hand ausgeprägter, entsprechend der anatomischen Lage der Leber.' },
      { id:'verd-milz', label:'Milz', side:'Nur an der linken Hand', text:'Wird nur an der linken Hand als eigene Zone geführt.' },
      { id:'verd-bauchspeichel', label:'Bauchspeicheldrüse', text:'Liegt zwischen Magen- und Nierenzone.' },
    ]},
  { id:'nieren', label:'Nieren', area:'unterer Handteller', x:122, y:270,
    intro:'Im unteren Handteller, oberhalb des Handgelenks, liegt die Zone für die Nieren und angrenzende Organe.',
    subzones:[
      { id:'nieren-niere', label:'Nieren', text:'Liegt mittig im unteren Handteller.' },
      { id:'nieren-neben', label:'Nebennieren', text:'Liegt direkt oberhalb der Nierenzone.' },
      { id:'nieren-duenndarm', label:'Dünndarm', text:'Nimmt einen breiten Bereich im unteren Handteller ein.' },
      { id:'nieren-dickdarm', label:'Dickdarm', side:'Verlauf unterscheidet sich links/rechts', text:'Verläuft analog zum Fuß — rechts der aufsteigende, links der absteigende Dickdarmabschnitt.' },
    ]},
  { id:'wirbel', label:'Wirbelsäule', area:'Daumenballenkante', x:72, y:228,
    intro:'Die Kante des Daumenballens, vom Daumen bis zum Handgelenk, bildet den Verlauf der Wirbelsäule ab.',
    subzones:[
      { id:'wirbel-hws', label:'Halswirbelsäule (HWS)', text:'Liegt direkt am Übergang vom Daumen zur Handkante.' },
      { id:'wirbel-bws', label:'Brustwirbelsäule (BWS)', text:'Liegt im mittleren Abschnitt der Daumenballenkante.' },
      { id:'wirbel-lws', label:'Lendenwirbelsäule (LWS)', text:'Liegt im unteren Abschnitt der Daumenballenkante.' },
      { id:'wirbel-kreuzbein', label:'Kreuz- & Steißbein', text:'Liegt am Übergang zum Handgelenk.' },
    ]},
  { id:'becken', label:'Becken & unterer Rücken', area:'Handwurzel / Handgelenk', x:122, y:333,
    intro:'Der Übergang zum Handgelenk gilt als Zone für Becken und unteren Rücken.',
    subzones:[
      { id:'becken-blase', label:'Blase', text:'Liegt am Innenrand, kurz vor dem Handgelenk.' },
      { id:'becken-ischias', label:'Becken & Ischias', text:'Nimmt den Hauptteil der Handwurzel ein.' },
      { id:'becken-huefte', label:'Hüfte & Knie', text:'Liegt am äußeren Rand der Handwurzel.' },
      { id:'becken-lymph', label:'Lymphsystem', text:'Wird im Bereich zwischen den Fingern verortet, oft mit leichten Streichbewegungen einbezogen.' },
    ]},
];

const EAR_REGIONS = [
  { id:'kopf', label:'Kopfbereich', area:'Ohrläppchen', x:150, y:335,
    intro:'Das Ohrläppchen wird — ähnlich wie die Zehen und Finger — dem Kopfbereich zugeordnet.',
    subzones:[
      { id:'kopf-gesicht', label:'Kopf & Gesicht', text:'Liegt in der Mitte des Ohrläppchens.' },
      { id:'kopf-zaehne', label:'Zähne & Kiefer', text:'Liegt am oberen Rand des Ohrläppchens, nahe dem Übergang zur Ohrmuschel.' },
    ]},
  { id:'nacken', label:'Nacken & Schultern', area:'oberer Ohransatz', x:190, y:120,
    intro:'Am oberen, äußeren Ohrrand — dort, wo das Ohr am Kopf ansetzt — liegt die Zone für Nacken und Schultern.',
    subzones:[
      { id:'nacken-nacken', label:'Nacken', text:'Liegt direkt am oberen Ohransatz.' },
      { id:'nacken-schulter', label:'Schultern', text:'Liegt etwas weiter außen, am oberen äußeren Ohrrand.' },
    ]},
  { id:'arme', label:'Arme & Hände', area:'äußerer oberer Ohrrand', x:210, y:170,
    intro:'Der äußere Rand im oberen Ohrbereich wird Armen und Händen zugeordnet.',
    subzones:[
      { id:'arme-arm', label:'Arme', text:'Liegt am äußeren Ohrrand, oberhalb der Mitte.' },
      { id:'arme-hand', label:'Hände', text:'Liegt etwas weiter oben, näher am oberen Ohrrand.' },
    ]},
  { id:'wirbel', label:'Wirbelsäule', area:'geschwungener Rand in der Ohrmitte', x:135, y:150,
    intro:'Der geschwungene, etwas erhabene Rand in der Ohrmitte wird als Verlaufslinie der Wirbelsäule gedeutet — ähnlich wie der Innenrand am Fuß.',
    subzones:[
      { id:'wirbel-wirbel', label:'Wirbelsäule (gesamt)', text:'Verläuft geschwungen durch die Ohrmitte, vom oberen zum unteren Bereich.' },
    ]},
  { id:'organe', label:'Innere Organe', area:'Vertiefung der Ohrmuschel', x:150, y:205,
    intro:'Die Vertiefung in der Ohrmuschel — der mittlere, muldenförmige Bereich — wird den inneren Organen zugeordnet.',
    subzones:[
      { id:'organe-lunge', label:'Lunge & Herz', text:'Liegt im oberen Teil der Ohrmuschel-Vertiefung.' },
      { id:'organe-magen', label:'Magen & Verdauung', text:'Liegt im unteren Teil der Ohrmuschel-Vertiefung, näher am Gehörgang.' },
    ]},
  { id:'becken', label:'Becken & Beine', area:'oberer innerer Ohrbereich', x:185, y:95,
    intro:'Der obere, innen liegende Bereich des Ohrs wird Becken und Beinen zugeordnet.',
    subzones:[
      { id:'becken-becken', label:'Becken', text:'Liegt im oberen inneren Ohrbereich.' },
      { id:'becken-bein', label:'Beine & Knie', text:'Liegt direkt daneben, etwas weiter außen.' },
    ]},
];

/* =======================================================================
   MASSAGE-RATGEBER — Grundlagen
   ======================================================================= */
const GRUNDGRIFFE = [
  { icon:'wave', name:'Streichung (Effleurage)', text:'Sanfte, gleitende Bewegungen mit der flachen Hand oder den Daumen — zum Einstieg und Ausklang jeder Massage, wärmt das Gewebe an und baut Vertrauen zur Berührung auf.' },
  { icon:'hands2', name:'Knetung (Petrissage)', text:'Kreisende, knetende Bewegungen mit Daumen oder Fingern, meist etwas kräftiger als die Streichung — löst Verspannungen im Gewebe und regt die Durchblutung an.' },
  { icon:'circleWave', name:'Reibung (Friktion)', text:'Kleine, kreisende Bewegungen mit punktuellem Druck, oft mit dem Daumen — wird gezielt auf einzelnen Zonen angewendet, um dort intensiver zu arbeiten.' },
  { icon:'drop', name:'Klopfung (Tapotement)', text:'Leichtes, rhythmisches Klopfen mit den Fingerkuppen — eher anregend und belebend, wird meist kurz und sanft eingesetzt.' },
  { icon:'spa', name:'Vibration', text:'Feines, schnelles Vibrieren an einer Stelle, oft zum Abschluss einer Zone — wirkt eher lösend und beruhigend, gut geeignet zum Ausklingen.' },
];

const VORBEREITUNG = [
  'Ruhigen Moment wählen, Handy stumm schalten, angenehme Raumtemperatur.',
  'Bequem sitzen, sodass Fuß oder Hand ohne Verrenkung erreichbar sind (z. B. im Schneidersitz oder mit dem Fuß auf dem gegenüberliegenden Knie).',
  'Etwas Öl oder Creme in den Händen verreiben, damit die Hände gut über die Haut gleiten und keine Reibung entsteht.',
  'Vor der Anwendung kurz die Hinweise zur Vorsicht im Reiter „Hinweise" prüfen.',
];

const DRUCK_SKALA = [
  { level:1, label:'Sehr sanft', desc:'Nur Auflegen und leichtes Streichen — geeignet zum Einstieg, bei empfindlichen Zonen oder zur Beruhigung.' },
  { level:2, label:'Leicht', desc:'Spürbarer, aber sehr milder Druck — für die meisten Streichbewegungen passend.' },
  { level:3, label:'Mittel', desc:'Deutlich spürbarer Druck, sollte aber immer angenehm bleiben — Standard für die meisten Knetgriffe.' },
  { level:4, label:'Kräftig', desc:'Für feste Bereiche wie Ferse oder Handwurzel, kurz und gezielt eingesetzt.' },
  { level:5, label:'Sehr kräftig', desc:'Nur für sehr robuste Stellen und nur, wenn es sich weiterhin gut anfühlt — bei Unsicherheit lieber eine Stufe niedriger bleiben.' },
];

const NACHSORGE = [
  'Nach der Massage ausreichend Wasser trinken, das unterstützt den Körper beim „Verarbeiten".',
  'Ein paar Minuten ruhen oder die behandelten Bereiche warmhalten (z. B. Socken anziehen).',
  'Leichte Müdigkeit oder ein Wärmegefühl direkt nach der Massage sind normal und klingen meist rasch ab.',
  'Bei ungewöhnlichen oder anhaltenden Beschwerden nach der Anwendung ärztlichen Rat einholen.',
];

const FUSS_SCHRITTE = [
  { title:'Vorbereitung', text:'Etwas Öl oder Creme in den Händen verreiben, bequem sitzen, Fuß gut erreichbar ablegen.' },
  { title:'Ausstreichen', text:'Die ganze Fußsohle mehrmals mit beiden Daumen von der Ferse zu den Zehen sanft ausstreichen — zum Ankommen und Anwärmen (Druckstufe 1–2).' },
  { title:'Zehen durchkneten', text:'Jede Zehe einzeln zwischen Daumen und Zeigefinger sanft kneten, leicht drehen und kurz in die Länge ziehen.' },
  { title:'Kopfzone bearbeiten', text:'Mit dem Daumen jede Zehenspitze kurz kreisend massieren (Kopfbereich).' },
  { title:'Schulter-Nacken-Linie', text:'Mit dem Daumen entlang der Zehengrundgelenke von innen nach außen streichen (Druckstufe 2–3).' },
  { title:'Ballen bearbeiten', text:'Mit kreisenden Daumenbewegungen den gesamten Ballen (Lunge, Herz, Schultern) Stück für Stück abtasten (Druckstufe 2–3).' },
  { title:'Mittelfuß kneten', text:'Mit den Fingerknöcheln oder dem Daumen in kleinen Kreisen über die Verdauungszonen im oberen Mittelfuß wandern.' },
  { title:'Fußwölbung bearbeiten', text:'Die Wölbung (Nieren, Darm) mit sanftem bis mittlerem Druck kreisend durchkneten, besonders keine Stelle auslassen.' },
  { title:'Innenrand nachfahren', text:'Mit dem Daumen langsam von der großen Zehe bis zur Ferse am Innenrand entlangfahren (Wirbelsäulen-Zone).' },
  { title:'Ferse kneten', text:'Die Ferse mit etwas mehr Druck kreisend kneten, da diese Zone meist fester ist (Druckstufe 3–4).' },
  { title:'Abschluss', text:'Zum Abschluss den ganzen Fuß noch einmal sanft ausstreichen, kurz warmhalten und ausklingen lassen.' },
];

const HAND_SCHRITTE = [
  { title:'Vorbereitung', text:'Etwas Creme oder Öl in die Hände einmassieren, Ellenbogen locker auf einer Unterlage abstützen.' },
  { title:'Handrücken lockern', text:'Mit der anderen Hand den Handrücken sanft ausstreichen, um die Hand zu entspannen (Druckstufe 1–2).' },
  { title:'Finger durchkneten', text:'Jeden Finger einzeln von der Wurzel zur Spitze zwischen Daumen und Zeigefinger durchkneten und sanft drehen.' },
  { title:'Kopfzone bearbeiten', text:'Daumenspitze und Fingerkuppen kurz kreisend massieren (Kopfbereich, Nebenhöhlen).' },
  { title:'Handteller oben', text:'Mit dem Daumen der anderen Hand den oberen Handteller (Schulter, Lunge, Herz) in kleinen Kreisen bearbeiten.' },
  { title:'Handteller Mitte', text:'Die Verdauungszonen in der Handtellermitte mit mittlerem Druck kreisend durchkneten.' },
  { title:'Daumenballenkante', text:'Die Kante des Daumenballens von oben nach unten langsam nachfahren (Wirbelsäulen-Zone).' },
  { title:'Handwurzel massieren', text:'Den Bereich zum Handgelenk hin mit kreisenden Bewegungen etwas kräftiger massieren (Druckstufe 3).' },
  { title:'Abschluss', text:'Beide Hände kurz ineinander verschränken, sanft gegeneinander drücken, dann lockern und ausschütteln.' },
];

const WEITERE_BEREICHE = [
  { title:'Nacken & Schultern (im Sitzen)', icon:'spa',
    steps:[
      'Beide Hände auf die Schultern legen und den Trapezmuskel (zwischen Schulter und Nacken) sanft kneten.',
      'Mit den Fingerspitzen kleine Kreise am Übergang von Nacken zu Schulter machen.',
      'Kopf langsam zur einen Seite neigen, mit der Gegenhand den entstehenden gedehnten Bereich vorsichtig ausstreichen — dann Seite wechseln.',
      'Zum Abschluss beide Schultern noch einmal kurz kräftig kneten und lockern.',
    ]},
  { title:'Kopf & Schläfen', icon:'bulb',
    steps:[
      'Mit den Fingerkuppen in kleinen Kreisen über die gesamte Kopfhaut wandern, wie beim Haarewaschen.',
      'Die Schläfen mit zwei Fingern sanft kreisend massieren.',
      'Mit den Daumen von der Nasenwurzel entlang der Augenbrauen nach außen streichen.',
      'Zum Abschluss den Nacken-Haaransatz sanft ausstreichen.',
    ]},
];

const HILFSMITTEL = [
  { icon:'ball', name:'Igel-/Noppenball', text:'Kleiner Ball mit Noppen, ideal zum Ausrollen der Fußsohle auf dem Boden — gut für unterwegs oder zwischendurch, ganz ohne Handeinsatz.' },
  { icon:'roller', name:'Massageroller', text:'Roller mit mehreren Walzen für Hände oder Füße, eignet sich für gleichmäßigen Druck über eine größere Fläche.' },
  { icon:'ball', name:'Fußreflexzonen-Stab', text:'Kleiner Holz- oder Kunststoffstab mit abgerundeter Spitze, mit dem sich einzelne Zonen gezielter und mit weniger Kraftaufwand für die eigenen Finger bearbeiten lassen.' },
  { icon:'bottle', name:'Massageöl / -creme', text:'Neutrales Pflanzenöl (z. B. Mandel- oder Jojobaöl) oder eine Massagecreme sorgen für ein gutes Gleiten und schonen die Haut — auf mögliche Unverträglichkeiten achten.' },
];

const KONTRAINDIKATIONEN = {
  absolut:[
    'Frische Verletzungen, Entzündungen oder offene Stellen an Fuß oder Hand',
    'Wenn du dich akut krank oder fiebrig fühlst',
    'Starke, unklare Schmerzen im betroffenen Bereich',
  ],
  relativ:[
    'In der Schwangerschaft, bei ernsthaften Vorerkrankungen oder wenn du unsicher bist: vorher lieber mit einer Ärztin oder einem Arzt sprechen',
    'Bei empfindlicher Haut oder brüchigen Knochen: nur mit sehr leichtem Druck arbeiten',
  ],
};

/* =======================================================================
   GLOSSAR
   ======================================================================= */
const GLOSSAR = [
  { term:'Reflexzone', def:'Ein Bereich an Fuß, Hand oder Ohr, dem in der Reflexzonenlehre ein bestimmtes Organ oder eine Körperregion zugeordnet wird.' },
  { term:'Effleurage', def:'Fachbegriff für die Streichung — sanfte, gleitende Bewegung, meist zu Beginn und Ende einer Massage.' },
  { term:'Petrissage', def:'Fachbegriff für die Knetung — kräftigere, kreisende Griffe zum Lösen von Gewebespannung.' },
  { term:'Friktion', def:'Punktuelle, kreisende Reibung an einer einzelnen Stelle, meist mit dem Daumen ausgeführt.' },
  { term:'Tapotement', def:'Fachbegriff für die Klopfung — rhythmisches, leichtes Klopfen mit den Fingerkuppen.' },
  { term:'Solarplexus', def:'Auch „Sonnengeflecht" genannt, ein Nervengeflecht im Oberbauch; in der Reflexzonenlehre eine eigene Zone am oberen Fuß-/Handteller.', zoneLink:{type:'foot', regionId:'herz', subId:'herz-solar'} },
  { term:'Chiromantie', def:'Traditionelle Deutung der Handlinien (Lebens-, Kopf- und Herzlinie) — Grundlage des Bonus-Features „Handlinien-Scan" in dieser App.' },
  { term:'Lymphsystem', def:'Teil des Immunsystems, das Gewebeflüssigkeit über Lymphbahnen abtransportiert; in der Reflexzonenlehre meist im Bereich der Fußknöchel bzw. Fingerzwischenräume verortet.' },
  { term:'Triggerpunkt', def:'Punktuell druckempfindliche Stelle im Muskelgewebe, die bei Druck auch an entfernten Körperstellen ein Gefühl auslösen kann — ein Konzept aus der klassischen Massagetherapie, zu unterscheiden von der Reflexzone.' },
  { term:'Akupressur', def:'Fingerdruck-Technik, die auf denselben Punkten wie die Akupunktur basiert, jedoch ohne Nadeln arbeitet.' },
  { term:'Ohrreflexzonen', def:'Bereiche am äußeren Ohr, denen — ähnlich wie an Fuß und Hand — bestimmte Körperregionen zugeordnet werden.', zoneLink:{type:'ear', regionId:'kopf', subId:null} },
];

/* =======================================================================
   BONUS: Handlinien-Scan (aus HandWahr übernommen, reine Unterhaltung)
   ======================================================================= */
const HAND_LINES = {
  leben: { label:'Lebenslinie', icon:'life', tag:'Energie & Lebensweg', variants:[
    'Deine Lebenslinie verläuft weit geschwungen um den Daumenballen – in der Handlesekunst gilt das als Zeichen für Energie, Abenteuerlust und eine Portion Spontanität.',
    'Bei dir zeigt sich eine eher gerade, nah am Daumen verlaufende Lebenslinie – klassisch gedeutet als Vorliebe für Routinen und Verlässlichkeit.',
    'Deine Lebenslinie ist auffällig tief und klar gezeichnet – in der Deutung ein Sinnbild für Widerstandskraft und schnelle Erholung nach Rückschlägen.',
    'Eine leicht doppelt angelegte Lebenslinie wird traditionell als Zeichen für mehrere große Neuanfänge gedeutet.',
  ]},
  kopf: { label:'Kopflinie', icon:'bulb', tag:'Denkweise', variants:[
    'Deine Kopflinie verläuft schnurgerade und kräftig – ein Zeichen für klares, logisches Denken.',
    'Bei dir schwingt sich die Kopflinie sanft nach unten – klassisch gedeutet als kreativer, bildhafter Denktyp.',
    'Deine Kopflinie liegt eng an der Herzlinie – ein Hinweis auf jemanden, der Kopf und Bauchgefühl gern zusammen entscheiden lässt.',
    'Eine lange, bis zum Handrand reichende Kopflinie gilt als Zeichen für Ausdauer beim Denken.',
  ]},
  herz: { label:'Herzlinie', icon:'heart', tag:'Gefühl & Beziehung', variants:[
    'Deine Herzlinie beginnt hoch unter dem Zeigefinger und verläuft geschwungen – ein Zeichen für Idealismus in Beziehungen.',
    'Bei dir verläuft die Herzlinie eher gerade und knapp unter den Fingern – klassisch als Zeichen für Bodenständigkeit in Gefühlsdingen gedeutet.',
    'Deine Herzlinie ist tief und durchgehend gezeichnet – ein Hinweis auf ausgeprägte emotionale Tiefe.',
    'Eine leicht geschwungene, kettenartige Herzlinie wird gern als Zeichen für ein besonders empathisches Gemüt gesehen.',
  ]},
};
const HANDTYPEN = [
  { name:'Erdhand', desc:'Quadratische Handfläche, eher kurze Finger – die „Erdhand" gilt als bodenständig, praktisch und handwerklich geschickt.' },
  { name:'Lufthand', desc:'Quadratische bis rechteckige Handfläche mit langen Fingern – die „Lufthand" steht für Kommunikationsfreude und einen wachen Verstand.' },
  { name:'Wasserhand', desc:'Längliche, schmale Handfläche mit langen, flexiblen Fingern – die „Wasserhand" gilt als besonders sensibel und intuitiv.' },
  { name:'Feuerhand', desc:'Rechteckige Handfläche mit kurzen Fingern – die „Feuerhand" gilt als energiegeladen, spontan und begeisterungsfähig.' },
];

function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function pick(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }
function hashCanvas(canvas){
  const c2=document.createElement('canvas'); c2.width=32; c2.height=32;
  const ctx2=c2.getContext('2d'); ctx2.drawImage(canvas,0,0,32,32);
  const data=ctx2.getImageData(0,0,32,32).data;
  let hash=2166136261;
  for(let i=0;i<data.length;i+=4){ hash^=data[i]+data[i+1]*3+data[i+2]*7+i; hash=Math.imul(hash,16777619); }
  return hash>>>0;
}
function buildHandResult(rng){ return { handType:pick(rng,HANDTYPEN), leben:pick(rng,HAND_LINES.leben.variants), kopf:pick(rng,HAND_LINES.kopf.variants), herz:pick(rng,HAND_LINES.herz.variants) }; }
function drawCover(img,size){
  const canvas=document.createElement('canvas'); canvas.width=size; canvas.height=size;
  const ctx=canvas.getContext('2d'); const scale=Math.max(size/img.width,size/img.height);
  const w=img.width*scale, h=img.height*scale;
  ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h); return canvas;
}
function edgeDetect(canvas){
  const w=canvas.width,h=canvas.height; const src=canvas.getContext('2d').getImageData(0,0,w,h);
  const gray=new Float32Array(w*h);
  for(let i=0;i<w*h;i++){ const r=src.data[i*4],g=src.data[i*4+1],b=src.data[i*4+2]; gray[i]=0.299*r+0.587*g+0.114*b; }
  const out=document.createElement('canvas'); out.width=w; out.height=h;
  const octx=out.getContext('2d'); const outData=octx.createImageData(w,h);
  const gx=[-1,0,1,-2,0,2,-1,0,1], gy=[-1,-2,-1,0,0,0,1,2,1];
  for(let y=0;y<h;y++){ for(let x=0;x<w;x++){
    let mag=0;
    if(y>0&&y<h-1&&x>0&&x<w-1){
      let sx=0,sy=0,k=0;
      for(let j=-1;j<=1;j++){ for(let i=-1;i<=1;i++){ const val=gray[(y+j)*w+(x+i)]; sx+=val*gx[k]; sy+=val*gy[k]; k++; } }
      mag=Math.min(255,Math.sqrt(sx*sx+sy*sy));
    }
    const t=mag/255; const idx=(y*w+x)*4;
    outData.data[idx]=11+(80-11)*t; outData.data[idx+1]=79+(221-79)*t; outData.data[idx+2]=73+(202-73)*t; outData.data[idx+3]=255;
  }}
  octx.putImageData(outData,0,0); return out;
}
const ANALYZE_STATUSES=['Foto wird eingelesen…','Handlinien werden erkannt…','Linien werden nachgezeichnet…','Deutung wird erstellt…'];
function startScan(){

  STATE.screen='scan'; STATE.scanStep='intro'; STATE.originalCanvas=null; STATE.analyzedCanvas=null; STATE.scanResult=null;
  render(); window.scrollTo(0,0);
}
function resetScan(){
  if (STATE.analyzeTimer) clearInterval(STATE.analyzeTimer);
  STATE.scanStep='intro'; STATE.originalCanvas=null; STATE.analyzedCanvas=null; STATE.scanResult=null; render();
}
function onFileSelected(input){
  const file=input.files && input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=(e)=>{ const img=new Image(); img.onload=()=>{ processImage(img); }; img.src=e.target.result; };
  reader.readAsDataURL(file); input.value='';
}
function processImage(img){
  STATE.originalCanvas=drawCover(img,480); STATE.scanStep='analyzing';
  STATE.analyzeStatusIdx=0; STATE.analyzeProgress=0; render();
  setTimeout(()=>runAnalysis(),80);
}
function runAnalysis(){
  const edgeCanvas=edgeDetect(STATE.originalCanvas); const seed=hashCanvas(STATE.originalCanvas); const rng=mulberry32(seed);
  STATE.analyzedCanvas=edgeCanvas; STATE.scanResult=buildHandResult(rng);
  let i=0; updateAnalyzeUI();
  STATE.analyzeTimer=setInterval(()=>{
    i++; STATE.analyzeStatusIdx=Math.min(i,ANALYZE_STATUSES.length-1); STATE.analyzeProgress=Math.min(100,Math.round((i/ANALYZE_STATUSES.length)*100));
    updateAnalyzeUI();
    if(i>=ANALYZE_STATUSES.length){ clearInterval(STATE.analyzeTimer); STATE.analyzeTimer=null; setTimeout(()=>{ STATE.scanStep='result'; render(); },350); }
  },650);
}
function updateAnalyzeUI(){
  const statusEl=document.querySelector('.analyze-status'); const barEl=document.querySelector('.analyze-progress-bar');
  if(statusEl) statusEl.textContent=ANALYZE_STATUSES[STATE.analyzeStatusIdx];
  if(barEl) barEl.style.width=(STATE.analyzeProgress||0)+'%';
}

/* =======================================================================
   Regionen-Helfer (Fuß / Hand / Ohr)
   ======================================================================= */
function regionsForType(type){
  if (type === 'foot') return FOOT_REGIONS;
  if (type === 'hand') return HAND_REGIONS;
  return EAR_REGIONS;
}
function typeLabel(type){ return type === 'foot' ? 'Fuß' : type === 'hand' ? 'Hand' : 'Ohr'; }

/* =======================================================================
   Favoriten & Notizen (nur lokal auf dem Gerät gespeichert)
   ======================================================================= */
function zoneKey(type, regionId, subId){ return type + ':' + regionId + ':' + (subId || ''); }
function isFavorite(key){ return STATE.favorites.indexOf(key) !== -1; }
function saveFavorites(){ try { localStorage.setItem('rw_favorites', JSON.stringify(STATE.favorites)); } catch(e){} }
function saveNotes(){ try { localStorage.setItem('rw_notes', JSON.stringify(STATE.notes)); } catch(e){} }
function loadFavoritesAndNotes(){
  try { const f = localStorage.getItem('rw_favorites'); if (f) STATE.favorites = JSON.parse(f); } catch(e){}
  try { const n = localStorage.getItem('rw_notes'); if (n) STATE.notes = JSON.parse(n); } catch(e){}
}
function toggleFavorite(key){
  const idx = STATE.favorites.indexOf(key);
  if (idx === -1) STATE.favorites.push(key); else STATE.favorites.splice(idx,1);
  saveFavorites(); render();
}
function updateNote(key, val){
  if (val && val.trim()) STATE.notes[key] = val; else delete STATE.notes[key];
  saveNotes();
}
function findZoneByKey(key){
  const [type, regionId, subId] = key.split(':');
  const region = regionsForType(type).find(r => r.id === regionId);
  if (!region) return null;
  const sub = subId ? region.subzones.find(s => s.id === subId) : null;
  return { type, region, sub };
}

/* =======================================================================
   Checklisten-Modus (nur für die aktuelle Sitzung, kein Speichern)
   ======================================================================= */
function toggleChecklistMode(tab){ STATE.checklistMode[tab] = !STATE.checklistMode[tab]; render(); }
function toggleChecklistItem(tab, idx){
  STATE.checklistDone[tab][idx] = !STATE.checklistDone[tab][idx];
  render();
}
function resetChecklist(tab){ STATE.checklistDone[tab] = {}; render(); }

/* =======================================================================
   Suche — Körperbereiche & Organe (bewusst KEINE Symptom-Suche, siehe unten)
   Die Suche findet Zonen und Glossarbegriffe über Körperteil-/Organnamen.
   Alltagssynonyme werden auf die in den Zonen verwendeten Begriffe gemappt,
   damit z. B. "Bauch" auch die Magen-/Darm-Zonen findet. Es werden bewusst
   keine Beschwerden oder Symptome als Suchbegriffe hinterlegt.
   ======================================================================= */
const SEARCH_SYNONYMS = {
  'bauch': 'magen darm verdauung',
  'rücken': 'wirbelsäule',
  'ruecken': 'wirbelsäule',
  'hals': 'nacken',
  'ohren': 'ohr',
  'füße': 'fuß',
  'fuesse': 'fuß',
  'fuss': 'fuß',
  'zähne': 'zaehne',
};
function expandQuery(q){
  let expanded = q;
  Object.keys(SEARCH_SYNONYMS).forEach(key => { if (q.includes(key)) expanded += ' ' + SEARCH_SYNONYMS[key]; });
  return expanded;
}

/* ---------------------------------------------------------------------
   SVG-Umrisse Fuß / Hand
   --------------------------------------------------------------------- */
function footOutlineSvg(){
  return `<svg class="outline-svg" viewBox="0 0 260 460" xmlns="http://www.w3.org/2000/svg">
    <path class="outline-shape" d="M95,118 C60,135 44,165 42,205 C40,240 58,255 75,275 C92,295 88,320 68,345 C48,365 42,385 42,405 C42,428 70,438 100,438 C135,438 168,436 188,425 C208,412 216,392 216,368 C216,340 206,318 208,290 C210,265 218,245 218,215 C218,185 208,155 188,135 C170,122 115,112 95,118 Z"/>
    <path class="outline-detail" d="M85,155 C64,190 60,235 70,268 C78,296 76,328 62,358"/>
    <path class="outline-detail" d="M128,128 C120,182 124,242 134,300 C140,340 138,382 128,418"/>
    <ellipse class="outline-shape" cx="80" cy="80" rx="17" ry="39" transform="rotate(-7 80 80)"/>
    <ellipse class="outline-shape" cx="114" cy="64" rx="12" ry="38" transform="rotate(-2 114 64)"/>
    <ellipse class="outline-shape" cx="144" cy="62" rx="10.5" ry="35" transform="rotate(5 144 62)"/>
    <ellipse class="outline-shape" cx="171" cy="70" rx="9" ry="29" transform="rotate(14 171 70)"/>
    <ellipse class="outline-shape" cx="193" cy="86" rx="7.75" ry="21" transform="rotate(25 193 86)"/>
    ${FOOT_REGIONS.map((z,i)=>zoneDotSvg(z,i,'foot')).join('')}
  </svg>`;
}
function handOutlineSvg(){
  return `<svg class="outline-svg" viewBox="0 0 260 400" xmlns="http://www.w3.org/2000/svg">
    <ellipse class="outline-shape" cx="70" cy="228" rx="20" ry="42" transform="rotate(-42 70 228)"/>
    <path class="outline-shape" d="M98,148 C78,158 64,178 58,205 C54,232 53,258 58,282 C65,304 78,320 96,330 C112,338 130,340 150,339 C168,335 184,325 195,308 C203,290 206,265 205,238 C203,210 196,182 182,162 C168,150 122,140 98,148 Z"/>
    <path class="outline-detail" d="M100,225 C108,255 112,290 108,325"/>
    <path class="outline-detail" d="M140,215 C142,250 140,290 132,330"/>
    <path class="outline-detail" d="M172,222 C168,252 162,285 152,315"/>
    <ellipse class="outline-shape" cx="98" cy="96" rx="12.5" ry="46" transform="rotate(-9 98 96)"/>
    <ellipse class="outline-shape" cx="127" cy="76" rx="12.5" ry="53"/>
    <ellipse class="outline-shape" cx="156" cy="78" rx="12" ry="50" transform="rotate(6 156 78)"/>
    <ellipse class="outline-shape" cx="181" cy="96" rx="10.5" ry="40" transform="rotate(15 181 96)"/>
    ${HAND_REGIONS.map((z,i)=>zoneDotSvg(z,i,'hand')).join('')}
  </svg>`;
}
function earOutlineSvg(){
  return `<svg class="outline-svg" viewBox="0 0 260 400" xmlns="http://www.w3.org/2000/svg">
    <path class="outline-shape" d="M140,32 C185,28 218,55 222,100 C225,135 210,155 216,180 C222,205 232,225 228,255 C224,280 205,295 202,320 C199,345 178,365 155,368 C135,371 118,358 115,338 C112,322 120,312 112,298 C102,282 88,275 82,255 C76,235 88,222 84,200 C80,178 64,168 66,142 C68,112 88,72 115,48 C125,40 133,35 140,32 Z"/>
    <path class="outline-detail" d="M135,68 C160,72 178,92 178,120 C178,145 160,158 158,180 C156,202 172,215 170,238 C168,258 148,268 146,288"/>
    <path class="outline-shape" d="M104,210 C90,214 84,228 90,244 C96,256 110,255 115,242 C118,230 112,218 104,210 Z"/>
    ${EAR_REGIONS.map((z,i)=>zoneDotSvg(z,i,'ear')).join('')}
  </svg>`;
}
function zoneDotSvg(z,i,type){
  const active = STATE.activeRegionId === z.id;
  return `<g class="zone-dot${active?' active':''}" onclick="selectRegion('${type}','${z.id}')">
    <circle cx="${z.x}" cy="${z.y}" r="13"></circle>
    <text x="${z.x}" y="${z.y+1}">${i+1}</text>
  </g>`;
}

/* ---------------------------------------------------------------------
   Navigation & State
   --------------------------------------------------------------------- */
function setScreen(s){ STATE.screen=s; render(); window.scrollTo(0,0); }
function goHome(){ if(STATE.analyzeTimer) clearInterval(STATE.analyzeTimer); STATE.screen='start'; render(); window.scrollTo(0,0); }
function openZones(type){ STATE.screen='zones'; STATE.zoneType=type; STATE.activeRegionId=null; STATE.openSubzoneId=null; render(); window.scrollTo(0,0); }
function switchZoneType(type){ if(STATE.zoneType===type) return; STATE.zoneType=type; STATE.activeRegionId=null; STATE.openSubzoneId=null; render(); }
function selectRegion(type,id){ STATE.zoneType=type; STATE.activeRegionId=id; STATE.openSubzoneId=null; render(); }
function toggleSubzone(id){ STATE.openSubzoneId = STATE.openSubzoneId===id ? null : id; render(); }
function setMassageTab(tab){ STATE.massageTab=tab; render(); window.scrollTo({top:0}); }
function setSearchQuery(val){ STATE.searchQuery = val; renderSearchResultsOnly(); }
function goToSearchResult(kind, type, regionId, subId){
  if (kind === 'zone'){ STATE.screen='zones'; STATE.zoneType=type; STATE.activeRegionId=regionId; STATE.openSubzoneId=subId||null; }
  else { STATE.screen='glossary'; }
  render(); window.scrollTo(0,0);
}
function toggleDark(){
  document.body.classList.toggle('dark');
  try { localStorage.setItem('rw_theme', document.body.classList.contains('dark') ? 'dark' : 'light'); } catch(e){}
  render();
}

/* ---------------------------------------------------------------------
   Bausteine
   --------------------------------------------------------------------- */
function header(title, sub, isStart){
  return `
    <div class="header">
      <div class="blob1"></div><div class="blob2"></div>
      <button class="home-btn" onclick="${isStart ? "location.href='rf-index.html'" : 'goHome()'}" aria-label="Startseite">${svg('home',22)}</button>
      <button class="header-btn dark-toggle" onclick="toggleDark()" aria-label="Dunkelmodus umschalten">${svg(document.body.classList.contains('dark')?'sun':'moon',16)}</button>
      <div class="header-row has-home">
        <div>
          <div class="header-sub">${sub || 'REFLEXWAHR'}</div>
          <div class="header-title">${title}</div>
        </div>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------------
   Screens
   --------------------------------------------------------------------- */
function renderStart(){
  return `
    ${header('ReflexWahr', 'FUSS · HAND · OHR · MASSAGE', true)}
    <div class="content">
      <div class="hero-card">
        <div class="hero-title">Dein Nachschlagewerk</div>
        <p>Interaktive Zonenkarten zu Fuß, Hand und Ohr, ein ausführlicher Massage-Ratgeber mit Checklisten-Modus, Favoriten, Glossar und Suche.</p>
      </div>
      <div class="notice">
        ${svg('warn',16)}
        <div><strong>Wichtig:</strong> Die Reflexzonenlehre ist ein traditionelles, alternativmedizinisches Konzept. Die Zuordnung von Zonen zu Organen ist wissenschaftlich nicht ausreichend belegt und ersetzt keine ärztliche Diagnose oder Behandlung.</div>
      </div>

      <div class="search-input-wrap">
        <span class="search-input-icon">${svg('search',16)}</span>
        <input class="search-input" type="text" placeholder="Körperbereich suchen, z. B. „Magen"…" oninput="STATE.screen='search'; setSearchQuery(this.value); this.focus();" onfocus="if(STATE.screen!=='search'){setScreen('search');}">
      </div>

      <div class="section-label">Zonenkarten</div>
      <div class="tile-grid">
        <button class="tile" onclick="openZones('foot')"><div class="tile-icon-wrap">${svg('foot',22)}</div><div><div class="tile-label">Fuß</div><div class="tile-sub">10 Regionen · 32 Zonen</div></div></button>
        <button class="tile" onclick="openZones('hand')"><div class="tile-icon-wrap">${svg('hand',22)}</div><div><div class="tile-label">Hand</div><div class="tile-sub">8 Regionen · 28 Zonen</div></div></button>
        <button class="tile" onclick="openZones('ear')"><div class="tile-icon-wrap">${svg('ear',22)}</div><div><div class="tile-label">Ohr</div><div class="tile-sub">6 Regionen · 11 Zonen</div></div></button>
        <button class="tile" onclick="setScreen('favorites')"><div class="tile-icon-wrap">${svg('star',22)}</div><div><div class="tile-label">Favoriten</div><div class="tile-sub">${STATE.favorites.length ? STATE.favorites.length + ' gemerkt' : 'Meine Zonen'}</div></div></button>
      </div>

      <div class="section-label">Ratgeber</div>
      <div class="tile-grid">
        <button class="tile wide" onclick="setScreen('massage')"><div class="tile-icon-wrap">${svg('spa',20)}</div><div><div class="tile-label">Massage-Ratgeber</div><div class="tile-sub">Grundlagen, Anleitungen mit Checklisten, Hilfsmittel, Hinweise</div></div></button>
        <button class="tile wide" onclick="setScreen('glossary')"><div class="tile-icon-wrap">${svg('glossary',20)}</div><div><div class="tile-label">Glossar</div><div class="tile-sub">Fachbegriffe kurz erklärt</div></div></button>
      </div>

      <div class="section-label">Bonus</div>
      <div class="tile-grid">
        <button class="tile wide" onclick="startScan()">
          <div class="tile-icon-wrap">${svg('sparkle',20)}</div>
          <div><div class="tile-label">Handlinien-Scan<span class="bonus-badge">${svg('sparkle',10)} Spaß</span></div><div class="tile-sub">Foto → Analyse-Animation → Deutung</div></div>
        </button>
      </div>

      <div class="section-label">Info</div>
      <div class="tile-grid">
        <button class="tile" onclick="setScreen('guide')"><div class="tile-icon-wrap">${svg('book',22)}</div><div><div class="tile-label">Anleitung</div><div class="tile-sub">So geht's</div></div></button>
        <button class="tile" onclick="setScreen('about')"><div class="tile-icon-wrap">${svg('info',22)}</div><div><div class="tile-label">Über die App</div><div class="tile-sub">Worum es geht</div></div></button>
        <a class="tile wide" href="rf-impressum.html" style="text-decoration:none"><div class="tile-icon-wrap">${svg('scroll',20)}</div><div><div class="tile-label">Impressum</div></div></a>
        <a class="tile wide" href="rf-datenschutz.html" style="text-decoration:none"><div class="tile-icon-wrap">${svg('shield',20)}</div><div><div class="tile-label">Datenschutz</div></div></a>
      </div>
    </div>`;
}

function renderZones(){
  const type = STATE.zoneType;
  const regions = regionsForType(type);
  const active = regions.find(z => z.id === STATE.activeRegionId) || regions[0];
  const outline = type === 'foot' ? footOutlineSvg() : type === 'hand' ? handOutlineSvg() : earOutlineSvg();
  const regionKey = zoneKey(type, active.id, null);
  return `
    ${header(typeLabel(type) + '-Reflexzonen', 'ZONENKARTE')}
    <div class="content">
      <div class="segmented">
        <button class="${type==='foot'?'active':''}" onclick="switchZoneType('foot')">${svg('foot',14)} &nbsp;Fuß</button>
        <button class="${type==='hand'?'active':''}" onclick="switchZoneType('hand')">${svg('hand',14)} &nbsp;Hand</button>
        <button class="${type==='ear'?'active':''}" onclick="switchZoneType('ear')">${svg('ear',14)} &nbsp;Ohr</button>
      </div>

      <div class="zone-map-wrap">${outline}</div>

      <div class="card zone-detail-card">
        <div class="card-title-row">
          <div>
            <div class="zone-detail-tag">${active.area}</div>
            <div class="zone-detail-title">${active.label}</div>
          </div>
          <div style="display:flex;gap:2px">
            <button class="icon-btn" onclick="window.print()" aria-label="Drucken">${svg('printer',17)}</button>
            <button class="fav-star ${isFavorite(regionKey)?'active':''}" onclick="toggleFavorite('${regionKey}')" aria-label="Region merken">${svg('star',18)}</button>
          </div>
        </div>
        <div class="zone-detail-text">${active.intro}</div>
        <div class="subzone-list">
          ${active.subzones.map(sz => {
            const key = zoneKey(type, active.id, sz.id);
            const fav = isFavorite(key);
            return `
            <div class="subzone-item ${STATE.openSubzoneId===sz.id?'open':''}">
              <div class="subzone-head-row">
                <button class="subzone-head" style="flex:1" onclick="toggleSubzone('${sz.id}')">
                  <span class="subzone-head-label">${sz.label}</span>
                  <span class="subzone-chevron">${svg('chevron',15)}</span>
                </button>
                <button class="fav-star ${fav?'active':''}" style="padding:8px 12px" onclick="toggleFavorite('${key}')" aria-label="Zone merken">${svg('star',16)}</button>
              </div>
              <div class="subzone-body"><div class="subzone-body-inner">
                ${sz.side ? `<span class="side-badge">${sz.side}</span><br>` : ''}${sz.text}
                <textarea class="note-textarea" placeholder="Eigene Notiz (nur lokal auf diesem Gerät gespeichert)…" onchange="updateNote('${key}', this.value)">${escapeHtml(STATE.notes[key] || '')}</textarea>
              </div></div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="section-label">Alle Regionen</div>
      <div class="zone-list">
        ${regions.map((z,i)=>`
          <button class="zone-row ${z.id===active.id?'active':''}" onclick="selectRegion('${type}','${z.id}')">
            <div class="zone-row-num">${i+1}</div>
            <div><div class="zone-row-label">${z.label}</div><div class="zone-row-area">${z.area} · ${z.subzones.length} Unterzonen</div></div>
          </button>`).join('')}
      </div>

      <div class="notice info">${svg('info',16)}<div>Vereinfachte, schematische Darstellung zu Übersichtszwecken — keine exakte anatomische Abbildung.</div></div>
    </div>`;
}

function renderStepsSection(tabKey, steps){
  const isChecklist = STATE.checklistMode[tabKey];
  const doneMap = STATE.checklistDone[tabKey];
  const doneCount = Object.values(doneMap).filter(Boolean).length;
  const modeSwitch = `
    <div class="mode-switch-row">
      <button class="mode-switch-btn" onclick="toggleChecklistMode('${tabKey}')">
        ${svg(isChecklist ? 'list' : 'check', 14)} ${isChecklist ? 'Anleitung ansehen' : 'Checklisten-Modus'}
      </button>
    </div>`;
  if (!isChecklist){
    return modeSwitch + `<ul class="step-list">${steps.map((s,i)=>{
      return `<li class="step-item"><div class="step-num">${i+1}</div><div class="step-text" style="flex:1"><strong>${s.title}</strong>${s.text}</div></li>`;
    }).join('')}</ul>`;
  }
  return modeSwitch + `
    <div class="checklist-progress-wrap">
      <div class="checklist-progress-track"><div class="checklist-progress-fill" style="width:${Math.round(100*doneCount/steps.length)}%"></div></div>
      <div class="checklist-progress-label">${doneCount}/${steps.length}</div>
    </div>
    ${steps.map((s,i)=>{
      const done = !!doneMap[i];
      return `<div class="checklist-item ${done?'done':''}" onclick="toggleChecklistItem('${tabKey}',${i})">
        <div class="checklist-checkbox">${done?svg('check',14):''}</div>
        <div class="step-text" style="flex:1"><strong>${s.title}</strong>${s.text}</div>
      </div>`;
    }).join('')}
    <div class="btn-row"><button class="btn-secondary" onclick="event.stopPropagation(); resetChecklist('${tabKey}')">${svg('reset',15)} Zurücksetzen</button></div>`;
}

function renderMassage(){
  const tab = STATE.massageTab;
  let body = '';
  if (tab === 'grundlagen'){
    body = `
      <div class="section-label">Die 5 Grundgriffe</div>
      ${GRUNDGRIFFE.map(g => `
        <div class="card technik-card">
          <div class="technik-icon">${svg(g.icon,20)}</div>
          <div><div class="technik-title">${g.name}</div><div class="technik-text">${g.text}</div></div>
        </div>`).join('')}

      <div class="section-label">Vorbereitung</div>
      <div class="card"><ul class="warn-list">${VORBEREITUNG.map(v=>`<li>${v}</li>`).join('')}</ul></div>

      <div class="section-label">Druckstärke</div>
      <div class="card">
        ${DRUCK_SKALA.map(d => `
          <div class="level-row">
            <div class="level-label">${d.label}</div>
            <div class="level-scale" style="flex:1;margin:0">${[1,2,3,4,5].map(n=>`<div class="level-dot ${n<=d.level?'filled':''}"></div>`).join('')}</div>
          </div>
          <div class="zone-detail-text" style="margin:-4px 0 12px">${d.desc}</div>`).join('')}
      </div>

      <div class="section-label">Nachsorge</div>
      <div class="card"><ul class="warn-list">${NACHSORGE.map(v=>`<li>${v}</li>`).join('')}</ul></div>
    `;
  } else if (tab === 'fuss'){
    body = renderStepsSection('fuss', FUSS_SCHRITTE);
  } else if (tab === 'hand'){
    body = renderStepsSection('hand', HAND_SCHRITTE);
  } else if (tab === 'weitere'){
    body = WEITERE_BEREICHE.map(b => `
      <div class="card">
        <div class="technik-card" style="margin-bottom:10px">
          <div class="technik-icon">${svg(b.icon,20)}</div>
          <div class="technik-title" style="margin-bottom:0">${b.title}</div>
        </div>
        <ul class="warn-list">${b.steps.map(s=>`<li>${s}</li>`).join('')}</ul>
      </div>`).join('');
  } else if (tab === 'hilfsmittel'){
    body = HILFSMITTEL.map(h => `
      <div class="card tool-card">
        <div class="tool-icon">${svg(h.icon,16)}</div>
        <div><div class="tool-title">${h.name}</div><div class="tool-text">${h.text}</div></div>
      </div>`).join('');
  } else {
    body = `
      <div class="notice">${svg('warn',16)}<div><strong>Lieber nicht anwenden bei:</strong></div></div>
      <div class="card"><ul class="warn-list">${KONTRAINDIKATIONEN.absolut.map(v=>`<li>${v}</li>`).join('')}</ul></div>
      <div class="notice info">${svg('info',16)}<div><strong>Im Zweifel lieber vorsichtig sein:</strong></div></div>
      <div class="card"><ul class="warn-list">${KONTRAINDIKATIONEN.relativ.map(v=>`<li>${v}</li>`).join('')}</ul></div>
      <div class="notice info">${svg('info',16)}<div>Eine Selbstmassage sollte immer angenehm bleiben — Schmerzen sind kein Zeichen für „mehr Wirkung", sondern ein Signal, den Druck zu verringern oder aufzuhören.</div></div>`;
  }
  return `
    ${header('Massage-Ratgeber', 'GRUNDLAGEN & ANLEITUNG')}
    <div class="content">
      <div class="segmented" style="flex-wrap:wrap">
        <button class="${tab==='grundlagen'?'active':''}" onclick="setMassageTab('grundlagen')">Grundlagen</button>
        <button class="${tab==='fuss'?'active':''}" onclick="setMassageTab('fuss')">Fuß</button>
        <button class="${tab==='hand'?'active':''}" onclick="setMassageTab('hand')">Hand</button>
      </div>
      <div class="segmented" style="flex-wrap:wrap">
        <button class="${tab==='weitere'?'active':''}" onclick="setMassageTab('weitere')">Weitere Bereiche</button>
        <button class="${tab==='hilfsmittel'?'active':''}" onclick="setMassageTab('hilfsmittel')">Hilfsmittel</button>
        <button class="${tab==='hinweise'?'active':''}" onclick="setMassageTab('hinweise')">Hinweise</button>
      </div>
      ${body}
    </div>`;
}

function renderGlossary(){
  return `
    ${header('Glossar', 'FACHBEGRIFFE')}
    <div class="content">
      ${GLOSSAR.slice().sort((a,b)=>a.term.localeCompare(b.term,'de')).map(g => `
        <div class="glossary-item">
          <div class="glossary-term">${g.term}</div>
          <div class="glossary-def">${g.def}</div>
          ${g.zoneLink ? `<button class="glossary-link-btn" onclick="goToSearchResult('zone','${g.zoneLink.type}','${g.zoneLink.regionId}','${g.zoneLink.subId||''}')">${svg('chevron',12)} Zur Zone (${typeLabel(g.zoneLink.type)})</button>` : ''}
        </div>`).join('')}
    </div>`;
}

function renderFavorites(){
  const items = STATE.favorites.map(findZoneByKey).filter(Boolean);
  return `
    ${header('Favoriten', 'MEINE ZONEN')}
    <div class="content">
      <div class="btn-row" style="margin-bottom:14px">
        <button class="btn-secondary" onclick="window.print()">${svg('printer',16)} Drucken / Exportieren</button>
      </div>
      ${items.length === 0 ? `<div class="empty-hint">Noch keine Favoriten. Tippe in einer Zonenkarte auf den Stern, um eine Region oder Zone hier zu sammeln.</div>` : items.map(item => {
        const label = item.sub ? item.sub.label : item.region.label;
        const key = item.sub ? zoneKey(item.type, item.region.id, item.sub.id) : zoneKey(item.type, item.region.id, null);
        const text = item.sub ? item.sub.text : item.region.intro;
        const note = STATE.notes[key];
        return `
        <div class="card fav-item-card">
          <div style="flex:1">
            <div class="zone-detail-tag">${typeLabel(item.type)} · ${item.region.label}</div>
            <div class="zone-detail-title" style="margin-bottom:6px">${label}</div>
            <div class="zone-detail-text">${text}</div>
            ${note ? `<div class="note-textarea" style="margin-top:10px;box-shadow:none;background:var(--bg)">${escapeHtml(note)}</div>` : ''}
          </div>
          <button class="fav-star active fav-item-remove" onclick="toggleFavorite('${key}')" aria-label="Entfernen">${svg('star',18)}</button>
        </div>`;
      }).join('')}
    </div>`;
}

/* ---------- Suche ---------- */
function buildSearchIndex(){
  const idx = [];
  ['foot','hand','ear'].forEach(type => {
    const regions = regionsForType(type);
    regions.forEach(r => {
      idx.push({ kind:'zone', type, regionId:r.id, subId:null, cat:typeLabel(type)+' · Region', label:r.label, text:r.intro });
      r.subzones.forEach(sz => idx.push({ kind:'zone', type, regionId:r.id, subId:sz.id, cat:typeLabel(type)+' · '+r.label, label:sz.label, text:sz.text }));
    });
  });
  GLOSSAR.forEach(g => idx.push({ kind:'glossary', cat:'Glossar', label:g.term, text:g.def }));
  return idx;
}
const SEARCH_INDEX = buildSearchIndex();

function runSearch(q){
  if (q.length < 2) return [];
  const expanded = expandQuery(q);
  const terms = Array.from(new Set(expanded.split(' ').filter(t => t.length >= 2)));
  return SEARCH_INDEX.filter(it => {
    const hay = (it.label + ' ' + it.text + ' ' + it.cat).toLowerCase();
    return terms.some(t => hay.includes(t));
  }).slice(0, 40);
}

function renderSearch(){
  const q = STATE.searchQuery.trim().toLowerCase();
  const results = runSearch(q);
  return `
    ${header('Suche', 'KÖRPERBEREICHE & BEGRIFFE')}
    <div class="content">
      <div class="search-input-wrap">
        <span class="search-input-icon">${svg('search',16)}</span>
        <input id="searchField" class="search-input" type="text" placeholder="Körperbereich oder Begriff suchen…" value="${escapeHtml(STATE.searchQuery)}" oninput="setSearchQuery(this.value)">
      </div>
      <div class="notice info" style="margin-bottom:14px">${svg('info',15)}<div>Suche nach Körperteilen und Organen (z. B. „Magen", „Rücken", „Ohr") — keine Suche nach Beschwerden oder Symptomen.</div></div>
      <div id="searchResults">${searchResultsHtml(q, results)}</div>
    </div>`;
}
function searchResultsHtml(q, results){
  if (q.length < 2) return `<div class="empty-hint">Mindestens 2 Zeichen eingeben, um Zonen und Glossarbegriffe zu durchsuchen.</div>`;
  if (results.length === 0) return `<div class="empty-hint">Keine Treffer für „${escapeHtml(STATE.searchQuery)}".</div>`;
  return results.map(r => `
    <button class="search-result-row" onclick="goToSearchResult('${r.kind}','${r.type||''}','${r.regionId||''}','${r.subId||''}')">
      <div><div class="search-result-cat">${r.cat}</div><div class="search-result-label">${r.label}</div></div>
    </button>`).join('');
}
function renderSearchResultsOnly(){
  const el = document.getElementById('searchResults');
  if (!el) { render(); return; }
  const q = STATE.searchQuery.trim().toLowerCase();
  el.innerHTML = searchResultsHtml(q, runSearch(q));
}

function renderGuide(){
  return `
    ${header('Anleitung', 'WEGWEISER')}
    <div class="content">
      <div class="text-page">
        <h2>Zonenkarten</h2>
        <p>Unter „Fuß", „Hand" und „Ohr" findest du je eine schematische Karte mit nummerierten Hauptregionen. Tippe auf einen Punkt in der Karte oder auf einen Eintrag in der Liste, um die Region zu öffnen. Jede Region lässt sich weiter in einzelne Unterzonen aufklappen — insgesamt über 70 Einzelzonen. Über den Stern kannst du einzelne Zonen als Favorit merken und eigene Notizen dazu speichern (nur lokal auf deinem Gerät).</p>
        <h2>Massage-Ratgeber</h2>
        <p>Unter „Massage-Ratgeber" findest du die fünf klassischen Grundgriffe, Vorbereitung, eine Druckstärke-Skala und Nachsorge-Tipps sowie Schritt-für-Schritt-Anleitungen für Fuß und Hand — wahlweise im Checklisten-Modus mit Fortschrittsanzeige. Dazu weitere Bereiche (Nacken, Schultern, Kopf), Hilfsmittel und wichtige Hinweise.</p>
        <h2>Favoriten</h2>
        <p>Alle gemerkten Zonen findest du gesammelt unter „Favoriten", inklusive deiner Notizen. Von dort lässt sich die Liste auch über die Browser-Druckfunktion ausdrucken oder als PDF exportieren.</p>
        <h2>Glossar &amp; Suche</h2>
        <p>Im Glossar findest du kurze Erklärungen zu Fachbegriffen, teils mit direkter Verlinkung zur passenden Zone. Über die Suche kannst du nach Körperbereichen und Organen suchen (z. B. „Magen", „Rücken") — bewusst keine Suche nach Beschwerden oder Symptomen.</p>
        <h2>Bonus: Handlinien-Scan</h2>
        <p>Zusätzlich enthält die App als kleines Extra den Handlinien-Scan: Foto der Handfläche aufnehmen, kurze Analyse-Animation ansehen und eine augenzwinkernde Deutung nach klassischer Chiromantie erhalten — reine Unterhaltung, getrennt vom seriösen Nachschlage-Teil.</p>
        <h2>Offline nutzbar</h2>
        <p>Nach dem ersten Öffnen funktioniert die App auch ohne Internetverbindung.</p>
      </div>
    </div>
    <div style="padding:0 18px 18px"><button class="btn-primary" onclick="goHome()">${svg('home',16)} Zur Startseite</button></div>`;
}

function renderAbout(){
  return `
    ${header('Über die App', 'REFLEXWAHR')}
    <div class="content">
      <div class="text-page">
        <h2>Worum geht es?</h2>
        <p>ReflexWahr ist ein umfangreiches Nachschlagewerk zur Fuß-, Hand- und Ohrreflexzonenmassage sowie zu allgemeinen Massage-Grundlagen — mit interaktiven Zonenkarten (über 70 Einzelzonen), ausführlichen Selbstmassage-Anleitungen mit Checklisten-Modus, Favoriten mit Notizfunktion, Hilfsmittel-Übersicht, Glossar und Suche. Als kleines Bonus-Feature ist außerdem der Handlinien-Scan aus der Schwester-App HandWahr enthalten.</p>
        <h2>Was diese App nicht ist</h2>
        <p>Die Reflexzonenlehre ordnet einzelnen Bereichen von Fuß, Hand und Ohr bestimmte Organe zu. Ein wissenschaftlicher Nachweis für diese Zuordnung fehlt bislang. ReflexWahr macht daher keine Heil- oder Wirkversprechen, bietet bewusst keine Suche nach Symptomen oder Beschwerden und ersetzt keine ärztliche Diagnose, Behandlung oder Physiotherapie — bei gesundheitlichen Beschwerden wende dich an eine Ärztin, einen Arzt oder eine ausgebildete Fachperson. Der Handlinien-Scan ist reine Unterhaltung ohne wissenschaftlichen Anspruch. ReflexWahr ist keine Medizin-App.</p>
        <h2>Technik &amp; Datenschutz</h2>
        <p>Die Zonenkarten, der Ratgeber und das Glossar funktionieren komplett offline und ohne Kamerazugriff. Favoriten und Notizen werden ausschließlich lokal auf deinem Gerät gespeichert und nirgendwo hochgeladen. Nur beim Bonus-Feature „Handlinien-Scan" wird ein Foto aufgenommen — auch dieses wird ausschließlich lokal im Browser verarbeitet.</p>
      </div>
    </div>
    <div style="padding:0 18px 18px"><button class="btn-primary" onclick="goHome()">${svg('home',16)} Zur Startseite</button></div>`;
}

/* ---------- Bonus-Scan-Screens ---------- */
function renderScanIntro(){
  return `
    ${header('Handlinien-Scan', 'BONUS · ANLEITUNG')}
    <div class="content">
      <div class="guide-visual">
        ${svg('hand', 40)}
        <div style="font-size:13px;line-height:1.5;opacity:.92;margin-top:10px">Halte deine Handfläche flach vor die Kamera — für eine augenzwinkernde Deutung deiner Handlinien.</div>
      </div>
      <div class="card">
        <ul class="step-list">
          <li class="step-item"><div class="step-num">1</div><div class="step-text"><strong>Handfläche flach halten</strong>Finger leicht gespreizt, Handfläche komplett sichtbar.</div></li>
          <li class="step-item"><div class="step-num">2</div><div class="step-text"><strong>Gutes Licht nutzen</strong>Am besten Tageslicht oder eine helle Lampe, keine harten Schatten.</div></li>
          <li class="step-item"><div class="step-num">3</div><div class="step-text"><strong>Gerade von oben fotografieren</strong>Kamera möglichst parallel zur Handfläche halten.</div></li>
        </ul>
      </div>
      <div class="notice">${svg('warn',16)}<div>Reine Unterhaltung — kein wissenschaftliches Verfahren. Das Foto wird nur auf deinem Gerät verarbeitet und nirgendwo hochgeladen.</div></div>

      <input class="file-input-hidden" type="file" id="fileInput" accept="image/*" capture="environment" onchange="onFileSelected(this)">
      <label class="capture-label" for="fileInput">${svg('camera',16)} &nbsp;Jetzt scannen</label>
      <div class="btn-row"><button class="btn-secondary" onclick="goHome()">${svg('home',16)} Zur Startseite</button></div>
    </div>`;
}
function renderScanAnalyzing(){
  return `
    ${header('Handlinien-Scan', 'ANALYSE LÄUFT')}
    <div class="content">
      <div class="analyze-wrap">
        <canvas id="analyzeCanvas"></canvas>
        <div class="analyze-grid"></div>
        <div class="scan-sweep"></div>
      </div>
      <div class="analyze-status">Foto wird eingelesen…</div>
      <div class="analyze-progress"><div class="analyze-progress-bar" style="width:0%"></div></div>
      <div class="notice info">${svg('sparkle',16)}<div>Einen Moment — es werden Muster in deinem Foto gesucht.</div></div>
    </div>`;
}
function renderScanResult(){
  const r = STATE.scanResult;
  return `
    ${header('Handlinien-Scan', 'ERGEBNIS')}
    <div class="content">
      <div class="capture-frame" style="margin-bottom:14px"><canvas id="resultCanvas"></canvas></div>
      <div class="result-hero">
        <div class="result-badge">${svg('sparkle',13)} Unterhaltung · kein wissenschaftliches Verfahren</div>
        <div class="result-hero-icon">${svg('hand',26)}</div>
        <div class="result-hero-title">Deine Handlinien-Analyse</div>
        <div class="result-hero-sub">${r.handType.name}</div>
      </div>
      <div class="card">
        <div class="result-card-tag">Handtyp</div>
        <div class="result-card-title">${r.handType.name}</div>
        <div class="result-card-text">${r.handType.desc}</div>
      </div>
      ${['leben','kopf','herz'].map(key=>{ const meta=HAND_LINES[key]; return `
        <div class="card result-card">
          <div class="result-card-icon">${svg(meta.icon,16)}</div>
          <div><div class="result-card-tag">${meta.tag}</div><div class="result-card-title">${meta.label}</div><div class="result-card-text">${r[key]}</div></div>
        </div>`; }).join('')}
      <div class="btn-row" style="margin-top:4px">
        <button class="btn-primary" onclick="resetScan()">${svg('refresh',16)} Neuer Scan</button>
        <button class="btn-secondary" onclick="goHome()">${svg('home',16)} Zur Startseite</button>
      </div>
    </div>`;
}
function renderScan(){
  if (STATE.scanStep === 'analyzing') return renderScanAnalyzing();
  if (STATE.scanStep === 'result' && STATE.scanResult) return renderScanResult();
  return renderScanIntro();
}

/* ---------------------------------------------------------------------
   Render-Hauptfunktion
   --------------------------------------------------------------------- */
function render(){
  const app = document.getElementById('app');
  let html;
  switch (STATE.screen){
    case 'zones': html = renderZones(); break;
    case 'massage': html = renderMassage(); break;
    case 'glossary': html = renderGlossary(); break;
    case 'favorites': html = renderFavorites(); break;
    case 'search': html = renderSearch(); break;
    case 'scan': html = renderScan(); break;
    case 'guide': html = renderGuide(); break;
    case 'about': html = renderAbout(); break;
    default: html = renderStart();
  }
  app.innerHTML = html;
  paintScanCanvases();
  if (STATE.screen === 'search'){
    const f = document.getElementById('searchField');
    if (f) { f.focus(); f.selectionStart = f.selectionEnd = f.value.length; }
  }
}
function paintScanCanvases(){
  if (STATE.scanStep === 'analyzing' && STATE.originalCanvas){
    const el = document.getElementById('analyzeCanvas');
    if (el){ el.width=STATE.originalCanvas.width; el.height=STATE.originalCanvas.height; el.getContext('2d').drawImage(STATE.originalCanvas,0,0); }
  }
  if (STATE.scanStep === 'result' && STATE.analyzedCanvas){
    const el = document.getElementById('resultCanvas');
    if (el){ el.width=STATE.analyzedCanvas.width; el.height=STATE.analyzedCanvas.height; el.getContext('2d').drawImage(STATE.analyzedCanvas,0,0); }
  }
}

/* ---------------------------------------------------------------------
   Init
   --------------------------------------------------------------------- */
(function init(){
  try { if (localStorage.getItem('rw_theme') === 'dark') document.body.classList.add('dark'); } catch(e){}
  loadFavoritesAndNotes();
  render();
  if ('serviceWorker' in navigator) { navigator.serviceWorker.register('rf-sw.js').catch(()=>{}); }
})();
