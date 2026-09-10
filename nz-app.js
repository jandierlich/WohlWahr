/* ======================================================================
   NarzissmusWahr — Aufklärungs-App zum Thema Narzissmus
   Reine Informations-/Bildungs-App. KEINE medizinische Anwendung,
   keine Diagnosestellung, kein Ersatz für Therapie oder Beratung.
   ====================================================================== */

const APP_VERSION = 'v1';

const STATE = {
  screen: (new URLSearchParams(location.search)).get('screen') || 'start',
  subtab: {},
  search: '',
  openAcc: new Set(),
};

/* ---------------------------------------------------------------------
   Icon-Bibliothek (reine SVG-Linien-Icons, keine externen Assets)
   --------------------------------------------------------------------- */
const ICON = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 9.5V20h13V9.5"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  child: '<circle cx="12" cy="6" r="3"/><path d="M12 9v3"/><path d="M7 21c0-4 2.5-6.5 5-6.5s5 2.5 5 6.5"/><path d="M9 15.5 7 21"/><path d="M15 15.5 17 21"/>',
  glossary: '<path d="M4 5h16"/><path d="M4 12h10"/><path d="M4 19h7"/><circle cx="19" cy="17" r="2.4"/><path d="m20.7 18.7 2 2"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
  life: '<path d="M12 22c5-3 8-7 8-12a8 8 0 0 0-16 0c0 5 3 9 8 12z"/><path d="M9 11.5 11 13.5 15.5 9"/>',
  warn: '<path d="M12 2 22 20H2L12 2z"/><path d="M12 9v5"/><path d="M12 17h.01"/>',
  arrow: '<path d="m9 18 6-6-6-6"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8.1 9.6a16 16 0 0 0 6.3 6.3l1.1-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2.1z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  shield: '<path d="M12 2 4 5v6c0 5.5 3.4 9.7 8 11 4.6-1.3 8-5.5 8-11V5l-8-3z"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2 5.5-5.5 2 2-5.5 5.5-2z"/>',
  scroll: '<path d="M8 21h9a2 2 0 0 0 2-2v-2H9v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v1h4"/><path d="M19 17V5a2 2 0 0 0-2-2H8"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z"/>',
};
function svg(name, size=18){ return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[name]||''}</svg>`; }

/* ---------------------------------------------------------------------
   Grundlagen — Was ist Narzissmus, Hintergründe, Formen
   --------------------------------------------------------------------- */
const GRUNDLAGEN = [
  {
    icon: 'compass', title: 'Was ist Narzissmus überhaupt?',
    body: `
      <p>Der Begriff stammt aus dem griechischen Mythos um Narziss, der sich in sein eigenes Spiegelbild verliebte. In der Alltagssprache wird er oft als Schimpfwort für „eingebildete" Menschen benutzt — fachlich ist das Bild differenzierter.</p>
      <p><strong>Jeder Mensch hat narzisstische Anteile.</strong> Ein gesundes Maß an Selbstwertgefühl, Ehrgeiz und dem Wunsch, gesehen zu werden, ist normal und sogar wichtig für Selbstvertrauen und Zielstrebigkeit. Problematisch wird es erst, wenn dieser Anteil so stark ausgeprägt ist, dass er das eigene Fühlen und das Verhalten gegenüber anderen dauerhaft und stark dominiert.</p>
      <p>Man unterscheidet grob drei Ebenen:</p>
      <ul>
        <li><strong>Gesunder Narzissmus:</strong> stabiles Selbstwertgefühl, Freude an Anerkennung, aber auch Empathie und Kritikfähigkeit.</li>
        <li><strong>Narzisstische Persönlichkeitszüge:</strong> auffällig, aber nicht durchgängig — z. B. ein Mensch, der in Konflikten stark abwertend reagiert, im Alltag aber meist rücksichtsvoll ist.</li>
        <li><strong>Narzisstische Persönlichkeitsstörung (NPS):</strong> ein festes, situationsübergreifendes Muster mit deutlichem Leidensdruck für das Umfeld (manchmal auch für die betroffene Person selbst), das eine klinische Diagnose durch Fachpersonal voraussetzt.</li>
      </ul>
      <div class="quote-box">Diese App ersetzt keine Diagnose. Sie hilft, Muster zu verstehen und einzuordnen — eine Einschätzung einer konkreten Person kann nur qualifiziertes Fachpersonal vornehmen.</div>`
  },
  {
    icon: 'layers', title: 'Woher kommt narzisstisches Verhalten? Hintergründe & Ursachen',
    body: `
      <p>Es gibt nicht die eine Ursache — Fachleute gehen von einem Zusammenspiel mehrerer Faktoren aus:</p>
      <ul>
        <li><strong>Bindungserfahrungen in der Kindheit:</strong> Sowohl übermäßige Verwöhnung und Idealisierung ("du bist etwas Besonderes, immer") als auch das Gegenteil — Vernachlässigung, Kälte oder Beschämung — werden mit narzisstischer Entwicklung in Verbindung gebracht. Beides kann dazu führen, dass ein Kind lernt, sein Selbstwertgefühl von äußerer Bestätigung abhängig zu machen, statt ein stabiles inneres Fundament zu entwickeln.</li>
        <li><strong>Fragiler Selbstwert als Kern:</strong> Viele Fachleute beschreiben narzisstisches Verhalten als Schutzmechanismus um einen im Kern instabilen, verletzlichen Selbstwert — die nach außen gezeigte Großartigkeit ist demnach oft eine Kompensation.</li>
        <li><strong>Temperament & Veranlagung:</strong> Manche Persönlichkeitsmerkmale (z. B. hohe Sensibilität für Status oder Kränkung) scheinen eine gewisse Anfälligkeit mitzubringen.</li>
        <li><strong>Gesellschaftliche Faktoren:</strong> Leistungsdruck, Social Media und eine Kultur der Selbstdarstellung werden diskutiert, ob und wie stark sie narzisstische Tendenzen begünstigen — hier ist sich die Forschung nicht einig.</li>
      </ul>
      <p>Wichtig für den Alltag: Eine Erklärung ist keine Entschuldigung. Zu verstehen, warum jemand so handelt, kann helfen, es weniger persönlich zu nehmen — es ändert aber nichts daran, dass verletzendes Verhalten Grenzen braucht.</p>`
  },
  {
    icon: 'layers', title: 'Formen: offen, verdeckt, malign, kommunal',
    body: `
      <p>Narzisstisches Verhalten zeigt sich nicht immer gleich. In der Fachliteratur werden häufig folgende Ausprägungen unterschieden:</p>
      <ul>
        <li><strong>Grandios / offen:</strong> selbstbewusst, dominant, sucht aktiv Bewunderung, wirkt nach außen oft charmant und erfolgreich, reagiert aber empfindlich auf Kritik.</li>
        <li><strong>Vulnerabel / verdeckt:</strong> wirkt eher schüchtern, ängstlich oder als "ewiges Opfer", innerlich aber ebenso stark mit dem eigenen Selbstwert beschäftigt; Kränkungen werden eher durch Rückzug, Schmollen oder passiv-aggressives Verhalten ausgedrückt statt durch offene Dominanz.</li>
        <li><strong>Maligne Ausprägung:</strong> Kombination aus Größengefühl mit ausgeprägter Kälte, Misstrauen und teils aggressivem oder manipulativem Verhalten — in der Forschung als besonders belastend für das Umfeld beschrieben.</li>
        <li><strong>Kommunal:</strong> die eigene Großartigkeit wird über vermeintliche Fürsorge oder Hilfsbereitschaft dargestellt ("Niemand kümmert sich so aufopferungsvoll wie ich") — nach außen wirkt das oft altruistisch, folgt aber demselben Muster von Selbstbestätigung.</li>
      </ul>
      <p>Diese Typen sind Modelle, keine Schubladen — in der Realität mischen sich Anteile, und Verhalten kann je nach Situation, Tagesform und Gegenüber variieren.</p>`
  },
  {
    icon: 'warn', title: 'Persönlichkeitszug, Störung oder einfach ein schwieriger Mensch?',
    body: `
      <p>Nicht jeder Mensch, der egoistisch, rücksichtslos oder eitel wirkt, hat eine narzisstische Persönlichkeitsstörung. Der Unterschied liegt vor allem in:</p>
      <ul>
        <li><strong>Ausmaß:</strong> Wie stark und wie oft zeigt sich das Muster?</li>
        <li><strong>Starrheit:</strong> Zeigt es sich in fast allen Lebensbereichen (Familie, Job, Freundschaft) gleichermaßen, oder situativ?</li>
        <li><strong>Leidensdruck:</strong> Entsteht durch das Verhalten deutliches Leid — bei anderen und/oder bei der Person selbst?</li>
      </ul>
      <p>Eine offizielle Diagnose "Narzisstische Persönlichkeitsstörung" darf ausschließlich von Ärzt*innen oder Psychotherapeut*innen anhand anerkannter Kriterien (z. B. ICD-11 oder DSM-5) gestellt werden — nach ausführlicher Untersuchung, nicht nach ein paar auffälligen Verhaltensweisen. Diese App liefert bewusst <strong>keine</strong> Checkliste zum "Ferndiagnostizieren" von Angehörigen, Partner*innen oder Kolleg*innen. Was sie liefert: Sprache und Orientierung, um Muster zu erkennen und besser mit ihnen umzugehen — unabhängig davon, ob am Ende eine klinische Diagnose stünde oder nicht.</p>`
  },
  {
    icon: 'info', title: 'Häufige Mythen im Faktencheck',
    body: `
      <p>Um das Thema Narzissmus ranken sich viele vereinfachte oder falsche Vorstellungen. Ein Überblick über verbreitete Mythen:</p>
      <ul>
        <li><strong>Mythos: "Narzisst*innen lieben sich selbst zu sehr."</strong> Fachlich üblicher ist die gegenteilige Sichtweise: Im Kern steht häufig ein instabiler, verletzlicher Selbstwert — die nach außen gezeigte Großartigkeit gilt vielen Fachleuten eher als Kompensation als als "zu viel" echte Selbstliebe.</li>
        <li><strong>Mythos: "Das ist nur bei Männern/Erfolgreichen/Prominenten ein Thema."</strong> Narzisstische Muster kommen in allen Geschlechtern, Berufen und sozialen Schichten vor — auffällig ist nur, dass sie sich je nach Rolle unterschiedlich zeigen können.</li>
        <li><strong>Mythos: "Man erkennt es sofort."</strong> Gerade verdeckter (vulnerabler) Narzissmus wirkt nach außen oft schüchtern, zurückhaltend oder wie ein "ewiges Opfer" — das Gegenteil des Klischees vom lauten Selbstdarsteller.</li>
        <li><strong>Mythos: "Mit genug Liebe/Geduld ändert sich das schon."</strong> Verhaltensänderung setzt in aller Regel echte Einsicht und aktive therapeutische Arbeit voraus — beides kann von außen nicht erzwungen werden, so sehr sich Angehörige das auch wünschen.</li>
        <li><strong>Mythos: "Wer narzisstische Züge hat, ist automatisch gewalttätig oder kriminell."</strong> Die überwiegende Mehrheit zeigt kein gewalttätiges Verhalten — problematisch sind vor allem emotionale Dynamiken wie Abwertung, Kontrolle oder Manipulation, nicht körperliche Gewalt.</li>
      </ul>`
  },
];

/* ---------------------------------------------------------------------
   Navigation / Rendering-Grundgerüst folgt in app.part2.js
   --------------------------------------------------------------------- */

/* ---------------------------------------------------------------------
   Erwachsene — Subtabs: erkennen, alltag, umgang, trennung, selbstfuersorge
   --------------------------------------------------------------------- */
const ERWACHSENE = {
  order: ['erkennen','beziehung','umgang','trennung','selbstfuersorge'],
  labels: { erkennen: 'Muster erkennen', beziehung: 'In Beziehung & Job', umgang: 'Umgang im Alltag', trennung: 'Trennung & Ausstieg', selbstfuersorge: 'Selbstfürsorge' },
  erkennen: [
    { icon:'heart', title:'Love Bombing: der intensive Beginn', body:`
      <p>Viele Betroffene berichten, dass Beziehungen zu narzisstischen Menschen ungewöhnlich intensiv beginnen: überschwängliche Komplimente, schnelle Zukunftspläne, das Gefühl, "die eine wahre Liebe" gefunden zu haben. Diese Phase wird oft als <strong>Love Bombing</strong> bezeichnet.</p>
      <p>Das macht sie nicht automatisch problematisch — viele gesunde Beziehungen beginnen ebenfalls intensiv. Ein Warnsignal wird es eher in Kombination mit anderen Mustern: sehr schnelles Werben um Nähe und Bindung, kombiniert mit Druck, wichtige Entscheidungen (Zusammenziehen, Verlobung) zu beschleunigen, und einem auffälligen Umschwung, sobald die Beziehung "sicher" wirkt.</p>`},
    { icon:'layers', title:'Idealisierung – Abwertung – Verwerfung (der Zyklus)', body:`
      <p>Ein häufig beschriebenes Muster in Beziehungen zu Menschen mit ausgeprägten narzisstischen Zügen verläuft in Phasen:</p>
      <ul>
        <li><strong>Idealisierung:</strong> Die andere Person wird als perfekt dargestellt, überschwänglich gelobt.</li>
        <li><strong>Abwertung:</strong> Kleine Fehler werden plötzlich zum Problem, Kritik häuft sich, das Verhalten wird kühler oder aggressiver.</li>
        <li><strong>Verwerfung / Zurückweisung:</strong> Rückzug, Kontaktabbruch oder eine neue Person rückt in den Fokus — bis der Zyklus von vorn beginnt.</li>
      </ul>
      <p>Dieses Auf und Ab kann emotional sehr belastend sein, weil es abwechselnd Hoffnung und Verunsicherung erzeugt — ein Mechanismus, der in der Fachliteratur mit <em>Trauma Bonding</em> (siehe Lexikon) in Verbindung gebracht wird.</p>`},
    { icon:'warn', title:'Gaslighting: die eigene Wahrnehmung wird infrage gestellt', body:`
      <p>Gaslighting bezeichnet ein Verhalten, bei dem die Realität, Erinnerung oder Wahrnehmung einer anderen Person systematisch angezweifelt wird — oft mit Sätzen wie "Das habe ich nie gesagt", "Du bildest dir das ein" oder "Du bist einfach zu empfindlich".</p>
      <p>Vereinzelt kommt so etwas in fast jeder Beziehung vor. Problematisch wird es als wiederkehrendes Muster: Betroffene beginnen mit der Zeit, an der eigenen Erinnerung, dem eigenen Urteilsvermögen oder sogar der eigenen geistigen Gesundheit zu zweifeln.</p>
      <p><strong>Ein praktisches Gegenmittel:</strong> Wichtige Gespräche oder Zusagen schriftlich festhalten (Nachricht, Tagebuch, Termin-Notiz) — das schafft einen Anker, der unabhängig von der Erinnerung im Nachhinein besteht.</p>`},
    { icon:'shield', title:'DARVO & Schuldumkehr', body:`
      <p><strong>DARVO</strong> steht für <em>Deny, Attack, Reverse Victim and Offender</em> — auf Deutsch etwa: Leugnen, Angreifen, Opfer- und Täterrolle vertauschen. Wird jemand mit eigenem Fehlverhalten konfrontiert, reagiert er oder sie nicht mit Einsicht, sondern:</p>
      <ol style="margin:0 0 10px;padding-left:18px">
        <li>Leugnet den Vorwurf komplett,</li>
        <li>greift die vorwerfende Person an (z. B. ihren Charakter, ihre Motive),</li>
        <li>stellt sich am Ende selbst als eigentliches Opfer der Situation dar.</li>
      </ol>
      <p>Wer das erkennt, kann sich leichter davor schützen, im Gespräch plötzlich selbst in der Verteidigung zu landen, obwohl ursprünglich das eigene Anliegen im Raum stand.</p>`},
    { icon:'users', title:'Triangulation & Flying Monkeys', body:`
      <p><strong>Triangulation</strong> bedeutet, eine dritte Person (oder Meinung) in einen Konflikt einzubringen, um Position zu gewinnen — z. B. "Dein Bruder findet das auch komisch von dir" oder ein Ex-Partner wird als Vergleich benutzt, um eifersüchtig oder unsicher zu machen.</p>
      <p><strong>Flying Monkeys</strong> ("fliegende Affen") ist ein umgangssprachlicher Begriff aus dem Selbsthilfe-Kontext für Personen aus dem Umfeld, die — oft unwissentlich — für Botschaften, Druck oder Kontrolle eingespannt werden, etwa um eine Trennung zu verhindern oder Betroffene unter Druck zu setzen.</p>`},
    { icon:'moon', title:'Silent Treatment & Bestrafung durch Rückzug', body:`
      <p>Beim <em>Silent Treatment</em> wird Kommunikation komplett verweigert — teils über Stunden, teils über Tage — als Reaktion auf einen (oft aus Außensicht kleinen) Konflikt. Anders als ein normales "kurz Abstand brauchen" wirkt es gezielt bestrafend und wird oft erst beendet, wenn die andere Person sich entschuldigt oder nachgibt, unabhängig davon, wer eigentlich im Recht war.</p>`},
    { icon:'warn', title:'Narzisstische Wut ("Narcissistic Rage")', body:`
      <p>Manche Menschen mit ausgeprägten narzisstischen Zügen reagieren auf Kritik, Zurückweisung oder das Gefühl von Kontrollverlust mit einer unverhältnismäßig heftigen Wutreaktion — plötzlich, intensiv und für Außenstehende oft überraschend im Vergleich zum eigentlichen Anlass. Fachlich wird das teils als Schutzreaktion auf eine als existenziell erlebte Kränkung des Selbstwerts gedeutet.</p>
      <p>Für Betroffene im Umfeld ist wichtig: Die Heftigkeit der Reaktion steht oft in keinem Verhältnis zum tatsächlichen "Auslöser" — das eigene Verhalten war meist nicht der wirkliche Grund, auch wenn es im Moment so wirkt.</p>`},
    { icon:'layers', title:'Chronisches Neid- und Konkurrenzverhalten', body:`
      <p>Ein wiederkehrendes Muster ist ausgeprägter Neid gegenüber den Erfolgen anderer — oder umgekehrt die feste Überzeugung, andere seien neidisch auf einen selbst. Beides kann dazu führen, dass eigene gute Nachrichten kaum geteilt werden können, ohne kleingeredet, übertrumpft oder mit Argwohn quittiert zu werden.</p>`},
  ],
  beziehung: [
    { icon:'heart', title:'In der Partnerschaft', body:`
      <p>Typische Berichte aus Partnerschaften mit stark narzisstisch geprägten Menschen: das eigene Befinden wird zur Nebensache, eigene Erfolge werden klein geredet oder für sich vereinnahmt, Entscheidungen laufen meist einseitig, Kritik wird nicht vertragen, während Kritik am Partner / an der Partnerin häufig und hart ausfällt.</p>
      <p>Gleichzeitig kann so eine Beziehung nach außen sehr gut funktionieren — narzisstisch geprägte Menschen können charmant, erfolgreich und in der Öffentlichkeit fürsorglich wirken. Der Unterschied zwischen "Fassade" und privatem Verhalten ist oft genau das Auffällige, wenn Betroffene später zurückblicken.</p>`},
    { icon:'users', title:'Am Arbeitsplatz', body:`
      <p>Narzisstisch geprägte Vorgesetzte oder Kolleg*innen zeigen sich häufig durch: Erfolge des Teams werden für sich beansprucht, Fehler werden konsequent nach unten delegiert, Lob wird sparsam und meist strategisch (nicht ehrlich gemeint) verteilt, Konkurrenz wird auch unter Kolleg*innen aktiv geschürt.</p>
      <ul>
        <li>Absprachen und Zusagen möglichst schriftlich festhalten (E-Mail statt nur mündlich).</li>
        <li>Eigene Leistungen selbst sichtbar machen, statt darauf zu vertrauen, dass sie "schon auffallen".</li>
        <li>Bei anhaltenden Grenzüberschreitungen: Personalabteilung, Betriebsrat oder externe Beratung (siehe Bereich "Hilfe") einbeziehen.</li>
      </ul>`},
    { icon:'users', title:'In der Familie & unter Geschwistern', body:`
      <p>Auch Elternteile, Geschwister oder andere Familienmitglieder können ausgeprägte narzisstische Muster zeigen. Häufig beschrieben: ein Familienmitglied wird bevorzugt ("Goldkind"), ein anderes zum Sündenbock erklärt (siehe Lexikon), Familientreffen drehen sich fast ausschließlich um die eine Person, eigene Grenzen werden als Illoyalität gewertet.</p>
      <p>Solche Dynamiken bestehen oft schon seit der Kindheit — mehr dazu im Bereich "Kinder", auch wenn die Betroffenen inzwischen selbst erwachsen sind.</p>`},
    { icon:'users', title:'Unter Freund*innen', body:`
      <p>Auch Freundschaften können dieses Muster zeigen: die Freundschaft dreht sich fast ausschließlich um die Themen und Bedürfnisse der anderen Person, eigene guten Nachrichten werden übertrumpft ("Das ist ja gar nichts, mir ist Folgendes passiert…"), Kritik wird mit Liebesentzug beantwortet.</p>`},
    { icon:'users', title:'Als Schwiegereltern oder Großeltern', body:`
      <p>Ein oft übersehenes Umfeld: Schwiegereltern oder Großeltern mit ausgeprägten narzisstischen Zügen können versuchen, Erziehungsentscheidungen der eigenen Kinder zu untergraben, Enkelkinder gegen ein Elternteil auszuspielen, oder Zuwendung zu Enkeln strategisch als Druckmittel gegenüber den Eltern einzusetzen ("Wenn ich die Kinder nicht öfter sehen darf, dann…").</p>
      <p>Klare, gemeinsam abgestimmte Absprachen zwischen den Eltern und wenig Diskussionsspielraum in Erziehungsfragen gegenüber Dritten helfen, solche Dynamiken einzudämmen.</p>`},
  ],
  umgang: [
    { icon:'shield', title:'Grey Rock: bewusst uninteressant werden', body:`
      <p>Die "Grey Rock"-Methode (wörtlich: "grauer Stein") bedeutet, in Kontakten so neutral, unaufgeregt und emotionslos wie möglich zu reagieren — wie ein Stein am Wegesrand, an dem es nichts Interessantes zu holen gibt. Ziel: keine emotionale Reaktion mehr liefern, mit der sich weiter "arbeiten" lässt.</p>
      <p>Praktisch heißt das: kurze, sachliche Antworten, keine Diskussion über Gefühle oder Motive, keine Rechtfertigung. Diese Methode eignet sich besonders für Kontakte, die sich nicht vermeiden lassen (z. B. gemeinsames Sorgerecht, Arbeitsplatz).</p>`},
    { icon:'shield', title:'JADE vermeiden: nicht rechtfertigen, argumentieren, verteidigen, erklären', body:`
      <p>JADE steht für <em>Justify, Argue, Defend, Explain</em>. Die Idee dahinter: In Diskussionen mit stark manipulativ agierenden Personen führt jede Rechtfertigung, jedes Argument, jede Verteidigung und jede Erklärung oft nur zu neuem Angriffsmaterial — der Streit verlängert sich, ohne dass eine Einigung möglich wird.</p>
      <p>Alternative: kurze, klare Aussagen ohne ausführliche Begründung — z. B. "Das mache ich nicht" statt einer langen Erklärung, warum nicht. Das fühlt sich anfangs oft ungewohnt "unhöflich" an, ist aber häufig die wirksamere Strategie.</p>`},
    { icon:'shield', title:'Grenzen setzen — und halten', body:`
      <p>Grenzen sind keine Bestrafung, sondern eine Ansage, was man selbst bereit ist zu tolerieren. Wirksame Grenzen sind:</p>
      <ul>
        <li><strong>Konkret:</strong> "Ich lege auf, wenn du anfängst zu schreien" statt "Sei bitte netter zu mir".</li>
        <li><strong>Durchsetzbar:</strong> nur ankündigen, was man auch tatsächlich umsetzen kann und will.</li>
        <li><strong>Konsequent:</strong> Grenzen, die einmal nachgegeben werden, verlieren an Wirkung — Konsequenz ist wichtiger als Härte.</li>
      </ul>
      <p>Mehr konkrete Formulierungen dazu im Bereich "Tipps".</p>`},
    { icon:'scroll', title:'Dokumentieren', body:`
      <p>Besonders bei andauernden Konflikten (Sorgerecht, Arbeitsrecht, Nachbarschaftsstreit) hilft eine sachliche Dokumentation: Datum, was gesagt/getan wurde, wer anwesend war. Das schützt vor Gaslighting im Nachhinein und kann im Ernstfall auch rechtlich relevant sein.</p>`},
    { icon:'bulb', title:'Erwartungen realistisch anpassen', body:`
      <p>Ein oft schmerzhafter, aber befreiender Schritt: die Hoffnung loszulassen, dass die andere Person sich grundlegend ändert, nur weil man selbst sich noch mehr bemüht, noch verständnisvoller ist oder noch mehr erklärt. Das bedeutet nicht Resignation — sondern die eigene Energie auf das zu richten, was man selbst beeinflussen kann: die eigenen Reaktionen, Grenzen und Entscheidungen.</p>`},
    { icon:'shield', title:'Beschämung vermeiden — auch im Streit', body:`
      <p>Auch im Umgang mit stark narzisstisch geprägten Erwachsenen hilft es meist wenig, öffentlich bloßzustellen oder mit Häme zu reagieren, so verständlich der Impuls sein mag — das verstärkt häufig eher Abwehr und Eskalation, statt zu Einsicht zu führen. Sachlich, knapp und ohne Publikum zu bleiben, wirkt in der Regel wirksamer, wenn ein Gespräch überhaupt Aussicht auf Erfolg haben soll.</p>`},
    { icon:'scroll', title:'Kompromisse: wann sie sich lohnen — und wann nicht', body:`
      <p>Nicht jede Meinungsverschiedenheit erfordert Grey Rock oder Grenzsetzung — bei alltäglichen, folgenlosen Themen kann ein normaler Kompromiss weiterhin sinnvoll sein. Aufmerksam wird es vor allem, wenn Kompromisse einseitig immer nur von einer Seite verlangt werden, oder wenn ein einmal gefundener Kompromiss regelmäßig im Nachhinein wieder infrage gestellt wird.</p>`},
  ],
  trennung: [
    { icon:'shield', title:'No Contact & Low Contact', body:`
      <p><strong>No Contact</strong> bedeutet, jeden Kontakt konsequent zu vermeiden — telefonisch, digital, persönlich. Das ist oft die wirksamste Methode, ist aber nicht immer möglich (z. B. bei gemeinsamen Kindern oder beruflicher Verbindung).</p>
      <p>In solchen Fällen wird häufig <strong>Low Contact</strong> praktiziert: Kontakt wird auf das absolut Notwendige reduziert, möglichst sachlich und schriftlich (E-Mail statt Anruf), um Beweise zu haben und emotionale Eskalation zu vermeiden.</p>`},
    { icon:'warn', title:'Hoovering erkennen', body:`
      <p>"Hoovering" (nach der Staubsauger-Marke Hoover — "wieder einsaugen") beschreibt Versuche einer Ex-Partnerin oder eines Ex-Partners, nach einer Trennung oder einem Kontaktabbruch wieder Kontakt herzustellen: plötzliche liebevolle Nachrichten, vorgetäuschte Notfälle, Geschenke oder Krisen, die genau dann auftauchen, wenn man beginnt, emotional Abstand zu gewinnen.</p>
      <p>Zu wissen, dass dieses Muster einen Namen hat, hilft vielen Betroffenen, es beim nächsten Mal schneller zu erkennen und nicht persönlich zu nehmen.</p>`},
    { icon:'shield', title:'Sicherheit geht vor', body:`
      <p>Wenn eine Trennung mit Kontrolle, Drohungen oder Gewalt (auch angedroht) verbunden ist, hat der eigene Schutz Vorrang vor jeder Kommunikationsstrategie. In solchen Fällen sind spezialisierte Beratungsstellen und ggf. die Polizei die richtigen Ansprechpartner — Kontakte dazu im Bereich "Hilfe".</p>`},
    { icon:'scroll', title:'Finanzielle und rechtliche Trennung absichern', body:`
      <p>Kontrolle über Finanzen ist ein häufiges Element belastender Beziehungen. Bei einer Trennung hilft es, frühzeitig eigene Konten zu klären, wichtige Dokumente (Ausweise, Verträge, Kontoauszüge) an einem sicheren Ort außerhalb der gemeinsamen Wohnung zu sichern und sich rechtlich beraten zu lassen — etwa zu Unterhalt, gemeinsamem Eigentum oder Sorgerecht. Anwaltliche und behördliche Beratungsstellen finden sich im Bereich "Hilfe".</p>`},
    { icon:'users', title:'Wenn gemeinsame Kinder da sind: Co-Elternschaft', body:`
      <p>Eine vollständige Trennung des Kontakts ist bei gemeinsamem Sorgerecht oft nicht möglich. Bewährt hat sich für viele Betroffene ein sehr strukturierter, sachlicher Kommunikationsstil ("Parallel Parenting"): feste Übergabezeiten, schriftliche statt mündliche Absprachen, möglichst wenig gemeinsame Themen außerhalb der Kinderorganisation. Mehr dazu auch im Bereich "Kinder".</p>`},
  ],
  selbstfuersorge: [
    { icon:'life', title:'Sich selbst wieder trauen', body:`
      <p>Nach einer langen Beziehung oder Familiensituation mit starkem narzisstischem Einfluss berichten viele Betroffene, das Vertrauen in die eigene Wahrnehmung verloren zu haben. Ein erster Schritt ist oft, kleine eigene Entscheidungen bewusst wieder selbst zu treffen und sich bewusst zu machen: "Meine Wahrnehmung ist gültig, auch wenn sie mir lange abgesprochen wurde."</p>`},
    { icon:'users', title:'Unterstützungsnetzwerk aufbauen', body:`
      <p>Isolation ist häufig Teil solcher Dynamiken — bewusst oder unbewusst. Der Kontakt zu Freund*innen, Familie oder Selbsthilfegruppen (online wie vor Ort) wieder zu pflegen oder neu aufzubauen, ist ein wichtiger Schutzfaktor.</p>`},
    { icon:'bulb', title:'Professionelle Unterstützung', body:`
      <p>Eine Psychotherapie oder Beratung ersetzt diese App nicht — sie ist häufig der wirksamste Weg, um Erlebtes zu verarbeiten, eigene Muster (z. B. warum man in solche Dynamiken geraten ist) zu verstehen und langfristig gestärkt daraus hervorzugehen. Adressen und Anlaufstellen im Bereich "Hilfe".</p>`},
    { icon:'warn', title:'Rückfälle in alte Muster erkennen', body:`
      <p>Es ist normal, nach einer belastenden Beziehung oder Familiensituation zeitweise wieder in alte Reaktionsmuster zu rutschen — etwa sich zu rechtfertigen, wo es nicht nötig wäre, oder Kontakt wieder aufzunehmen, obwohl es nicht guttut. Das ist kein Rückschritt "bei null", sondern ein normaler, oft nicht linearer Teil des Verarbeitungsprozesses.</p>`},
    { icon:'life', title:'Selbstwert unabhängig von Bestätigung aufbauen', body:`
      <p>Ein hilfreicher, langfristiger Fokus: das eigene Selbstwertgefühl schrittweise von der Bestätigung durch andere lösen — etwa durch eigene, unabhängig von äußerer Anerkennung gesetzte kleine Ziele, das bewusste Anerkennen eigener Werte und Stärken, und die Erfahrung, dass die eigene Meinung über sich selbst tragfähig ist, auch ohne dass sie von außen bestätigt wird.</p>`},
  ],
};

/* ---------------------------------------------------------------------
   Kinder — Subtabs: kinder (für Kinder/Jugendliche), eltern, coparenting
   --------------------------------------------------------------------- */
const KINDER = {
  order: ['fuerkinder','fuereltern','kindeigen','coparenting'],
  labels: { fuerkinder: 'Für Kinder & Jugendliche', fuereltern: 'Für Eltern & Bezugspersonen', kindeigen: 'Wenn das Kind Züge zeigt', coparenting: 'Wenn ein Elternteil betroffen ist' },
  fuerkinder: [
    { icon:'child', title:'Warum ist Mama oder Papa manchmal so?', body:`
      <p>Manche Eltern haben es sehr schwer, sich in andere hineinzuversetzen — auch in ihre eigenen Kinder. Das nennt man manchmal "Narzissmus". Das bedeutet nicht, dass du etwas falsch gemacht hast. Es bedeutet, dass dieser Elternteil selbst Schwierigkeiten hat, mit Gefühlen umzugehen — seinen eigenen und denen von anderen.</p>
      <p><strong>Wichtig zu wissen:</strong> Du bist nicht schuld daran, wie sich ein Elternteil verhält. Kinder können das Verhalten von Erwachsenen nicht "reparieren", egal wie sehr sie sich bemühen.</p>`},
    { icon:'heart', title:'Deine Gefühle sind richtig', body:`
      <p>Wenn du manchmal traurig, wütend oder verwirrt bist, weil ein Elternteil dich lobt und im nächsten Moment kritisiert, ist das kein Zeichen, dass mit dir etwas nicht stimmt. Deine Gefühle dazu sind völlig in Ordnung — auch wenn dir vielleicht gesagt wurde, du seist "zu empfindlich".</p>`},
    { icon:'users', title:'Mit wem kann ich reden?', body:`
      <p>Es hilft, mit jemandem zu sprechen, dem du vertraust: dem anderen Elternteil, Großeltern, einer Lehrerin, einem Schulsozialarbeiter oder Vertrauenslehrer. Es gibt auch kostenlose und anonyme Beratungsstellen extra für Kinder und Jugendliche, telefonisch, per Chat oder E-Mail — du findest sie im Bereich "Hilfe" (z. B. die Nummer gegen Kummer).</p>`},
    { icon:'shield', title:'Du darfst auch mal "Nein" sagen', body:`
      <p>Auch Kindern steht zu, eigene Grenzen zu haben — z. B. nicht über alles reden zu wollen, was ein Elternteil hören will, oder sich zurückzuziehen, wenn ein Streit zwischen den Eltern ausbricht. Das ist kein "Ungehorsam", sondern gesunder Selbstschutz.</p>`},
    { icon:'bulb', title:'Du musst nicht "Schiedsrichter*in" sein', body:`
      <p>Wenn deine Eltern sich streiten oder schlecht übereinander reden, ist das nicht deine Aufgabe zu lösen — auch wenn es sich manchmal so anfühlt, als würde von dir erwartet, Partei zu ergreifen oder zu vermitteln. Es ist in Ordnung zu sagen: "Ich möchte darüber nicht mit dir reden, das ist Erwachsenensache."</p>`},
  ],
  fuereltern: [
    { icon:'child', title:'Wenn ein Elternteil stark narzisstisch geprägt ist: typische Rollen', body:`
      <p>In der Fachliteratur zu Familien mit stark narzisstisch geprägten Elternteilen werden häufig wiederkehrende Rollen beschrieben, die Kinder — oft unbewusst und unfreiwillig — zugewiesen bekommen:</p>
      <ul>
        <li><strong>"Goldkind":</strong> wird idealisiert, als Erweiterung des eigenen Egos des Elternteils behandelt, muss oft Erfolge liefern, die dem Elternteil selbst Ansehen bringen.</li>
        <li><strong>Sündenbock:</strong> bekommt die Schuld für Konflikte oder schlechte Stimmung in der Familie zugeschrieben, wird häufiger kritisiert oder bestraft als Geschwister.</li>
        <li><strong>Verlorenes Kind:</strong> zieht sich zurück, versucht, möglichst wenig aufzufallen, um Konflikten zu entgehen.</li>
      </ul>
      <p>Diese Rollen können zwischen Geschwistern auch wechseln oder sich vermischen — sie sind ein Erklärungsmodell, keine feste Diagnose.</p>`},
    { icon:'warn', title:'Parentifizierung: wenn Kinder zu Erwachsenen gemacht werden', body:`
      <p>Parentifizierung bezeichnet eine Umkehr der natürlichen Rollen: Das Kind übernimmt emotionale oder praktische Aufgaben, die eigentlich Erwachsenen zustehen — es tröstet den Elternteil, vermittelt in Erwachsenenkonflikten, kümmert sich um Geschwister oder den Haushalt weit über sein Alter hinaus.</p>
      <p>Das kann kurzfristig unauffällig oder sogar "reif" wirken, ist aber auf Dauer eine erhebliche Belastung für die kindliche Entwicklung.</p>`},
    { icon:'bulb', title:'Wie spreche ich mit dem Kind darüber?', body:`
      <p>Ein paar Grundprinzipien, die Fachleute für Gespräche mit betroffenen Kindern empfehlen:</p>
      <ul>
        <li>Altersgerecht bleiben — keine erwachsenen Konfliktdetails, aber ehrliche, einfache Erklärungen.</li>
        <li>Den anderen Elternteil nicht pauschal "schlechtmachen" — Kinder lieben oft beide Elternteile und geraten in Loyalitätskonflikte, wenn sie sich entscheiden sollen.</li>
        <li>Gefühle des Kindes benennen und bestätigen, statt sie herunterzuspielen ("Das ist doch nicht so schlimm").</li>
        <li>Dem Kind klarmachen: Es trägt keine Verantwortung für das Verhalten oder die Gefühle des Elternteils.</li>
      </ul>`},
    { icon:'life', title:'Langfristige Folgen — und was hilft', body:`
      <p>Kinder, die in einem stark narzisstisch geprägten Umfeld aufwachsen, berichten als Erwachsene häufiger von Unsicherheit im eigenen Selbstwert, Schwierigkeiten, eigene Bedürfnisse zu äußern, oder einer starken Neigung, es allen recht machen zu wollen. Das ist kein Automatismus — viele entwickeln auch besondere Stärken wie hohe Empathie oder Krisenkompetenz.</p>
      <p>Schützend wirken vor allem: mindestens eine verlässliche, liebevolle Bezugsperson (muss kein Elternteil sein), altersgerechte Aufklärung über die Situation, und bei Bedarf kinder- und jugendpsychotherapeutische Begleitung — kein Kind muss das allein verarbeiten.</p>`},
    { icon:'shield', title:'Als nicht-narzisstischer Elternteil: die eigene Rolle stärken', body:`
      <p>Wenn ein Elternteil stark narzisstisch geprägt ist, wird der andere Elternteil oft zur wichtigsten stabilisierenden Kraft für das Kind. Hilfreich dafür: eigene Grenzen gegenüber dem Partner/der Partnerin konsequent vorleben (Kinder lernen viel durch Beobachtung), dem Kind bewusst ungeteilte Zeit ohne Ablenkung schenken, und sich selbst Unterstützung holen, um langfristig belastbar zu bleiben — erschöpfte Eltern können Kinder schwerer auffangen.</p>`},
  ],
  kindeigen: [
    { icon:'child', title:'Ich-Bezogenheit als normale Entwicklungsphase', body:`
      <p>Kleine Kinder sind aus Entwicklungssicht "von Natur aus" stark auf sich selbst bezogen — das ist keine Störung, sondern ein normaler Baustein der Entwicklung. Erst nach und nach lernt ein Kind, sich in andere hineinzuversetzen (Perspektivübernahme), eigene Impulse zurückzustellen und Regeln zu akzeptieren, die nicht sofort einen eigenen Vorteil bringen.</p>
      <p>Typische, unauffällige Phasen: das trotzige "Ich will aber jetzt!" im Kleinkindalter, das Angeben mit eigenen Fähigkeiten im Grundschulalter, oder eine Phase im Jugendalter, in der sich vieles um das eigene Aussehen, die eigene Wirkung und Status in der Gruppe dreht. All das gehört zu einer gesunden Identitätsentwicklung dazu und wächst sich in aller Regel mit zunehmendem Alter und passender Begleitung von selbst aus.</p>
      <div class="quote-box">Ein Kind, das sich manchmal egoistisch verhält, "ist" kein Narzisst. Diese Seite unterscheidet zwischen alterstypischem Verhalten und einem Muster, das über längere Zeit auffällig stärker, starrer und breiter ist als bei Gleichaltrigen.</div>`},
    { icon:'warn', title:'Wann ist mehr als eine Phase dahinter?', body:`
      <p>Fachleute schauen bei der Einschätzung nicht auf einzelne Situationen, sondern auf ein wiederkehrendes Muster über mehrere Lebensbereiche (zuhause, Schule, Freundeskreis) und einen längeren Zeitraum. Mögliche Hinweise, die zusammen genommen aufmerksam machen können:</p>
      <ul>
        <li>Anhaltend geringe Bereitschaft, sich zu entschuldigen oder eigene Fehler überhaupt zu sehen — auch nicht nach wiederholten, ruhigen Gesprächen.</li>
        <li>Andere werden regelmäßig abgewertet, ausgenutzt oder als reine Mittel zum eigenen Zweck behandelt (z. B. Freundschaften nur, solange ein Vorteil entsteht).</li>
        <li>Extreme Reaktionen auf ganz normale Kritik oder ein Nicht-gewinnen (Wutausbrüche, tagelanger Groll, Rachegedanken), deutlich über das für das Alter Übliche hinaus.</li>
        <li>Ein starkes Anspruchsdenken: Regeln, Konsequenzen oder ein "Nein" werden grundsätzlich als ungerecht empfunden, unabhängig vom Inhalt.</li>
      </ul>
      <p>Auch dann gilt: Das ist kein Anlass für eine Ferndiagnose durch Eltern. Es ist ein Anlass, genauer hinzuschauen, das eigene Erziehungsverhalten zu reflektieren und bei Bedarf fachliche Einschätzung (Erziehungsberatung, Kinder- und Jugendpsychotherapie) einzuholen.</p>`},
    { icon:'layers', title:'Wie solche Muster bei Kindern begünstigt werden können', body:`
      <p>Entwicklungspsycholog*innen diskutieren vor allem zwei gegensätzliche Erziehungsmuster als mögliche Risikofaktoren — interessanterweise nicht "zu wenig Liebe", sondern eher eine Schieflage bei Lob und Wertschätzung:</p>
      <ul>
        <li><strong>Überhöhtes Lob & Sonderstellung ("Overpraising"):</strong> Ein Kind wird nicht für konkrete Anstrengung oder Verhalten gelobt, sondern pauschal als etwas Besonderes, Überlegenes oder "über den Regeln stehend" dargestellt — z. B. "Du bist viel klüger als die anderen Kinder in deiner Klasse."</li>
        <li><strong>Fehlende Wärme trotz hoher Erwartungen:</strong> Zuwendung wird stark an Leistung oder Erfolg geknüpft, echte emotionale Nähe und Trost bei Misserfolg fehlen dagegen — das Kind lernt, dass es nur für Leistung, nicht als Person geliebt wird.</li>
      </ul>
      <p>Beide Muster können — müssen aber nicht zwangsläufig — dazu beitragen, dass sich ein instabiles, von äußerer Bestätigung abhängiges Selbstwertgefühl entwickelt. Wichtig zu wissen: Kein Elternteil ist "schuld" an einem einzelnen Verhalten des Kindes — Temperament, Schule, Freundeskreis und viele weitere Faktoren spielen ebenfalls eine Rolle.</p>`},
    { icon:'bulb', title:'Loben, ohne zu überhöhen', body:`
      <p>Ein praktischer Ansatz aus der Entwicklungspsychologie: Anstrengung, konkretes Verhalten und Fortschritt loben — nicht pauschale Eigenschaften oder eine Sonderstellung.</p>
      <ul>
        <li>Eher: "Du bist heute wirklich dabeigeblieben, obwohl es schwierig war." statt "Du bist das klügste Kind der Klasse."</li>
        <li>Eher: "Schön, wie du deiner Schwester geholfen hast." statt "Du bist einfach viel netter als andere Kinder."</li>
        <li>Erfolge dürfen gefeiert werden — ohne sie mit einer Abwertung anderer zu verknüpfen ("Du bist besser als…").</li>
      </ul>
      <p>Das nimmt dem Kind nichts weg — im Gegenteil: Es lernt, dass Anerkennung an das eigene Handeln geknüpft ist und damit selbst beeinflussbar bleibt, statt an einen fixen, ständig zu verteidigenden Status.</p>`},
    { icon:'shield', title:'Grenzen setzen — konsequent, aber ohne Beschämung', body:`
      <p>Kinder mit stark ausgeprägtem Anspruchsdenken oder wenig Frustrationstoleranz brauchen klare, verlässliche Grenzen — allerdings ohne bloßzustellen, zu beschämen oder öffentlich herabzusetzen, was Trotzverhalten oft eher verstärkt statt löst.</p>
      <ul>
        <li><strong>Konsequenz statt Bestrafung:</strong> Auswirkungen, die logisch mit dem Verhalten zusammenhängen (z. B. "Wenn das Spielzeug nicht geteilt wird, spielt heute niemand mehr gemeinsam damit") statt willkürlicher Strafen.</li>
        <li><strong>Unter vier Augen statt vor Publikum:</strong> Kritik und Konsequenzen wirken oft glaubwürdiger und werden besser angenommen, wenn sie nicht vor Geschwistern oder Freund*innen ausgesprochen werden.</li>
        <li><strong>Ruhig bleiben:</strong> Ein Wutausbruch auf Grenzen reagiert selten gut auf Gegenwut — ruhiges, konsequentes Dranbleiben wirkt langfristig stärker.</li>
      </ul>`},
    { icon:'heart', title:'Empathie im Alltag gezielt fördern', body:`
      <p>Empathie ist zu einem großen Teil erlernbar. Ansatzpunkte, die sich im Alltag gut einbauen lassen:</p>
      <ul>
        <li>Gefühle anderer benennen und einordnen helfen: "Siehst du, wie traurig dein Freund jetzt schaut? Woran könnte das liegen?"</li>
        <li>Eigenes Verhalten als Vorbild — Kinder übernehmen sehr stark, wie Eltern selbst mit den Gefühlen anderer umgehen, auch in scheinbar kleinen Alltagssituationen.</li>
        <li>Perspektivwechsel spielerisch üben: "Wie würdest du dich fühlen, wenn dir das passiert wäre?"</li>
        <li>Verantwortung für andere in kleinem Rahmen übertragen (ein Haustier, ein jüngeres Geschwisterkind, eine Pflanze) — das stärkt Fürsorgeerleben ohne Überforderung.</li>
      </ul>`},
    { icon:'life', title:'Wann professionelle Unterstützung sinnvoll ist', body:`
      <p>Es ist kein Zeichen von Versagen als Elternteil, sich Unterstützung zu holen — im Gegenteil, es ist oft der wirksamste Schritt. Sinnvoll ist das insbesondere, wenn:</p>
      <ul>
        <li>das Verhalten über mehrere Lebensbereiche (Familie, Schule, Freundeskreis) seit längerer Zeit auffällig ist,</li>
        <li>Erziehungsansätze im Alltag spürbar an ihre Grenzen stoßen,</li>
        <li>das Kind selbst unter der Situation leidet (z. B. sozialer Rückzug trotz Großspurigkeit nach außen),</li>
        <li>oder wenn es innerhalb der Familie zu starken Spannungen kommt, etwa durch Bevorzugung eines Geschwisterkindes.</li>
      </ul>
      <p>Erste Anlaufstellen sind Erziehungsberatungsstellen (oft kostenlos, auch ohne Diagnose), der schulpsychologische Dienst oder Kinder- und Jugendpsychotherapeut*innen — Kontakte im Bereich "Hilfe".</p>`},
  ],
  coparenting: [
    { icon:'scroll', title:'Parallel Parenting statt gemeinsamer Absprache', body:`
      <p>Bei hochstrittiger Trennung mit einem stark narzisstisch geprägten Elternteil empfehlen Fachleute oft ein Modell namens "Parallel Parenting": beide Elternteile erziehen weitgehend unabhängig voneinander in ihrer jeweiligen Zeit mit dem Kind, mit möglichst wenig direkter Abstimmung — Übergaben und Termine werden schriftlich und sehr konkret geregelt (z. B. über eine Familien-App oder E-Mail), statt spontan und mündlich.</p>`},
    { icon:'shield', title:'Das Kind nicht als Nachrichtenkanal benutzen (lassen)', body:`
      <p>Ein häufiges Muster: Nachrichten, Kritik oder Fragen werden über das Kind an den anderen Elternteil weitergegeben ("Sag deiner Mutter…"). Das überfordert Kinder und sollte — auch dem eigenen Verhalten gegenüber — konsequent vermieden werden. Direkte Kommunikation der Erwachsenen untereinander, auch wenn sie unangenehm ist, entlastet das Kind.</p>`},
    { icon:'bulb', title:'Sich selbst professionelle Unterstützung holen', body:`
      <p>Familienberatungsstellen, Verfahrensbeistände im Familienrecht oder spezialisierte Anwält*innen kennen hochstrittige Trennungssituationen gut und können sowohl rechtlich als auch praktisch unterstützen. Auch das eigene Durchhaltevermögen als Elternteil profitiert von Beratung oder Therapie — Kontakte im Bereich "Hilfe".</p>`},
  ],
};

/* ---------------------------------------------------------------------
   Lexikon — A-Z Glossar
   --------------------------------------------------------------------- */
const LEXIKON = [
  { t:'Codependency (Co-Abhängigkeit)', tag:'Beziehung', d:'Ein Muster, bei dem die eigenen Bedürfnisse dauerhaft hinter die einer anderen Person gestellt werden und das eigene Wohlbefinden stark vom Stimmungs- und Verhaltensbild dieser Person abhängt. Wer co-abhängig ist, übernimmt oft unbewusst Verantwortung für die Gefühle des Gegenübers und stellt eigene Wünsche zurück, um Konflikte zu vermeiden oder die Beziehung „zu retten". Das Muster wird häufig bei Partner*innen narzisstisch geprägter Menschen beschrieben, kann aber auch in Eltern-Kind- oder Freundschaftsbeziehungen entstehen. <br><br><em>Beispiel:</em> Eine Frau sagt regelmäßig eigene Verabredungen ab, „falls" ihr Partner schlechte Laune hat und sie ihn dann beruhigen muss — ihr Tagesablauf richtet sich unbewusst nach seiner Stimmung.' },
  { t:'DARVO', tag:'Konflikt', d:'Deny, Attack, Reverse Victim and Offender — Leugnen, Angreifen, Opfer- und Täterrolle vertauschen. Eine Reaktion auf berechtigte Kritik oder Konfrontation, bei der die kritisierende Person am Ende als „eigentliches Problem" dasteht und sich rechtfertigen muss, obwohl sie ursprünglich im Recht war. Der Begriff stammt aus der Forschung zu Reaktionen auf Vorwürfe und wird oft in Zusammenhang mit Machtmissbrauch beschrieben. <br><br><em>Beispiel:</em> Auf den Vorwurf „Du hast mein Vertrauen gebrochen" folgt: „Das stimmt gar nicht (Deny) — außerdem bist du viel zu misstrauisch (Attack), typisch, dass du mir jetzt schon wieder alles in die Schuhe schiebst (Reverse Victim and Offender)."' },
  { t:'Empathie-Defizit', tag:'Grundlagen', d:'Eine eingeschränkte Fähigkeit oder Bereitschaft, sich in die Gefühle anderer hineinzuversetzen und diese als bedeutsam zu behandeln. Kein Alles-oder-Nichts-Merkmal — die Ausprägung kann stark variieren, auch situativ, und ist von reiner Rücksichtslosigkeit oder Egoismus zu unterscheiden, die andere Ursachen haben können. <br><br><em>Beispiel:</em> Jemand bemerkt zwar, dass ein Freund traurig wirkt, wechselt das Thema aber schnell zurück zu den eigenen Anliegen, weil die Traurigkeit des anderen kaum als relevant empfunden wird.' },
  { t:'Entwertung / Abwertung', tag:'Beziehung', d:'Phase, in der eine zuvor idealisierte Person plötzlich stark kritisiert, kleingemacht oder abgewertet wird — typischer Teil des Idealisierungs-Abwertungs-Zyklus. Die Entwertung kann offen (Kritik, Spott) oder subtil (Ignorieren, Vergleiche mit anderen) erfolgen und wirkt für die betroffene Person oft wie ein unerklärlicher Stimmungsumschwung. <br><br><em>Beispiel:</em> Wer wenige Wochen zuvor noch als „die einzige Person, die mich wirklich versteht" bezeichnet wurde, hört plötzlich: „Ehrlich, du schaffst es einfach bei nichts, dich richtig anzustrengen."' },
  { t:'Fassade / False Self', tag:'Grundlagen', d:'Das nach außen gezeigte, oft makellos, erfolgreich oder charmant wirkende Selbstbild, das vom privaten Verhalten deutlich abweichen kann. In der Fachliteratur wird diese Diskrepanz zwischen öffentlichem Auftreten und privatem Verhalten manchmal als Kern des „falschen Selbst" beschrieben, das ein instabiles inneres Selbstwertgefühl nach außen kompensiert. <br><br><em>Beispiel:</em> Im Freundeskreis gilt jemand als „der Fels in der Brandung", zuhause kommt es aber regelmäßig zu Kontrolle und abwertenden Bemerkungen, von denen im Umfeld niemand etwas ahnt.' },
  { t:'Flying Monkeys', tag:'Beziehung', d:'Umgangssprachlicher, aus dem „Zauberer von Oz" entlehnter Begriff für Personen aus dem Umfeld, die — oft unwissentlich — eingesetzt werden, um Druck auszuüben, Botschaften zu überbringen, eine Sichtweise zu verbreiten oder Kontrolle über die betroffene Person auszuüben. Sie handeln meist in gutem Glauben, weil ihnen nur eine Version der Geschichte bekannt ist. <br><br><em>Beispiel:</em> Eine gemeinsame Bekannte meldet sich nach einer Trennung „nur, um zu vermitteln" und gibt dabei unbemerkt Nachrichten und Druck der Ex-Partnerin weiter.' },
  { t:'Gaslighting', tag:'Konflikt', d:'Systematisches Infragestellen der Wahrnehmung, Erinnerung oder des Urteilsvermögens einer anderen Person, mit dem Ziel (bewusst oder unbewusst), Verunsicherung zu erzeugen und die eigene Version der Ereignisse durchzusetzen. Der Begriff stammt aus dem Theaterstück „Gas Light" und wird heute breiter für Situationen verwendet, in denen wiederholt die Realität einer Person angezweifelt wird. <br><br><em>Beispiel:</em> Nach einem lautstarken Streit heißt es später: „Das habe ich nie gesagt, du bildest dir sowas immer ein" — obwohl mehrere Zeug*innen den Wortlaut bestätigen könnten.' },
  { t:'Goldkind (Golden Child)', tag:'Familie', d:'In der Familienrollen-Theorie das Kind, das idealisiert und bevorzugt behandelt wird — oft verbunden mit hohem Erwartungsdruck, an dessen Erfolgen sich ein Elternteil selbst aufwertet. Das Goldkind steht häufig im Gegensatz zum Sündenbock (Scapegoat) innerhalb derselben Familie, wobei sich diese Rollen im Lauf der Zeit auch verschieben können. <br><br><em>Beispiel:</em> Die schulischen Leistungen eines Kindes werden bei jeder Gelegenheit vor Verwandten hervorgehoben, während Fehler kaum benannt werden dürfen, weil sie das Familienbild nach außen stören würden.' },
  { t:'Grandiosität', tag:'Grundlagen', d:'Übersteigertes Gefühl der eigenen Wichtigkeit, Einzigartigkeit oder Überlegenheit gegenüber anderen, das sich in Erwartungen, Erzählweise oder Umgang mit Kritik zeigen kann. Grandiosität muss sich nicht immer laut oder angeberisch äußern — sie kann auch in der stillen Überzeugung liegen, „eigentlich" mehr verdient zu haben als andere. <br><br><em>Beispiel:</em> Eine Beförderung eines Kollegen wird kommentiert mit: „Na ja, bei meinen Fähigkeiten wäre das für mich sowieso nur eine Frage der Zeit gewesen."' },
  { t:'Grey Rock Methode', tag:'Umgang', d:'Bewusst neutrale, möglichst emotionslose und knappe Kommunikationsstrategie gegenüber manipulativen oder provozierenden Personen, um keine „Angriffsfläche" mehr zu bieten — wie ein grauer Stein, an dem nichts Interessantes zu finden ist. Ziel ist nicht Konfliktlösung, sondern Deeskalation und Selbstschutz, etwa wenn Kontakt (z. B. wegen gemeinsamer Kinder) nicht vollständig vermieden werden kann. <br><br><em>Beispiel:</em> Auf eine gezielt provozierende Bemerkung folgt nur ein knappes „Okay, danke für die Info" statt einer inhaltlichen Reaktion oder Rechtfertigung.' },
  { t:'Hoovering', tag:'Trennung', d:'Versuch, nach einer Trennung oder einem Kontaktabbruch wieder Kontakt und Kontrolle herzustellen — benannt nach der Staubsaugermarke Hoover, weil die betroffene Person quasi „zurückgesaugt" werden soll. Das kann über plötzliche Zuneigungsbekundungen, Geschenke, vorgetäuschte Krisen, gemeinsame Erinnerungen oder auch über Dritte (siehe Flying Monkeys) geschehen. <br><br><em>Beispiel:</em> Monate nach dem letzten Kontakt kommt plötzlich eine Nachricht: „Mir geht es gerade richtig schlecht, ich glaube nur du kannst mir helfen" — ganz ohne vorherige Anzeichen.' },
  { t:'Idealisierung', tag:'Beziehung', d:'Anfangsphase, in der eine Person als nahezu perfekt dargestellt und überschwänglich bewundert wird — Teil des typischen Beziehungszyklus aus Idealisierung, Entwertung und teils Trennung/Hoovering. In dieser Phase entsteht oft eine sehr schnelle, intensive Bindung, die die spätere Entwertung umso verwirrender macht. <br><br><em>Beispiel:</em> Bereits nach der zweiten Verabredung fällt der Satz: „Ich habe noch nie jemanden getroffen, der mich so gut versteht wie du — das ist Schicksal."' },
  { t:'JADE', tag:'Umgang', d:'Justify, Argue, Defend, Explain — eine Merkregel, die davon abrät, sich in Konflikten mit manipulativen Personen ständig zu rechtfertigen, zu argumentieren, zu verteidigen oder zu erklären. Der Gedanke dahinter: Wer sich immer wieder erklärt, liefert neue Ansatzpunkte für weitere Vorwürfe, statt den Konflikt zu beenden. Häufig wird JADE zusammen mit der Grey-Rock-Methode oder kurzen, klaren Aussagen genutzt. <br><br><em>Beispiel:</em> Statt eine 10-minütige Erklärung zu liefern, warum man zu spät war, reicht: „Ich war verspätet, das tut mir leid. Lass uns weitermachen."' },
  { t:'Kognitive Empathie vs. emotionale Empathie', tag:'Grundlagen', d:'Kognitive Empathie ist die Fähigkeit, zu verstehen, was jemand fühlt oder denkt (ohne es selbst mitzufühlen) — sie kann bei narzisstisch geprägten Menschen erhalten und sogar strategisch nutzbar sein, etwa um gezielt zu beeindrucken oder zu manipulieren. Emotionale Empathie (echtes Mitfühlen und Mitschwingen) ist dagegen häufig eingeschränkt. Diese Unterscheidung erklärt, warum jemand im ersten Moment sehr einfühlsam wirken kann und trotzdem wenig Rücksicht auf die tatsächlichen Gefühle anderer nimmt. <br><br><em>Beispiel:</em> Eine Person erkennt genau, was ihr Gegenüber verunsichert — und nutzt dieses Wissen gezielt in einem Streit, statt es rücksichtsvoll zu behandeln.' },
  { t:'Love Bombing', tag:'Beziehung', d:'Auffällig intensive, schnelle Zuwendung zu Beginn eines Kennenlernens — überschwängliche Komplimente, große Geschenke, ständige Erreichbarkeit, schnelle Zukunftspläne — die spätere Bindung erleichtern und Zweifel im Vorfeld ausräumen kann. Nicht jede intensive Verliebtheit ist Love Bombing; auffällig wird es vor allem, wenn die Intensität ungewöhnlich schnell kommt und mit Druck verbunden ist. <br><br><em>Beispiel:</em> Nach der ersten Woche werden bereits gemeinsame Urlaube geplant und tägliche „Guten-Morgen-Sträuße" verschickt, verbunden mit der Aussage: „So etwas wie uns gibt es nur einmal im Leben."' },
  { t:'Maligner Narzissmus', tag:'Grundlagen', d:'Ausprägung, die ein starkes Größengefühl mit ausgeprägter Kälte, Misstrauen, Aggression oder manipulativem, teils antisozialem Verhalten kombiniert. In der Fachliteratur gilt diese Form als besonders belastend für das Umfeld, weil Größenfantasien mit aktiver Kränkungsbereitschaft und Freude an Kontrolle zusammenkommen können. <br><br><em>Beispiel:</em> Ein Vorgesetzter genießt es sichtbar, Mitarbeitende vor anderen bloßzustellen, und rechtfertigt das mit: „Nur so lernen die etwas."' },
  { t:'Narzisstische Zufuhr (Supply)', tag:'Grundlagen', d:'Umgangssprachlicher Begriff für die Bewunderung, Aufmerksamkeit oder Bestätigung, die als „Nahrung" für ein instabiles Selbstwertgefühl gesucht wird — positiv (Lob, Anerkennung, Status) oder negativ (z. B. gezielte Provokation, um zumindest eine starke Reaktion zu erzeugen, wenn positive Aufmerksamkeit fehlt). <br><br><em>Beispiel:</em> Fehlt tagelang Zuspruch in sozialen Medien, wird eine bewusst kontroverse Aussage gepostet — Hauptsache, es kommen viele Reaktionen, ob zustimmend oder empört.' },
  { t:'No Contact', tag:'Trennung', d:'Konsequenter Abbruch jeglichen Kontakts (telefonisch, digital, persönlich, über Dritte) zu einer Person, meist nach einer belastenden Beziehung oder wiederholten Grenzverletzungen. No Contact gilt in vielen Ratgebern als wirksamste, wenn auch nicht immer vollständig umsetzbare Strategie — etwa wenn gemeinsame Kinder Kontakt erfordern (siehe Grey Rock, Parallel Parenting). <br><br><em>Beispiel:</em> Nummer blockieren, Profile in sozialen Netzwerken stummschalten oder entfernen, keine Antwort auf Nachrichten über gemeinsame Bekannte — auch nicht bei vermeintlichen „Notfällen".' },
  { t:'Objektbeziehung', tag:'Fachbegriff', d:'Fachbegriff aus der Psychoanalyse für das innere Bild, das ein Mensch von sich selbst und wichtigen Bezugspersonen entwickelt, besonders geprägt durch frühe Beziehungen. Diese inneren Bilder gelten in psychodynamischen Theorien als eine mögliche Grundlage für die Entstehung narzisstischer Muster im Erwachsenenalter. <br><br><em>Beispiel:</em> Ein Kind, das nur bei besonderen Leistungen Zuwendung erfährt, entwickelt möglicherweise ein inneres Bild, nach dem Liebe an Erfolg geknüpft ist — mit Folgen für spätere Beziehungen.' },
  { t:'Parallel Parenting', tag:'Familie', d:'Erziehungsmodell für hochstrittige Trennungen, bei dem beide Elternteile weitgehend unabhängig voneinander erziehen, mit minimaler, meist schriftlicher und sachlicher Abstimmung — im Unterschied zum klassischen „Co-Parenting" mit enger Abstimmung. Ziel ist, Konfliktkontakt zu reduzieren, ohne den Kontakt des Kindes zu beiden Elternteilen zu gefährden. <br><br><em>Beispiel:</em> Übergaben finden an einem neutralen Ort statt, Absprachen laufen ausschließlich über eine gemeinsame App oder E-Mail statt über persönliche Gespräche.' },
  { t:'Parentifizierung', tag:'Familie', d:'Rollenumkehr, bei der ein Kind emotionale oder praktische Aufgaben von Erwachsenen übernimmt — etwa das Trösten eines Elternteils, das Vermitteln in Elternkonflikten oder die Verantwortung für jüngere Geschwister weit über das altersübliche Maß hinaus. Das Kind lernt dabei oft früh, eigene Bedürfnisse zurückzustellen. <br><br><em>Beispiel:</em> Ein zehnjähriges Kind hört nach einem Streit der Eltern regelmäßig: „Du bist der/die Einzige, mit dem/der ich noch reden kann" — und übernimmt damit unbewusst eine Erwachsenenrolle.' },
  { t:'Passiv-aggressives Verhalten', tag:'Konflikt', d:'Indirekter Ausdruck von Ärger, Ablehnung oder Widerstand — etwa durch Schmollen, Sarkasmus, absichtliches Vergessen, Verzögern oder demonstratives Schweigen statt offener Ansprache des eigentlichen Problems. Für die betroffene Person ist oft schwer greifbar, worum es eigentlich geht, weil der Konflikt nie benannt wird. <br><br><em>Beispiel:</em> Auf die Bitte, den Müll rauszubringen, folgt tagelang eisiges Schweigen — verbunden mit einem beiläufigen „Ist schon okay" auf die Nachfrage, was los sei.' },
  { t:'Projektion', tag:'Fachbegriff', d:'Psychologischer Abwehrmechanismus, bei dem eigene unerwünschte Gefühle, Impulse oder Eigenschaften einer anderen Person zugeschrieben werden, um sie nicht bei sich selbst anerkennen zu müssen. Der Mechanismus ist unbewusst und daher für die projizierende Person selbst oft nicht erkennbar. <br><br><em>Beispiel:</em> Wer selbst mit dem Gedanken an Untreue spielt, wirft dem Partner wiederholt und ohne konkreten Anlass Untreue vor.' },
  { t:'Scapegoat (Sündenbock)', tag:'Familie', d:'In der Familienrollen-Theorie das Familienmitglied, dem wiederkehrend die Schuld für Konflikte, schlechte Stimmung oder Probleme in der Familie zugeschrieben wird — häufig im Gegensatz zum bevorzugten Goldkind. Diese Rolle kann über Jahre stabil bleiben und das Selbstbild der betroffenen Person nachhaltig prägen. <br><br><em>Beispiel:</em> Egal was in der Familie schiefläuft, die Erklärung lautet fast immer: „Seit du das gesagt hast, ist bei uns nichts mehr wie vorher" — auch wenn der Zusammenhang objektiv fraglich ist.' },
  { t:'Silent Treatment', tag:'Konflikt', d:'Bewusste, anhaltende Kommunikationsverweigerung als Reaktion auf einen Konflikt oder eine als kränkend empfundene Situation — wirkt oft gezielt bestrafend und soll die andere Person zum Nachgeben bringen. Anders als eine kurze Auszeit zur Beruhigung ist Silent Treatment meist unangekündigt, unbegrenzt und mit dem Ziel verbunden, Macht über die Situation zu behalten. <br><br><em>Beispiel:</em> Nach einer Meinungsverschiedenheit wird tagelang nicht geantwortet — auf die Frage „Können wir reden?" kommt nur weiteres Schweigen.' },
  { t:'Spaltung (Splitting)', tag:'Fachbegriff', d:'Ein Denkmuster, bei dem Menschen oder Situationen nur als „ganz gut" oder „ganz schlecht" wahrgenommen werden, ohne Zwischentöne — kann erklären, warum eine Person abrupt von Idealisierung zu Abwertung wechselt, sobald ein Fehler oder eine Enttäuschung auftritt. Der Begriff stammt ursprünglich aus der psychoanalytischen Theorie zur frühkindlichen Entwicklung. <br><br><em>Beispiel:</em> Ein einziger Fehler eines sonst geschätzten Kollegen führt dazu, dass er fortan pauschal als „unfähig" bezeichnet wird — frühere gute Leistungen scheinen plötzlich vergessen.' },
  { t:'Trauma Bonding', tag:'Beziehung', d:'Eine starke emotionale Bindung, die durch wiederkehrende Zyklen aus Zuneigung und Verletzung entsteht — die Wechsel zwischen liebevollen und verletzenden Phasen können die Bindung paradoxerweise verstärken statt schwächen. Der Begriff wird auch außerhalb romantischer Beziehungen verwendet, etwa bei anderen belastenden Abhängigkeitsdynamiken. <br><br><em>Beispiel:</em> Nach einer besonders verletzenden Auseinandersetzung folgt eine ungewöhnlich liebevolle Versöhnungsphase — und genau dieser Wechsel macht es schwerer, sich zu trennen, als dauerhaftes Leid es täte.' },
  { t:'Triangulation', tag:'Konflikt', d:'Einbeziehen einer dritten Person, Meinung oder eines Vergleichs in einen Konflikt oder eine Beziehung, um die eigene Position zu stärken, Eifersucht oder Unsicherheit zu erzeugen oder Kontrolle auszuüben. Die dritte Person kann real oder auch nur rhetorisch angeführt werden. <br><br><em>Beispiel:</em> „Meine Ex hat das nie so eng gesehen wie du" wird gezielt in Streitgesprächen eingebracht, um Zweifel und Konkurrenzdenken zu erzeugen.' },
  { t:'Verdeckter (vulnerabler) Narzissmus', tag:'Grundlagen', d:'Ausprägung, bei der Größengefühl und Kränkbarkeit eher durch Rückzug, Opferhaltung, still empfundene Überlegenheit oder beleidigtes Schweigen ausgedrückt werden statt durch offene Dominanz oder Prahlerei. Diese Form ist von außen oft schwerer zu erkennen als die klassische, extravertierte Variante. <br><br><em>Beispiel:</em> Auf konstruktive Kritik folgt kein lauter Widerspruch, sondern tagelanger Rückzug verbunden mit dem Gefühl, „mal wieder" zu Unrecht kritisiert worden zu sein.' },
  { t:'Vulnerabler Selbstwert', tag:'Grundlagen', d:'Ein im Kern instabiles, leicht verletzbares Selbstwertgefühl, das viele Fachleute als möglichen Kern narzisstischer Muster beschreiben — trotz der nach außen gezeigten Großartigkeit oder Selbstsicherheit. Kleine Kritik kann dadurch überproportional stark als Bedrohung erlebt werden. <br><br><em>Beispiel:</em> Eine sachliche Rückmeldung im Job („Diese Stelle im Bericht könnte klarer sein") löst eine unverhältnismäßig heftige, gekränkte Reaktion aus, obwohl die Kritik moderat formuliert war.' },
  { t:'Anspruchsdenken (Entitlement)', tag:'Grundlagen', d:'Die feste, oft unhinterfragte Überzeugung, ein Recht auf Sonderbehandlung, Vorrang oder Ausnahmen zu haben — unabhängig von eigener Leistung oder den Bedürfnissen anderer. Gilt in der Fachliteratur als eines der Kernmerkmale narzisstischer Muster, sowohl bei Erwachsenen als auch als Warnsignal bei Kindern und Jugendlichen. <br><br><em>Beispiel:</em> Eine Warteschlange wird selbstverständlich übersprungen, verbunden mit der Haltung: „Meine Zeit ist wichtiger als die von den anderen hier."' },
  { t:'Echoismus', tag:'Beziehung', d:'Ein Gegenpol zu narzisstischem Verhalten: die ausgeprägte Tendenz, eigene Bedürfnisse, Erfolge oder Wünsche kleinzuhalten oder gar nicht erst zu äußern, oft aus Angst, als selbstbezogen zu gelten. Der Begriff spielt auf die Nymphe Echo im Narziss-Mythos an, die nur noch die Worte anderer wiederholen konnte. In Beziehungen mit stark narzisstisch geprägten Partner*innen entwickelt sich dieses Muster manchmal als (unbewusste) Anpassungsstrategie. <br><br><em>Beispiel:</em> Auf die Frage „Was möchtest du heute Abend essen?" folgt reflexhaft „Ist mir egal, was du willst" — auch wenn eine klare eigene Präferenz besteht.' },
  { t:'Entwicklungsnarzissmus (kindlicher Narzissmus)', tag:'Familie', d:'Die normale, alterstypische Ich-Bezogenheit im Kleinkind- und frühen Kindesalter, die zur gesunden Entwicklung von Selbstwertgefühl und Identität dazugehört und sich mit zunehmendem Alter und wachsender Perspektivübernahme von selbst zurückbildet. Nicht zu verwechseln mit einem überdauernden, situationsübergreifenden Muster im späteren Kindes- oder Jugendalter. <br><br><em>Beispiel:</em> Ein dreijähriges Kind besteht darauf, dass ausschließlich seine Wünsche beim Spielen zählen — mit sechs oder sieben Jahren gelingt Teilen und Nachgeben in der Regel bereits deutlich besser.' },
  { t:'Overpraising (Überhöhtes Lob)', tag:'Familie', d:'Lob, das sich nicht auf konkretes Verhalten oder Anstrengung bezieht, sondern ein Kind pauschal als besonders, überlegen oder über Regeln erhaben darstellt. Wird in der Entwicklungspsychologie als möglicher Risikofaktor für ein instabiles, von äußerer Bestätigung abhängiges Selbstwertgefühl diskutiert — im Unterschied zu Lob, das konkrete Leistung oder Verhalten würdigt. <br><br><em>Beispiel:</em> „Du bist einfach das begabteste Kind, das ich kenne" statt „Du hast heute richtig gut an deiner Aufgabe drangeblieben."' },
  { t:'Bedingte vs. bedingungslose Zuwendung', tag:'Familie', d:'Bedingte Zuwendung wird nur bei bestimmten Leistungen, Erfolgen oder gewünschtem Verhalten gezeigt; bedingungslose Zuwendung gilt dem Kind unabhängig davon, wie es sich gerade verhält oder was es leistet. Ein dauerhaftes Übergewicht bedingter Zuwendung wird in der Bindungsforschung als möglicher Risikofaktor für instabile Selbstwertentwicklung diskutiert. <br><br><em>Beispiel:</em> Herzliche Zuwendung und Lob gibt es fast ausschließlich nach guten Noten — bei mittelmäßigen Ergebnissen wirkt der Kontakt merklich kühler.' },
  { t:'Ferndiagnose', tag:'Fachbegriff', d:'Der (fachlich unzulässige) Versuch, einer Person anhand von Berichten Dritter, Beobachtungen aus der Distanz oder Online-Checklisten eine psychische Störung zuzuschreiben, ohne persönliche fachliche Untersuchung. Eine echte Diagnose erfordert eine ausführliche Untersuchung durch Ärzt*innen oder Psychotherapeut*innen. Diese App liefert bewusst Orientierung statt Ferndiagnosen — auch nicht für Kinder. <br><br><em>Beispiel:</em> „Nach allem, was du erzählst, ist dein Ex ganz klar ein Narzisst" — eine Einschätzung, die trotz guter Absicht keine fachliche Grundlage hat.' },
  { t:'Helikopter-Eltern', tag:'Familie', d:'Umgangssprachlicher Begriff für einen übermäßig behütenden, kontrollierenden Erziehungsstil, bei dem Eltern ständig eingreifen, um dem Kind jede Schwierigkeit, Enttäuschung oder Konsequenz abzunehmen. Wird in der Fachdiskussion — neben Overpraising — als weiterer möglicher Risikofaktor für ein überzogenes Anspruchsdenken und geringe Frustrationstoleranz genannt, weil das Kind kaum Gelegenheit bekommt, mit eigenen Grenzen und Misserfolgen umzugehen. <br><br><em>Beispiel:</em> Eine schlechte Note wird nicht besprochen, sondern die Lehrkraft wird umgehend von den Eltern zur Rede gestellt, ohne dem Kind Raum zu geben, selbst damit umzugehen.' },
  { t:'Perspektivübernahme', tag:'Fachbegriff', d:'Die entwicklungspsychologische Fähigkeit, Gedanken, Gefühle und Sichtweisen einer anderen Person zu verstehen und von der eigenen Sicht zu unterscheiden — eine wesentliche Grundlage für Empathie. Diese Fähigkeit entwickelt sich bei Kindern schrittweise und lässt sich durch Vorbild und gezielte Gespräche im Alltag fördern. <br><br><em>Beispiel:</em> Ein Kind erkennt erst mit einigen Jahren, dass ein Geschwisterkind traurig sein kann über etwas, das das eigene Kind selbst überhaupt nicht traurig gemacht hätte.' },
];

/* ---------------------------------------------------------------------
   Tipps — Kommunikation, Grenzen, Checkliste, Journaling
   --------------------------------------------------------------------- */
const TIPPS = {
  order: ['kommunikation','grenzen','selbstschutz','erziehung','journal'],
  labels: { kommunikation: 'Kommunikation', grenzen: 'Grenzen setzen', selbstschutz: 'Selbstschutz-Check', erziehung: 'Erziehung & Empathie', journal: 'Dokumentieren' },
  kommunikation: {
    intro: 'Konkrete, kurze Formulierungen helfen mehr als lange Erklärungen. Ein paar Beispiel-Sätze zum Anpassen an die eigene Situation:',
    scripts: [
      { label:'Bei Vorwürfen ohne Grundlage', text:'„Ich sehe das anders. Ich möchte darüber jetzt nicht weiter diskutieren."' },
      { label:'Bei Druck, sich sofort zu entscheiden', text:'„Ich brauche etwas Bedenkzeit und melde mich morgen dazu."' },
      { label:'Bei Schuldzuweisungen (DARVO)', text:'„Es ging gerade um dein Verhalten — dabei bleibe ich."' },
      { label:'Bei Silent Treatment', text:'„Ich bin gesprächsbereit, wenn du es auch bist. Bis dahin gehe ich meinem Tag nach."' },
      { label:'Grey-Rock-Antwort auf Provokation', text:'„Okay." / „Verstanden." / „Das ist deine Sicht."' },
    ]
  },
  grenzen: {
    intro: 'Wirksame Grenzen sind konkret, durchsetzbar und werden konsequent gehalten:',
    items: [
      { t:'Konkret statt vage', d:'„Ich verlasse den Raum, wenn geschrien wird" statt „Sei bitte netter".' },
      { t:'Vorher entscheiden, nicht im Streit', d:'Grenzen in einem ruhigen Moment festlegen, nicht mitten im Konflikt improvisieren.' },
      { t:'Ankündigen, dann handeln', d:'Eine Konsequenz einmal klar benennen — und beim nächsten Mal auch wirklich umsetzen, ohne erneute Diskussion.' },
      { t:'Nicht rechtfertigen', d:'Eine Grenze braucht keine ellenlange Begründung, um gültig zu sein.' },
      { t:'Kleine Grenzen zählen auch', d:'Nicht jede Grenze muss die Beziehung beenden — auch „Ich beantworte Nachrichten erst am nächsten Tag" ist eine gültige Grenze.' },
    ]
  },
  selbstschutz: {
    intro: 'Eine Orientierungshilfe für den Alltag — kein Diagnose-Tool:',
    items: [
      { t:'Wichtiges schriftlich festhalten', d:'Absprachen, Zusagen und belastende Vorfälle kurz notieren (Datum, Kernaussage).' },
      { t:'Zweite Meinung einholen', d:'Bei Verunsicherung über die eigene Erinnerung eine vertraute Person fragen, wie sie die Situation erlebt hat.' },
      { t:'Eigene Bedürfnisse nicht dauerhaft zurückstellen', d:'Regelmäßig prüfen: Komme ich in dieser Beziehung/Situation noch vor?' },
      { t:'Kontakt zu anderen pflegen', d:'Isolation aktiv entgegenwirken — Freundschaften und Familie nicht schleichend aufgeben.' },
      { t:'Bei Sicherheitsbedenken: professionelle Hilfe', d:'Bei Kontrolle, Drohungen oder Gewalt Beratungsstellen oder die Polizei einbeziehen (siehe „Hilfe").' },
    ]
  },
  erziehung: {
    intro: 'Konkrete Formulierungen, um Empathie zu fördern und Grenzen zu setzen, ohne zu beschämen — für Eltern, deren Kind (starke) narzisstische Züge zeigt:',
    scripts: [
      { label:'Gefühle anderer benennen helfen', text:'„Schau mal, wie enttäuscht dein Freund gerade schaut — was, glaubst du, ist passiert?"' },
      { label:'Loben ohne Überhöhung', text:'„Du bist heute wirklich drangeblieben, obwohl es schwer war — das war eine tolle Leistung von dir."' },
      { label:'Grenze ohne Beschämung', text:'„Das Verhalten geht gerade nicht in Ordnung. Wir reden gleich in Ruhe darüber, wenn alle sich beruhigt haben."' },
      { label:'Konsequenz statt Bestrafung', text:'„Wenn das Spielzeug nicht geteilt wird, spielen wir heute stattdessen etwas anderes zusammen."' },
      { label:'Bei Anspruchsdenken', text:'„Ich verstehe, dass du das gerne sofort hättest. Trotzdem gilt hier: alle warten der Reihe nach."' },
    ]
  },
  journal: {
    intro: 'Eine einfache Dokumentation kann später helfen, Muster zu erkennen — für sich selbst, in einer Therapie oder in einem rechtlichen Kontext:',
    items: [
      { t:'Datum & Ort', d:'Wann und wo ist etwas vorgefallen?' },
      { t:'Was wurde gesagt/getan', d:'Möglichst wortgetreu, ohne eigene Interpretation dazuzuschreiben.' },
      { t:'Wer war anwesend', d:'Zeug*innen können später wichtig sein.' },
      { t:'Eigene Reaktion', d:'Wie habe ich reagiert — und wie ging es mir danach?' },
    ]
  },
};

/* ---------------------------------------------------------------------
   Hilfe — Anlaufstellen & Quellen
   --------------------------------------------------------------------- */
const HILFE_KONTAKTE = [
  { name:'Telefonseelsorge', detail:'Kostenlos, anonym, rund um die Uhr — für jede Art von Krise oder Gesprächsbedarf.', phone:'0800 111 0 111', phone2:'0800 111 0 222', icon:'phone' },
  { name:'Nummer gegen Kummer (Kinder- und Jugendtelefon)', detail:'Kostenlose, anonyme Beratung für Kinder und Jugendliche, Mo–Sa 14–20 Uhr.', phone:'116 111', icon:'child' },
  { name:'Elterntelefon (Nummer gegen Kummer)', detail:'Kostenlose Beratung für Eltern und Bezugspersonen.', phone:'0800 111 0 550', icon:'users' },
  { name:'Hilfetelefon „Gewalt gegen Frauen"', detail:'Kostenlos, anonym, rund um die Uhr, mehrsprachig.', phone:'08000 116 016', icon:'shield' },
  { name:'Männerhilfetelefon', detail:'Kostenlose, anonyme Beratung für Männer in Gewalt- und Krisensituationen.', phone:'0800 123 9900', icon:'shield' },
  { name:'Bundesweite Rufnummer gegen Gewalt an Kindern', detail:'Fachberatung, auch für Angehörige und Fachkräfte — Kontaktdaten über die Nummer gegen Kummer / Jugendamt vor Ort.', phone:'', icon:'child' },
  { name:'Erziehungsberatungsstelle vor Ort', detail:'Kostenlose Beratung für Eltern rund um Erziehungsfragen, oft ohne Diagnose oder Wartezeit — Adresse über Jugendamt oder Gemeinde/Stadt erfragen.', phone:'', icon:'users' },
];
const HILFE_QUELLEN = [
  'Anerkannte diagnostische Klassifikationssysteme: ICD-11 (WHO) und DSM-5 (American Psychiatric Association) — Standardwerke für die klinische Diagnose von Persönlichkeitsstörungen.',
  'Fachliteratur zu Bindungstheorie und Persönlichkeitsentwicklung, u. a. aus der Selbstpsychologie und der Objektbeziehungstheorie.',
  'Entwicklungspsychologische Forschung zu Selbstwert, Lob und Erziehungsstil bei Kindern (u. a. Studien zu „Overpraising" und elterlicher Wärme).',
  'Allgemein zugängliche deutschsprachige Ratgeberliteratur zum Umgang mit narzisstischen Persönlichkeiten.',
  'Fachverbände und Beratungsstellen für Familien-, Paar- und Erziehungsberatung sowie Opferschutz.',
];

/* ---------------------------------------------------------------------
   Render-Engine
   --------------------------------------------------------------------- */
function setScreen(id, sub){
  STATE.screen = id;
  if (sub) STATE.subtab[id] = sub;
  STATE.openAcc = new Set();
  render();
  const c = document.querySelector('.content');
  if (c) c.scrollTop = 0;
}
function toggleAcc(key){
  if (STATE.openAcc.has(key)) STATE.openAcc.delete(key); else STATE.openAcc.add(key);
  render();
}
function setSubtab(screen, id){
  STATE.subtab[screen] = id;
  STATE.openAcc = new Set();
  render();
}
function toggleDark(){
  document.body.classList.toggle('dark');
  try { localStorage.setItem('nw_theme', document.body.classList.contains('dark') ? 'dark' : 'light'); } catch(e){}
  render();
}

function header(title, sub, opts={}){
  const isStart = STATE.screen === 'start';
  return `
    <div class="header ${isStart?'':''}">
      <div class="blob1"></div><div class="blob2"></div>
      <button class="home-btn" onclick="${isStart ? "location.href='nz-index.html'" : "setScreen('start')"}" aria-label="Startseite">${svg('home',22)}</button>
      <button class="header-btn dark-toggle" onclick="toggleDark()" aria-label="Dunkelmodus umschalten">${svg(document.body.classList.contains('dark')?'sun':'moon',16)}</button>
      <div class="header-row ${!isStart?'has-home':''}" style="${isStart?'flex-direction:column;align-items:center;text-align:center;padding-top:6px':''}">
        <div>
          <div class="header-sub">${sub||'NarzissmusWahr'}</div>
          <div class="header-title">${title}</div>
        </div>
      </div>
      ${opts.desc ? `<div class="header-desc">${opts.desc}</div>` : ''}
    </div>`;
}

function accordion(items, prefix){
  return items.map((it,i)=>{
    const key = prefix+'-'+i;
    const open = STATE.openAcc.has(key);
    return `
    <div class="acc-item ${open?'open':''}">
      <button class="acc-head" onclick="toggleAcc('${key}')">
        <div class="acc-icon">${svg(it.icon,21)}</div>
        <div class="acc-title">${it.title}</div>
        <div class="acc-chevron">${svg('arrow',16)}</div>
      </button>
      <div class="acc-body"><div class="acc-body-inner">${it.body}</div></div>
    </div>`;
  }).join('');
}

function subtabsBar(group, screen){
  return `<div class="subtabs">${group.order.map(id=>`
    <button class="subtab-btn ${STATE.subtab[screen]===id?'active':''}" onclick="setSubtab('${screen}','${id}')">${group.labels[id]}</button>`).join('')}</div>`;
}

function renderStart(){
  return `
    ${header('NarzissmusWahr','AUFKLÄRUNG & ORIENTIERUNG')}
    <div class="content">
      <div class="hero-card">
        <div class="hero-title">Verstehen. Einordnen. Besser umgehen.</div>
        <p>NarzissmusWahr erklärt Hintergründe, typische Muster und den Umgang mit Narzissmus im Alltag — für Erwachsene und für Kinder. Verständlich, fachlich fundiert, ohne Fachchinesisch.</p>
      </div>
      <div class="notice">
        ${svg('warn',16)}
        <div><strong>Wichtig:</strong> Diese App ist eine reine Informations- und Aufklärungs-App. Sie stellt keine medizinische Diagnose, ersetzt keine Therapie oder Beratung und sollte nicht zur „Ferndiagnose" von Angehörigen genutzt werden.</div>
      </div>

      <div class="section-label">Bereiche</div>
      <div class="tile-grid">
        <button class="tile" onclick="setScreen('grundlagen')"><div class="tile-icon-wrap">${svg('compass',22)}</div><div><div class="tile-label">Grundlagen</div><div class="tile-sub">Was ist Narzissmus?</div></div></button>
        <button class="tile" onclick="setScreen('erwachsene')"><div class="tile-icon-wrap">${svg('users',22)}</div><div><div class="tile-label">Erwachsene</div><div class="tile-sub">Erkennen & Umgang</div></div></button>
        <button class="tile" onclick="setScreen('kinder')"><div class="tile-icon-wrap">${svg('child',22)}</div><div><div class="tile-label">Kinder</div><div class="tile-sub">Für Kids & Eltern</div></div></button>
        <button class="tile" onclick="setScreen('lexikon')"><div class="tile-icon-wrap">${svg('glossary',22)}</div><div><div class="tile-label">Lexikon</div><div class="tile-sub">Begriffe A–Z</div></div></button>
        <button class="tile" onclick="setScreen('tipps')"><div class="tile-icon-wrap">${svg('bulb',22)}</div><div><div class="tile-label">Tipps</div><div class="tile-sub">Konkrete Strategien</div></div></button>
        <button class="tile accent" onclick="setScreen('hilfe')"><div class="tile-icon-wrap">${svg('life',22)}</div><div><div class="tile-label">Hilfe</div><div class="tile-sub">Anlaufstellen</div></div></button>
      </div>

      <div class="section-label">Info</div>
      <div class="tile-grid">
        <a class="tile wide" href="nz-impressum.html" style="text-decoration:none"><div class="tile-icon-wrap">${svg('scroll',20)}</div><div><div class="tile-label">Impressum</div></div></a>
        <a class="tile wide" href="nz-datenschutz.html" style="text-decoration:none"><div class="tile-icon-wrap">${svg('shield',20)}</div><div><div class="tile-label">Datenschutz</div></div></a>
      </div>
    </div>
    `;
}

function renderGrundlagen(){
  return `
    ${header('Grundlagen','VERSTEHEN')}
    <div class="content">
      <div class="notice info">${svg('info',16)}<div>Ein Überblick über Begriff, Ursachen und Erscheinungsformen von Narzissmus — als Einstieg in alle anderen Bereiche.</div></div>
      ${accordion(GRUNDLAGEN,'g')}
    </div>
    `;
}

function renderErwachsene(){
  const sub = STATE.subtab.erwachsene || 'erkennen';
  return `
    ${header('Erwachsene','MUSTER & UMGANG')}
    <div class="content">
      ${subtabsBar(ERWACHSENE,'erwachsene')}
      ${accordion(ERWACHSENE[sub],'e-'+sub)}
    </div>
    `;
}

function renderKinder(){
  const sub = STATE.subtab.kinder || 'fuerkinder';
  return `
    ${header('Kinder','KINDGERECHT & FÜR ELTERN')}
    <div class="content">
      ${subtabsBar(KINDER,'kinder')}
      ${accordion(KINDER[sub],'k-'+sub)}
    </div>
    `;
}

function renderLexikon(){
  const q = STATE.search.trim().toLowerCase();
  let list = LEXIKON.slice().sort((a,b)=>a.t.localeCompare(b.t,'de'));
  if (q) list = list.filter(e => e.t.toLowerCase().includes(q) || e.d.toLowerCase().includes(q));
  const letters = [...new Set(list.map(e=>e.t[0].toUpperCase()))];
  let html = '';
  let lastLetter = '';
  list.forEach(e=>{
    const l = e.t[0].toUpperCase();
    if (l !== lastLetter){ html += `<div class="lex-letter" id="lex-${l}">${l}</div>`; lastLetter = l; }
    html += `<div class="lex-term"><div class="lex-term-head">${e.t} <span class="lex-tag">${e.tag}</span></div><div class="lex-term-body">${e.d}</div></div>`;
  });
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  return `
    ${header('Lexikon','BEGRIFFE A–Z')}
    <div class="content">
      <div class="search-wrap">
        ${svg('search',16)}
        <input class="search-input" placeholder="Begriff suchen…" value="${STATE.search.replace(/"/g,'&quot;')}" oninput="STATE.search=this.value; render(); "/>
      </div>
      ${!q ? `<div class="lex-jump">${alphabet.map(l=>`<button class="lex-jump-btn ${letters.includes(l)?'has':''}" ${letters.includes(l)?`onclick="document.getElementById('lex-${l}').scrollIntoView({block:'start'})"`:'disabled'}>${l}</button>`).join('')}</div>` : ''}
      ${list.length ? html : `<div class="search-empty">Kein Begriff gefunden.</div>`}
    </div>
    `;
}

function renderTipps(){
  const sub = STATE.subtab.tipps || 'kommunikation';
  const g = TIPPS[sub];
  let body = `<p style="font-size:13px;line-height:1.6;color:var(--sub);margin:0 0 14px">${g.intro}</p>`;
  if (g.scripts){
    body += g.scripts.map(s=>`<div class="script-box"><div class="script-label">${s.label}</div><div class="script-text">${s.text}</div></div>`).join('');
  } else {
    body += `<ul class="tip-list">${g.items.map(it=>`
      <li class="tip-item"><div class="tip-check">${svg('check',13)}</div><div class="tip-text"><strong>${it.t}</strong>${it.d}</div></li>`).join('')}</ul>`;
  }
  return `
    ${header('Tipps','KONKRETE STRATEGIEN')}
    <div class="content">
      ${subtabsBar(TIPPS,'tipps')}
      <div class="card">${body}</div>
    </div>
    `;
}

function renderHilfe(){
  return `
    ${header('Hilfe','ANLAUFSTELLEN & QUELLEN')}
    <div class="content">
      <div class="notice">${svg('warn',16)}<div>Bei akuter Gefahr, Gewalt oder einer Krise wende dich sofort an die <strong>112</strong> (Notruf) oder <strong>110</strong> (Polizei). Die folgenden Nummern sind kostenlos und meist anonym.</div></div>
      <div class="section-label">Anlaufstellen</div>
      ${HILFE_KONTAKTE.map(k=>`
        <div class="card contact-card">
          <div class="contact-icon">${svg(k.icon,18)}</div>
          <div>
            <div class="contact-name">${k.name}</div>
            <div class="contact-detail">${k.detail}${k.phone?`<br><a href="tel:${k.phone.replace(/\s/g,'')}">${svg('phone',11)} ${k.phone}</a>${k.phone2?` &nbsp;·&nbsp; <a href="tel:${k.phone2.replace(/\s/g,'')}">${k.phone2}</a>`:''}`:''}</div>
          </div>
        </div>`).join('')}
      <div class="section-label">Weiterführende Quellen</div>
      <div class="card"><ul style="margin:0;padding-left:18px;font-size:12.5px;line-height:1.65;color:var(--sub)">${HILFE_QUELLEN.map(q=>`<li>${q}</li>`).join('')}</ul></div>
      <div class="notice info">${svg('info',16)}<div>Diese App wurde sorgfältig nach allgemein zugänglicher Fachliteratur erstellt, ist aber keine wissenschaftliche Publikation und ersetzt keine individuelle fachliche Beratung.</div></div>
    </div>
    `;
}

function renderGuide(){
  return `
    ${header('Anleitung','WEGWEISER')}
    <div class="content">
      <div class="text-page">
        <h2>So findest du dich zurecht</h2>
        <p>Über die Leiste unten erreichst du die sechs Hauptbereiche: <strong>Grundlagen</strong> (Basiswissen), <strong>Erwachsene</strong> (Muster & Umgang in Beziehung, Job, Familie), <strong>Kinder</strong> (für Kinder selbst und für Eltern), <strong>Lexikon</strong> (Begriffe A–Z mit Suche), <strong>Tipps</strong> (konkrete Formulierungen und Checklisten) und <strong>Hilfe</strong> (Anlaufstellen).</p>
        <h2>Tippe auf eine Karte</h2>
        <p>In den meisten Bereichen öffnest du durch Antippen eines Themas ein Akkordeon mit dem vollständigen Text — erneutes Antippen schließt es wieder.</p>
        <h2>Offline nutzbar</h2>
        <p>Nach dem ersten Öffnen funktioniert die App auch ohne Internetverbindung, da alle Inhalte lokal gespeichert werden.</p>
      </div>
    </div>
    <div style="padding:0 18px 18px"><button class="btn-primary" onclick="setScreen('start')">${svg('home',16)} Zur Startseite</button></div>`;
}

function renderAbout(){
  return `
    ${header('Über die App','NARZISSMUSWAHR')}
    <div class="content">
      <div class="text-page">
        <h2>Worum geht es?</h2>
        <p>NarzissmusWahr klärt fachlich fundiert über das Thema Narzissmus auf — Hintergründe, typische Verhaltensmuster, Umgang im Alltag, kindgerechte Erklärungen und ein Nachschlage-Lexikon.</p>
        <h2>Was diese App nicht ist</h2>
        <p>Keine medizinische Anwendung, kein Diagnose-Tool, kein Ersatz für Therapie, Beratung oder ärztliche Einschätzung. Eine tatsächliche Diagnose kann ausschließlich qualifiziertes Fachpersonal stellen.</p>
        <h2>Technik & Datenschutz</h2>
        <p>Die App läuft vollständig im Browser, speichert lediglich die Anzeigeeinstellung (hell/dunkel) lokal auf dem Gerät und lädt keine externen Schriftarten oder Tracking-Dienste.</p>
      </div>
    </div>
    <div style="padding:0 18px 18px"><button class="btn-primary" onclick="setScreen('start')">${svg('home',16)} Zur Startseite</button></div>`;
}

function render(){
  const app = document.getElementById('app');
  let html;
  switch(STATE.screen){
    case 'grundlagen': html = renderGrundlagen(); break;
    case 'erwachsene': html = renderErwachsene(); break;
    case 'kinder': html = renderKinder(); break;
    case 'lexikon': html = renderLexikon(); break;
    case 'tipps': html = renderTipps(); break;
    case 'hilfe': html = renderHilfe(); break;
    case 'guide': html = renderGuide(); break;
    case 'about': html = renderAbout(); break;
    default: html = renderStart();
  }
  app.innerHTML = html;
  const input = app.querySelector('.search-input');
  if (input){ input.focus({preventScroll:true}); const v=input.value; input.value=''; input.value=v; }
}

/* ---------------------------------------------------------------------
   Init
   --------------------------------------------------------------------- */
(function init(){
  try {
    if (localStorage.getItem('nw_theme') === 'dark') document.body.classList.add('dark');
  } catch(e){}
  render();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('nz-sw.js').catch(()=>{});
  }
})();
